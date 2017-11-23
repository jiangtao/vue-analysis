import store from './store'
import StackTrace from 'stacktrace-js'

let events, toString

events = getBrowserEvents()
toString = Object.prototype.toString

export function noop() {}

export function isArray(obj) {
    return Array.isArray(obj)
}

export function isObject(obj) {
    return toString.call(obj) === '[object Object]'
}

export function isFunction(obj) {
    return toString.call(obj) === '[object Function]'
}

export function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

export function isRouter(obj) {
    return !!(obj && isObject(obj) && obj.mode && obj.currentRoute && obj.push && obj.afterEach)
}

export function isVuex(obj) {
    return !!(obj && isObject(obj) && obj.commit && obj.dispatch && obj.subscribe && obj.subscribeAction)
}

export function isAxios(obj) {
    return !!(obj && obj.get && obj.post && obj.interceptors && obj.interceptors.request && obj.interceptors.response)
}

export function getResponseType(contentType) {
    if (~contentType.indexOf('text/xml')) { return 'xml' }
    if (~contentType.indexOf('text/html')) { return 'html' }
    if (~contentType.indexOf('text/plain')) { return 'text' }
    if (~contentType.indexOf('application/json')) { return 'json' }
    if (~contentType.indexOf('application/javascript')) { return 'javascript' }
}

export function getEventType() {
    let type = null
    let stack = StackTrace.getSync()
    
    for (let line of stack) {
        if (events.includes(line.functionName)) {
            type = line.functionName
            break
        }
    }

    return type
}

export function assign(receiver, supplier) {
    for (let key in supplier) {
        if (supplier.hasOwnProperty(key) && key !== 'prototype') {
            if (isArray(receiver[key]) && isArray(supplier[key])) {
                receiver[key] = [...receiver[key], ...supplier[key]]
            } else {
                receiver[key] = supplier[key]
            }
        }
    }

    return receiver
}

export function guid() {
    let uuid, s4, key

    key = '__TRACK__EVENT__UUID__'
    s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

    if (uuid = store.get(key)) {
        return uuid
    } else {
        return store.set(key, `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`)
    }
}

// https://developer.mozilla.org/en-US/docs/Web/Events
function getBrowserEvents(){
    let event, events

    events = []

    for (event in document) {
        if (typeof document[event] !== "function" && event !== null && event.substring(0, 2) === "on" && event.substring(0, 8) !== 'onwebkit') {
            events.push(event.substring(2))
        }
    }

    return events
}