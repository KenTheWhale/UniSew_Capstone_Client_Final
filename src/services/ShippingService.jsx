import axios from "axios";
import {parseID} from "../utils/ParseIDUtil.jsx";

const token = import.meta.env.VITE_GHN_TOKEN

export const createShipping = async (garmentShippingUID, receiverName, receiverPhone, receiverAddress, orderId, orderPrice) => {

    const storesResponse = await getStore()

    if (storesResponse && storesResponse.data.code === 200) {
        const store = storesResponse.data.data.shops.find(shop => shop._id === parseInt(garmentShippingUID))
        if (store) {
            let schoolDistrictId = 0

            let schoolWardCode = ''

            const splitAddress = receiverAddress.split(',').map(a => a.trim())

            const streetName = splitAddress[0]

            const wardName = splitAddress[1]

            const districtName = splitAddress[2]

            const provinceName = splitAddress[3]

            const provinceResponse = await getProvinces()

            if (provinceResponse && provinceResponse.data.code === 200) {
                const provinceID = provinceResponse.data.data.find(p => p.ProvinceName === provinceName).ProvinceID
                const districtResponse = await getDistricts(provinceID)

                if (districtResponse && districtResponse.data.code === 200) {
                    schoolDistrictId = districtResponse.data.data.find(d => d.DistrictName === districtName).DistrictID

                    const wardResponse = await getWards(schoolDistrictId)

                    if (wardResponse && wardResponse.data.code === 200) {
                        schoolWardCode = wardResponse.data.data.find(w => w.WardName === wardName).WardCode

                        if (schoolDistrictId !== 0 && schoolWardCode !== '') {

                            const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
                                {
                                    'to_name': receiverName,
                                    'to_phone': receiverPhone,
                                    'to_address': streetName,
                                    'to_ward_code': schoolWardCode,
                                    'to_district_id': schoolDistrictId,
                                    'weight': 1,
                                    'length': 1,
                                    'width': 1,
                                    'height': 1,
                                    'service_type_id': 5,
                                    'payment_type_id': 2,
                                    'required_note': 'CHOTHUHANG',
                                    'items': [
                                        {
                                            'name': 'Order ' + parseID(orderId, 'ord'),
                                            'code': parseID(orderId, 'ord'),
                                            'quantity': 1,
                                            'price': orderPrice,
                                            'length': 1,
                                            'weight': 1,
                                            'width': 1,
                                            'height': 1,
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
                    }
                }
            }
        }
    }
    return null

}

export const calculateShippingTime = async (garmentShippingUID = '', schoolAddress = '') => {

    const storesResponse = await getStore()

    if (storesResponse && storesResponse.data.code === 200) {
        const store = storesResponse.data.data.shops.find(shop => shop._id === parseInt(garmentShippingUID))
        if (store) {
            const garmentDistrictId = store.district_id

            let schoolDistrictId = 0

            let schoolWardCode = ''

            const splitAddress = schoolAddress.split(',').map(a => a.trim())

            const wardName = splitAddress[1]

            const districtName = splitAddress[2]

            const provinceName = splitAddress[3]

            const provinceResponse = await getProvinces()

            if (provinceResponse && provinceResponse.data.code === 200) {
                const provinceID = provinceResponse.data.data.find(p => p.ProvinceName === provinceName).ProvinceID
                const districtResponse = await getDistricts(provinceID)

                if (districtResponse && districtResponse.data.code === 200) {
                    schoolDistrictId = districtResponse.data.data.find(d => d.DistrictName === districtName).DistrictID

                    const wardResponse = await getWards(schoolDistrictId)

                    if (wardResponse && wardResponse.data.code === 200) {
                        schoolWardCode = wardResponse.data.data.find(w => w.WardName === wardName).WardCode

                        if (schoolDistrictId !== 0 && schoolWardCode !== '') {
                            const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
                                {
                                    'from_district_id': garmentDistrictId,
                                    'to_district_id': schoolDistrictId,
                                    'to_ward_code': schoolWardCode,
                                    'service_id': 5
                                },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'ShopId': parseInt(garmentShippingUID),
                                        'Token': token
                                    }
                                }
                            )

                            return response || null
                        }
                    }
                }
            }
        }
    }

    return null
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

export const calculateFee = async (garmentShippingUID = '', schoolAddress) => {

    const storesResponse = await getStore()

    if (storesResponse && storesResponse.data.code === 200) {
        const store = storesResponse.data.data.shops.find(shop => shop._id === parseInt(garmentShippingUID))
        if (store) {
            let schoolDistrictId = 0

            let schoolWardCode = ''

            const splitAddress = schoolAddress.split(',').map(a => a.trim())

            const wardName = splitAddress[1]

            const districtName = splitAddress[2]

            const provinceName = splitAddress[3]

            const provinceResponse = await getProvinces()

            if (provinceResponse && provinceResponse.data.code === 200) {
                const provinceID = provinceResponse.data.data.find(p => p.ProvinceName === provinceName).ProvinceID
                const districtResponse = await getDistricts(provinceID)

                if (districtResponse && districtResponse.data.code === 200) {
                    schoolDistrictId = districtResponse.data.data.find(d => d.DistrictName === districtName).DistrictID

                    const wardResponse = await getWards(schoolDistrictId)

                    if (wardResponse && wardResponse.data.code === 200) {
                        schoolWardCode = wardResponse.data.data.find(w => w.WardName === wardName).WardCode

                        if (schoolDistrictId !== 0 && schoolWardCode !== '') {

                            const response = await axios.post("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
                                {
                                    'to_district_id': schoolDistrictId,
                                    'to_ward_code': schoolWardCode,
                                    'service_type_id': 5,
                                    "weight": 1,
                                    "items": [
                                        {
                                            "weight": 1
                                        }
                                    ]
                                },
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'ShopId': parseInt(garmentShippingUID),
                                        'Token': token
                                    }
                                }
                            )

                            return response || null
                        }
                    }
                }
            }
        }
    }
}

export const getBanks = async () => {
    const response = await axios.get("https://api.vietqr.io/v2/banks")
    return response || null
}
