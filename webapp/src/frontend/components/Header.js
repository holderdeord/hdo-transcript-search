import React from 'react';

var {div,h1,small,a} = React.DOM;

class Header extends React.Component {

  render() {
    let desc = this.props.description.replace('Holder de ord', '');

    return div({className: 'masthead'},
        h1({className: 'masthead-title'}, this.props.title),
        small({},
            desc,
            a({href: 'https://www.holderdeord.no'}, 'Holder de ord')
        )
    );
  }
}

Header.propTypes = {
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired
};

module.exports = Header;