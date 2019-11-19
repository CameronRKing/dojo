export function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}

export function pairs(obj) {
    return Object.keys(obj).map(key => [key, obj[key]]);
}

export function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

export function decapitalize(str) {
    return str[0].toLowerCase() + str.slice(1);
}

export function mapWithKeys(arr, cb) {
    if (!cb) cb = (args) => args;
    return arr.reduce((acc, value) => { 
        const [key, val] = cb(value);
        return {...acc, [key]: val };
    }, {});
}

import shortcuts from '@/types/shortcuts';
const typeToShortcut = mapInvert(shortcuts);
export function showType(type, shouldCapitalize=true) {
    const change = shouldCapitalize ? capitalize : decapitalize; 
    if (typeToShortcut[type]) return change(typeToShortcut[type]);
    return type;
}
