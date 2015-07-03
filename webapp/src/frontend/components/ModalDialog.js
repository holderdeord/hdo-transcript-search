import React, { PropTypes, Component } from 'react';
import key   from 'keymaster';

export default class ModalDialog extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        visible: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        children: PropTypes.array
    };

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

