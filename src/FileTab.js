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
        this.lastSaved = content;
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

    get isDirty() {
        return this.content != this.lastSaved;
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
            'import-component': (path) => this.paneManager.$emit('import-component', path, this),
            'focus-ast': () => this.paneManager.$emit('focus-ast'),
            change: (args) => this.paneManager.$emit('change', args),
        }
    }

    save(path) {
        if (!this.path) this.path = path;
        this.lastSaved = this.content;
        fs.write(this.path, this.content);
    }

    close() {
        if (this.isDirty) {
            const shouldSave = window.prompt('Save before closing? [enter anything to save]');
            if (shouldSave) {
                this.save(this.path);
            }
        }
        return true;
    }

    async open(path) {
        const content = await fs.read(path);
        const pane = this.paneManager.paneContaining(this);

        this.paneManager.newTab(
            pane,
            new this.__proto__.constructor(this.paneManager, path, content)
        );

        // if we're in an empty scratch buffer, kill it
        if (!this.path && this.content == '') {
            this.paneManager.killTab(pane, this);
        }

    }
}