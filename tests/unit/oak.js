import makeApp from '@/app.js';
import { createWrapper } from './test-utils.js';

(function(window) {
    // lifted from https://en.wikipedia.org/wiki/Depth-first_search#Pseudocode
    function depthFirstSearch(el, test) {
        const toTest = [];
        const passedTest = [];

        toTest.push(el);
        while (toTest.length) {
            const nextEl = toTest.pop();

            if (test(nextEl)) passedTest.push(nextEl);

            Array.from(nextEl.children).forEach(child => toTest.push(child));
        }

        return passedTest;
    }

    function parents(el, selector=null) {
        const parents = [];
        let parent = el.parentNode;
        while (parent) {
            parents.push(parent);
            parent = parent.parentNode;
        };
        return selector ? parents.filter(el => el.matches(selector)) : parents;
    }

    // lifted from https://github.com/cypress-io/cypress/blob/develop/packages/driver/src/dom/elements.ts
    // with some modification, since I'm not using jQuery
    function firstDeepestEl(elements, index=0) {
        const priorityElement = 'input[type=\'submit\'], button, a, label';

        // iterate through all of the elements in pairs
        // and check if the next item in the array is a
        // descedent of the current. if it is continue
        // to recurse. if not, or there is no next item
        // then return the current
        const current = elements[index];
        const next = elements[index + 1];

        if (!next) return current;

        if (current.contains(next)) {
            return getFirstDeepestElement(elements, index + 1)
        }

        if (current.matches(priorityElement)) return current;

        // else once we find the first deepest element then return its priority
        // parent if it has one and it exists in the elements chain
        const priorities = parents(current, priorityElement);

        if (priorities.length) {
            return priorities[priorities.length - 1];
        }

        return current;
    }

    // a helper function for exposing @vue/test-utils wrapper functions on the ok object
    function passThru(fns) {
        return fns.reduce((acc, fn) => ({ 
            [fn]: function(...args) { return this.app[fn](...args); },
            ...acc
        }), {})
    }

    global.ok = {
        app: null,
        init(beforeEach) {
            beforeEach(() => this.app = createWrapper(makeApp().$mount()));
        },
        // ideally the interface would be more intuitive than the @vue/test-utils interface
        // with automatic waits and no outward distinction between arrays/singletons, etc.
        // the thing I really want is contains(text)
        ...passThru(['get', 'find', 'findAll']),
        contains(text) {
            let textTest;
            if (typeof text == 'object' && text.test) {
                textTest = (el) => text.test(el.innerText);
            } else {
                textTest = (el) => el.innerText.includes(text);
            }

            const els = depthFirstSearch(this.app.vm.$el, textTest);
            const first = firstDeepestEl(els);
            return first;
        },
        visit(url) {
            this.app.vm.$router.push(url);
        }
    };
})(window);