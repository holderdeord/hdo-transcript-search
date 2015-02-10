# -*- coding: utf-8 -*-
require 'time'
require 'set'
require 'hashie/mash'

module Hdo
  module Transcript
    class Converter

      def self.parse(file)
        if file =~ /s(\d{2})(\d{2})(\d{2}).*\.xml$/
          short_year = $1.to_i
          month      = $2.to_i
          day        = $3.to_i
          year       = short_year > 50 ? "19#{short_year}" : "20#{short_year}"
          doc        = Nokogiri::XML.parse(File.read(file))

          new(doc, Time.new(year, month, day))
        else
          raise "could not parse date from #{file}"
        end
      end

      def initialize(doc, time)
        @time         = time
        @doc          = doc
        @current_node = nil
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
        @current_node = node

        case node.name
        when 'innlegg'
          name_str = node.css('navn').text.strip
          text     = clean_text(node.text.sub(/\s*#{Regexp.escape name_str}\s*/m, ''))

          return if IGNORED_NAMES.include?(name_str)

          parsed = parse_name_string(name_str)

          if parsed.name =~ /\(|\)/
            raise "invalid name: #{name.inspect}"
          end

          parsed.party = 'FrP' if parsed.party == 'Frp'

          {
            :name  => parsed.name ? parsed.name.strip : parsed.name,
            :party => parsed.party,
            :time  => parsed.time ? parsed.time.iso8601 : parsed.time,
            :text  => text,
            :title => parsed.title || "Representant"
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
        result = Hashie::Mash.new

        str.gsub!("[ [", "[")
        str.gsub!(" [klokkeslett mangler]", "")
        str.gsub!(" ", "")

        case str
        when ""
          # ignored
        when /^(Statsminister|Statsråd|.+minister|.+president) (.+?)(?:#{DATE_EXP})?:?$/
          result.name  = $2.strip
          result.party = nil
          result.time  = create_time($3, $4, $5)
          result.title = $1

          if result.name =~ PARTY_EXP
            result.party = $1
            result.name  = result.name.sub(PARTY_EXP, '').strip
          else
            result.party = party_for(result.name)
          end
        when /^(.+?)#{PARTY_EXP}#{DATE_EXP}:?$/
          result.name  = $1
          result.party = $2
          result.time  = create_time($3, $4, $5)
        when /^(.+?)#{DATE_EXP}:?$/
          result.name = $1
          result.time = create_time($2, $3, $4)
        when /^(.+?)#{PARTY_EXP} (\[klokkeslett mangler\]|\(fra salen\)):?$/
          result.name  = $1
          result.party = $2
        when /^(.+?)#{PARTY_EXP}:?$/
          result.name  = $1
          result.party = $2
        when /^\s*presidenten:?\s*$/i
          result.name  = "Presidenten"
          result.title = "President"
        else
          raise "could not parse name string from #{str.inspect} in #{@current_node.to_s}"
        end

        result
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
