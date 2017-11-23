import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import analysis from '../src'
import { expect } from 'chai'
import simulant from 'simulant'
import Router from 'vue-router'
import store from '../src/store'
import * as utils from '../src/utils'
import { httpInterceptor, storeInterceptor, routerInterceptor, methodInterceptor } from '../src/interceptors'

Vue.use(Vuex)

let router, http, vuex

router = new Router()
http = axios.create()
vuex = new Vuex.Store({
    state: {
        count: 1
    },
    mutations: {
        increment(state, payload) {
            state.count += payload
        },
        decrement(state, payload) {
            state.count -= payload
        }
    },
    actions: {
        decrementAsync({ commit, state }, payload) {
            setTimeout(() => {
                commit('decrement', payload + 10)
            }, 1000)
        }
    }
})

describe('utils', () => {
    it ('noop', () => {
        expect(utils.noop).to.be.a('function')
    })

    it('isArray', () => {
        expect(utils.isArray([])).to.equal(true)
        expect(utils.isArray(1)).to.equal(false)
        expect(utils.isArray({})).to.equal(false)
        expect(utils.isArray('')).to.equal(false)
        expect(utils.isArray(true)).to.equal(false)
    })

    it('isObject', () => {
        expect(utils.isObject(1)).to.equal(false)
        expect(utils.isObject({})).to.equal(true)
        expect(utils.isObject([])).to.equal(false)
        expect(utils.isObject('')).to.equal(false)
        expect(utils.isObject(true)).to.equal(false)
    })

    it('isPromise', () => {
        expect(utils.isPromise(1)).to.equal(false)
        expect(utils.isPromise([])).to.equal(false)
        expect(utils.isPromise({})).to.equal(false)
        expect(utils.isPromise('')).to.equal(false)
        expect(utils.isPromise(true)).to.equal(false)
        expect(utils.isPromise(new Promise(() => {}))).to.equal(true)
    })

    it('isFunction', () => {
        expect(utils.isFunction(1)).to.equal(false)
        expect(utils.isFunction([])).to.equal(false)
        expect(utils.isFunction({})).to.equal(false)
        expect(utils.isFunction('')).to.equal(false)
        expect(utils.isFunction(true)).to.equal(false)
        expect(utils.isFunction(function () {})).to.equal(true)
    })

    it('isRouter', () => {
        expect(utils.isRouter(1)).to.equal(false)
        expect(utils.isRouter([])).to.equal(false)
        expect(utils.isRouter({})).to.equal(false)
        expect(utils.isRouter('')).to.equal(false)
        expect(utils.isRouter(true)).to.equal(false)
        expect(utils.isRouter(router)).to.equal(true)
    })

    it('isVuex', () => {
        expect(utils.isVuex(1)).to.equal(false)
        expect(utils.isVuex([])).to.equal(false)
        expect(utils.isVuex({})).to.equal(false)
        expect(utils.isVuex('')).to.equal(false)
        expect(utils.isVuex(vuex)).to.equal(true)
        expect(utils.isVuex(true)).to.equal(false)
    })

    it('isAxios', () => {
        expect(utils.isAxios(1)).to.equal(false)
        expect(utils.isAxios([])).to.equal(false)
        expect(utils.isAxios({})).to.equal(false)
        expect(utils.isAxios('')).to.equal(false)
        expect(utils.isAxios(http)).to.equal(true)
        expect(utils.isAxios(true)).to.equal(false)
    })

    it('getResponseType', () => {
        expect(utils.getResponseType('text/xml')).to.equal('xml')
        expect(utils.getResponseType('text/html')).to.equal('html')
        expect(utils.getResponseType('text/plain')).to.equal('text')
        expect(utils.getResponseType('application/json')).to.equal('json')
        expect(utils.getResponseType('application/javascript')).to.equal('javascript')
    })

    it('getEventType', () => {
        expect(utils.getEventType()).to.equal(null)
    })

    it('assign', () => {
        expect(JSON.stringify(utils.assign({
            num: 123,
            str: 'abc',
            bool: true,
            obj: {},
            arr: [1, 2, 3]
        }, {
            num: 456,
            str: 'def',
            bool: false,
            obj: { a: 'b' },
            arr: [4, 5, 6]
        }))).to.equal(JSON.stringify({
            num: 456,
            str: 'def',
            bool: false,
            obj: { a: 'b' },
            arr: [1, 2, 3, 4, 5, 6]
        }))
    })

    it('guid', () => {
        window.localStorage.clear()

        let uuid = utils.guid()

        expect(uuid).to.be.a('string')
        expect(uuid.length).to.equal(36)
        expect(uuid).to.equal(utils.guid())
    })
})

describe('store', () => {
    it('get of localStorage', () => {
        store.remove('test')
        expect(store.get('test')).to.equal(null)
        store.set('test', '123')
        expect(store.get('test')).to.equal('123')
    })

    it('set of localStorage', () => {
        store.remove('key')
        store.set('key', 'value')
        expect(store.get('key')).to.equal('value')
    })

    it('remove of localStorage', () => {
        store.remove('remove')
        expect(store.get('remove')).to.equal(null)
        store.set('remove', 'true')
        expect(store.get('remove')).to.equal('true')
        store.remove('remove')
        expect(store.get('remove')).to.equal(null)
    })

    it('get of cookie', () => {
        store.remove('test', true)
        expect(store.get('test', true)).to.equal(null)
        store.set('test', '123', true)
        expect(store.get('test', true)).to.equal('123')
    })

    it('set of cookie', () => {
        store.remove('key', true)
        store.set('key', 'value', true)
        expect(store.get('key', true)).to.equal('value')
    })

    it('remove of cookie', () => {
        store.remove('remove', true)
        expect(store.get('remove', true)).to.equal(null)
        store.set('remove', 'true', true)
        expect(store.get('remove', true)).to.equal('true')
        store.remove('remove', true)
        expect(store.get('remove', true)).to.equal(null)
    })
})

describe('interceptor', () => {
    it('store interceptor', function (done) {
        this.timeout(5000)

        storeInterceptor({ store: vuex }, (type, action, meta, data) => {
            if (type === 'commit' && action === 'increment') {
                expect(data).to.equal(10)
                expect(meta.type).to.equal('vuex')
            }

            if (type === 'commit' && action === 'decrement') {
                expect(data).to.equal(30)
                expect(meta.type).to.equal('vuex')
            }

            if (type === 'dispatch' && action === 'decrementAsync') {
                expect(data).to.equal(20)
                expect(meta.type).to.equal('vuex')
            }
        })

        vuex.commit('increment', 10)
        vuex.dispatch('decrementAsync', 20)
        setTimeout(() => { done() }, 2000)
    })

    it('router interceptor', (done) => {
        routerInterceptor({ router }, (type, action, meta, data) => {
            expect(type).to.equal('router')
            expect(data.to).to.be.a('object')
            expect(data.from).to.be.a('object')
            expect(action).to.equal('afterEach')
            expect(meta.type).to.equal('router')
            done()
        })

        router.push({ path: '/hello' })
    })

    it('http interceptor of get method', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('get')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.req.data.foo).to.equal('bar')
            expect(data.res.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/get`)

            done()
        })

        http.get(`${location.protocol}//${location.hostname}:9877/get`, {
            params: { foo: 'bar' }
        })
    })

    it('http interceptor of post method', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('post')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.res.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(data.req.data).to.equal('{"foo":"bar"}')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/post`)
            
            done()
        })

        http.post(`${location.protocol}//${location.hostname}:9877/post`, {
            foo: 'bar'
        })
    })

    it('http interceptor of put method', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('put')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.res.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(data.req.data).to.equal('{"foo":"bar"}')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/put`)
            
            done()
        })

        http.put(`${location.protocol}//${location.hostname}:9877/put`, {
            foo: 'bar'
        })
    })

    it('http interceptor of delete method', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(type).to.equal('request')
            expect(action).to.equal('delete')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.req.data.foo).to.equal('bar')
            expect(data.res.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/delete`)
            
            done()
        })

        http.delete(`${location.protocol}//${location.hostname}:9877/delete`, {
            params: { foo: 'bar' }
        })
    })

    it('http interceptor of patch method', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('patch')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.res.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(data.req.data).to.equal('{"foo":"bar"}')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/patch`)
            
            done()
        })

        http.patch(`${location.protocol}//${location.hostname}:9877/patch`, {
            foo: 'bar'
        })
    })

    it('http interceptor of http headers', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('get')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.res.data).to.equal('test')
            expect(data.timeStamp).to.be.a('array')
            expect(data.req.headers.Auth).to.equal('test')
            expect(data.res.responseType).to.equal('text')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/headers`)
            
            done()
        })

        http.get(`${location.protocol}//${location.hostname}:9877/headers`, {
            headers: { Auth: 'test' }
        })
    })

    it('http interceptor of request execption', (done) => {
        let http = axios.create()

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('get')
            expect(type).to.equal('request')
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.req.data.foo).to.equal('bar')
            expect(data.res.data).to.equal('Not Found')
            expect(data.res.responseType).to.equal('text')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/xxx`)
            
            done()
        })

        http.get(`${location.protocol}//${location.hostname}:9877/xxx`, {
            params: { foo: 'bar' }
        })
    })

    it('http interceptor of multiple interceptor', function (done){
        this.timeout(3000)

        let spy = sinon.spy()
        let http = axios.create({ timeout: 1000 })
        
        http.interceptors.request.use((config) => {
            spy()
            return config
        })

        http.interceptors.response.use((res) => res, (err) => {
            spy()
            return Promise.reject(err)
        })

        httpInterceptor({ http }, (type, action, meta, data) => {
            expect(action).to.equal('get')
            expect(type).to.equal('request')
            expect(spy.callCount).to.equal(2)
            expect(meta.type).to.equal('axios')
            expect(data.timeStamp).to.be.a('array')
            expect(data.req.data.foo).to.equal('bar')
            expect(data.res.responseType).to.equal('json')
            expect(Object.keys(data.res.data).length).to.equal(0)
            expect(data.message).to.equal('timeout of 1000ms exceeded')
            expect(data.url).to.equal(`${location.protocol}//${location.hostname}:9877/timeout`)

            done()
        })

        http.get(`${location.protocol}//${location.hostname}:9877/timeout`, {
            params: { foo: 'bar' }
        })
    })

    it('method interceptor of click event normal arguments', (done) => {
        let resolve = null
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then(({ type, action, meta, data }) => { 
            expect(type).to.equal('click')
            expect(action).to.equal('test')
            expect(spy.callCount).to.equal(1)
            expect(meta.type).to.equal('vue')
            expect(data[0] instanceof MouseEvent).to.equal(true)

            done()
        })

        methodInterceptor({}, (type, action, meta, data) => {
            resolve({ type, action, meta, data })
        }, Vue)

        let Ctor = Vue.extend({
            methods: {
                test() { spy() }
            },
            render(h) {
                return h('div', {
                    on: {
                        click: this.test
                    }
                })
            },
            mounted() {
                this.$nextTick(() => {
                    simulant.fire(this.$el, 'click')
                })
            }
        })

        let vm = new Ctor().$mount()
    })

    it('method interceptor of click event multiple arguments', (done) => {
        let resolve = null
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then(({ type, action, meta, data }) => { 
            expect(type).to.equal('click')
            expect(spy.callCount).to.equal(1)
            expect(meta.type).to.equal('vue')
            expect(action).to.equal('testArgs')
            expect(data[0]).to.equal(1)
            expect(data[1]).to.equal(2)
            expect(data[2]).to.equal(3)
            expect(data[3] instanceof MouseEvent).to.equal(true)

            done()
        })
        
        methodInterceptor({}, (type, action, meta, data) => {
            resolve({ type, action, meta, data })
        }, Vue)

        let Ctor = Vue.extend({
            methods: {
                testArgs() { spy() }
            },
            render(h) {
                return h('div', {
                    on: {
                        click: function($event) {
                            this.testArgs(1, 2, 3, $event)
                        }.bind(this)
                    }
                })
            },
            mounted() {
                this.$nextTick(() => {
                    simulant.fire(this.$el, 'click')
                })
            }
        })

        let vm = new Ctor().$mount()
    })

    it('method interceptor of click event not arguments', (done) => {
        let resolve = null
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then(({ type, action, meta, data }) => { 
            expect(type).to.equal(null)
            expect(data.length).to.equal(0)
            expect(spy.callCount).to.equal(1)
            expect(meta.type).to.equal('vue')
            expect(action).to.equal('testArgsIsNot')

            done()
        })
        
        methodInterceptor({}, (type, action, meta, data) => {
            resolve({ type, action, meta, data })
        }, Vue)

        let Ctor = Vue.extend({
            methods: {
                testArgsIsNot() { spy() }
            },
            render(h) {
                return h('div', {
                    on: {
                        click: function($event) {
                            this.testArgsIsNot()
                        }.bind(this)
                    }
                })
            },
            mounted() {
                this.$nextTick(() => {
                    simulant.fire(this.$el, 'click')
                })
            }
        })

        let vm = new Ctor().$mount()
    })

    it('method interceptor of click event bubble', (done) => {
        let resolve = null
        let collection = []
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then((data) => { 
            let [args1, args2, args3] = data
            
            expect(spy.callCount).to.equal(3)
            
            expect(args1.type).to.equal('click')
            expect(args1.meta.type).to.equal('vue')
            expect(args1.action).to.equal('testBubble')
            expect(args1.data[0] instanceof MouseEvent).to.equal(true)

            expect(args2.type).to.equal(null)
            expect(args2.action).to.equal('spy')
            expect(args2.meta.type).to.equal('vue')
            expect(args2.data.length).to.equal(0)

            expect(args3.type).to.equal('click')
            expect(args3.action).to.equal('test')
            expect(args3.meta.type).to.equal('vue')
            expect(args3.data[0] instanceof MouseEvent).to.equal(true)
            done()
        })
        
        methodInterceptor({}, (type, action, meta, data) => {
            collection.push({ type, action, meta, data })
            
            if (spy.callCount === 3) {
                resolve(collection)
            }
        }, Vue)

        let Ctor = Vue.extend({
            methods: {
                spy() { spy() },                
                test() {
                    spy()
                    this.spy()
                },
                testBubble() { spy() },
            },
            render(h) {
                return h('div', {
                    on: {
                        click: this.test
                    }
                }, [h('div', {
                    ref: 'el',
                    on: {
                        click: this.testBubble
                    }
                })])
            },
            mounted() {
                this.$nextTick(() => {
                    simulant.fire(this.$refs.el, 'click')
                })
            }
        })

        let vm = new Ctor().$mount()
    })

    it('method interceptor of component click', (done) => {
        let resolve = null
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then(({ type, action, meta, data }) => {
            expect(type).to.equal('click')
            expect(spy.callCount).to.equal(1)
            expect(meta.type).to.equal('vue')
            expect(action).to.equal('componentTest')
            expect(data[0] instanceof MouseEvent).to.equal(true)

            done()
        })

        methodInterceptor({}, (type, action, meta, data) => {   
            resolve({ type, action, meta, data })
        }, Vue)

        Vue.component('Child', {
            methods: {
                componentTest() { spy() }
            },
            render(h) {
                return h('div', {
                    class: 'child',
                    on: {
                        click: this.componentTest
                    }
                }, ['child'])
            }
        })

        let Ctor = Vue.extend({
            methods: {
                test() { spy() }
            },
            render(h) {
                return h('div', [
                    h('div', {
                        on: { click: this.test }
                    }, ['parent']),
                    h('Child')
                ])
            },
            mounted() {
                this.$nextTick(() => {
                    simulant.fire(this.$el.querySelector('.child'), 'click')
                })
            }
        })

        let vm = new Ctor().$mount()
    })

    it('method interceptor of method return arguments', (done) => {
        let resolve = null
        let spy = sinon.spy()

        new Promise((res) => { resolve = res }).then(({ type, action, meta, data }) => { 
            expect(type).to.equal(null)
            expect(action).to.equal('test')
            expect(data.length).to.equal(0)
            expect(spy.callCount).to.equal(1)
            expect(meta.type).to.equal('vue')
            
            done()
        })
        
        methodInterceptor({}, (type, action, meta, data) => {
            resolve({ type, action, meta, data })
        }, Vue)

        let Ctor = Vue.extend({
            methods: {
                test() {
                    spy()
                    return 'spy'
                }
            },
            render(h) {
                return h('div', {
                    on: {
                        click: this.test
                    }
                })
            },
            mounted() {
                expect(this.test()).to.equal('spy')
            }
        })

        let vm = new Ctor().$mount()
    })
})

describe('vue-analysis', () => {
    it('init', function (done) {
        this.timeout(5000)

        Vue.use(analysis, {
            uuid() {
                return new Promise((resolve) => {
                    setTimeout(() => { resolve(123456) }, 1000)
                })
            },
            store: vuex,
            report(type, action, meta, args) {
                if (type === 'commit' && action === 'increment') {
                    expect(args).to.equal(10)
                    expect(meta.id).to.equal(123456)
                    expect(meta.type).to.equal('vuex')
                    expect(meta.timeStamp).to.be.a('number')
                }
    
                if (type === 'commit' && action === 'decrement') {
                    expect(args).to.equal(30)
                    expect(meta.id).to.equal(123456)
                    expect(meta.type).to.equal('vuex')
                    expect(meta.timeStamp).to.be.a('number')
                }
    
                if (type === 'dispatch' && action === 'decrementAsync') {
                    expect(args).to.equal(20)
                    expect(meta.id).to.equal(123456)
                    expect(meta.type).to.equal('vuex')
                    expect(meta.timeStamp).to.be.a('number')
                }
            }
        })

        vuex.commit('increment', 10)
        vuex.dispatch('decrementAsync', 20)

        setTimeout(() => { done() }, 2000)
    })

    it('trackEvent', () => {
        let args = getParamNames(Vue.trackEvent)

        expect(args[0]).to.equal('type')
        expect(args[1]).to.equal('action')
        expect(args[2]).to.equal('event')
        expect(args[3]).to.equal('data')

        function getParamNames(func) {
            let fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '')
            let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)

            if(result === null) {
                result = []
            }

            return result
        }
    })
})      