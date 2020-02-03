import DojoHome from '../../../src/components/DojoHome.vue'
import mountVue from 'cypress-vue-unit-test'

describe('Dojo home', () => {
    const shortcuts = [
        { prompt: 'Underline text', action: 'u', tags: ['text'] },
        { prompt: 'Bold text', action: 'b', tags: ['text'] },
        { prompt: 'Italicize text', action: 'i', tags: ['text'] },
        { prompt: 'Add hyperlink', action: 'k', tags: ['nav'] },
        { prompt: 'Remove hyperlink', action: 'rk', tags: ['nav'] },
    ];

    beforeEach(() => {
        mountVue(DojoHome)()
        Cypress.vue.shortcuts = shortcuts
    })

    
    it('lists available groups of shortcuts', () => {
        cy.contains('text')
        cy.contains('3 shortcuts')
        cy.contains('nav')
        cy.contains('2 shortcuts')
    })

    it('starts a training session for a given group of shortcuts', () => {
        cy.contains('nav').siblings().contains('Train').click()
        
        // we should see one of the prompts on the screen, but we don't know which one
        cy.get('[data-cy=action-label]').within($el => expect(['Add hyperlink', 'Remove hyperlink']).to.include($el.text()))
    })

    it('returns to home when a session ends', () => {
        cy.contains('Train').click()
        cy.contains('End session').click()
        cy.contains('Return to dojo').click()
        cy.contains('text')
        cy.contains('nav')
    })

    it('pops a cheatsheet for all shortcuts in a group', () => {
        cy.contains('text').siblings().contains('Cheatsheet').click()
        cy.contains('Underline text')
        cy.get('.action').contains('u')
        cy.contains('Bold text')
        cy.get('.action').contains('b')
        cy.contains('Italicize text')
        cy.get('.action').contains('i')
    })

    it('pops a cheatsheet for all shortcuts in the dojo', () => {
        cy.contains('Master cheatsheet').click()
        shortcuts.forEach(shortcut => {
            cy.contains(shortcut.prompt)
            cy.get('.action').contains(shortcut.action)
        })
    })
})