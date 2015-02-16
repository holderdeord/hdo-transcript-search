import React from 'react';

var TopHits      = React.createFactory(require('./TopHits'));
var TopListChart = React.createFactory(require('./TopListChart'));

var {div,hr} = React.DOM;

class ResultDetails extends React.Component {
    constructor(props) {
        super(props);

        this.styles = {
            hidden: {display: 'none'},
            visible: {display: 'block'}
        };
    }

    render() {
        return div(
            {style: this.props.query.length ? this.styles.visible : this.styles.hidden},
            div(
                {className: 'row result-details'},
                div({className: 'col-md-6'}, TopListChart({title: 'Personer', counts: this.props.result.people})),
                div({className: 'col-md-6'}, TopListChart({title: 'Partier', counts: this.props.result.parties}))
            ),
            hr(),
            div(
                {className: 'row'},
                TopHits({query: this.props.query, result: this.props.result})
            )
        );
    }
}

module.exports = ResultDetails;
