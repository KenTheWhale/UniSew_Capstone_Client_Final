import axiosClient from "../configs/APIConfig.jsx";

export const signout = async () => {
    if (localStorage.length > 0){
        localStorage.clear();
    }
    if(sessionStorage.length > 0){
        sessionStorage.clear()
    }
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