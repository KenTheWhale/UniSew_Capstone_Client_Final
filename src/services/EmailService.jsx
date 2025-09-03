import axios from "axios"

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const serviceId2 = import.meta.env.VITE_EMAILJS_SERVICE_ID_2
const publicKey2 = import.meta.env.VITE_EMAILJS_PUBLIC_KEY_2

const emailConfirmationTemplateId = import.meta.env.VITE_EMAILJS_EMAIL_CONFIRM_TEMPLATE_ID
const paymentResultTemplateId = import.meta.env.VITE_EMAILJS_PAYMENT_RESULT_TEMPLATE_ID

const milestoneTemplateId = import.meta.env.VITE_EMAILJS_MILESTONE_TEMPLATE_ID

export const emailType = {
    "confirmation": emailConfirmationTemplateId,
    "payment": paymentResultTemplateId,
    "milestone": milestoneTemplateId
}

export const sendEmail = async (emailType, data) => {
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            "service_id": serviceId,
            "template_id": emailType,
            "user_id": publicKey,
            "template_params": data
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        })

    return response || null
}

export const sendEmail2 = async (emailType, data) => {
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            "service_id": serviceId2,
            "template_id": emailType,
            "user_id": publicKey2,
            "template_params": data
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        })

    return response || null
}