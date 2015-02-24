require 'elasticsearch'
require 'pry'

client = Elasticsearch::Client.new(url: ENV['BOXEN_ELASTICSEARCH_URL'] || 'http://127.0.0.1:9200')

algorithms = [:jlh, :mutual_information, :chi_square, :gnd]

algorithms.each do |alg|
  response = client.search(index: 'hdo-transcripts', type: 'speech', body: {
    size: 0,
    query: {
      query_string: {
        default_field: "text",
        query: ARGV.first || "*"
      }
    },
    aggregations: {
       interesting_words: {
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

  puts "#### #{alg}"
  puts

  response['aggregations']['interesting_words']['buckets'].each do |bucket|
    words = bucket['words']['buckets'].map { |wbucket| wbucket['key'] }
    puts "\t#{Time.parse(bucket['key_as_string']).strftime("%Y-%m")} | #{words.join(', ')}"
  end

  puts
end