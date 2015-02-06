# hdo-transcript-search

Visualize language usage in the Norwegian parliament.

This project consists of two parts:

* `indexer/` - download and index Stortinget transcripts in ElasticSearch
* `webapp/`  - web frontend to present / visualize the data

## indexer

Download and index transcripts (requires a local elasticsearch):

    $ cd indexer/
    $ bundle install
    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer --help

## webapp

Start the webapp in dev mode (with elasticsearch):

    $ cd webapp
    $ npm install
    $ npm run dev
    # open your browser at http://localhost:7575/

If you don't have elasticsearch, you can run the app with fake data:

    $ fake=true npm run dev
