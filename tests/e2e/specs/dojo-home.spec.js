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
        Cypress.vue.shortcuts = shortcuts.slice()
    })

    function train(tag) {
        cy.contains(tag).siblings().contains('Train').click()
    }

    
    it('lists available groups of shortcuts', () => {
        cy.contains('text')
        cy.contains('3 shortcuts')
        cy.contains('nav')
        cy.contains('2 shortcuts')
    })

    it('starts a training session for a given group of shortcuts', () => {
        train('nav')
        
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

    it('adds new shortcuts to the master list', () => {
        cy.contains('Edit master list').click()
        cy.contains('Add new shortcut').click()
        cy.get('[data-cy=edit-shortcut-prompt]').type('Open Hitchhikers Guide')
        // unfortunately, cypress doesn't seem to play well with Mousetrap
        // I can verify that recording works manually, but it does not work in tests
        // cy.contains('Record action').click()
        // cy.get('[data-cy=edit-shortcut-action]').type('{ctrl}h')
        // cy.wait(1100)
        // cy.contains('Finish recording').click()
        // cy.contains('ctrl+h')
        cy.get('[data-cy=edit-shortcut-tags]').type('nav stellar')
        cy.contains('Finish editing').click()
        cy.contains('Done').click()

        cy.contains('stellar')
        cy.contains('1 shortcuts')
    })

    it('removes existing shortcuts from the master list', () => {
        cy.contains('text').siblings().contains('3 shortcuts')

        cy.contains('Edit master list').click()
        cy.contains('Underline text').siblings().contains('Delete').click()
        cy.contains('Done').click()

        cy.contains('text').siblings().contains('2 shortcuts')
    })

    it('edits prompt and tags of a shortcut on the master list', () => {
        // we have to verify action editing by hand since Mousetrap and Cypress don't play well together
        cy.contains('Edit master list').click()
        cy.contains('Bold text').siblings().contains('Edit').click()
        cy.get('[data-cy=edit-shortcut-tags]').type(' font-weight')
        cy.get('[data-cy=edit-shortcut-prompt]').type('{selectall}{backspace}Make bold')
        cy.contains('Finish editing').click()
        cy.contains('Make bold')
        cy.contains('text font-weight')
        cy.contains('font-weight').siblings().contains('1 shortcuts')
    })
})