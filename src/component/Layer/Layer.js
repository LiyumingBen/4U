import './Layer.less';
import {T} from 'component/Lang/Lang';
export default class Layer {

    static open(...params) {
        window.layer.open(...params);
    }

    static load(options) {
        options = options || {};
        options.icon = options.icon || 2;

        return window.layer.load(options.icon, options);
    }

    static msg(options) {
        options = options || {};
        options.content = options.content || '';
        options.icon = typeof options.icon !== 'undefined' ? options.icon : 1;
        options.time = options.time || 2000;
        options.onComplete = options.onComplete || function() {};

        window.layer.msg(options.content, options, options.onComplete)
    }

    /**
     * Layer.alert({
     *     String content: 提示内容
     * })
     * @param options
     */
    static alert(options) {
        options = typeof options !== 'undefined' ? options : {};
        options.title = options.title || T('Information');
        options.btn = options.btn || ["OK"];
        options.content = typeof options.content !== 'undefined' ? options.content : '';
        options.icon = typeof options.icon !== 'undefined' ? options.icon : 1;
        options.onEnter = typeof options.onEnter !== 'undefined' ? options.onEnter : function() {};

        window.layer.alert(options.content, options, (layerIndex) => {
            window.layer.close(layerIndex);
            options.onEnter();
        });
    }

    /**
     * 使用说明：
     * Layer.confirm({
     *     icon  —— 图标类型，默认为3
     *     title  —— 标题
     *     content  —— 内容
     *     onEnter  —— 点击确认后的回调
     * })
     * @param options
     * @author jia.lin
     */
    static confirm(options) {
        options = options || {};
        options.icon = options.icon || 3;
        options.title = options.title || T('Tips');
        options.content = options.content || '';
        options.btn = options.btn || ["OK", T('Cancel')];
        options.onEnter = options.onEnter || function() {};
        options.onCancel = options.onCancel || function() {};

        window.layer.confirm(options.content, options, (layerIndex) => {
            window.layer.close(layerIndex);
            options.onEnter();
        }, (layerIndex) => {
            window.layer.close(layerIndex);
            options.onCancel();
        });
    }

    /**
     * 使用说明：
     * > const progressBar = Layer.progress(options)  —— 获得实例对象
     * >     options.content  —— 文本提示内容
     * >     options.total  —— 进度条总时间，单位为秒
     * >     options.onComplete  —— 进度条走完时的回调
     * > progressBar.start(callback)  —— 弹出进度条，因其为异步操作，需要在回调中进行下一步操作
     * > progressBar.setRemain(remain)  —— 重设剩余进度时间，单位为秒
     * > progressBar.setContent(content)  —— 重设文本提示内容
     * > progressBar.stop()  —— 强制中断进度条
     *
     * @param options
     * @author jia.lin
     */
    static progress(options) {
        options = options || {};
        options.content = options.content || '...';
        options.total = options.total || 1.0;
        options.onComplete = options.onComplete || function() {};

        return {
            current: 0,
            interval: 100, // 进度条更新间隔，单位：毫秒
            speed: 100 / options.total, // 速度 = 路程/时间
            timer: null,
            layerIndex: -1,
            start: function(callback) {
                callback = callback || function() {};

                let content = '';
                content += '<div id="progress-title">' + options.content + '</div>';
                content += '<div class="progress" style="width: 468px;height: 21px;">';
                content += '<div id="progress-bar" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="5" aria-valuemax="100" style="width: 0">';
                content += '</div>';
                content += '</div>';

                this.layerIndex = window.layer.open({
                    skin: 'layer-progress',
                    title: false,
                    content: content,
                    btn: false,
                    closeBtn: 0,
                    area: ['503px', '83px'],
                    success: () => {
                        clearInterval(this.timer);
                        this.timer = setInterval(() => {
                            this.handleUpdate()
                        }, this.interval);
                        callback();
                    },
                    end: () => {
                        clearInterval(this.timer);
                    }
                });
            },
            setRemain: function (remain) {
                this.speed = (100 - this.current) / remain;
            },
            setContent: function (content) {
                $('#progress-title').html(content);
            },
            handleUpdate: function () {
                console.log('handleUpdate');
                if (this.current <= 100) {
                    $('#progress-bar').css('width', this.current + '%');
                    this.current += this.speed / (1000 / this.interval)
                } else {
                    clearInterval(this.timer);

                    setTimeout(() =>{
                        options.onComplete();
                        window.layer.close(this.layerIndex);
                    }, 500);
                }
            },
            stop: function (noComplete) {
                clearInterval(this.timer);
                if(!noComplete){
                    options.onComplete();
                }
                window.layer.close(this.layerIndex);
            }
        };
    }

    /**
     * 关闭特定层
     * @param index
     * @author jia.lin
     */
    static close(index) {
        window.layer.close(index);
    }
}