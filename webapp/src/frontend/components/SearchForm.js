var React               = require('react');
var SearchAppDispatcher = require('../dispatcher/SearchAppDispatcher');
var TranscriptStore     = require('../stores/TranscriptStore');
var ActionTypes         = require('../constants/ActionTypes');

var div                 = React.DOM.div;
var input               = React.DOM.input;
var select              = React.DOM.select;
var option              = React.DOM.option;
var form                = React.DOM.form;

var SearchInput = React.createFactory(React.createClass({
    componentDidMount: function () {
        TranscriptStore.addChangeListener(this.onChange);
    },

    componentWillUnmount: function () {
        TranscriptStore.removeChangeListener(this.onChange);
    },

    onChange: function () {
        this.reset();
    },

    reset: function () {
        this.getDOMNode().value = '';
        this.getDOMNode().focus();
    },


    render: function () {
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
}));

var IntervalSelector = React.createFactory(React.createClass({
    getInitialState: function () {
        return { value: '24w' };
    },

    render: function () {
        return select({ className: 'form-control input-xs',
                        name: 'interval',
                        value: this.state.value,
                        onChange: this.handleChange
                      },
                      option({value: 'month'}, '1 måned'),
                      option({value: '12w'}, '3 måneder'),
                      option({value: '24w'}, '6 måneder'),
                      option({value: 'year'}, '1 år')
                     );
    },

    handleChange: function (e) {
        this.setState({value: e.target.value });
    }
}));

var Buttons = React.createFactory(React.createClass({
    render: function () {
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
    },

    emitReset: function () {
        SearchAppDispatcher.handleViewAction({
            type: ActionTypes.RESET
        });
    }
}));

module.exports = React.createClass({
    render: function () {
        return form({className: 'form-horizontal', onSubmit: this.handleSubmit},
                    div({className: 'row'},
                        div({className: 'col-md-8'}, SearchInput()),
                        div({className: 'col-md-2'}, IntervalSelector()),
                        div({className: 'col-md-2'}, Buttons())
                       )
                   );
    },

    handleSubmit: function (e) {
        e.preventDefault();
        var form = this.getDOMNode();

        if (form.query.value.trim().length) {
            SearchAppDispatcher.handleViewAction({
                type: ActionTypes.SEARCH,
                query: form.query.value,
                interval: form.interval.value
            });
        } else {
            SearchAppDispatcher.handleViewAction({type: ActionTypes.RESET });
        }
    }
});