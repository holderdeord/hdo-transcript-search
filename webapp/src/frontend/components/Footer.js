import React from 'react';

class Footer extends React.Component {
    render() {
        // jshint ignore:start
        return (
            <footer>
                <div className="logo" />
                <h4>Holder de ord &copy; 2014 - {new Date().getFullYear()}</h4>

                <div>Referater fra <a href="http://data.stortinget.no">data.stortinget.no</a> under <a href="http://data.norge.no/NLOD">NLOD</a>.</div>

                <div>
                    <a href="https://www.holderdeord.no/" alt="Holder de ord">holderdeord.no</a>
                    &nbsp; &middot;&nbsp;
                    <a href="https://twitter.com/holderdeord/" alt="Holder de ord på Twitter">@holderdeord</a>
                </div>
            </footer>
        );
        // jshint ignore:end
    }
}

module.exports = Footer;