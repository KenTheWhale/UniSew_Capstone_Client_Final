import axiosClient from "../configs/APIConfig.jsx";

export const getSizes = async () => {
    const response = await axiosClient.get("/order/sizes")
    return response || null
}