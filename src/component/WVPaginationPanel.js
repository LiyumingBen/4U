import React from 'react';

const WVPaginationPanel = React.createClass({
    render() {
        return (
            <div>{ this.props.components.pageList }</div>
        )
    }
});

export default WVPaginationPanel;