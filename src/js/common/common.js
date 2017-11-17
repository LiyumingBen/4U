import Layer from 'component/Layer/Layer';
import _ from 'underscore';
import {Lang} from 'component/Lang/Lang';
import store from 'store';
import {T} from 'component/Lang/Lang';
(function () {
    // 用于判断对象是否 undefined ，如果是，返回默认值
    window.initObj = (obj, def) => {
        return 'undefined' === typeof obj ? def : obj;
    };

    // 防止回退
    $(document).keydown(function (event) {
        let obj = event.target || event.srcElement;
        let t = obj.type || $(obj).attr('type');
        let vReadOnly = $(obj).attr("readOnly");
        let vDisabled = $(obj).attr("disabled");
        vReadOnly = (vReadOnly === undefined) ? false : vReadOnly;
        vDisabled = (vDisabled === undefined) ? false : vDisabled;
        let flag1 = event.keyCode === 8 && (t === "password" || t === "text" || t === "textarea" || t === "number" || t === "search") && (vReadOnly !== true && vDisabled !== true);
        let flag2 = (event.altKey && (event.keyCode === 37 || event.keyCode === 39)) || event.keyCode === 8;
        if (flag2) {
            if (!flag1) return false;
        }
        return true;
    });

    // 防止页面连接被拖动
    $(document).bind("dragstart", function () {
        return false;
    });

    //
    // $(document).scroll(function () {
    //     $("div.apply").css("right", (60 - $(document).scrollLeft()) + 'px');
    // }).scroll();
}());

// 公用数据
const CommonData = {
    isDebug: true === window.isDebug,
    ajaxType: window.isDebug ? 'GET' : 'POST',
    token: 'NULL',
    currentTime: null,
    license: null,
    // 定时器触发的次数
    updateTimes: 1,
    // 全局每秒刷新的任务
    updateTimeTask: {
        navTimeText: null,
        timeSettingsText: null,
    },
    // 全局刷新子板的任务
    updateBoardTask: {
        boardInfo: null,
        panelInfo: null,
        boardDetail: null,
    },
    // 语言切换任务列表
    updateLangTask: {},
};

// 公用处理
const CommonHandle = {
    doLogin: () => {
        //top.location.href = 'Login.html';
    },
    doHome: (newAddr) => {
        if (newAddr) {
            window.location.href = "http://" + newAddr + "/";
        } else {
            window.location.replace(window.location.pathname+window.location.search);
        }
    },
    tokenExpire: () => {
        Layer.msg({
            icon: 2,
            content: T('LoginExpired'),
            onComplete: () => {
                // CommonHandle.doLogin();
            }
        });
    },
    langChange: (newLang) => {
        ajax({
            url: '',
            data: {
                Type: 'SetLang.w',
                lang: Lang.getApiValueFromLang(newLang),
            },
            isLoadingShow: true,
            isCodeErrorShow: true,
            isOtherErrorShow: true,
            onSuccess: () => {
                // 如果界面语言没有变化，不需要更新
                if (newLang === Lang.get()) {
                    return ;
                }
                // 保存到stroe中
                store['set']('lang', newLang);
                Lang.set(newLang);
                _.each(CommonData.updateLangTask, (task) => {
                    if (null !== task) {
                        task.call();
                    }
                })
            }
        });
    },
    ajaxError: (code, description, isCodeErrorShow) => {

        // 如果是 Token 过期，则特殊处理
        if (1032 === code || 1033 === code) {
            CommonHandle.tokenExpire();
            return;
        }

        description = description ? description : T('Failed');
        if (isCodeErrorShow) {
            Layer.alert({
                icon: 2,
                title: T('Error')+' [E' + code + ']',
                content: description,
            });
        }
    }
};

/* *  xml转json * */
function xml2json(xml, tab) {
    try {
        let newxml = $.parseXML(xml);
        let X = {
            toObj: function (newxml) {
                let o = {};
                //console.log(newxml)
                if (newxml.nodeType === 1) { // element node ..
                    if (newxml.attributes.length) // element with attributes  ..
                        for (let i = 0; i < newxml.attributes.length; i++) o["@" + newxml.attributes[i].nodeName] = (newxml.attributes[i].nodeValue || "").toString();
                    if (newxml.firstChild) { // element has child nodes ..
                        let textChild = 0,
                            cdataChild = 0,
                            hasElementChild = false;
                        for (let n = newxml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType === 1) hasElementChild = true;
                            else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                            else if (n.nodeType === 4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(newxml);
                                for (let n = newxml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType === 3) // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType === 4) // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) { // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array) o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    } else // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            } else { // mixed content
                                if (!newxml.attributes.length) o = X.escape(X.innerXml(newxml));
                                else o["#text"] = X.escape(X.innerXml(newxml));
                            }
                        } else if (textChild) { // pure text
                            if (!newxml.attributes.length) o = X.escape(X.innerXml(newxml));
                            else o["#text"] = X.escape(X.innerXml(newxml));
                        } else if (cdataChild) { // cdata
                            if (cdataChild > 1) o = X.escape(X.innerXml(newxml));
                            else for (let n = newxml.firstChild; n; n = n.nextSibling) o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    //if (!newxml.attributes.length && !newxml.firstChild) {o = null;}
                } else if (newxml.nodeType === 9) { // document.node
                    o = X.toObj(newxml.documentElement);
                } else console.log("unhandled node type: " + newxml.nodeType);
                return o;
            },
            toJson: function (o, name, ind) {
                let json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (let i = 0,
                             n = o.length; i < n; i++) o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                } else if (o === null) json += (name && ":") + "null";
                else if (typeof(o) === "object") {
                    let arr = [];
                    for (let m in o) {
                        if(o.hasOwnProperty(m)){
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                        }                        
                    }
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                } else if (typeof(o) === "string") json += (name && ":") + "\"" + o.toString() + "\"";
                else json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                let s = "";
                if ("innerHTML" in node) s = node.innerHTML;
                else {
                    let asXml = function (n) {
                        let s = "";
                        if (n.nodeType === 1) {
                            s += "<" + n.nodeName;
                            for (let i = 0; i < n.attributes.length; i++) s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (let c = n.firstChild; c; c = c.nextSibling) s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            } else s += "/>";
                        } else if (n.nodeType === 3) s += n.nodeValue;
                        else if (n.nodeType === 4) s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (let c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (let n = e.firstChild; n;) {
                    if (n.nodeType === 3) { // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            let nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else n = n.nextSibling;
                    } else if (n.nodeType === 1) { // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else // any other node
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (newxml.nodeType === 9) // document node
            newxml = newxml.documentElement;
        let json = X.toJson(X.toObj(X.removeWhite(newxml)), newxml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/[\t\n]/g, "")) + "\n}";
    }
    catch (err) {
        return "{}";
    }
}
function xmlstr2jsonobj(xml) {    
    let jsonstr = xml2json(xml, "  ");
    let jsonobj = eval('(' + jsonstr + ')');
    if (!jsonobj) {
        jsonobj = {};
    }
    return jsonobj;
}
/* *  json转xml * */
function json2xml(jsonObj, rootNode) {
    if (Object.prototype.toString.call(jsonObj) !== '[object Object]') return;
    let xmldoc = [];
    xmldoc.push('');
    if (rootNode) xmldoc.push('<' + rootNode + '>');
    function toXml(jsonObj) {

        if( !((typeof jsonObj === "object") && (jsonObj !== null)) ){
            xmldoc.push(jsonObj);
            return;
        }

        for (let m in jsonObj) {
            if(!jsonObj.hasOwnProperty(m)){
                continue;
            }
            if (Object.prototype.toString.call(jsonObj[m]) === '[object Array]') {
                for (let i = 0, len = jsonObj[m].length; i < len; i++) {
                    xmldoc.push('<' + m + '>');
                    toXml(jsonObj[m][i]);
                    xmldoc.push('</' + m + '>');
                }
                xmldoc.push('');
            }
            else if (Object.prototype.toString.call(jsonObj[m]) === '[object Object]') {
                xmldoc.push('<' + m + '>');
                toXml(jsonObj[m]);
                xmldoc.push('</' + m + '>');
                xmldoc.push('');
            }
            else {
                xmldoc.push('<' + m + '>' + jsonObj[m] + '</' + m + '>');
            }
        }
    }

    function txtToXML(txt) {
        if (txt) {
            try {
                return new DOMParser().parseFromString(txt, "text/xml");
            } catch (e) {
                let xmlDom = new ActiveXObject("Microsoft.XMLDOM");
                xmlDom.loadXML(txt);
                return xmlDom;
            }
        }
    }

    toXml(jsonObj);
    if (rootNode) {xmldoc.push('');}
    return serializeXml(txtToXML(xmldoc.join('')));
}

function serializeXml(xmldom) {
    let sHead = '<?xml version="1.0"  encoding="UTF-8" ?>';
    if (typeof XMLSerializer !== "undefined") {
        return sHead + (new XMLSerializer()).serializeToString(xmldom);
    } else if (document.implementation.hasFeature("LS", "3.0")) {
        let implementation = document.implementation;
        let serializer = implementation['createLSSerializer']();
        return sHead + serializer['writeToString'](xmldom);
    } else if (typeof xmldom.xml !== "undefined") {
        return sHead + xmldom.xml;
    } else {
        throw new Error("Could not serialize XML DOM.");
    }
}

/**
 * ajax({
 *     Number timeout = 15：超时时间，单位为秒
 *     Boolean isLoadingShow = false：是否显示 Loading
 *     Boolean isCodeErrorShow = false：请求成功后，返回 code 不为 0 时，是否显示错误提示
 *     Boolean isOtherErrorShow = false：请求失败（网络错误等）时，是否显示错误提示
 *     Function onSuccess(data)：请求成功的回调
 *     Function onError(code, description)：请求失败的回调
 * })
 * @param options
 * @author jia.lin
 */
function ajax(options) {
    let jqXHR = null,
        loadingIndex = -1,
        requestAbortTimer = null;

    options.url = '/web/api/' + options.data.Type;    
    options.type = initObj(options.type, 'POST');
    options.dataType = initObj(options.dataType, "xml");
    options.contentType = initObj(options.contentType, "text/html; charset=utf-8");
    options.data = initObj(options.data, {});
    options.data['token'] = CommonData.token;
    options.data = json2xml({"Msg":options.data});
    options.isLoadingShow = initObj(options.isLoadingShow, false);
    options.isCodeErrorShow = initObj(options.isCodeErrorShow, false);
    options.isOtherErrorShow = initObj(options.isOtherErrorShow, false);
    options.timeout = initObj(options.timeout, 15) * 1000;
    options.onSuccess = initObj(options.onSuccess, $.noop);
    options.onError = initObj(options.onError, $.noop);
    options.onComplete = initObj(options.onComplete, $.noop);
    
    // 在发送请求之前调用
    options.beforeSend = (xmlHttp) => {
        xmlHttp.setRequestHeader("If-Modified-Since", "0");
        xmlHttp.setRequestHeader("Cache-Control", "no-cache");
    }; 

    // 请求成功后的回调函数
    options.success = (xml) => {    
        try{
            let data = (xmlstr2jsonobj(xml))['Msg'];        
            // 进行数据判断   
            if ('0' === data.code) {
                const content = typeof data['Data'] !== 'undefined' ? data['Data'] : {};                
                options.onSuccess(content);
            } else {
                data['description'] = data['description'] ? data['description'] : T('Failed');
                CommonHandle.ajaxError(data['code'], data['description'], options.isCodeErrorShow);
                // 错误回调函数
                options.onError(data['code'], data['description']);
            }
        }catch(err){                
        }        
    };

    // 请求失败时调用此函数
    options.error = (jqXHR, textStatus) => { 

        textStatus = textStatus || T('Failed');
        // 显示错误信息
        if (options.isOtherErrorShow) {
            Layer.msg({
                icon: 2,
                content: textStatus
            });
        }
        options.onError(-1, textStatus);
    };

    // 请求成功或失败之后均调用
    options.complete = (XHR, TS) => {
        
       try{
            let data = (xmlstr2jsonobj(XHR.responseText))['Msg'];        
            // 进行数据判断   
            if ('0' === data.code) {
                const content = typeof data['Data'] !== 'undefined' ? data['Data'] : {};                
                options.onSuccess(content);
            } else {
                data['description'] = data['description'] ? data['description'] : T('Failed');
                CommonHandle.ajaxError(data['code'], data['description'], options.isCodeErrorShow);
                // 错误回调函数
                options.onError(data['code'], data['description']);
            }
        }catch(err){                
        }    


        // 关闭 Loading
        if (options.isLoadingShow) {
            Layer.close(loadingIndex);
        }
        // 清除超时定时器
        if (null !== requestAbortTimer) {
            clearTimeout(requestAbortTimer);
            requestAbortTimer = null;
        }        
        options.onComplete(TS);
    };

    // 显示 Loading
    if (options.isLoadingShow) {
        loadingIndex = Layer.load();
    }

    // 发起请求
    jqXHR = $.ajax(options);

    // 清除旧定时器
    if (null !== requestAbortTimer) {
        clearTimeout(requestAbortTimer);
        requestAbortTimer = null;
    }
    // 启动超时定时器
    requestAbortTimer = setTimeout(() => {
        requestAbortTimer = null;
        if (jqXHR.abort && $.isFunction(jqXHR.abort)) {
            jqXHR.abort();
        }
        if (options.isOtherErrorShow) {
            Layer.msg({
                icon: 2,
                content: T('NetworkProblems')
            });
        }
    }, options.timeout);
}

const IPUtils = {
    getIPFromApiValue: (value) => {
        let str = [];
        str[0] = String((value >>> 24) >>> 0) + '.';
        str[1] = String(((value << 8) >>> 24) >>> 0) + '.';
        str[2] = String((value << 16) >>> 24) + '.';
        str[3] = String((value << 24) >>> 24);
        return str[0] + str[1] + str[2] + str[3];
    },
    getApiValueFromIP: (IP) => {
        let value = [];
        IP = IP.split('.');
        value[0] = Number(IP[0]) * 256 * 256 * 256;
        value[1] = Number(IP[1]) * 256 * 256;
        value[2] = Number(IP[2]) * 256;
        value[3] = Number(IP[3]);
        return value[0] + value[1] + value[2] + value[3];
    }
};

const DateUtils = {
    format: function (fmt) {
        let o = {
            "M+": this.getMonth() + 1, //月份

            "d+": this.getDate(), //日

            "h+|H+": this.getHours(), //小时

            "m+": this.getMinutes(), //分

            "s+": this.getSeconds(), //秒

            "q+": Math.floor((this.getMonth() + 3) / 3), //季度

            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    },
    getDateFromApiString: (str) => {
        if (typeof str !== "string") return null;
        let arr, date;
        if (arr = str.match(/([\d]{4})([\d]{2})([\d]{2})T([\d]{2}):([\d]{2}):([\d]{2})([+-][\d]{4})/)) {
            let time = Date.UTC(arr[1], arr[2] - 1, arr[3], arr[4], arr[5], arr[6]) - parseInt(arr[7]) * 60 * 60 * 10;
            date = new Date(time);
            return date;
        } else {
            console.log("getDateFromTimeString('" + str + "') err!");
            return null;
        }
    },
    getApiStringFromDate: (date) => {
        if (typeof date !== "object") return "";
        let fix = CommonUtils.fix;
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let timezoneoffset = date.getTimezoneOffset();
        let timezonestring = fix(Math.abs(date.getTimezoneOffset() / 60), 2);

        return year + fix(month, 2) + fix(day, 2) + "T" + fix(hours, 2) + ":" + fix(minutes, 2) + ":" + fix(seconds, 2) + (timezoneoffset > 0 ? "-" : "+") + timezonestring + "00";
    },
    getDayFromSecond: (data) => {
        if (isNaN(Number(data))) return '';
        data = parseInt(data);
        let units = [T('Second'), T('Minute'), T('Hour'), T('Day')];
        let unitsPow = [60, 60, 60, 24];
        let curunitindex = 0;
        let str = '';
        while (curunitindex < units.length) {
            if (data < unitsPow[curunitindex] || ( units.length - 1 === curunitindex)) {
                str = data + units[curunitindex] + str;
                break;
            }
            let per = unitsPow[curunitindex + 1];
            str = parseInt(data % per) + units[curunitindex] + str;
            data = parseInt(data / per);
            curunitindex++;
        }
        return str;
    }
};
Date.prototype.format = DateUtils.format;

const ValidateUtils = {
    isIP: function (strIP) {
        if (typeof strIP === "undefined") {
            return false;
        }
        let strip = strIP + '';
        let reSpaceCheck = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        let str = strip.replace(/^\s+|\s+$/g, '');
        if (reSpaceCheck.test(str)) {
            str.match(reSpaceCheck);
            return (RegExp.$1 <= 255 && RegExp.$2 <= 255 && RegExp.$1 >= 0 && RegExp.$2 >= 0 && RegExp.$3 <= 255 && RegExp.$3 >= 0 && RegExp.$4 <= 255 && RegExp.$4 >= 0);
        } else {
            return false;
        }
    },
    isNumber: function (strNumber) {
        if (typeof strNumber === "undefined") {
            return false;
        }
        let strNum = strNumber + '';
        let reSpaceCheck = /^-*\d+$/;
        let str = strNum.replace(/^\s+|\s+$/g, '');
        return reSpaceCheck.test(str);
    },
    /* *  解决某些需要作为数组处理的对象在xml转json时转为非数组对象的问题 */
    ArrayCheck: function(array) {
        if (!(array instanceof Object)) {
            console.log("parameter error");
            return [];
        } else if (array instanceof Array) {
            return array;
        } else {
            let array1 = [];
            array1[0] = array;
            return array1;
        }
    }
};

const CommonUtils = {
    /**
     * 将十进制整型数组转化为二进制整型数组
     * @param decimalArr 十进制整型数组
     * @param decimal_bit 十进制整型数的位数(16,32,...)
     * @returns {Array} 二进制整型数组
     * @author jia.lin
     */
    DecimalArrToBinaryArr: function (decimalArr, decimal_bit) {
        let binaryArr = [];

        decimalArr.forEach((item) => {
            // 将整型转化为二进制字符串
            let binaryStr = item.toString(2);

            // 补齐位数
            while (binaryStr.length < decimal_bit) {
                binaryStr = "0" + binaryStr;
            }

            // 将二进制字符串分割为数组，再进行倒序，再将每一项转化为整型，再合并
            binaryArr = binaryArr.concat(binaryStr.split("").reverse().map((item) => {
                return Number(item);
            }));
        });

        return binaryArr;
    },
    /**
     * 将二进制整型数组转化为十进制整型数组
     * @param binaryArr 二进制整型数组
     * @param decimal_bit 十进制整型数的位数(16,32,...)
     * @returns {Array} 十进制整型数组
     * @author jia.lin
     */
    BinaryArrToDecimalArr: function (binaryArr, decimal_bit) {
        let decimalArr = [];

        // 将二进制整型数组按 十进制整型数的位数 分割并倒序为小数组，
        for (let i = 0; i < binaryArr.length; i += decimal_bit) {
            decimalArr.push(binaryArr.slice(i, i + decimal_bit).reverse());
        }

        decimalArr = decimalArr.map((item) => {
            let binaryStr = "";
            item.forEach((binary) => {
                binaryStr += binary;
            });

            // 将二进制字符串转化为十进制整型
            return parseInt(binaryStr, 2);
        });

        return decimalArr;
    },

    getEnableOfDecimalArr: function (decimalArr) {
        let count = 0;
        decimalArr.forEach((item) => {
            let binaryStr = item.toString(2);
            console.log(binaryStr);
            for (let i = 0; i < binaryStr.length; i++) {
                if ("1" === binaryStr.charAt(i)) {
                    count++;
                }
            }
        });
        return count;
    },

    // 获取八位随机数的SessionID
    getSessionID: () => {
        let sessionID = '';
        for (let i = 0; i < 8; i++) {
            const random = Math.floor(Math.random() * 36);
            sessionID += random < 10 ? random : String.fromCharCode(65 + random - 10);
        }
        return sessionID;
    },

    /**
     *
     * 将数据《d》的长度扩充到《l》位(在前面补充《f》)
     * 《f》默认为0
     */
    fix: (d, l, f) => {
        let da = d + '';
        let s = '';
        for (let i = da.length; i < l; i++) {
            s += (f ? f + '' : '0');
        }

        return s + da;
    }
};

// 公用数据
exports.CommonData = CommonData;
// 公用处理
exports.CommonHandle = CommonHandle;
// ajax请求
exports.ajax = ajax;
// 公用相关操作
exports.CommonUtils = CommonUtils;
// IP相关处理
exports.IPUtils = IPUtils;
// 日期相关处理
exports.DateUtils = DateUtils;
// 数据校验相关处理
exports.ValidateUtils = ValidateUtils;