import KeyTrainer from '../../../src/components/KeyTrainer.vue'
import mountVue from 'cypress-vue-unit-test'

describe('SetPractice', () => {
    beforeEach(() => {
        mountVue(KeyTrainer)()
        Cypress.vue.toTrain = [
            { prompt: 'Underline text', action: 'ctrl+u' },
            { prompt: 'Bold text', action: 'ctrl+b' },
        ];
    })

    it('on correct answer, adds to the progress bar and moves to the next question', () => {
        cy.contains('0/2')
        cy.contains('Underline text')
        cy.get('[data-cy=key-input]').then(el => cy.wrap(el).type('{ctrl}' + Cypress.vue.shortcut.action.slice(-1)))
        cy.contains('1/2')
        cy.contains('Bold text')
    })

    it('on a wrong answer, shows the right answer and prompts the user to press any key to continue', () => {
        cy.get('[data-cy=key-input]').type('b')
        cy.contains('0/2')
        cy.contains('Underline text')
        cy.contains('You pressed:')
        cy.contains('b')
        cy.contains('Correct answer:')
        cy.contains('ctrl+u')
        cy.contains('Press any key to continue')
    })

    // it('chooses the next question randomly from the not-yet-passed pool', () => {

    // })

    // it('shows how long the round took when completed', () => {

    // })

    // it('resets the not-yet-passed pool when all questions have been passed', () => {

    // })

    // it('shows a recap when the user decides to end the session', () => {

    // })
})