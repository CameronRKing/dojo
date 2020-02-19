import makeApp from '@/app.js';
import './WrapperExtension.js';
import { createWrapper } from './test-utils.js';


(function(window) {
    // a helper function for exposing @vue/test-utils wrapper functions on the ok object
    function passThru(fns) {
        return fns.reduce((acc, fn) => ({ 
            [fn]: function(...args) { return this.app[fn](...args); },
            ...acc
        }), {})
    }

    // has to be attached to global so our tests can access it
    global.ok = {
        app: null,
        init(beforeEach) {
            beforeEach(() => this.app = createWrapper(makeApp().$mount()));
        },
        // ideally the interface would be more intuitive than the @vue/test-utils interface
        // with automatic waits and no outward distinction between arrays/singletons, etc.
        // you know, more cypress-like. higher-level.
        ...passThru(['get', 'find', 'findAll', 'containsText', 'visit']),
    };
})(window);