import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import WVSearchField from 'component/WVSearch';
import WVPaginationPanel from 'component/WVPaginationPanel';
import WVApply from 'component/WVApply';
import WVSelect from 'component/WVSelect';
import {T} from 'component/Lang/Lang';
import _ from 'underscore';
import {ajax, ValidateUtils} from 'common/common';
import Layer from 'component/Layer/Layer';

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
            data:{Type:'GetDecryptInfo'},
            onSuccess: (r) => {
                let data = ValidateUtils.ArrayCheck(r);

                $.extend(true, original, data);    

                this.setState( {
                    data
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
      
        //send data
        ajax({
            url: '',
            data: {
                Type:'SetDecryptInfo',
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
        let that = this;
        const options = {
            noDataText: T('NoData'),
            paginationPosition: 'top',
            alwaysShowAllBtns: true,
            paginationPanel: (props) => (<WVPaginationPanel { ...props }/>),
            searchField: (props) => (<WVSearchField  { ...props }/>),
            hideSizePerPage: true //隐藏每页显示多少行数据选项
        };

        const tagByName = (name, row) => {
            return {
                name, value:row[name], onChange: this.handleChange.bind(this, row['Channel'])
            }
        };
        
        const getProps = (name, row, option = {}) => {
            return {common:tagByName(name, row),
                    option,
            }
        };
        
        let decOpt = [{"val":0,"txt":"不解扰"},{"val":1,"txt":"CAM"}];

        let cl = [
            {
                isKey:true,
                headerText: T('Channel'),
                dataField: 'Channel',
                dataAlign: 'center',
                dataFormat: cell => parseInt(cell) + 1
            },
            {
                headerText: T('Service') + 'ID',
                dataField: 'ServiceID',
                dataAlign: 'center'          
            },
            {
                headerText: T('DescramblingSettings'),
                dataField: 'Decrypt',
                dataAlign: 'center',                
                dataFormat: (cell, row) => <WVSelect {...getProps('Decrypt', row, decOpt)}/>,
            }           
            ];   

        let bsTableStyle = {
            data:that.state.data,
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