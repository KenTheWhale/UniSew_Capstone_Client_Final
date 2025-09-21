import axiosClient from "../configs/APIConfig.jsx";
import axios from "axios";

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

export const updateSchoolProfile = async (data) => {
    const response = await axiosClient.put("/account/data/customer", data)
    return response || null;
}

export const updatePartnerProfile = async (data) => {
    const response = await axiosClient.put("/account/partner/profile", data)
    return response || null;
}

export const getPartnerProfileForQuotation = async (partnerId) => {
    const response = await axiosClient.post("/account/partner/profile", {
        partnerId: partnerId
    })
    return response || null;
}

export const getWithdrawRequests = async () => {
    const response = await axiosClient.post("/account/withdraw/my-list")
    return response || null;
}

export const createWithdrawRequest = async (data) => {
    const response = await axiosClient.post("/account/withdraw", data)
    return response || null;
}

export const getAllWithdrawRequest = async () => {
    const response = await axiosClient.get("/account/withdraw/all-list")
    return response || null;
}

export const getAllBanks = async () => {
    const response = await axios.get("https://api.vietqr.io/v2/banks")
    return response || null;
}

export const createQR = async (data) => {
    const response = await axios.post("https://api.vietqr.io/v2/generate", data,
        {
            headers: {
                "x-client-id": '8d53c315-01c4-4439-a547-35cd7c173449',
                "x-api-key": '989fe7f4-9826-415b-89b1-29280d143ba6',
                'Content-Type': 'application/json'
            }
        })
    return response || null;
}

export const updateWithdrawRequestStatus = async (data) => {
    const response = await axiosClient.put("/account/withdraw/decision", data)
    return response || null;
}