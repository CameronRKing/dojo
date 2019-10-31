import KeyTrainer from '../../../src/components/KeyTrainer.vue'
import mountVue from 'cypress-vue-unit-test'

describe('SetPractice', () => {
    beforeEach(() => {
        mountVue(KeyTrainer)()
        Cypress.vue.toTrain = [
            { action: 'Underline text', sequence: 'ctrl+u' },
            { action: 'Bold text', sequence: 'ctrl+b' },
        ];
    })

    it('on correct answer, adds to the progress bar and moves to the next question', () => {
        cy.contains('0/2')
        cy.contains('0 errors')
        cy.get('[data-cy=key-input]').then(el => cy.wrap(el).type('{ctrl}' + Cypress.vue.item.sequence.slice(-1)))
        cy.contains('1/2')
        // the matcher returns the answer in px, not %. Don't know how to test this, but I can verify it visually.
        // cy.get('[data-cy=progress-bar]').should('have.css', 'height', '50%')
        cy.contains('0 errors')

        cy.contains('Bold text');
    })

    it('shakes the question and does not move on if the answer is wrong', () => {
        cy.get('[data-cy=key-input]').type('b')
        cy.contains('0/2')
        cy.contains('1 errors')
        cy.contains('Underline text')
        cy.get('[data-cy=action-label]').should('have.class', 'shake')
    })

    it.only('optionally shows the correct answer after a single incorrect answer', () => {
        cy.get('[data-cy=should-show]').click()
        cy.get('[data-cy=show-options]').click()
        cy.contains('after 1 guess').click()

        cy.get('[data-cy=key-input]').type('b')

        cy.get('[data-cy=key-input]').should('have.attr', 'placeholder', 'ctrl+u')
    })

    // it('chooses the next question randomly from the not-yet-passed pool', () => {

    // })

    // it('shows how many questions they have passed out of how many there are', () => {

    // })

    // it('shows how many errors they have made in the current round', () => {

    // })

    // it('displays a running timer', () => {

    // })

    // it('optionally hides the timer', () => {

    // })

    // it('shows how long the round took when completed', () => {

    // })

    // it('resets the not-yet-passed pool when all questions have been passed', () => {

    // })

    // it('shows a recap when the user decides to end the session', () => {

    // })
})