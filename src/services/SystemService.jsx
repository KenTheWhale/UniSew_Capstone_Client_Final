import axiosClient from "../configs/APIConfig.jsx";

export const getAllConfig = async () => {
    const response = await axiosClient.get("/system/config")
    return response || null
}

export const updateConfig = async (data) => {
    const response = await axiosClient.put("/system/config", data)
    return response || null
}