// https://docs.cypress.io/api/introduction/api.html

import KeyInput from '../../../src/components/KeyInput.vue'
import mountVue from 'cypress-vue-unit-test'

describe('My First Test', () => {
    beforeEach(mountVue(KeyInput))

    // need a set of success cases and failure cases
    // success cases include the stored key sequence and the actual keypresses
    // failure cases include the stored key sequence, the actual keypresses, and the failure message

    // a single keypress without modifiers
    // two sequential keypresses without modifiers
    // a keypress with a single modifier
    // a modified keypress followed by a non-modified keypress
    // a modified keypress followed by a differently modified keypress
    // two keypresses that share a modifier
    // repeat with multiple modifiers
    const successCases = [
        ['a', 'a'],
        ['a b', 'ab'],
        ['alt v c', '{alt}', 'vc'],
        ['ctrl+a', '{ctrl}a']
    ];

    const failureCases = [
        ['a', 'b', 'b'],
        ['a', 'ctrl+a', '{ctrl}a'],
        ['ctrl+a', 'a', 'a'],
        ['ctrl+a', 'alt+a', '{alt}a'],
        ['ctrl+a', 'ctrl+shift+a', '{ctrl}{shift}a'],
        ['ctrl+shift+a', 'ctrl+a', '{ctrl}a'],
        ['ctrl+a b', 'ctrl+a c', '{ctrl}a', 'c'],
        ['ctrl+a b', 'ctrl+a ctrl+b', '{ctrl}ab'],
    ]

    successCases.forEach(([expected, ...actual]) => {
        it('handles success for ' + expected, () => {
            Cypress.vue.expected = expected;
            actual.forEach(sequence => {
                cy.get('[data-cy=key-input]').type(sequence)
            });
            cy.contains('correct!')
        })
    })

    failureCases.forEach(([expected, failureMessage, ...actual]) => {
        it('handles failure for ' + expected + ' when it receives ' + actual.join(), () => {
            Cypress.vue.expected = expected;
            actual.forEach(sequence => {
                cy.get('[data-cy=key-input]').type(sequence)
            })
            cy.contains(failureMessage)
        })
    })
})
