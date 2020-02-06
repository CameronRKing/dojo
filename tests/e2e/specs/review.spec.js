import DojoReview from '../../../src/components/dojo/Review.vue'
import SM2Memento from '../../../src/SM2Memento'
import mountVue from 'cypress-vue-unit-test'

describe('Reviewing  shortcuts', () => {
    beforeEach(() => {
        mountVue(DojoReview)();
        Cypress.vue.toTrain = [{ prompt: 'Test', action: 'a', memento: new SM2Memento({ th: 1000, i: 1, ef: 2.5, nextTrainingDate: Date.now() }) }]
    })

    it('ends the session automatically when all shortcuts have been reviewed', () => {
        cy.get('[data-cy=key-input]').type('a')
        cy.contains('Shortcuts reviewed')
        cy.contains('1')
        cy.contains('Time taken')
        cy.contains('0:0')
    })

    it('updates mementos when the session is over', () => {
        const startingInterval = Cypress.vue.toTrain[0].memento.i;
        cy.get('[data-cy=key-input]').type('a')
        cy.contains('Return to dojo').click().then(() => {
            expect(startingInterval).not.to.equal(Cypress.vue.toTrain[0].memento.i);
        })
    })
})