import DojoReview from '../../../src/components/dojo/Review.vue'
import mountVue from 'cypress-vue-unit-test'

describe('Reviewing  shortcuts', () => {
    beforeEach(() => {
        mountVue(DojoReview)();
        Cypress.vue.toTrain = [{ prompt: 'Test', action: 'a', memento: { th: 200 } }];
    })

    it('ends the session automatically when all shortcuts have been learned', () => {
        cy.get('[data-cy=key-input]').type('a')
        cy.contains('Shortcuts reviewed')
        cy.contains('1')
        cy.contains('Time taken')
        cy.contains('0:0')
    })
})