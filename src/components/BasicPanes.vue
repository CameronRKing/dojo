<script>
import { remove, first, last, next, prev, lastIdx } from '@/utils.js';

export default {
    props: ['TabType'],
    data() {
        return {
            panes: [],
            selectedPane: null,
        };
    },
    created() {
        this.newPane();
    },
    methods: {
        moveTabRight() {
            const pane = this.selectedPane;
            const tab = this.selectedTab(pane);

            const tabIdx = pane.tabs.indexOf(tab);
            const paneIdx = this.panes.indexOf(pane);

            // if we're trying to move the last tab, move it to the next pane
            if (tabIdx == lastIdx(pane.tabs)) {
                // unless there is no next pane
                if (paneIdx == lastIdx(this.panes)) return;

                if (pane.selected > 0) pane.selected--;
                pane.tabs.splice(tabIdx, 1);
                if (pane.tabs.length == 0) pane.tabs.push(new this.TabType(this));
                const newPane = this.panes[paneIdx + 1];
                newPane.tabs.unshift(tab);
                newPane.selected = 0;
                this.focus(newPane);
                return;
            }

            pane.tabs.splice(tabIdx, 1);
            pane.tabs.splice(tabIdx + 1, 0, tab);
            pane.selected++;
            this.focus(pane);
        },
        moveTabLeft() {
            const pane = this.selectedPane;
            const tab = this.selectedTab(pane);

            const tabIdx = pane.tabs.indexOf(tab);
            const paneIdx = this.panes.indexOf(pane);

            // if we're trying to move the last tab, move it to the next pane
            if (tabIdx == 0) {
                // unless there is no next pane
                if (paneIdx == 0) return;

                if (pane.tabs.length == 1) pane.tabs.push(new this.TabType(this));
                pane.tabs.splice(tabIdx, 1);
                const newPane = this.panes[paneIdx - 1];
                newPane.tabs.push(tab);
                newPane.selected = lastIdx(newPane.tabs);
                this.focus(newPane);
                return;
            }

            pane.tabs.splice(tabIdx, 1);
            pane.tabs.splice(tabIdx - 1, 0, tab);
            pane.selected--;
            this.focus(pane);
        },
        newPane(tabs) {
            if (!tabs) {
                tabs = [new this.TabType(this)];
            }
            const newPane = { tabs, selected: 0 };
            this.panes.push(newPane);
            this.focus(newPane);
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
            this.focus(pane);
        },
        killTab(pane, tab) {
            if (pane.selected > 0) pane.selected--;
            // if we're killing the last tab, reboot with the default
            if (pane.tabs.length == 1) {
                pane.tabs.push(new this.TabType(this));
            }
            remove(pane.tabs, tab);
            this.focus(pane);
        },
        selectedTab(pane) {
            return pane.tabs[pane.selected];
        },
        // the focusing method is super convoluted,
        // so if you see a better solution,
        // please, take the time to fix it
        focus(pane) {
            this.selectedPane = pane;
            this.$nextTick(() => {
                const ref = `selected${this.panes.indexOf(pane)}`;
                this.$refs[ref][0].focus();
            });
        },
        selectPaneRight() {
            const idx = this.panes.indexOf(this.selectedPane);
            if (idx == lastIdx(this.panes)) return;
            this.selectedPane = this.panes[idx + 1];
            this.focus(this.selectedPane);
        },
        selectPaneLeft() {
            const idx = this.panes.indexOf(this.selectedPane);
            if (idx == 0) return;
            this.selectedPane = this.panes[idx - 1];
            this.focus(this.selectedPane);
        },
        selectTabRight() {
            const pane = this.selectedPane;
            const tab = this.selectedTab(pane);
            if (tab == last(pane.tabs)) {
                if (pane == last(this.panes)) return;

                const nextPane = next(this.panes, pane);
                nextPane.selected = 0;
                this.focus(nextPane);
                return;
            }

            pane.selected++;
            this.focus(pane);
        },
        selectTabLeft() {
            const pane = this.selectedPane;
            const tab = this.selectedTab(pane);
            if (tab == first(pane.tabs)) {
                if (pane == first(this.panes)) return;

                const nextPane = prev(this.panes, pane);
                nextPane.selected = lastIdx(nextPane.tabs);
                this.focus(nextPane);
                return;
            }

            pane.selected--;
            this.focus(pane);
        }
    }
}
</script>



<template>
    <div class="flex">
        <div class="w-full" v-for="(pane, paneIdx) in panes" @click="focus(pane)">
            <div class="tabs flex bg-gray-400">
                <span v-for="(tab, idx) in pane.tabs"
                    class="bg-gray-800 px-1 text-white"
                    :class="{'bg-codemirror-dark': pane.selected == idx }"
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
                @move-tab-right="moveTabRight"
                @move-tab-left="moveTabLeft"
                @select-tab-right="selectTabRight"
                @select-tab-left="selectTabLeft"
                @select-pane-right="selectPaneRight"
                @select-pane-left="selectPaneLeft"
                @focus="selectedPane = pane"
            />
        </div>
    </div>
</template>