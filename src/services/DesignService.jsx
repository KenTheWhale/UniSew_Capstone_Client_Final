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

export const getAppliedDesignerDesignRequests = async () => {
    const response = await axiosClient.post("/design/designer/request")
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