import React, { Component, PropTypes } from 'react';

import Header        from './Header';
import SharingLinks  from './SharingLinks';
import Footer        from './Footer';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.object
        // could be array
    }

    constructor(...args) {
        super(...args);

        this.state = {
            title: document.body.getAttribute('data-title'),
            desc: document.body.getAttribute('data-description'),
            fbId: document.body.getAttribute('data-facebook-app-id')
        };
    }

    render() {
        return (
            <div>
                <Header title={this.state.title} description={this.state.desc}>
                    <SharingLinks facebookAppId={this.state.fbId} />
                </Header>

                {this.props.children}

                <Footer/>
            </div>
        );
    }
}

