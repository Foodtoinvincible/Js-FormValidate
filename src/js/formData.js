/**
 * Created by WebStorm.
 * @Author: 芒果
 * @Time: 2020/10/14 13:28
 * @Email: m.zxt@foxmail.com
 */

export default {

    /**
     * 获取表单数据集
     * @param form
     * @return {any}
     */
    getDataSet(form) {
        let data = {};
        this._getInput(form, data);
        this._getSelect(form, data);
        this._getTextarea(form, data);
        return JSON.parse(JSON.stringify(data));
    },
    _getInput(form, data) {
        let input = form.querySelectorAll('input');
        input.forEach(item => {
            this._save(item.name, this.getElementValue(item), data);
        });
    },

    _getSelect(form, data) {
        let select = form.querySelectorAll('select');
        select.forEach(item => {
            if (item.name && item.selectedIndex && item.options[item.selectedIndex]) {
                this._save(item.name, this.getElementValue(item), data);
            }
        });
    },

    _getTextarea(form, data) {
        let textarea = form.querySelectorAll('textarea');
        textarea.forEach(item => {
            if (item.name) {
                this._save(item.name,this.getElementValue(item), data);
            }
        });
    },

    _save(name, val, data) {

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
    },


    /**
     *
     * 获取元素值
     * @param elem
     * @return {null|boolean|number|*}
     */
    getElementValue(elem){
        switch (elem.tagName.toLocaleUpperCase()) {
            case 'INPUT':
                if (elem.type === 'checkbox' || elem.type === 'radio'){
                    if (elem.checked){
                        return elem.value;
                    }else{
                        return false;
                    }
                }else{
                    if(elem.type == 'number'){
                        return Number(elem.value);
                    }else{
                        return elem.value;
                    }
                }
            case 'SELECT':
                if (elem.selectedIndex && elem.options[elem.selectedIndex]){
                    return elem.options[elem.selectedIndex].value;
                }
                return null;
            case 'TEXTAREA':
                return elem.value;
            default:
                return null;
        }
    },


    /**
     * 表单元素集
     * @param form
     * @return {NodeListOf<HTMLElementTagNameMap[string]> | NodeListOf<Element> | NodeListOf<SVGElementTagNameMap[string]>}
     */
    elementCollection(form){
        return form.querySelectorAll('input,select,textarea');
    }
}