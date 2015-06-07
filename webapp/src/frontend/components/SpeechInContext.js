import React           from 'react';
import FluxComponent   from 'flummox/component';
import Speech          from './Speech';
import { Link }        from 'react-router';
import Icon            from 'react-fa';

const TransitionGroup = React.addons.CSSTransitionGroup;

class SpeechBrowser extends React.Component {
    render() {
        let speeches = this.props.speeches;

        if (!speeches) {
            return null;
        }

        let [first,focused,last] = speeches;

        let prevLink = null, nextLink = null;

        if (first && first.order > 0) {
            prevLink = (
                <Link to="speech" params={{transcript: first.transcript, order: first.order}}>
                    <Icon name="chevron-left" size="1x" />
                    <span style={{padding: '1rem'}}><strong>Forrige innlegg:</strong> {first.name} {first.party ? `(${first.party})` : ''}</span>
                </Link>
            );
        }

        if (last) {
            nextLink = (
                <Link to="speech" params={{transcript: last.transcript, order: last.order}}>
                    <span style={{padding: '1rem'}}><strong>Neste innlegg:</strong> {last.name} {last.party ? `(${last.party})` : ''}</span>
                    <Icon name="chevron-right" size="1x" />
                </Link>
            );
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-6 col-md-6">{prevLink}</div>
                    <div className="col-xs-6 col-md-6 text-right">{nextLink}</div>
                </div>

                <div className="row card" style={{marginTop: '1rem'}}>
                    <div className="col-md-12">
                        <Speech key={speeches[1].id} speech={speeches[1]} showContextLink={false} showTime={true} />
                    </div>
                </div>
            </div>
        );
    }
}

class SpeechInContext extends React.Component {
    render() {
        return (
            <FluxComponent connectToStores={['speech']}>
                <SpeechBrowser />
            </FluxComponent>
        );
    }
}

module.exports = SpeechInContext;