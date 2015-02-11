import React from 'react';

var TopHits      = React.createFactory(require('./TopHits'));
var TopListChart = React.createFactory(require('./TopListChart'));

var {div,hr} = React.DOM;

class ResultDetails {
    render() {
        return div(
            null,
            div({className: 'row'},
                div({className: 'col-md-6'}, TopListChart({title: 'Personer', resultKey: 'peopleCounts'})),
                div({className: 'col-md-6'}, TopListChart({title: 'Partier', resultKey: 'partyCounts'}))
               ),
            hr(),
            div({className: 'row'}, TopHits())
        );
    }
}

module.exports = ResultDetails;
