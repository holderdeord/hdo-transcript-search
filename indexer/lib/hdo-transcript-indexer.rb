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

require 'hdo-transcript-indexer/converter'
require 'hdo-transcript-indexer/cache'
require 'hdo-transcript-indexer/index'

Faraday.default_adapter = :patron
Faraday.default_connection_options.request.timeout = 30 # we sometimes see hangs in the API
Faraday.default_connection_options.headers = {'User-Agent' => 'hdo-transcript-downloader | https://www.holderdeord.no/'}

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
        @errors       = []

        @index = Index.new(
          options.fetch(:elasticsearch_url),
          options.fetch(:index_name),
          @logger
        )

        @party_cache = Cache.new(cache_path('name-to-party'))
        @party_cache.load_if_exists

        @slug_cache = Cache.new(cache_path('name-to-slug'))
        @slug_cache.load_if_exists
      end

      def execute
        download
        convert
        create_index
        index_docs
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

      def index_docs
        json_transcripts.each do |input|
          index_file(input)
          @logger.info "indexed #{input}"
        end
      end

      def xml_transcripts
        files_matching 's*.xml'
      end

      def json_transcripts
        files_matching 's*.json'
      end

      def files_matching(glob)
        Pathname.glob(@data_dir.join(glob))
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
            Converter.parse(input_file).sections.each do |section|
              n = section[:name]
              p = section[:party]

              if n && p
                @party_cache[n] ||= p
              end
            end
          end

          # manually maintained list of people we can't infer from the transcript data
          @party_cache.merge!(JSON.parse(File.read(File.expand_path("../hdo-transcript-indexer/n2p.extras.json", __FILE__))))
          @party_cache.save

          json_transcripts.each { |t| t.delete }
      end

      def build_slug_cache
        return unless @slug_cache.empty?

        @logger.info "building name -> slug cache"

        ['2005-2009', '2009-2013', '2013-2017'].each do |period|
          res = @faraday.get("http://data.stortinget.no/eksport/representanter?stortingsperiodeid=#{period}&format=json")
          data = JSON.parse(res.body)

          data['representanter_liste'].each do |rep|
            full_name = rep.values_at('fornavn', 'etternavn').join(' ')
            @slug_cache[full_name] = rep['id']
          end

          res = @raday
        end

        res = @faraday.get('http://data.stortinget.no/eksport/dagensrepresentanter?format=json')
        data = JSON.parse(res.body)
        data['dagensrepresentanter_liste'].each do |rep|
          full_name = rep.values_at('fornavn', 'etternavn').join(' ')
          @slug_cache[full_name] = rep['id']
        end

        @slug_cache.save
      end

      def data_dir_from(options)
        dir = Pathname.new(options.fetch(:data_dir))
        dir.mkpath unless dir.exist?

        dir
      end

      def fetch_session(session)
        res = @faraday.get "http://data.stortinget.no/eksport/publikasjoner?publikasjontype=referat&sesjonid=#{URI.escape session}&format=json"
        data = JSON.parse(res.body)

        data.fetch('publikasjoner_liste').each { |t| fetch_transcript t }
      end

      def fetch_transcript(t)
        id   = t['id']
        dest = @data_dir.join("#{id}.xml")

        if dest.exist? && !@force
          @logger.info "download cached: #{dest}"
        else
          @logger.info "fetching transcript: #{id} => #{dest}"

          res = @faraday.get("http://data.stortinget.no/eksport/publikasjon?publikasjonid=#{id}")
          dest.open('w') { |io| io << res.body }
        end
      end

      def convert_to_json(input_file)
        dest = Pathname.new(input_file.to_s.sub(input_file.extname, '.json'))

        if dest.exist? && !@force
          @logger.info "conversion cached: #{dest}"
        else
          @logger.info "converting: #{input_file} => #{dest}"

          converter = Converter.parse(input_file.to_s, cache: @party_cache)
          json = converter.to_json

          dest.open('w') { |io| io << json }
        end
      end

      def index_file(file)
        transcript_id = file.basename.to_s.sub(file.extname, '')
        data          = JSON.parse(file.read)

        docs = data['sections'].map.with_index do |section, idx|
          id = "#{transcript_id}-#{idx}"

          doc = {
            'presidents'  => data['presidents'],
            'session'     => data['session'],
            'transcript'  => transcript_id,
            'order'       => idx,
            'external_id' => @slug_cache[section['name']]
          }.merge(section)

          [id, doc]
        end

        @index.index docs

        if data['errors']
          data['errors'].each do |err|
            @logger.error err.inspect
          end
        end
      end

      def create_index
        return unless @create_index

        @logger.info "recreating index #{@index_name}"
        @index.recreate!
      end

    end
  end
end
