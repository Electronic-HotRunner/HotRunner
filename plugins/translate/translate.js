#! /usr/bin/node

const _           = require('underscore');
const request     = require('request');
const querystring = require('querystring');

class Translator {

    /**
     * @param {string} query
     */
    constructor(query) {

        /**
         * @private
         * @type {string}
         */
        this.api = 'http://fanyi.baidu.com/v2transapi';

        /**
         * @private
         * @type {string}
         */
        this.query = query;

        /**
         * @private
         * @type {{query: string, simple_means_flag: number, transtype: string, from: string, to: string}}
         */
        this.options = {
            query             : query,
            simple_means_flag : 3,
            transtype         : 'translang',
            from              : Translator.LANG_ZH,
            to                : Translator.LANG_EN,
        };
    }

    /**
     * @public
     */
    translate() {
        const translateType = this.getTranslateType(this.query);

        this.option(translateType);
        this.option('query', encodeURI(this.query));

        const url = this.buildUrl(this.api, this.options);

        return this.request(url).then((body) => {
            return this.format(body);
        });
    }

    /**
     * 格式化结果
     *
     * @param {object} body
     */
    format(body) {
        const result = {};
        const simpleMeans = body.dict_result.simple_means;

        // 翻译内容
        result.translateContent = simpleMeans.word_name;
        // 发音
        result.pronunciation = [
            {key : 'en', value : simpleMeans.symbols[0].ph_en},
            {key : 'am', value : simpleMeans.symbols[0].ph_am}
        ];

        let exchange;
        result.exchange = [];
        const mappings = {
            word_pl     : '复数',
            word_ing    : '现在分词',
            word_done   : '过去式',
            word_past   : '过去分词',
            word_third  : '第三人称单数'
        };

        for (let mapping in mappings) {
            exchange = this.buildExchange(mappings[mapping], simpleMeans.exchange[mapping]);
            exchange && result.exchange.push(exchange);
        }

        result.parts = simpleMeans.symbols[0].parts.map(function(part) {
            part['meanStr'] = part['means'].join('；');
            return part;
        });

        result.tags = [];
        for (let idx in simpleMeans.tags) {
            result.tags = result.tags.concat(simpleMeans.tags[idx]);
        }

        return result;
    }

    /**
     * @private
     * @param {string} url
     * @param {object} options
     * @returns {string}
     */
    buildUrl(url, options) {
        return url + '?' + querystring.stringify(options);
    }

    /**
     * @param {string} mapping
     * @param {*} exchange
     * @returns {*}
     */
    buildExchange(mapping, exchange) {
        if (!exchange || (exchange instanceof Array && exchange.length === 0)) {
            return false;
        }

        return {key : mapping, value : exchange.join(';')}
    }

    request(url) {
        return new Promise(function(resolve, reject) {
            request.get(url, function(error, response, body) {
                if (!error) {
                    resolve(JSON.parse(body));
                } else {
                    reject(response);
                }
            });
        });
    }

    /**
     * 获取翻译的类型
     *
     * @private
     * @param {string} query
     * @returns {{from : string, to : string}}
     */
    getTranslateType(query) {
        return /[^\x00-\xff]/.test(query) ?
            {from : Translator.LANG_ZH, to : Translator.LANG_EN} :
            {from : Translator.LANG_EN, to : Translator.LANG_ZH};
    }

    /**
     * @param {object|string} options
     * @param {*} value
     */
    option(options, value = null) {
        if (typeof options === 'string') {
            options = {[options] : value};
        }

        _.extend(true, this.options, options);
    }
}

Translator.LANG_EN = 'en';
Translator.LANG_ZH = 'zh';

const translator = new Translator(process.argv[2]);
translator.translate().then(function(body) {
    process.stdout.write(JSON.stringify(body));
}).catch(function(e) {
    console.log(e.message)
});