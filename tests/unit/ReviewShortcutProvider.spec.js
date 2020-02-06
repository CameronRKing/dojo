import { expect } from 'chai';
import FakeTimers from '@sinonjs/fake-timers';
import ReviewShortcutProvider from '@/services/ReviewShortcutProvider';
import { calcQ } from '@/ShortcutSM2';

describe('ReviewShortcutProvider', () => {
    let clock, rsp, items;
    beforeEach(() => {
        // these need mementos
        items = [
            { prompt: 'Test 1', action: 'a', memento: { th: 200 } },
            { prompt: 'Test 2', action: 'b', memento: { th: 200 } }
        ];
        rsp = new ReviewShortcutProvider(items);
        clock = FakeTimers.install();
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('keeps missed items in the review pool', () => {
        rsp.failure(items[0]);
        rsp.success(items[1]);
        expect(rsp.getNext()).to.equal(items[0]);
    });

    it('keep below standard items in the review pool', () => {
        const tooSlowItem = rsp.getNext();
        const timePassed = 500;
        clock.tick(timePassed);
        expect(calcQ(tooSlowItem.memento.th, timePassed)).to.be.lt(4);
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
