import React, { PropTypes, Component } from 'react';
import { ga } from '../reducers/analytics';

export default class ImageWithFallback extends Component {
    static propTypes = {
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        fallbackSrc: PropTypes.string.isRequired,
        height: PropTypes.number,
        className: PropTypes.string
    };

    static contextTypes = {
        store: PropTypes.object.isRequired
    };

    state = { useFallbackImage: false };

    render() {
        return (
            <img
                className={this.props.className}
                src={this.state.useFallbackImage ? this.props.fallbackSrc : this.props.src}
                alt={this.props.alt}
                height={this.props.height}
                onError={::this.handleImageError}
            />
        );
    }

    handleImageError() {
        if (!this.state.useFallbackImage) {
            ga('send', 'event', 'image-error', this.props.src);
            this.setState({useFallbackImage: true});
        }
    }
}
