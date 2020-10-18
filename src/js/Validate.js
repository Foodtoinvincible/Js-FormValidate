/**
 * Created by WebStorm.
 * @Author: 芒果
 * @Time: 2020/10/14 13:28
 * @Email: m.zxt@foxmail.com
 */

import {foreach, getVarType, inArray} from "./Util";

/**
 * 验证器
 * Class
 */
class Validate {
    constructor () {
        this._message = {};
        this._rule = {};
        this._regx = {
            mobile: '^[1][34578][0-9]{9}$',
            email: '^[a-z0-9]+([._\\\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$'
        };
        this._error = {};
        this._type = {};
        this._batch = true;
        this._alias = {
            '>=' : 'egt',
            '>'  : 'gt',
            '='  : 'eq',
            '<'  : 'lt',
            '<=' : 'lte',
            '!=' : 'unequal',
            '<>' : 'unequal'
        };
    }

    /**
     * 是否批量验证
     * @param {Boolean} is
     * @returns {this}
     */
    batch(is){

        this._batch = is;
        return this;
    }
    /**
     * 添加正则规则
     * @param data  规则名称或对象
     * @param val 正则表达式
     * @returns {this}
     */
    regx(data,val){
        if (!val){
            Object.assign(this._regx,data);
        }else{
            this._regx[data] = val;
        }
        return this;
    }
    /**
     * 附加验证规则
     * @param data 规则名称或对象
     * @param {Function} [val=null]
     * @returns {this}
     */
    type(data,val){
        if (!val){
            Object.assign(this._type,data);
        }else{
            this._type[data] = val;
        }
        return this;
    }

    /**
     * 添加字段提示文本
     * @param {Object|string} data 字段名称或者字段提示文本对象
     * @param val
     * @returns {this}
     */
    message(data,val){
        if (!val){
            Object.assign(this._message,data);
        }else{
            this._message[data] = val;
        }
        return this;
    };

    /**
     * 添加字段验证规则
     * @param {Object|string} rule 字段名称或者规则数组
     * @param val 验证规则
     * @returns {this}
     */
    rule(rule,val){

        if (!val){
            Object.assign(this._rule,rule);
        }else{
            this._rule[rule] = val;
        }
        return this;
    };

    /**
     * 获取错误信息
     * @returns {{}}
     */
    getError(){
        return this._error;
    }

    /**
     * 清理
     * @return {Validate}
     */
    clear(){
        this._error = {};
        this._batch = true;
        this._message = {};
        this._rule = {};
        this._type = {};
        return this;
    }

    /**
     * 验证
     * @param data
     * @param rules
     * @returns {boolean}
     */
    check(data,rules){

        if (!rules){
            rules = this._rule;
        }
        foreach(rules,(rule,field) => {
            let value = this.getInputData(field,data);
            let result;

            if (rule instanceof Function){
                result = rule(value,rule,data);
            }else{
                result = this.checkItem(field,value,rule,data);
            }
            if (result !== true){
                if (this._batch){
                    this._error[field] = result;
                }else{
                    this._error = result;
                    return false;
                }
            }
        });
        return this.empty(this._error);
    }

    /**
     * 单项验证
     * @param {String} field 字段名称
     * @param value 字段值
     * @param {String|Array} rules 验证规则
     * @param {Object} data  整体数据
     * @returns {boolean|string|*}
     */
    checkItem(field,value,rules,data){

        if (getVarType(rules) == 'string'){
            rules = rules.split('|');
        }
        let result = true;

        foreach(rules, (rule,key) => {
            // 效验结果
            let ruleName;

            // 是否直接使用函数验证
            if (getVarType(rule) == 'function'){
                result = rule(value,field,data);
                ruleName = getVarType(key) == 'number' ? '' : key;
            }else{
                let validInfo = this.getValidateInfo(key,rule);
                ruleName = validInfo.rule;
                
                if (ruleName == 'has' || 'require' == ruleName || (value !== null && value !== undefined && '' !== value)) {
                    // validInfo.method = is 表示调用的是没有参数的内置规则
                    if (validInfo.method == 'is'){
                        result = this[validInfo.method](value,validInfo.rule,data,field);
                    }else{
                        result = this.callRuleMethod(validInfo.method,value,data,field,validInfo.params);
                    }
                } else {
                    result = true;
                }
            }
            if (result !== true){
                // 支持从验证方法中返回验证失败信息
                result = result === false ? this._getMsg(field,ruleName) : result;
                return false;
            }
        });
        return result;
    }

    /**
     * 调用验证规则方法
     * @param {String} name     方法名
     * @param {*} value         被效验的值
     * @param {Object} data     数据集合
     * @param {String} field    被效验的字段
     * @param {*} [params=null]        规则传参
     * @return {Boolean|*}
     */
    callRuleMethod(name,value,data,field,params){
        if (this._type[name]){
            return this._type[name](value,params,data,field);
        }else if (this[name]){
            return this[name](value,params,data,field);
        }else{
            throw new Error('Validate: unknown rule method: ' + name);
        }
    }

    /**
     * 获取验证信息
     * @param key
     * @param rule
     * @return {Object}
     */
    getValidateInfo(key,rule){

        if (getVarType(key) != 'number'){
            // 别名
            if (this._alias[key]){
                key = this._alias[key];
            }
            return {
                method: key,
                params: rule,
                rule: key,
            };
        }
        // type 是调用的函数
        // info 是规则名称
        let type,info;
        // 是否存在参数
        if (rule.indexOf(':') > 0){
            let tmp = rule.split(':',2);
            type = tmp[0];
            // 别名
            if (this._alias[type])
                type = this._alias[type];
            info = type;
            // 有参数的情况下 rule 等于携带的参数
            rule = tmp[1];
        }else if(this[rule] && this[rule] instanceof Function || this._type[rule] && this._type[rule] instanceof Function){
            // 直接调用方法
            type = rule;
            info = rule;
            rule  = '';
        }else{
            // 内置规则
            type = 'is';
            info = rule;
            rule = '';
        }
        return {
            method: type,
            params: rule,
            rule: info,
        }
    }

    /**
     * 获取数据
     * @param {String|number} key 键 支持 . 语法
     * @param data 数据源
     * @returns {null|*}
     * @private
     */
    getInputData(key,data){
        key = key.toString();
        if(key.indexOf('.') < 1){
            return data.hasOwnProperty(key) ? data[key] :  null;
        }
        let keys = key.split('.');
        let temp = data;
        // 对象或数组才有搜索意义
        while (keys.length && (temp instanceof Array || Object.prototype.toString.call(temp) == '[object Object]')){
            let k = keys.shift();
            if (temp[k]){
                if (keys.length == 0){
                    return temp[k];
                }
                else{
                    temp = temp[k];
                }
            }
        }
        return null;
    }

    /**
     * 获取错误信息
     * @param field
     * @param rule
     * @returns {string|*}
     */
    _getMsg(field,rule){

        let info = rule + ' ' + field;
        
        foreach(this._message, (item,key) => {
            let tmp = key.toString().split(',');
            if (inArray(tmp,field) || inArray(tmp,field + '.' + rule)){
                info = this._message[key];
                // 跳出循环
                return false;
            }
        });
        return info;
    }

    /**
     * 内置规则（不需要参数的规则）
     * @param value 字段值
     * @param rule 验证规则
     * @param {Object} data 数据
     * @param {String} field 字段
     * @returns {boolean|(function(*): boolean)}
     */
    is(value,rule,data,field){

        let result;
        switch (rule){
            case 'require':
                // 必须
                result = value === 0 || !this.empty(value);
                break;
            case 'has':
                // 存在
                result = this.getInputData(field,data) !== null;
                break;
            case 'accepted':
                // 接受
                result = inArray(['1', 'on', 'yes',1],value,true);
                break;
            case 'boolean':
            case 'bool':
                // 是否为布尔值
                result = inArray([true, false, 0, 1, '0', '1'],value,true);
                break;
            case 'number':
                result = /^([-|+]?\d+|[-|+]?\d+\.\d+)$/.test(value + '');
                break;
            case 'alpha':
                result = !/^[^a-zA-z]$/.test(value);
                break;
            case 'alphaNum':
                result = !/^[^a-zA-z0-9]$/.test(value);
                break;
            case 'chs':
                // 纯汉字
                result = /^[\u4E00-\u9FA5]+$/.test(value);
                break;
            case 'chsAlpha':
                // 汉字或字母或汉字+字母
                result = !/[^\u4E00-\u9FA5a-zA-z]/.test(value);
                break;
            case 'chsAlphaNum':
                // 汉字或字母或数字或汉字+字母+数字
                result = !/[^\u4E00-\u9FA5a-zA-z0-9]/.test(value);
                break;
            case 'array':
                // 是否为数组
                result = '[object array]' === Object.prototype.toString.call(value).toLocaleLowerCase();
                break;
            case 'object':
                // 是否为对象
                result = '[object object]' === Object.prototype.toString.call(value).toLocaleLowerCase()
                break;
            case 'func':
            case 'function':
                // 是否为函数
                result = '[object function]' === Object.prototype.toString.call(value).toLocaleLowerCase()
                break;
            case 'int':
                // 整型
                result = /^[-|+]?\d+$/.test(value);
                break;
            case 'float':
                // 浮点
                result = /^[-|+]?\d+\.\d+$/.test(value);
                break;
            default:
                if (this._regx.hasOwnProperty(rule)){
                    result = typeof this._regx[rule] === 'string' ? new RegExp(this._regx[rule]).test(value) : this._regx[rule].test(value);
                }else {
                    // 没有找到不需要参数的规则内置
                    return null;
                }
        }
        return result;
    }

    /**
     * 检测是否为空
     * @param param 如下皆为空 {},[],0,'',false,null,undefined
     * @returns {boolean}
     */
    empty(param){

        if (!param){
            return true;
        }
        // 是否为空字符串
        if (typeof param === 'string' && param.trim() === ''){
            return true;
        }

        // 是否为空数组
        if (param instanceof Array && param.length === 0){
            return true;
        }
        // 是否为空对象
        return param instanceof Object && JSON.stringify (param) === '{}';

    }

    /**
     * 大于等于
     * @param value
     * @param params
     * @returns {boolean}
     */
    egt(value,params){
        return value >= this._strToNumber(params);
    }
    /**
     * 大于
     * @param value
     * @param params
     * @returns {boolean}
     */
    gt(value,params){
        return value > this._strToNumber(params);
    }
    /**
     * 等于
     * @param value
     * @param params
     * @returns {boolean}
     */
    eq(value,params){
        return value == this._strToNumber(params);
    }
    /**
     * 小于
     * @param value
     * @param params
     * @returns {boolean}
     */
    lt(value,params){
        return value < this._strToNumber(params);
    }
    /**
     * 小于等于
     * @param value
     * @param params
     * @returns {boolean}
     */
    lte(value,params){
        return value <= this._strToNumber(params);
    }

    /**
     * 不等于
     * @param value
     * @param params
     * @returns {boolean}
     */
    unequal(value,params){
        return value != this._strToNumber(params);
    }

    /**
     * 验证是否在范围内
     * @param value
     * @param params
     * @returns {boolean}
     */
    in(value,params){
        return params instanceof Array ? inArray(params,value) : inArray(params.toString().split(','),value);
    }
    /**
     * 验证是否不在范围内
     * @param value
     * @param params
     * @returns {boolean}
     */
    notIn(value,params){
        return !(params instanceof Array ? inArray(params,value) : inArray(params.toString().split(','),value));
    }

    /**
     * IPv6验证
     * @param value
     * @returns {*}
     */
    ipv6(value){
        return /:/.test(value) &&
        value.match(/:/g).length < 8 &&
        /::/.test(value) ?
            (value.match(/::/g).length === 1 && /^::$|^(::)?([\da-f]{1,4}(:|::))*[\da-f]{1,4}(:|::)?$/i.test(value))
            : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(value);
    }

    /**
     * IPv4验证
     * @param value
     * @returns {boolean}
     */
    ipv4(value){
        return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
    }

    /**
     * 验证IP 支持 ipv4、ipv6
     * @param value
     * @returns {boolean}
     */
    ip(value){
        return this.ipv4(value) || this.ipv6(value);
    }

    /**
     * 数据长度验证
     * @param {String|Array|Object|Number} value
     * @param params
     * @returns {boolean}
     */
    length(value,params){
        let len = this.getDataLength(value);
        if (typeof params === 'string' && params.indexOf(',') > 0){
            let tmp = params.split(',',2);
            return len >= tmp[0] && len <= tmp[1];
        }
        return value == len;
    }

    /**
     * 范围
     * @param {String|Array|Object|Number} value
     * @param params
     * @returns {boolean|boolean}
     */
    between(value,params){
        let len = this.getDataLength(value);
        if (typeof params != 'string' || params.indexOf(',') == -1){
            console.warn('Warning: Validate between rule error');
            return false;
        }
        let tmp = params.split(',',2);
        return len >= tmp[0] && len <= tmp[1];
    }

    /**
     * 最大值验证
     * @param {Number} value
     * @param params
     * @returns {boolean}
     */
    max(value,params){
        params = this._strToNumber(params);

        if (params === false){
            console.warn('Warning: Validate max rule params type expect number given ' + getVarType(value))
            return false;
        }
        if (this._strToNumber(value) === false)
            value = this.getDataLength(value);
        return value <= params;
    }

    /**
     * 最小值验证
     * @param {Number} value
     * @param params
     * @returns {boolean}
     */
    min(value,params){
        params = this._strToNumber(params);
        if (params === false){
            console.warn('Warning: Validate min rule params expect number given ' + getVarType(rule))
        }
        if (this._strToNumber(value) === false)
            value = this.getDataLength(value);
        return value >= params;
    }

    /**
     * 字符串转Number 转换失败返回 false
     * @param str
     * @returns {boolean|number}
     */
    _strToNumber(str){
        let type = this.getDataType(str);
        if (type !== 'string' && type !== 'number')
            return false;
        let val = Number(str);
        if (val + '' === 'NaN'){
            return false;
        }
        return val;
    }
    /**
     * 获取数据类型
     * @param value
     * @returns {string}
     */
    getDataType(value){
        let type = Object.prototype.toString.call(value).toLocaleLowerCase();
        return type.replace(/[\[\]]/g,'').split(' ')[1];
    }

    /**
     * 获取数据长度
     * @param {String|Array|Object|Number} value 如果传递数字那么将认为长度就等于该数字
     * @returns {number}
     */
    getDataLength(value){
        let len = 0;
        let type = this.getDataType(value);
        switch (type) {
            case 'object':
            case 'array':
                for(let k in value)
                    if(value.hasOwnProperty(k)) len++;
                break;
            case 'string':
                len = value.length;
                break;
            case 'number':
                len = value;
                break;
            default:
                console.warn('Warning: Validate get data length function params 1 data type not support: ' + type);
                break;
        }
        return len;
    }
}

export default Validate;