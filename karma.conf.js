var webpackConfig = require('.//node_modules/@vue/cli-service/webpack.config.js')

module.exports = function(config) {
    config.set({
        frameworks: ['mocha'],
        files: [
            'tests/unit/browser.vue',
            'tests/unit/**/*.spec.js',
        ],
        preprocessors: {
            '**/*.vue': ['webpack', 'sourcemap'],
            '**/*.spec.js': ['webpack', 'sourcemap']
        },
        webpack: webpackConfig,
        client: {
            clearContext: false
        }
    });
};