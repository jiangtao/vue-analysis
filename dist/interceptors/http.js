import { isAxios, getResponseType } from '../utils'

export default function httpInterceptor({ http }, trackEvent) {
    if (isAxios(http)) {
        http.interceptors.request.use((config) => {
            config.timeStamp = Date.now()
            return config
        })

        http.interceptors.response.use((res) => report(res, trackEvent), (err) => {
            report(err.response ? err.response : err, trackEvent)
            return Promise.reject(err)
        })
    }
}

function report(res, callback) {
    callback('request', res.config.method, { type: 'axios' }, {
        url: res.config.url,
        message: res.message,
        timeStamp: [res.config.timeStamp, Date.now()],
        res: {
            data: res.data || {},
            headers: res.headers || {},
            responseType: getResponseType(res.headers ? res.headers['content-type'] : '') || 'json'
        },
        req: {
            headers: res.config.headers || {},
            data: (['post', 'put', 'patch'].includes(res.config.method) ? res.config.data : res.config.params) || {}
        }
    })

    return res
}