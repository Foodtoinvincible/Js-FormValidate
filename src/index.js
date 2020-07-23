
// import lod from 'lodash';

import Form from './js/form'
import FormSwitch from './js/formSwitch';
import Message from './js/message'

import './css/form.css'

FormSwitch.init();
Message.setConfig({
    background: true,
    offset: 'center',
})
const form = new Form(document.getElementById('form'),(data,e,status) => {
    e.preventDefault();
    if (status){
        Message.success('验证通过');
    }else{
        Message.info('验证失败');
    }
    // ...
});
form.rule({
    city: 'require',
    note: 'require|length:1,150'
});
form.message({
    city: '请选择城市',
    'note.require': '请输入备注',
    'note.length': '备注长度范围1-150个字符'
})