import axios from "axios"

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const emailConfirmationTemplateId = import.meta.env.VITE_EMAILJS_EMAIL_CONFIRM_TEMPLATE_ID
const paymentResultTemplateId = import.meta.env.VITE_EMAILJS_PAYMENT_RESULT_TEMPLATE_ID

export const emailType = {
    CONFIRMATION: "email_confirmation",
    PAYMENT: "payment_result"
}

// Template ID mapping
const templateMapping = {
    [emailType.CONFIRMATION]: emailConfirmationTemplateId,
    [emailType.PAYMENT]: paymentResultTemplateId
}

export const sendEmail = async (emailType, data) => {
    const templateId = templateMapping[emailType];
    
    if (!templateId) {
        throw new Error(`Invalid email type: ${emailType}`);
    }

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        "service_id": serviceId,
        "template_id": templateId,
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