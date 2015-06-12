require 'elasticsearch'


module Hdo
  module Transcript
    class Index
      def initialize(url, name, logger)
        @url    = url
        @name   = name
        @logger = logger
        @type   = 'speech'
      end

      def recreate!
        es.indices.delete(index: @name) if exists?
        es.indices.create index: @name, body: { settings: ES_SETTINGS, mappings: ES_MAPPINGS }
      end

      def index(documents)
        documents.each_slice(20) do |slice|
          body = slice.flat_map do |id, doc|
            [
              {index: { _index: @name, _type: @type, _id: id}},
              doc
            ]
          end

          bulk_with_retry body
        end
      end

      def exists?
        es.indices.exists(index: @name)
      end

      private

      def bulk_with_retry(body)
        retries = 0
        begin
          es.bulk body: body
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

      def es
        @es ||= Elasticsearch::Client.new(
          log: false,
          url: @url
        )
      end

      ES_SETTINGS = {
        index: {
          analysis: {
            analyzer: {
              analyzer_standard: {
                tokenizer: "standard",
                filter: ["standard", "lowercase"]
              },
              analyzer_shingle: {
                tokenizer: "standard",
                filter:    ["standard", "lowercase", "filter_stop", "filter_shingle"]
              }
            },
            filter: {
              filter_shingle: {
                type:             "shingle",
                max_shingle_size: 2,
                min_shingle_size: 2,
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
              analyzer: 'analyzer_standard',
              fields: {
                shingles: { type: "string", analyzer: "analyzer_shingle"}
              }
            },
            name:        { type: 'string',  index: 'not_analyzed' },
            party:       { type: 'string',  index: 'not_analyzed' },
            presidents:  {
              properties: {
                name: { type: 'string', index: 'not_analyzed' },
                external_id: { type: 'string', index: 'not_analyzed' }
              }
            },
            title:       { type: 'string',  index: 'not_analyzed' },
            external_id: { type: 'string',  index: 'not_analyzed' },
            transcript:  { type: 'string',  index: 'not_analyzed' },
            session:     { type: 'string',  index: 'not_analyzed' },
            order:       { type: 'integer', index: 'not_analyzed' }
          }
        }
      }

    end
  end
end