/**
 * Created by PhpStorm.
 * @Author: 天上
 * @Time: 2020/7/23 0:02
 * @Email: 30191306465@qq.com
 */

/**
 * 验证器
 * Class
 */
class Validate {
    constructor () {
        this._message = {};
        this._rule = {};
        this._regx = {
            mobile: '^[1][3,4,5,7,8][0-9]{9}$',
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
            '<=' : 'lte'
        };
    }

    /**
     * 是否批量验证
     * @param {Boolean} is
     * @returns {Validate}
     */
    batch(is){

        this._batch = is;
        return this;
    }
    /**
     * 添加正则规则
     * @param data  规则名称或对象
     * @param val 正则表达式
     * @returns {Validate}
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
     * @param {Function|null|undefined} val
     * @returns {Validate}
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
     * @returns {Validate}
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
     * @returns {Validate}
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
     * 验证
     * @param data
     * @param rules
     * @returns {boolean}
     */
    check(data,rules){

        if (!rules){
            rules = this._rule;
        }
        for (let key in rules){

            if (!rules.hasOwnProperty(key)) continue;

            let rule = rules[key];
            let value = this.getInputData(key,data);

            let result;

            if (rules instanceof Function){
                result = rules(value,rule,data);
            }else{
                result = this.checkItem(key,value,rule,data);
            }
            if (result !== true){
                if (this._batch){
                    this._error[key] = result;
                }else{
                    this._error = result;
                    return false;
                }
            }
        }
        return this.empty(this._error);
    }
    /**
     * 获取错误信息
     * @returns {{}}
     */
    getError(){
        return this._error;
    }
    /**
     * 清理
     */
    clear(){
        this._error = {};
        this._batch = true;
        this._message = {};
        this._rule = {};
        this._type = {};
    }

    /**
     * 验证项
     * @param field
     * @param value
     * @param rules
     * @param data
     * @returns {boolean|string|*}
     */
    checkItem(field,value,rules,data){

        if (typeof rules === 'string'){
            rules = rules.split('|');
        }
        for (let key in rules){
            if (!rules.hasOwnProperty(key)) continue;
            let rule = rules[key],
                result,
                info = key instanceof Number ? '' : key;
            if (rule instanceof Function){
                result = rule(value,field,data);

            }else{
                let tmp = this.getValidateType(key,rule);
                info = tmp[2];
                rule = tmp[1];
                let type = tmp[0];
                if (info === 'has' || 'require' === info || (value !== null && '' !== value)) {
                    result = this[type](value,rule,data,field);
                } else {
                    result = true;
                }
            }
            if (!result){
                return this.__getMsg(field,info);
            }
        }
        return true;
    }

    /**
     * 获取验证类型
     * @param key
     * @param rule
     * @returns {[*, string, *|string]|[Number, *, Number]}
     */
    getValidateType(key,rule){

        if (key instanceof Number){
            // 别名
            if (this._alias[key]){
                key = this._alias[key];
            }
            return [key,rule,key];
        }
        let type,info;
        if (rule.indexOf(':') > 0){
            let tmp = rule.split(':',2);
            type = tmp[0];
            if (this._alias[type])
                type = this._alias[type];
            info = type;
            rule = tmp[1];
        }else if(this[rule] && this[rule] instanceof Function){
            type = rule;
            info = rule;
            rule  = '';
        }else{
            type = 'is';
            info = rule;
        }
        return [type,rule,info]
    }

    /**
     * 获取数据
     * @param {String|number} key 键 支持 . 语法
     * @param data 数据源
     * @returns {null|*}
     * @private
     */
    getInputData(key,data){
        if(key.indexOf('.') > 0){
            return data[key] ? data[key] :  null;
        }
        let name = key.split('.');
        for (let i=0;i < name.length;i++){
            if (data[name[i]] !== undefined && data[name[i]] !== null){
                data = data[name[i]];
            }else{
                return null;
            }
        }
        return data;
    }

    /**
     * 获取错误信息
     * @param field
     * @param rule
     * @returns {string|*}
     */
    __getMsg(field,rule){

        for (let k in this._message){
            if (!this._message.hasOwnProperty(k)) continue;
            let tmp = (k+'').split(',');
            if (this.inArray(tmp,field) || this.inArray(tmp,field + '.' + rule)){
                return this._message[k];
            }
        }
        return rule + ' ' + field;
    }

    /**
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
                result = !this.empty(value) || '0' === value;
                break;
            case 'has':
                // 存在
                result = this.getInputData(field,data) !== null;
                break;
            case 'accepted':
                // 接受
                result = this.inArray(['1', 'on', 'yes'],value);
                break;
            case 'boolean':
            case 'bool':
                // 是否为布尔值
                result = this.inArray([true, false, 0, 1, '0', '1'],value);
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
                switch (true) {
                    case rule instanceof Function:
                        result = rule(value,rule,data,field);
                        break;
                    case this[rule] instanceof Function:
                        result = this[rule](value,rule,data,field);
                        break;
                    case this._regx[rule] !== undefined:
                        result = (typeof this._regx[rule] === 'string' ? new RegExp(this._regx[rule]) : this._regx[rule]).test(value);
                        break;
                    case this._type[rule] !== undefined:
                        result = this._type[rule](value,rule,data,field);
                        break;
                    default:
                        throw new Error(`validate rule not exits: ${rule}`);
                }
                break;
        }
        return result;
    }

    /**
     * 检测是否为空
     * @param param 如下皆为空 {},[],0,'',false,null,undefined
     * @returns {boolean}
     */
    empty(param){

        // 是否为 undefined
        if (typeof param ===  'undefined'){
            return true;
        }

        // 是否为空字符串
        if (typeof param === 'string' && param.trim() === ''){
            return true;
        }


        // 是否为假
        if (param === false){
            return true;
        }

        // 是否为空数组
        if (param instanceof Array && param.length === 0){
            return true;
        }

        // 是否为 null
        if (param ===  null){
            return true;
        }

        // 是否为0
        if (typeof param === 'number' && parseInt(param) === 0 && /\./.test(param.toString()) === false){
            return true;
        }

        // 是否为空对象
        return param instanceof Object && JSON.stringify (param) === '{}';

    }

    /**
     * 判断值是否在数组中存在
     * @param arr
     * @param e
     * @returns {boolean}
     */
    inArray(arr,e){
        for (let k in arr)
            if (arr[k] == e) return true;
        return false;
    }

    /**
     * 大于等于
     * @param value
     * @param rule
     * @param data
     * @returns {boolean}
     */
    egt(value,rule,data){
        return value >= this.getInputData(data,rule);
    }
    /**
     * 大于
     * @param value
     * @param rule
     * @param data
     * @returns {boolean}
     */
    gt(value,rule,data){
        return value > this.getInputData(data,rule);
    }
    /**
     * 等于
     * @param value
     * @param rule
     * @param data
     * @returns {boolean}
     */
    eq(value,rule,data){
        return value == this.getInputData(data,rule);
    }
    /**
     * 小于
     * @param value
     * @param rule
     * @param data
     * @returns {boolean}
     */
    lt(value,rule,data){
        return value < this.getInputData(data,rule);
    }
    /**
     * 小于等于
     * @param value
     * @param rule
     * @param data
     * @returns {boolean}
     */
    lte(value,rule,data){
        return value <= this.getInputData(data,rule);
    }
    /**
     * 验证是否在范围内
     * @param value
     * @param rule
     * @returns {boolean}
     */
    in(value,rule){
        return rule instanceof Array ? this.inArray(rule,value) : this.inArray(rule.split(','),value);
    }
    /**
     * 验证是否不在范围内
     * @param value
     * @param rule
     * @returns {boolean}
     */
    notIn(value,rule){
        return !(rule instanceof Array ? this.inArray(rule,value) : this.inArray(rule.split(','),value));
    }
    /**
     * 数据长度验证
     * @param {String|Array|Object|Number} value
     * @param rule
     * @returns {boolean}
     */
    length(value,rule){
        let len = this.getDataLength(value);
        if (typeof rule === 'string' && rule.indexOf(',') > 0){
            let tmp = rule.split(',',2);
            return len >= tmp[0] && len <= tmp[1];
        }
        return value == len;
    }

    /**
     * 最大值验证
     * @param {String|Array|Object|Number} value
     * @param rule
     * @returns {boolean}
     */
    max(value,rule){
        return this.getDataLength(value) < rule;
    }

    /**
     * 最小值验证
     * @param {String|Array|Object|Number} value
     * @param rule
     * @returns {boolean}
     */
    min(value,rule){
        return this.getDataLength(value) > rule;
    }

    /**
     * 获取数据长度
     * @param {String|Array|Object|Number} value 如果传递数字那么将认为长度就等于该数字
     * @returns {number}
     */
    getDataLength(value){
        let len = 0;
        switch (Object.prototype.toString.call(value).toLocaleLowerCase()) {
            case '[object object':
            case '[object array]':
                for(let k in value)
                    if(value.hasOwnProperty(k)) len++;
                break;
            case '[object string]':
                len = value.length;
                break;
            case '[object number]':
                len = value;
                break;
            default:
                console.warn('Warning: Validate length rule function params 1 data type not support: ' + type);
                break;
        }
        return len;
    }
}

export default Validate;