import React from 'react';

class Footer extends React.Component {
    render() {
        return (
            <footer>
                <a href="https://www.holderdeord.no/">
                    <img className="logo" src="/logo.png" />
                </a>

                <h4>Holder de ord &copy; 2014 - {new Date().getFullYear()}</h4>

                <div>
                    <small>
                        <div>
                            Referater fra{' '}
                            <a href="http://data.stortinget.no">
                                data.stortinget.no
                            </a>{' '}
                            lisensiert under{' '}
                            <a href="http://data.norge.no/NLOD">NLOD</a>.
                        </div>
                        <div>
                            Kildekode på{' '}
                            <a href="https://github.com/holderdeord/hdo-transcript-search">
                                GitHub
                            </a>{' '}
                            lisensiert under{' '}
                            <a href="http://opensource.org/licenses/BSD-3-Clause">
                                BSD
                            </a>.
                        </div>
                        <div>
                            Vi tar forbehold om feil. Spørsmål? Ta{' '}
                            <a href="mailto:&#106;&#97;&#114;&#105;&#0064;&#104;&#111;&#108;&#100;&#101;&#114;&#100;&#101;&#111;&#114;&#100;.&#110;&#111;">
                                kontakt
                            </a>.
                        </div>
                    </small>
                </div>

                <p style={{ paddingTop: '1rem' }}>
                    <a href="https://www.holderdeord.no/" alt="Holder de ord">
                        holderdeord.no
                    </a>
                    &nbsp;&middot;&nbsp;
                    <a
                        href="https://twitter.com/holderdeord/"
                        alt="Holder de ord på Twitter">
                        @holderdeord
                    </a>
                </p>
            </footer>
        );
    }
}

module.exports = Footer;
