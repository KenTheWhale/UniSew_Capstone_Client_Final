import React, { useState, useCallback } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    Rating,
    IconButton,
    Paper,
    Grid,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { giveFeedback } from '../../../../services/FeedbackService.jsx';
import { uploadCloudinary } from '../../../../services/UploadImageService.jsx';
import DisplayImage from '../../../ui/DisplayImage.jsx';

export default function FeedbackReportPopup({
    visible,
    onCancel,
    type = 'feedback',
    requestData,
    onSuccess
}) {
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const isReport = type === 'report';
    const maxImages = 3;

    console.log('FeedbackReportPopup - type:', type);
    console.log('FeedbackReportPopup - isReport:', isReport);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (rating === 0) {
            newErrors.rating = 'Rating is required';
        }

        if (isReport && images.length === 0) {
            newErrors.images = 'At least one image is required for reports';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [content, rating, isReport, images.length]);

    const handleImageUpload = useCallback(async (file) => {
        try {
            setUploadingImages(true);
            const imageUrl = await uploadCloudinary(file);
            return imageUrl;
                    } catch (err) {
                console.error('Error uploading image:', err);
                enqueueSnackbar('Failed to upload image', { variant: 'error' });
                throw err;
        } finally {
            setUploadingImages(false);
        }
    }, []);

    const handleImageChange = useCallback(async (event) => {
        const files = Array.from(event.target.files);

        console.log('handleImageChange - files selected:', files.length);
        console.log('handleImageChange - current images:', images.length);

        if (images.length + files.length > maxImages) {
            enqueueSnackbar(`Maximum ${maxImages} images allowed`, { variant: 'warning' });
            return;
        }

        const newImages = [...images];

        for (const file of files) {
            try {
                console.log('Uploading file:', file.name);
                const imageUrl = await handleImageUpload(file);
                console.log('Upload successful, URL:', imageUrl);
                newImages.push({
                    id: Date.now() + Math.random(),
                    url: imageUrl,
                    file: file
                });
            } catch (err) {
                console.error('Upload failed for file:', file.name, err);
                continue;
            }
        }

        console.log('Final images array:', newImages);
        setImages(newImages);
        event.target.value = '';
    }, [images, handleImageUpload]);

    const handleRemoveImage = useCallback((imageId) => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                rating: rating,
                content: content.trim(),
                report: isReport,
                imageUrls: images.map(img => img.url)
            };

            if (requestData.orderId) {
                payload.orderId = requestData.orderId;
            } else {
                payload.requestId = requestData.id;
            }

            console.log('requestData:', requestData);
            console.log('images array:', images);
            console.log('imageUrls:', images.map(img => img.url));
            console.log('Submitting feedback/report with payload:', payload);

            const response = await giveFeedback(payload);

            if (response && response.status === 200) {
                const actionText = isReport ? 'report' : 'feedback';
                enqueueSnackbar(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} submitted successfully`, {
                    variant: 'success'
                });

                setRating(0);
                setContent('');
                setImages([]);
                setErrors({});

                if (onSuccess) {
                    onSuccess();
                }

                onCancel();
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting feedback/report:', error);
            const actionText = isReport ? 'report' : 'feedback';
            enqueueSnackbar(`Failed to submit ${actionText}`, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    }, [rating, content, images, isReport, requestData, onSuccess, onCancel, validateForm]);

    const handleClose = useCallback(() => {
        setRating(0);
        setContent('');
        setImages([]);
        setErrors({});
        onCancel();
    }, [onCancel]);

    return (
        <Modal
            open={visible}
            onClose={handleClose}
            aria-labelledby="feedback-report-modal"
            aria-describedby="feedback-report-form"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '80%', md: '70%' },
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 0
            }}>
                {}
                <Box sx={{
                    background: isReport
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    p: 3,
                    borderRadius: '12px 12px 0 0',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {isReport ? 'Report Issue' : 'Give Feedback'}
                        </Typography>
                        <Chip
                            label={isReport ? 'Report' : 'Feedback'}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        />
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
                </Box>

                {}
                <Box sx={{ p: 4 }}>
                    {}
                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            {requestData?.orderId ? 'Order Information' : 'Request Information'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {requestData?.orderId ? 'Order ID' : 'Request ID'}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    {requestData?.id ? `#${requestData.id}` : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {requestData?.orderId ? 'Order Date' : 'Request Name'}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    {requestData?.orderId
                                        ? (requestData?.orderDate ? new Date(requestData.orderDate).toLocaleDateString() : 'N/A')
                                        : (requestData?.name || 'N/A')
                                    }
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Status
                                </Typography>
                                <Chip
                                    label={requestData?.status || 'N/A'}
                                    sx={{
                                        backgroundColor: requestData?.status === 'completed' ? '#d1fae5' : '#fef3c7',
                                        color: requestData?.status === 'completed' ? '#065f46' : '#92400e',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Grid>
                            {requestData?.orderId && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        Total Uniforms
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                        {requestData?.orderDetails
                                            ? Math.ceil(requestData.orderDetails.reduce((sum, item) => sum + item.quantity, 0) / 2)
                                            : 'N/A'
                                        }
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    {}
                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
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
                                        color: isReport ? '#ef4444' : '#10b981'
                                    },
                                    '& .MuiRating-iconHover': {
                                        color: isReport ? '#dc2626' : '#059669'
                                    }
                                }}
                            />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                            </Typography>
                        </Box>
                        {errors.rating && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {errors.rating}
                            </Alert>
                        )}
                    </Paper>

                    {}
                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
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
                                : 'Please share your experience and feedback...'
                            }
                            error={!!errors.content}
                            helperText={errors.content}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: errors.content ? '#ef4444' : '#d1d5db',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: errors.content ? '#ef4444' : '#9ca3af',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: errors.content ? '#ef4444' : '#3b82f6',
                                    },
                                },
                            }}
                        />
                    </Paper>

                    {}
                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            {isReport ? 'Evidence Images' : 'Attached Images'}
                            <Typography component="span" sx={{ color: '#64748b', fontWeight: 'normal' }}>
                                {' '}({images.length}/{maxImages})
                            </Typography>
                        </Typography>

                        {images.length > 0 && (
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {images.map((image) => (
                                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                                        <Box sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: 200,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: '2px solid #e2e8f0'
                                        }}>
                                            <DisplayImage
                                                imageUrl={image.url}
                                                alt="Uploaded image"
                                                width="100%"
                                                height="200px"
                                            />
                                            <IconButton
                                                onClick={() => handleRemoveImage(image.id)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.9)'
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {images.length < maxImages && (
                            <Box sx={{
                                border: '2px dashed #d1d5db',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#3b82f6',
                                    backgroundColor: '#f8fafc'
                                }
                            }}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    disabled={uploadingImages}
                                />
                                <label htmlFor="image-upload">
                                    <Box sx={{ cursor: 'pointer' }}>
                                        <CloudUploadIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: '#1e293b', mb: 1 }}>
                                            {uploadingImages ? 'Uploading...' : 'Upload Images'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {isReport
                                                ? 'Upload evidence images (JPG, PNG, GIF)'
                                                : 'Upload images to support your feedback (JPG, PNG, GIF)'
                                            }
                                        </Typography>
                                        {uploadingImages && (
                                            <CircularProgress size={24} sx={{ mt: 2 }} />
                                        )}
                                    </Box>
                                </label>
                            </Box>
                        )}

                        {errors.images && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {errors.images}
                            </Alert>
                        )}
                    </Paper>

                    {}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            disabled={submitting}
                            sx={{
                                borderColor: '#d1d5db',
                                color: '#64748b',
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
                            variant="contained"
                            disabled={submitting}
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
                            {submitting ? (
                                <>
                                    <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                                    Submitting...
                                </>
                            ) : (
                                isReport ? 'Submit Report' : 'Submit Feedback'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}