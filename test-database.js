const firebase = require('firebase');
require('firebase/firestore');

function range(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function repeat(n, cb) {
    return range(n).map(cb);
}

let shortcutId = 0;
function mockShortcut() {
    return {
        prompt: 'Test ' + shortcutId++,
        action: 'a',
        tags: ['text']
    };
}

firebase.initializeApp({
    projectId: "fire-dojo",
});
firebase.firestore().settings({ 
    host: 'localhost:5000',
    ssl: false
});


const dojos = [
    { owners: ['UUhRavZGiVYzRuCnKq8bRXjOVRa2'], name: 'Olympus', shortcuts: repeat(10, mockShortcut) },
    { owners: ['UUhRavZGiVYzRuCnKq8bRXjOVRa2'], name: 'TailwindCSS', shortcuts: repeat(15, mockShortcut) },
    { owners: [], name: 'Illuminati Mind-Control Spells', shortcuts: repeat(5, mockShortcut) },
    { owners: [], name: 'Lizard People Code Names', shortcuts: repeat(12, mockShortcut) }
];

function createDojo({ name, shortcuts, owners }) {
    firebase.firestore().collection('dojos').add({ name, owners }).then(doc =>
        shortcuts.forEach(shortcut => 
            firebase.firestore().collection('dojos').doc(doc.id).collection('shortcuts').add(shortcut).then(() => console.log(shortcut.prompt + ' added'))
        )
    );
}

dojos.forEach(createDojo);