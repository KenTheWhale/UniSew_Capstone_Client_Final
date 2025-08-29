import axiosClient from "../configs/APIConfig.jsx";

export const signout = async () => {
    const response = await axiosClient.post("/account/logout");
    return response || null
}

export const updateSchoolInfo = async (schoolData) => {
    const response = await axiosClient.put("/account/data/customer", schoolData);
    return response || null;
}

export const getSchoolProfile = async () => {
    const response = await axiosClient.post("/account/profile/school")
    return response || null;
}

export const getPartnerProfile = async () => {
    const response = await axiosClient.post("/account/profile/partner")
    return response || null;
}

export const getAccountList = async () => {
    const response = await axiosClient.get("/account/list")
    return response || null;
}

export const changeAccountStatus = async (data) => {
    const response = await axiosClient.put("/account/status", data)
    return response || null;
}

export const getAccess = async () => {
    const response = await axiosClient.post("/account/access")
    return response || null;
}

export const checkSchoolInitData = async (schoolName, taxCode, phone, address, step) => {
    const response = await axiosClient.post("/account/school/first/profile", {
        step: step,
        schoolName: schoolName,
        taxCode: taxCode,
        phone: phone,
        address: address
    })
    return response || null;
}