import { RBAC } from 'rbac'; // ES5 var RBAC = require('rbac').default;
const rbac = new RBAC({
    roles: ['owner', 'editor', 'user'],
    permissions: {
        dojo: ['view', 'edit', 'delete', 'authorize', 'fork'],
    },
    grants: {
        user: ['view_dojo'],
        editor: ['user', 'edit_dojo'],
        owner: ['editor', 'delete_dojo', 'authorize_dojo', 'fork_dojo']
    },
});

await rbac.init();

// viewable dojos: is_public || user.hasRole(dojo)
    // this is gonna be a nasty query to write in Firebase.firestore, I think
// get user roles for given dojo from repository
    // if dojo is public, have role user by default if no other role
    // don't load role until user loads dojo
// if you can view a dojo, you can fork it. They seem so tied together that I'm not sure forking needs a concept.
    // unless private dojos shouldn't be forkable except by owners?
        // but that adds complexity: public dojos can be forked by anyone, but private dojos can only be forked by owners
        // we'll have to add conditional role checking based on dojo.is_public
// RBAC will have to run in two places: in cloud functions (for security) and in-browser (to indicate abilities in UI)
// authorize_dojo means editing the roles of other users in relation to the given dojo

// this library does a fair bit, but we still have to manage loading and saving roles ourselves
    // user_roles
        // user_id
        // role
        // dojo_id
    // or just slap them in the user's data
        // roles: { dojo_id: role }
        // much easier to query and update, then
    // viewable dojos query can become something like dojo.is_public UNION user.dojosWithRoles()
// we'll also need UI for role-management (finding user + choosing role, editing role, removing user)