import { path, docify, db } from './FirebaseShared.js';
import { mapWithKeys } from '@/utils.js';
import SM2Memento from '@/SM2Memento.js';

export default class FirebaseDojoRepo {
    constructor(user=null) {
        this.user = user;
    }

    userId() {
        return this.user ? this.user.uid : null;
    }

    all() {
        return path('dojos').get().then(docify);
    }

    byId(id) {
        return path(`dojos/${id}`).get().then(docify);
    }

    async shortcuts(id) {
        const shortcuts = await path(`dojos/${id}/shortcuts`).get().then(docify);
        if (!this.userId()) return shortcuts;
        
        const mementos = await this.mementoPath(id).get().then(docify);
        const byShortcut = mapWithKeys(mementos, memento => [memento.shortcutId, memento]);
        return shortcuts.map(shortcut => {
            const memento = byShortcut[shortcut.id]
            if (memento) {
                shortcut.memento = new SM2Memento(memento);
            }
            return shortcut;
        });
    }

    mementoPath(id) {
        return path(`dojos/${id}/users/${this.userId()}/mementos`);
    }

    updateShortcuts(id, shortcuts) {
        const batch = db.batch();
        shortcuts.forEach(shortcut => {
            const data = {...shortcut};
            delete data.memento;

            const basePath = path(`dojos/${id}/shortcuts`);

            if (shortcut.shouldDelete)
                batch.delete(basePath.doc(shortcut.id));
            else if (shortcut.id)
                batch.update(basePath.doc(shortcut.id), data);
            else
                batch.set(basePath.doc(), data);
        });
        return batch.commit();
    }

    updateMementos(id, shortcuts) {
        const batch = db.batch();
        shortcuts.forEach(({ memento }) => {
            const basePath = this.mementoPath(id);
            if (memento.id)
                batch.update(basePath.doc(memento.id), memento.toPlainObject());
            else
                batch.set(basePath.doc(), memento.toPlainObject());
        });
        return batch.commit();
    }
}