// https://docs.cypress.io/api/introduction/api.html

import KeyInput from '../../../src/components/KeyInput.vue'
import mountVue from 'cypress-vue-unit-test'

describe('My First Test', () => {
    beforeEach(mountVue(KeyInput))

    const successCases = [
        ['a', 'a'],
        ['a b', 'ab'],
        ['alt v c', '{alt}', 'vc'],
        ['ctrl+a', '{ctrl}a'],
        ['ctrl+a ctrl+b', '{ctrl}ab'],
        ['ctrl+a ctrl+b', '{ctrl}a', '{ctrl}b'],
    ];

    const failureCases = [
        ['a', 'b', 'b'],
        ['a', 'ctrl+a', '{ctrl}a'],
        ['a b', 'b a', 'ba'],
        ['alt v c', 'alt+v', '{alt}v'],
        ['ctrl+a', 'a', 'a'],
        ['ctrl+a', 'alt+a', '{alt}a'],
        ['ctrl+a', 'ctrl+shift+a', '{ctrl}{shift}a'],
        ['ctrl+shift+a', 'ctrl+a', '{ctrl}a'],
        ['ctrl+a b', 'ctrl+a c', '{ctrl}a', 'c'],
        ['ctrl+a b', 'ctrl+a ctrl+b', '{ctrl}ab'],
        ['ctrl+a ctrl+b', 'ctrl+b ctrl+a', '{ctrl}ba'],
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
