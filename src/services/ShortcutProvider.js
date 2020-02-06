import { leftPad } from '@/utils';

export default class ShortcutProvider {
    constructor(shortcuts) {
        this.shortcuts = shortcuts;
        // assuming the object is created immediately before it is used
        this.startTime = Date.now();
    }
    
    hasMore() {
        return true;
    }

    getNext() {
        throw new Exception('not implemented');
    }

    success(shortcut) {
        throw new Exception('not implemented');
    }

    failure(shortcut) {
        throw new Exception('not implemented');
    }

    timePassed() {
        const totalSeconds = Math.floor(this.secondsPassed());
        const minutes = Math.floor(totalSeconds / 60);
        return `${minutes}:${leftPad(totalSeconds % 60, 2)}`;
    }

    secondsPassed() {
        return (Date.now() - this.startTime) / 1000;
    }
}