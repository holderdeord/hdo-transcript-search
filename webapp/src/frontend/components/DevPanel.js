import React from 'react';

var {div,select,option} = React.DOM;

class DevPanel extends React.Component {

    render() {
        return div(
            {className: `dev-panel row ${this.props.visible ? '' : 'hide'}`},
            div(
                {className: 'col-md-6 col-md-offset-4'},
                div(
                    null,
                    'TopListChart orientation: ',
                    select(
                        {onChange: this.props.onOrientationChange, checked: this.props.orientation === 'horizontal'},
                        option({value: 'horizontal'}, 'horizontal'),
                        option({value: 'vertical'}, 'vertical')
                    )
                ),
                div(null,
                    'Timeline interval: ',
                    select({
                        name: 'interval',
                        value: this.props.interval,
                        onChange: this.props.onIntervalChange
                    },
                           option({value: 'month'}, '1 måned'),
                           option({value: '12w'}, '3 måneder'),
                           option({value: '24w'}, '6 måneder'),
                           option({value: 'year'}, '1 år')
                          )
                   )
            )
        );
    }

}

DevPanel.propTypes = {
    visible: React.PropTypes.bool.isRequired
};

module.exports = DevPanel;
