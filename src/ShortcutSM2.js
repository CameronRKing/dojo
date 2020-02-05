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