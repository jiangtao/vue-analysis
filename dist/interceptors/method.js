import { getEventType } from '../utils'

export default function methodInterceptor(options, trackEvent, Vue) {
    Vue.mixin({
        beforeCreate() {
            let methods = this.$options.methods || {}

            for (let name in methods) {
                let fn = methods[name]
                
                methods[name] = function (...args) {
                    let event, len, result
                    
                    len = args.length
                    
                    if (len > 1) {
                        result = fn.apply(this, args)
                        event = args.filter((item) => item instanceof Event)[0]
                    } else if (len === 1) {
                        result = fn.call(this, args[0])
                        event = args[0] instanceof Event ? args[0] : null
                    } else {
                        result = fn.call(this)
                    }

                    trackEvent(event ? event.type : getEventType(), name, { type: 'vue' }, args)

                    return result
                }
            }
        }
    })
}