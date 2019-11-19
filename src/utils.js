export function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}