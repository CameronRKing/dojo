<script>
import KeyValue from '@/components/KeyValue.vue';
import DojoBase from './Base';
import TrainShortcutProvider from '@/services/TrainShortcutProvider';

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
                this.shortcutProvider = new TrainShortcutProvider(newVal);
            },
            immediate: true
        }
    },
};
</script>



<template>
<DojoBase
    v-if="shortcutProvider"
    :shortcut-provider="shortcutProvider"
    @done="$emit('done')"
>
    <template slot="progress">
        <div class="flex justify-between w-full">
            <div>{{ shortcutProvider.completed.length }}/{{ toTrain.length }}</div>
            <div>Round: {{ shortcutProvider.currRound }}</div>
        </div>
    </template>

    <template slot="session-recap">
        <KeyValue
            align="between"
            value-style="font-bold"
            :items="[
                'Shortcuts trained', toTrain.length,
                'Rounds', shortcutProvider.currRound - 1,
                'Total attempts', shortcutProvider.attempts,
                'Accuracy', shortcutProvider.accuracy(),
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