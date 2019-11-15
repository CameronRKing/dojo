import fs from './fs-client';
import VueComponent from './VueComponent';

// ask me why I split these functions out from the class and I couldn't tell you
// I put them in and it felt wrong, so I pulled them back out.
// I feel like they belong somewhere else that doesn't exist yet.
function isVueCmp(el) {
    return el.__vue__ !== undefined;
}

function vueCmpName(el) {
    if (!path(el)) {
        return '< Anonymous: no path option set >';
    }
    return path(el).split('\\')
        .slice(-1)[0]
        .split('.vue')[0];
}

// returns the path to the component's source file, if relevant
function path(cmp) {
    return cmp.$options.path.split('?')[0];
}

function vueParent(el) {
    let vueParent;
    let node = el;
    do {
        vueParent = node.__vue__;
        node = node.parentNode;
    } while (!vueParent && node)

    if (!vueParent) {
        throw new Error('unable to find a Vue component in the hierarchy above data-palette=' + el.getAttribute('data-palette'));
    }
    return vueParent;
}

export default class Nodelink {
    constructor(el, elList) {
        this.el = el;
        this.elList = elList;
        this.parent = vueParent(el);
        this.handlers = [];
        this.isDone = new Promise(resolve => {
            fs.read(this.path).then(str => this.ast = new VueComponent(str))
                .then(resolve);
        })
    }

    ready() {
        return this.isDone;
    }

    get path() {
        return path(this.parent);
    }

    get name() {
        if (isVueCmp(this.el)) {
            return vueCmpName(this.el);
        }
        return this.el.localName;
    }

    appendChild(tag) {
        const nextId = this.getNextDataId();
        this.findByDataId(node => {
            if (!node.content) node.content = [];
            node.content.push({ tag, attrs: { 'data-palette': nextId } });
            return node;
        });
    }

    delete() {
        this.findByDataId(() => { tag: false });
        this.save();
    }

    getNextDataId() {
        let nodes = [];
        this.ast.tree.match({ attrs: { 'data-palette': /.*/ } }, node => {
            nodes.push(node);
            return node;
        });
        const ids = nodes.map(n => Number(n.attrs['data-palette']));
        return Math.max.apply(null, ids) + 1;
    }

    addDataIds() {
        let id = this.ast.getNextDataId();
        this.ast.addAttr('data-palette', () => id++);
        this.save();
    }

    dataId() {
        return this.el.getAttribute('data-palette');
    }

    findByDataId(cb) {
        return this.ast.findByPaletteId(this.dataId(), cb);
    }

    removeDataIds() {
        this.ast.removeAttr('data-palette');
        return this.save();
    }

    on(event, handler) {
        this.handlers[event] = handler;
    }

    off(event) {
        this.handlers[event] = null;
    }

    emit(event, payload) {
        if (this.handlers[event]) {
            this.handlers[event](payload);
        }
    }

    save() {
        this.emit('save');
        return fs.write(this.path, this.ast.toString());
    }

    selectNew(el) {
        this.emit('select', el);
        const node = new this.__proto__.constructor(el);
        node.handlers = this.handlers;
        return node;
    }
}