# hdo-transcript-search

[![Build Status](https://travis-ci.org/holderdeord/hdo-transcript-search.png?branch=master)](https://travis-ci.org/holderdeord/hdo-transcript-search)
[![Code Climate](https://codeclimate.com/github/holderdeord/hdo-transcript-search/badges/gpa.svg)](https://codeclimate.com/github/holderdeord/hdo-transcript-search)

Visualize language usage in the Norwegian parliament.

![image](https://cloud.githubusercontent.com/assets/572/6088832/f9052628-ae5a-11e4-9a26-d78e36b23a9d.png)

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
    $ bundle install
    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer

Convert a single XML transcript to indexable JSON:

    $ bundle exec ruby -Ilib bin/hdo-transcript-converter transcript.xml

## webapp

Start the webapp in dev mode (with elasticsearch):

    $ cd webapp
    $ npm install
    $ npm run dev
    # open your browser at http://localhost:7575/

### Caveats

* Because of deficiencies in the transcripts, we don't know the correct time for all speeches. The "time" field will in these cases be set to midnight.
