#!/usr/bin/env ruby

require 'elasticsearch'
require 'hashie/mash'
require 'pp'
require 'fileutils'

client ||= Elasticsearch::Client.new(
  url: ENV['BOXEN_ELASTICSEARCH_URL'] || 'http://127.0.0.1:9200',
  log: false
)

res = Hashie::Mash.new client.search({
  index: 'hdo-transcripts',
  type: 'speech',
  body: {
    size: 0,
    aggregations: {
      externalIds: {
        terms: {
          field: "external_id",
          size: 3000
        }
      }
    }
  }
});

ids = res.aggregations.externalIds.buckets.map { |b| b['key'] }

out_dir = File.expand_path('../../webapp/public/images', __FILE__)
FileUtils.mkdir_p out_dir

ids.each do |id|
  url = "http://data.stortinget.no/eksport/personbilde?personid=#{id}&storrelse=stort"

  ok = system "curl -s '#{url}' > #{out_dir}/#{id}.jpg"
  raise "failed to download #{id}" unless ok

  p id
end