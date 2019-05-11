module Hdo
  module Transcript
    class Cache

      extend Forwardable
      def_delegators :@cache, :[], :[]=, :size, :merge!, :fetch, :empty?, :any?, :keys

      TTL_IN_DAYS = 30

      def initialize(path)
        @path  = path.to_s
        @cache = {}
      end

      def load
        @cache.merge! JSON.parse(File.read(@path))
      end

      def load_if_exists
        if File.exist?(@path) && ((Time.now - File.mtime(@path)) / 60 / 60 / 24) <= TTL_IN_DAYS
          load
        end
      end

      def save
        File.open(@path, 'w') { |io| io << @cache.to_json }
      end

    end
  end
end
