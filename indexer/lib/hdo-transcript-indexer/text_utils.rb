require 'pry'

module Hdo
  module Transcript
    module TextUtils

      #
      # https://en.wikipedia.org/wiki/LIX
      #

      SENTENCE_EXP = /[.:!?]/

      def self.lix(str)
        str = str.to_s.gsub(/f\.\s*eks\s*\./, 'for eksempel').gsub(/bl\.\s*a\s*\./, 'blant annet').gsub(/\bnr\./, 'nummer')
        words = words(str)

        a = words.size
        b = str.scan(SENTENCE_EXP).size
        b = 1 if b.zero?
        c = words.map { |e| e.gsub(/[.:;,]/, '') }.select { |e| e.size > 6 }.size

        score = (a / b.to_f) + ((c * 100) / a.to_f)

        classification = case score
                         when -Float::INFINITY..30
                           'Veldig lettlest / barnebøker'
                         when 30..40
                           'Lettlest, skjønnlitteratur'
                         when 40..50
                            'Middels vanskelig, avistekst'
                         when 50..60
                            'Vanskelig, offisielle tekster'
                         when 60..Float::INFINITY
                            'Meget vanskelig, byråkratnorsk'
                         end

        {
          score: score,
          classification: classification
        }
      end

      def self.words(str)
        str.to_s.scan(/\S+/)
      end

      def self.word_count(str)
        words(str).size
      end
    end
  end
end

if __FILE__ == $0
  p Hdo::Transcript::TextUtils.lix(STDIN.read)
end