export default {
    read(path) {
        return emit('read', path);
    },
    write(path, str) {
        return emit('write', [path, str]);
    },
    // eventually this needs to be made live, not just on request
    vueFilesIn(path) {
        return emit('vueFilesIn', path);
    }
}
