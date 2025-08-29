import axios from "axios";
import {parseID} from "../utils/ParseIDUtil.jsx";

const token = import.meta.env.VITE_GHN_TOKEN

export const createShipping = async (garmentShippingUID, receiverName, senderBusinessName, senderPhone, senderAddress, senderWardName, senderDistrictName, senderProvinceName, receiverPhone, receiverAddress, receiverWardCode, receiverDistrictId, senderNote, orderId, orderPrice) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        {
            'to_name': receiverName,
            'from_name': senderBusinessName,
            'from_phone': senderPhone,
            'from_address': senderAddress,
            'from_ward_name': senderWardName,
            'from_district_name': senderDistrictName,
            'from_province_name': senderProvinceName,
            'to_phone': receiverPhone,
            'to_address': receiverAddress,
            'to_ward_code': receiverWardCode,
            'to_district_id': receiverDistrictId,
            'weight': 100,
            'length': 1,
            'width': 10,
            'height': 10,
            'service_type_id': 5,
            'payment_type_id': 2,
            'note': senderNote,
            'required_note': 'CHOTHUHANG',
            'items': [
                {
                    'name': 'Order ' + orderId,
                    'code': parseID(orderId, 'ord'),
                    'quantity': 1,
                    'price': orderPrice,
                    'length': 10,
                    'weight': 10,
                    'width': 10,
                    'height': 10,
                    'category': {
                        'level1': 'order'
                    }
                }
            ]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'ShopId': garmentShippingUID,
                'Token': token
            }
        }
    )

    return response || null
}

export const calculateShippingTime = async (garmentShippingUID, garmentDistrictId, garmentWardCode, schoolDistrictId, schoolWardCode) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
        {
            'from_district_id': garmentDistrictId,
            'from_ward_code': garmentWardCode,
            'to_district_id': schoolDistrictId,
            'to_ward_code': schoolWardCode,
            'service_id': 5
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'ShopId': garmentShippingUID,
                'Token': token
            }
        }
    )

    return response || null
}

export const getShippingInfo = async (orderShippingCode) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail",
        {
            "order_code": orderShippingCode
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const createStore = async (districtId, wardCode, address, storeName, phone) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shop/register",
        {
            'district_id': districtId,
            'ward_code': wardCode.toString(),
            'address': address,
            'name': storeName,
            'phone': phone
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const getStore = async () => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shop/all",
        {
            'offset': 0,
            'limit': 50,
            'client_phone': ""
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const getProvinces = async () => {
    const response = await axios.get("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const getDistricts = async (provinceId) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
            'province_id': provinceId
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const getWards = async (districtId) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
            'district_id': districtId
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Token': token
            }
        }
    )

    return response || null
}

export const calculateFee = async (garmentShippingUID, fromDistrictId, fromWardCode, toDistrictId, toWardCode, value) => {
    const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
            'from_district_id': fromDistrictId,
            'from_ward_code': fromWardCode,
            'to_district_id': toDistrictId,
            'to_ward_code': toWardCode,
            'height': 50,
            'length': 20,
            'weight': 200,
            'width': 20,
            'insurance_value': value,
            'service_id': 5,
            'coupon': null,
            'items': [
                {
                    'name': "TEST1",
                    'quantity': 1,
                    'height': 200,
                    'weight': 1000,
                    'length': 200,
                    'width': 200
                }
            ]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'ShopId': garmentShippingUID,
                'Token': token
            }
        }
    )

    return response || null
}

export const getBanks = async () => {
    const response = await axios.get("https://api.vietqr.io/v2/banks")
    return response || null
}
