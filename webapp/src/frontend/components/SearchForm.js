import React, { PropTypes, Component }  from 'react';
import key    from 'keymaster';
import { connect } from 'redux/react';

const INVALID_QUERY_CHARS = /[\.]/;

@connect(({summary: {joinedQuery}}) => ({joinedQuery}))
export default class SearchForm extends Component {

    static propTypes = {
        joinedQuery: PropTypes.string,
        params: PropTypes.shape({
            unit: PropTypes.string
        })
    };

    static contextTypes = {
        router: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            query: this.props.joinedQuery,
            lastReceivedQuery: null,
            focused: true
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
        key('/', ::this.handleFocusKey);
    }

    componentWillUnmount() {
        key.unbind('/', ::this.handleFocusKey);
    }

    render() {
        return (
            <form className="row" id="search-form" onSubmit={::this.handleSearch}>
                <div className="col-md-6 col-md-offset-3">
                    <div className={`input-group ${this.state.focused ? 'focused' : ''}`}>
                        <input
                            type="search"
                            className="form-control"
                            name="query"
                            ref="query"
                            autoFocus="true"
                            onFocus={::this.handleFocus}
                            onBlur={::this.handleBlur}
                            placeholder="Søk etter noe politikere har sagt"
                            tabIndex="0"
                            value={this.state.query}
                            onChange={::this.handleQueryChange}
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

    handleFocus() {
        this.setState({focused: true});
    }

    handleBlur() {
        this.setState({focused: false});
    }

    handleFocusKey(e) {
        if (!this.state.focused) {
            e.preventDefault();
            React.findDOMNode(this.refs.query).focus();
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

    transitionToQueries(queries) {
        let unit = this.props.params.unit || 'pct';
        let focused = queries.length - 1;

        if (queries.length) {
            let queryPath = queries.join('.');
            this.context.router.transitionTo(`/search/${unit}/${queryPath}/${focused}`);
        } else {
            this.context.router.transitionTo('/search');
        }
    }
}
