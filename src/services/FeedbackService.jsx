import axiosClient from "../configs/APIConfig.jsx";

export const giveFeedback = async (data) => {
    const response = await axiosClient.post(`/feedback`, data)
    return response || null
}

export const getFeedbacksByDesign = async (designRequestId) => {
    const response = await axiosClient.post(`/feedback/design?designRequestId=${designRequestId}`)
    return response || null
}

export const getFeedbacksByOrder = async (orderId) => {
    const response = await axiosClient.post(`/feedback/order?orderId=${orderId}`)
    return response || null
}

export const getAllReport = async () => {
    const response = await axiosClient.get(`/feedback/report`)
    return response || null
}

export const approveReport = async (data) => {
    const response = await axiosClient.post(`/feedback/approval`, data)
    return response || null
}