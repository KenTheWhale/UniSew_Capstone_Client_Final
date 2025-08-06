export const prefixes = {
    dr: 'DR',
    ord: 'ORD',
    pkg: 'PKG'
};

export const parseID = (id, type) => {

    const prefix = prefixes[type]

    if (!prefix) {
        console.error(`Prefix for type "${type}" not found.`);
        return null;
    }

    const numericId = Number(id);

    if (isNaN(numericId)) {
        console.error("Input is not a valid number.");
        return null;
    }


    const paddedId = String(numericId).padStart(3, '0');

    return `${prefix}${paddedId}`;
}