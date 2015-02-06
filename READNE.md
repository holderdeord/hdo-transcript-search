# hdo-transcript-viz

This project consists of two parts:

* `indexer/` - download and index Stortinget transcripts in ElasticSearch
* `webapp/`  - web frontend to present / visualize the data

## indexer

Download and index transcripts:

    $ cd indexer/
    $ bundle install
    $ bundle exec ruby -Ilib bin/hdo-transcript-indexer --help

## webapp

Start the webapp in dev mode:

    $ cd webapp
    $ npm install
    $ npm run dev
    # open your browser at http://localhost:7575/
