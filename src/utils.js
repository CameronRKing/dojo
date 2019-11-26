export function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}

export function pairs(obj) {
    return Object.keys(obj).map(key => [key, obj[key]]);
}

export function assocIn(modified, toAdd) {
    pairs(toAdd).forEach(([key, val]) => modified[key] = val);
    return modified;
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

export function remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == -1) return;
    arr.splice(idx, 1);
}

export function first(arr) {
    if (arr.length == 0) throw new Error('Array is empty. Cannot get first item.');
    return arr[0];
}

export function last(arr) {
    return arr[arr.length - 1];
}

export function nextIdx(arr, idx) {
    if (idx < arr.length - 1) return idx++;
    return idx;
}

export function prevIdx(arr, idx) {
    if (idx > 0) return idx--;
    return idx;
}

export function next(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == arr.length - 1) throw new Error('Item is at end of array. Cannot get next item.');
    return arr[idx + 1];
}

export function prev(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == 0) throw new Error('Item is at start of array. Cannot get previous item.');
    return arr[idx - 1];
}

export function lastIdx(arr) {
    return arr.length - 1;
}

export function debounce(fn, wait) {
    let lastCall, scheduledCall;
    return (...args) => {
        lastCall = Date.now();
        if (scheduledCall) clearTimeout(scheduledCall);
        scheduledCall = setTimeout(() => fn(...args), wait);
    }
}

import shortcuts from '@/types/shortcuts';
const typeToShortcut = mapInvert(shortcuts);
export function showType(type, shouldCapitalize=true) {
    const change = shouldCapitalize ? capitalize : decapitalize; 
    if (typeToShortcut[type]) return change(typeToShortcut[type]);
    return type;
}
