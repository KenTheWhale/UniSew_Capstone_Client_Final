import axiosClient from "../configs/APIConfig.jsx";

export const configKey = {
    "business": "business",
    "media": "media",
    "design": "design",
    "order": "order",
    "report": "report",
    "deposit": "deposit"
}

export const getAllConfig = async () => {
    const response = await axiosClient.get("/system/config")
    return response || null
}

export const getConfigByKey = async (key) => {
    const response = await axiosClient.get(`/system/config/key?k=${key}`)
    return response || null
}

export const updateConfig = async (data) => {
    const response = await axiosClient.put("/system/config", data)
    return response || null
}

export const getGarmentFabric = async () => {
    const response = await axiosClient.post("/system/garment/fabric")
    return response || null
}

export const updateGarmentFabric = async (data) => {
    const response = await axiosClient.put("/system/garment/fabric", data)
    return response || null
}

export const deleteGarmentFabric = async (fabricId) => {
    const response = await axiosClient.put(`/system/garment/fabric/remove?fabricId=${fabricId}`)
    return response || null
}

export const getGarmentFabricForQuotation = async (orderId) => {
    const response = await axiosClient.post(`/system/garment/fabric/quotation?orderId=${orderId}`)
    return response || null
}