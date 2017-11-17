import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import WVSearchField from 'component/WVSearch';
import WVPaginationPanel from 'component/WVPaginationPanel';
import WVApply from 'component/WVApply';
import {T} from 'component/Lang/Lang';
import _ from 'underscore';
import {ajax, ValidateUtils} from 'common/common';
import Layer from 'component/Layer/Layer';

const Checkdata = {    
    "FontSize": {
        "prop": "isNumber",
        "range": function (value) {
            return (0 <= value && value <= 100);
        },
        "msg": function(index){
            return `(${index+1}) 字体大小范围[47000KHz,806000KHz].`;
        }
    }
};

const validateData = function(sid,value){
    if ( _.isUndefined(Checkdata[sid]) ){
        return true;
    }
    return (ValidateUtils[Checkdata[sid].prop](value)) && (Checkdata[sid].range)(value);
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
            data:{Type:'GetOSDInfo'},
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

        //check change            
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
            for (let i in item) {               
                if (!_.isUndefined(item[i])) {
                    flag = validateData(i, parseInt(item[i]));
                    if (!flag) {
                        item[i] = 0;
                        Layer.alert({
                            icon: 0,
                            content: Checkdata[i].msg(item['channel']),
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
                Type:'SetOSDInfo',
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
        d[i][e.name] = e.value;          

        this.setState({
            data: d,
        });
    }

    render(){

        const options = {
            noDataText: T('NoData'),
            paginationPosition: 'top',
            alwaysShowAllBtns: true,
            paginationPanel: (props) => (<WVPaginationPanel { ...props }/>),
            searchField: (props) => (<WVSearchField  { ...props }/>),
            hideSizePerPage: true //隐藏每页显示多少行数据选项
        };  

        const formatInput = (cell, row, sname) => {
            let flag = validateData(sname, cell);
            return <input type="text"
                          name={sname}
                          className={(!flag) ? "form-control bg-danger" : 'form-control'}
                          value={cell}
                          onChange={this.handleChange.bind(this, row['channel'])}/>
        };       

        const formatSelect = (cell, row, sname, option) => {
            return <select name={sname}
                           className="form-control"
                           value={cell}
                           onChange={this.handleChange.bind(this, row['channel'])}>
                           {
                             option.map((x,index) => <option key={index} value={x[0]}>{x[1]}</option>)
                           }                
                    </select>
        };  

        let positionOpt = [[0,'左上角'],[1,'右上角'],[2,'左下角'],[3,'右下角']];
        let antiOpt = [[0,'不启用发色'],[1,'启动反色']];        
        let alignOpt = [[0,'左对齐'],[1,'居中'],[2,'右对齐']];
        let typeOpt = [[1,'第一行为text,第二行为时间信息'],[2,'第一行为text,无时间信息'],[3,'text和时间信息在一行显示']];

        let cl = [{
                isKey:true,
                headerText: T('Channel'),
                dataField: 'Channel',
                dataAlign: 'center',               
                dataFormat: cell => parseInt(cell) + 1,
            },
            {
                headerText: '文本内容',
                dataField: 'Text',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatInput(cell, row, 'Text'),
            },            
            {
                headerText: '字体大小',
                dataField: 'FontSize',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatInput(cell, row, 'FontSize'),                
            },
            {
                headerText: '位置信息',
                dataField: 'Position',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatSelect(cell, row, 'Position', positionOpt)
            },
            {
                headerText: '是否反色',
                dataField: 'AntiColor',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatSelect(cell, row, 'AntiColor', antiOpt)
            },
            {
                headerText: '对齐方式',
                dataField: 'Align',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatSelect(cell, row, 'Align', alignOpt)
            },
            {
                headerText: '显示类型',
                dataField: 'Type',
                dataAlign: 'center',                
                dataFormat: (cell, row) => formatSelect(cell, row, 'Type', typeOpt)
            }  
    
            ];   

        let bsTableStyle = {
            data:this.state.data,
            options,
            pagination:true,            
            hover:true,
        };      

        return (
            <div>
                <BootstrapTable {...bsTableStyle}>
                {
                    cl.map((item, index) => <TableHeaderColumn key={index} {...item}>{item.headerText}</TableHeaderColumn>)
                }                
                </BootstrapTable>
                <WVApply onClick={this.handleApply.bind(this)}/>
            </div>
        );
    }
}
