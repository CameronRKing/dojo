<script>
import DojoLearn from '@/components/dojo/Learn';
import DojoTrain from '@/components/dojo/Train';
import ShortcutEditor from '@/components/ShortcutEditor.vue';
import KeyValue from '@/components/KeyValue.vue';
import PromptSignup from '@/components/PromptSignup.vue';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/record/mousetrap-record';

export default {
    components: {
        KeyValue,
        ShortcutEditor,
        DojoLearn,
        DojoTrain,
        PromptSignup
    },
    data() {
        return {
            shortcuts: [],
            toLearn: null,
            toTrain: null,
            cheatsheet: null,
            editing: false,
        };
    },
    async created() {
        this.shortcuts = await this.dojoRepo.shortcuts(this.dojoId);
        if (!this.dojo) {
            this.$store.commit('setDojo', await this.dojoRepo.byId(this.dojoId));
        }
    },
    computed: {
        byTag() {
            return this.shortcuts.reduce((acc, shortcut) => {
                shortcut.tags.forEach(tag => {
                    if (!acc[tag]) acc[tag] = [];
                    acc[tag].push(shortcut);
                });
                return acc;
            }, {});
        },
        user() {
            return this.$store.state.user;
        },
        dojo() {
            return this.$store.state.dojo;
        },
        dojoId() {
            return this.$route.params.id;
        },
        dojoName() {
            return this.dojo ? this.dojo.name : '';
        },
        dojoRepo() {
            return this.$store.state.dojoRepo;
        }
    },
    methods: {
        learn(tag, shortcuts) {
            this.toLearn = shortcuts;
        },
        train(tag, shortcuts) {
            this.toTrain = shortcuts;
        },
        showCheatsheet(shortcuts) {
            this.cheatsheet = shortcuts;
        },
        finishLearning() {
            if (!this.$store.state.user) {
                this.$refs.promptSignup.open();
                return;
            }
            this.saveMementosFromLearning();
        },
        async saveMementosFromLearning() {
            await this.dojoRepo.updateMementos(this.dojoId, this.toLearn);
            this.toLearn = null;
        },
        async finishEditing() {
            await this.dojoRepo.updateShortcuts(this.dojoId, this.shortcuts);
            this.shortcuts = this.shortcuts.filter(item => !item.shouldDelete);
            this.editing = false;
        }
    }
};
</script>

<template>
<div v-if="dojo">
    <h2>{{ dojoName }}</h2>
    <div
        v-if="!toTrain"
        class="flex flex-col items-center justify-center"
    >
        <button @click="showCheatsheet(shortcuts)">Master cheatsheet</button>
        <button v-if="user && dojo.owners.includes(user.uid)" @click="editing = true">Edit master list</button>
        <div
            v-for="(shortcuts, tag) in byTag"
            :key="tag"
            class="flex flex-col items-start justify-start mt-4"
        >
            <div class="capitalize text-xl">{{ tag }}</div>
            <div class="uppercase text-sm tracking-wider font-bold">{{ shortcuts.length }} shortcuts</div>
            <button @click="showCheatsheet(shortcuts)">Cheatsheet</button>
            <button v-if="shortcuts.some(s => !s.memento)"
                @click="learn(tag, shortcuts)">Learn</button>
            <button v-else @click="train(tag, shortcuts)">Train</button>
        </div>
    </div>

    <!-- should probably turn this into a modal at some point -->
    <div v-if="cheatsheet">
        <KeyValue
            align="left"
            value-style="font-bold action"
            :items="cheatsheet.map(({ prompt, action }) => [prompt, action])"
        />
        <button @click="cheatsheet = null">Close</button>
    </div>
    
    <DojoLearn
        v-if="toLearn"
        :to-train="toLearn"
        @done="finishLearning"
    />

    <DojoTrain
        v-if="toTrain"
        :to-train="toTrain"
        @done="toTrain = null"
    />

    <PromptSignup ref="promptSignup" @signed-in="saveMementosFromLearning" />

    <ShortcutEditor
        v-if="editing"
        :shortcuts="shortcuts"
        @done="finishEditing"
    />
</div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;
</style>