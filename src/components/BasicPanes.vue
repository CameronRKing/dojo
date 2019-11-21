<script>
import { remove } from '@/utils.js';

export default {
    props: ['TabType'],
    data() {
        return {
            panes: [],
        };
    },
    created() {
        this.newPane();
    },
    methods: {
        remove,
        newPane(tabs) {
            if (!tabs) {
                tabs = [new this.TabType(this)];
            }
            this.panes.push({ tabs, selected: 0 });
        },
        killPane(pane) {
            remove(this.panes, pane);
        },
        paneContaining(tab) {
            return this.panes.find(pane => pane.tabs.includes(tab));
        },
        newTab(pane, tab) {
            if (!tab) tab = new this.TabType(this);

            pane.tabs.splice(pane.selected + 1, 0, tab);
            pane.selected++;
            this.$nextTick(() => this.focus(pane));
        },
        killTab(pane, tab) {
            if (pane.selected > 0) pane.selected--;
            remove(pane.tabs, tab);
            this.$nextTick(() => this.focus(pane))
        },
        selectedTab(pane) {
            return pane.tabs[pane.selected];
        },
        // the focusing method is super convoluted,
        // so if you see a better solution,
        // please, take the time to fix it
        focus(pane) {
            const ref = `selected${this.panes.indexOf(pane)}`;
            this.$refs[ref][0].focus();
        }
    }
}
</script>



<template>
    <div class="flex">
        <div class="w-full" v-for="(pane, paneIdx) in panes">
            <div class="tabs">
                <span v-for="(tab, idx) in pane.tabs"
                    class="border-2 border-gray-400"
                    :class="{'bg-gray-400': pane.selected == idx }"
                    @click="pane.selected = idx"
                >{{ tab.name }}</span>
            </div>
            <component :is="selectedTab(pane).component"
                :ref="`selected${paneIdx}`"
                v-bind="selectedTab(pane).props"
                v-on="selectedTab(pane).events"
                @new-pane="newPane"
                @kill-pane="killPane(pane)"
                @new-tab="newTab(pane)"
                @kill-tab="killTab(pane, selectedTab(pane))"
            />
        </div>
    </div>
</template>