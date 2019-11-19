export function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}

export function pairs(obj) {
    return Object.keys(obj).map(key => [key, obj[key]]);
}
