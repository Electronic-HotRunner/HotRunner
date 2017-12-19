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

        return this.request(url);
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
    const result = {};

    result.symbols = body.dict_result.simple_means.symbols;
    result.tags    = body.dict_result.simple_means.tags;

    process.stdout.write(JSON.stringify(result));
}).catch(function(e) {
    console.log(e.message)
});