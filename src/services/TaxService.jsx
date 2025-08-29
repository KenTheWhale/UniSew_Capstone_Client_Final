import axios from "axios";

export const checkTaxCode = async (taxCode) => {
        const response = await axios.get(`https://api.example.com/tax/${taxCode}`);
        return response.data || null;
}