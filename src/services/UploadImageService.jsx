import axios from "axios";

export const uploadCloudinary = async (file) => {
    try {
        if (!file) {
            console.error('No file provided to uploadCloudinary');
            return null;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            console.error('File type not allowed. Only image files are permitted.');
            return null;
        }

        const name = file.name.split('.')[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unisew');
        formData.append('public_id', name);

        const response = await axios.post("https://api.cloudinary.com/v1_1/dj0ckodyq/image/upload", formData)
        if (response && response.status === 200) {
            return response.data.url
        }
        return null;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
}

export const uploadCloudinaryVideo = async (file) => {
    try {
        if (!file) {
            console.error('No file provided to uploadCloudinaryVideo');
            return null;
        }

        const allowedExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            console.error('File type not allowed. Only video files are permitted.');
            return null;
        }

        const name = file.name.split('.')[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unisew');
        formData.append('public_id', name);

        const response = await axios.post("https://api.cloudinary.com/v1_1/dj0ckodyq/video/upload", formData)
        if (response && response.status === 200) {
            return response.data.url
        }
        return null;
    } catch (error) {
        console.error('Error uploading video to Cloudinary:', error);
        return null;
    }
}