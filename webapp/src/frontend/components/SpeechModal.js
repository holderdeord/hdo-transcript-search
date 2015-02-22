import React              from 'react';
import CurrentSpeechStore from '../stores/CurrentSpeechStore';
import ModalDialog        from './ModalDialog';
import TimeUtils          from '../utils/TimeUtils';

class SpeechModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.updateStateFromStore();
    }

    componentDidMount() {
        CurrentSpeechStore.addChangeListener(this.onChange.bind(this));
    }

    componentWillUnmount() {
        CurrentSpeechStore.removeChangeListener(this.onChange.bind(this));
    }

    onChange() {
        this.setState(this.updateStateFromStore());
    }

    updateStateFromStore() {
        let hits = CurrentSpeechStore.get();
        let visible = hits.length > 0;
        let title = visible ? `Innlegg i kontekst: ${TimeUtils.formatHitDate(hits[0])}` : '';

        return {
            title: title,
            hits: hits,
            visible: visible
        };
    }

    render() {
        return (
            <ModalDialog
                title={this.state.title}
                visible={this.state.visible}
                onClose={this.handleClose.bind(this)}>
                    {this.state.hits.map(this.renderHit.bind(this))}
            </ModalDialog>
        );
    }

    handleClose() {
        this.setState({hits: [], visible: false});
    }

    renderHit(hit, index) {
        let text = hit.text;
        let time = TimeUtils.formatHitTime(hit);

        if (index === Math.floor(this.state.hits.length / 2)) {
            text = <mark>{hit.text}</mark>;
        }

        return (
            <div className="row hit" key={index}>
                <div className="col-md-2">
                    <div>{hit.name} {(hit.party ? `(${hit.party})` : '')}</div>
                    <small>{time}</small>
                </div>

                <div className="col-md-10" style={{fontSize: '0.8em'}}>
                    {text}
                </div>
            </div>
        );
    }
}

module.exports = SpeechModal;
