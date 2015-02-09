import React from 'react';
import SearchAppDispatcher from '../dispatcher/SearchAppDispatcher';
import TranscriptStore     from '../stores/TranscriptStore';
import ActionTypes         from '../constants/ActionTypes';

var {div,input,select,option,form} = React.DOM;

class SearchInput extends React.Component {
    componentDidMount() {
        TranscriptStore.addChangeListener(this.reset.bind(this));
    }

    componentWillUnmount() {
        TranscriptStore.removeChangeListener(this.reset.bind(this));
    }

    reset() {
        var node = this.refs.query.getDOMNode();

        node.value = '';
        node.focus();
    }

    render() {
        return input({
            type: 'search',
            className: 'form-control input-lg',
            name: 'query',
            ref: 'query',
            autoFocus: true,
            placeholder: 'Ord eller eksakt frase',
            tabIndex: 0
        });
    }
}

class IntervalSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return select({ className: 'form-control input-xs',
                        name: 'interval',
                        defaultValue: this.props.initialInterval,
                        onChange: this.handleChange
                      },
                      option({value: 'month'}, '1 måned'),
                      option({value: '12w'}, '3 måneder'),
                      option({value: '24w'}, '6 måneder'),
                      option({value: 'year'}, '1 år')
                     );
    }

    handleChange(e) {
        this.setState({value: e.target.value });
    }
}

class Buttons extends React.Component {
    render() {
        return div({},
                   input({
                       type: 'submit',
                       className: 'btn btn-default btn-sm',
                       value: 'Legg til ord'
                   }),
                   input({
                       type: 'button',
                       className: 'btn btn-default btn-sm',
                       value: 'Nullstill',
                       onClick: this.emitReset
                   })
                  );
    }

    emitReset() {
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.RESET
        });
    }
}

class SearchForm extends React.Component {
    render() {
        return form({className: 'form-horizontal', onSubmit: this.handleSubmit.bind(this), ref: 'form'},
                    div({className: 'row'},
                        div({className: 'col-md-8'}, React.createFactory(SearchInput)()),
                        div({className: 'col-md-2'}, React.createFactory(IntervalSelector)({initialInterval: '24w'})),
                        div({className: 'col-md-2'}, React.createFactory(Buttons)())
                       )
                   );
    }

    handleSubmit(e) {
        e.preventDefault();
        var form = this.refs.form.getDOMNode();

        if (form.query.value.trim().length) {
            SearchAppDispatcher.handleViewAction({
                type: ActionTypes.SEARCH,
                query: form.query.value,
                interval: form.interval.value
            });
        } else {
            SearchAppDispatcher.handleViewAction({type: ActionTypes.RESET});
        }
    }
}

module.exports = SearchForm;
