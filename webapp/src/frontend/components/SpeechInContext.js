import React         from 'react';
import FluxComponent from 'flummox/component';
import Speech        from './Speech';
import { Link }      from 'react-router';
import Icon          from 'react-fa';

class SpeechBrowser extends React.Component {
    render() {
        let speeches = this.props.speeches;

        if (!speeches) {
            return null;
        }

        let first = speeches[0];
        let last  = speeches[speeches.length - 1];

        let prevLink = null, nextLink = null;

        if (first && first.order > 0) {
            prevLink = (
                <Link to="speech" params={{transcript: first.transcript, order: first.order}}>
                    <Icon name="step-backward" /> Forrige innlegg
                </Link>
            );
        }

        if (last) {
            nextLink = (
                <Link to="speech" params={{transcript: last.transcript, order: last.order}}>
                    <Icon name="step-forward" /> Neste innlegg
                </Link>
            );
        }

        let elements = this.props.speeches.map((speech, i) => {
            return (
                <div key={i} className={i === 1 ? 'highlight' : null}>
                    <Speech speech={speech} showContextLink={false} showTime={true} />
                </div>
            );
        });

        return (
            <div>
                <div className="pull-right">{nextLink}</div>
                <div>{prevLink}</div>

                {elements}
            </div>
        );
    }
}

class SpeechInContext extends React.Component {
    render() {
        return (
            <div className="container">
                <FluxComponent connectToStores={['speech']}>
                    <SpeechBrowser />
                </FluxComponent>

            </div>
        );
    }
}

module.exports = SpeechInContext;