'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = storeInterceptor;

var _utils = require('../utils');

function storeInterceptor(_ref, trackEvent) {
    var store = _ref.store;

    if ((0, _utils.isVuex)(store)) {
        store.subscribe(function (_ref2) {
            var type = _ref2.type,
                payload = _ref2.payload;
            return trackEvent('commit', type, { type: 'vuex' }, payload);
        });
        store.subscribeAction(function (_ref3) {
            var type = _ref3.type,
                payload = _ref3.payload;
            return trackEvent('dispatch', type, { type: 'vuex' }, payload);
        });
    }
}