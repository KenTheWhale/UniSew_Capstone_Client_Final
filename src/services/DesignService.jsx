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

export const getDesignRequests = async () => {
    const response = await axiosClient.get("/design/pending/request")
    return response || null
}

export const createPackage = async (data) => {
    const response = await axiosClient.post("/design/package", data)
    return response || null
}

export const getPackages = async () => {
    const response = await axiosClient.post("/design/package/list")
    return response || null
}

export const updatePackageStatus = async (data) => {
    const response = await axiosClient.put("/design/packages/status", data)
    return response || null
}

export const createRequestReceipt = async (data) => {
    const response = await axiosClient.post("/design/receipt/package/", data)
    return response || null
}

export const getRequestReceipt = async (data) => {
    const response = await axiosClient.post("/design/list/receipt", data)
    return response || null
}

export const pickPackage = async (data) => {
    const response = await axiosClient.post("/design/pick-packages", data)
    return response || null
}