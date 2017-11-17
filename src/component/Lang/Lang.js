import zh_CN from './zh_CN';
import en_US from './en_US';
import _ from 'underscore';

let lang = 'zh_CN';

const langMap = {
    'zh_CN': {
        apiValue: 0,
        data: zh_CN,
        description: '中文',
    },
    'en_US': {
        apiValue: 1,
        data: en_US,
        description: 'English',
    }
};

const T = (name) => {
    return langMap[lang].data[name] || langMap['en_US'].data[name] || '';
};

const Lang = {
    set: (newLang) => {
        lang = newLang;
    },
    get: () => {
        return lang;
    },
    getLangFromApiValue: (apiValue) => {
        let langStr = null;
        _.each(langMap, (value, key) => {
            if (value.apiValue === apiValue) {
                langStr = key;
            }
        });
        return langStr;
    },
    getApiValueFromLang: (langStr) => {
        let apiValue = null;
        _.each(langMap, (value, key) => {
            if (key === langStr) {
                apiValue = value.apiValue;
            }
        });
        return apiValue;
    },
};

exports.Lang = Lang;
exports.T = T;