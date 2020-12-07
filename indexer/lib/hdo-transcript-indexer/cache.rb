module Hdo
  module Transcript
    class Cache

      extend Forwardable
      def_delegators :@cache, :[], :[]=, :size, :merge!, :fetch, :empty?, :any?, :keys

      def initialize(path, options = {})
        @path  = path.to_s
        @cache = {}
        @ttl_in_days = options[:ttl_in_days]
      end

      def load
        @cache.merge! JSON.parse(File.read(@path))
      end

      def load_if_exists
        if File.exist?(@path) && !expired?
          load
        end
      end

      def save
        File.open(@path, 'w') { |io| io << @cache.to_json }
      end

      def expired?
        @ttl_in_days && ((Time.now - File.mtime(@path)) / 60 / 60 / 24) >= @ttl_in_days
      end
    end
  end
end
