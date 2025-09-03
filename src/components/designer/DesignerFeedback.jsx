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
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Email as EmailIcon,
    Feedback as FeedbackIcon,
    Image as ImageIcon,
    Person as PersonIcon,
    Report as ReportIcon,
    Schedule as ScheduleIcon,
    Star as StarIcon,
    Videocam as VideocamIcon,
    Visibility as VisibilityIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import {Empty} from 'antd';
import {getFeedbacksByDesigner, giveEvidence} from '../../services/FeedbackService.jsx';
import {uploadCloudinaryVideo, uploadCloudinary} from '../../services/UploadImageService.jsx';
import DisplayImage from '../ui/DisplayImage.jsx';
import {enqueueSnackbar} from 'notistack';

// Utility functions
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const getStatusConfig = (status) => {
    switch (status) {
        case 'FEEDBACK_APPROVED':
            return {color: 'success', icon: <CheckCircleIcon/>, label: 'Approved'};
        case 'FEEDBACK_PENDING':
            return {color: 'warning', icon: <ScheduleIcon/>, label: 'Pending'};
        default:
            return {color: 'default', icon: <FeedbackIcon/>, label: status};
    }
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
const FeedbackCard = React.memo(({feedback, onImageClick, onGiveEvidence, onViewDetail, isReport = false}) => {
    const statusConfig = getStatusConfig(feedback.status);

    return (
        <Card
            elevation={0}
            sx={{
                border: isReport ? '1px solid #fecaca' : '1px solid #e2e8f0',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: isReport ? '#ef4444' : '#7c3aed',
                    transform: 'translateY(-2px)',
                    boxShadow: isReport ? '0 8px 25px rgba(239, 68, 68, 0.15)' : '0 8px 25px rgba(124, 58, 237, 0.15)'
                }
            }}
        >
            <CardContent sx={{p: 3}}>
                {/* Header */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                    <Avatar
                        src={feedback.sender?.avatar}
                        alt={feedback.sender?.name}
                        sx={{
                            width: 56,
                            height: 56,
                            border: isReport ? '3px solid #ef444420' : '3px solid #7c3aed20'
                        }}
                    >
                        <PersonIcon/>
                    </Avatar>
                    <Box sx={{flex: 1}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 0.5}}>
                            {feedback.sender?.name}
                        </Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                            <EmailIcon sx={{fontSize: 16, color: '#64748b'}}/>
                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                {feedback.sender?.email}
                            </Typography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Rating
                                value={feedback.rating}
                                readOnly
                                size="small"
                                icon={<StarIcon fontSize="inherit"/>}
                            />
                            <Typography variant="body2" sx={{color: '#f59e0b', fontWeight: 600}}>
                                {feedback.rating}/5
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip
                            icon={isReport ? <ReportIcon/> : statusConfig.icon}
                            label={isReport ? 'Report' : statusConfig.label}
                            color={isReport ? 'error' : statusConfig.color}
                            variant="outlined"
                            sx={{mb: 1, fontWeight: 600}}
                        />
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1}}>
                            <CalendarIcon sx={{fontSize: 16, color: '#64748b'}}/>
                            <Typography variant="caption" sx={{color: '#64748b'}}>
                                {formatDate(feedback.creationDate)}
                            </Typography>
                        </Box>
                        
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end'}}>
                            {/* View Details Button */}
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon/>}
                                onClick={() => onViewDetail(feedback)}
                                sx={{
                                    borderColor: isReport ? '#ef4444' : '#3b82f6',
                                    color: isReport ? '#ef4444' : '#3b82f6',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.5,
                                    '&:hover': {
                                        borderColor: isReport ? '#dc2626' : '#2563eb',
                                        backgroundColor: isReport ? '#fef2f2' : '#eff6ff'
                                    }
                                }}
                            >
                                View Details
                            </Button>
                            
                            {/* Give Evidence Button - Only show for reports where partnerContent is null */}
                            {isReport && !feedback.partnerContent && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CloudUploadIcon/>}
                                    onClick={() => onGiveEvidence(feedback)}
                                    sx={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        px: 2,
                                        py: 0.5,
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                                        }
                                    }}
                                >
                                    Give Evidence
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{my: 2}}/>

                {/* Content */}
                <Typography
                    variant="body1"
                    sx={{
                        color: '#374151',
                        lineHeight: 1.6,
                        mb: 2,
                        fontStyle: feedback.schoolContent ? 'normal' : 'italic'
                    }}
                >
                    {feedback.schoolContent || 'No feedback content provided'}
                </Typography>

                {/* Images */}
                {feedback.images && feedback.images.length > 0 && (
                    <Box sx={{mt: 2}}>
                        <Typography variant="subtitle2" sx={{
                            color: '#64748b',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <ImageIcon sx={{fontSize: 18}}/>
                            Attached Images ({feedback.images.length})
                        </Typography>
                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                            {feedback.images.map((image, index) => (
                                <Box
                                    key={image.id || index}
                                    sx={{
                                        position: 'relative',
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: isReport ? '#ef4444' : '#7c3aed',
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                    onClick={() => onImageClick(image.url)}
                                >
                                    <DisplayImage
                                        imageUrl={image.url}
                                        alt={`Feedback image ${index + 1}`}
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
                                            transition: 'opacity 0.2s ease',
                                            '&:hover': {
                                                opacity: 1,
                                                background: 'rgba(0,0,0,0.5)'
                                            }
                                        }}
                                    >
                                        <ZoomInIcon sx={{color: 'white', fontSize: 24}}/>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
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
                            ? 'Complete more design projects to start receiving reports from clients'
                            : 'Complete more design projects to start receiving feedback from clients'
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
                Error Loading Feedback
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

export default function DesignerFeedback() {
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Detail dialog state
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedDetailFeedback, setSelectedDetailFeedback] = useState(null);
    
    // Give Evidence dialog state
    const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [evidenceContent, setEvidenceContent] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [evidenceVideoFile, setEvidenceVideoFile] = useState(null);
    const [evidenceImageUrls, setEvidenceImageUrls] = useState([]);
    const [evidenceVideoUrl, setEvidenceVideoUrl] = useState('');
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [evidenceUploadProgress, setEvidenceUploadProgress] = useState(0);
    const [submittingEvidence, setSubmittingEvidence] = useState(false);
    const [evidenceUploadType, setEvidenceUploadType] = useState('image'); // 'image' or 'video'

    const fetchFeedbacks = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await getFeedbacksByDesigner();

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
        setSelectedDetailFeedback(feedback);
        setDetailDialogOpen(true);
    }, []);
    
    const handleCloseDetail = useCallback(() => {
        setDetailDialogOpen(false);
        setSelectedDetailFeedback(null);
    }, []);
    
    // Give Evidence handlers
    const handleOpenGiveEvidence = useCallback((feedback) => {
        setSelectedFeedback(feedback);
        setEvidenceDialogOpen(true);
        setEvidenceContent('');
        setEvidenceFiles([]);
        setEvidenceVideoFile(null);
        setEvidenceImageUrls([]);
        setEvidenceVideoUrl('');
        setEvidenceUploadProgress(0);
        setEvidenceUploadType('image');
    }, []);
    
    const handleCloseGiveEvidence = useCallback(() => {
        setEvidenceDialogOpen(false);
        setSelectedFeedback(null);
        setEvidenceContent('');
        setEvidenceFiles([]);
        setEvidenceVideoFile(null);
        setEvidenceImageUrls([]);
        setEvidenceVideoUrl('');
        setEvidenceUploadProgress(0);
        setUploadingEvidence(false);
        setSubmittingEvidence(false);
        setEvidenceUploadType('image');
    }, []);
    
    // Evidence upload handlers
    const handleEvidenceImageUpload = useCallback(async (files) => {
        if (!files || files.length === 0) {
            console.log('No files provided for upload');
            return;
        }
        
        console.log('Starting image upload for', files.length, 'files');
        
        try {
            setUploadingEvidence(true);
            setEvidenceUploadProgress(0);
            const uploadedUrls = [];
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Uploading file ${i + 1}/${files.length}:`, file.name, 'Size:', file.size);
                
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    enqueueSnackbar(`File ${file.name} is too large. Maximum size is 10MB.`, {variant: 'error'});
                    continue;
                }
                
                const result = await uploadCloudinary(file);
                console.log(`Upload result for ${file.name}:`, result);
                
                // Update progress manually
                const progress = ((i + 1) / files.length) * 100;
                setEvidenceUploadProgress(Math.round(progress));
                
                if (result) {
                    uploadedUrls.push(result);
                    console.log(`Successfully uploaded: ${file.name} -> ${result}`);
                } else {
                    console.error(`Failed to upload: ${file.name}`);
                    enqueueSnackbar(`Failed to upload ${file.name}`, {variant: 'warning'});
                }
            }
            
            console.log('All uploads completed. URLs:', uploadedUrls);
            // Append new URLs to existing ones instead of replacing
            setEvidenceImageUrls(prev => [...prev, ...uploadedUrls]);
            setEvidenceUploadProgress(100);
            
            if (uploadedUrls.length > 0) {
                enqueueSnackbar(`${uploadedUrls.length} image(s) uploaded successfully!`, {variant: 'success'});
            } else {
                enqueueSnackbar('No images were uploaded successfully.', {variant: 'error'});
            }
            
        } catch (error) {
            console.error('Error uploading images:', error);
            enqueueSnackbar('Failed to upload images. Please try again.', {variant: 'error'});
        } finally {
            setUploadingEvidence(false);
        }
    }, []);
    
    const handleEvidenceVideoUpload = useCallback(async (file) => {
        if (!file) {
            console.log('No video file provided for upload');
            return;
        }
        
        console.log('Starting video upload:', file.name, 'Size:', file.size);
        
        try {
            setUploadingEvidence(true);
            setEvidenceUploadProgress(0);
            
            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                enqueueSnackbar(`Video file is too large. Maximum size is 50MB.`, {variant: 'error'});
                return;
            }
            
            const result = await uploadCloudinaryVideo(file, (progress) => {
                console.log('Video upload progress:', progress);
                setEvidenceUploadProgress(progress);
            });
            
            console.log('Video upload result:', result);
            
            if (result) {
                setEvidenceVideoUrl(result);
                enqueueSnackbar('Video uploaded successfully!', {variant: 'success'});
            } else {
                enqueueSnackbar('Failed to upload video. Please try again.', {variant: 'error'});
            }
            
        } catch (error) {
            console.error('Error uploading video:', error);
            enqueueSnackbar('Failed to upload video. Please try again.', {variant: 'error'});
        } finally {
            setUploadingEvidence(false);
        }
    }, []);
    
    const handleSubmitEvidence = useCallback(async () => {
        if (!selectedFeedback) return;
        
        // Validation
        if (!evidenceContent.trim()) {
            enqueueSnackbar('Please provide evidence content', {variant: 'error'});
            return;
        }
        
        if (evidenceUploadType === 'image' && evidenceImageUrls.length === 0) {
            enqueueSnackbar('Please upload at least one image as evidence', {variant: 'error'});
            return;
        }
        
        if (evidenceUploadType === 'video' && !evidenceVideoUrl) {
            enqueueSnackbar('Please upload a video as evidence', {variant: 'error'});
            return;
        }
        
        try {
            setSubmittingEvidence(true);
            
            // Prepare payload matching GiveEvidenceRequest structure
            const payload = {
                reportId: parseInt(selectedFeedback.id),
                content: evidenceContent.trim(),
                imageUrls: evidenceUploadType === 'image' ? evidenceImageUrls : [],
                videoUrl: evidenceUploadType === 'video' ? evidenceVideoUrl : null
            };
            
            console.log('Submitting evidence with payload:', payload);
            
            const response = await giveEvidence(payload);
            
            if (response && response.status === 200) {
                enqueueSnackbar('Evidence submitted successfully!', {
                    variant: 'success',
                    autoHideDuration: 5000
                });
                handleCloseGiveEvidence();
                
                // Refresh feedbacks to get updated status
                fetchFeedbacks(false);
            } else {
                throw new Error(response?.data?.message || 'Failed to submit evidence');
            }
            
        } catch (error) {
            console.error('Error submitting evidence:', error);
            
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Failed to submit evidence. Please try again.';
            
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 5000
            });
        } finally {
            setSubmittingEvidence(false);
        }
    }, [selectedFeedback, evidenceContent, evidenceUploadType, evidenceImageUrls, evidenceVideoUrl, handleCloseGiveEvidence, fetchFeedbacks]);

    // Filter feedbacks and reports
    const {feedbacks, reports} = useMemo(() => {
        const feedbacks = allFeedbacks.filter(item => !item.report);
        const reports = allFeedbacks.filter(item => item.report);
        return {feedbacks, reports};
    }, [allFeedbacks]);

    // Statistics
    const stats = useMemo(() => {
        const total = allFeedbacks.length;
        const totalFeedbacks = feedbacks.length;
        const totalReports = reports.length;
        const approved = feedbacks.filter(f => f.status === 'FEEDBACK_APPROVED').length;
        const pending = feedbacks.filter(f => f.status === 'FEEDBACK_PENDING').length;
        const avgRating = totalFeedbacks > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1) : 0;

        return {total, totalFeedbacks, totalReports, approved, pending, avgRating};
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
                    <FeedbackIcon sx={{fontSize: 32, mr: 2, color: "#7c3aed"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Feedback Management
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
                    Review and manage feedback from your clients. Track your performance and improve your design
                    services.
                </Typography>
            </Box>

            {/* Statistics */}
            <Box sx={{display: 'flex', gap: 3, mb: 4}}>
                <StatCard
                    icon={<FeedbackIcon sx={{color: "#7c3aed", fontSize: 28}}/>}
                    value={stats.total}
                    label="Total Items"
                    color="#7c3aed"
                    bgColor="#7c3aed20"
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
                                    Client Feedback
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
                                            onGiveEvidence={handleOpenGiveEvidence}
                                            onViewDetail={handleViewDetail}
                                            isReport={false}
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
                                    Client Reports
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
                                            onGiveEvidence={handleOpenGiveEvidence}
                                            onViewDetail={handleViewDetail}
                                            isReport={true}
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
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
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

            {/* Give Evidence Dialog */}
            <Dialog
                open={evidenceDialogOpen}
                onClose={handleCloseGiveEvidence}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <CloudUploadIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Provide Evidence
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseGiveEvidence}
                        disabled={submittingEvidence}
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
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Report Details
                                </Typography>
                                <Box>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Report Content:
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#1e293b', fontStyle: 'italic'}}>
                                        "{selectedFeedback.schoolContent || selectedFeedback.content}"
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* Evidence Content */}
                            <Box>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Evidence Description (Required)
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={evidenceContent}
                                    onChange={(e) => setEvidenceContent(e.target.value)}
                                    placeholder="Provide detailed explanation of your evidence..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#d1d5db',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#10b981',
                                            },
                                        },
                                    }}
                                />
                                <Typography variant="body2" sx={{color: '#64748b', mt: 1, fontStyle: 'italic'}}>
                                    Explain how your evidence addresses the report concerns.
                                </Typography>
                            </Box>

                            {/* Upload Type Selection */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f0fdf4',
                                borderRadius: 2,
                                border: '1px solid #bbf7d0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#065f46'}}>
                                    Evidence Type
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                                    <Button
                                        variant={evidenceUploadType === 'image' ? 'contained' : 'outlined'}
                                        startIcon={<ImageIcon/>}
                                        onClick={() => {
                                            setEvidenceUploadType('image');
                                            setEvidenceVideoFile(null);
                                            setEvidenceVideoUrl('');
                                        }}
                                        disabled={uploadingEvidence}
                                        sx={{
                                            backgroundColor: evidenceUploadType === 'image' ? '#10b981' : 'transparent',
                                            borderColor: '#10b981',
                                            color: evidenceUploadType === 'image' ? 'white' : '#10b981',
                                            '&:hover': {
                                                backgroundColor: evidenceUploadType === 'image' ? '#059669' : '#f0fdf4',
                                                borderColor: '#059669'
                                            }
                                        }}
                                    >
                                        Upload Multiple Images
                                    </Button>
                                    <Button
                                        variant={evidenceUploadType === 'video' ? 'contained' : 'outlined'}
                                        startIcon={<VideocamIcon/>}
                                        onClick={() => {
                                            setEvidenceUploadType('video');
                                            setEvidenceFiles([]);
                                            setEvidenceImageUrls([]);
                                        }}
                                        disabled={uploadingEvidence}
                                        sx={{
                                            backgroundColor: evidenceUploadType === 'video' ? '#10b981' : 'transparent',
                                            borderColor: '#10b981',
                                            color: evidenceUploadType === 'video' ? 'white' : '#10b981',
                                            '&:hover': {
                                                backgroundColor: evidenceUploadType === 'video' ? '#059669' : '#f0fdf4',
                                                borderColor: '#059669'
                                            }
                                        }}
                                    >
                                        Upload Video
                                    </Button>
                                </Box>

                                {/* Image Upload */}
                                {evidenceUploadType === 'image' && (
                                    <Box>
                                        <input
                                            id="evidence-image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            style={{display: 'none'}}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                    // Thêm files mới vào danh sách hiện tại
                                                    const newFiles = [...evidenceFiles, ...files];
                                                    setEvidenceFiles(newFiles);
                                                    handleEvidenceImageUpload(files); // Chỉ upload files mới
                                                }
                                                e.target.value = ''; // Reset input để có thể chọn lại cùng file
                                            }}
                                            disabled={uploadingEvidence}
                                        />
                                        <label htmlFor="evidence-image-upload">
                                            <Box sx={{
                                                border: '2px dashed #bbf7d0',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: uploadingEvidence ? 'not-allowed' : 'pointer',
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    borderColor: uploadingEvidence ? '#bbf7d0' : '#059669',
                                                    backgroundColor: uploadingEvidence ? 'white' : '#f0fdf4'
                                                }
                                            }}>
                                                <CloudUploadIcon sx={{fontSize: 48, color: '#10b981', mb: 2}}/>
                                                <Typography variant="h6" sx={{color: '#065f46', mb: 1}}>
                                                    {uploadingEvidence ? 'Uploading...' : 'Click to upload multiple images'}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#047857'}}>
                                                    Support: JPG, PNG, GIF (Max 10MB each) • Multiple files allowed
                                                </Typography>

                                                {/* Uploaded Images Preview */}
                                                {evidenceImageUrls.length > 0 && (
                                                    <Box sx={{mt: 2}}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                                                            <Typography variant="body2" sx={{color: '#059669', fontWeight: 600}}>
                                                                ✓ {evidenceImageUrls.length} image(s) uploaded
                                                            </Typography>
                                                            <Box sx={{display: 'flex', gap: 1}}>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<CloudUploadIcon />}
                                                                    onClick={() => document.getElementById('evidence-image-upload').click()}
                                                                    disabled={uploadingEvidence}
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        minWidth: 'auto',
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderColor: '#10b981',
                                                                        color: '#10b981',
                                                                        '&:hover': {
                                                                            borderColor: '#059669',
                                                                            backgroundColor: '#f0fdf4'
                                                                        }
                                                                    }}
                                                                >
                                                                    Add More
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<CloseIcon />}
                                                                    onClick={() => {
                                                                        setEvidenceImageUrls([]);
                                                                        setEvidenceFiles([]);
                                                                    }}
                                                                    disabled={uploadingEvidence}
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        minWidth: 'auto',
                                                                        px: 1,
                                                                        py: 0.5
                                                                    }}
                                                                >
                                                                    Remove All
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center'}}>
                                                            {evidenceImageUrls.map((url, index) => (
                                                                <Box key={index} sx={{
                                                                    position: 'relative',
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden',
                                                                    border: '2px solid #10b981',
                                                                    cursor: 'pointer',
                                                                    '&:hover .remove-btn': {
                                                                        opacity: 1
                                                                    }
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={url}
                                                                        alt={`Evidence ${index + 1}`}
                                                                        width="80px"
                                                                        height="80px"
                                                                    />
                                                                    <IconButton
                                                                        className="remove-btn"
                                                                        size="small"
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 2,
                                                                            right: 2,
                                                                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                                                            color: 'white',
                                                                            width: 20,
                                                                            height: 20,
                                                                            opacity: 0,
                                                                            transition: 'opacity 0.2s',
                                                                            '&:hover': {
                                                                                backgroundColor: '#dc2626'
                                                                            }
                                                                        }}
                                                                        onClick={() => {
                                                                            const newUrls = evidenceImageUrls.filter((_, i) => i !== index);
                                                                            setEvidenceImageUrls(newUrls);
                                                                        }}
                                                                        disabled={uploadingEvidence}
                                                                    >
                                                                        <CloseIcon sx={{fontSize: 14}} />
                                                                    </IconButton>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Upload Progress */}
                                                {uploadingEvidence && (
                                                    <Box sx={{mt: 2}}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={evidenceUploadProgress}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: '#d1fae5',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: '#10b981',
                                                                    borderRadius: 4
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{color: '#059669', mt: 1, fontWeight: 500}}>
                                                            {evidenceUploadProgress}% uploaded
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </label>
                                    </Box>
                                )}

                                {/* Video Upload */}
                                {evidenceUploadType === 'video' && (
                                    <Box>
                                        <input
                                            id="evidence-video-upload"
                                            type="file"
                                            accept="video/*"
                                            style={{display: 'none'}}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEvidenceVideoFile(file);
                                                    handleEvidenceVideoUpload(file);
                                                }
                                                e.target.value = ''; // Reset input để có thể chọn lại cùng file
                                            }}
                                            disabled={uploadingEvidence}
                                        />
                                        <label htmlFor="evidence-video-upload">
                                            <Box sx={{
                                                border: '2px dashed #bbf7d0',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: uploadingEvidence ? 'not-allowed' : 'pointer',
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    borderColor: uploadingEvidence ? '#bbf7d0' : '#059669',
                                                    backgroundColor: uploadingEvidence ? 'white' : '#f0fdf4'
                                                }
                                            }}>
                                                <VideocamIcon sx={{fontSize: 48, color: '#10b981', mb: 2}}/>
                                                <Typography variant="h6" sx={{color: '#065f46', mb: 1}}>
                                                    {uploadingEvidence ? 'Uploading...' : 'Click to upload video'}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#047857'}}>
                                                    Support: MP4, AVI, MOV (Max 50MB)
                                                </Typography>

                                                {/* Uploaded Video Preview */}
                                                {evidenceVideoUrl && (
                                                    <Box sx={{mt: 2}}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                                                            <Typography variant="body2" sx={{color: '#059669', fontWeight: 600}}>
                                                                ✓ Video uploaded successfully
                                                            </Typography>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<CloseIcon />}
                                                                onClick={() => {
                                                                    setEvidenceVideoUrl('');
                                                                    setEvidenceVideoFile(null);
                                                                }}
                                                                disabled={uploadingEvidence}
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    minWidth: 'auto',
                                                                    px: 1,
                                                                    py: 0.5
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Box>
                                                        <Box sx={{
                                                            maxWidth: 400,
                                                            mx: 'auto',
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            border: '2px solid #10b981'
                                                        }}>
                                                            <video
                                                                controls
                                                                style={{
                                                                    width: '100%',
                                                                    height: 'auto',
                                                                    display: 'block'
                                                                }}
                                                                preload="metadata"
                                                            >
                                                                <source src={evidenceVideoUrl} type="video/mp4" />
                                                                <source src={evidenceVideoUrl} type="video/webm" />
                                                                <source src={evidenceVideoUrl} type="video/ogg" />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Upload Progress */}
                                                {uploadingEvidence && (
                                                    <Box sx={{mt: 2}}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={evidenceUploadProgress}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: '#d1fae5',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: '#10b981',
                                                                    borderRadius: 4
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{color: '#059669', mt: 1, fontWeight: 500}}>
                                                            {evidenceUploadProgress}% uploaded
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </label>
                                    </Box>
                                )}
                            </Paper>

                            {/* Important Notice */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#047857'}}>
                                    📝 Important Guidelines
                                </Typography>
                                <Typography variant="body2" sx={{color: '#065f46', lineHeight: 1.6}}>
                                    • Provide clear and relevant evidence that addresses the report concerns<br/>
                                    • Upload either images OR video, not both<br/>
                                    • Ensure your evidence is high quality and clearly visible<br/>
                                    • Be honest and transparent in your response
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseGiveEvidence}
                        disabled={submittingEvidence}
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
                        onClick={handleSubmitEvidence}
                        disabled={
                            submittingEvidence || 
                            !evidenceContent.trim() || 
                            (evidenceUploadType === 'image' && evidenceImageUrls.length === 0) ||
                            (evidenceUploadType === 'video' && !evidenceVideoUrl) ||
                            uploadingEvidence
                        }
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            '&:disabled': {
                                background: '#9ca3af'
                            }
                        }}
                    >
                        {submittingEvidence ? (
                            <>
                                <CircularProgress size={16} sx={{mr: 1, color: 'white'}}/>
                                Submitting...
                            </>
                        ) : (
                            'Submit Evidence'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail Dialog */}
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
                    background: selectedDetailFeedback?.report 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {selectedDetailFeedback?.report ? <ReportIcon/> : <FeedbackIcon/>}
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            {selectedDetailFeedback?.report ? 'Report Details' : 'Feedback Details'}
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

                <DialogContent sx={{p: 4}}>
                    {selectedDetailFeedback && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Sender Information */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    From School
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Avatar
                                        src={selectedDetailFeedback.sender?.avatar}
                                        alt={selectedDetailFeedback.sender?.name}
                                        sx={{width: 56, height: 56}}
                                    >
                                        <PersonIcon/>
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {selectedDetailFeedback.sender?.name || 'Anonymous'}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            {selectedDetailFeedback.sender?.email || 'No email provided'}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Created: {formatDate(selectedDetailFeedback.creationDate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Content */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    {selectedDetailFeedback.report ? 'Report Content' : 'Feedback Content'}
                                </Typography>
                                <Typography variant="body1" sx={{color: '#1e293b', lineHeight: 1.6}}>
                                    {selectedDetailFeedback.schoolContent || selectedDetailFeedback.content || 'No content provided'}
                                </Typography>
                            </Paper>

                            {/* Rating (only for feedback, not reports) */}
                            {!selectedDetailFeedback.report && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Rating
                                    </Typography>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <Rating
                                            value={selectedDetailFeedback.rating}
                                            readOnly
                                            size="large"
                                            icon={<StarIcon fontSize="inherit"/>}
                                        />
                                        <Typography variant="h6" sx={{color: '#f59e0b', fontWeight: 600}}>
                                            {selectedDetailFeedback.rating}/5
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            {/* Images */}
                            {selectedDetailFeedback.images && selectedDetailFeedback.images.length > 0 && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        {selectedDetailFeedback.report ? 'School Evidence Images' : 'Attached Images'} ({selectedDetailFeedback.images.length})
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                        {selectedDetailFeedback.images.map((image, index) => (
                                            <Box
                                                key={image.id || index}
                                                sx={{
                                                    position: 'relative',
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '2px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: selectedDetailFeedback.report ? '#ef4444' : '#7c3aed',
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                                onClick={() => handleImageClick(image.url)}
                                            >
                                                <DisplayImage
                                                    imageUrl={image.url}
                                                    alt={`Image ${index + 1}`}
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
                                                        transition: 'opacity 0.2s ease',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            background: 'rgba(0,0,0,0.5)'
                                                        }
                                                    }}
                                                >
                                                    <ZoomInIcon sx={{color: 'white', fontSize: 32}}/>
                                                </Box>
                                                <Box
                                                    sx={{
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
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            )}

                            {/* Additional Single Image (fallback for older data structure) */}
                            {selectedDetailFeedback.report && !selectedDetailFeedback.images && selectedDetailFeedback.imageUrl && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        School Evidence Image
                                    </Typography>
                                    <Box sx={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: '#ef4444',
                                            transform: 'scale(1.02)'
                                        }
                                    }}
                                    onClick={() => handleImageClick(selectedDetailFeedback.imageUrl)}
                                    >
                                        <DisplayImage
                                            imageUrl={selectedDetailFeedback.imageUrl}
                                            alt="Report evidence"
                                            width="100%"
                                            height="200px"
                                            style={{objectFit: 'cover'}}
                                        />
                                    </Box>
                                </Paper>
                            )}

                            {/* School Video (if exists) */}
                            {selectedDetailFeedback.schoolVideo && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        School Video Evidence
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
                                            src={selectedDetailFeedback.schoolVideo}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: '600px',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error('School video failed to load:', e);
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">School video failed to load</div>';
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mt: 2,
                                        p: 2,
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}>
                                        <VideocamIcon sx={{color: '#3b82f6', fontSize: 20}}/>
                                        <Typography variant="body2" sx={{color: '#1e40af', fontWeight: 500}}>
                                            Video evidence from school
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            {/* Partner Response (if exists) */}
                            {selectedDetailFeedback.partnerContent && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: 2,
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#065f46'}}>
                                        Your Response
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#047857', lineHeight: 1.6, mb: 2}}>
                                        {selectedDetailFeedback.partnerContent}
                                    </Typography>
                                    
                                    {/* Partner Evidence Images */}
                                    {selectedDetailFeedback.partnerImageUrls && selectedDetailFeedback.partnerImageUrls.length > 0 && (
                                        <Box sx={{mt: 2}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 2, color: '#065f46'}}>
                                                Evidence Images ({selectedDetailFeedback.partnerImageUrls.length})
                                            </Typography>
                                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                {selectedDetailFeedback.partnerImageUrls.map((imageUrl, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            position: 'relative',
                                                            width: 120,
                                                            height: 120,
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            border: '2px solid #10b981',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                borderColor: '#059669',
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                        onClick={() => handleImageClick(imageUrl)}
                                                    >
                                                        <DisplayImage
                                                            imageUrl={imageUrl}
                                                            alt={`Evidence image ${index + 1}`}
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
                                                                transition: 'opacity 0.2s ease',
                                                                '&:hover': {
                                                                    opacity: 1,
                                                                    background: 'rgba(0,0,0,0.5)'
                                                                }
                                                            }}
                                                        >
                                                            <ZoomInIcon sx={{color: 'white', fontSize: 32}}/>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    {/* Partner Evidence Video */}
                                    {selectedDetailFeedback.partnerVideo && (
                                        <Box sx={{mt: 2}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 2, color: '#065f46'}}>
                                                Evidence Video
                                            </Typography>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: '2px solid #10b981',
                                                backgroundColor: '#000'
                                            }}>
                                                <video
                                                    src={selectedDetailFeedback.partnerVideo}
                                                    controls
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '600px',
                                                        height: 'auto',
                                                        maxHeight: '400px',
                                                        objectFit: 'contain'
                                                    }}
                                                    preload="metadata"
                                                    onError={(e) => {
                                                        console.error('Partner video failed to load:', e);
                                                        console.log('Video URL:', selectedDetailFeedback.partnerVideo);
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Partner video failed to load</div>';
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                                mt: 2,
                                                p: 2,
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}>
                                                <VideocamIcon sx={{color: '#10b981', fontSize: 20}}/>
                                                <Typography variant="body2" sx={{color: '#065f46', fontWeight: 500}}>
                                                    Evidence video from designer
                                                </Typography>
                                            </Box>
                                            
                                            {/* Fallback link if video doesn't load */}
                                            <Typography variant="caption" sx={{color: '#64748b', mt: 1, display: 'block', textAlign: 'center'}}>
                                                Can't play video? <a href={selectedDetailFeedback.partnerVideo} target="_blank" rel="noopener noreferrer" style={{color: '#10b981'}}>Open in new tab</a>
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={handleCloseDetail}
                        variant="outlined"
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
        </Box>
    );
}