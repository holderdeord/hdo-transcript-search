import React from 'react';

class Header extends React.Component {


    render() {
        let title = this.props.title;
        let desc = this.props.description.replace('Holder de ord', '');

        return (
            <div className="masthead">
                <h1>
                    <a href="/" style={{textDecoration: 'none'}}>{title}</a>
                </h1>

                <div className="description">
                    {desc}<a href="https://www.holderdeord.no/">Holder de ord</a>
                </div>

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