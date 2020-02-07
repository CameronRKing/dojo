// https://firebase.google.com/docs/functions/callable#initialize_the_client_sdk
// the best way to use cloud functions in this application is through callable functions
// they receive the auth instance, and client-side they're essentially async functions returned from a string constructor
// this means that I can put strict rules on the firestore itself
// and do more detailed permission checking in cloud functions (since I'll get a reliable auth object)

/*
// server-side
exports.addMessage = functions.https.onCall((data, context) => {
    expect(data).to.deep.equal({ text: 'I am the argument' });
    return { text: 'I am the return value' };

    // the docs say that "auth/user informatinon is automatically added to the request"
    // where will roles live? will I need to look them up, or will they be present here?
    const uid = context.auth.uid;

    // errors have to be thrown a specific way for the client to get the detailed data
    if (!(typeof text === 'string') || text.length === 0) {
        // first argument is one of strings found here:
        // https://firebase.google.com/docs/reference/functions/providers_https_.html#functionserrorcode
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "text" containing the message text to add.');
    }
});

// client-side
var addMessage = firebase.functions().httpsCallable('addMessage');
addMessage({ text: 'I am the argument' }).then(function(result) {
    expect(result.data).to.deep.equal({ text: 'I am the return value' });
});


*/


// to simplify conditional logic for public/private dojos,
// I could create two RBAC instances with different configurations
// and choose which one to query based on is_public
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