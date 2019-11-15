const vueBoilerplate = `<script>
export default {
    path: __filename,
}
</script>

<template>
<div data-palette="0"></div>
</template>`

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
    },
    createVueFile(path) {
        return emit('write', [path, vueBoilerplate]);
    }
}
