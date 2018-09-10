#!/usr/bin/env ruby

require 'elasticsearch'
require 'hashie/mash'
require 'pp'
require 'fileutils'
require 'json'
require 'faraday_middleware'
require 'uri'

FD = Faraday.new { |b|
  b.use FaradayMiddleware::FollowRedirects
  b.adapter :net_http
}

out_dir = File.expand_path('../../webapp/public/images', __FILE__)
FileUtils.mkdir_p out_dir

def save(url, dest, opts = {})
  res = FD.get(url)

  if res.status == 200
    File.open(dest, 'wb') { |io| io << res.body }
  else
    msg = "failed to download #{url}, #{res.status}"
    opts[:fail] ? raise(msg) : puts(msg)
  end
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
  rep_slug = URI::encode(id)
  url = "http://data.stortinget.no/eksport/personbilde?personid=#{rep_slug}&storrelse=stort"

  save url, "#{out_dir}/#{id}.jpg"

  p id
end



parties = JSON.parse(FD.get('https://www.holderdeord.no/api/parties').body)
parties['_embedded']['parties'].each do |party|
  url = party['_links']['logo']['href'].sub('{version}', 'large')

  save url, "#{out_dir}/#{party['slug']}.png", fail: true
  p party['slug']
end

save "https://www.holderdeord.no/assets/representatives/unknown.jpg", "#{out_dir}/unknown.jpg"