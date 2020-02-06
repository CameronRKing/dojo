<script>
import KeyValue from '@/components/KeyValue.vue';
import DojoBase from './Base';
import LearnShortcutProvider from '@/services/LearnShortcutProvider';

export default {
    components: {
        DojoBase,
        KeyValue
    },
    props: ['toTrain'],
    data() {
        return {
            shortcutProvider: null
        };
    },
    watch: {
        toTrain: {
            handler(newVal, oldVal) {
                if (!newVal) return;
                this.shortcutProvider = new LearnShortcutProvider(newVal);
            },
            immediate: true
        }
    }
};
</script>



<template>
<DojoBase
    v-if="shortcutProvider"
    :shortcut-provider="shortcutProvider"
    @done="$emit('done')"
>
    <template slot="session-recap">
        <KeyValue
            align="between"
            value-style="font-bold"
            :items="[
                'Shortcuts learned', toTrain.length,
                'Time taken', shortcutProvider.timePassed()
            ]"
        />
    </template>
</DojoBase>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;
</style>