
const $container = $('.result-container');
const $doc = $($('#template-iframe')[0].contentWindow.document);
const timeout = 50;
const maxDelayTime = 5;
const cache = {};

const RenderUtils = {
    /**
     * 延迟渲染函数，解决在执行函数时，iframe中的模板html还未加载完毕的情况
     * @param  {String}   selector 模板选择器
     * @param  {Function} cb       回调函数，接收一个参数是模板的Dom元素jquery对象
     */
    delayRender: function (selector, cb) {
        if (typeof cb !== 'function' || typeof selector !== 'string') {
            return;
        }
        const $dom = $doc.find(selector);
        console.log($dom)
        if (!$dom.length) {

            let val = $.data(cache, selector) || 0;
            if (val > maxDelayTime) {
                return;
            } else if (val) {
                $.data(cache, selector, val + 1);
            } else {
                $.data(cache, selector, 1);
            }

            setTimeout(() => {
                this.delayRender(selector, cb);
            }, timeout);
        } else {
            cb($dom);
            $.removeData(cache, selector);
        }
    },
    translateHtml: function (data) {
        const selector = '#translate-template';
        this.delayRender(selector, ($dom) => {
            $dom.tmpl(data).appendTo($container);
        });
    }
}

module.exports = RenderUtils;