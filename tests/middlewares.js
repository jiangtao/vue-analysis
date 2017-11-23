let koaBody = require('koa-body')

function timeout(time, result) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(result)
        }, time)
    })
}

module.exports = [
    koaBody(),
    function* (next) {
        this.set('Access-Control-Allow-Credentials', true)
        this.set('Access-Control-Allow-Origin', this.header.origin || this.origin)
        this.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, PATCH')
        this.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Auth')

        if (this.method === 'OPTIONS') {
            this.status = 200
        } else {
            yield next
        }
    },
    function* (next) {
        let obj, qs

        obj = {}
        qs = this.querystring.length ? this.querystring.split('&') : []

        for (let index = 0; index < qs.length; index++) {
            let [key, value] = qs[index].split('=')
            obj[key] = value
        }

        this.qs = obj

        yield next
    },
    function* (next) {
        if (this.path === '/get' || this.path === '/delete') {
            this.body = this.qs
        } else {
            yield next
        }
    },
    function* (next) {
        if (this.path === '/post' || this.path === '/put' || this.path === '/patch') {
            this.body = this.request.body
        } else {
            yield next
        }
    },
    function* (next) {
        if (this.path === '/headers') {
            this.body = this.headers.auth
        } else {
            yield next
        }
    },
    function* (next) {
        if (this.path === '/timeout') {
            this.body = yield timeout(2000)
        } else {
            yield next
        }
    }
]