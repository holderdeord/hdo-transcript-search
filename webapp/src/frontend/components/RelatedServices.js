import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

@connect(({ services }) => ({ services }))
export default class RelatedServices extends Component {
    static propTypes = {
        services: PropTypes.array.isRequired,
    };

    render() {
        let services = this.props.services;

        if (!services.length) {
            return null;
        }

        services = services.filter(
            s => s.enabled && s.url.indexOf('tale.holderdeord.no') === -1
        );

        return (
            <div className="container">
                <div className="related-services card">
                    <div className="row result-box result-box-header text-center">
                        <div className="col-md-12">
                            <h4>Andre tjenester fra Holder de ord</h4>
                        </div>
                    </div>

                    <div className="row result-box no-gutters text-center">
                        {services.filter(s => s.enabled).map(service => (
                            <div className="col-md-6 service" key={service.title}>
                                <a href={service.url}>
                                    <div
                                        className="img"
                                        style={
                                            service.style || {
                                                backgroundImage: `url(${
                                                    service.img
                                                })`,
                                            }
                                        }
                                    />

                                    <div style={{ margin: '2rem' }}>
                                        <h4>{service.title}</h4>

                                        <p className="lead">{service.description}</p>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
