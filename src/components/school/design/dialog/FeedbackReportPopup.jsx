import React, {useState} from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Grid,
    IconButton,
    Paper,
    Rating,
    TextField,
    Typography
} from '@mui/material';
import {
    Close as CloseIcon,
    Feedback as FeedbackIcon,
    Report as ReportIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {giveFeedback} from '../../../../services/FeedbackService.jsx';
import {uploadCloudinary} from '../../../../services/UploadImageService';
import DisplayImage from '../../../ui/DisplayImage';

export default function FeedbackReportPopup({ 
    visible, 
    onCancel, 
    type = 'feedback', // 'feedback' or 'report'
    requestData = null, // design request data
    orderData = null,   // order data
    onSuccess 
}) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isReport = type === 'report';
    const title = isReport ? 'Report Issue' : 'Give Feedback';
    const icon = isReport ? <ReportIcon /> : <FeedbackIcon />;
    const submitText = isReport ? 'Submit Report' : 'Submit Feedback';

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                enqueueSnackbar('Invalid file type. Only images are accepted.', { variant: 'error' });
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                enqueueSnackbar('File size too large. Maximum 5MB allowed.', { variant: 'error' });
                return;
            }
            
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const validateForm = () => {
        if (!content.trim()) {
            enqueueSnackbar('Please enter your feedback/report content.', { variant: 'error' });
            return false;
        }

        if (isReport && !image) {
            enqueueSnackbar('Image is required for reports.', { variant: 'error' });
            return false;
        }

        if (rating < 1) {
            enqueueSnackbar('Please provide a rating.', { variant: 'error' });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            let imageUrl = '';
            if (image) {
                const uploadedUrl = await uploadCloudinary(image);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    enqueueSnackbar('Failed to upload image. Please try again.', { variant: 'error' });
                    return;
                }
            }

            const payload = {
                requestId: requestData?.id || null,
                orderId: orderData?.id || null,
                rating: rating,
                content: content.trim(),
                report: isReport,
                imageUrl: imageUrl
            };

            const response = await giveFeedback(payload);

            if (response && response.status === 200) {
                enqueueSnackbar(
                    isReport ? 'Report submitted successfully' : 'Feedback submitted successfully', 
                    { variant: 'success' }
                );
                handleClose();
                if (onSuccess) onSuccess();
            } else {
                enqueueSnackbar('Failed to submit. Please try again.', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error submitting feedback/report:', error);
            enqueueSnackbar('Failed to submit. Please try again.', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(5);
        setContent('');
        setImage(null);
        setImagePreview(null);
        setIsSubmitting(false);
        onCancel();
    };

    const getItemInfo = () => {
        if (requestData) {
            return {
                type: 'Design Request',
                id: requestData.id,
                name: requestData.name,
                status: requestData.status
            };
        }
        if (orderData) {
            return {
                type: 'Order',
                id: orderData.id,
                name: `Order #${orderData.id}`,
                status: orderData.status
            };
        }
        return null;
    };

    const itemInfo = getItemInfo();

    return (
        <Dialog
            open={visible}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ 
                background: isReport 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white'
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pb: 2 }}>
                {/* Item Information */}
                {itemInfo && (
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            Item Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        Type
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        {itemInfo.type}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        ID
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        #{itemInfo.id}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        {itemInfo.name}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        Status
                                    </Typography>
                                    <Chip
                                        label={itemInfo.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: itemInfo.status === 'completed' ? '#d1fae5' : 
                                                            itemInfo.status === 'processing' ? '#fef3c7' : 
                                                            itemInfo.status === 'pending' ? '#e0e7ff' : '#fee2e2',
                                            color: itemInfo.status === 'completed' ? '#059669' : 
                                                   itemInfo.status === 'processing' ? '#d97706' : 
                                                   itemInfo.status === 'pending' ? '#3730a3' : '#dc2626',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                <Grid container spacing={3}>
                    {/* Rating Section - For both feedback and report */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            Rating
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Rating
                                value={rating}
                                onChange={(event, newValue) => setRating(newValue)}
                                size="large"
                                sx={{
                                    '& .MuiRating-iconFilled': {
                                        color: '#f59e0b'
                                    }
                                }}
                            />
                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                {rating} out of 5 stars
                            </Typography>
                        </Box>
                        <FormHelperText sx={{ mt: 1, color: '#64748b' }}>
                            {isReport 
                                ? 'Rate the severity of the issue you encountered.'
                                : 'Rate your overall experience with this service.'
                            }
                        </FormHelperText>
                    </Grid>

                    {/* Content Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            {isReport ? 'Report Details' : 'Feedback Content'}
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={isReport 
                                ? 'Please describe the issue you encountered...' 
                                : 'Share your experience and suggestions...'
                            }
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                        <FormHelperText sx={{ mt: 1, color: '#64748b' }}>
                            {isReport 
                                ? 'Please provide detailed information about the issue to help us resolve it quickly.'
                                : 'Your feedback helps us improve our services.'
                            }
                        </FormHelperText>
                    </Grid>

                    {/* Image Upload Section */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            {isReport ? 'Upload Evidence (Required)' : 'Upload Image (Optional)'}
                        </Typography>
                        
                        {imagePreview ? (
                            <Paper elevation={0} sx={{ 
                                p: 3, 
                                border: '2px solid #e2e8f0',
                                borderRadius: 2,
                                backgroundColor: '#f8fafc'
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    height: 200,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    mb: 2,
                                    border: '2px solid #e2e8f0'
                                }}>
                                    <DisplayImage
                                        imageUrl={imagePreview}
                                        alt="Preview"
                                        width="100%"
                                        height="200px"
                                    />
                                </Box>
                                <Button
                                    variant="outlined"
                                    onClick={handleRemoveImage}
                                    sx={{
                                        borderColor: '#ef4444',
                                        color: '#ef4444',
                                        '&:hover': {
                                            borderColor: '#dc2626',
                                            backgroundColor: '#fef2f2'
                                        }
                                    }}
                                >
                                    Remove Image
                                </Button>
                            </Paper>
                        ) : (
                            <Paper elevation={0} sx={{ 
                                p: 3, 
                                border: '2px dashed #cbd5e1',
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: '#3b82f6',
                                    backgroundColor: '#eff6ff'
                                }
                            }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="feedback-image-upload"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="feedback-image-upload">
                                    <Box sx={{ cursor: 'pointer' }}>
                                        <Box sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            backgroundColor: '#e0e7ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            mb: 2,
                                            color: '#3730a3'
                                        }}>
                                            <UploadIcon sx={{ fontSize: 40 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                                            {isReport ? 'Upload Evidence Image' : 'Upload Image (Optional)'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                                            {isReport 
                                                ? 'Please upload an image showing the issue for better understanding'
                                                : 'Upload an image to support your feedback (optional)'
                                            }
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            component="span"
                                            sx={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                                }
                                            }}
                                        >
                                            Choose Image
                                        </Button>
                                    </Box>
                                </label>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    sx={{
                        color: '#64748b',
                        borderColor: '#d1d5db',
                        '&:hover': {
                            borderColor: '#9ca3af',
                            backgroundColor: '#f9fafb'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{
                        background: isReport 
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            background: isReport 
                                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                                : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        },
                        '&:disabled': {
                            background: '#9ca3af'
                        }
                    }}
                >
                    {isSubmitting ? 'Submitting...' : submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 