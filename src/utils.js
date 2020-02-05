export function mapWithKeys(arr, cb) {
    if (!cb) cb = (args) => args;
    return arr.reduce((acc, value) => {
        const [key, val] = cb(value);
        return { ...acc, [key]: val };
    }, {});
}

export function remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == -1) return;
    arr.splice(idx, 1);
}

export function next(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == arr.length - 1) return item;
    return arr[idx + 1];
}

export function prev(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == 0) return item;
    return arr[idx - 1];
}

export function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function leftPad(num, totalWidth) {
    const str = String(num);
    if (str.length < totalWidth) {
        return '0'.repeat(totalWidth - str.length) + str;
    }
    return str;
}

export function pairs(obj) {
    return Object.keys(obj).map(key => [key, obj[key]]);
}

export function assocIn(modified, toAdd) {
    pairs(toAdd).forEach(([key, val]) => modified[key] = val);
    return modified;
}