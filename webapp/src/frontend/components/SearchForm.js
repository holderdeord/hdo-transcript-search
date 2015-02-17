import React               from 'react';
import keymaster           from 'keymaster';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import TranscriptStore     from '../stores/TranscriptStore';
import ActionTypes         from '../constants/ActionTypes';

var {div,input,span} = React.DOM;

class SearchForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {interval: '24w', query: ''};
    }

    reset() {
        this.setState({query: ''});
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.reset.bind(this));
        keymaster('/', this.handleFocus.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.reset.bind(this));
        keymaster.unbind('/', this.handleFocus.bind(this));
    }

    render() {
        return div({className: 'form-horizontal'},
                   div({className: 'row'},
                       div({className: 'col-md-9'}, this.renderSearchInput()),
                       div({className: 'col-md-3'}, this.renderButtons())
                      )
                  );
    }

    renderSearchInput() {
        return input({
            type: 'search',
            className: 'form-control input-lg',
            name: 'query',
            ref: 'query',
            autoFocus: true,
            placeholder: 'Søk',
            tabIndex: 0,
            value: this.state.query,
            onChange: this.handleQueryChange.bind(this),
            onKeyDown: this.handleKeyDown.bind(this)
        });
    }

    renderButtons() {
        return div(
            null,
            span(
                {},
                input({
                    type: 'button',
                    className: 'btn btn-primary btn-lg',
                    value: 'Legg til ord',
                    onClick: this.handleSearch.bind(this)
                })),
            span(
                {style: {paddingLeft: '1rem'}}, // resignation!
                input({
                    type: 'button',
                    className: 'btn btn-default btn-lg',
                    value: 'Nullstill',
                    onClick: this.handleReset.bind(this)
                }))
        );
    }

    handleSearch() {
        if (this.state.query.trim().length) {
            SearchAppDispatcher.handleViewAction({
                type: ActionTypes.SEARCH,
                query: this.state.query,
                interval: this.state.interval
            });
        } else {
            this.handleReset();
        }
    }

    handleReset() {
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.RESET
        });
    }

    handleIntervalChange(event) {
        this.setState({interval: event.target.value});
    }

    handleQueryChange(event) {
        this.setState({query: event.target.value});
    }

    handleKeyDown(event) {
        if (event.keyCode === 13) {
            this.handleSearch();
        }
    }

    handleFocus(event) {
        event.preventDefault();
        React.findDOMNode(this.refs.query).focus();
    }
}

module.exports = SearchForm;
