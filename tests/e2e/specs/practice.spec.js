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
        cy.get('[data-cy=action-label]').within($el => cy.contains(Cypress.vue.shortcut.prompt))
        cy.get('[data-cy=key-input]').then(el => cy.wrap(el).type('{ctrl}' + Cypress.vue.shortcut.action.slice(-1)))
        cy.contains('1/2')
        cy.get('[data-cy=action-label]').within($el => cy.contains(Cypress.vue.shortcut.prompt))
    })

    it('on a wrong answer, shows the right answer and prompts the user to press any key to continue', () => {
        cy.get('[data-cy=key-input]').type('x')
        cy.contains('0/2')
        cy.contains('You pressed:')
        cy.contains('x')
        cy.contains('Correct answer:')
        cy.contains('Press any key to continue')
    })

    it('chooses the next question randomly from the not-yet-passed pool', () => {
        const fullSet = [
            { prompt: 'Underline text', action: 'u' },
            { prompt: 'Bold text', action: 'b' },
            { prompt: 'Italicize text', action: 'i' },
            { prompt: 'Add hyperlink', action: 'k' },
        ];

        Cypress.vue.toTrain = fullSet;

        const passed = [];
        const notYetPassed = fullSet.slice();

        for (let i = 0; i < fullSet.length; i++) {
            cy.get('[data-cy=key-input]').within($input => {
                const currentItem = notYetPassed.find(({ prompt }) => prompt == Cypress.vue.shortcut.prompt);
                expect(currentItem).to.be.ok;
            
                cy.wrap($input).type(currentItem.action)
                
                passed.push(currentItem)
                notYetPassed.splice(notYetPassed.indexOf(currentItem), 1);
            })
        }
    })

    it('keeps missed questions in the not-yet-passed pool', () => {
        const fullSet = [
            { prompt: 'Bold text', action: 'b' },
            { prompt: 'Underline text', action: 'u' },
            { prompt: 'Italicize text', action: 'i' },
            { prompt: 'Add hyperlink', action: 'k' },
        ];

        Cypress.vue.toTrain = fullSet;

        const willMiss = 'Underline text';
        let seenBefore = false;
        let sawTwice = false;

        for (let i = 0; i < fullSet.length + 1; i++) {
            cy.get('[data-cy=trainer]').within($el => {
                if (Cypress.vue.shortcut.prompt == willMiss) {
                    if (!seenBefore) {
                        cy.get('[data-cy=key-input]').type('x')
                        cy.contains('Correct answer:')
                        cy.get('[data-cy=move-on-input]').type('{enter}')
                        seenBefore = true
                    } else {
                        cy.get('[data-cy=key-input]').type(Cypress.vue.shortcut.action)
                        sawTwice = true;
                    }
                } else {
                    cy.get('[data-cy=key-input]').type(Cypress.vue.shortcut.action)
                }

                if (i == fullSet.length)
                    expect(sawTwice).to.be.true;
            });
        }
    })

    it('resets the not-yet-passed pool when all questions have been passed', () => {
        const fullSet = [
            { prompt: 'Underline text', action: 'u' },
            { prompt: 'Bold text', action: 'b' },
            { prompt: 'Italicize text', action: 'i' },
            { prompt: 'Add hyperlink', action: 'k' },
        ];

        Cypress.vue.toTrain = fullSet;

        // easiest way to check is just to run through it twice
        for (let i = 0; i < fullSet.length * 2; i++) {
            if (i < fullSet.length) cy.contains('Round: 1')
            else cy.contains('Round: 2')
            cy.get('[data-cy=key-input]').within($el => cy.wrap($el).type(Cypress.vue.shortcut.action))
        }
    })

    // it('shows how long the round took when completed', () => {

    // })

    // it('resets the not-yet-passed pool when all questions have been passed', () => {

    // })

    // it('shows a recap when the user decides to end the session', () => {

    // })
})