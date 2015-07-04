import React, { PropTypes, Component } from 'react';
import Icon  from 'react-fa';

export default class SharingLinks extends Component {

    static propTypes = {
        facebookAppId: PropTypes.string.isRequired,
        joinedQuery: PropTypes.string
    };

    render() {
        return (
            <div className="sharing-links text-center hidden-xs">
                <span>
                    <a href="#" onClick={::this.handleFacebookShare}>
                        <Icon name="facebook-square" size="2x" />
                    </a>
                </span>

                <span>
                    <a href="#" onClick={::this.handleTwitterShare}>
                        <Icon name="twitter-square" size="2x" />
                    </a>
                </span>
            </div>
        );
    }

    handleFacebookShare(event) {
        event.preventDefault();

        let shareUrl = `https://www.facebook.com/dialog/share
                               ?app_id=${this.props.facebookAppId}
                               &display=popup
                               &redirect_uri=${this.getUrl()}
                               &href=${this.getUrl()}`.replace(/\s+/g, '');

        this.open(shareUrl, 'Facebook');
    }

    handleTwitterShare(event) {
        event.preventDefault();

        let text;

        if (this.props.joinedQuery.length) {
            text = `Hvem snakker mest om «${this.props.joinedQuery}» på Stortinget?`;
        } else {
            text = 'Hva snakker politikerne om på Stortinget?';
        }

        let shareUrl = `https://twitter.com/intent/tweet
                            ?text=${encodeURIComponent(text)}
                            &url=${this.getUrl()}
                            &via=holderdeord`.replace(/\s+/g, '');

        this.open(shareUrl, 'Twitter');
    }

    open(url, title) {
        let w       = 600;
        let h       = 400;

        let left = (window.screen.width / 2) - (w / 2);
        let top = (window.screen.height / 2) - (h / 2);

        window.open(url, title, `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0`);
    }

    getUrl() {
        return encodeURIComponent(window.location.toString());
    }
}
