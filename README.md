# hdo-transcript-search

[![Build Status](https://travis-ci.org/holderdeord/hdo-transcript-search.png?branch=master)](https://travis-ci.org/holderdeord/hdo-transcript-search)
[![Code Climate](https://codeclimate.com/github/holderdeord/hdo-transcript-search/badges/gpa.svg)](https://codeclimate.com/github/holderdeord/hdo-transcript-search)

Visualize language usage in the Norwegian parliament. See it in action at [tale.holderdeord.no](https://tale.holderdeord.no).

![image](https://cloud.githubusercontent.com/assets/572/8212260/fc7aab26-151a-11e5-87ca-63636abe06ee.png)

This project consists of two parts:

* `indexer/` - download and index Stortinget transcripts in ElasticSearch
* `webapp/`  - web frontend to present / visualize the data

## Requirements

* elasticsearch
* node.js
* ruby

## indexer

Download and index transcripts (requires a local elasticsearch):

    $ cd indexer/
    $ gem install bundler
    $ bundle install
    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer

Re-create the index. This is necessary when a mapping is changed:

    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer --create-index

Convert a single XML transcript to indexable JSON:

    $ bundle exec ruby -Ilib bin/hdo-transcript-converter transcript.xml

## webapp

Start the webapp in dev mode:

    $ cd webapp
    $ npm install
    $ npm run dev
    # open your browser at http://localhost:7575/

### Caveats

* Because of deficiencies in the transcripts, we don't know the correct time for all speeches. The "time" field will in these cases be set to midnight.
