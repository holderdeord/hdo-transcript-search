# hdo-transcript-search [![Build Status](https://travis-ci.org/holderdeord/hdo-transcript-search.png?branch=master)](https://travis-ci.org/holderdeord/hdo-transcript-search)

Visualize language usage in the Norwegian parliament.

![image](https://cloud.githubusercontent.com/assets/572/6088832/f9052628-ae5a-11e4-9a26-d78e36b23a9d.png)


This project consists of two parts:

* `indexer/` - download and index Stortinget transcripts in ElasticSearch
* `webapp/`  - web frontend to present / visualize the data

## indexer

Download and index transcripts (requires a local elasticsearch):

    $ cd indexer/
    $ bundle install
    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer 

## webapp

Start the webapp in dev mode (with elasticsearch):

    $ cd webapp
    $ npm install
    $ npm run dev
    # open your browser at http://localhost:7575/

If you don't have elasticsearch, you can run the app with fake data:

    $ fake=true npm run dev
