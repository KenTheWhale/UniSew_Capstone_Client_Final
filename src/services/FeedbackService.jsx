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

export const getFeedbacksByDesigner = async () => {
    const response = await axiosClient.post(`/feedback/designer`)
    return response || null
}

export const getReportsByGarment = async () => {
    const response = await axiosClient.post(`/feedback/garment`)
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

export const appealReport = async (data) => {
    const response = await axiosClient.post(`/feedback/appeals`, data)
    return response || null
}

export const approveAppeal = async (data) => {
    const response = await axiosClient.post(`/feedback/appeals/approval`, data)
    return response || null
}

export const giveEvidence = async (data) => {
    const response = await axiosClient.put(`/feedback/report/evidence`, data)
    return response || null
}