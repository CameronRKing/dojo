// using postcss, I should be able to:
    // 1) find all utility classes (even user-added ones)
    // 2) group them into families based on the property they modify
    // 3) generate reasonable keyboard shortcuts
export const shortcutToClass = {
    /* display flex */
    'df': 'flex',
    'dfr': 'flex-row-reverse',
    'dfc': 'flex-column',
    'dfcr': 'flex-column-reverse',
    /* justify content */
    'js': 'justify-start',
    'jc': 'justify-center',
    'je': 'justify-end',
    'ja': 'justify-around',
    'jb': 'justify-between',
    /* align items */
    'is': 'items-start',
    'ir': 'items-stretch',
    'ic': 'items-center',
    'ie': 'items-end',
    'ib': 'items-baseline',
};

// reverses an object's keys/values
function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}

export const classToShortcut = mapInvert(shortcutToClass);

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
    const prefix = givenClass.split('-').slice(0, -1).join('-');

    return Array.from(list).find(name => name.startsWith(prefix));
}