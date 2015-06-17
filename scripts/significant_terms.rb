require 'elasticsearch'
require 'pry'
require 'pp'
require 'json'

class SignificantTerms
  ALGORITHMS = [:jlh, :mutual_information, :chi_square, :gnd]
  # ALGORITHMS = [:jlh]

  # get top 10 terms for all algorithms for all years
  def get(size = 10)
    result = {}

    ALGORITHMS.each do |alg|
      significant_terms_timeline('*', alg, size).each do |time, words|
        result[time] = words
      end
    end

    result
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
            range: {
              field: "time",
              ranges: [
                { from: 1001887200000, to: 1128117599000 },
                { from: 1128117600000, to: 1254347999000 },
                { from: 1254348000000, to: 1380578399000 },
                { from: 1380578400000, to: 1506808799000 }
              ]
            }
          }
        }
      }
    )

    result = {}

    response['aggregations']['timeline']['buckets'].each do |bucket|
      # t = Time.at(bucket['key'] / 1000)
      t = bucket['key']
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
            date_range: {
              field: "time",
              ranges: [
                { from: 1001887200000, to: 1128117599000 },
                { from: 1128117600000, to: 1254347999000 },
                { from: 1254348000000, to: 1380578399000 },
                { from: 1380578400000, to: 1506808799000 }
              ]
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
      time = bucket['key']
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
  st.get(200).each do |time, words|
    puts "# #{time}\n\n"
    puts words.join(', ')
    puts
  end
end
