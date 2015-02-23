import React               from 'react';
import key                 from 'keymaster';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import TranscriptStore     from '../stores/TranscriptStore';
import ActionTypes         from '../constants/ActionTypes';

class SearchForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {query: ''};
    }

    reset() {
        this.setState({query: ''});
    }

    componentDidMount() {
        TranscriptStore.addChangeListener(this.handleChange.bind(this));
        key('/', this.handleFocus.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.handleChange.bind(this));
        key.unbind('/', this.handleFocus.bind(this));
    }

    render() {
        let buttonName  = this.props.queryType === 'single' ? 'Legg til ord' : 'Søk';

        return (
            <div className="row">
                <div className="col-sm-6 col-sm-offset-3">
                    <div className="input-group">
                        <input
                            type="search"
                            className="form-control input-lg"
                            name="query"
                            ref="query"
                            autoFocus="true"
                            placeholder="Søkeord"
                            tabIndex="0"
                            value={this.state.query}
                            onChange={this.handleQueryChange.bind(this)}
                            onKeyDown={this.handleKeyDown.bind(this)}
                        />

                        <span className="input-group-btn">
                            <input
                                type="button"
                                className="btn btn-primary btn-lg"
                                value={buttonName}
                                onClick={this.handleSearch.bind(this)}
                            />
                        </span>
                    </div>
                </div>

                <div className="col-sm-2 text-right">
                    <input
                        type="button"
                        className="btn btn-default btn-lg"
                        value="Nullstill"
                        onClick={this.handleReset.bind(this)}
                    />
                </div>
            </div>
        );
    }

    handleSearch() {
        let q = this.state.query.trim();

        if (!q.length) {
            this.handleReset();
            return;
        }

        if (this.props.queryType === 'single') {
            this.executeSingleQuerySearch(q);
        } else {
            this.executeMultiQuerySearch(q);
        }
    }

    executeSingleQuerySearch(query) {
        if (TranscriptStore.hasQuery(query)) {
            this.reset();
            return;
        }

        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SEARCH_ADD,
            query: query,
            interval: this.props.interval
        });
    }

    executeMultiQuerySearch(query) {
        if (query === TranscriptStore.getJoinedQuery()) {
            return;
        }

        let queries = query.split(/\s*,\s*/);

        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.SEARCH_MULTI,
            queries: queries,
            interval: this.props.interval
        });
    }

    handleChange() {
        if (this.props.queryType === 'single') {
            this.reset();
        } else {
            this.setState({query: TranscriptStore.getJoinedQuery()});
        }
    }

    handleReset() {
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.RESET
        });
    }

    handleQueryChange(event) {
        console.log(event.target.value);

        if (!event.target.value.length && this.props.queryType === 'multi') {
            this.handleReset();
        } else {
            this.setState({query: event.target.value});
        }
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
