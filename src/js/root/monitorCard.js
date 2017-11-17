import React from 'react';
import NavItem from 'component/NavItem/NavItem';

export default class monitorCard extends React.Component {
    render(){
        return <div>
                <nav className="navbar navbar-default subnav">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="javascript:void(0);">卡槽1： 监控卡</a>
                    </div>
                    <ul className="nav nav-tabs navbar-right">
                        <NavItem {...this.props} to="#/monitorCard/status">Status</NavItem>
                      </ul>
                </nav>
            {this.props.children}
        </div>
    }
}