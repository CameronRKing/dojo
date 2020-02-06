import ShortcutProvider from './ShortcutProvider';
import { randItem } from '@/utils';

/**
 * When a shortcut is passed, it is marked as 'completed'
 * The next shortcut is drawn from the not-yet-completed pool
 * When all shortcuts have been completed, we increment the round counter and reset the pool
 */
export default class TrainShortcutProvider extends ShortcutProvider {
    constructor(shortcuts) {
        super(shortcuts);
        this.completed = [];
        this.currRound = 1;
        this.misses = 0;
        this.attempts = 0;
    }

    get progress() {
        return this.completed.length / this.shortcuts.length;
    }

    getNext() {
        if (this.completed.length == this.shortcuts.length) {
            this.completed.splice(0, this.completed.length);
            this.currRound++;
        }

        const notYetCompleted = this.shortcuts.filter(item => !this.completed.includes(item));
        return randItem(notYetCompleted);
    }

    success(shortcut) {
        this.attempts++;
        this.completed.push(shortcut);
    }

    failure(shortcut) {
        this.attempts++;
        this.misses++;
    }

    done() {}

    accuracy() {
        return Math.floor((this.attempts - this.misses) / this.attempts * 100) + '%';
    }
}