import CodeMirror from '@/components/CodeMirror.vue';
import CM from 'codemirror';
import fs from '@/fs-client.js';
import VueComponent from '@/VueComponent.js';

// The AST should exist right here, next to the file contents.
// Clients who need to consume one or the other can ask for it
// BasicPanes can expose which FileTabs are currently active (visible, focused)


export default class FileTab {
    // I tried removing content from the constructor
    // because it made sense to read the file directly,
    // but that manes that we have a promise in the constructor,
    // so this.content won't be ready for a while, which causes problems
    constructor(paneManager, path=null, content='') {
        this.paneManager = paneManager;
        this.path = path;
        this.doc = CM.Doc(content);
        this.lastSaved = content;
        // getting the AST should be handled by some other module
        if (path && path.endsWith('.vue'))
            this.ast = new VueComponent(content);
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
            doc: this.doc,
            path: this.path,
        };
    }

    set content(val) {
        this.doc.setValue(val);
    }

    get content() {
        return this.doc.getValue();
    }

    get events() {
        return {
            save: (path) => this.save(path),
            open: (path) => this.open(path),
            'focus-ast': () => this.paneManager.$emit('focus-ast'),
            'wrap-in-spy': (pos) => {
                this.ast.wrapInSpy(pos);
                this.content = this.ast.toString();
            },
            'import-component': (path) => {
                this.ast.importComponent(path);
                this.content = this.ast.toString();
            },
            change: (args) => { console.warn('NEED TO REWRITE LOGIC FOR SYNCING AST'); },
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