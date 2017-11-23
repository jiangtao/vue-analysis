'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _utils = require('./utils');

var _interceptors = require('./interceptors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function plugin(Vue, opts) {
    var trackEvent = void 0;

    opts = (0, _utils.assign)({
        uuid: null,
        http: null,
        store: null,
        router: null,
        report: _utils.noop,
        interceptors: [_interceptors.httpInterceptor, _interceptors.storeInterceptor, _interceptors.routerInterceptor, _interceptors.methodInterceptor]
    }, opts);

    trackEvent = getTrackEventFunction(opts);
    opts.interceptors.map(function (item) {
        return item(opts, trackEvent, Vue);
    });

    Vue.trackEvent = trackEvent;
    Vue.prototype.$trackEvent = trackEvent;
}

function getTrackEventFunction(opts) {
    if ((0, _utils.isFunction)(opts.uuid)) {
        opts.uuid = opts.uuid().then(function (data) {
            return opts.uuid = data;
        });
    }

    return function (type, action, event, data) {
        if ((0, _utils.isPromise)(opts.uuid)) {
            opts.uuid.then(function (uuid) {
                return opts.report(type, action, meta(event, uuid), data);
            });
        } else {
            setTimeout(opts.report, 0, type, action, meta(event, opts.uuid), data);
        }
    };
}

function meta(obj, uuid) {
    return (0, _assign2.default)({}, obj, {
        id: uuid || (0, _utils.guid)(),
        url: location.href,
        timeStamp: Date.now()
    });
}

exports.default = plugin;