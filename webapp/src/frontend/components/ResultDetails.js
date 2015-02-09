import React from 'react';

var TopHits = React.createFactory(require('./TopHits'));
var TopList = React.createFactory(require('./TopList'));

var div        = React.DOM.div;

class ResultDetails {
    render() {
        return div({className: 'row'},
                   div({className: 'col-md-3'}, TopList({title: 'Personer', resultKey: 'peopleCounts'})),
                   div({className: 'col-md-2'}, TopList({title: 'Partier', resultKey: 'partyCounts'})),
                   div({className: 'col-md-7'}, TopHits())
                  );
    }
}

module.exports = ResultDetails;
