import React          from 'react';
import FluxComponent  from 'flummox/component';
import {RouteHandler} from 'react-router';

import Header        from './Header';
import SharingLinks  from './SharingLinks';
import Footer        from './Footer';

class App extends React.Component {
    constructor() {
        this.state = {
            title: document.body.getAttribute('data-title'),
            desc: document.body.getAttribute('data-description'),
            fbId: document.body.getAttribute('data-facebook-app-id')
        };
    }

    componentDidMount() {
        console.log('App.componentDidMount');
    }

    render() {
        return (
            <div>
                <Header title={this.state.title} description={this.state.desc}>
                    <FluxComponent connectToStores={['summary']}>
                        <SharingLinks facebookAppId={this.state.fbId} />
                    </FluxComponent>
                </Header>

                <RouteHandler />

                <Footer/>
            </div>
        );
    }
}

module.exports = App;
