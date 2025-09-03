

export const serviceFee = (amount) => {
    if (amount <= 10000000) {
        return 0.02 * amount
    } else {
        return 200000;
    }
}