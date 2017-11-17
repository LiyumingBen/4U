import React from "react";
import FileUpload from "component/WVFileUpload";
import {ajax, CommonHandle} from "common/common";
import Layer from 'component/Layer/Layer';
import {T} from 'component/Lang/Lang';

export default class SystemManagement extends React.Component{
    constructor(p) {
        super(p);     
        this.slot = 2;
    }
    // 重启
    handleReboot (type) {
        let that = this;
        let content = T('tRestart');

        if (type === "default") {
            content = T('tFactorySettings');
        } else if (type === "import") {
            content = T('tImportConfiguration');
        } else if (type === "upgrade") {
            content = T('tUpgradeSuccess');
        }

        Layer.confirm({
            content: content,
            onEnter: () => {
                ajax({
                    url: "",
                    data:{Type:'Restart', Data:{Slot:this.slot}},
                    isLoadingShow: true,
                    isCodeErrorShow: true,
                    isOtherErrorShow: true,
                    onSuccess (data) {
                        that.rebootProgressBar = Layer.progress({
                            content: T('tRestarting'),
                            total: data['delay'],
                            onComplete: () => {
                                window.location.href = 'http://' + window.location.host + window.location.pathname;
                            }
                        });
                        that.rebootProgressBar.start();
                    }
                });
            }
        });
    }
    // 恢复出厂设置
    handleDefault () {
        let that = this;
        // 恢复出厂
        let doDefault = () => {
            ajax({
                url: "",
                data:{Type:'Factory', Data:{Slot:this.slot}},
                isLoadingShow: true,
                isCodeErrorShow: true,
                isOtherErrorShow: true,
                onSuccess (data) {
                    that.defaultProgressBar = Layer.progress({
                        content: T('tFacotryRestoring'),
                        total: data['defaultDelay'],
                        onComplete: () => {
                            _.delay(that.handleReboot.bind(that), 200, 'default');
                        }
                    });
                    that.defaultProgressBar.start();
                }
            });
        };

        Layer.confirm({
            content: T('tFactoryRestore'),
            onEnter: () => {
                doDefault();
            }
        });
    }
    doUpgrade (data) {
        let that = this;

        if (typeof data !== "object") {

            that.upgradeProgressBar.stop();

        } else if(data.code){

            that.upgradeComplete = () => {
            };
            that.upgradeProgressBar.stop();
            CommonHandle.ajaxError(data.code, data.description,true);

        } else {

            that.upgradeComplete = () => {
                _.delay(that.handleReboot.bind(that), 200, 'upgrade');
            };

            that.upgradeProgressBar.setRemain(data['upgradedelay']);
        }
    }
    handleSaveAllCfg(){

        Layer.confirm({
            content: '确认要全量保存配置吗?',
            onEnter: () => {
                ajax({
                    url: "",
                    data:{Type:'SaveAllCfg', Data:{Slot:this.slot}},
                    isLoadingShow: true,
                    isCodeErrorShow: true,
                    isOtherErrorShow: true
                });
            }
        });       
    }
    render () {
        let that = this;
        
        return <div className="container wv-system">           

            <p className="wv-caption">
                <span style={{display: "inline-block", width: "200px"}}>{T('RestartReset')}</span>
                <button className="btn btn-primary" onClick={this.handleReboot.bind(this)}>{T('Restart')}</button>
                <button className="btn btn-primary" style={{marginLeft: '30px'}} onClick={this.handleDefault.bind(this)}>{T('FactoryReset')}</button>
                <button className="btn btn-primary" style={{marginLeft: '30px'}} onClick={this.handleSaveAllCfg.bind(this)}>保存全部参数</button>
            </p>
        </div>
    }
}