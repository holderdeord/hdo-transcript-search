import React from 'react';
import key from 'keymaster';

var {div,button,h4} = React.DOM;

class ModalDialog extends React.Component {

    componentDidMount() {
        key('esc', this.props.onClose);
    }

    componentWillUnmount() {
        key.unbind('esc', this.props.onClose);
    }

    render() {
        // a bootstrap modal
        return div(
            {className: `modal ${this.props.visible ? 'show' : ''}`},
            div(
                {className: 'modal-dialog'},
                div(
                    {className: 'modal-content'},
                    this.renderHeader(),
                    this.renderBody()
                )
            )
        );
    }

    renderHeader() {
        return div(
            {className: 'modal-header'},
            button({type: 'button', className: 'close', onClick: this.props.onClose}, '\u00d7'),
            h4({className: 'modal-title'}, this.props.title)
        );
    }

    renderBody() {
        return div(
            {className: 'modal-body'},
            this.props.children
        );
    }
}

ModalDialog.propTypes = {
    title: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired
};

module.exports = ModalDialog;
