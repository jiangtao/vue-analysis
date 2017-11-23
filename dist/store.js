export default {
    get(key, isCookie = false) {
        if (window.localStorage && !isCookie) {
            return window.localStorage.getItem(key)
        } else {
            for (let item of document.cookie.split(/;\s/g)) {
                if (~item.indexOf(key)) {
                    return item.split('=')[1]
                }
            }

            return null
        }
    },
    set(key, val, isCookie = false) {
        if (window.localStorage && !isCookie) {
            window.localStorage.setItem(key, val)
        } else {
            let date = new Date()
            date.setDate(date.getDate() + 3650)
            document.cookie = `${key}=${val}; expires=${date.toUTCString()}`
        }

        return val
    },
    remove(key, isCookie = false) {
        if (window.localStorage && !isCookie) {
            window.localStorage.removeItem(key)
        } else {
            document.cookie = `${key}=''; expires=${new Date(0).toUTCString()}`
        }
    }
}