import React     from 'react';
import Analytics from '../stores/Analytics';


export default class ImageWithFallback extends React.Component {
    constructor() {
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

ImageWithFallback.propTypes = {
    src: React.PropTypes.string.isRequired,
    alt: React.PropTypes.string.isRequired,
    fallbackSrc: React.PropTypes.string.isRequired,
    height: React.PropTypes.number,
    className: React.PropTypes.string
}


