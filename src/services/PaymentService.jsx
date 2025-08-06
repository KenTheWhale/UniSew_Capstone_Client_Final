import axiosClient from "../configs/APIConfig.jsx";

export const getPaymentUrl = async (amount, description, orderType, returnURL) => {
    const response = await axiosClient.post("/payment/url", {
        amount: amount,
        description: description,
        orderType: orderType,
        returnURL: returnURL
    })

    return response || null
}