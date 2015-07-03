/*eslint-disable react/no-multi-comp */

import React, { PropTypes, Component } from 'react';
import FluxComponent        from 'flummox/component';
import Speech               from './Speech';
import { Link }             from 'react-router';
import Icon                 from 'react-fa';

class SpeechBrowser extends Component {
    static propTypes = { speeches: PropTypes.array };

    render() {
        let speeches = this.props.speeches;

        if (!speeches) {
            return null;
        }

        let [first, focused, last] = speeches;

        let prevLink = null, nextLink = null;

        if (first && first.order > 0) {
            prevLink = (
                <Link to="speech" params={{transcript: first.transcript, order: first.order}}>
                    <Icon name="chevron-left"/>

                    <strong>Forrige innlegg:</strong>

                    <span>
                        {first.name} {first.party ? `(${first.party})` : ''}
                    </span>
                </Link>
            );
        }

        if (last) {
            nextLink = (
                <Link to="speech" params={{transcript: last.transcript, order: last.order}}>
                    <strong>Neste innlegg:</strong>

                    <span>
                        {last.name} {last.party ? `(${last.party})` : ''}
                    </span>

                    <Icon name="chevron-right"/>
                </Link>
            );
        }

        return (
            <div className="container">
                <div className="row navigation-links">
                    <div className="col-xs-6 col-md-6">{prevLink}</div>
                    <div className="col-xs-6 col-md-6 text-right">{nextLink}</div>
                </div>

                <div className="row card" style={{margin: '1rem 0'}}>
                    <div className="col-md-12">
                        <Speech key={focused.id} speech={focused} showContextLink={false} showTime={true} />
                    </div>
                </div>

                <div className="row navigation-links">
                    <div className="col-xs-6 col-md-6">{prevLink}</div>
                    <div className="col-xs-6 col-md-6 text-right">{nextLink}</div>
                </div>
            </div>
        );
    }
}

export default class SpeechInContext extends Component {
    render() {
        return (
            <FluxComponent connectToStores={['speech']}>
                <SpeechBrowser />
            </FluxComponent>
        );
    }
}

module.exports = SpeechInContext;
