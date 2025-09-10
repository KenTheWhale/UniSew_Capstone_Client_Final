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

export const getPaymentUrlUsingWallet = (amount) => {
    const url = import.meta.env.VITE_SERVER_FE
    return `${url}/school/payment/result?vnp_Amount=${amount * 100}&vnp_ResponseCode=00&vnp_TxnRef=12345`
}

export const getPaymentUrlUsingWalletForOrder = (amount, quotationId) => {
    const url = import.meta.env.VITE_SERVER_FE
    return `${url}/school/payment/result?quotationId=${quotationId}&vnp_Amount=${amount * 100}&vnp_ResponseCode=00&vnp_TxnRef=12345`
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

export const createDepositTransaction = async (receiverId, orderId, totalPrice, gatewayCode, serviceFee, payFromWallet) => {
    const response = await axiosClient.post("/payment/transaction", {
        "type": "deposit",
        "receiverId": receiverId,
        "itemId": orderId,
        "totalPrice": totalPrice,
        "gatewayCode": gatewayCode,
        "serviceFee": serviceFee,
        "payFromWallet": payFromWallet
    })

    return response || null
}

export const createDepositWalletTransaction = async (receiverId, totalPrice, gatewayCode, payFromWallet) => {
    const response = await axiosClient.post("/payment/transaction", {
        "type": "wallet",
        "receiverId": receiverId,
        "itemId": 0,
        "totalPrice": totalPrice,
        "gatewayCode": gatewayCode,
        "serviceFee": 0,
        "payFromWallet": payFromWallet
    })

    return response || null
}

export const getTransactions = async () => {
    const response = await axiosClient.get("/payment/transactions")
    return response || null;
}

export const getTransactionsForOne = async () => {
    const response = await axiosClient.post("/payment/transactions")
    return response || null;
}

export const refundTransaction = async (data) => {
    const response = await axiosClient.post("/payment/transaction/refund", data)
    return response || null;
}

export const getWalletBalance = async () => {
    const response = await axiosClient.post("/payment/wallet")
    return response || null;
}