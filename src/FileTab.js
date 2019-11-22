import CodeMirror from '@/components/CodeMirror.vue';
import fs from '@/fs-client.js';

export default class FileTab {
    // I tried removing content from the constructor
    // because it made sense to read the file directly,
    // but that manes that we have a promise in the constructor,
    // so this.content won't be ready for a while, which causes problems
    constructor(paneManager, path=null, content='') {
        this.paneManager = paneManager;
        this.path = path;
        this.content = content;
    }

    get name() {
        return this.path ? this.path : '*scratch*';
    }

    // should we get back a live reference to the rendered component?
    // I need UI for save/open and it doesn't belong here
    // I've solved the open problem
    // but save is more complex: 
    get component() {
        return CodeMirror;
    }

    get props() {
        return {
            value: this.content,
            path: this.path,
        };
    }

    get events() {
        return {
            input: (str) => this.content = str,
            save: (path) => this.save(path),
            open: (path) => this.open(path),
            'focus-ast': () => this.paneManager.$emit('focus-ast'),
        }
    }

    save(path) {
        if (!this.path) this.path = path;
        fs.write(this.path, this.content);
    }

    async open(path) {
        const content = await fs.read(path);
        // if we're in an empty scratch buffer, replace instead of opening a new tab
        if (!this.path && this.content == '') {
            this.path = path;
            this.content = content;
            this.paneManager.focus(this.paneManager.paneContaining(this));
            return;
        }

        this.paneManager.newTab(
            this.paneManager.paneContaining(this),
            new this.__proto__.constructor(this.paneManager, path, content)
        );
    }
}