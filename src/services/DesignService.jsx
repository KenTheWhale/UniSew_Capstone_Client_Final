import axiosClient from "../configs/APIConfig.jsx";

export const getFabrics = async () => {
    const response = await axiosClient.get("/design/fabrics")
    return response || null
}

export const createDesignRequest = async (data) => {
    const response = await axiosClient.post("/design/request", data);
    return response || null
}

export const getSchoolDesignRequests = async () => {
    const response = await axiosClient.post("/design/school/request")
    return response || null
}

export const getDesignRequestDetailForSchool = async (requestId) => {
    const response = await axiosClient.get(`/design/school/request/detail?id=${requestId}`)
    return response || null
}

export const getAppliedDesignerDesignRequests = async () => {
    const response = await axiosClient.post("/design/designer/request")
    return response || null
}

export const getDesignRequestDetailForDesigner = async (requestId) => {
    const response = await axiosClient.get(`/design/designer/request/detail?id=${requestId}`)
    return response || null
}


export const getDesignRequests = async () => {
    const response = await axiosClient.get("/design/pending/request")
    return response || null
}

export const createDesignQuotation = async (data) => {
    const response = await axiosClient.post("/design/quotation", data)
    return response || null
}

export const pickQuotation = async (data) => {
    const response = await axiosClient.post("/design/pick/quotation", data)
    return response || null
}

export const getDesignDeliveries = async (designRequestId) => {
    const response = await axiosClient.post("/design/deliveries", {
        designRequestId: designRequestId
    })
    return response || null
}

export const createDesignDelivery = async (data) => {
    const response = await axiosClient.post("/design/delivery", data)
    return response || null
}

export const createRevisionRequest = async (data) => {
    const response = await axiosClient.post("/design/revision", data)
    return response || null
}

export const getUndoneRevisionRequests = async (data) => {
    const response = await axiosClient.post("/design/revision/list", data)
    return response || null
}

export const makeDesignFinal = async (data) => {
    const response = await axiosClient.post("/design/school/request/final", data)
    return response || null
}

export const getSchoolDesign = async () => {
    const response = await axiosClient.post("/design/final/designs")
    return response || null
}

export const buyExtraRevision = async (requestId, revisionTime, receiverId, totalPrice, gatewayCode) => {
    const response = await axiosClient.put("/design/request/revision-time", {
        requestId: requestId,
        revisionTime: revisionTime,
        createTransactionRequest: {
            type: "design",
            receiverId: receiverId,
            itemId: requestId,
            totalPrice: totalPrice,
            gatewayCode: gatewayCode,
            serviceFee: 0,
            payFromWallet: false
        }
    })
    return response || null
}

export const cancelDesignRequest = async (data) => {
    const response = await axiosClient.put("/design/request/cancel", data)
    return response || null
}