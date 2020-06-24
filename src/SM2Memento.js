import { avg } from '@/utils';

// see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
// the only modification is calculating q from an adaptive response time instead of user self-rating
function setAccuracy(num, accuracy) {
    const multiplier = 1 / accuracy;
    return Math.floor(num * multiplier) / multiplier;
}

export function calcQ(th, time) {
    if (time <= th * 1.2) return 5;
    if (time <= th * 2) return 4;
    return 3;
}

export function calcEF(oldEf, q) {
    const ef = oldEf - 0.8 + 0.28 * q - 0.02 * q * q;
    if (ef > 2.5) return 2.5;
    if (ef < 1.3) return 1.3;
    return ef;
}

export function calcInterval(oldInterval, ef) {
    if (oldInterval < 1) return 1;
    if (oldInterval == 1) return 6;
    return Math.ceil(oldInterval * ef);
}

export function calcTH(oldTh, time) {
    return setAccuracy(oldTh * 0.8 + time * 0.2, 0.001);
}

export function calcMemento(oldMemento, time) {
    const q = calcQ(oldMemento.th, time);
    const th = calcTH(oldMemento.th, time);
    const ef = calcEF(oldMemento.ef, q);
    const i = calcInterval(oldMemento.i, ef);
    return { i, ef, th };
}

export default class SM2Memento {
    constructor({ id, shortcutId, th, ef, i, nextTrainingDate }) {
        this.id = id;
        this.shortcutId = shortcutId;
        this.th = th;
        this.ef = ef;
        this.i = i;
        this.nextTrainingDate = nextTrainingDate;
    }

    static initialize(times, shortcutId) {
        const today = new Date();
        const tomorrow = today.setDate(today.getDate() + 1);

        return new SM2Memento({
            shortcutId,
            i: 1,
            ef: 2.5,
            th: avg(times),
            nextTrainingDate: tomorrow,
        });
    }

    repMeetsStandard(time) {
        return calcQ(this.th, time) >= 4;
    }

    updateAfterPass(time) {
        this.th = calcTH(this.th, time);
        this.ef = calcEF(this.ef, calcQ(this.th, time));
    }

    updateAfterFail() {
        // on failure, treat the item as though it hasn't been learned yet by resetting the interval
        this.i = 0;
    }

    updateAfterSession() {
        this.i = calcInterval(this.i, this.ef);
        const today = new Date();
        this.nextTrainingDate = today.setDate(today.getDate() + this.i);
    }

    toPlainObject() {
        const { shortcutId, i, ef, th, nextTrainingDate } = this;
        return { shortcutId, i, ef, th, nextTrainingDate };
    }
}