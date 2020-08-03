/**
 * Created by PhpStorm.
 * @Author: 天上
 * @Time: 2020/7/23 0:19
 * @Email: 30191306465@qq.com
 */
import Validate from './validate';

/**
 * 表单验证
 * @param {HTMLFormElement} form
 * @param {Function} callback
 * @param {Boolean} listen    是否监听 默认是
 * @constructor
 */
class Form{
    constructor (form,callback,listen = true) {

        this._form = form;
        // 回调函数
        this.submitCallback = callback;

        // 验证规则
        this._rule = {};

        this.conf = {
            // 验证规则默认读取属性
            verify_rule_attr: 'data-verify-rule',
            // 检测方式默认读取属性
            check_mode_attr: 'data-check-mode',
            // 验证失败信息提示读取属性
            msg_attr: 'data-msg',

            // 验证失败时为当前验证项添加一个class
            error_class: 'form-item-check-error',
            // 显示错误信息
            show_error_msg: true,
        };
        this._message = {};
        /**
         * @type {Validate}
         * @private
         */
        this._validate = new Validate();

        // 事件处理者
        this.eventHandler = {
            submit: this.formSubmitEvent.bind(this),
            change: this.changeEvent.bind(this),
            blur: this.blurEvent.bind(this),
        }

        // 事件注册记录
        this.eventRegister = {
            submit: [],
            change: [],
            blur: [],
        };

        if (listen){
            this.bindEvent(this._form,'submit');
            // 元素监听
            this.__getFormDom(this._form).forEach(elem => {
                this.addListen(elem);
            });
        }

        this.formData = {

            get(form) {
                let data = {};
                this.__getInput(form, data);
                this.__getSelect(form, data);
                this.__getTextarea(form, data);
                return JSON.parse(JSON.stringify(data));
            },
            __getInput(form, data) {
                let input = form.querySelectorAll('input');
                input.forEach(item => {
                    if (item.name) {
                        let val;
                        if (item.type === 'checkbox' || item.type === 'radio') {
                            if (item.checked) {
                                val = item.value;
                            } else {
                                val = false;
                            }
                        } else {
                            val = item.value;
                        }
                        this.__save(item.name, val, data);
                    }
                });
            },

            __getSelect(form, data) {
                let select = form.querySelectorAll('select');
                select.forEach(item => {
                    if (item.name && item.selectedIndex && item.options[item.selectedIndex]) {
                        this.__save(item.name, item.options[item.selectedIndex].value, data);
                    }
                });
            },

            __getTextarea(form, data) {
                let textarea = form.querySelectorAll('textarea');
                textarea.forEach(item => {
                    if (item.name) {
                        this.__save(item.name, item.value, data);
                    }
                });
            },

            __save(name, val, data) {

                // 不需要多级
                if (!/\[.*]/.test(name)) {
                    data[name] = val;
                    return;
                }

                if (/^([^\[]+)/g.exec(name)) {
                    let res = /^([^\[]+)/g.exec(name)[1];
                    name = name.replace(res, '');

                    if (!data[res]) {
                        data[res] = [];
                    }
                    data = data[res];
                }

                while (/\[.*]/.test(name)) {

                    let exec = /^\[([^]]*)/g.exec(name);
                    let key = exec[1].replace(']', '');
                    name = name.replace('[' + key + ']', '');
                    if (key) {
                        if (!data[key]) {
                            data[key] = [];
                        }
                        data = data[key];
                    } else {
                        break;
                    }
                    if (!/\[.*]/.test(name)) {
                        // 到最后了
                        if (!name) {
                            data.push(val);
                        } else {
                            data[name] = val;
                        }
                    }

                }
            }
        }
    }

    /**
     * 设置或获取Validate 对象
     * @param {Validate} validate
     * @returns {Validate}
     */
    validate(validate = null){
        if (validate){
            this._validate = validate;
        }
        return this._validate;
    }

    /**
     * 添加字段验证规则
     * @param {Object|string} rule 字段名称或者规则数组
     * @param val 验证规则
     * @returns {this}
     */
    rule(rule,val = null){

        if (!val){
            Object.assign(this._rule,rule);
        }else{
            this._rule[rule] = val;
        }
        return this;
    };

    /**
     * 添加字段提示文本
     * @param {Object|string} data 字段名称或者字段提示文本对象
     * @param val
     * @returns {this}
     */
    message(data,val = null){
        if (!val){
            Object.assign(this._message,data);
        }else{
            this._message[data] = val;
        }
        return this;
    };

    /**
     * 表单提交事件
     * @param e
     */
    formSubmitEvent(e){
        let formData = this.formData.get(e.target);
        let checkResult = this.check(e.target,formData);
        this.submitCallback && this.submitCallback(formData,e,checkResult);
    }

    /**
     * 绑定事件
     * @param {HTMLElement} elem
     * @param {String} name
     * @param {Function|null|undefined} fn
     */
    bindEvent(elem,name,fn= null){

        if (!fn) fn = this.eventHandler[name];
        this.eventRegister[name].push({
            elem: elem,
            fn: fn
        });
        elem.addEventListener(name,fn);
    }

    /**
     * 新增监听
     * @param elem
     */
    addListen(elem){
        let mode = elem.getAttribute(this.conf.check_mode_attr);
        mode = mode ? mode : 'blur';
        if (mode){
            if (mode.toLocaleLowerCase() === 'change'){
                this.bindEvent(elem,'change')
            }
            if (mode.toLocaleLowerCase() === 'blur'){
                this.bindEvent(elem,'blur')
            }
        }
    }

    /**
     * 实时监测
     * @param e
     */
    changeEvent(e) {
        let data = this.formData.get(this._form);
        this.checkItem(e.target,data);
    };

    /**
     * 元素失去焦点触发检测
     * @param e
     */
    blurEvent(e){
        let data = this.formData.get(this._form);
        this.checkItem(e.target,data);
    };

    /**
     * 效验
     * @param form
     * @param data
     * @returns {boolean}
     */
    check(form,data){
        let valid = true;
        this.__getFormDom(form).forEach(elem =>{
            if (elem.name && !this.checkItem(elem,data)){
                valid = false;
            }
        });
        return valid;
    }
    /**
     * 效验元素项
     * @param elem
     * @param data
     * @returns {boolean}
     */
    checkItem(elem,data){
        let field = this.__handleDomKey(elem.name),
            value = this.__getElemVal(elem),
            rule = this.__getRule(field,elem);
        if (!rule) return true;
        // Validate->checkItem 验证失败 返回 rule field
        let res = this._validate.checkItem(field,value,rule,data);
        if (res !== true){
            let msg = this.__getMsg(field,res,elem);
            msg = msg ? msg : res;
            if(this.conf.show_error_msg){
                this.showError(elem,msg);
            }
            return false;
        }else{
            if(this.conf.show_error_msg){
                this.removeError(elem);
            }
            return true;
        }
    }
    /**
     * 获取元素验证规则
     * @param field  字段名称
     * @param elem  只有 this._rule[name] 不存在时 才会读取 elem元素中定义的属性规则
     * @returns {*|null}
     */
    __getRule (field,elem) {

        if (this._rule[field])
            return this._rule[field];
        let rule = elem.getAttribute(this.conf.verify_rule_attr);
        return rule ? rule : null;
    }
    /**
     * 获取提示信息
     * @param field     字段名称
     * @param errorInfo 错误信息
     * @param elem      元素
     * @returns {string|*}
     * @private
     */
    __getMsg(field,errorInfo,elem){
        let rule = errorInfo.split(' ')[0];
        if (this._message[field + '.' + rule]){
            return this._message[field + '.' + rule];
        }
        if (this._message[field])
            return this._message[field];
        let msg = elem.getAttribute(this.conf.msg_attr);
        // 判断是否为JSON
        if (/^{[\s\S]+}$/.test(msg)){
            try{
                let tmp = JSON.parse(msg);
                for(let k in tmp){
                    if(tmp.hasOwnProperty(k) && k === rule){
                        return tmp[k];
                    }
                }
            }catch (e) {
            }
        }
        return msg;
    }
    /**
     * 显示错误信息
     * @param elem  要显示的元素
     * @param msg   错误信息
     */
    showError (elem,msg) {
        elem.classList.add(this.conf.error_class);
        for (let i = 0; i < elem.parentNode.children.length; i++){
            if (elem.parentNode.children[i].classList.contains('form-item-check-error-msg'))
                elem.parentNode.children[i].remove();
        }
        let span = document.createElement('SPAN');
        span.classList.add('form-item-check-error-msg');
        span.innerHTML = msg;
        elem.parentNode.appendChild(span);
    }
    /**
     * 移除元素显示的错误信息
     * @param elem
     */
    removeError(elem){
        elem.classList.remove('form-item-check-error');
        for (let i = 0; i < elem.parentNode.children.length; i++){
            if (elem.parentNode.children[i].classList.contains('form-item-check-error-msg'))
                elem.parentNode.children[i].remove();
        }
    }

    /**
     * 获取表单元素的值
     * @param elem
     * @returns {null|boolean|*}
     * @private
     */
    __getElemVal(elem){

        switch (elem.tagName.toLocaleUpperCase()) {
            case 'INPUT':
                if (elem.type === 'checkbox' || elem.type === 'radio'){
                    if (elem.checked){
                        return elem.value;
                    }else{
                        return false;
                    }
                }else{
                    return elem.value;
                }
            case 'SELECT':
                if (elem.name && elem.selectedIndex && elem.options[elem.selectedIndex]){
                    return elem.options[elem.selectedIndex].value;
                }
                return null;
            case 'TEXTAREA':
                return elem.value;
            default:
                return null;
        }
    };

    /**
     * 获取表单元素
     * @param form
     * @returns {NodeListOf<HTMLElementTagNameMap[string]> | NodeListOf<Element> | NodeListOf<SVGElementTagNameMap[string]>}
     * @private
     */
    __getFormDom(form){
        return form.querySelectorAll('input,select,textarea');
    }

    /**
     * 处理表单元素 name
     *      a  处理成 a
     *      a[a][b][c] 处理成 a.a.b.c
     *      a[a][][c] 处理成 a.a.c 会忽略[] 这个
     * @param name
     * @private
     */
    __handleDomKey(name){

        let res = /^([^\[]+)/g.exec (name)[1];
        name = name.replace (res, '');
        while (/\[.*]/.test(name)){
            let exec = /^\[([^]]*)/g.exec(name);
            let key = exec[1].replace(']','');
            name = name.replace ('[' + key + ']' , '');
            // 忽略[]这种
            if (!key) continue;
            res += '.' + key;
        }
        return res;
    }

}
export default Form;