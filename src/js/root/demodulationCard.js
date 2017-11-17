import React from 'react';
import NavItem from 'component/NavItem/NavItem';
import {T} from 'component/Lang/Lang';

export default class demodulationCard extends React.Component {
    render(){
        return <div>
                <nav className="navbar navbar-default subnav">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="javascript:void(0);">卡槽1： 解调卡</a>
                    </div>
                    <ul className="nav nav-tabs navbar-right">
                        <NavItem {...this.props} to="#/demodulationCard/status">{T('Status')}</NavItem>                        
                        <NavItem {...this.props} to="#/demodulationCard/param">{T('ParameterSetting')}</NavItem>
                        <NavItem {...this.props} to="#/demodulationCard/decrypt">{T('DescramblingSettings')}</NavItem>
                        <NavItem {...this.props} to="#/demodulationCard/system">{T('SystemManage')}</NavItem>
                    </ul>
                </nav>
            {this.props.children}
        </div>
    }
}