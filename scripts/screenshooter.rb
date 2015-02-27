# brew install imagemagick
# gem install watir-webriver

require 'watir-webdriver'

class Screenshooter
  def initialize(opts = {})
    @w = Watir::Browser.new :firefox
    @w.goto "http://localhost:7575/"
    @w.button(value: opts[:unit] || '#').when_present.click

    at_exit { @w.quit }
  end

  def snap(query, path, opts = {})
    query_field.set query
    query_field.send_keys :return

    wait_for_query query
    @w.screenshot.save path

    if opts[:label]
      annotate(path, opts[:label])
    end
  end

  def stitch(paths, out)
    ok = system "convert", "-sharpen", "0,1.05", "-scale", "60%", "-quality", "60", *paths, out
    ok or raise "could not stitch images"
  end

  private

  def annotate(path, label)
    ok = system "convert", path, "-pointsize", "32", "-draw", "text 400,60 '#{label}'", path
    ok or raise "could not add label"
  end

  def wait_for_query(query)
    @w.wait_until { labels == query }
  end

  def query_field
    @w.text_field(name: 'query')
  end

  def labels
    @w.element(css: '.timeline .lead').text
  end
end