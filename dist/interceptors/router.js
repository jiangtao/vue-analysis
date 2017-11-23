'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = routerInterceptor;

var _utils = require('../utils');

function routerInterceptor(_ref, trackEvent) {
    var router = _ref.router;

    if ((0, _utils.isRouter)(router)) {
        router.afterEach(function (to, from) {
            return trackEvent('router', 'afterEach', { type: 'router' }, { to: to, from: from });
        });
    }
}