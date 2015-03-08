import React from 'react';

class SharingLinks extends React.Component {
    constructor(props) {
        this.searchStore = props.flux.getStore('search');
    }

    render() {

        return (
            <div className="text-center" style={{padding: '2rem'}}>
                <span style={{padding: '0.8rem'}}>
                    <a href="#" onClick={this.handleFacebookShare.bind(this)}>
                        <small>Facebook</small>
                    </a>
                </span>

                &middot;

                <span style={{paddingLeft: '0.8rem'}}>
                    <a href='#' onClick={this.handleTwitterShare.bind(this)}>
                        <small>Twitter</small>
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

        let query = this.searchStore.getJoinedQuery();

        let text = `Se når politikerne snakker om «${query}»`;

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