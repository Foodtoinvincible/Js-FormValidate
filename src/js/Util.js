/**
 * Created by WebStorm.
 * @Author: 芒果
 * @Time: 2020/10/17 11:51
 * @Email: m.zxt@foxmail.com
 */


/**
 * 遍历
 * @param {Object|Array} data
 * @param {Function} cb
 */
export function foreach(data,cb) {

    if(data instanceof Array){
        for (let i = 0;i < data.length; i++){
            if(cb(data[i],i) === false){
                break;
            }
        }
    }else{
        for (let key in data){
            if (data.hasOwnProperty(key)){
                if(cb(data[key],key) === false){
                    break;
                }
            }
        }
    }
}
/**
 * 获取变量类型
 * @param value
 * @returns {string}
 */
export function getVarType(value) {
    let type = Object.prototype.toString.call(value).toLocaleLowerCase();
    return type.replace(/[\[\]]/g,'').split(' ')[1];
}

/**
 * 判断值是否在数组中存在
 * @param arr
 * @param e
 * @param t   是否强类型
 * @returns {boolean}
 */
export function inArray(arr,e,t){
    for (let k in arr){
        if (arr.hasOwnProperty(k)){
            if (t){
                if (arr[k] === e) return true;
            }else{
                if (arr[k] == e) return true;
            }
        }
    }
}