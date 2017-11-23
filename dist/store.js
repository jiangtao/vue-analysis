'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    get: function get(key) {
        var isCookie = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (window.localStorage && !isCookie) {
            return window.localStorage.getItem(key);
        } else {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(document.cookie.split(/;\s/g)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    if (~item.indexOf(key)) {
                        return item.split('=')[1];
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

            return null;
        }
    },
    set: function set(key, val) {
        var isCookie = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (window.localStorage && !isCookie) {
            window.localStorage.setItem(key, val);
        } else {
            var date = new Date();
            date.setDate(date.getDate() + 3650);
            document.cookie = key + '=' + val + '; expires=' + date.toUTCString();
        }

        return val;
    },
    remove: function remove(key) {
        var isCookie = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (window.localStorage && !isCookie) {
            window.localStorage.removeItem(key);
        } else {
            document.cookie = key + '=\'\'; expires=' + new Date(0).toUTCString();
        }
    }
};