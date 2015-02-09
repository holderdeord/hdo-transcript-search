import React from 'react';
import TranscriptStore from '../stores/TranscriptStore';

var {div,h3,ol,li} = React.DOM;

class TopParties extends React.Component {

    constructor(props) {
        super(props);
        this.state = {counts: {}};
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.onChange.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.onChange.bind(this));
    }

    onChange() {
        this.setState({counts: TranscriptStore.getResult().partyCounts});
    }

    render() {
        var counts   = this.state.counts;
        var elements = Object.keys(counts).map(function (k) {
            return li({key: k}, `${k}: ${counts[k]}`);
        });

        return div(
            null,
            h3(null, 'Partier'),
            ol(null, elements)
        );
    }
}

module.exports = TopParties;
