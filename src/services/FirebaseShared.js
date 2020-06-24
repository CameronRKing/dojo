import firebase from 'firebase/app';
import 'firebase/auth';
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

export const db = firebase.firestore();

// turns a string like 'dojos/mydojo/shortcuts' into a query builder
// in this case, firebase.firestore().collection('dojos').doc('mydojo').collection('shortcuts')
export function path(str) {
    let collOrDoc = 'collection';
    const toggleCollOrDoc = () => collOrDoc = (collOrDoc == 'collection' ? 'doc' : 'collection');
    const next = () => {
        const toReturn = collOrDoc;
        toggleCollOrDoc();
        return toReturn;
    }
    return str.split('/').reduce((acc, fragment) => acc[next()](fragment), firebase.firestore());
}

// converts a snapshot into an object or array of objects
export function docify(snapshot) {
    const makeDoc = (doc) => ({ ...doc.data(), id: doc.id });
    if (snapshot.forEach) {
        const docs = [];
        snapshot.forEach(doc => docs.push(makeDoc(doc)));
        return docs;
    }
    return makeDoc(snapshot);
}