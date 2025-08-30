import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Rating,
    Chip,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Button,
    IconButton,
    Tooltip,
    Divider,
    Dialog,
    DialogContent,
    DialogTitle,
    Fade,
    Skeleton,
    Tabs,
    Tab
} from '@mui/material';
import {
    Feedback as FeedbackIcon,
    Star as StarIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarMonth as CalendarIcon,
    ZoomIn as ZoomInIcon,
    Report as ReportIcon
} from '@mui/icons-material';
import { Empty } from 'antd';
import { getFeedbacksByDesigner } from '../../services/FeedbackService.jsx';
import { enqueueSnackbar } from 'notistack';
import DisplayImage from '../ui/DisplayImage.jsx';

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
            return { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' };
        case 'FEEDBACK_PENDING':
            return { color: 'warning', icon: <ScheduleIcon />, label: 'Pending' };
        default:
            return { color: 'default', icon: <FeedbackIcon />, label: status };
    }
};

// StatCard Component
const StatCard = React.memo(({ icon, value, label, color, bgColor }) => (
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
        <CardContent sx={{ textAlign: "center", p: 3 }}>
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
            <Typography variant="h4" sx={{ fontWeight: 700, color, mb: 1 }}>
                {value}
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

// Loading Skeleton
const FeedbackSkeleton = () => (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={56} height={56} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={200} height={24} />
                    <Skeleton variant="text" width={120} height={20} />
                </Box>
                <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 2 }} />
            </Box>
        </CardContent>
    </Card>
);

// FeedbackCard Component
const FeedbackCard = React.memo(({ feedback, onImageClick, isReport = false }) => {
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
            <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                        src={feedback.sender?.avatar}
                        alt={feedback.sender?.name}
                        sx={{ 
                            width: 56, 
                            height: 56,
                                border: isReport ? '3px solid #ef444420' : '3px solid #7c3aed20'
                        }}
                    >
                        <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                            {feedback.sender?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {feedback.sender?.email}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating 
                                value={feedback.rating} 
                                readOnly 
                                size="small"
                                icon={<StarIcon fontSize="inherit" />}
                            />
                            <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                                {feedback.rating}/5
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                            icon={isReport ? <ReportIcon /> : statusConfig.icon}
                            label={isReport ? 'Report' : statusConfig.label}
                            color={isReport ? 'error' : statusConfig.color}
                            variant="outlined"
                            sx={{ mb: 1, fontWeight: 600 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {formatDate(feedback.creationDate)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Content */}
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: '#374151', 
                        lineHeight: 1.6,
                        mb: 2,
                        fontStyle: feedback.content ? 'normal' : 'italic'
                    }}
                >
                    {feedback.content || 'No feedback content provided'}
                </Typography>

                {/* Images */}
                {feedback.images && feedback.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ 
                            color: '#64748b', 
                            mb: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                        }}>
                            <ImageIcon sx={{ fontSize: 18 }} />
                            Attached Images ({feedback.images.length})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                        style={{ objectFit: 'cover' }}
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
                                        <ZoomInIcon sx={{ color: 'white', fontSize: 24 }} />
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
const EmptyState = React.memo(({ isReport = false }) => (
    <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 4
    }}>
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Box>
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                        {isReport ? 'No reports received yet' : 'No feedback received yet'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
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
const ErrorState = React.memo(({ error, onRetry, isRetrying }) => (
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
            <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 600, mb: 2 }}>
                Error Loading Feedback
            </Typography>
            <Typography variant="body1" sx={{ color: '#7f1d1d', mb: 3 }}>
                {error}
            </Typography>
            <Button
                variant="contained"
                onClick={onRetry}
                disabled={isRetrying}
                startIcon={isRetrying ? <CircularProgress size={16} /> : <FeedbackIcon />}
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
const TabPanel = ({ children, value, index, ...other }) => (
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

    // Filter feedbacks and reports
    const { feedbacks, reports } = useMemo(() => {
        const feedbacks = allFeedbacks.filter(item => !item.report);
        const reports = allFeedbacks.filter(item => item.report);
        return { feedbacks, reports };
    }, [allFeedbacks]);

    // Statistics
    const stats = useMemo(() => {
        const total = allFeedbacks.length;
        const totalFeedbacks = feedbacks.length;
        const totalReports = reports.length;
        const approved = feedbacks.filter(f => f.status === 'FEEDBACK_APPROVED').length;
        const pending = feedbacks.filter(f => f.status === 'FEEDBACK_PENDING').length;
        const avgRating = totalFeedbacks > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1) : 0;
        
        return { total, totalFeedbacks, totalReports, approved, pending, avgRating };
    }, [allFeedbacks, feedbacks, reports]);

    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                {/* Header Skeleton */}
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={500} height={24} />
                </Box>
                
                {/* Stats Skeleton */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rectangular" height={140} sx={{ flex: 1, borderRadius: 3 }} />
                    ))}
                </Box>
                
                {/* Tabs Skeleton */}
                <Skeleton variant="rectangular" height={48} sx={{ mb: 3, borderRadius: 1 }} />
                
                {/* Feedback Cards Skeleton */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[1, 2, 3].map(i => <FeedbackSkeleton key={i} />)}
                </Box>
            </Box>
        );
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying} />;
    }

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <FeedbackIcon sx={{ fontSize: 32, mr: 2, color: "#7c3aed" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
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
                    Review and manage feedback from your clients. Track your performance and improve your design services.
                </Typography>
            </Box>

            {/* Statistics */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                <StatCard
                    icon={<FeedbackIcon sx={{ color: "#7c3aed", fontSize: 28 }} />}
                    value={stats.total}
                    label="Total Items"
                    color="#7c3aed"
                    bgColor="#7c3aed20"
                />
                <StatCard
                    icon={<CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />}
                    value={stats.totalFeedbacks}
                    label="Feedback"
                    color="#10b981"
                    bgColor="#10b98120"
                />
                <StatCard
                    icon={<ReportIcon sx={{ color: "#ef4444", fontSize: 28 }} />}
                    value={stats.totalReports}
                    label="Reports"
                    color="#ef4444"
                    bgColor="#ef444420"
                />
                <StatCard
                    icon={<StarIcon sx={{ color: "#f59e0b", fontSize: 28 }} />}
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
                <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
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
                            icon={<FeedbackIcon />}
                            iconPosition="start"
                            label={`Feedback (${stats.totalFeedbacks})`}
                            id="feedback-tab-0"
                            aria-controls="feedback-tabpanel-0"
                        />
                        <Tab 
                            icon={<ReportIcon />}
                            iconPosition="start"
                            label={`Reports (${stats.totalReports})`}
                            id="feedback-tab-1"
                            aria-controls="feedback-tabpanel-1"
                        />
                    </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ backgroundColor: "white" }}>
                    {/* Feedback Tab */}
                    <TabPanel value={activeTab} index={0}>
                        <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                                <EmptyState isReport={false} />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {feedbacks.map((feedback) => (
                                <FeedbackCard
                                    key={feedback.id}
                                    feedback={feedback}
                                    onImageClick={handleImageClick}
                                            isReport={false}
                                />
                            ))}
                        </Box>
                    )}
                        </Box>
                    </TabPanel>

                    {/* Reports Tab */}
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                                <EmptyState isReport={true} />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {reports.map((report) => (
                                        <FeedbackCard
                                            key={report.id}
                                            feedback={report}
                                            onImageClick={handleImageClick}
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
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Feedback Image
                    </Typography>
                    <IconButton onClick={handleCloseImageDialog} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                    {selectedImage && (
                        <DisplayImage
                            imageUrl={selectedImage}
                            alt="Feedback image"
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}