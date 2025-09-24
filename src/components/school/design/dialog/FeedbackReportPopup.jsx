import React, {useCallback, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    LinearProgress,
    Modal,
    Paper,
    Rating,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import {
    Close as CloseIcon, 
    CloudUpload as CloudUploadIcon, 
    Delete as DeleteIcon,
    Image as ImageIcon,
    Videocam as VideocamIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {giveFeedback} from '../../../../services/FeedbackService.jsx';
import {uploadCloudinary, uploadCloudinaryVideo} from '../../../../services/UploadImageService.jsx';
import DisplayImage from '../../../ui/DisplayImage.jsx';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";

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
    
    // Video upload states
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');

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

        if (isReport && images.length === 0 && !videoUrl) {
            newErrors.media = 'Evidence Media is required for reports. Please upload at least one image or video.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [content, rating, isReport, images.length, videoUrl]);

    const handleImageUpload = useCallback(async (file) => {
        try {
            setUploadingImages(true);
            const imageUrl = await uploadCloudinary(file);
            return imageUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            enqueueSnackbar('Failed to upload image', {variant: 'error'});
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
            enqueueSnackbar(`Maximum ${maxImages} images allowed`, {variant: 'warning'});
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

    // Video upload handlers
    const handleVideoUpload = useCallback(async (file) => {
        try {
            setUploadingVideo(true);
            setUploadProgress(0);
            
            const videoUrl = await uploadCloudinaryVideo(file, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            });
            
            return videoUrl;
        } catch (err) {
            console.error('Error uploading video:', err);
            enqueueSnackbar('Failed to upload video', {variant: 'error'});
            throw err;
        } finally {
            setUploadingVideo(false);
            setUploadProgress(0);
        }
    }, []);

    const handleVideoChange = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const uploadedVideoUrl = await handleVideoUpload(file);
            setVideoFile(file);
            setVideoUrl(uploadedVideoUrl);
            // Clear images when video is uploaded
            setImages([]);
        } catch (err) {
            console.error('Upload failed for video:', file.name, err);
        }
        
        event.target.value = '';
    }, [handleVideoUpload]);

    const handleRemoveVideo = useCallback(() => {
        setVideoFile(null);
        setVideoUrl('');
        setUploadProgress(0);
    }, []);

    const handleUploadModeToggle = useCallback((event) => {
        const videoMode = event.target.checked;
        setIsVideoMode(videoMode);
        
        // Clear existing uploads when switching modes
        if (videoMode) {
            setImages([]);
        } else {
            setVideoFile(null);
            setVideoUrl('');
            setUploadProgress(0);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                requestId: requestData.orderId ? null : (requestData.id || null),
                orderId: requestData.orderId || null,
                rating: rating,
                content: content.trim(),
                report: isReport,
                imageUrls: images.map(img => img.url),
                videoUrl: videoUrl || null
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
                setVideoFile(null);
                setVideoUrl('');
                setUploadProgress(0);
                setIsVideoMode(false);
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
            enqueueSnackbar(`Failed to submit ${actionText}`, {variant: 'error'});
        } finally {
            setSubmitting(false);
        }
    }, [rating, content, images, videoUrl, isReport, requestData, onSuccess, onCancel, validateForm]);

    const handleClose = useCallback(() => {
        setRating(0);
        setContent('');
        setImages([]);
        setVideoFile(null);
        setVideoUrl('');
        setUploadProgress(0);
        setIsVideoMode(false);
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
                width: {xs: '95%', sm: '80%', md: '70%'},
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 0,
                '&::-webkit-scrollbar': {
                    display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
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
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Typography variant="h5" sx={{fontWeight: 'bold'}}>
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
                        <CloseIcon/>
                    </IconButton>
                </Box>

                {}
                <Box sx={{p: 4}}>
                    {}
                    <Paper elevation={0} sx={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        borderRadius: 3,
                        p: 3,
                        mb: 3
                    }}>
                        {/* Header */}
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flex: 1
                            }}>
                                <Typography variant="h5" sx={{
                                    fontWeight: 'bold', 
                                    color: '#1e293b',
                                    fontSize: '1.25rem'
                                }}>
                                    {requestData?.orderId ? (requestData?.name || `Order`) : (requestData?.name || 'Design Request')}
                                </Typography>
                            </Box>
                            <Chip
                                label={requestData?.orderId ? parseID(requestData.orderId, 'ord') : (requestData?.id ? parseID(requestData.id, 'dr') : 'N/A')}
                                sx={{
                                    backgroundColor: requestData?.orderId ? '#e3f2fd' : '#dcfce7',
                                    color: requestData?.orderId ? '#1976d2' : '#065f46',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Box>

                        {/* Status Badge */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3
                        }}>
                            <Chip
                                label={requestData?.status || 'N/A'}
                                sx={{
                                    backgroundColor: (() => {
                                        const status = requestData?.status?.toLowerCase();
                                        if (status === 'completed') return '#10b981';
                                        if (status === 'pending' || status === 'processing') return '#f59e0b';
                                        if (status === 'cancelled' || status === 'rejected') return '#ef4444';
                                        return '#6b7280';
                                    })(),
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    padding: '6px 16px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transform: 'scale(1.1)',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                }}
                            />
                        </Box>

                        {/* Information Grid */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            {/* ID Information */}
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                flex: '1 1 calc(50% - 8px)',
                                minWidth: '200px'
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: requestData?.orderId ? '#3f51b5' : '#10b981',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1
                                }}>
                                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                        {requestData?.orderId ? 'ORD' : 'REQ'}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    display: 'block'
                                }}>
                                    {requestData?.orderId ? 'Order ID' : 'Request ID'}
                                </Typography>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold',
                                    color: '#1e293b',
                                    fontSize: '0.9rem'
                                }}>
                                    {requestData?.orderId ? parseID(requestData.orderId, "ord") : (requestData?.id ? parseID(requestData.id, "dr") : 'N/A')}
                                </Typography>
                            </Box>

                            {/* Date/Name Information */}
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                flex: '1 1 calc(50% - 8px)',
                                minWidth: '200px'
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: '#10b981',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1
                                }}>
                                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                        {requestData?.orderId ? '📅' : '📝'}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    display: 'block'
                                }}>
                                    {requestData?.orderId ? 'Order Date' : 'Request Name'}
                                </Typography>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold',
                                    color: '#1e293b',
                                    fontSize: '0.9rem'
                                }}>
                                    {requestData?.orderId ? (requestData?.orderDate || 'N/A') : (requestData?.name || 'N/A')}
                                </Typography>
                            </Box>

                            {/* Quantity Information (only for orders) */}
                            {requestData?.orderId && (
                                <Box sx={{
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    textAlign: 'center',
                                    flex: '1 1 calc(50% - 8px)',
                                    minWidth: '200px'
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: '#f59e0b',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 1
                                    }}>
                                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                            👕
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        display: 'block'
                                    }}>
                                        Total Uniforms
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold',
                                        color: '#1e293b',
                                        fontSize: '0.9rem'
                                    }}>
                                        {requestData?.orderDetails 
                                            ? requestData.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0)/2
                                            : 'N/A'
                                        }
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Additional Information for Orders */}
                        {requestData?.orderId && requestData?.price && (
                            <Box sx={{
                                mt: 2,
                                p: 2,
                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                textAlign: 'center'
                            }}>
                                <Typography variant="caption" sx={{
                                    color: '#ef4444',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mb: 0.5
                                }}>
                                    Total Price
                                </Typography>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold',
                                    color: '#ef4444',
                                    fontSize: '1.1rem'
                                }}>
                                    {requestData.price?.toLocaleString('vi-VN')} VND
                                </Typography>
                            </Box>
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
                        <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                            Rating
                        </Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
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
                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                            </Typography>
                        </Box>
                        {errors.rating && (
                            <Alert severity="error" sx={{mt: 1}}>
                                {errors.rating}
                            </Alert>
                        )}
                    </Paper>


                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
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

                    <Paper elevation={0} sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                            <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                {isReport ? 'Evidence Media *' : 'Attached Media'}
                                {isReport && (
                                    <Typography component="span" sx={{color: '#ef4444', fontWeight: 'bold', ml: 1}}>
                                        (Required)
                                    </Typography>
                                )}
                                {!isVideoMode && (
                                    <Typography component="span" sx={{color: '#64748b', fontWeight: 'normal'}}>
                                        {' '}({images.length}/{maxImages})
                                    </Typography>
                                )}
                            </Typography>
                            
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <ImageIcon sx={{color: isVideoMode ? '#9ca3af' : '#3b82f6', fontSize: 20}}/>
                                <Switch
                                    checked={isVideoMode}
                                    onChange={handleUploadModeToggle}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#8b5cf6',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#8b5cf6',
                                        },
                                    }}
                                />
                                <VideocamIcon sx={{color: isVideoMode ? '#8b5cf6' : '#9ca3af', fontSize: 20}}/>
                                <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>
                                    {isVideoMode ? 'Video' : 'Images'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Images Display */}
                        {!isVideoMode && images.length > 0 && (
                            <Grid container spacing={2} sx={{mb: 3}}>
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
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* Video Display */}
                        {isVideoMode && videoFile && (
                            <Box sx={{mb: 3}}>
                                <Box sx={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: 500,
                                    mx: 'auto',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e2e8f0',
                                    backgroundColor: '#000'
                                }}>
                                    <video
                                        src={videoUrl}
                                        controls
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleRemoveVideo}
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
                                        <DeleteIcon/>
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" sx={{textAlign: 'center', mt: 1, color: '#64748b'}}>
                                    Video: {videoFile.name}
                                </Typography>
                            </Box>
                        )}

                        {/* Upload Area for Images */}
                        {!isVideoMode && images.length < maxImages && (
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
                                    style={{display: 'none'}}
                                    id="image-upload"
                                    disabled={uploadingImages}
                                />
                                <label htmlFor="image-upload">
                                    <Box sx={{cursor: 'pointer'}}>
                                        <ImageIcon sx={{fontSize: 48, color: '#64748b', mb: 2}}/>
                                        <Typography variant="h6" sx={{color: '#1e293b', mb: 1}}>
                                            {uploadingImages ? 'Uploading...' : 'Upload Images'}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            {isReport
                                                ? 'Upload evidence images (JPG, PNG, GIF) - Required for reports'
                                                : 'Upload images to support your feedback (JPG, PNG, GIF)'
                                            }
                                        </Typography>
                                        {uploadingImages && (
                                            <CircularProgress size={24} sx={{mt: 2}}/>
                                        )}
                                    </Box>
                                </label>
                            </Box>
                        )}

                        {/* Upload Area for Video */}
                        {isVideoMode && !videoFile && (
                            <Box sx={{
                                border: '2px dashed #8b5cf6',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                '&:hover': {
                                    borderColor: '#7c3aed',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                }
                            }}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    style={{display: 'none'}}
                                    id="video-upload"
                                    disabled={uploadingVideo}
                                />
                                <label htmlFor="video-upload">
                                    <Box sx={{cursor: 'pointer'}}>
                                        <VideocamIcon sx={{fontSize: 48, color: '#8b5cf6', mb: 2}}/>
                                        <Typography variant="h6" sx={{color: '#1e293b', mb: 1}}>
                                            {uploadingVideo ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                            {isReport
                                                ? 'Upload evidence video (MP4, AVI, MOV, etc.) - Required for reports'
                                                : 'Upload video to support your feedback (MP4, AVI, MOV, etc.)'
                                            }
                                        </Typography>
                                        {uploadingVideo && (
                                            <Box sx={{mt: 2}}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={uploadProgress}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: '#e2e8f0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: '#8b5cf6',
                                                            borderRadius: 3
                                                        }
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{color: '#8b5cf6', mt: 1, fontWeight: 500}}>
                                                    {uploadProgress}% completed
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </label>
                            </Box>
                        )}

                        {errors.media && (
                            <Alert severity="error" sx={{mt: 2}}>
                                {errors.media}
                            </Alert>
                        )}
                    </Paper>

                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end'}}>
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
                            disabled={submitting || (isReport && images.length === 0 && !videoUrl)}
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
                                    <CircularProgress size={16} sx={{mr: 1, color: 'white'}}/>
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