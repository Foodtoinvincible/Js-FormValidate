/**
 * Created by WebStorm.
 * @Author: 芒果
 * @Time: 2020/10/14 13:28
 * @Email: m.zxt@foxmail.com
 */

import Validate from './Validate';
import FormResult from './formData';

/**
 * 表单验证
 */
class FormValidate{
    /**
     * @param {HTMLFormElement} $form
     * @param {Function} callback
     * @param {Boolean} listen    是否监听 默认是
     * @constructor
     */
    constructor ($form,callback,listen = true) {

        this._$form = $form;
        // 回调函数
        this._submitCallback = callback;

        // 验证规则
        this._rule = {};

        this._conf = {
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
            // 错误信息class
            error_text_class: 'form-item-check-error-msg'
        };
        this._message = {};
        /**
         * @type {Validate}
         * @private
         */
        this._validate = new Validate();

        // 事件处理者
        this._eventHandler = {
            submit: this.formSubmitEvent.bind(this),
            change: this.changeEvent.bind(this),
            blur: this.blurEvent.bind(this),
        }

        // 事件注册记录
        this._eventRegister = [];

        if (listen){
            this.bindEvent(this._$form,'submit');
            // 元素监听
            FormResult.elementCollection(this._$form).forEach(elem => {
                this.addListen(elem);
            });
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
     * 获取表单数据
     * @param {HTMLFormElement} $form
     * @return {*}
     */
    getFormData($form){
        return FormResult.getDataSet($form);
    }

    /**
     * 表单提交事件
     * @param ev
     */
    formSubmitEvent(ev){
        let formData = this.getFormData(ev.target);
        let checkResult = this.check(ev.target,formData);
        this._submitCallback && this._submitCallback(formData,ev,checkResult);
    }

    /**
     * 绑定事件
     * @param {HTMLElement} $elem
     * @param {String} name
     * @param {Function|null} fn
     */
    bindEvent($elem,name,fn= null){

        if (!fn) fn = this._eventHandler[name];
        this._eventRegister.push({
            elem: $elem,
            fn: fn,
            type: name,
        });
        $elem.addEventListener(name,fn);
    }

    /**
     * 新增监听
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} $elem
     */
    addListen($elem){
        let mode = $elem.getAttribute(this._conf.check_mode_attr);
        mode = mode ? mode : 'blur';
        if (mode){
            if (mode.toLocaleLowerCase() == 'change'){
                this.bindEvent($elem,'change')
            }
            if (mode.toLocaleLowerCase() == 'blur'){
                this.bindEvent($elem,'blur')
            }
        }
    }

    /**
     * 卸载所有事件
     */
    offAllEvent(){
        this._eventRegister.forEach(item => {
            item.elem.removeEventListener(item.type,item.fn);
        });
    }

    /**
     * 实时监测
     * @param ev
     */
    changeEvent(ev) {
        let data = FormResult.getDataSet(this._$form);
        this.checkItem(ev.target,data);
    }

    /**
     * 元素失去焦点触发检测
     * @param ev
     */
    blurEvent(ev){
        let data = FormResult.getDataSet(this._$form);
        this.checkItem(ev.target,data);
    };

    /**
     * 效验
     * @param {HTMLFormElement} $form
     * @param {Object} data
     * @returns {boolean}
     */
    check($form,data){
        let valid = true;
        FormResult.elementCollection($form).forEach($elem =>{
            if ($elem.name && !this.checkItem($elem,data)){
                valid = false;
            }
        });
        return valid;
    }
    /**
     * 效验元素项
     * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} $elem
     * @param {Object} data
     * @returns {boolean}
     */
    checkItem($elem,data){
        let field = $elem.name,
            value = FormResult.getElementValue($elem),
            rule = this._getRule(field,$elem);
        if (!rule) return true;
        // Validate->checkItem 验证失败 返回 rule field
        let res = this._validate.checkItem(field,value,rule,data);
        if (res !== true){
            let msg = this._getMsg(field,res,$elem);
            msg = msg ? msg : res;
            if(this._conf.show_error_msg){
                this.showError($elem,msg);
            }
            return false;
        }else{
            if(this._conf.show_error_msg){
                this.removeError($elem);
            }
            return true;
        }
    }
    /**
     * 获取元素验证规则
     * @param {String} field  字段名称
     * @param {HTMLElement} $elem  只有 this._rule[name] 不存在时 才会读取 $elem元素中定义的属性规则
     * @returns {*|null}
     */
    _getRule (field,$elem) {

        if (this._rule[field])
            return this._rule[field];
        let rule = $elem.getAttribute(this._conf.verify_rule_attr);
        return rule ? rule : null;
    }
    /**
     * 获取提示信息
     * @param {String} field     字段名称
     * @param {String} errorInfo 错误信息
     * @param {HTMLElement} $elem      元素
     * @returns {string|*}
     * @private
     */
    _getMsg(field,errorInfo,$elem){
        if (this._message[field])
            return this._message[field];

        let rule = errorInfo.split(' ')[0];
        for (let k in this._message){
            if (this._message.hasOwnProperty(k)){
                if (this._validate.inArray(k.toString().split(','),field) ||
                    this._validate.inArray(k.toString().split(','),field + '.' + rule)){
                    return this._message[k];
                }
            }
        }


        let msg = $elem.getAttribute(this._conf.msg_attr);
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
     * @param {HTMLElement} $elem  要显示的元素
     * @param {String} msg   错误信息
     */
    showError ($elem,msg) {
        $elem.classList.add(this._conf.error_class);
        for (let i = 0; i < $elem.parentNode.children.length; i++){
            if ($elem.parentNode.children[i].classList.contains(this._conf.error_text_class))
                $elem.parentNode.children[i].remove();
        }
        let span = document.createElement('SPAN');
        span.classList.add(this._conf.error_text_class);
        span.innerHTML = msg;
        $elem.parentNode.appendChild(span);
    }
    /**
     * 移除元素显示的错误信息
     * @param $elem
     */
    removeError($elem){
        $elem.classList.remove(this._conf.error_class);
        for (let i = 0; i < $elem.parentNode.children.length; i++){
            if ($elem.parentNode.children[i].classList.contains(this._conf.error_text_class))
                $elem.parentNode.children[i].remove();
        }
    }

}
export default FormValidate;