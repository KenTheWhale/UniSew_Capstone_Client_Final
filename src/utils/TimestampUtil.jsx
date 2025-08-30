export const getShippingDaysFromTimestamp = (shippingLeadTime) => {
    if (!shippingLeadTime) return 0;
    
    if (shippingLeadTime > 1000000) {
        // This is a timestamp, calculate days from current time
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDifference = shippingLeadTime - currentTime;
        return Math.ceil(timeDifference / (24 * 60 * 60));
    } else {
        // This is already in days
        return parseInt(shippingLeadTime);
    }
}