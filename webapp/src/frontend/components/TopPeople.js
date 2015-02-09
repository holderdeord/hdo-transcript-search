import React from 'react';
import TranscriptStore from '../stores/TranscriptStore';

var {div,h3,ol,li} = React.DOM;

class TopPeople extends React.Component {

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
        this.setState({counts: TranscriptStore.getResult().peopleCounts});
    }

    render() {
        var counts = this.state.counts;
        var elements = Object.keys(counts).map(k => {
            return li({key: k}, `${k}: ${counts[k]}`);
        });

        return div(
            null,
            h3(null, 'Personer'),
            ol(null, elements)
        );
    }
}

module.exports = TopPeople;
