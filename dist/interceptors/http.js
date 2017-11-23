'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = httpInterceptor;

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function httpInterceptor(_ref, trackEvent) {
    var http = _ref.http;

    if ((0, _utils.isAxios)(http)) {
        http.interceptors.request.use(function (config) {
            config.timeStamp = Date.now();
            return config;
        });

        http.interceptors.response.use(function (res) {
            return report(res, trackEvent);
        }, function (err) {
            report(err.response ? err.response : err, trackEvent);
            return _promise2.default.reject(err);
        });
    }
}

function report(res, callback) {
    callback('request', res.config.method, { type: 'axios' }, {
        url: res.config.url,
        message: res.message,
        timeStamp: [res.config.timeStamp, Date.now()],
        res: {
            data: res.data || {},
            headers: res.headers || {},
            responseType: (0, _utils.getResponseType)(res.headers ? res.headers['content-type'] : '') || 'json'
        },
        req: {
            headers: res.config.headers || {},
            data: (['post', 'put', 'patch'].includes(res.config.method) ? res.config.data : res.config.params) || {}
        }
    });

    return res;
}