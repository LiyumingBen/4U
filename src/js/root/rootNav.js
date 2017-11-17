import React from 'react';
import {Link} from 'react-router';
import {T} from 'component/Lang/Lang';

const RootNav = React.createClass({
    
    render: function () {

        return <div>
            <div className="container indexHeader">
                <div className="navbar-header">
                    <a className="navbar-brand" href="javascript:">数字电视监管前端</a>
                </div>                
            </div>
            <div className="indexBottom">
                <div className="indexLeft">
                    <div className="leftBoardList list-group">
                        <h5 className="left_title"><span className="glyphicon glyphicon-option-vertical"></span> {T('Module')}{T('List')}</h5>
                        <a href="#/monitorCard"><div>卡槽01： 监控卡</div></a>
                        <a href="#/masterCard"><div>卡槽02： 主控卡</div></a>
                        <a href="#/transcodeCard"><div>卡槽03： 转码卡</div></a>
                        <a href="#/demodulationCard"><div>卡槽04： 解调卡</div></a>
                        <a href="#/E404"><div>卡槽05： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽06： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽07： 业务卡</div></a>
                        <a href="#/linkCard"><div>卡槽08： 交换卡</div></a>
                        <a href="#/E404"><div>卡槽09： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽10： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽11： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽12： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽13： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽14： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽15： 业务卡</div></a>
                        <a href="#/E404"><div>卡槽16： 业务卡</div></a>
                    </div>
                </div>
                <div className="indexRight">
                    {this.props.children}
                </div>
            </div>
        </div>
    }
});

export default RootNav;