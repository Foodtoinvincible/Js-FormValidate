
// import lod from 'lodash';

import FormValidate from './js/FormValidate'

import './css/form.css'


const $form = document.getElementById('form');

const form = new FormValidate($form,(data,e,status) => {
    e.preventDefault();
    console.log(data)
    if (status){
        alert('验证通过');
    }else{
        alert('验证失败');
    }
    // ...
});
form.rule({
    in: 'require|in:北京',
    notIn: 'require|notIn:北京',
    chs: 'require|chs',
    chsAlpha: 'require|chsAlpha',
    chsAlphaNum: 'require|chsAlphaNum',
    length: 'require|length:1,255',
    ipv4: 'require|ipv4',
    ipv6: 'require|ipv6',
    ip: 'require|ip',
    max: 'require|max:100',
    min: 'require|min:100',
    email: 'require|email',
    mobile: 'require|mobile'
});
form.message({
    in: '只可选择北京选项',
    notIn: '只可选择除了北京以外的选项',
    chs: '需要纯中文',
    chsAlpha: '中文或字母或汉字+字母',
    chsAlphaNum: '中文或字母或数字或中文+字母+数字',
    length: '长度范围：1-255个字符',
    ipv4: '需要ipv4格式的IP地址',
    ipv6: '需要ipv6格式的IP地址',
    ip: '需要ipv4或ipv6格式的IP地址',
    max: '最大值为100',
    min: '最小值为100',
    email: '邮箱格式错误',
    mobile: '手机号格式错误'
})