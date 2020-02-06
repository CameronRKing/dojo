import { expect } from 'chai';
import FakeTimers from '@sinonjs/fake-timers';
import ReviewShortcutProvider from '@/services/ReviewShortcutProvider';
import SM2Memento from '@/SM2Memento';

describe('ReviewShortcutProvider', () => {
    let clock, rsp, items;
    beforeEach(() => {
        items = [
            { prompt: 'Test 1', action: 'a', memento: new SM2Memento({ th: 200, i: 1, ef: 2.5, nextTrainingDate: Date.now() }) },
            { prompt: 'Test 2', action: 'b', memento: new SM2Memento({ th: 200, i: 1, ef: 2.5, nextTrainingDate: Date.now() }) }
        ];
        rsp = new ReviewShortcutProvider(items);
        clock = FakeTimers.install();
    });

    afterEach(() => {
        clock.uninstall();
    });

    // these next two tests contain some knowledge about the internals of SM2Memento,
    // but it's easier than importing a whole spy library for just these two tests
    it('updates memento after a successful rep', () => {
        const oldThreshold = items[0].memento.th;

        rsp.success(items[0]);

        expect(oldThreshold).not.to.equal(items[0].memento.th);
    });

    it('updates memento after a failed rep', () => {
        const oldInterval = items[0].memento.i;

        rsp.failure(items[0]);

        expect(oldInterval).not.to.equal(items[0].memento.i);
    });

    it('keeps missed items in the review pool', () => {
        rsp.failure(items[0]);
        rsp.success(items[1]);
        expect(rsp.getNext()).to.equal(items[0]);
    });

    it('keep below standard items in the review pool', () => {
        const tooSlowItem = rsp.getNext();
        const timePassed = 500;
        expect(tooSlowItem.memento.repMeetsStandard(timePassed)).to.be.false;
        clock.tick(timePassed);
        rsp.success(tooSlowItem);
        
        const unreviewedItem = rsp.getNext();
        expect(unreviewedItem).not.to.equal(tooSlowItem);
        rsp.success(unreviewedItem);

        const finalItem = rsp.getNext();
        expect(finalItem).to.equal(tooSlowItem);
    });

    it('finishes when all items have been passed', () => {
        rsp.failure(items[0]);
        rsp.success(items[1]);
        rsp.success(items[0]);
        expect(rsp.hasMore()).to.be.false;
    });

});
