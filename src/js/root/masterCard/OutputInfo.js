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
            data:{Type:'GetOutputInfo'},
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
                if (/(TSOut|Monitor)/.test(i)) {                    
                    flag = validateData('Addr', item[i].Addr);
                    i = 'Addr';
                }else {
                    flag = validateData(i, item[i]);                    
                }
                
                if (!flag) {
                    Layer.alert({
                        icon: 0,
                        content: Checkdata[i].msg(parseInt(item['Channel'])),
                    });
                    return true;
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
                Type:'SetOutputInfo',
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
        
        if(/-/.test(e.name)){
            let key = e.name.split(/-/);
            d[i][key[0]][key[1]] = e.value;
        }else{
            d[i][e.name] = e.value;
        }            

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

        const tagByName = (name, row) => {
            let [keys, v] = [name.split(/-/), '0'];
            switch (keys.length){
                case 1:
                    v = row[name];
                    break;
                case 2:
                    v = row[keys[0]][keys[1]];
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
            if (/Addr$/.test(id)) {
                flag = validateData('Addr', val);
            }else{
                flag = validateData(id, val);
            }
            return flag;
        };

        const getProps = (name, row, option = {}) => {
            return {common:tagByName(name, row), checkID:'name', checkFuc, option,}
        };        
        
        let optSwitch = [{"val":0,"txt":"关闭"},{"val":1,"txt":"开启"}];        

        let cl = [{
                isKey:true,
                headerText: T('Channel'),
                dataField: 'Channel',
                dataAlign: 'center', 
                rowSpan: 2,
                row: 0,              
                dataFormat: cell => parseInt(cell) + 1,
            },
            {
                headerText: T('Output'),
                dataAlign: 'center',      
                colSpan: 2,
                row: 0,
            },            
            {
                headerText: T('IPAddress'),
                dataField: 'TSOut',
                dataAlign: 'center',       
                row: 1,         
                dataFormat: (cell, row) => <WVInput {...getProps('TSOut-Addr', row)} />,                
            },            
            {
                headerText: T('Switch'),
                dataField: 'TSOut',
                dataAlign: 'center',   
                row: 1,             
                dataFormat: (cell, row) => <WVSelect {...getProps('TSOut-Switch', row, optSwitch)}/>,
            },
            {
                headerText: T('Monitor'),
                dataAlign: 'center',      
                colSpan: 2,                
                row: 0,
            },
            {
                headerText: T('IPAddress'),
                dataField: 'Monitor',
                dataAlign: 'center',       
                row: 1,         
                dataFormat: (cell, row) => <WVInput {...getProps('Monitor-Addr', row)} />,
            },            
            {
                headerText: T('Switch'),
                dataField: 'Monitor',
                dataAlign: 'center',   
                row: 1,             
                dataFormat: (cell, row) => <WVSelect {...getProps('Monitor-Switch', row, optSwitch)}/>,
            },            
            ];   

        let bsTableStyle = {
            data:this.state.data,
            options,
            pagination:true,            
            hover:true,
        };      

        return (
            <div className="container wv-setting">
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