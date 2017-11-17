import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import WVSearchField from 'component/WVSearch';
import WVPaginationPanel from 'component/WVPaginationPanel';
import WVApply from 'component/WVApply';
import WVSelect from 'component/WVSelect';
import WVInput from 'component/WVInput';
import {T} from 'component/Lang/Lang';
import _ from 'underscore';
import {ajax, ValidateUtils} from 'common/common';
import Layer from 'component/Layer/Layer';

const Checkdata = {    
    "VRate": {        
        "range": function (value) {
            return (0 <= value && value <= 12000) && ValidateUtils.isNumber(value);
        },
        "msg": function(index){
            return `(${index+1})${T('TipsVRate')}[0,12000].`;
        }
    },
    "FontSize": {        
        "range": function (value) {
            return (0 <= value && value <= 100) && ValidateUtils.isNumber(value);
        },
        "msg": function(index){
            return `(${index+1}) ${T('TipsFontSize')}[0,100].`;
        }
    },
    "port": {
        "range": function (value) {
            return (0 <= value && value <= 65535) && ValidateUtils.isNumber(value);
        },
        "msg": function(index){
            return `(${index+1}) ${T('IPPort')}`;
        }
    },
    "ip": {
        "range": function (value) {
            return ValidateUtils.isIP(value);
        },
        "msg": function(index){
            return `(${index+1}) ${T('tIPAddr')}`;
        }
    },
    "Addr": {
        "range": function (value) {
            try{
                let ip = value.split(/:/)[0];
                let port = value.split(/:/)[1];                
                return ValidateUtils.isIP(ip) && (0 <= port && port <= 65535) && ValidateUtils.isNumber(port);
            }catch(err){
                return true;
            }
        },
        "msg": function(index){
            return `(${index+1}) ${T('tIPAddr')}.${T('IPPort')}`;
        }
    },
};

const validateData = function(sid,value){
    if ( _.isUndefined(Checkdata[sid]) ){
        return true;
    }
    return Checkdata[sid].range(value);
};

let original = [];

export default class Settings extends React.Component{
    constructor(p) {
        super(p);
        this.state = {
            data: []
        };
    }
    componentDidMount() {
        this.initEntry();
    }
    initEntry() {
        ajax({
            url: "",
            data:{Type:'GetTcorderInfo'},
            onSuccess: (r) => {
                let data = ValidateUtils.ArrayCheck(r);
                $.extend(true, original, data);

                this.setState( {
                    data:data
                } );
            }
        });
    }

    handleApply() {        

        if (_.isEqual(original, this.state.data)) {
            Layer.msg({
                icon: 0,
                content: T('NoModifyData'),
            });
            return false;
        }       

        //check param correction
        let flag = true;
        _.find(this.state.data, (item) => {
            let keys = Object.keys(item);
            for(let y = 0; y < keys.length; y++){ 
                let i = keys[y];                
                let propertys = Object.keys(item[i]);
                for(let x = 0; x < propertys.length; x++){
                    
                    let key = propertys[x];                    
                    if(/IP/.test(key)){
                        flag = validateData('Addr', item[i][key]);
                        key = 'Addr';
                    }else if(/PID/.test(key)){
                        flag = validateData('PID', item[i][key]);
                        key = 'PID';
                    }else{
                        flag = validateData(key, item[i][key]);
                    }
                    
                    if (!flag) {                        
                        Layer.alert({
                            icon: 0,
                            content: Checkdata[key].msg(parseInt(item['Channel'])),
                        });
                        return true;
                    }
                }
                
            }              
        });

        if (!flag) {
            return false;
        }  
        //send data
        ajax({
            url: '',
            data: {
                Type:'SetTcorderInfo',
                Data:this.state.data,
            },
            onSuccess: () => {
                Layer.msg({
                    content: T('SettingSuccess'),
                    onComplete: () => {
                        this.initEntry();
                    }
                });
            }
        });
    }

    handleChange(i, event) {
        let e = event.target;
        let d = this.state.data;
        let key = e.name.split(/-/);
        switch(key.length){
            case 1:
                d[i][e.name] = e.value;
                break;
            case 2:
                d[i][key[0]][key[1]] = e.value;
                break;
            case 3:
                d[i][key[0]][key[1]][key[2]] = e.value;
                break;
            case 4:
                d[i][key[0]][key[1]][key[2]][key[3]] = e.value;
                break;
            default:
                break;
        }
        this.setState({
            data: d,
        });
    }

    render(){
        const tagByName = (name, row) => {
            let [keys, v] = [name.split(/-/), '0'];
            switch (keys.length){
                case 1:
                    v = row[name];
                    break;
                case 2:
                    v = row[keys[0]][keys[1]];
                    break;
                case 3:
                    v = row[keys[0]][keys[1]][keys[2]];
                    break;
                case 4:
                    v = row[keys[0]][keys[1]][keys[2]][keys[3]];
                    break;
                default:
                    break;
            }            
            return {
                name, value:v, onChange: this.handleChange.bind(this, row['Channel'])
            }
        };

        const checkFuc = (data = {}, checkID = '') => {
            let [flag, id = '', val] = [true, data[checkID], data['value']];
            let key = id.split(/-/);
            if(/IP/.test(id)){
                flag = validateData('Addr', val);
            }else if(/PID/.test(id)){
                flag = validateData('PID', val);
            }else{
                flag = validateData(key[1], val);
            }
            return flag;
        };

        const getProps = (name, row, option = {}) => {
            return {common:tagByName(name, row), checkID:'name', checkFuc, option,}
        };

        const formatDataRow = (row, index) => { 
            if (row['rowSpan']) {
                return <tr key={index}>
                    <td rowSpan={row['rowSpan']} className="td-bottom" >
                        {row['headerText']}
                    </td>                    
                </tr>
            }  
            let s1 = row['dataField'].split(/-/)[0];
            let s2 = row['dataField'].split(/-/)[1];
            
            return <tr key={index}>
                <td className="td-bottom" >{row['headerText']}</td>
                {
                    this.state.data.map((ch, i) => <td key={i}> {row.dataFormat(ch[s1][s2], ch)} </td>)
                }
            </tr>
        };   

        let optVcode = [{"val":1,"txt":"MPEG2"},{"val":2,"txt":"h264"}
                       ,{"val":3,"txt":"MPEG4"},{"val":4,"txt":"AVS+"}];
        let optAcode = [{"val":1,"txt":"AAC"},{"val":2,"txt":"AC3"}
                       ,{"val":3,"txt":"MP2"},{"val":4,"txt":"DRA"}];
        let positionOpt = [{"val":0,"txt":"左上角"},{"val":1,"txt":"右上角"}
                          ,{"val":2,"txt":"左下角"},{"val":3,"txt":"右下角"}];
        let antiOpt = [{"val":0,"txt":"不启用反色"},{"val":1,"txt":"启动反色"}];        
        let alignOpt = [{"val":0,"txt":"左对齐"},{"val":1,"txt":"居中"},{"val":2,"txt":"右对齐"}];
        let typeOpt = [{"val":1,"txt":"第一行为text,第二行为时间信息"},{"val":2,"txt":"第一行为text,无时间信息"}
                      ,{"val":3,"txt":"text和时间信息在一行显示"}];
        let optSwitch = [{"val":0,"txt":"关闭"},{"val":1,"txt":"开启"}];

        let outRow = [
            {
                headerText: '输出参数',                
                rowSpan:8,    
            },
            {
                headerText: '视频编码',
                dataField: 'Out-VCode',
                dataFormat: (cell, row) => <WVSelect {...getProps('Out-VCode', row, optVcode)}/>,
            },            
            {
                headerText: '音频编码',
                dataField: 'Out-ACode',
                dataFormat: (cell, row) => <WVSelect {...getProps('Out-ACode', row, optAcode)}/>,
            },
            {
                headerText: '视频宽度',
                dataField: 'Out-Width',
                dataFormat: (cell, row) => <WVInput {...getProps('Out-Width', row)} />,
            },
            {
                headerText: '视频高度',
                dataField: 'Out-Height',
                dataFormat: (cell, row) => <WVInput {...getProps('Out-Height', row)} />,
            },
            {
                headerText: '视频码率(Kbps)',
                dataField: 'Out-VRate',
                dataFormat: (cell, row) => <WVInput {...getProps('Out-VRate', row)} />,
            },
            {
                headerText: '音频码率(Kbps)',
                dataField: 'Out-ARate',
                dataFormat: (cell, row) => <WVInput {...getProps('Out-ARate', row)} />,
            },
            {
                headerText: '帧率',
                dataField: 'Out-FrameRate',
                dataFormat: (cell, row) => <WVInput {...getProps('Out-FrameRate', row)} />,
            },     
            {
                headerText: '输入参数',                
                rowSpan:8,             
            },                          
            {
                headerText: T('IPAddress'),
                dataField: 'In-SrcIP',
                dataFormat: (cell, row) => <WVInput {...getProps('In-SrcIP', row)} />,
            },   
            {
                headerText: '视频编码',
                dataField: 'In-VCode',
                dataFormat: (cell, row) => <WVInput {...getProps('In-VCode', row)} />,
            },  
            {
                headerText: '音频编码',
                dataField: 'In-ACode',
                dataFormat: (cell, row) => <WVInput {...getProps('In-ACode', row)} />,
            },  
            {
                headerText: '服务ID',
                dataField: 'In-ServiceID',
                dataFormat: (cell, row) => <WVInput {...getProps('In-ServiceID', row)} />,
            },  
            {
                headerText: '视频PID',
                dataField: 'In-VPID',
                dataFormat: (cell, row) => <WVInput {...getProps('In-VPID', row)} />,
            },  
            {
                headerText: '音频PID',
                dataField: 'In-APIDList',
                dataFormat: (cell, row) => {
                    try{
                        return <span>
                            {cell['APID'].map( (item, i) => {                                
                                return <span key={i}>                                    
                                    <WVInput {...getProps('In-APIDList-APID-' + i, row)} />
                                </span>
                                }) 
                            }
                        </span>
                    }catch(err){
                        return "";
                    }
                }
            },  
            {
                headerText: '服务类型',
                dataField: 'In-ServiceType',
                dataFormat: (cell, row) => <WVInput {...getProps('In-ServiceType', row)} />,
            }, 
            {
                headerText: 'OSD',                
                rowSpan:7,             
            }, 
            {
                headerText: '文本内容',
                dataField: 'OSD-Text',                       
                dataFormat: (cell, row) => <WVInput {...getProps('OSD-Text', row)} />,
            },            
            {
                headerText: '字体大小',
                dataField: 'OSD-FontSize',                       
                dataFormat: (cell, row) => <WVInput {...getProps('OSD-FontSize', row)} />,               
            },
            {
                headerText: '位置信息',
                dataField: 'OSD-Position',                         
                dataFormat: (cell, row) => <WVSelect {...getProps('OSD-Position', row, positionOpt)}/>,
            },
            {
                headerText: '是否反色',
                dataField: 'OSD-AntiColor',           
                dataFormat: (cell, row) => <WVSelect {...getProps('OSD-AntiColor', row, antiOpt)}/>,
            },
            {
                headerText: '对齐方式',
                dataField: 'OSD-Align',                 
                dataFormat: (cell, row) => <WVSelect {...getProps('OSD-Align', row, alignOpt)}/>,
            },
            {
                headerText: '显示类型',
                dataField: 'OSD-Type',             
                dataFormat: (cell, row) => <WVSelect {...getProps('OSD-Type', row, typeOpt)}/>,
            },
            {
                headerText: T('Output'),                
                rowSpan:3,             
            },   
            {
                headerText: T('IPAddress'),
                dataField: 'TSOut-Addr',                 
                dataFormat: (cell, row) => <WVInput {...getProps('TSOut-Addr', row)} />,
            },
            {
                headerText: T('Switch'),
                dataField: 'TSOut-Switch',               
                dataFormat: (cell, row) => <WVSelect {...getProps('TSOut-Switch', row, optSwitch)}/>,
            },     
            {
                headerText: T('Monitor'),                
                rowSpan:3,             
            },   
            {
                headerText: T('IPAddress'),
                dataField: 'Monitor-Addr',              
                dataFormat: (cell, row) => <WVInput {...getProps('Monitor-Addr', row)} />,
            },
            {
                headerText: T('Switch'),
                dataField: 'Monitor-Switch',                               
                dataFormat: (cell, row) => <WVSelect {...getProps('Monitor-Switch', row, optSwitch)}/>,
            },              
            ];  

        return (
            <div className="container wv-setting">                
                <table className="table table-bordered table-hover text-center">
                    <thead>
                        <tr>
                            <th colSpan='2'>&nbsp;</th>
                            {
                                this.state.data.map((item, i) => <th key={i}>{parseInt(item['Channel']) + 1}</th>)
                            }
                        </tr>
                    </thead>
                    <tbody>
                    {
                        outRow.map((item, i) => formatDataRow(item, i))
                    }  
                    </tbody>              
                </table>                
                <WVApply onClick={this.handleApply.bind(this)}/>
            </div>
        );
    }
}