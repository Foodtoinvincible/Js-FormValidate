
import $ from 'jquery'


export default {


    info: function (message) {

        let conf = this._getConf(message);
        conf.icon = '<i class="fa fa-exclamation-circle icon info" aria-hidden="true"></i>';
        this._getContent(message,conf);
        this._background(conf,'info');
        return this._create(conf);
    },
    error: function(message){

        let conf = this._getConf(message);
        conf.icon = '<i class="fa fa-times-circle icon error" aria-hidden="true"></i>';
        this._getContent(message,conf);
        this._background(conf,'error');
        return this._create(conf);
    },

    success: function(message){
        let conf = this._getConf(message);
        conf.icon = '<i class="fa fa-check-circle icon icon success" aria-hidden="true"></i>'
        this._getContent(message,conf);
        this._background(conf,'success');
        return this._create(conf);
    },
    warning: function (message) {

        let conf = this._getConf(message);
        conf.icon = '<i class="fa fa-exclamation-circle icon warning" aria-hidden="true"></i>';
        this._getContent(message,conf);
        this._background(conf,'warning');
        return this._create(conf);
    },

    panel: function(message){
        let conf = this._getConf(message);
        this._getContent(message,conf);
        return this._create(conf);
    },

    _background: function(conf,type){

        if (conf.background){
            conf.class = 'background bg-' + type;
        }
    },

    _config: {
        // 多少毫秒后关闭 <= 0 不关
        duration: 2500,
        // 背景色
        background: false,
        // 前景色
        color: null,
        // 提示内容
        content: '',
        // 关闭时回调
        onclose: null,
        // 距离上一个多远
        top: 15,
        icon: '',
        animate_duration: 500,
        // 是否开启关闭按钮
        closable: false,
        // 显示头 如果为字符串 则视为自定义头部
        header: false,
        // 标题
        title: '',
        // 显示底 如果为字符串 则视为自定义头部
        footer: false,
        // 底部确认按钮 如果为函数,用户点击回调
        confirm: true,
        // 底部确认按钮文字
        confirm_text: '确认',
        // 底部取消按钮 如果为函数,用户点击回调
        cancel: false,
        // 底部取消按钮文字
        cancel_text: '取消',
        // 宽度 高度
        area: [],
        // 是否开启遮罩 谁开启遮罩谁能关闭
        mask: false,
        // 父节点 id 不要 #
        parent_id: 'message',
        // 是否移除父节点
        remove_parent: false,
        // 位置
        offset: 'right'
    },

    setConfig(conf){
        this._config = Object.assign({},this._config,conf);
    },

    _getConf: function (conf) {
        let config = JSON.parse(JSON.stringify(this._config));
        if (conf && typeof conf != 'string' && typeof message != 'number'){
            return $.extend(config,conf)
        }
        return config;
    },
    _getContent: function(message,conf){
        if (typeof message == 'string' || typeof message == 'number'){
            conf.content = message;
        }else{
            Object.assign(conf,message);
        }
    },

    _getId: function(conf){

        if ($('#' + conf.parent_id).length === 0){
            $('body').append('<div data-mask_status="B" data-mask="" class="message" id="' + conf.parent_id + '"></div>');
        }

        return 'MessageId_' + parseInt(Math.random() * 10000000);

    },

    _hideHtml: function(msg,conf){
        if (conf.closable){
            let self = this;
            msg.append('<div class="hide ml-auto mr-0"><i class="fa fa-times" aria-hidden="true"></i></div>\n')
            msg.find('.hide i').bind('click',function () {
                self.hide($('#' + msg.parent('.message-item').attr('id')),conf);
            });
        }
    },
    _headerHtml: function(msg,conf){
        if (conf.header || conf.title){
            if (typeof conf.header == 'string'){
                msg.prepend('<div class="message-header"><div class="header-text">' + conf.icon + conf.header  + '</div></div>');
                this._hideHtml(msg.find('.message-header'),conf);
            }else{
                msg.prepend('<div class="message-header"><div class="header-text">' + conf.icon + conf.title + '</div></div>');
                this._hideHtml(msg.find('.message-header'),conf);
            }
        }else if(conf.closable){
            this._hideHtml(msg.find('.message-prompt'),conf);
        }
    },
    _bodyHtml: function(msg,conf){
        msg.append('<div class="message-body">\n' + (conf.header || conf.title ? '' : conf.icon) + '\n' +
            conf.content + '\n' +
            '</div>');
    },
    _footerHtml: function(msg,conf){
        if (conf.footer){
            if (typeof conf.footer == 'string'){
                msg.append('<div class="message-footer">' + conf.footer + '</div>');
            }else{
                let html = '<div class="message-footer">',
                    self = this;

                if (conf.cancel){
                    html += '<button class="cancel">' + conf.cancel_text + '</button>'
                }
                if (conf.confirm){
                    html += '<button class="confirm">' + conf.confirm_text + '</button>'
                }
                msg.append(html + '</div>');
                if (conf.cancel) {
                    msg.find('.message-footer .cancel').bind('click',function () {
                        (conf.cancel instanceof Function) && conf.cancel(function () {
                            self.hide(msg,conf);
                        }) === true && self.hide(msg,conf);
                    });
                }
                if (conf.confirm) {
                    msg.find('.message-footer .confirm').bind('click',function () {
                        (conf.confirm instanceof Function) && conf.confirm(function () {
                            self.hide(msg,conf);
                        }) === true && self.hide(msg,conf);
                    });
                }
            }
        }
    },
    _setMask(msg,conf){
        if (conf.mask){
            let rand = 'A'+Math.random();
            if (msg.parent().data('mask_status') !== 'A'){
                msg.parent().addClass('message-mask').data('mask',rand).data('mask_status','A');
                msg.data('mask',rand);
            }

        }

    },

    hide: function (msg,conf) {
        // 谁拉起的遮罩。那么就只允许它关闭
        if (msg.data('mask') === msg.parent().data('mask')) {
            msg.parent().removeClass('message-mask').data ('mask_status','B');
        }
        msg.addClass('remove');
        conf.onclose && conf.onclose();
        setTimeout(function () {
            if (conf.remove_parent) msg.parent().remove();
            msg.remove();
        },conf.animate_duration);

    },


    _create: function (conf) {
        let msgId = this._getId(conf);
        let html = '<div class="message-item"  id="' + msgId + '">\n' +
            '       <div class="message-prompt">' +
            '       </div>\n' +
            '   </div>';
        let msg = $('#' + conf.parent_id).append(html).find('#' + msgId),
            self = this;
        if (conf.class && typeof conf.class == 'string') msg.addClass(conf.class);
        if (conf.color && typeof conf.color == 'string') msg.css('color' ,conf.color);
        if (conf.background && typeof conf.background == 'string') msg.css('background' ,conf.background);

        self._bodyHtml(msg.find('.message-prompt'),conf);
        self._headerHtml(msg,conf);
        self._footerHtml(msg,conf);
        if (msg.find('.message-header').length || msg.find('.message-footer').length){
            msg.addClass('auto-width').find('.message-prompt').css('min-height',100).css('padding',16);
            msg.css('border-radius',10)
        }
        if (conf.area.length > 0) msg.css('width',conf.area[0]);
        if (conf.area.length > 1) msg.css('height',conf.area[1]);
        self._setMask(msg,conf);
        if (conf.offset){
            switch (conf.offset) {
                case 'left':
                    msg.addClass('left');
                    break;
                case 'right':
                    msg.addClass('right');
                    break;
                case 'center':
                    msg.addClass('center');
                    break;
                case 'left bottom':
                    msg.addClass('left-bottom');
                    break;
                case 'right bottom':
                    msg.addClass('right-bottom');
                    break;
                case 'bottom':
                    msg.addClass('bottom');
                    break;
                case 'left center':
                    msg.addClass('left-center');
                    break;
                case 'right center':
                    msg.addClass('right-center');
                    break;
                case 'top':
                    msg.addClass('top');
                    break;
                default:
                    msg.css('position','absolute').css(conf.offset);
                    break;
            }
        }
        if (conf.duration > 0){
            setTimeout(function () {
                self.hide(msg,conf);
            },conf.duration);
        }
        return msg;
    }
};