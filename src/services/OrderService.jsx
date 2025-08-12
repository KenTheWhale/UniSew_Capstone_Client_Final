
import axiosClient from '../configs/APIConfig.jsx';

export const getSizes = async () => {
    const response = await axiosClient.get("/order/sizes")
    return response || null
}

export const getOrdersBySchool = async () => {
    const response = await axiosClient.post("/order/list")
    return response || null
}

export const createOrder = async (orderData) => {
    const response = await axiosClient.post("/order", orderData)
    return response || null
}

export const cancelOrder = async (orderId) => {
    const response = await axiosClient.put(`/order/cancellation?orderId=${orderId}`)
    return response || null
}

export const getOrdersByGarment = async () => {
    const response = await axiosClient.get("/order")
    return response || null
}