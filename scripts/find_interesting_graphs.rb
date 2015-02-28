require_relative 'significant_terms'
require_relative 'correlation_finder'
require_relative 'screenshooter'
require 'fileutils'

@screenshooter = Screenshooter.new

[
  {flip: false, threshold: 50, min_length: 8},
  {flip: true, threshold: 50, min_length: 8}
].each_with_index do |opts, idx|
  cf = CorrelationFinder.new(opts)
  cf.top_correlations(100).each_with_index do |correlation, index|
    score = correlation[:correlation]
    words = correlation[:words]
    q     = words.join(', ')

    next if q.include? '.' # not possible atm

    p [q, score]

    out   = "/tmp/transcript-correlation-#{idx}-#{index}.png"
    label = opts[:flip] ? 'flipped correlation' : 'correlation'

    @screenshooter.snap(q, out, label: "#{label}=#{score}")
  end
end

@screenshooter.stitch('/tmp/transcript-correlation-*.png', 'korrelasjoner.pdf')
Dir.glob('/tmp/*.png').each { |png| FileUtils.rm png }

