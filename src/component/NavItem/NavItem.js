import React from 'react';

export default class NavItem extends React.Component {
    render() {
        const {children, to} = this.props;
        const isActive = (to === '#' + this.props.location.pathname);
        return <li className={isActive ? 'active' : ''}>
            <a href={to}>{children}</a>
        </li>
    }
}