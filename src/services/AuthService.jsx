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