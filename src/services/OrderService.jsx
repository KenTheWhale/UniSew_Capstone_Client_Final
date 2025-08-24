
import axiosClient from '../configs/APIConfig.jsx';

export const getSizes = async () => {
    const response = await axiosClient.get("/order/sizes")
    return response || null
}

export const getOrdersBySchool = async () => {
    const response = await axiosClient.post("/order/list")
    return response || null
}

export const getOrderDetailBySchool = async (orderId) => {
    const response = await axiosClient.post(`/order/school/detail?orderId=${orderId}`)
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

export const getGarmentOrders = async () => {
    const response = await axiosClient.post("/order/garment")
    return response || null
}

export const createQuotation = async (data) => {
    const response = await axiosClient.post("/order/quotation", data)
    return response || null
}

export const viewQuotation = async (orderId) => {
    const response = await axiosClient.get(`/order/quotation?orderId=${orderId}`)
    return response || null
}

export const approveQuotation = async (data) => {
    const response = await axiosClient.post(`/order/quotation/approval`, data)
    return response || null
}

export const createPhase = async (data) => {
    const response = await axiosClient.post(`/order/phase/create`, data)
    return response || null
}

export const viewPhase = async () => {
    const response = await axiosClient.post(`/order/phase`)
    return response || null
}

export const assignMilestone = async (data) => {
    const response = await axiosClient.post(`/order/milestone`, data)
    return response || null
}

export const updateMilestoneStatus = async (data) => {
    const response = await axiosClient.put(`/order/milestone`, data)
    return response || null
}

export const viewMilestone = async (orderId) => {
    const response = await axiosClient.get(`/order/milestone?orderId=${orderId}`)
    return response || null
}


