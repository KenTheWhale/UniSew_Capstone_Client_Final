export const prefixes = {
    dr: 'DESR',
    ord: 'ORD',
    dd: 'DESD',
    rr: 'REV',
    fb: 'FDB',
    rp: 'RPT',
    trs: 'TRS',
    ap: 'APP',
    wdr: 'WDR',
};

export const parseID = (id, type) => {

    const prefix = prefixes[type]

    if (!prefix) {
        console.error(`Prefix for type "${type}" not found.`);
        return null;
    }


    const paddedId = String(id).padStart(3, '0');

    return `${prefix}${paddedId}`;
}