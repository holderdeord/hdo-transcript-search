import React, { PropTypes } from 'react';

export default class Header extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
    };

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
