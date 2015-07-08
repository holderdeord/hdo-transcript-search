import React, { Component, PropTypes } from 'react';

import Header from './Header';
import SharingLinks from './SharingLinks';
import Footer from './Footer';
import titleSuffix from '../constants/titleSuffix';
import * as actions from '../actions/SearchActions';
import { connect} from 'redux/react';
import shallowEqualScalar from 'redux/lib/utils/shallowEqualScalar';

@connect(({summary: {joinedQuery}}) => ({joinedQuery}))
export default class App extends Component {
    static propTypes = {
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
        joinedQuery: PropTypes.string.isRequired,
        params: PropTypes.object.isRequired,
    }

    static contextTypes = {
        store: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context);

        this.state = {
            title: document.body.getAttribute('data-title'),
            desc: document.body.getAttribute('data-description'),
            fbId: document.body.getAttribute('data-facebook-app-id')
        };
    }

    componentWillMount() {
        this.update();
    }

    componentDidUpdate(prevProps) {
        if (!shallowEqualScalar(this.props.params, prevProps.params)) {
            this.update();
        }
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

    update() {
        const { params } = this.props;

        if (params.queries && params.queries.length) {
            this.executeSearch(params.queries.split('.'));
        } else if (params.transcript && params.order) {
            this.executeSpeechContext(params.transcript, +params.order);
        } else {
            this.executeReset();
        }
    }

    executeSearch(queries) {
        let lastQuery = this.props.joinedQuery;

        if (!lastQuery.length || lastQuery !== queries.join(', ')) {
            this.context.store.dispatch(actions.summary(queries));
            this.context.store.dispatch(actions.hits(queries));
        }

        document.title = `«${queries.join(', ')}» · ${titleSuffix}`;
    }

    executeReset() {
        this.context.store.dispatch(actions.reset());
        document.title = titleSuffix;
    }

    executeSpeechContext(transcript, order) {
        this.context.store
            .dispatch(actions.speechContext(transcript, order))
            .then(() => {
                document.title = `Innlegg ${transcript} / ${order} · ${titleSuffix}`;
            });
    }

}

