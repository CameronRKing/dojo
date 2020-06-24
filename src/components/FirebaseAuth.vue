<script>
import firebase from 'firebase/app';
import 'firebase/auth';
// webpack was complaining that there's no default export in this library, so I destructured the only export I actually need
import { auth } from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';


export default {
    mounted() {
        let ui = auth.AuthUI.getInstance();
        if (!ui) {
            ui = new auth.AuthUI(firebase.auth());
        }
        const self = this;
        ui.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult(authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    self.$emit('signed-in');                    
                    return false;
                },
            },
            credentialHelper: firebaseui.auth.CredentialHelper.NONE,
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '<your-tos-url>',
            // Privacy policy url.
            privacyPolicyUrl: '<your-privacy-policy-url>'
        });
    }
}
</script>



<template>
<div id="firebaseui-auth-container"></div>
</template>