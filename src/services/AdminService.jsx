import axiosClient from "../configs/APIConfig.jsx";

export const getAccountStats = async (data) => {
    const response = await axiosClient.post("/admin/account/stats", data)
    return response || null;
}

export const getTransactionsStats = async (data) => {
    const response = await axiosClient.post("/admin/transaction/stats", data)
    return response || null;
}