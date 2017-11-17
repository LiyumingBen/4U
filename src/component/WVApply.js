import React from "react";
import {T} from 'component/Lang/Lang';
const WVApply = React.createClass({
    timer: -1,

    getInitialState(){
        return {
            className: ""
        }
    },

    handlerMouseEnter () {
        clearTimeout(this.timer);
        this.setState({
            className: ""
        });
    },

    handlerClick() {

        if(this.state.className !== "") return false;

        this.setState({
            className: this.props.data
        });

        if(typeof this.props.onClick === "function"){
            this.props.onClick();
        }

        clearTimeout(this.timer);
        this.timer = setTimeout((function () {
            this.setState({
                className: ""
            });
        }).bind(this),1000);
    },

    render() {

        return (
            <div className="apply" style={this.props.style || {}}>
                <div className={this.state.className}
                     onMouseEnter={this.handlerMouseEnter}
                     onClick={this.handlerClick}>
                    <a href="javascript:void 0">{this.props.content || T('Apply')}</a>
                </div>
            </div>
        )
    }
});

export default WVApply;