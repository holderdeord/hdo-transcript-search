import React from 'react';
import Icon  from 'react-fa';

class SharingLinks extends React.Component {
    render() {

        return (
            <div className="text-center" style={{padding: '0.5rem', fontSize: '2rem'}}>
                <span style={{padding: '0.8rem'}}>
                    <a href="#" onClick={this.handleFacebookShare.bind(this)}>
                        <Icon name="facebook" />
                    </a>
                </span>

                <span style={{paddingLeft: '0.8rem'}}>
                    <a href='#' onClick={this.handleTwitterShare.bind(this)}>
                        <Icon name="twitter" />
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
            text = `Se når politikerne snakker om «${this.props.joinedQuery}»`;
        } else {
            text = "Se hva politikerne snakker om på Stortinget";
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

SharingLinks.propTypes = {
    facebookAppId: React.PropTypes.string.isRequired
};

module.exports = SharingLinks;