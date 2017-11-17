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
            data:{Type:'GetICCardInfo'},
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

        let cl = [{
                isKey:true,
                headerText: `IC卡卡号`,
                dataField: 'ICCard',
                dataAlign: 'center',              
            },
            {
                headerText: `IC卡有效期`,
                dataField: 'ValidityDate',
                dataAlign: 'center',               
            },            
            {
                headerText: `IC授权节目路数`,
                dataField: 'Capacity',
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
            <div>
                <BootstrapTable {...bsTableStyle}>
                {
                    cl.map((item, index) => <TableHeaderColumn key={index} {...item}>{item.headerText}</TableHeaderColumn>)
                }                
                </BootstrapTable>                
            </div>
        );
    }
}
