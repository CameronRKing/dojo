export function calcQ(th, time) {
    if (time <= th * 1.2) return 5;
    if (time <= th * 2) return 4;
    return 3;
}

export function calcEF(oldEf, q) {
    const iq = 5 - q; // inverse q; a term that appears twice
    const ef = oldEf + (0.1 - iq * (0.08 + iq * 0.02));
    if (ef > 2.5) return 2.5;
    if (ef < 1.3) return 1.3;
    return ef;
}

export function calcInterval(oldInterval, ef) {
    if (oldInterval == 1) return 6;
    return Math.ceil(oldInterval * ef);
}

export function calcTH(oldTh, time) {
    // the * 100, floo, / 100 is to set the accuracy to 0.001
    return Math.floor((oldTh * 0.8 + time * 0.2) * 100) / 100;
}

export function calcMemento(oldMemento, time) {
    const q = calcQ(oldMemento.th, time);
    const th = calcTH(oldMemento.th, time);
    const ef = calcEF(oldMemento.ef, q);
    const i = calcInterval(oldMemento.i, ef);
    return { i, ef, th };
}