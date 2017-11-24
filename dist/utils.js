'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.noop = noop;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.isPromise = isPromise;
exports.isRouter = isRouter;
exports.isVuex = isVuex;
exports.isAxios = isAxios;
exports.getResponseType = getResponseType;
exports.getEventType = getEventType;
exports.assign = assign;
exports.guid = guid;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = void 0,
    toString = void 0;

events = getBrowserEvents();
toString = Object.prototype.toString;

function noop() {}

function isArray(obj) {
    return Array.isArray(obj);
}

function isObject(obj) {
    return toString.call(obj) === '[object Object]';
}

function isFunction(obj) {
    return toString.call(obj) === '[object Function]';
}

function isPromise(obj) {
    return !!obj && ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function isRouter(obj) {
    return !!(obj && isObject(obj) && obj.mode && obj.currentRoute && obj.push && obj.afterEach);
}

function isVuex(obj) {
    return !!(obj && isObject(obj) && obj.commit && obj.dispatch && obj.subscribe && obj.subscribeAction);
}

function isAxios(obj) {
    return !!(obj && obj.get && obj.post && obj.interceptors && obj.interceptors.request && obj.interceptors.response);
}

function getResponseType(contentType) {
    if (~contentType.indexOf('text/xml')) {
        return 'xml';
    }
    if (~contentType.indexOf('text/html')) {
        return 'html';
    }
    if (~contentType.indexOf('text/plain')) {
        return 'text';
    }
    if (~contentType.indexOf('application/json')) {
        return 'json';
    }
    if (~contentType.indexOf('application/javascript')) {
        return 'javascript';
    }
}

function getEventType() {
    var type = void 0,
        stack = void 0;

    type = null;
    stack = new Error().stack;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(events), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var event = _step.value;

            if (~stack.indexOf(event)) {
                type = event;
                break;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return type;
}

function assign(receiver, supplier) {
    for (var key in supplier) {
        if (supplier.hasOwnProperty(key) && key !== 'prototype') {
            if (isArray(receiver[key]) && isArray(supplier[key])) {
                receiver[key] = [].concat((0, _toConsumableArray3.default)(receiver[key]), (0, _toConsumableArray3.default)(supplier[key]));
            } else {
                receiver[key] = supplier[key];
            }
        }
    }

    return receiver;
}

function guid() {
    var uuid = void 0,
        s4 = void 0,
        key = void 0;

    key = '__TRACK__EVENT__UUID__';
    s4 = function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    if (uuid = _store2.default.get(key)) {
        return uuid;
    } else {
        return _store2.default.set(key, '' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
    }
}

// https://developer.mozilla.org/en-US/docs/Web/Events
function getBrowserEvents() {
    var event = void 0,
        events = void 0;

    events = [];

    for (event in document) {
        if (typeof document[event] !== "function" && event !== null && event.substring(0, 2) === "on" && event.substring(0, 8) !== 'onwebkit') {
            events.push(event.substring(2));
        }
    }

    return events;
}