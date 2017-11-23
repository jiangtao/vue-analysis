import { isRouter } from '../utils'

export default function routerInterceptor({ router }, trackEvent) {
    if (isRouter(router)) {
        router.afterEach((to, from) => trackEvent('router', 'afterEach', { type: 'router' }, { to, from }))
    }
}