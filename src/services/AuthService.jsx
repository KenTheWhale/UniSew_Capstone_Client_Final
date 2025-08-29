import axiosClient from "../configs/APIConfig.jsx";

export const refreshToken = async () => {
    const response = await axiosClient.post("/auth/refresh");
    return response || null
}

export const signin = async (email, name, avatar) => {
    const response = await axiosClient.post("/auth/login", {
            email: email,
            name: name,
            avatar: avatar
        }
    );
    return response || null
}

export const encryptPartnerData = async (data) => {
    const response = await axiosClient.post("/auth/partner/data/encrypt", data)
    return response || null
}

export const createPartnerRequest = async (data) => {
    const response = await axiosClient.post("/auth/partner/register", data)
    return response || null
}

export const getNumberAccount = async () => {
    const response = await axiosClient.get("/auth/number")
    return response || null;
}

export const validatePartnerInfo = async (email, phone) => {
    const response = await axiosClient.get(`/auth/partner/info?email=${email}&phone=${phone}`)
    return response || null;
}

export const validatePartnerTaxCode = async (taxCode) => {
    const response = await axiosClient.get(`/auth/partner/tax?taxCode=${taxCode}`)
    return response || null;
}

export const updatePartnerStoreID = async (storeId, pid) => {
    const response = await axiosClient.get(`/auth/partner/suid?suid=${storeId}&pid=${pid}`)
    return response || null;
}

