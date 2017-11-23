import { noop, isPromise, isFunction, assign, guid } from './utils'
import { httpInterceptor, storeInterceptor, routerInterceptor, methodInterceptor } from './interceptors'

function plugin(Vue, opts) {
    let trackEvent
    
    opts = assign({
        uuid: null,
        http: null,
        store: null,
        router: null,
        report: noop,
        interceptors: [
            httpInterceptor, storeInterceptor,
            routerInterceptor, methodInterceptor
        ]
    }, opts)

    trackEvent = getTrackEventFunction(opts)
    opts.interceptors.map((item) => item(opts, trackEvent, Vue))

    Vue.trackEvent = trackEvent
    Vue.prototype.$trackEvent = trackEvent
}

function getTrackEventFunction(opts) {
    if (isFunction(opts.uuid)) {
        opts.uuid = opts.uuid().then((data) => opts.uuid = data)
    }

    return function(type, action, event, data) {
        if (isPromise(opts.uuid)) {
            opts.uuid.then((uuid) => opts.report(type, action, meta(event, uuid), data))
        } else {
            setTimeout(opts.report, 0, type, action, meta(event, opts.uuid), data)
        }
    }
}

function meta(obj, uuid) {
    return {
        ...obj,
        id: uuid || guid(),
        url: location.href,
        timeStamp: Date.now()
    }
}

export default plugin