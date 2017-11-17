import React from 'react';
import ReactDOM from 'react-dom';
import {T} from 'component/Lang/Lang';
class WVSearchField extends React.Component {
    // It's necessary to implement getValue
    getValue() {
        return ReactDOM.findDOMNode(this.refs.search).value;
    }

    // It's necessary to implement setValue
    setValue(value) {
        ReactDOM.findDOMNode(this.refs.search).value = value;
    }

    render() {
        return (
            <div className="input-group">
                <input
                    className={ `form-control` }
                    type='text'
                    ref="search"
                    defaultValue={ this.props.defaultValue }
                    placeholder= {T('Search')}
                    onKeyUp={this.props.search}/>
                <a className="input-group-addon">
                    <span className="glyphicon glyphicon-search"/>
                </a>
            </div>
        );
    }
}

export default WVSearchField;