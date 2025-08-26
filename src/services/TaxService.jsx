import axios from "axios";

export const checkTaxCode = async (taxCode) => {
        const response = await axios.get(`https:
        return response.data || null;
}