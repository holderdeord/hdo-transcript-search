#!/usr/bin/env ruby

require 'elasticsearch'
require 'hashie/mash'
require 'pp'
require 'fileutils'
require 'json'

out_dir = File.expand_path('../../webapp/public/images', __FILE__)
FileUtils.mkdir_p out_dir

def save(url, dest, opts = {})


  ok = system "curl #{'--fail' if opts[:fail]} -Ls '#{url}' -o #{dest}"
  ok or raise "failed to download #{url} to #{dest}"
end

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

ids.each do |id|
  url = "http://data.stortinget.no/eksport/personbilde?personid=#{id}&storrelse=stort"

  save url, "#{out_dir}/#{id}.jpg"

  p id
end

faraday = Faraday.new

parties = JSON.parse(faraday.get('https://www.holderdeord.no/api/parties').body)
parties['_embedded']['parties'].each do |party|
  url = party['_links']['logo']['href'].sub('{?version}', '?version=large')

  save url, "#{out_dir}/#{party['slug']}.png"
  p party['slug']
end

save "https://www.holderdeord.no/assets/representatives/unknown.jpg", "#{out_dir}/unknown.jpg"