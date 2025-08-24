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

export const createDesignTransaction = async (receiverId, designRequestId, totalPrice, gatewayCode, serviceFee, payFromWallet) => {
    const response = await axiosClient.post("/payment/transaction", {
        "type": "design",
        "receiverId": receiverId,
        "itemId": designRequestId,
        "totalPrice": totalPrice,
        "gatewayCode": gatewayCode,
        "serviceFee": serviceFee,
        "payFromWallet": payFromWallet
    })

    return response || null
}

export const createOrderTransaction = async (receiverId, orderId, totalPrice, gatewayCode, serviceFee, payFromWallet) => {
    const response = await axiosClient.post("/payment/transaction", {
        "type": "order",
        "receiverId": receiverId,
        "itemId": orderId,
        "totalPrice": totalPrice,
        "gatewayCode": gatewayCode,
        "serviceFee": serviceFee,
        "payFromWallet": payFromWallet
    })

    return response || null
}

export const createDepositWalletTransaction = async (receiverId, totalPrice, gatewayCode) => {
    const response = await axiosClient.post("/payment/transaction", {
        "type": "wallet",
        "receiverId": receiverId,
        "itemId": 0,
        "totalPrice": totalPrice,
        "gatewayCode": gatewayCode,
        "serviceFee": 0,
        "payFromWallet": false
    })

    return response || null
}

export const getTransactions = async () => {
    const response = await axiosClient.get("/payment/transactions")
    return response || null;
}