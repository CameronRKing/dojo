describe('Dojo management', () => {
    // seems like it'd be best to create a set of users and dojos to use in all these tests
    // one public dojo, one private
    // one user with no permissions, one user for each role in the private dojo
    // then we can define permission tests in terms of the user-roles and expected outcomes in a data-driven, declarative way

    // here's a big question: should all these tests go through the UI, or just CHECK the UI for item existence
    // and go through the API to save time?
    // my instinct is go through the API for permissions tests, and go through the UI somewhere else

    it('a user can create a new dojo', () => {

    });

    it('a user can fork a dojo', () => {

    });

    it('a user can delete a dojo they own', () => {

    });

    it('a user cannot delete a dojo they do not own', () => {

    });

    it('a user can add shortcuts to a dojo with proper rights', () => {
        // editor or owner
    });

    it('a user cannot add shortcuts to a dojo without proper rights', () => {

    });

    it('a user can remove shortcuts from a dojo with proper rights', () => {

    });

    it('a user cannot remove shortcuts from a dojo without proper rights', () => {

    });

    it('a user can edit shortcuts in a dojo with proper rights', () => {

    });

    it('a user cannot edit shortcuts in a dojo without proper rights', () => {

    });

    it('a dojo owner can add roles to users in the dojo', () => {

    });

    it('a dojo owner can edit the roles of users in the dojo', () => {

    });

    it('a dojo owner can remove user roles from the dojo', () => {

    });

    it('a dojo owner can remove themselves from a dojo only if there is another owner', () => {

    });

    it('a non-owner cannot manage roles in a dojo', () => {

    });

    it('a dojo owner can change the name of a dojo', () => {

    });

    it('a non-owner cannot change the name of a dojo', () => {

    });
});