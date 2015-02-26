require 'elasticsearch'
require 'pry'
require 'pp'

class SignificantTerms
  ALGORITHMS = [:jlh, :mutual_information, :chi_square, :gnd]

  # get top 10 terms for all algorithms for all years
  def get(size = 10)
    result = []

    ALGORITHMS.each do |alg|
      significant_terms_timeline('*', alg, size).each do |time, words|
        result.concat words
      end
    end

    result.sort.uniq
  end

  def timeline_for(word)
    response = client.search(
      index: 'hdo-transcripts',
      type: 'speech',
      body: {
        size: 0,
        query: {
          query_string: {
            default_field: "text",
            query: word
          }
        },
        aggregations: {
          timeline: {
            date_histogram: {
              interval: "year" ,
              field: "time"
            }
          }
        }
      }
    )

    result = {}

    response['aggregations']['timeline']['buckets'].each do |bucket|
      t = Time.at(bucket['key'] / 1000)
      count = bucket['doc_count']

      result[t] = count
    end

    result
  end

  def show_algorithms_for(query)
    ALGORITHMS.each do |alg|
      result = significant_terms_timeline(query, alg)
      puts "#### #{alg}"
      puts

      result.each do |time, words|
        puts "\t#{time.strftime("%Y-%m")} | #{words.join(', ')}"
      end

      puts
    end
  end

  def significant_terms(query = nil, algorithm = :mutual_information, size = 10)
    response = client.search(
      index: 'hdo-transcripts',
      type: 'speech',
      body: {
        size: 0,
        query: {
          query_string: {
            default_field: "text",
            query: query || "*"
          }
        },
        aggregations: {
          interesting_words: {
            significant_terms: {
              field: "text",
              size: size,
              algorithm => {}
            }
          }
        }
    })

    result = []

    response['aggregations']['interesting_words']['buckets'].each do |bucket|
      result << bucket['key']
    end

    result
  end

  def significant_terms_timeline(query = nil, algorithm = :mutual_information, size = 10)
    response = client.search(
      index: 'hdo-transcripts',
      type: 'speech',
      body: {
        size: 0,
        query: {
          query_string: {
            default_field: "text",
            query: query || "*"
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
                  size: size,
                  algorithm => {}
                }
              }
            }
          }
        }
    })

    result = Hash.new { |hash, time| hash[time] = [] }

    response['aggregations']['interesting_words']['buckets'].each do |bucket|
      time = Time.parse(bucket['key_as_string'])
      words = bucket['words']['buckets'].map { |wbucket| wbucket['key'] }

      result[time] = words
    end

    result
  end

  private

  def client
    @client ||= Elasticsearch::Client.new(
      url: ENV['BOXEN_ELASTICSEARCH_URL'] || 'http://127.0.0.1:9200',
      log: false
    )
  end
end


if __FILE__ == $0
  st = SignificantTerms.new
  st.show_algorithms_for(ARGV.first)
end
