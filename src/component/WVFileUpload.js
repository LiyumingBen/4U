import React from "react";
import FileUpload from "react-fileupload";
import {T} from 'component/Lang/Lang';

//外层调用upload时使用 options和text 两个对象传过来
// options: {
//     baseUrl:"../../ajax/Upgrade.w",
//     chooseFile:function(){...}
//     ...
// },
// text: {
//     label:"请选择文件：",
//     chooseBtn: '选择文件',
//     uploadBtn: '上传'
// }

const WVFileUpload = React.createClass({
    getDefaultProps: function () {
        return {
            text: {},
        }
    },
    getInitialState: function () {
        return {
            fileName: "",//显示在输入框中
            showProgress: false,
            progress: 0
        }
    },
    chooseFile: function (files) {
        if (typeof this.props.options.chooseFile === "function") {
            this.props.options.chooseFile.call(this,files);
        }
        //兼容IE9
        if(typeof files === "string"){
            this.setState({
                fileName: files
            });
        }else {
            this.setState({
                fileName: files[0].name
            });
        }
    },
    beforeUpload: function (files,mill) {
        if(!files || files.length === 0){
            if (this.props.options.onNoFile) {
                this.props.options.onNoFile();
            }
            return false;
        }
        if (typeof this.props.options.beforeUpload === "function") {
            this.props.options.beforeUpload.call(this,files,mill);
        }
        return true;
    },

    doUpload: function (files,mill,xhrID) {
        this.id = xhrID;
    },
    uploading: function (progress) {
        if (typeof this.props.importParams === "function") {
            this.props.importParams();
        }
        if (typeof this.props.options.uploading === "function") {
            this.props.options.uploading.call(this,progress);
        }

        this.setState({
            progress: parseInt(progress.loaded / progress.total * 100),
            showProgress: true
        });

        if(progress.loaded / progress.total > 0.99){
            if(this.props.options.fileUploadComplete){
                this.props.options.fileUploadComplete();
            }
        }
    },

    uploadSuccess: function (resp) {
        if (typeof this.props.options.uploadSuccess === "function") {
            this.props.options.uploadSuccess.call(this,resp);
        }
        console.log(resp);
        this.setState({
            showProgress: false,
            progress: 0
        });
        if (resp.code === 0) {
            if (this.props.options.onComplete) {
                this.props.options.onComplete(resp['data']);
            }
        }else{
            if (this.props.options.onComplete) {
                this.props.options.onComplete(resp);
            }
        }
        try{
            this.refs['file-uploade'].abort(this.id);
        }catch (e){
            console.log(e);
            //window.location.reload();
        }

        this.setState({
            fileName:''
        });
    },

    uploadFail: function (resp) {
        if (typeof this.props.options.uploadFail === "function") {
            this.props.options.uploadFail.call(this,resp);
        }
        console.log(resp);
        try{
            this.refs['file-uploade'].abort(this.id);
        }catch (e){
            console.log(e);
            window.location.reload();
        }
        this.setState({
            fileName:'',
            showProgress: false,
            progress: 0
        });
    },


    uploadError: function (resp) {
        if (typeof this.props.options.uploadFail === "function") {
            this.props.options.uploadFail.call(this,resp);
        }
        console.log(resp);
        try{
            this.refs['file-uploade'].abort(this.id);
        }catch (e){
            console.log(e);
            window.location.reload();
        }
        this.setState({
            fileName:'',
            showProgress: false,
            progress: 0
        });

    },

    getOptions: function () {
        if (!this.props.options || !this.props.options.baseUrl) {
            console.log("WVFileUpload 组件需要传入 option 并且其中必须包含baseUrl !");
            return {
                baseUrl: ""
            }
        }
        return {
            baseUrl: this.props.options.baseUrl,
            dataType: this.props.options.dataType || "json",
            chooseFile: this.chooseFile,
            beforeUpload: this.beforeUpload,
            uploading: this.uploading,
            uploadSuccess: this.uploadSuccess,
            uploadFail: this.uploadFail,
            uploadError: this.uploadError
        }
    },

    render: function () {
        return (
            <form className="form-horizontal" style={this.props.style||{}}>
                <div className="form-group">
                    <div className="col-xs-3" style={{textAlign: 'right'}}>
                        <label className="control-label">{this.props.text.label || T('SelectFile')}</label>
                    </div>
                    <div className="col-xs-5">
                        <input className="form-control" type="text" value={this.state.fileName} readOnly/>
                    </div>
                    <div className="col-xs-4">
                        <FileUpload ref="file-uploade" options={this.getOptions()}>
                            <button type="button" className="btn btn-primary" ref="chooseBtn">{this.props.text.chooseBtn || T('Browse')}</button>
                            <button type="button" style={{marginLeft: '10px'}} className="btn btn-primary"
                                    ref="uploadBtn">{this.props.text.uploadBtn || T('Upload')}</button>
                        </FileUpload>
                    </div>
                    <p style={this.state.showProgress ? {display: "block", textAlign: "center"} : {display: "none"}}>
                    </p>
                </div>

            </form>
        )
    }
});

export default WVFileUpload;