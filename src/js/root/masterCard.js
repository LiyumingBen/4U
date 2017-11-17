import React from 'react';
import NavItem from 'component/NavItem/NavItem';
import {T} from 'component/Lang/Lang';

export default class masterCard extends React.Component {
    render(){
        return <div>
                <nav className="navbar navbar-default subnav">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="javascript:void(0);">卡槽1： 主控卡</a>
                    </div>
                    <ul className="nav nav-tabs navbar-right">
                        <NavItem {...this.props} to="#/masterCard/status">Status</NavItem>
                        <NavItem {...this.props} to="#/masterCard/info">{T('DeviceInformation')}</NavItem>
                        <NavItem {...this.props} to="#/masterCard/outputinfo">{T('SystemSet')}</NavItem>
                        <NavItem {...this.props} to="#/masterCard/system">{T('SystemManage')}</NavItem>
                      </ul>
                </nav>
            {this.props.children}
        </div>
    }
}