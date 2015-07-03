import React, { PropTypes, Component } from 'react';
import Analytics from '../stores/Analytics';

export default class ImageWithFallback extends Component {
    static propTypes = {
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        fallbackSrc: PropTypes.string.isRequired,
        height: PropTypes.number,
        className: PropTypes.string
    };

    constructor(...args) {
        super(...args);

        this.state = { useFallbackImage: false };
    }

    render() {
        return (
            <img
                className={this.props.className}
                src={this.state.useFallbackImage ? this.props.fallbackSrc : this.props.src}
                alt={this.props.alt}
                height={this.props.height}
                onError={this.handleImageError.bind(this)}
            />
        );
    }

    handleImageError() {
        if (!this.state.useFallbackImage) {
            Analytics.sendEvent('image-error', this.props.src);
            this.setState({useFallbackImage: true});
        }
    }
}
