import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC0AvjfMDyEwZa35UdUSSCtUFaaIgYx8HM",
    authDomain: "fire-dojo.firebaseapp.com",
    databaseURL: "https://fire-dojo.firebaseio.com",
    projectId: "fire-dojo",
    storageBucket: "fire-dojo.appspot.com",
    messagingSenderId: "161498702009",
    appId: "1:161498702009:web:0a0454fbf498064feefb68"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

if (location.hostname === "localhost") {
    window.fb = firebase;
    window.fs = firebase.firestore();
    firebase.firestore().settings({
        host: "localhost:5000",
        ssl: false
    });
}

// turns a string like 'dojos/mydojo/shortcuts' into a query builder
// in this case, firebase.firestore().collection('dojos').doc('mydojo').collection('shortcuts')
function path(str) {
    let collOrDoc = 'collection';
    const toggleCollOrDoc = () => collOrDoc = (collOrDoc == 'collection' ? 'doc' : 'collection');
    const next = () => {
        const toReturn = collOrDoc;
        toggleCollOrDoc();
        return toReturn;
    }
    return str.split('/').reduce((acc, fragment) => acc[next()](fragment), firebase.firestore());
}

function docify(snapshot) {
    const makeDoc = (doc) => ({ ...doc.data(), id: doc.id });
    if (snapshot.forEach) {
        const docs = [];
        snapshot.forEach(doc => docs.push(makeDoc(doc)));
        return docs;
    }
    return makeDoc(snapshot);
}

export default class FirebaseDojoRepo {
    constructor(user=null) {
        this.user = user;
    }

    userId() {
        return this.user ? this.user.uid : null;
    }

    all() {
        return path('dojos').where('is_public', '==', true).get().then(docify);
    }

    private() {
        return path('dojos').where('is_public', '==', false).get().then(docify);
    }

    async byId(id) {
        return path(`dojos/${id}`).get().then(docify)
    }

    updateMementos(id, mementos) {
        // todo
    }

    // dojo (coll) => dojo_id (doc)
    //     shortcuts (subcoll)
    //         - shortcut_id (doc): shortcut stuff
    //     users (subcoll)
    //         - user_id (doc): role
    //         (subcoll) mementos => shortcut_id (doc): memento stuff 
    // we'll put test data under the "test" key, with a single doc "default", which subcollects all the usual data from then on
        // we'll have to put some kind of security lock on it: maybe
        
    // or, if I push all query logic into cloud functions, then the cloud functions themselves can determine which database they draw from
    // there's process environment variables, right?
}