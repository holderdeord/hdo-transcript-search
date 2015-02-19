var React = require('react');

var {div,h1,small,a} = React.DOM;

class Header extends React.Component {

  render() {
    return div({className: 'masthead'},
        h1({className: 'masthead-title'}, 'Fra Stortingets talerstol'),
        small({},
            'En visuliasering av språkbruk på Stortinget fra',
            a({href: 'https://www.holderdeord.no'}, 'Holder de ord')
        )
    );
  }

}

module.exports = Header;