# -*- coding: utf-8 -*-
require 'time'
require 'set'
require 'hashie/mash'

module Hdo
  module Transcript
    class Converter

      class << self
        def parse(file, options = {})
          if file.to_s =~ /s(\d{2})(\d{2})(\d{2}).*\.xml$/
            short_year = $1
            month      = $2.to_i
            day        = $3.to_i
            year       = (short_year.to_i > 50 ? "19#{short_year}" : "20#{short_year}").to_i
            doc        = Nokogiri::XML.parse(File.read(file))

            new(doc, Time.new(year, month, day), options)
          else
            raise "could not parse date from #{file}"
          end
        end
      end

      def initialize(doc, time, options = {})
        @time         = time
        @doc          = doc
        @current_node = nil
        @last_section = {}
        @name_cache   = options[:cache] || {}
        @errors       = Set.new
      end

      def sections
        @doc.css('presinnl, innlegg').
          map { |node| @last_section = parse_section(node) }.
          compact.
          map { |e| validate(e) }
      end

      def president_names
        @president_name ||= @doc.css('president').text.gsub(/president:?\s*/i, '').split(/\r?\n/).map(&:strip).uniq
      end

      def as_json(opts = nil)
        {
          date: @time.iso8601,
          presidents: president_names,
          sections: sections,
          errors: errors
        }
      end

      def to_json(opts = nil)
        as_json.to_json(opts)
      end

      def errors
        @errors.to_a
      end

      private

      IGNORED_NAMES = ["Representantene"]

      def validate(section)
        if section[:party].nil? && section[:title].nil?
          @errors << {error: "both party and title is null", section: section}
        elsif section[:party].nil? && section[:name] != "Presidenten"
          @errors << {error: "party missing", name: section[:name], title: section[:title]}
        end

        section
      end

      def parse_section(node)
        @current_node = node

        case node.name
        when 'innlegg'
          name_str = node.css('navn').text.strip
          text     = clean_text(node.text.sub(/\s*#{Regexp.escape name_str}\s*/m, ''))

          return if IGNORED_NAMES.include?(name_str)

          parsed = parse_name_string(name_str)

          if parsed.name =~ /\(|\)/
            raise "invalid name: #{parsed.to_hash.inspect}"
          end

          # sometimes the name is entered as a separate but empty speech
          if parsed.name.nil? && parsed.party.nil?
            if @last_section[:name] && @last_section[:text].empty?
              parsed.name = @last_section[:name]
              parsed.party = @last_section[:party]
              parsed.title ||= @last_section[:title]
            elsif text =~ /^(Fra|Frå) representanten (.+?) til (.+?): «(.+?)»/m
              parsed.name  = $2
              parsed.title = "Representant"
              parsed.text  = $4
              parsed.party = party_for(parsed.name)
            end
          end

          parsed.party = 'FrP' if parsed.party == 'Frp'

          {
            :name  => parsed.name ? parsed.name.strip : parsed.name,
            :party => parsed.party,
            :time  => parsed.time ? parsed.time.iso8601 : @time.iso8601,
            :text  => text,
            :title => parsed.title || (parsed.party ? 'Representant' : nil)
          }
        when 'presinnl'
          {
            :name  => "Presidenten",
            :party => nil,
            :text  => clean_text(node.text),
            :time  => @time.iso8601,
            :title => "President"
          }
        end
      end

      def clean_text(str)
        str.strip.gsub(/\n\s*/, ' ').gsub(/\s{2,}/, ' ')
      end

      DATE_EXP  = /:? ?[\[\(] *(\d{2}) *[:.] *(\d{2}) *[:.] *(\d{2}) *:?[\]\)].*?/
      PARTY_EXP = /\s*[\( ](SV|KrF|V|A|MDG|FrP|Frp|H|Sp|TF)[\) ]\s*?/

      def parse_name_string(str)
        result = Hashie::Mash.new

        str.gsub!("[ [", "[")
        str.gsub!(" [klokkeslett mangler]", "")
        str.gsub!(" ", "")
        str.gsub!(/\xC2\xA0/, "")
        str.strip!

        case str
        when "", ":"
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
          result.party = party_for(result.name)
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
        @name_cache[name]
      end

    end
  end
end
