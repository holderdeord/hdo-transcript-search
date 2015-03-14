import React               from 'react';
import key                 from 'keymaster';

const INVALID_QUERY_CHARS = /[\.]/;

class SearchForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {query: this.props.joinedQuery};
    }

    reset() {
        this.setState({query: ''});
    }

    componentWillReceiveProps(props) {
        this.setState({query: props.joinedQuery});
    }

    componentDidMount() {
        // this.searchStore.addListener('change', this.handleChange.bind(this));
        key('/', this.handleFocus.bind(this));
    }

    componentWillUnmount() {
        // this.searchStore.addListener('change', this.handleChange.bind(this));
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

                {this.props.queryType === 'single' && this.renderResetButton()}
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
        let q = this.state.query.trim().replace(INVALID_QUERY_CHARS, '');

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
        if (this.searchStore.hasQuery(query)) {
            this.reset();
            return;
        }

        this.props.flux.getActions('search').searchAdd(query, this.props.interval);
    }

    executeMultiQuerySearch(query) {
        if (query === this.props.joinedQuery) {
            return;
        }

        let queries = query.split(/\s*,\s*/);

        this.props.flux.getActions('search').searchMulti(queries, this.props.interval);
    }

    handleReset() {
        this.props.flux.getActions('search').reset();
    }

    handleQueryChange(event) {
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

SearchForm.propTypes = {
};

module.exports = SearchForm;
