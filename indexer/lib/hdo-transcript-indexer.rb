# -*- coding: utf-8 -*-
require 'nokogiri'
require 'elasticsearch'
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
        @index_name   = options.fetch(:index_name)
        @force        = options.fetch(:force)
        @es_url       = options.fetch(:elasticsearch_url)
        @errors       = []

        @party_cache = Cache.new(party_cache_path)
        @party_cache.load if party_cache_path.exist?

        @slug_cache = Cache.new(slug_cache_path)
        @slug_cache.load if slug_cache_path.exist?
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
        if @party_cache.empty?
          @logger.info "building name -> party cache, this could take a while"

          xml_transcripts.each { |input| build_party_cache(input) }
          load_extras_cache
          @party_cache.save

          json_transcripts.each { |t| t.delete }
        else
          @logger.info "found name -> party cache"
        end

        if @slug_cache.empty?
          @logger.info "building name -> slug cache"
          build_slug_cache
          @slug_cache.save
        else
          @logger.info "found name -> slug cache"
        end

        xml_transcripts.each { |input| convert_to_json(input) }
      end

      def index_docs
        json_transcripts.each do |input|
          index_file(input)
          @logger.info "indexed #{input}"
        end
      end

      def xml_transcripts
        Pathname.glob(@data_dir.join('s*.xml'))
      end

      def json_transcripts
        Pathname.glob(@data_dir.join('s*.json'))
      end

      def party_cache_path
        @party_cache_path ||= (
          p = @data_dir.join('cache/name-to-party.json')
          p.dirname.mkpath unless p.dirname.exist?

          p
        )
      end

      def slug_cache_path
        @slug_cache_path ||= (
          p = @data_dir.join('cache/name-to-slug.json')
          p.dirname.mkpath unless p.dirname.exist?

          p
        )
      end

      def build_party_cache(input_file)
        Converter.parse(input_file).sections.each do |section|
          n = section[:name]
          p = section[:party]

          if n && p
            @party_cache[n] ||= p
          end
        end
      end

      def build_slug_cache
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
      end

      def load_extras_cache
        # manually maintained list of people we can't infer from the transcript data
        @party_cache.merge!(JSON.parse(File.read(File.expand_path("../hdo-transcript-indexer/n2p.extras.json", __FILE__))))
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

        data['sections'].each_with_index do |section, idx|
          id = "#{transcript_id}-#{idx}"

          doc = {
            'presidents'  => data['presidents'],
            'transcript'  => transcript_id,
            'order'       => idx,
            'external_id' => @slug_cache[section['name']]
          }.merge(section)

          index_with_retry id, doc
        end

        if data['errors']
          data['errors'].each do |err|
            @logger.error err.inspect
          end
        end
      end

      def index_with_retry(id, doc)
        retries = 0
        begin
          es.index index: @index_name, type: 'speech', id: id, body: doc
        rescue Faraday::TimeoutError => ex
          @logger.info "#{ex.message}, retrying"

          if retries <= 3
            retries += 1
            retry
          else
            raise
          end
        end
      end

      def create_index
        return unless @create_index

        @logger.info "recreating index #{@index_name}"

        es.indices.delete(index: @index_name) if es.indices.exists(index: @index_name)
        es.indices.create index: @index_name, body: { settings: ES_SETTINGS, mappings: ES_MAPPINGS }
      end

      def es
        @es ||= Elasticsearch::Client.new(
          log: false,
          url: @es_url
        )
      end

      ES_SETTINGS = {
        index: {
          analysis: {
            analyzer: {
              analyzer_shingle: {
                tokenizer: "standard",
                filter:    ["standard", "lowercase", "filter_stop", "filter_shingle"]
              }
            },
            filter: {
              filter_shingle: {
                type:             "shingle",
                max_shingle_size: 5,
                min_shignle_size: 2,
                output_unigrams:  true
              },
              filter_stop: {
                type:       "stop",
                stopwords:  "_norwegian_"
                # enable_position_increments: false
              }
            }
          }
        }
      }

      ES_MAPPINGS = {
        speech: {
          properties: {
            time: {
              type:   'date',
              format: 'date_time_no_millis'
            },
            text: {
              type: 'string',
              fields: {
                shingles: { type: "string", analyzer: "analyzer_shingle"}
              }
            },
            name:        { type: 'string', index: 'not_analyzed' },
            party:       { type: 'string', index: 'not_analyzed' },
            presidents:  { type: 'string', index: 'not_analyzed' },
            title:       { type: 'string', index: 'not_analyzed' },
            external_id: { type: 'string', index: 'not_analyzed' }
          }
        }
      }

    end
  end
end
