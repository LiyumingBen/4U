import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import WVSearchField from 'component/WVSearch';
import WVPaginationPanel from 'component/WVPaginationPanel';
import WVApply from 'component/WVApply';
import {T} from 'component/Lang/Lang';
import _ from 'underscore';
import {ajax, ValidateUtils} from 'common/common';
import Layer from 'component/Layer/Layer';

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
            data:{Type:'GetDeviceInfo'},
            onSuccess: (r) => {
                let data = ValidateUtils.ArrayCheck(r);            

                this.setState( {
                    data:data
                } );
            }
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

        const enumFormatter = (cell, row, enumObject) => enumObject[cell];
        const typestr = {
            0: '解调卡',
            1: '转码卡'
        };

        let cl = [{
                isKey:true,
                headerText: '厂商信息',
                dataField: 'OEM',
                dataAlign: 'center',              
            },
            {
                headerText: '板卡类型',
                dataField: 'CardType',
                dataAlign: 'center',
                dataFormat: enumFormatter,
                formatExtraData: typestr,            
            },            
            {
                headerText: '板卡序列号',
                dataField: 'CardID',
                dataAlign: 'center',                
            },            
            {
                headerText: '网卡名称',
                dataField: 'NICName',
                dataAlign: 'center',     
            },            
            {
                headerText: T('IPAddress'),
                dataField: 'IP',
                dataAlign: 'center',
                width: '11%',     
            },            
            {
                headerText: T('SubnetMask'),
                dataField: 'Netmask',
                dataAlign: 'center',    
                width: '11%',    
            },            
            {
                headerText: T('DefaultGateway'),
                dataField: 'Gateway',
                dataAlign: 'center', 
                width: '11%',       
            },            
            {
                headerText: 'PCB版本',
                dataField: 'PcbVer',
                dataAlign: 'center',     
            },            
            {
                headerText: 'FPGA版本',
                dataField: 'FpgaVer',
                dataAlign: 'center',     
            },            
            {
                headerText: 'UBOOT版本',
                dataField: 'UbootVer',
                dataAlign: 'center',     
            },            
            {
                headerText: 'LINUX内核',
                dataField: 'KernelVer',
                dataAlign: 'center',     
            },            
            {
                headerText: '应用程序',
                dataField: 'AppVer',
                dataAlign: 'center',     
            }      

            ];   

        let bsTableStyle = {
            data:this.state.data,
            options,
            pagination:true,            
            hover:true,
        };      

        return (
            <div className="container wv-setting wv-info">
                <BootstrapTable {...bsTableStyle}>
                {
                    cl.map((item, index) => <TableHeaderColumn key={index} {...item}>{item.headerText}</TableHeaderColumn>)
                }                
                </BootstrapTable>                
            </div>
        );
    }
}
