<script>
import CodeMirror from '@/components/CodeMirror.vue';
import { remove } from '@/utils.js';

class FileTab {
    constructor(paneManager, path=null, contents='') {
        this.paneManager = paneManager;
        this.path = path;
        this.contents = contents;
    }

    get name() {
        return this.path ? this.path : '*scratch*';
    }

    get component() {
        return CodeMirror;
    }

    get props() {
        return {
            value: this.contents
        }
    }

    get events() {
        return {
            input(str) { this.contents = str; },
            save() { console.log('saving'); },
            open() { console.log('opening'); },
        }
    }
}

export default {
    data() {
        return {
            panes: [{ tabs: [new FileTab(this)], selected: 0 }],
        };
    },
    methods: {
        remove,
        newPane(tabs) {
            if (!tabs) {
                tabs = [new FileTab(this)];
            }
            this.panes.push({ tabs, selected: 0 });
        },
        newTab(pane) {
            pane.tabs.push(new FileTab(this));
        },
        selectedTab(pane) {
            return pane.tabs[pane.selected];
        }
    }
}
</script>



<template>
    <div class="flex">
        <div class="w-full" v-for="pane in panes">
            <div class="tabs">
                <span v-for="(tab, idx) in pane.tabs"
                    class="border-2 border-gray-400"
                    @click="pane.selected = idx"
                >{{ tab.name }}</span>
            </div>
            <component :is="selectedTab(pane).component"
                v-bind="selectedTab(pane).props"
                v-on="selectedTab(pane).events"
                @new-pane="newPane"
                @kill-pane="remove(panes, pane)"
                @new-tab="newTab(pane)"
                @kill-tab="remove(pane.tabs, selectedTab(pane))"
            />
        </div>
    </div>
</template>