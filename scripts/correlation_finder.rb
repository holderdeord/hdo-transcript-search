require 'gsl' # brew install gsl && gem install rb-gsl

class CorrelationFinder
  def initialize(opts = {})
    @options = {
      min: 0.85,
      flip: false,
      threshold: 5,
      min_length: 0,
      ignored_words: [
        'rotevatn', 'hansson', 'rasmus', 'sveinung',
        'breivik', 'kjenseth', 'dørum', 'bollestad',
        'sponheim', 'kvassheim', 'kersti', 'toppe',
        'evestuen', 'fylkesnes'
      ]
    }.merge(opts)
  end

  def top_correlations(size = 50)
    sorted = correlations.
      select { |e| e[:correlation].abs >= @options[:min] }.
      uniq { |e| e[:words] }.
      sort_by { |e| e[:correlation] }

    sorted.first(size / 2) + sorted.last(size / 2)
  end

  def correlations
    @correlations ||= (
      word_to_values = timelines.map { |w, tl| [w, tl.values] }

      word_to_values.flat_map do |word_left, values_left|
        word_to_values.map do |word_right, values_right|
          next if word_left == word_right
          next if ignored?(word_left) || ignored?(word_right)
          next if word_left.length < @options[:min_length] || word_right.length < @options[:min_length]
          next if (values_left.inject(&:+) <= @options[:threshold]) || (values_right.inject(&:+) <= @options[:threshold])
          next if (values_left.count { |v| v > 0 } < 2) || (values_right.count { |v| v > 0 } < 2)

          {
            words: [word_left, word_right].sort,
            correlation: correlation(values_left, values_right),
            euclidean_distance: euclidean_distance(values_left, values_right)
          }
        end.compact
      end.uniq
    )
  end

  private

  def ignored?(n)
    @options[:ignored_words].include?(n)
  end

  def euclidean_distance(left, right)
    Math.sqrt(left.zip(right).map { |x| (x[1] - x[0])**2 }.reduce(&:+))
  end

  def correlation(left, right)
    left = left.reverse if @options[:flip]

    GSL::Stats.correlation(GSL::Vector[left], GSL::Vector[right])
  end

  def timelines
    @timelines ||= (
      words.inject({}) do |res, word|
        timeline = st.timeline_for(word)

        result   = {}
        timestamps.each { |k| result[k] = timeline[k] || 0 }

        res[word] = result
        res
      end
    )
  end

  def words
    @words ||= st.get(50).reject { |e| e =~ /^\d+$/ }
  end

  def timestamps
    @timestamps ||= st.timeline_for('*').keys.sort[0..-2] # ignore 'current', incomplete data point
  end

  def st
    @st ||= SignificantTerms.new
  end
end