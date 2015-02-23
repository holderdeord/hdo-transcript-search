module Hdo
  module Transcript
    class Cache

      extend Forwardable
      def_delegators :@cache, :[], :[]=, :size, :merge!, :fetch, :empty?, :any?

      def initialize(path)
        @path  = path.to_s
        @cache = {}
      end

      def load
        @cache.merge! JSON.parse(File.read(@path))
      end

      def load_if_exists
        load if File.exist?(@path)
      end

      def save
        File.open(@path, 'w') { |io| io << @cache.to_json }
      end

    end
  end
end
