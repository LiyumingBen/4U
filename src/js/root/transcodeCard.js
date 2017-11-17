import React from 'react';
import NavItem from 'component/NavItem/NavItem';
import {T} from 'component/Lang/Lang';

export default class transcodeCard extends React.Component {
    render(){
        return <div>
                <nav className="navbar navbar-default subnav">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="javascript:void(0);">卡槽1： 转码卡</a>
                    </div>
                    <ul className="nav nav-tabs navbar-right">
                        <NavItem {...this.props} to="#/transcodeCard/status">Status</NavItem>
                        <NavItem {...this.props} to="#/transcodeCard/param">{T('ParameterSetting')}</NavItem>
                        <NavItem {...this.props} to="#/transcodeCard/system">{T('SystemManage')}</NavItem>
                      </ul>
                </nav>
            {this.props.children}
        </div>
    }
}