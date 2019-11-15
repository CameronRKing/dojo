// using postcss, I should be able to:
    // 1) find all utility classes (even user-added ones)
    // 2) group them into families based on the property they modify
    // 3) generate reasonable keyboard shortcuts
export const tailwindShortcuts = {
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

function containsTailwindFamilyMember(list, givenClass) {
    const prefix = givenClass.split('-').slice(0, -1).join('-');

    return Array.from(list).find(name => name.startsWith(prefix));
}

export function bindShortcuts(cb) {
    Object.keys(tailwindShortcuts)
        .forEach((shortcut) =>
            Mousetrap.bind(
                shortcut.split('').join(' ') + ' space',
                () => cb(tailwindShortcuts[shortcut])
            )
        );
}

export function unbindShortcuts() {
    Object.keys(tailwindShortcuts)
        .forEach((shortcut) => {
            Mousetrap.unbind(shortcut + ' ');
        })
}

export function getPatch(classList, givenClass) {
    // if it's already there, typing the class shortcut deletes it
    if (classList.includes(givenClass)) {
        return { remove: givenClass }
    } else {
        const familyMember = containsTailwindFamilyMember(classList, givenClass);
        if (familyMember) {
            return {
                remove: familyMember,
                add: givenClass
            };
        } else {
            return {
                add: givenClass
            }
        }
    }
}

export function editTailwindClasses(selection, givenClass) {
    const el = selection.el;
    return selection.findByDataId(node => {
        if (!node.attrs) node.attrs = {};
        if (!node.attrs.class) node.attrs.class = '';

        const elList = el.classList;
        const srcList = node.attrs.class.split(' ');
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