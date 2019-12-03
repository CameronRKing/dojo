const io = require('socket.io')();
const plugins = [
    require('./filesystem.js'),
    require('./data-ids.js'),
];

io.on('connection', (client) => {
    forEachRouteIn(plugins, (route, handler) => {
        client.on(route, (args, cb) => {
            const response = handler(args);
            if (typeof response == 'object' && typeof response.then == 'function') {
                response.then(cb).catch(cb);
            } else {
                cb(response);
            }
        });
    })
});

function forEachRouteIn(plugins, cb) {
    plugins.forEach(handlers => {
        Object.keys(handlers).forEach(route => {
            cb(route, handlers[route]);
        });
    });
}

io.listen(3000);


