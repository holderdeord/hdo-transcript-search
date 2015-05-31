import React               from 'react';
import key                 from 'keymaster';

const INVALID_QUERY_CHARS = /[\.]/;

class SearchForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {query: this.props.joinedQuery};
        this.searchActions = props.flux.getActions('search');
    }

    reset() {
        this.setState({query: ''});
    }

    componentWillReceiveProps(props) {
        this.setState({query: props.joinedQuery});
    }

    componentDidMount() {
        key('/', this.handleFocus.bind(this));
    }

    componentWillUnmount() {
        key.unbind('/', this.handleFocus.bind(this));
    }

    render() {
        return (
            <div className="row" id="search-form">
                <div className="col-sm-6 col-sm-offset-3">
                    <div className="input-group">
                        <input
                            type="search"
                            className="form-control"
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
                                className="btn btn-primary"
                                value="Søk"
                                onClick={this.handleSearch.bind(this)}
                            />
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    renderResetButton() {
        return (
            <div className="col-sm-2 text-right">
                <input
                    type="button"
                    className="btn btn-default btn-lg"
                    value="Nullstill"
                    onClick={this.handleReset.bind(this)}
                />
            </div>
        );
    }

    handleSearch() {
        let query = this.state.query.trim().replace(INVALID_QUERY_CHARS, '');

        if (!query.length) {
            this.handleReset();
            return;
        }

        if (query === this.props.joinedQuery) {
            return;
        }

        let queries = query.split(/\s*,\s*/);

        this.searchActions.summary(queries, this.props.interval);
        this.searchActions.hits(queries[queries.length - 1]);
    }

    handleReset() {
        this.searchActions.reset();
    }

    handleQueryChange(event) {
        if (!event.target.value.length) {
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

SearchForm.propTypes = {
};

module.exports = SearchForm;
