import j from 'jscodeshift';
import methods from '@/types/methods';
import { pairs, mapWithKeys } from '@/utils';
import fs from '@/fs-client';

window.j = j;

// register user methods for jscodeshift collections
pairs(methods).forEach(([type, handlers]) => {
    const wrappedHandlers = mapWithKeys(
        pairs(handlers).map(([name, fn]) => {
            return [name, function() { this.forEach(fn); }];
        })
    );
    j.registerMethods(wrappedHandlers, j[type])
});


window.addMethod = async function(type, method) {
    const file = await fs.read('src/types/methods.js');
    const jSrc = j(file);
    if (!jSrc.find(j.Identifier, { name: type.name }).length) {
        jSrc.find(j.ExportDefaultExpression).get()
            .value
            .declaration
            .properties.push(j.property('init', j.identifier(type.name), j.objectExpression([])));
    }
    const fn = j(method.toString()).find(j.FunctionDeclaration).get().value;
    fn.type = 'FunctionExpression';
    const fnProp = j.property('init', j.identifier(method.name), fn);
    fnProp.method = true;
    jSrc.find(j.Identifier, { name: type.name })
        .closest(j.Property)
        .find(j.ObjectExpression)
        .get().value
        .properties.push(fnProp);

    fs.write('src/types/methods.js', jSrc.toSource());
}

import shortcuts from '@/types/shortcuts.json';
window.addShortcut = async function(type, shortcut) {
    shortcuts[shortcut] = type.name;
    fs.write('src/types/shortcuts.json', JSON.stringify(shortcuts, null, 4));
}