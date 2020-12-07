FROM ruby:2.6

WORKDIR /code
RUN gem install bundler
ADD Gemfile /code/Gemfile
ADD Gemfile.lock /code/Gemfile.lock
RUN bundle install
ADD . /code
