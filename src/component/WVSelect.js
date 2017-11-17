import React from 'react';
import _ from 'underscore';

class WVSelect extends React.Component {   

    render() {  
    	if (_.isUndefined(this.props.common.value)) {
            return "-";
        };   
        let arOption = this.props.option;
        let options = arOption.map((option,index) => {
	        return <option key={index} value={arOption[index].val} >{arOption[index].txt}</option>
	    });
        
        return <select  className="form-control"
                     {...this.props.common} >
                {options}
            </select>
    }
}

export default WVSelect;