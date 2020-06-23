// these tests assume that test-database.js is running
// mocking the firebase realtime database gives us more robust tests
// without having to pollute the real database
describe('Dojo lookup', () => {
    beforeEach(() => {
        // cy.login('test@test.com', 'password')
        cy.visit('/dojos')
    })

    it('a user can see all public dojos', () => {
        
    });

    it('shows dojos the user has trained in', () => {

    });

    it('shows dojos the user owns', () => {

    });

    it('shows dojos the user has a non-ownership role in', () => {

    });
});