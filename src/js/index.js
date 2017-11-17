// 关联依赖文件
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import '../css/bootstrap-custom.less';
import '../css/common.less';
import '../css/custom.less';

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, hashHistory} from 'react-router';
import routes from 'common/routes';

// 开发调试时使用
window.React = React;

class App extends React.Component {
    render() {
        return <Router history={hashHistory} routes={routes}/>
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);