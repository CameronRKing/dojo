import KeyTrainer from '../../../src/components/KeyTrainer.vue'
import mountVue from 'cypress-vue-unit-test'

describe('SetPractice', () => {
    const fullSet = [
        { prompt: 'Underline text', action: 'u' },
        { prompt: 'Bold text', action: 'b' },
        { prompt: 'Italicize text', action: 'i' },
        { prompt: 'Add hyperlink', action: 'k' },
    ];
    
    beforeEach(() => {
        mountVue(KeyTrainer)()
        Cypress.vue.toTrain = fullSet.slice();
    })

    function typeCurrentAction() {
        cy.get('[data-cy=key-input]').within($el => cy.wrap($el).type(Cypress.vue.shortcut.action))
    }

    it('on correct answer, adds to the progress bar and moves to the next question', () => {
        cy.contains('0/4')
        cy.get('[data-cy=action-label]').within($el => cy.contains(Cypress.vue.shortcut.prompt))
        typeCurrentAction()
        cy.contains('1/4')
        cy.get('[data-cy=action-label]').within($el => cy.contains(Cypress.vue.shortcut.prompt))
    })

    it('on a wrong answer, shows the right answer and prompts the user to press any key to continue', () => {
        cy.get('[data-cy=key-input]').type('x')
        cy.contains('0/4')
        cy.contains('You pressed:')
        cy.contains('x')
        cy.contains('Correct answer:')
        cy.contains(Cypress.vue.shortcut.action)
        cy.contains('Press any key to continue')
    })

    it('chooses the next question randomly from the not-yet-passed pool', () => {
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
                        typeCurrentAction()
                        sawTwice = true;
                    }
                } else {
                    typeCurrentAction()
                }

                if (i == fullSet.length)
                    expect(sawTwice).to.be.true;
            });
        }
    })

    it('resets the not-yet-passed pool when all questions have been passed', () => {
        // easiest way to check is just to run through it twice
        for (let i = 0; i < fullSet.length * 2; i++) {
            if (i < fullSet.length) cy.contains('Round: 1')
            else cy.contains('Round: 2')
            typeCurrentAction()
        }
    })

    it.only('shows a review when the user ends the session', () => {
        for (let i = 0; i < fullSet.length * 2; i++) {
            typeCurrentAction()
        }

        cy.contains('End session').click()

        cy.contains('Shortcuts trained')
        cy.contains('4')
        cy.contains('Rounds')
        cy.contains('2')
        cy.contains('Total attempts')
        cy.contains('8')
        cy.contains('Accuracy')
        cy.contains('100%')
        cy.contains('Length')
        // no way to know what the length will be precisely, but we know it'll be in the seconds
        cy.contains('0:0')
        cy.contains('Return to dojo')
    })
})