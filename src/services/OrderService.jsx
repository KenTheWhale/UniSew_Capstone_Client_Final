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

export const cancelOrder = async (data) => {
    const response = await axiosClient.put(`/order/cancellation`, data)
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
    const response = await axiosClient.post(`/order/milestone/assignment`, data)
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

export const deletePhase = async (phaseId) => {
    const response = await axiosClient.delete(`/order/phase?phaseId=${phaseId}`)
    return response || null
}

export const confirmDeliveryOrder = async (orderId, receiverId, totalPrice, gatewayCode, shippingCode, shippingFee, payFromWallet) => {
    const response = await axiosClient.put("/order/status/delivery", {
        orderId: orderId,
        shippingCode: shippingCode,
        shippingFee: shippingFee,
        createTransactionRequest: {
            type: 'order',
            receiverId: receiverId,
            itemId: orderId,
            totalPrice: totalPrice,
            gatewayCode: gatewayCode,
            serviceFee: 0,
            payFromWallet: payFromWallet

        }
    })
    return response || null
}

export const confirmOrder = async (data) => {
    const response = await axiosClient.put(`/order/confirm`, data)
    return response || null
}

export const getAllOrdersForAdmin = async (params) => {
    const response = await axiosClient.get("/order/list", { params })
    return response || null
}

