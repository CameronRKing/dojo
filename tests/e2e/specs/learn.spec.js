import DojoLearn from '../../../src/components/dojo/Learn.vue'
import mountVue from 'cypress-vue-unit-test'

describe('Learning new shortcuts', () => {
    beforeEach(() => {
        mountVue(DojoLearn)();
        Cypress.vue.toTrain = [{ prompt: 'Test', action: 'a' }];
    })
    
    it('ends the session automatically when all shortcuts have been learned', () => {
        // four right answers to get to the end (one to learn, three to reinforce)
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.contains('Shortcuts learned')
        cy.contains('1')
        cy.contains('Time taken')
        cy.contains('0:0')
    })

    it('initializes mementos when the session is over', () => {
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.get('[data-cy=key-input]').type('a')
        cy.contains('Return to dojo').click().then(() => {
            expect(Cypress.vue.toTrain[0].memento).to.be.ok;
        });
    })
})