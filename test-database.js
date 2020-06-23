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
    { is_public: true, name: 'Olympus', shortcuts: repeat(10, mockShortcut) },
    { is_public: true, name: 'TailwindCSS', shortcuts: repeat(15, mockShortcut) },
    { is_public: false, name: 'Illuminati Mind-Control Spells', shortcuts: repeat(5, mockShortcut) },
    { is_public: false, name: 'Lizard People Code Names', shortcuts: repeat(12, mockShortcut) }
];

function createDojo({ name, shortcuts, is_public }) {
    firebase.firestore().collection('dojos').add({ name, is_public }).then(doc =>
        shortcuts.forEach(shortcut => 
            firebase.firestore().collection('dojos').doc(doc.id).collection('shortcuts').add(shortcut).then(() => console.log(shortcut.prompt + ' added'))
        )
    );
}

dojos.forEach(createDojo);