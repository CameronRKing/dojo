import ShortcutProvider from './ShortcutProvider';
import { mapWithKeys, remove, next, prev, pairs, assocIn } from '@/utils';

/**
 * This algorithm is a naive implementation of the first few stages of Pimsleur's graudated interval recall
 * https://en.wikipedia.org/wiki/Spaced_repetition#Pimsleur's_graduated-interval_recall
 * This implementation uses five buckets.
 * At first, all items are waiting to be learned.
 * Every time an item is answered correctly, it is moved to the next bucket.
 * Every time an item is answered incorrectly, it is moved to the previous bucket.
 * The last bucket is considered "done", and items will no longer come up in this session.
 * If multiple items are overdue, we'll work through them in order of most overdue.
 * Each bucket has a longer wait time till the items in it are supposed to be reviewed, though that wait time is not fully respected.
 * If no item is "ready" to be reviewed, we'll pull the next closest one.
 * The alternative is forced waiting, which doesn't seem like a good idea.
 * 
 * This class currently has no tests, though it probably should.
 */
export default class LearnShortcutProvider extends ShortcutProvider {
    constructor(shortcuts) {
        super(shortcuts);
        this.buckets = {
            0: shortcuts.slice(),
            5: [],
            25: [],
            120: [],
            'done': [],
        };
        this.bucketList = Object.keys(this.buckets);
        // assuming no two shortcuts can have the same prompt, which seems reasonable
        this.lastTouchedTimes = mapWithKeys(shortcuts, ({ prompt }) => [prompt, 0]);
    }

    hasMore() {
        return this.buckets.done.length != this.shortcuts.length;
    }

    getNext() {
        return this.orderByTimePastDue()[0];
    }

    success(shortcut) {
        this.move(shortcut, 'Next');
    }

    failure(shortcut) {
        this.move(shortcut, 'Prev');
    }

    orderByTimePastDue() {
        const now = Date.now();
        const itemToBucket = {};
        pairs(this.buckets).forEach(([bucket, shortcuts]) => {
            assocIn(itemToBucket, mapWithKeys(shortcuts, ({ prompt }) => [prompt, bucket]));
        });
        const secondsPassed = (item) => (now - this.getLastTouched(item)) / 1000;
        // items in the first bucket (unlearned) are never overdue
        const percentOverdue = (item, bucket) => bucket == 0 ? 1 : secondsPassed(item) / bucket
        // this implementation is okay, but I think it should prioritize items in lower buckets
        // if a 25 item and a 120 item are both 5s overdue, it matters more for the 25 item, don't you think?
        return this.bucketList.slice(0, -1) // ignore 'done' bucket
            .reduce((acc, bucket) => acc.concat(this.buckets[bucket]), [])
            .sort((l, r) => percentOverdue(r, itemToBucket[r.prompt]) > percentOverdue(l, itemToBucket[l.prompt]));
    }

    getLastTouched(shortcut) {
        return this.lastTouchedTimes[shortcut.prompt];
    }

    move(shortcut, to) {
        if (!['Next', 'Prev'].includes(to))
            throw new Exception('`to` must be one of "Next" or "Prev"; ' + to + ' received');

        const currBucket = this.getCurrentBucketName(shortcut);
        remove(this.buckets[currBucket], shortcut);
        this[`get${to}Bucket`](currBucket).push(shortcut);
        this.updateLastTouched(shortcut);
    }

    updateLastTouched(shortcut) {
        this.lastTouchedTimes[shortcut.prompt] = Date.now();
    }

    getCurrentBucketName(shortcut) {
        return pairs(this.buckets)
            .find(([bucket, shortcuts]) => shortcuts.includes(shortcut))[0];
    }

    getNextBucket(bucketName) {
        return this.buckets[next(this.bucketList, bucketName)];
    }

    getPrevBucket(bucketName) {
        return this.buckets[prev(this.bucketList, bucketName)];
    }

    get progress() {
        // each item must be passed four times (one to learn, three reviews)
        // position in a bucket indicates how many times the items have been passed
        let passes = 0;
        return this.bucketList.reduce((acc, bucketName) => {
            return acc + this.buckets[bucketName].length * passes++;
        }, 0) / (this.shortcuts.length * (this.bucketList.length - 1));
    }
}