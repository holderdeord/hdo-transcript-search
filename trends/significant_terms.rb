require 'elasticsearch'
require 'pry'

client = Elasticsearch::Client.new(url: ENV['BOXEN_ELASTICSEARCH_URL'] || 'http://127.0.0.1:9200')

algorithms = [:jlh, :mutual_information, :chi_square, :gnd]

algorithms.each do |alg|
  response = client.search(index: 'hdo-transcripts', type: 'speech', body: {
     size: 0,
     aggregations: {
        interesting_words_by_year: {
            date_histogram: {
                field: "time",
                interval: "year"
            },
            aggregations: {
                words: {
                    significant_terms: {
                        field: "text",
                        size: 10,
                        alg => {}
                    }
                }
            }
        }
     }
  })

  puts alg

  response['aggregations']['interesting_words_by_year']['buckets'].each do |bucket|
    words = bucket['words']['buckets'].map { |wbucket| wbucket['key'] }
    puts "\t#{Time.parse(bucket['key_as_string']).strftime("%Y")} | #{words.join(', ')}"
  end
end