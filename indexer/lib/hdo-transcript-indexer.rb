# -*- coding: utf-8 -*-
require 'nokogiri'
require 'pathname'
require 'uri'
require 'logger'
require 'json'
require 'time'
require 'set'
require 'pry'
require 'forwardable'
require 'mail'

require 'hdo-transcript-indexer/text_utils'
require 'hdo-transcript-indexer/converter'
require 'hdo-transcript-indexer/cache'
require 'hdo-transcript-indexer/index'

Faraday.default_adapter = :patron
Faraday.default_connection_options.request.timeout = 30 # we sometimes see hangs in the API
Faraday.default_connection_options.headers = {
  'User-Agent' => 'hdo-transcript-downloader | https://www.holderdeord.no/'
}

module Hdo
  module Transcript
    class Indexer
      def initialize(options)
        @data_dir     = data_dir_from(options)
        @sessions     = options.fetch(:sessions)
        @faraday      = Faraday.new('http://data.stortinget.no')
        @logger       = Logger.new(STDOUT)
        @create_index = options.fetch(:create_index)
        @force        = options.fetch(:force)
        @extras       = JSON.parse(File.read(File.expand_path("../hdo-transcript-indexer/extras.json", __FILE__)))
        @ner          = options.fetch(:ner)
        @mail         = options.fetch(:mail)
        @lix          = options.fetch(:lix)

        @finished_cache = {}
        @errors       = []
        @new_transcripts = []

        if @sessions == ['all']
          @sessions = Hdo::StortingImporter::ParsingDataSource.default.
            parliament_sessions.
            select { |e| e.start_date.year >= 1998 }.
            map { |e| [e.start_date.year, e.end_date.year].join('-') }
        end

        if @ner && !system("which polyglot 2>&1 >/dev/null")
          raise "polyglot not installed, please run `pip install polyglot && polyglot download embeddings2.no ner2.no`"
        end

        @index = Index.new(
          options.fetch(:elasticsearch_url),
          options.fetch(:index_name),
          @logger
        )

        @party_cache = Cache.new(cache_path('name-to-party'))
        @party_cache.load_if_exists

        @slug_cache = Cache.new(cache_path('name-to-slug'))
        @slug_cache.load_if_exists

        @id_to_person = Cache.new(cache_path('id-to-person'))
        @id_to_person.load_if_exists

        @stats = Hash.new { |hash, session| hash[session] = Hash.new(0) }
      end

      def execute
        download
        convert
        create_index
        index_docs
        notify

        @stats
      end

      private

      def download
        @sessions.each { |s| fetch_session s }
      end

      def convert
        build_party_cache
        build_slug_cache

        xml_transcripts.each { |input| convert_to_json(input) }
      end

      def notify
        return unless @mail
        return if @new_transcripts.empty?

        count = @new_transcripts.size
        list = @new_transcripts.map { |e| "* #{e}" }.join("\n")

        stats = @stats.sort_by { |s, _| s }.reverse.map do |session, data|
          "#{session}: #{data[:speeches]} innlegg i #{data[:transcripts]} referater"
        end.join("\n")

        content = "Nye referater lagt til:\n\n#{list}\n\n#{stats}\n\n-- https://tale.holderdeord.no/"

        Mail.deliver do
          from     'noreply@holderdeord.no'
          to       ['jari@holderdeord.no']
          subject  "#{count} nye referater"
          body     content
        end
      end

      def index_docs
        json_transcripts.each { |input| index_file(input) }
      end

      def xml_transcripts
        files_matching '{[sS]*,refs-*}.xml'
      end

      def json_transcripts
        files_matching '{[sS]*,refs-*}.json'
      end

      def files_matching(glob)
        Pathname.glob(@data_dir.join(glob)).sort_by(&:to_s)
      end

      def cache_path(name)
        p = @data_dir.join("cache/#{name}.json")
        p.dirname.mkpath unless p.dirname.exist?

        p
      end

      def build_party_cache
        return unless @party_cache.empty?

        @logger.info "building name -> party cache, this could take a while"

        xml_transcripts.each do |input_file|
          Converter.parse(input_file.to_s).sections.each do |section|
            n = section[:name]
            p = section[:party]

            if n && p
              @party_cache[n] ||= p
            end
          end
        end

        # manually maintained list of people we can't infer from the transcript data
        @party_cache.merge!(@extras.fetch('parties'))
        @party_cache.save

        json_transcripts.each { |t| t.delete }
      end

      def build_slug_cache
        return unless @slug_cache.empty? || @id_to_person.empty?

        @logger.info "building name -> slug cache"

        periods = JSON.parse(@faraday.get("http://data.stortinget.no/eksport/stortingsperioder?format=json").body).
          fetch('stortingsperioder_liste').
          map { |e| e['id'] }

        periods.each do |period|
          res = @faraday.get("http://data.stortinget.no/eksport/representanter?stortingsperiodeid=#{period}&format=json")

          if res.status != 200
            @logger.warn "unable to fetch representatives for #{period}"
            next
          end

          data = JSON.parse(res.body)

          data['representanter_liste'].each do |rep|
            full_name = rep.values_at('fornavn', 'etternavn').join(' ')

            @slug_cache[full_name] = rep['id']
            @id_to_person[rep['id']] = {
              id: rep['id'],
              name: full_name,
              party: rep['parti'] ? rep['parti']['id'] : nil
            }
          end
        end

        res = @faraday.get('http://data.stortinget.no/eksport/dagensrepresentanter?format=json')
        data = JSON.parse(res.body)
        data['dagensrepresentanter_liste'].each do |rep|
          full_name = rep.values_at('fornavn', 'etternavn').join(' ')
          @slug_cache[full_name] = rep['id']

          @id_to_person[rep['id']] = {
            id: rep['id'],
            name: full_name,
            party: rep['parti'] ? rep['parti']['id'] : nil
          }
        end

        # manually maintained list of people we can't infer from the transcript data
        @slug_cache.merge!(@extras.fetch('slugs'))

        @slug_cache.save
        @id_to_person.save
      end

      def data_dir_from(options)
        dir = Pathname.new(options.fetch(:data_dir))
        dir.mkpath unless dir.exist?

        dir
      end

      def fetch_session(session)
        if session.split("-").first.to_i < 2008
          # fetch the older transcripts that we were emailed
          dest = @data_dir.join('old-data.zip')

          unless dest.exist?
            @logger.info "fetching older transcripts"
            ok = system "curl", "-o", dest.to_s, "-L", "http://files.holderdeord.no/data/transcripts/cleaned/1998-2009.zip"
            ok or raise "could not fetch transcripts"

            Dir.chdir(@data_dir) do
              ok = system "unzip", "-o", dest.to_s
              ok or raise "could not unzip"
            end
          end

          FileUtils.cp_r Dir.glob(@data_dir.join("#{session}/*.xml").to_s), @data_dir.to_s
        else
          # fetch from the API
          res = @faraday.get "http://data.stortinget.no/eksport/publikasjoner?publikasjontype=referat&sesjonid=#{URI.escape session}&format=json"
          data = JSON.parse(res.body)

          data.fetch('publikasjoner_liste').each { |t| fetch_transcript t }
        end
      end

      def fetch_transcript(t)
        id   = t['id']
        dest = @data_dir.join("#{id}.xml")

        if dest.exist? && !@force && finished_transcript?(dest)
          @logger.info "download cached: #{dest}"
        else
          @new_transcripts << id
          @logger.info "fetching transcript: #{id} => #{dest}"

          res = @faraday.get("http://data.stortinget.no/eksport/publikasjon?publikasjonid=#{id}")
          dest.open('w') { |io| io << res.body }
        end
      end

      def convert_to_json(input_file)
        dest = Pathname.new(input_file.to_s.sub(input_file.extname, '.json'))

        if dest.exist? && !@force && finished_transcript?(input_file)
          @logger.info "conversion cached: #{dest}"
        else
          @logger.info "converting: #{input_file} => #{dest}"

          json = Converter.parse(
            input_file.to_s,
            cache: @party_cache,
            id_to_person: @id_to_person,
            names: @extras.fetch('names'),
            ner: @ner,
            lix: @lix
          ).to_json


          dest.open('w') { |io| io << json }
        end
      end

      def index_file(file)
        transcript_id = file.basename.to_s.sub(file.extname, '')
        data          = JSON.parse(file.read)
        presidents    = data['presidents'].map { |e| {name: e, external_id: @slug_cache[e]} }
        session       = data['session']

        unless @sessions.include?(session)
          return
        end

        @stats[session][:transcripts] += 1

        docs = data['sections'].map.with_index do |section, idx|
          @stats[session][:speeches] += 1

          id = "#{transcript_id}-#{idx}"

          doc = {
            'presidents'  => presidents,
            'session'     => data['session'],
            'transcript'  => transcript_id,
            'order'       => idx,
            'external_id' => @slug_cache[section['name']],
          }.merge(section)

          [id, doc]
        end

        @index.index docs

        if data['errors']
          data['errors'].each do |err|
            @logger.error err.inspect
          end
        end

        @logger.info "indexed #{file}"
      end

      def finished_transcript?(file)
        if !@finished_cache.key?(file.to_s)
          doc = Nokogiri::XML.parse(file.read)
          node = doc.css('Forhandlinger').first

          @finished_cache[file.to_s] = node.nil? || (node.attr('Status') == 'Komplett')
        end

        @finished_cache[file.to_s]
      rescue => err
        @logger.error err.inspect

        false
      end

      def create_index
        if @create_index || !@index.exists?
          @logger.info "creating index #{@index_name}"
          @index.recreate!
        end
      end
    end
  end
end
