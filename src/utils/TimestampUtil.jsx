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

export const formatDateTimeSecond = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}