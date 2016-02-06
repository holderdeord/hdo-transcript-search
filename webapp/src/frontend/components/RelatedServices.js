import React, { Component } from 'react';

const services = [
    {
        enabled: true,
        title: 'Blogg',
        img: '//files.holderdeord.no/images/stortingssalen.jpg',
        url: 'https://blog.holderdeord.no/',
        description: 'Datadrevne analyser av norsk politikk'
    },

    {
        enabled: false,
        title: 'Enighet',
        img: '//files.holderdeord.no/images/enighet.raw.png',
        url: 'https://enighet.holderdeord.no/',
        description: 'Sjekk hvem som stemmer sammen på Stortinget',
    },

    {
        enabled: true,
        title: 'Løftedatabasen',
        img: '//files.holderdeord.no/images/loftedatabase.png',
        url: 'https://www.holderdeord.no/promises',
        description: 'Finn ut hva partiene mener',
    },

    {
        enabled: true,
        title: 'Partipisken',
        img: '//files.holderdeord.no/images/partipisken.jpg',
        url: 'https://twitter.com/partipisken',
        description: 'Følg med på folkevalgte rebeller'
    },

    {
        enabled: true,
        title: 'holderdeord.no',
        url: 'https://www.holderdeord.no/',
        description: 'Løfter, avstemninger, forslag og saker',
        style: {
            backgroundImage: `url(//files.holderdeord.no/images/blog-header.jpg)`,
            backgroundPosition: '50% 4%'
        }
    },

    {
        enabled: false,
        title: 'Kort og godt',
        img: '//files.holderdeord.no/images/ikke-bruk.jpg',
        url: 'https://kort.holderdeord.no/',
        description: 'Få oversikt gjennom enkle oppsummeringer av de viktigste sakene',
    },

    {
        enabled: false,
        title: 'Spørsmål og svar',
        img: 'http://blirdetmaktskifte.no/img/share.png',
        url: 'https://www.holderdeord.no/promises',
        description: 'Hvem er mest aktive i å spørre ut regjeringen?',
    }
];

export default class RelatedServices extends Component {
    render() {
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
                                    <div className="img" style={service.style || {backgroundImage: `url(${service.img})`}} />

                                    <div style={{margin: '2rem'}}>
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
