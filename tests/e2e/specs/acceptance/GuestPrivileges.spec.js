// these tests assume that firebase emulators:start --only firestore && node test-database.js have been run
describe('Guest privileges', () => {
    it('a guest can see only public dojos', () => {
        cy.visit('/dojos')
        // this is the assertion that makes certain no private dojos are on the page
        // we know that there are only two public dojos in the test database
        cy.get('[data-cy=dojo-name]').should('have.length', 2)
        cy.contains('Olympus')
        cy.contains('TailwindCSS')
    })

    it.skip('a guest can enter a public dojo', () => {
        cy.visit('/dojos')
        cy.contains('Olympus').siblings().contains('Enter').click()
        cy.contains('Master cheatsheet')
        cy.contains('Train')
    })
})