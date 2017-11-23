'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = methodInterceptor;

var _utils = require('../utils');

function methodInterceptor(options, trackEvent, Vue) {
    Vue.mixin({
        beforeCreate: function beforeCreate() {
            var methods = this.$options.methods || {};

            var _loop = function _loop(name) {
                var fn = methods[name];

                methods[name] = function () {
                    var event = void 0,
                        len = void 0,
                        result = void 0;

                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    len = args.length;

                    if (len > 1) {
                        result = fn.apply(this, args);
                        event = args.filter(function (item) {
                            return item instanceof Event;
                        })[0];
                    } else if (len === 1) {
                        result = fn.call(this, args[0]);
                        event = args[0] instanceof Event ? args[0] : null;
                    } else {
                        result = fn.call(this);
                    }

                    trackEvent(event ? event.type : (0, _utils.getEventType)(), name, { type: 'vue' }, args);

                    return result;
                };
            };

            for (var name in methods) {
                _loop(name);
            }
        }
    });
}