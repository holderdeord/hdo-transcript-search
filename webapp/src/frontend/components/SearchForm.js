import React  from 'react';
import key    from 'keymaster';
import assign from 'react/lib/Object.assign';

const INVALID_QUERY_CHARS = /[\.]/;

class SearchForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: this.props.joinedQuery,
            lastReceivedQuery: null
        };
    }

    componentWillReceiveProps(props) {
        if (props.joinedQuery !== this.state.lastReceivedQuery) {
            this.setState({
                query: props.joinedQuery,
                lastReceivedQuery: props.joinedQuery
            });

        }
    }

    componentDidMount() {
        key('/', this.handleFocus.bind(this));
    }

    componentWillUnmount() {
        key.unbind('/', this.handleFocus.bind(this));
    }


    render() {
        return (
            <form className="row" id="search-form" onSubmit={this.handleSearch.bind(this)}>
                <div className="col-md-6 col-md-offset-3">
                    <div className="input-group focused" ref="searchBox">
                        <input
                            type="search"
                            className="form-control"
                            name="query"
                            ref="query"
                            autoFocus="true"
                            onFocus={this.setSearchBoxFocus.bind(this)}
                            onBlur={this.setSearchBoxFocus.bind(this)}
                            placeholder="Søk etter noe politikere har sagt"
                            tabIndex="0"
                            value={this.state.query}
                            onChange={this.handleQueryChange.bind(this)}
                        />

                        <span className="input-group-btn">
                            <input
                                type="submit"
                                className="btn btn-primary"
                                value="Søk"
                            />
                        </span>
                    </div>
                </div>
            </form>
        );
    }


    setSearchBoxFocus(event) {
        var searchbox = this.refs.searchBox.getDOMNode();
        if (event.type === "focus") {
            searchbox.classList.add("focused");
        } else if (event.type === "blur") {
            searchbox.classList.remove("focused");
        }
    }

    handleSearch(event) {
        event.preventDefault();

        let query = this.state.query.trim().replace(INVALID_QUERY_CHARS, '');

        if (!query.length) {
            this.handleReset();
            return;
        }

        if (query === this.props.joinedQuery) {
            return;
        }

        let queries = query.split(/\s*,\s*/);
        this.transitionToQueries(queries);
    }

    handleReset() {
        this.setState({query: ''}, () => this.transitionToQueries([]));
    }

    handleQueryChange(event) {
        let val = event.target.value;

        this.setState({query: val}, () => {
            if (!val.length) {
                this.handleReset();
            }
        });
    }

    handleFocus(event) {
        event.preventDefault();
        React.findDOMNode(this.refs.query).focus();
    }

    transitionToQueries(queries) {
        var name = 'blank';
        var queryPath = null;

        if (queries.length) {
            name = 'search';
            queryPath = queries.join('.');
        }

        let params = assign({}, this.props.params, {
            queries: queryPath,
            unit: this.props.params.unit || 'pct',
            focused: queries.length - 1
        });

        this.context.router.transitionTo(name, params);
    }
}

SearchForm.propTypes = {
};

SearchForm.contextTypes = {
    router: React.PropTypes.func
};

module.exports = SearchForm;
