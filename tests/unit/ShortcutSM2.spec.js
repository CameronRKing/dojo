import { expect } from 'chai'
import * as ShortcutSM2 from '@/ShortcutSM2';

describe('ShortcutSM2', () => {
	it('calculates a quality rating given a time and a threshold', () => {
		let q;
		q = ShortcutSM2.calcQ(0.2, 0.41)
		expect(q).to.equal(3)
		q = ShortcutSM2.calcQ(0.2, 0.4)
		expect(q).to.equal(4)
		q = ShortcutSM2.calcQ(0.2, 0.25)
		expect(q).to.equal(4)
		q = ShortcutSM2.calcQ(0.2, 0.24)
		expect(q).to.equal(5)
	})
	
    it('calculates updated easiness factor given the old EF and a quality rating [0,5]', () => {
		let ef = ShortcutSM2.calcEF(2.5, 5);
		expect(ef).to.equal(2.5);
		ef = ShortcutSM2.calcEF(2.5, 3);
		expect(ef).to.equal(2.36);
	})

	it('calculates a new interval given the old interval and the updated easiness factor', () => {
		let newInterval;
		newInterval = ShortcutSM2.calcInterval(1, 2.5);
		expect(newInterval).to.equal(6);
		// I(1) = 1; I(2) = 6; EF doesn't matter
		newInterval = ShortcutSM2.calcInterval(1, 1.3);
		expect(newInterval).to.equal(6);
		newInterval = ShortcutSM2.calcInterval(6, 1.5);
		expect(newInterval).to.equal(9);
	})

	it('calculates an updated time threshold given the old threshold and the last response time', () => {
		let th;
		th = ShortcutSM2.calcTH(0.2, 0.4)
		expect(th).to.equal(0.24)
		th = ShortcutSM2.calcTH(0.2, 0.3)
		expect(th).to.equal(0.22)
		th = ShortcutSM2.calcTH(0.2, 0.2)
		expect(th).to.equal(0.2)
		th = ShortcutSM2.calcTH(0.2, 0.15)
		expect(th).to.equal(0.19)
	})

	it('calculates a new memento given the old memento and the last response time', () => {
		let memento;
		memento = ShortcutSM2.calcMemento({ i: 6, ef: 1.6, th: 0.2 }, 0.3);
		expect(memento).to.deep.equal({
			i: 10,
			ef: 1.6,
			th: 0.22
		});
	})
	
})
