// families = { "affected-properties": [array of classes] }
import families from '@/tailwind-families.json';
import shortcuts from '@/tailwind-shortcuts.json';

// pass in a class, get back a family
const classToFamily = Object.keys(families).map(propsAffected =>
    families[propsAffected].reduce((acc, selector) => ({ ...acc, [selector]: propsAffected }), {}) 
).reduce((acc, lookup) => ({ ...acc, ...lookup }), {});

// reverses an object's keys/values
function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}

export const shortcutToClass = shortcuts;
export const classToShortcut = mapInvert(shortcutToClass);
export const allClasses = Object.values(families).reduce((acc, arr) => acc.concat(arr), []);

export function bindShortcuts(cb) {
    Object.keys(shortcutToClass)
        .forEach((shortcut) =>
            Mousetrap.bind(
                shortcut.split('').join(' ') + ' space',
                () => cb(shortcutToClass[shortcut])
            )
        );
}

export function unbindShortcuts() {
    Object.keys(shortcutToClass)
        .forEach((shortcut) => {
            Mousetrap.unbind(shortcut + ' ');
        })
}

export function editTailwindClasses(selection, givenClass) {
    const el = selection.el;
    return selection.findByDataId(node => {
        if (!node.attrs) node.attrs = {};
        if (!node.attrs.class) node.attrs.class = '';

        const elList = el.classList;
        const srcList = node.attrs.class.split(' ').filter(str => str); // remove empty strings
        const { remove, add } = getPatch(Array.from(elList), givenClass);
        if (remove) {
            elList.remove(remove);
            srcList.splice(srcList.indexOf(remove), 1);
        }
        if (add) {
            elList.add(add);
            srcList.push(add);
        }
        node.attrs.class = srcList.join(' ');
        return node;
    });
}

export function getPatch(classList, givenClass) {
    // if it's already there, remove it
    if (classList.includes(givenClass)) {
        return { remove: givenClass }
    } else {
        const familyMember = containsTailwindFamilyMember(classList, givenClass);
        // if there's a similar class, switch it out
        if (familyMember) {
            return {
                remove: familyMember,
                add: givenClass
            };
        // otherwise, just add it
        } else {
            return {
                add: givenClass
            }
        }
    }
}

function containsTailwindFamilyMember(list, givenClass) {
    const family = classToFamily[givenClass];
    return Array.from(list).find(cclass => classToFamily[cclass] == family);
}