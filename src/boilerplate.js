export const vue = `<script>
export default {
    path: __filename
}
</script>

<template>
<div>Change me!</div>
</template>`;

export const mochaTestVue = (srcPath) => {
    const cmpName = srcPath.split('/').slice(-1)[0].split('.')[0];
    return `import { expect } from 'chai';
import { mount, shallowMount } from '@/../tests/unit/test-utils.js';
import ${cmpName} from '${srcPath.replace('src', '@')}';

describe('${cmpName}', () => {

});`
};