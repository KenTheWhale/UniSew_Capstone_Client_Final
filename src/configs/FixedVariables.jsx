export const designerFindingWithin = 5

export const designerMaxQuotation = 5

export const appealDeadline = 2

export const disburseDuration = 7

export const serviceFee = (amount) => {
    if (amount <= 10000000) {
        return 0.02 * amount
    } else {
        return 200000;
    }
}