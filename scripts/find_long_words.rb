#!/usr/bin/env ruby

require 'json'

def words(str)
  str.to_s.scan(/\S+/)
end

words = {}

Dir['data/*.json'].each do |file|
  data = JSON.parse(File.read(file))
  data['sections'].each do |section|
    words(section['text']).each do |word|
      words[word] = word.size
    end
  end
end

puts words.sort_by { |word, length| -length }.first(1000).map { |word, _| word  }