import React, { PropTypes, Component } from 'react';
import Speech from './Speech';
import { Link } from 'react-router';
import { connect } from 'react-redux';

@connect(({ speech: { speeches } }) => ({ speeches }))
class SpeechBrowser extends Component {
    static propTypes = { speeches: PropTypes.array };

    render() {
        let speeches = this.props.speeches;

        if (!speeches.length) {
            return null;
        }

        let [first, focused, last] = speeches;

        let prevLink = null,
            nextLink = null;

        if (first && first.order > 0) {
            prevLink = (
                <Link to={`/speeches/${first.transcript}/${first.order}`}>
                    <i className="fa fa-chevron-left" />

                    <strong>Forrige innlegg:</strong>

                    <span>
                        {first.name} {first.party ? `(${first.party})` : ''}
                    </span>
                </Link>
            );
        }

        if (last) {
            nextLink = (
                <Link to={`/speeches/${last.transcript}/${last.order}`}>
                    <strong>Neste innlegg:</strong>

                    <span>
                        {last.name} {last.party ? `(${last.party})` : ''}
                    </span>

                    <i className="fa fa-chevron-right" />
                </Link>
            );
        }

        return (
            <div className="container">
                <div className="row navigation-links">
                    <div className="col-xs-6 col-md-6">{prevLink}</div>
                    <div className="col-xs-6 col-md-6 text-right">
                        {nextLink}
                    </div>
                </div>

                <div className="row card" style={{ margin: '1rem 0' }}>
                    <div className="col-md-12">
                        <Speech
                            key={focused.id}
                            speech={focused}
                            showContextLink={false}
                            showTime={true}
                        />
                    </div>
                </div>

                <div className="row navigation-links">
                    <div className="col-xs-6 col-md-6">{prevLink}</div>
                    <div className="col-xs-6 col-md-6 text-right">
                        {nextLink}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SpeechBrowser;
