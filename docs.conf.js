var path = require('path')
module.exports = {
    port: 9999,
    webpack: {
        resolve: {
            alias: {
                'src': path.resolve(__dirname, 'src')
            }
        }
    },
    md: { dir: './' },
    vue: { dir: './docs' }
}