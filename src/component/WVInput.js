import React from 'react';
import _ from 'underscore';

class WVInput extends React.Component {   

    render() {     
    	if (_.isUndefined(this.props.common.value)) {
            return "-";
        };     	
        
        let flag = this.props['checkFuc'](this.props.common, this.props['checkID']);
        
        return <input type="text"                          
                  className={(!flag) ? "form-control bg-danger" : 'form-control'}
                  {...this.props.common} 
                  />
                
    }
}
export default WVInput;
