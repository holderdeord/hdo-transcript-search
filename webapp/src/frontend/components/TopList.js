import React from 'react';
import TranscriptStore from '../stores/TranscriptStore';

var {div,h3,ol,li} = React.DOM;

class TopList extends React.Component {

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
        var result = TranscriptStore.getResult();
        this.setState({counts: result[this.props.resultKey]});
    }

    render() {
        var counts   = this.state.counts;
        var elements = Object.keys(counts).map(function (k) {
            return li({key: k}, `${k}: ${counts[k]}`);
        });

        return div(
            null,
            h3(null, this.props.title),
            ol(null, elements)
        );
    }
}

TopList.propTypes = {
    title: React.PropTypes.string,
    key: React.PropTypes.string
};

module.exports = TopList;
