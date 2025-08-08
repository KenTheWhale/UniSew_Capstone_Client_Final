import axios from "axios";

export const uploadCloudinary = async (file) => {
    const name = file.name.split('.')[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unisew');
    formData.append('public_id', name);
    formData.append('api_key', '923517352954895');
    const response = await axios.post("https://api.cloudinary.com/v1_1/dj0ckodyq/image/upload", formData)
    if (response && response.status === 200) {
        return response.data.url
    }
    return null;
}