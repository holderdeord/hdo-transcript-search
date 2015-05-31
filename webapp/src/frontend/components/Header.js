import React from 'react';

class Header extends React.Component {

    render() {
        let desc = this.props.description.replace('Holder de ord', '');

        return (
            <div className="masthead">
                <h1>{this.props.title}</h1>
                <small>
                    {desc}<a href="https://www.holderdeord.no/">Holder de ord</a>
                </small>

                {this.props.children}
            </div>
        );
    }

}

Header.propTypes = {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired
};

module.exports = Header;