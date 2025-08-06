import axiosClient from "../configs/APIConfig.jsx";

export const signout = async () => {
    const response = await axiosClient.post("/account/logout");
    return response || null
}

export const updateSchoolInfo = async (schoolData) => {
    const response = await axiosClient.put("/account/data/customer", schoolData);
    return response || null;
}