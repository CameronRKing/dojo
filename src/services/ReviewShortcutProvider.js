import ShortcutProvider from './ShortcutProvider';
import { randItem, remove } from '@/utils';
// memento-related logic should be dependency-injected, not imported
// but right now I don't know where the source of the injection will be, so I'm ignoring it
import { calcQ } from '@/ShortcutSM2';

function removeIfContains(arr, item) {
    if (arr.includes(item)) remove(arr, item);
}

function pushIfDoesntContain(arr, item) {
    if (!arr.includes(item)) arr.push(item);
}

export default class ReviewShortcutProvider extends ShortcutProvider {
    constructor(shortcuts) {
        super(shortcuts);
        this.unreviewed = shortcuts.slice();
        this.belowStandard = [];
        this.completed = [];
        this.itemStart = null;
    }

    hasMore() {
        return this.completed.length !== this.shortcuts.length;
    }

    getNext() {
        this.itemStart = Date.now();
        if (this.unreviewed.length) return randItem(this.unreviewed);
        return randItem(this.belowStandard);
    }

    success(shortcut) {
        const timePassed = Date.now() - this.itemStart;
        const qualityRating = calcQ(shortcut.memento.th, timePassed);

        removeIfContains(this.unreviewed, shortcut);
        if (qualityRating < 4) {
            pushIfDoesntContain(this.belowStandard, shortcut);
        } else {
            removeIfContains(this.belowStandard, shortcut);
            this.completed.push(shortcut);
        }
    }

    failure(shortcut) {
        removeIfContains(this.unreviewed, shortcut);
        pushIfDoesntContain(this.belowStandard, shortcut);
    }

    get progress() {
        return this.completed.length / this.shortcuts.length;
    }
}