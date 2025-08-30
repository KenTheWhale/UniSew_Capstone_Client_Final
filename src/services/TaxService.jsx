import axios from "axios";

export const getTaxInfo = async (taxCode) => {
    const response = await axios.get(`https://api.vietqr.io/v2/business/${taxCode}`);
    return response.data || null;
}