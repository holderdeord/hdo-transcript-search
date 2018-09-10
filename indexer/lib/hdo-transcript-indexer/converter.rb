# -*- coding: utf-8 -*-
require 'time'
require 'set'
require 'hashie/mash'
require 'hdo/storting_importer'
require 'childprocess'
require 'pry'
ChildProcess.posix_spawn = true

module Hdo
  module Transcript
    class Converter
      class << self
        def parse(file, options = {})
          case file
          when /s(\d{2})(\d{2})(\d{2}).*\.xml$/i
            short_year = $1
            month      = $2.to_i
            day        = $3.to_i
            year       = (short_year.to_i > 50 ? "19#{short_year}" : "20#{short_year}").to_i

            new(read(file), Time.new(year, month, day), options)
          when /ref.+-(\d{4})(\d{2})-(\d{2})-(\d{2})\.xml$/
            session_start_year = $1
            session_end_year   = $2
            month              = $3
            day                = $4
            century            = session_start_year[/^\d{2}/]
            session_end_year   = "#{century}#{session_end_year}"

            if month.to_i <= 7
              year = session_end_year
            else
              year = session_start_year
            end

            new(read(file), Time.new(year, month, day), options)
          else
            raise "could not parse date from file name: #{file}"
          end
        end

        private

        def read(file)
          Nokogiri::XML.parse(File.read(file))
        end
      end

      PARTIES    = ["A", "Ap", "FrP", "Frp", "H", "Kp", "KrF", "Krf", "MDG", "SV", "Sp", "SP", "TF", "V", "uav", "uavh", "R"]
      DATE_EXP   = /:? ?[\[\(] *(\d{2}) *[:.] *(\d{2}) *[:.] *(\d{2}) *:?[\]\)].*?/
      PARTY_EXP  = /\s*[\( ]\s*(#{PARTIES.join('|')})\s*[\) ]\s*?/
      NER_SCRIPT = File.expand_path('../extract_entities.py', __FILE__)

      def initialize(doc, time, options = {})
        @time             = time
        @doc              = doc
        @current_node     = nil
        @last_section     = {}
        @name_to_party    = options[:cache] || {}
        @name_corrections = options[:names] || {}
        @ner              = !!options[:ner]
        @lix              = !!options[:lix]
        @errors           = Set.new

        session = Hdo::StortingImporter::Util.session_for_date(@time.to_date)
        @session = [session.begin.year, session.end.year].join('-')
      end

      def sections
        @doc.css('presinnl, innlegg, Presinnlegg, Hovedinnlegg, replikk, Replikk').
          map { |node| @last_section = parse_section(node) }.
          compact.
          reject { |e| e[:text].empty? }.
          map { |e| validate(e) }
      end

      def president_names
        @president_name ||= @doc.css('president, President').text.
          gsub(/president:?\s*/i, '').
          split(/\r?\n/).
          map(&:strip).
          uniq.
          select { |e| e.length > 0 }
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
        if section[:party].nil? && section[:title].nil? && section[:name].nil?
          @errors << {error: "name, party, title is missing", section: section}
        elsif section[:party].nil? && section[:title].nil?
          @errors << {error: "party and title is missing, but should be inferred from name #{section[:name]}", section: section}
        elsif section[:party].nil? && section[:name] != "Presidenten"
          @errors << {error: "party missing", name: section[:name], title: section[:title]}
        end

        section
      end

      def parse_section(node)
        @current_node = node

        section = case node.name.downcase
                  when 'innlegg', 'hovedinnlegg', 'replikk'
                    parse_speech(node)
                  when 'presinnl', 'presinnlegg'
                    parse_president_speech(node)
                  end

        if section
          section[:word_count] = word_count(section[:text])
          section[:language] = language_for(section[:text])

          if @ner
            section[:entities] = extract_entities(section)
          end

          if @lix
            section[:lix] = calculate_lix(section[:text])
          end
        end

        section
      end

      def text_from(node)
        text = []

        node.elements.each do |element|
          case element.name.downcase
          when 'a', 'merknad'
            text << element.text.gsub("\n", ' ').strip
          when 'navn', 'merknad'
            # ignored
          when 'blokksitat', 'sitat'
            text << text_from(element)
          when 'liste'
            text += element.css('pkt, Pkt').map { |e| e.text.gsub("\n", ' ').strip }
          when 'table'
            text += element.css('row, Row').map { |e| e.text.gsub("\n", ' ').strip }
          else
            raise "unknown element of: #{element}"
          end
        end

        text.join("\n")
      end

      def parse_speech(node)
        name_str = node.css('navn, Navn').text
        text     = clean_text(text_from(node))

        return if IGNORED_NAMES.include?(name_str)

        parsed = parse_name_string(name_str)

        # sometimes the name is entered as a separate but empty speech
        if parsed.name.nil? && parsed.party.nil?
          if @last_section[:name]
            parsed.name = @last_section[:name]
            parsed.party = @last_section[:party]
            parsed.title ||= @last_section[:title]
          elsif text =~ /^(Fra|Frå) representanten (.+?) til (.+?):\s*«(.+?)»/m
            parsed.name  = $2
            parsed.title = "Representant"
            text         = $4
            parsed.party = party_for(parsed.name)
          end
        end

        parsed.party = normalize_party(parsed.party)
        parsed.title = normalize_title(parsed.title)

        full_text = "#{parsed.text}#{text}".sub(clean_text(name_str).gsub(/\n/, ' '), '').strip

        {
          :name  => parsed.name ? parsed.name.strip : parsed.name,
          :party => parsed.party,
          :time  => parsed.time ? parsed.time.iso8601 : @time.iso8601,
          :text  => full_text,
          :title => parsed.title || (parsed.party ? 'Representant' : nil)
        }
      end

      def parse_president_speech(node)
        {
          :name  => "Presidenten",
          :party => nil,
          :text  => clean_text(node.text).sub(/^President(en)?:/, ''),
          :time  => @time.iso8601,
          :title => "President"
        }
      end

      def clean_text(str)
        str.
          gsub(/\n\s*/, "\n").
          gsub(/\s{2,}/, ' ').
          gsub("­", '').
          strip
      rescue ArgumentError => e
        clean_text(str.encode('UTF-8', invalid: :replace, undef: :replace, replace: ''))
      end

      def clean_name_string(str)
        str.
          gsub("[ [", "[").
          gsub("( [", "[").
          gsub("[[", "[").
          gsub("]]", "]").
          gsub(/[\[\(]?\s*(\d{2}):(\d{2}):_?(\d{2})\s*[\]\)]?/, '[\1:\2:\3]').
          gsub(" [klokkeslett mangler]", "").
          gsub(/^(\w)\så/, '\1å').
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
          gsub(/^(\w)\s(\w)/, '\1\2').
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
        when 'SP'
          'Sp'
        else
          str
        end
      end

      def normalize_title(str)
        case str
        when 'Satsråd', 'Stasråd', 'Stastråd', 'Statsråden', 'Statstråd'
          'Statsråd'
        when 'Statsministerer', 'Satsminister'
          'Statsminister'
        when 'Representanten'
          'Representant'
        when 'Stortingspresident'
          'President'
        when 'Stortingets visepresident', 'Første visepresident'
          'Visepresident'
        else
          str
        end
      end

      def normalize_name(str)
        name = clean_text(str)
        @name_corrections[name] || name
      end

      def parse_name_string(str)
        result = Hashie::Mash.new
        orig = str
        str = clean_name_string(str)

        case str
        when "", ":"
          # ignored
        when /Fung(erende|\.|:) leder:?/
          result.name = "Fungerende leder"
          result.party = nil
        when /^(Representanten|Statsminister|Statsministerer|Statsråd|Statsråd|Stastråd|Stasråd|Satsråd|Statstråd|.+minister|.+president)(?:en)? (.+?)(?:#{DATE_EXP})?:?$/
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

        if result.name =~ /\(|\)|\[|\]|#{DATE_EXP}|#{PARTY_EXP}/
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

      def extract_entities(section)
        r, w = IO.pipe

        process = ChildProcess.build("python", NER_SCRIPT)
        process.duplex = true

        process.io.stdout = process.io.stderr = w
        process.start
        w.close

        process.io.stdin.puts section[:text]
        process.io.stdin.close
        data = r.read

        process.wait

        if process.crashed?
          raise "could not extract entities: #{data}"
        end

        entities = JSON.parse(data)

        counts = Hash.new(0)
        grouped = Hash.new { |hash, type| hash[type] = [] }

        entities.each do |e|
          counts[e['text']] += 1
          grouped[e['type']] << e
        end

        entities.each do |e|
          e['mentions'] = counts[e['text']]
        end

        {
          people: grouped['person'].uniq.map { |e| e['text'] },
          organisations: grouped['organisation'].uniq.map { |e| e['text'] },
          locations: grouped['location'].uniq.map { |e| e['text'] }
        }
      end

      def word_count(str)
        TextUtils.word_count(str)
      end

      def language_for(str)
        TextUtils.language_for(str)
      end

      def calculate_lix(str)
        TextUtils.lix(str)
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
