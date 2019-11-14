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
        throw new Error('unable to find a Vue component in the hierarchy above ', el);
    }
    return vueParent;
}

export default class Nodelink {
    constructor(el) {
        this.el = el;
        this.parent = vueParent(this.el);
        // this.ast = null;
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

    addDataIds() {
        let id = 0;
        this.ast.addAttr('data-palette', () => id++);
        this.save();
    }

    findByDataId(cb) {
        return this.ast.findByPaletteId(this.el.getAttribute('data-palette'), cb);
    }

    removeDataIds() {
        this.ast.removeAttr('data-palette');
        this.save();
    }

    save() {
        return fs.write(this.path, this.ast.toString());
    }
}