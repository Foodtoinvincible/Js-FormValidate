
import $ from 'jquery'

export default {
    classname: 'input[type="checkbox"].form-switch',

    listenList: [],

    html: '<div class="form-switch-button">\n' +
    '                <div class="switch-line">\n' +
    '                    <span class="yes"><span class="fas fa-check" aria-hidden="true"></span></span>\n' +
    '                    <span class="no"><span class="fas fa-times" aria-hidden="true"></span></span>\n' +
    '                </div>\n' +
    '                <span class="switch-button checked"></span>\n' +
    '            </div>',

    init(){
        this.__handle();
    },

    __listen (dom) {
        let self = this;
        dom.bind('change',function () {
            self.__switch($(this));
        });
        dom.next('.form-switch-button').bind('click',function () {
            let input = $(this).prev(self.classname);
            if(input.attr('checked')){
                input.attr('checked',false);
            }else{
                input.attr('checked',true);
            }
            dom.change();
        });
    },

    __handle(){
        let self  = this
        $(this.classname).each(function () {
            let dom = $(this);
            if (!dom.next('.form-switch-button').length){
                dom.parent().append(self.html);
                dom.css('display','none');
            }
            if(dom.attr('large') !== undefined){
                dom.next('.form-switch-button').addClass('large');
            }
            if(dom.attr('line') !== undefined){
                dom.next('.form-switch-button').addClass('line');
                dom.next('.form-switch-button').find('.switch-line').html('');
            }
            if(dom.attr('no-text') !== undefined){
                dom.next('.form-switch-button').find('.switch-line').html('');
            }
            if(dom.attr('no-text') === undefined && dom.attr('line') === undefined){
                if (dom.attr('yes') !== undefined)
                    dom.next('.form-switch-button').find('.switch-line').find('.yes').html(dom.attr('yes'));
                if (dom.attr('no') !== undefined)
                    dom.next('.form-switch-button').find('.switch-line').find('.no').html(dom.attr('no'));
            }
            self.__switch(dom);
            self.__listen(dom);
        });
    },

    __switch(dom){
        if (dom.attr('checked')){
            dom.next('.form-switch-button').addClass('checked');
        }else{
            dom.next('.form-switch-button').removeClass('checked');
        }
    }
}