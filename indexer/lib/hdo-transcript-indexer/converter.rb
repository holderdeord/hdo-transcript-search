# -*- coding: utf-8 -*-
require 'time'
require 'set'
require 'hashie/mash'
require 'hdo/storting_importer'

module Hdo
  module Transcript
    class Converter

      class << self
        def parse(file, options = {})
          if file.to_s =~ /s(\d{2})(\d{2})(\d{2}).*\.xml$/i
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
        @time             = time
        @doc              = doc
        @current_node     = nil
        @last_section     = {}
        @name_to_party    = options[:cache] || {}
        @name_corrections = options[:names] || {}
        @errors           = Set.new

        session = Hdo::StortingImporter::Util.session_for_date(@time.to_date)
        @session = [session.begin.year, session.end.year].join('-')
      end

      def sections
        @doc.css('presinnl, innlegg').
          map { |node| @last_section = parse_section(node) }.
          compact.
          reject { |e| e[:text].empty? }.
          map { |e| validate(e) }
      end

      def president_names
        @president_name ||= @doc.css('president').text.gsub(/president:?\s*/i, '').split(/\r?\n/).map(&:strip).uniq
      end

      def as_json(opts = nil)
        {
          date: @time.iso8601,
          session: @session,
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

      IGNORED_NAMES = [
        "Representantene",
        "Forslag nr. 2, fra Frem­skritts­par­tiet\nog representanten Vidar Kleppe, lyder:",
        "­Tore Hagebakken (A) og Inger\nS. Enger (Sp)", # TODO: split in two sections?
        "«" # 1999-12-21 Hill Marta Solberg
      ]

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
          parse_speech(node)
        when 'presinnl'
          parse_president_speech(node)
        end
      end

      def parse_speech(node)
        name_str = node.css('navn').text
        text     = clean_text(node.text.sub(/\s*#{Regexp.escape name_str}\s*/m, ''))

        return if IGNORED_NAMES.include?(name_str)

        parsed = parse_name_string(name_str)

        # sometimes the name is entered as a separate but empty speech
        if parsed.name.nil? && parsed.party.nil?
          if @last_section[:name] && @last_section[:text].empty?
            parsed.name = @last_section[:name]
            parsed.party = @last_section[:party]
            parsed.title ||= @last_section[:title]
          elsif text =~ /^(Fra|Frå) representanten (.+?) til (.+?): «(.+?)»/m
            parsed.name  = $2
            parsed.title = "Representant"
            text         = $4
            parsed.party = party_for(parsed.name)
          end
        end

        parsed.party = normalize_party(parsed.party)
        parsed.title = normalize_title(parsed.title)

        {
          :name  => parsed.name ? parsed.name.strip : parsed.name,
          :party => parsed.party,
          :time  => parsed.time ? parsed.time.iso8601 : @time.iso8601,
          :text  => "#{parsed.text}#{text}",
          :title => parsed.title || (parsed.party ? 'Representant' : nil)
        }
      end

      def parse_president_speech(node)
        {
          :name  => "Presidenten",
          :party => nil,
          :text  => clean_text(node.text),
          :time  => @time.iso8601,
          :title => "President"
        }
      end

      def clean_text(str)
        str.
          gsub(/\n\s*/, ' ').
          gsub(/\s{2,}/, ' ').
          gsub("­", '').
          strip
      end

      def clean_name_string(str)
        str.
          gsub("[ [", "[").
          gsub("[[", "[").
          gsub("]]", "]").
          gsub(/[\[\(]?\s*(\d{2}):(\d{2}):_?(\d{2})\s*[\]\)]?/, '[\1:\2:\3]').
          gsub(" [klokkeslett mangler]", "").
          gsub(" ", ""). # weird space
          gsub("­", ''). # weird space 2
          gsub("\xe2\x80\x89", ''). # weird space 3
          gsub("(komiteens leder)", "").
          gsub(" SV:", " (SV):").
          gsub(/\xC2\xA0|\xC2\xAD/, "").
          gsub(/\(V$/, '(V)').
          gsub(/\($/, '').
          gsub(/\.$/, ':').
          gsub(/\s*…\s*$/, '').
          gsub(/\r?\n/, ' ').
          strip
      end

      def normalize_party(str)
        case str
        when 'Frp'
          'FrP'
        when 'Krf'
          'KrF'
        when 'Ap'
          'A'
        when 'uav', 'uavh'
          'Uavhengig'
        else
          str
        end
      end

      def normalize_title(str)
        case str
        when 'Satsråd', 'Stasråd', 'Stastråd', 'Statsråden', 'Statstråd'
          'Statsråd'
        else
          str
        end
      end

      def normalize_name(str)
        name = clean_text(str)
        @name_corrections[name] || name
      end

      DATE_EXP  = /:? ?[\[\(] *(\d{2}) *[:.] *(\d{2}) *[:.] *(\d{2}) *:?[\]\)].*?/
      PARTY_EXP = /\s*[\( ]\s*(SV|KrF|Krf|V|A|Ap|MDG|FrP|Frp|H|Sp|TF|uavh|uav|Kp)\s*[\) ]\s*?/

      def parse_name_string(str)
        result = Hashie::Mash.new
        orig = str
        str = clean_name_string(str)

        case str
        when "", ":"
          # ignored
        when /^(Statsminister|Statsråd|Statsråd|Stastråd|Stasråd|Satsråd|Statstråd|.+minister|.+president)(?:en)? (.+?)(?:#{DATE_EXP})?:?$/
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
        when /^(.+?)#{PARTY_EXP}:?([^:\[]{1,10})?$/
          result.name  = $1
          result.party = $2
          result.text = $3 && $3.strip
        when /^\s*presidenten:?\s*$/i
          result.name  = "Presidenten"
          result.title = "President"
        when /^([\w.æåøÆÅØ\- ]+?):?$/
          result.name = $1.strip
        else
          if str =~ /^#{PARTY_EXP}:?$/ && @last_section[:text].empty?
            result.party = normalize_party($1)

            if @last_section[:party] && @last_section[:party] != result.party
              raise ParseError.new("attempted to merge sections with different parties", @current_node)
            end

            result.time = Time.parse(@last_section[:time])
            result.name = @last_section[:name]
          elsif str =~ /^#{DATE_EXP}:?$/ && midnight?(@last_section[:time]) && @last_section[:text].empty?
            result.time  = create_time($1, $2, $3)
            result.party = @last_section[:party]
            result.name  = @last_section[:name]
          else
            raise ParseError.new(str, @current_node)
          end
        end

        if result.name =~ /\(|\)|\[|\]|#{PARTY_EXP}|#{DATE_EXP}/
          raise ParseError.new("invalid name: #{result.to_hash.inspect}", @current_node)
        end

        result.name  = normalize_name(result.name) if result.name
        result.party = party_for(result.name) if result.party.nil?

        if result.name == "Presidenten"
          result.title = "President"
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
        @name_to_party[name]
      end

      def midnight?(str)
        t = Time.parse(str)
        [t.hour, t.min, t.sec] == [0,0,0]
      end

    end

    class ParseError < StandardError
      attr_reader :node

      def initialize(str, node)
        @node = node
        super "could not parse name string from #{str.inspect} in #{node.to_s}"
      end
    end

  end
end
