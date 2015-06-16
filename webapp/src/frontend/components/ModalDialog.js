import React from 'react';
import key   from 'keymaster';

class ModalDialog extends React.Component {

    componentDidMount() {
        console.log('ModalDialog.componentDidMount');
    }


    componentDidMount() {
        key('esc', this.props.onClose);
    }

    componentWillUnmount() {
        key.unbind('esc', this.props.onClose);
    }

    render() {
        // a bootstrap modal

        return (
            <div className={`modal ${this.props.visible ? 'show' : ''}`}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button
                                type="button"
                                className="close"
                                onClick={this.props.onClose}>&#xD7;</button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ModalDialog.propTypes = {
    title: React.PropTypes.string.isRequired,
    visible: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired
};

module.exports = ModalDialog;
