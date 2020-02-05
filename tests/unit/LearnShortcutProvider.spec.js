import { expect } from 'chai';
import FakeTimers from '@sinonjs/fake-timers';
import LearnShortcutProvider from '@/services/LearnShortcutProvider';

describe('LearnShortcutProvider', () => {
    let clock, lsp, items;
    beforeEach(() => {
        items = [{ prompt: 'Test 1', action: 'a' }, { prompt: 'Test 2', action: 'b'}];
        lsp = new LearnShortcutProvider(items);
        clock = FakeTimers.install();
    });

    afterEach(() => {
        clock.uninstall();
    })
    
    const expectIsIn = (item, bucket) => expect(lsp.getCurrentBucketName(item)).to.equal(bucket);

    it('moves an item from one bucket to the next on a successful answer', () => {
        const item = items[0];
        expectIsIn(item, '0');
        lsp.success(item);
        expectIsIn(item, '5');
        lsp.success(item);
        expectIsIn(item, '25');
        lsp.success(item);
        expectIsIn(item, '120');
        lsp.success(item);
        expectIsIn(item, 'done');
        // can't move beyond 'done'
        lsp.success(item);
        expectIsIn(item, 'done');
    });

    it('moves an item back one bucket on a wrong answer', () => {
        const item = items[0];
        expectIsIn(item, '0');
        lsp.success(item);
        expectIsIn(item, '5');
        lsp.failure(item);
        expectIsIn(item, '0');
    });

    it('gets the next most overdue item, favoring earlier buckets in ties', () => {
        lsp.success(items[0]);
        expect(lsp.getNext()).to.equal(items[1]);
        clock.tick(5001);
        expect(lsp.getNext()).to.equal(items[0]);

        lsp.success(items[0]);
        clock.tick(20000);
        lsp.success(items[1]);
        clock.tick(5000);
        expect(lsp.getNext()).to.equal(items[1]);
    });

    it('calculates "most overdue" as the percentage over the expected time, not the absolute difference', () => {
        // push the first item into bucket 25, and pass some time
        lsp.success(items[0]);
        lsp.success(items[0]);
        clock.tick(23000);
        // and the second into bucket 5
        lsp.success(items[1]);
        clock.tick(6000);
        // items[1] is now a second over
        // items[0] is 3 seconds over
        // if we were going by absolutes, we'd expect items[0] to be next
        // but 3/25 < 1/5, so items[1] should be next
        expect(lsp.getNext()).to.equal(items[1]);
    });
});