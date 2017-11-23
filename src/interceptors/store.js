import { isVuex } from '../utils'

export default function storeInterceptor({ store }, trackEvent) {
    if (isVuex(store)) {
        store.subscribe(({ type, payload }) => trackEvent('commit', type, { type: 'vuex' }, payload))
        store.subscribeAction(({ type, payload }) => trackEvent('dispatch', type, { type: 'vuex' }, payload))
    }
}