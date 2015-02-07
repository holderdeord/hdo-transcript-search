# -*- coding: utf-8 -*-
require 'time'
require 'set'

module Hdo
  module Transcript
    class Converter

      def self.parse(file)
        if file =~ /s(\d{2})(\d{2})(\d{2})\.xml/
          year  = "20#{$1}"
          month = $2.to_i
          day   = $3.to_i
          doc   = Nokogiri::XML.parse(File.read(file))

          new(doc, Time.new(year, month, day))
        else
          raise "could not parse date from #{file}"
        end

      end

      def initialize(doc, time)
        @time = time
        @doc = doc
      end

      def sections
        @doc.css('presinnl, innlegg').map { |node| parse_section(node) }.compact
      end

      def president_names
        @president_name ||= @doc.css('president').text.split("\n").map(&:strip).uniq
      end

      def as_json(opts = nil)
        {
          date: @time.iso8601,
          presidents: president_names,
          sections: sections
        }
      end

      def to_json(opts = nil)
        as_json.to_json(opts)
      end

      private

      IGNORED_NAMES = ["Representantene"]

      def parse_section(node)
        case node.name
        when 'innlegg'
          name_str = node.css('navn').text.strip
          text     = clean_text(node.text.sub(/\s*#{Regexp.escape name_str}\s*/m, ''))

          return if IGNORED_NAMES.include?(name_str)

          name, party, time, title = parse_name_string(name_str)

          if name =~ /\(|\)/
            raise "invalid name: #{name.inspect}"
          end

          party = 'FrP' if party == 'Frp'

          {
            :name  => name ? name.strip : name,
            :party => party,
            :time  => time ? time.iso8601 : time,
            :text  => text,
            :title => title
          }
        when 'presinnl'
          {
            :name  => "Presidenten",
            :party => nil,
            :text  => clean_text(node.text),
            :time  => nil,
            :title => "President"
          }
        end
      end

      def clean_text(str)
        str.strip.gsub(/\n\s*/, ' ').gsub(/\s{2,}/, ' ')
      end

      DATE_EXP  = /:? ?[\[\(] *(\d{2}) *[:.] *(\d{2}) *[:.] *(\d{2}) *:?[\]\)].*?/
      PARTY_EXP = /\s*[\( ](SV|KrF|V|A|MDG|FrP|Frp|H|Sp)[\) ]\s*?/

      def parse_name_string(str)
        return [] if str.empty?
        str.gsub!("[ [", "[")
        str.gsub!(" [klokkeslett mangler]", "")
        str.gsub!(" ", "")

        case str
        when /^(Statsminister|Statsråd|.+minister|.+president) (.+?)(?:#{DATE_EXP})?:?$/
          res = [$2.strip, nil, create_time($3, $4, $5), $1]

          if res[0] =~ PARTY_EXP
            res[1] = $1
            res[0] = res[0].sub(PARTY_EXP, '').strip
          else
            res[1] = party_for(res[0])
          end

          res
        when /^(.+?)#{PARTY_EXP}#{DATE_EXP}:?$/
          [$1, $2, create_time($3, $4, $5), nil]
        when /^(.+?)#{DATE_EXP}:?$/
          [$1, nil, create_time($2, $3, $4), nil]
        when /^(.+?)#{PARTY_EXP} (\[klokkeslett mangler\]|\(fra salen\)):?$/
          [$1, $2, nil, nil]
        when /^(.+?)#{PARTY_EXP}:?$/
          [$1, $2, nil, nil]
        else
          raise "could not parse name string: #{str.inspect}"
        end
      end

      def create_time(hour, minute, second)
        data = [hour, minute, second].compact.map(&:to_i)
        if data.size == 3
          data[2] = 59 if data[2] > 60

          Time.new(@time.year, @time.month, @time.day, *data)
        end
      end

      def party_for(name)
        # TODO - må kunne hente parti for statsråder
      end

    end
  end
end
