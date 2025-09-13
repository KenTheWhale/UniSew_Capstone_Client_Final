
// Fabric price constraints
export const FABRIC_PRICE_MIN = 1000;
export const FABRIC_PRICE_MAX = 10000000;
export const FABRIC_PRICE_STEP = 1000;

export const serviceFee = (amount) => {
    if (amount <= 10000000) {
        return 0.02 * amount
    } else {
        return 200000;
    }
}