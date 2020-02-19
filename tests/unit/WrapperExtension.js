import { createWrapper, Wrapper } from '@vue/test-utils';

// a simple convenience method because I think it should exist
// trigger('click') has 9 worthless characters repeated endlessly
Wrapper.prototype.click = function() { this.trigger('click'); };

// same basic idea as Cypress.contains, but with a different name
Wrapper.prototype.containsText = function(text) {
    let textTest;
    // cypress normalized whitespace in the innerText
    // I probably should too
    if (typeof text == 'object' && text.test) {
        textTest = (el) => text.test(el.innerText);
    } else {
        textTest = (el) => el.innerText.includes(text);
    }

    const els = depthFirstSearch(this.element, textTest);
    const first = firstDeepestEl(els);
    if (!first) throw new Error(`No element found that matches text "${text}".`);
    return vueCreateWrapper(first);
}

Wrapper.prototype.visit = function(url) {
    this.vm.$router.push(url)
}

// desperately desired, though the Cypress implementation is more complicated than this whole app so far
// so I can't copy that wholesale, and their version doesn't seem to be pluggable (i.e., I can't import it myself)
// I'll probably do something simple with timeouts and trigger('keydown', 'keypress', 'keyup')
Wrapper.prototype.type = function(str) {
    throw new Error('Not yet implemented');
}

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
        return firstDeepestEl(elements, index + 1)
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

function parents(el, selector=null) {
    const parents = [];
    let parent = el.parentNode;
    while (parent) {
        parents.push(parent);
        parent = parent.parentNode;
    };
    return selector ? parents.filter(el => el.matches(selector)) : parents;
}
