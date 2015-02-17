import React               from 'react';
import keymaster           from 'keymaster';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import TranscriptStore     from '../stores/TranscriptStore';
import ActionTypes         from '../constants/ActionTypes';

var {div,input,select,option,label} = React.DOM;

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
                       div({className: 'col-md-8'}, this.renderSearchInput()),
                       div({className: 'col-md-2'}, this.renderIntervalSelect()),
                       div({className: 'col-md-2'}, this.renderButtons())
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

    renderIntervalSelect() {
        return select(
            { className: 'form-control input-xs',
              name: 'interval',
              value: this.state.interval,
              onChange: this.handleIntervalChange.bind(this)
            },
            option({value: 'month'}, '1 måned'),
            option({value: '12w'}, '3 måneder'),
            option({value: '24w'}, '6 måneder'),
            option({value: 'year'}, '1 år')
        );
    }

    renderButtons() {
        return div(
            {className: 'form-group'},
            input({
                type: 'button',
                className: 'btn btn-default btn-sm',
                value: 'Nullstill',
                onClick: this.handleReset.bind(this)
            }),
            label({className: 'radio'},
                 input({
                     type: 'radio',
                     value: 'pct',
                     name: 'unit-pct',
                     checked: this.props.unit === 'pct',
                     onChange: this.props.onUnitChange
                 }), 'Prosent'),
            label({className: 'radio'},
                 input({
                     type: 'radio',
                     value: 'count',
                     name: 'unit-count',
                     checked: this.props.unit === 'count',
                     onChange: this.props.onUnitChange
                 }), 'Antall')
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

SearchForm.propTypes = {
    onUnitChange: React.PropTypes.func.isRequired,
    unit: React.PropTypes.string.isRequired
};

module.exports = SearchForm;
