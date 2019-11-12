export default {
    read(path) {
        return emit('read', path);
    },
    write(path, str) {
        return emit('write', [path, str]);
    },
}
