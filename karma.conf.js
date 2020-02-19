var webpackConfig = require('.//node_modules/@vue/cli-service/webpack.config.js')

module.exports = function(config) {
    config.set({
        frameworks: ['mocha'],
        files: [
            'tests/unit/mount-point.js',
            'tests/unit/**/*.spec.js',
        ],
        preprocessors: {
            'tests/unit/mount-point.js': ['webpack'],
            '**/*.spec.js': ['webpack', 'sourcemap']
        },
        webpack: webpackConfig,
        client: {
            clearContext: false
        }
    });
};