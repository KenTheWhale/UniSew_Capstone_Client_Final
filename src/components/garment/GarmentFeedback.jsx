import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Rating,
    Skeleton,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import {
    FlagCircle as FlagIcon,
    Assignment as OrderIcon,
    AttachMoney as MoneyIcon,
    Business as BusinessIcon,
    CalendarMonth as CalendarIcon,
    CalendarToday as CalendarTodayIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    DesignServices as DesignIcon,
    Factory as FactoryIcon,
    Feedback as FeedbackIcon,
    Image as ImageIcon,
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Report as ReportIcon,
    School as SchoolIcon,
    Star as StarIcon,
    Videocam as VideocamIcon,
    Visibility as VisibilityIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import {Empty} from 'antd';
import {getReportsByGarment, appealReport} from '../../services/FeedbackService.jsx';
import {uploadCloudinaryVideo} from '../../services/UploadImageService.jsx';
import DisplayImage from '../ui/DisplayImage.jsx';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import dayjs from 'dayjs';
import {enqueueSnackbar} from 'notistack';

// Utility functions
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// StatCard Component
const StatCard = React.memo(({icon, value, label, color, bgColor}) => (
    <Card
        elevation={0}
        sx={{
            flex: 1,
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": {
                borderColor: color,
                transform: "translateY(-2px)",
                boxShadow: `0 8px 25px ${color}20`
            }
        }}
    >
        <CardContent sx={{textAlign: "center", p: 3}}>
            <Box
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2
                }}
            >
                {icon}
            </Box>
            <Typography variant="h4" sx={{fontWeight: 700, color, mb: 1}}>
                {value}
            </Typography>
            <Typography variant="body1" sx={{color: "#64748b", fontWeight: 600}}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

// Loading Skeleton
const FeedbackSkeleton = () => (
    <Card elevation={0} sx={{border: '1px solid #e2e8f0', borderRadius: 3, mb: 3}}>
        <CardContent sx={{p: 3}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                <Skeleton variant="circular" width={56} height={56}/>
                <Box sx={{flex: 1}}>
                    <Skeleton variant="text" width={200} height={24}/>
                    <Skeleton variant="text" width={120} height={20}/>
                </Box>
                <Skeleton variant="rectangular" width={80} height={32}/>
            </Box>
            <Skeleton variant="text" width="100%" height={20}/>
            <Skeleton variant="text" width="80%" height={20}/>
            <Box sx={{display: 'flex', gap: 1, mt: 2}}>
                <Skeleton variant="rectangular" width={80} height={80} sx={{borderRadius: 2}}/>
                <Skeleton variant="rectangular" width={80} height={80} sx={{borderRadius: 2}}/>
            </Box>
        </CardContent>
    </Card>
);

// FeedbackCard Component
const FeedbackCard = React.memo(({feedback, onImageClick, onViewDetail, onAppeal}) => {
    const isReport = feedback.report;
    

    
    return (
        <Card
            elevation={0}
            sx={{
                border: isReport ? '1px solid #fecaca' : '1px solid #e2e8f0',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: isReport ? '#ef4444' : '#3f51b5',
                    transform: 'translateY(-2px)',
                    boxShadow: isReport ? '0 8px 25px rgba(239, 68, 68, 0.15)' : '0 8px 25px rgba(63, 81, 181, 0.15)'
                }
            }}
        >
            <CardContent sx={{p: 0}}>
                {/* Main Content Area */}
                <Box sx={{p: 3}}>
                    {/* Header Section */}
                    <Box sx={{display: 'flex', gap: 3, mb: 3}}>
                        {/* Left: Avatar & School Info */}
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flex: 1}}>
                            <Avatar
                                src={feedback.sender?.avatar}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    border: isReport ? '3px solid #ef444420' : '3px solid #3f51b520',
                                    bgcolor: isReport ? '#fef2f2' : '#f8f9fa',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                {!feedback.sender?.avatar && (
                                    <SchoolIcon sx={{color: isReport ? '#ef4444' : '#3f51b5', fontSize: 28}}/>
                                )}
                            </Avatar>
                            <Box sx={{flex: 1}}>
                                <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 0.5}}>
                                    {feedback.sender?.name || 'Unknown School'}
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <OrderIcon sx={{fontSize: 16, color: '#64748b'}}/>
                                    <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>
                                        {feedback.order?.selectedDesign?.designRequest?.name || `Order ${parseID(feedback.order?.id || 'N/A', 'ord')}`}
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Rating
                                        value={feedback.rating || 0}
                                        readOnly
                                        size="small"
                                        icon={<StarIcon fontSize="inherit"/>}
                                    />
                                    <Typography variant="body2" sx={{color: '#f59e0b', fontWeight: 600}}>
                                        {feedback.rating || 0}/5
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Right: Status & Actions */}
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2}}>
                            {/* Type & Date */}
                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1}}>
                                <Chip
                                    icon={isReport ? <ReportIcon/> : <FeedbackIcon/>}
                                    label={isReport ? 'Report' : 'Feedback'}
                                    color={isReport ? 'error' : 'primary'}
                                    variant="outlined"
                                    sx={{fontWeight: 600}}
                                />
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <CalendarIcon sx={{fontSize: 14, color: '#64748b'}}/>
                                    <Typography variant="caption" sx={{color: '#64748b'}}>
                                        {formatDate(feedback.creationDate)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {/* Status Chip */}
                            {feedback.status && (
                                <Chip
                                    label={feedback.status}
                                    sx={{
                                        backgroundColor: (() => {
                                            const status = feedback.status?.toLowerCase();
                                            if (status?.includes('approved') || status?.includes('accepted')) return '#dcfce7';
                                            if (status?.includes('rejected')) return '#fecaca';
                                            if (status?.includes('under-review') || status?.includes('pending')) return '#fef3c7';
                                            return '#f1f5f9';
                                        })(),
                                        color: (() => {
                                            const status = feedback.status?.toLowerCase();
                                            if (status?.includes('approved') || status?.includes('accepted')) return '#065f46';
                                            if (status?.includes('rejected')) return '#dc2626';
                                            if (status?.includes('under-review') || status?.includes('pending')) return '#92400e';
                                            return '#475569';
                                        })(),
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{mb: 3}}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#374151',
                                lineHeight: 1.6,
                                fontStyle: feedback.content ? 'normal' : 'italic',
                                backgroundColor: '#f8fafc',
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                borderLeft: `4px solid ${isReport ? '#ef4444' : '#3f51b5'}`
                            }}
                        >
                            {feedback.content || 'No content provided'}
                        </Typography>
                    </Box>

                    {/* Evidence Images */}
                    {feedback.images && feedback.images.length > 0 && (
                        <Box sx={{mb: 3}}>
                            <Typography variant="subtitle1" sx={{
                                color: '#1e293b',
                                mb: 2,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <ImageIcon sx={{fontSize: 20, color: isReport ? '#ef4444' : '#3f51b5'}}/>
                                {isReport ? 'Evidence Images' : 'Attached Images'} ({feedback.images.length})
                            </Typography>
                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                {feedback.images.map((image, index) => (
                                    <Box
                                        key={image.id || index}
                                        sx={{
                                            position: 'relative',
                                            width: 100,
                                            height: 100,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            border: '2px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                borderColor: isReport ? '#ef4444' : '#3f51b5',
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                        onClick={() => onImageClick(image.url)}
                                    >
                                        <DisplayImage
                                            imageUrl={image.url}
                                            alt={`${isReport ? 'Evidence' : 'Feedback'} image ${index + 1}`}
                                            width="100%"
                                            height="100%"
                                            style={{objectFit: 'cover'}}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'rgba(0,0,0,0)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    opacity: 1,
                                                    background: 'rgba(0,0,0,0.6)'
                                                }
                                            }}
                                        >
                                            <ZoomInIcon sx={{color: 'white', fontSize: 28}}/>
                                        </Box>
                                        {/* Image number badge */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 6,
                                            right: 6,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Bottom Section - Order Info & Actions */}
                <Box sx={{
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    p: 3
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        {/* Order Information */}
                        {feedback.order && (
                            <Box sx={{flex: 1}}>
                                <Typography variant="subtitle2" sx={{color: '#64748b', mb: 2, fontWeight: 600}}>
                                    Order Information
                                </Typography>
                                <Box sx={{display: 'flex', gap: 4}}>
                                    <Box>
                                        <Typography variant="caption" sx={{color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
                                            Order ID
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {parseID(feedback.order.id, 'ord')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
                                            Order Date
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {feedback.order.orderDate ? formatDate(feedback.order.orderDate) : 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
                                            Order Status
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {feedback.order.status || 'N/A'}
                                        </Typography>
                                    </Box>
                                    {feedback.order.price && (
                                        <Box>
                                            <Typography variant="caption" sx={{color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
                                                Total Price
                                            </Typography>
                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#ef4444'}}>
                                                {feedback.order.price.toLocaleString('vi-VN')} VND
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}
                        
                        {/* Action Buttons */}
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                            <Button
                                variant="outlined"
                                startIcon={<VisibilityIcon/>}
                                onClick={() => onViewDetail(feedback)}
                                sx={{
                                    borderColor: isReport ? '#ef4444' : '#3b82f6',
                                    color: isReport ? '#ef4444' : '#3b82f6',
                                    fontWeight: 600,
                                    px: 3,
                                    '&:hover': {
                                        borderColor: isReport ? '#dc2626' : '#2563eb',
                                        backgroundColor: isReport ? '#fef2f2' : '#eff6ff'
                                    }
                                }}
                            >
                                View Details
                            </Button>
                            

                            
                            {/* Appeal Button - Only show for reports with status not under-review */}
                            {feedback.report && feedback.status && 
                             !feedback.status.toLowerCase().includes('under-review') && 
                             (!feedback.appeals || feedback.appeals.length === 0) && (
                                <Button
                                    variant="contained"
                                    startIcon={<FlagIcon/>}
                                    onClick={() => onAppeal(feedback)}
                                    sx={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 3,
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                            boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)'
                                        }
                                    }}
                                >
                                    Submit Appeal
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});

// Empty State Component
const EmptyState = React.memo(({isReport = false}) => (
    <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 4
    }}>
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Box>
                    <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                        {isReport ? 'No reports received yet' : 'No feedback received yet'}
                    </Typography>
                    <Typography variant="body2" sx={{color: '#9ca3af'}}>
                        {isReport
                            ? 'Complete more orders to start receiving reports from schools'
                            : 'Complete more orders to start receiving feedback from schools'
                        }
                    </Typography>
                </Box>
            }
        />
    </Box>
));

// Error State Component
const ErrorState = React.memo(({error, onRetry, isRetrying}) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
        flexDirection: 'column',
        gap: 3
    }}>
        <Box sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 3,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            maxWidth: 500
        }}>
            <Typography variant="h6" sx={{color: '#dc2626', fontWeight: 600, mb: 2}}>
                Error Loading Data
            </Typography>
            <Typography variant="body1" sx={{color: '#7f1d1d', mb: 3}}>
                {error}
            </Typography>
            <Button
                variant="contained"
                onClick={onRetry}
                disabled={isRetrying}
                startIcon={isRetrying ? <CircularProgress size={16}/> : <FeedbackIcon/>}
                sx={{
                    backgroundColor: '#dc2626',
                    '&:hover': {
                        backgroundColor: '#b91c1c'
                    }
                }}
            >
                {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
        </Box>
    </Box>
));

// Tab Panel Component
const TabPanel = ({children, value, index, ...other}) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`feedback-tabpanel-${index}`}
        aria-labelledby={`feedback-tab-${index}`}
        {...other}
    >
        {value === index && children}
    </div>
);

export default function GarmentFeedback() {
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Detail dialogs state
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [orderDetailOpen, setOrderDetailOpen] = useState(false);
    
    // Appeal dialog state
    const [appealDialogOpen, setAppealDialogOpen] = useState(false);
    const [appealReason, setAppealReason] = useState('');
    const [appealVideoFile, setAppealVideoFile] = useState(null);
    const [appealVideoUrl, setAppealVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submittingAppeal, setSubmittingAppeal] = useState(false);
    



    const fetchFeedbacks = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await getReportsByGarment();

            if (response && response.status === 200) {
                const feedbackData = response.data.body || [];
                setAllFeedbacks(feedbackData);
            } else {
                setError('Failed to fetch feedback data');
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setError('An error occurred while fetching feedback');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleImageClick = useCallback((imageUrl) => {
        setSelectedImage(imageUrl);
        setImageDialogOpen(true);
    }, []);

    const handleCloseImageDialog = useCallback(() => {
        setImageDialogOpen(false);
        setSelectedImage(null);
    }, []);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    // Detail dialog handlers
    const handleViewDetail = useCallback((feedback) => {
        setSelectedFeedback(feedback);
        setDetailDialogOpen(true);
    }, []);

    const handleCloseDetail = useCallback(() => {
        setDetailDialogOpen(false);
        setSelectedFeedback(null);
    }, []);

    const handleViewOrderDetail = useCallback(() => {
        setOrderDetailOpen(true);
    }, []);

    const handleCloseOrderDetail = useCallback(() => {
        setOrderDetailOpen(false);
    }, []);

    // Appeal handlers
    const handleOpenAppeal = useCallback((feedback) => {
        setSelectedFeedback(feedback);
        setAppealDialogOpen(true);
        setAppealReason('');
        setAppealVideoFile(null);
        setAppealVideoUrl('');
        setUploadProgress(0);
    }, []);

    const handleCloseAppeal = useCallback(() => {
        setAppealDialogOpen(false);
        setAppealReason('');
        setAppealVideoFile(null);
        setAppealVideoUrl('');
        setUploadProgress(0);
        setUploadingVideo(false);
        setSubmittingAppeal(false);
    }, []);

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
            setAppealVideoFile(file);
            setAppealVideoUrl(uploadedVideoUrl);
        } catch (err) {
            console.error('Upload failed for video:', file.name, err);
        }
        
        event.target.value = '';
    }, [handleVideoUpload]);

    const handleRemoveVideo = useCallback(() => {
        setAppealVideoFile(null);
        setAppealVideoUrl('');
        setUploadProgress(0);
    }, []);

    const handleSubmitAppeal = useCallback(async () => {
        if (!selectedFeedback || !appealReason.trim()) {
            enqueueSnackbar('Please provide a reason for your appeal', {variant: 'error'});
            return;
        }

        // Validate reason length
        if (appealReason.trim().length < 10) {
            enqueueSnackbar('Appeal reason must be at least 10 characters long', {variant: 'error'});
            return;
        }

        if (appealReason.trim().length > 500) {
            enqueueSnackbar('Appeal reason cannot exceed 500 characters', {variant: 'error'});
            return;
        }

        try {
            setSubmittingAppeal(true);
            
            // Prepare payload matching GiveAppealsRequest structure
            const payload = {
                reportId: parseInt(selectedFeedback.id), // Ensure it's integer
                reason: appealReason.trim(),
                videoUrl: appealVideoUrl && appealVideoUrl.trim() !== '' ? appealVideoUrl.trim() : null
            };

            console.log('Submitting appeal with payload:', payload);
            
            // Call appealReport API
            const response = await appealReport(payload);
            
            if (response && response.status === 200) {
                enqueueSnackbar('Appeal submitted successfully! Your appeal will be reviewed by administrators.', {
                    variant: 'success',
                    autoHideDuration: 5000
                });
                handleCloseAppeal();
                
                // Refresh feedbacks to get updated status
                fetchFeedbacks(false);
            } else {
                throw new Error(response?.data?.message || 'Failed to submit appeal');
            }
            
        } catch (error) {
            console.error('Error submitting appeal:', error);
            
            // Handle different error scenarios
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Failed to submit appeal. Please try again.';
            
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 5000
            });
        } finally {
            setSubmittingAppeal(false);
        }
    }, [selectedFeedback, appealReason, appealVideoUrl, handleCloseAppeal, fetchFeedbacks]);



    // Filter feedbacks and reports
    const {feedbacks, reports} = useMemo(() => {
        const feedbacks = allFeedbacks.filter(item => !item.report);
        const reports = allFeedbacks.filter(item => item.report);
        return {feedbacks, reports};
    }, [allFeedbacks]);

    // Statistics
    const stats = useMemo(() => {
        const totalFeedbacks = feedbacks.length;
        const totalReports = reports.length;
        const avgRating = totalFeedbacks > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1) : 0;
        const total = allFeedbacks.length;

        return {total, totalFeedbacks, totalReports, avgRating};
    }, [allFeedbacks, feedbacks, reports]);

    if (loading) {
        return (
            <Box sx={{p: 4}}>
                {/* Header Skeleton */}
                <Box sx={{mb: 4}}>
                    <Skeleton variant="text" width={300} height={40} sx={{mb: 1}}/>
                    <Skeleton variant="text" width={500} height={24}/>
                </Box>

                {/* Stats Skeleton */}
                <Box sx={{display: 'flex', gap: 3, mb: 4}}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rectangular" height={140} sx={{flex: 1, borderRadius: 3}}/>
                    ))}
                </Box>

                {/* Tabs Skeleton */}
                <Skeleton variant="rectangular" height={48} sx={{mb: 3, borderRadius: 1}}/>

                {/* Feedback Cards Skeleton */}
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    {[1, 2, 3].map(i => <FeedbackSkeleton key={i}/>)}
                </Box>
            </Box>
        );
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    return (
        <Box sx={{p: 4}}>
            {/* Header */}
            <Box sx={{mb: 4}}>
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <FactoryIcon sx={{fontSize: 32, mr: 2, color: "#3f51b5"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Feedback & Reports Management
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#64748b",
                        fontSize: "1rem",
                        lineHeight: 1.6
                    }}
                >
                    Review feedback and reports from schools about your garment production quality and service.
                </Typography>
            </Box>

            {/* Statistics */}
            <Box sx={{display: 'flex', gap: 3, mb: 4}}>
                <StatCard
                    icon={<FeedbackIcon sx={{color: "#3f51b5", fontSize: 28}}/>}
                    value={stats.total}
                    label="Total Items"
                    color="#3f51b5"
                    bgColor="#3f51b520"
                />
                <StatCard
                    icon={<CheckCircleIcon sx={{color: "#10b981", fontSize: 28}}/>}
                    value={stats.totalFeedbacks}
                    label="Feedback"
                    color="#10b981"
                    bgColor="#10b98120"
                />
                <StatCard
                    icon={<ReportIcon sx={{color: "#ef4444", fontSize: 28}}/>}
                    value={stats.totalReports}
                    label="Reports"
                    color="#ef4444"
                    bgColor="#ef444420"
                />
                <StatCard
                    icon={<StarIcon sx={{color: "#f59e0b", fontSize: 28}}/>}
                    value={stats.avgRating}
                    label="Avg Rating"
                    color="#f59e0b"
                    bgColor="#f59e0b20"
                />
            </Box>

            {/* Tabs and Content */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                }}
            >
                {/* Tabs */}
                <Box sx={{borderBottom: 1, borderColor: 'divider', backgroundColor: 'white'}}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            px: 3,
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                minHeight: 64
                            }
                        }}
                    >
                        <Tab
                            icon={<FeedbackIcon/>}
                            iconPosition="start"
                            label={`Feedback (${stats.totalFeedbacks})`}
                            id="feedback-tab-0"
                            aria-controls="feedback-tabpanel-0"
                        />
                        <Tab
                            icon={<ReportIcon/>}
                            iconPosition="start"
                            label={`Reports (${stats.totalReports})`}
                            id="feedback-tab-1"
                            aria-controls="feedback-tabpanel-1"
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{backgroundColor: "white"}}>
                    {/* Feedback Tab */}
                    <TabPanel value={activeTab} index={0}>
                        <Box sx={{p: 3}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1e293b"
                                    }}
                                >
                                    Customer Feedback
                                </Typography>
                                <Chip
                                    label={`${stats.totalFeedbacks} Total`}
                                    sx={{
                                        backgroundColor: "#10b98120",
                                        color: "#10b981",
                                        fontWeight: 600
                                    }}
                                />
                            </Box>

                            {feedbacks.length === 0 ? (
                                <EmptyState isReport={false}/>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                    {feedbacks.map((feedback) => (
                                        <FeedbackCard
                                            key={feedback.id}
                                            feedback={feedback}
                                            onImageClick={handleImageClick}
                                            onViewDetail={handleViewDetail}
                                            onAppeal={handleOpenAppeal}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Reports Tab */}
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{p: 3}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1e293b"
                                    }}
                                >
                                    Customer Reports
                                </Typography>
                                <Chip
                                    label={`${stats.totalReports} Total`}
                                    sx={{
                                        backgroundColor: "#ef444420",
                                        color: "#ef4444",
                                        fontWeight: 600
                                    }}
                                />
                            </Box>

                            {reports.length === 0 ? (
                                <EmptyState isReport={true}/>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                    {reports.map((report) => (
                                        <FeedbackCard
                                            key={report.id}
                                            feedback={report}
                                            onImageClick={handleImageClick}
                                            onViewDetail={handleViewDetail}
                                            onAppeal={handleOpenAppeal}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </TabPanel>
                </Box>
            </Paper>

            {/* Image Dialog */}
            <Dialog
                open={imageDialogOpen}
                onClose={handleCloseImageDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white'
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700}}>
                        Feedback Image
                    </Typography>
                    <IconButton onClick={handleCloseImageDialog} sx={{color: 'white'}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 0, textAlign: 'center'}}>
                    {selectedImage && (
                        <DisplayImage
                            imageUrl={selectedImage}
                            alt="Feedback image"
                            style={{maxWidth: '100%', height: 'auto'}}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Feedback/Report Detail Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: selectedFeedback?.report 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {selectedFeedback?.report ? <ReportIcon/> : <FeedbackIcon/>}
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            {selectedFeedback?.report ? 'Report Details' : 'Feedback Details'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseDetail}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4, pb: 2}}>
                    {selectedFeedback && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Header Card */}
                            <Paper elevation={0} sx={{
                                background: selectedFeedback.report 
                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%)'
                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%)',
                                border: selectedFeedback.report 
                                    ? '1px solid rgba(239, 68, 68, 0.1)'
                                    : '1px solid rgba(16, 185, 129, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
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
                                            {selectedFeedback.report ? 'Report' : 'Feedback'} from {selectedFeedback.sender?.name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={parseID(selectedFeedback.id, selectedFeedback.report ? 'rp' : 'fb')}
                                        sx={{
                                            backgroundColor: selectedFeedback.report ? '#fecaca' : '#dcfce7',
                                            color: selectedFeedback.report ? '#dc2626' : '#065f46',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.875rem'}}>
                                    Created: {formatDate(selectedFeedback.creationDate)}
                                </Typography>
                            </Paper>

                            {/* Status Section */}
                            {selectedFeedback.status && (
                                <Paper elevation={0} sx={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                                    p: 3
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Chip
                                            label={selectedFeedback.status}
                                            sx={{
                                                backgroundColor: (() => {
                                                    const status = selectedFeedback.status?.toLowerCase();
                                                    if (status?.includes('approved') || status?.includes('accepted')) return '#10b981';
                                                    if (status?.includes('rejected')) return '#ef4444';
                                                    if (status?.includes('under-review') || status?.includes('pending')) return '#f59e0b';
                                                    return '#6b7280';
                                                })(),
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1rem',
                                                padding: '8px 16px',
                                                transform: 'scale(1.2)',
                                                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            )}

                            {/* User Information */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    User Information
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                                    {selectedFeedback.sender && (
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                Sender
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar
                                                    src={selectedFeedback.sender.avatar}
                                                    sx={{width: 40, height: 40}}
                                                >
                                                    {selectedFeedback.sender.name ? selectedFeedback.sender.name.charAt(0) : 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                        {selectedFeedback.sender.name || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        {selectedFeedback.sender.email}
                                                    </Typography>
                                                    <Chip
                                                        label={selectedFeedback.sender.type}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e0e7ff',
                                                            color: '#3730a3',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem',
                                                            mt: 0.5
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                    {selectedFeedback.receiver && (
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                Receiver
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar
                                                    src={selectedFeedback.receiver.avatar}
                                                    sx={{width: 40, height: 40}}
                                                >
                                                    {selectedFeedback.receiver.name ? selectedFeedback.receiver.name.charAt(0) : 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                        {selectedFeedback.receiver.name || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        {selectedFeedback.receiver.email}
                                                    </Typography>
                                                    <Chip
                                                        label={selectedFeedback.receiver.type}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e0e7ff',
                                                            color: '#3730a3',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem',
                                                            mt: 0.5
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>

                            {/* Related Order */}
                            {selectedFeedback.order && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Related Order
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Avatar sx={{bgcolor: '#3f51b5', width: 40, height: 40}}>
                                                <OrderIcon/>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6"
                                                            sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                    {selectedFeedback.order.selectedDesign?.designRequest?.name || `Order ${parseID(selectedFeedback.order.id, "ord")}`}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                                    {parseID(selectedFeedback.order.id, "ord")}
                                                </Typography>
                                                <Chip
                                                    label={selectedFeedback.order.status}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.7rem',
                                                        mt: 0.5
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<InfoIcon/>}
                                            onClick={handleViewOrderDetail}
                                            sx={{
                                                borderColor: '#3f51b5',
                                                color: '#3f51b5',
                                                '&:hover': {
                                                    borderColor: '#303f9f',
                                                    backgroundColor: '#f3f4f6'
                                                }
                                            }}
                                        >
                                            View Order Details
                                        </Button>
                                    </Box>
                                </Paper>
                            )}

                            {/* Content */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Content
                                </Typography>
                                <Typography variant="body1" sx={{color: '#1e293b', lineHeight: 1.6}}>
                                    {selectedFeedback.content || 'No content provided'}
                                </Typography>
                            </Paper>

                            {/* Rating */}
                            {selectedFeedback.rating && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Rating
                                    </Typography>
                                    <Rating value={selectedFeedback.rating} readOnly size="large"/>
                                    <Typography variant="body2" sx={{color: '#64748b', mt: 1}}>
                                        {selectedFeedback.report
                                            ? 'Severity rating of the reported issue'
                                            : 'User experience rating'
                                        }
                                    </Typography>
                                </Paper>
                            )}

                            {/* Images */}
                            {selectedFeedback.images && selectedFeedback.images.length > 0 && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        {selectedFeedback.report ? 'Evidence Images' : 'Attached Images'} ({selectedFeedback.images.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {selectedFeedback.images.map((image, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={image.id || index}>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '2px solid #e2e8f0',
                                                    position: 'relative'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={image.url}
                                                        alt={`${selectedFeedback.report ? 'Evidence' : 'Feedback'} ${index + 1}`}
                                                        width="100%"
                                                        height="200px"
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {index + 1}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            )}

                            {/* Video Display */}
                            {selectedFeedback.video && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        {selectedFeedback.report ? 'Evidence Video' : 'Attached Video'}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0',
                                        backgroundColor: '#000'
                                    }}>
                                        <video
                                            src={selectedFeedback.video}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: '600px',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseDetail}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog
                open={orderDetailOpen}
                onClose={handleCloseOrderDetail}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <OrderIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Order Details
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseOrderDetail}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedFeedback?.order && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Header Card */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
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
                                            {selectedFeedback.order.selectedDesign?.designRequest?.name || `Order ${parseID(selectedFeedback.order.id, "ord")}`}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={parseID(selectedFeedback.order.id, 'ord')}
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.875rem'}}>
                                    Created: {formatDate(selectedFeedback.order.orderDate)}
                                </Typography>
                            </Paper>

                            {/* Status Section */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
                                border: '2px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                                p: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Chip
                                        label={selectedFeedback.order.status}
                                        sx={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            padding: '8px 16px',
                                            transform: 'scale(1.2)',
                                            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
                                        }}
                                    />
                                </Box>
                            </Paper>

                            {/* Order Summary */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold', 
                                    mb: 2, 
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <InfoIcon sx={{color: '#3f51b5'}}/>
                                    Order Summary
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <OrderIcon sx={{fontSize: 32, color: '#3f51b5', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {parseID(selectedFeedback.order.id, "ord")}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Order ID
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <CalendarTodayIcon sx={{fontSize: 32, color: '#10b981', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {dayjs(selectedFeedback.order.orderDate).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Order Date
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <CalendarTodayIcon sx={{fontSize: 32, color: '#f59e0b', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {dayjs(selectedFeedback.order.deadline).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Deadline
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <MoneyIcon sx={{fontSize: 32, color: '#ef4444', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {selectedFeedback.order.price?.toLocaleString('vi-VN')} VND
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Total Price
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* School Information */}
                            {selectedFeedback.order.school && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold', 
                                        mb: 2, 
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <BusinessIcon sx={{color: '#10b981'}}/>
                                        School Information
                                    </Typography>
                                    <Box sx={{
                                        p: 2,
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Box sx={{display: 'flex', gap: 3}}>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="body2" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem',
                                                    mb: 1
                                                }}>
                                                    School Name
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b'
                                                }}>
                                                    {selectedFeedback.order.school.business}
                                                </Typography>
                                            </Box>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="body2" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem',
                                                    mb: 1
                                                }}>
                                                    Contact Person
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b'
                                                }}>
                                                    {selectedFeedback.order.school.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{flex: 1, display: 'flex', alignItems: 'center', gap: 1}}>
                                                <PhoneIcon sx={{fontSize: 14, color: '#10b981'}}/>
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#10b981',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        Phone
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 'bold', 
                                                        color: '#1e293b'
                                                    }}>
                                                        {selectedFeedback.order.school.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{mt: 2, display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                            <LocationIcon sx={{fontSize: 14, color: '#10b981', mt: 0.2}}/>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem',
                                                    mb: 1
                                                }}>
                                                    Address
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    lineHeight: 1.4
                                                }}>
                                                    {selectedFeedback.order.school.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseOrderDetail}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Appeal Dialog */}
            <Dialog
                open={appealDialogOpen}
                onClose={handleCloseAppeal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <FlagIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Submit Appeal
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseAppeal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedFeedback && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Report Summary */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.08) 100%)',
                                border: '1px solid rgba(245, 158, 11, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Report Summary
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Report ID
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {parseID(selectedFeedback.id, "rp")}
                                        </Typography>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Current Status
                                        </Typography>
                                        <Chip
                                            label={selectedFeedback.status}
                                            sx={{
                                                backgroundColor: (() => {
                                                    const status = selectedFeedback.status?.toLowerCase();
                                                    if (status?.includes('approved') || status?.includes('accepted')) return '#dcfce7';
                                                    if (status?.includes('rejected')) return '#fecaca';
                                                    return '#f1f5f9';
                                                })(),
                                                color: (() => {
                                                    const status = selectedFeedback.status?.toLowerCase();
                                                    if (status?.includes('approved') || status?.includes('accepted')) return '#065f46';
                                                    if (status?.includes('rejected')) return '#dc2626';
                                                    return '#475569';
                                                })(),
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Report Content
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#1e293b', fontStyle: 'italic'}}>
                                        "{selectedFeedback.content}"
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* Appeal Information */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%)',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#dc2626'}}>
                                    ⚠️ Important Notice
                                </Typography>
                                <Typography variant="body2" sx={{color: '#7f1d1d', lineHeight: 1.6}}>
                                    • Appeals must be submitted within the specified timeframe<br/>
                                    • Provide detailed reasons and evidence to support your appeal<br/>
                                    • Video evidence is recommended but optional<br/>
                                    • False appeals may result in penalties
                                </Typography>
                            </Paper>

                            {/* Appeal Reason */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Appeal Reason *
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={appealReason}
                                    onChange={(e) => setAppealReason(e.target.value)}
                                    placeholder="Please explain why you believe this report should be reconsidered. Provide specific details and context..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#d1d5db',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#f59e0b',
                                            },
                                        },
                                    }}
                                />
                                <Typography variant="caption" sx={{
                                    color: appealReason.length < 10 ? '#ef4444' : appealReason.length > 500 ? '#ef4444' : '#64748b', 
                                    mt: 1, 
                                    display: 'block'
                                }}>
                                    {appealReason.length}/500 characters {appealReason.length < 10 && '(minimum 10 characters required)'}
                                </Typography>
                            </Paper>

                            {/* Video Evidence */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Video Evidence (Optional)
                                </Typography>
                                
                                {/* Video Display */}
                                {appealVideoFile && (
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
                                                src={appealVideoUrl}
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
                                                <CloseIcon/>
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{textAlign: 'center', mt: 1, color: '#64748b'}}>
                                            Video: {appealVideoFile.name}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Upload Area */}
                                {!appealVideoFile && (
                                    <Box sx={{
                                        border: '2px dashed #f59e0b',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                        '&:hover': {
                                            borderColor: '#d97706',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)'
                                        }
                                    }}>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            style={{display: 'none'}}
                                            id="appeal-video-upload"
                                            disabled={uploadingVideo}
                                        />
                                        <label htmlFor="appeal-video-upload">
                                            <Box sx={{cursor: 'pointer'}}>
                                                <VideocamIcon sx={{fontSize: 48, color: '#f59e0b', mb: 2}}/>
                                                <Typography variant="h6" sx={{color: '#1e293b', mb: 1}}>
                                                    {uploadingVideo ? `Uploading... ${uploadProgress}%` : 'Upload Video Evidence'}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                                    Upload video evidence to support your appeal (MP4, AVI, MOV, etc.)
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
                                                                    backgroundColor: '#f59e0b',
                                                                    borderRadius: 3
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{color: '#f59e0b', mt: 1, fontWeight: 500}}>
                                                            {uploadProgress}% completed
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </label>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseAppeal}
                        disabled={submittingAppeal}
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
                        onClick={handleSubmitAppeal}
                        disabled={submittingAppeal || !appealReason.trim() || appealReason.trim().length < 10 || appealReason.trim().length > 500}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                            },
                            '&:disabled': {
                                background: '#9ca3af'
                            }
                        }}
                    >
                        {submittingAppeal ? (
                            <>
                                <CircularProgress size={16} sx={{mr: 1, color: 'white'}}/>
                                Submitting...
                            </>
                        ) : (
                            'Submit Appeal'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}