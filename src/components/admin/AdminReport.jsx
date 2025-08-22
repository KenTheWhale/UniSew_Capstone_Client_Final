import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Avatar,
    Rating,
    Divider
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    Feedback as FeedbackIcon,
    Report as ReportIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { getAllReport, approveReport } from '../../services/FeedbackService';
import DisplayImage from '../ui/DisplayImage';
import dayjs from 'dayjs';

export default function AdminReport() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await getAllReport();
            if (response && response.data) {
                setReports(response.data.body || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            enqueueSnackbar('Failed to load reports', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setDetailDialogOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
        setSelectedReport(null);
    };

    const handleApproveReport = async () => {
        if (!selectedReport) return;

        try {
            setApproving(true);
            const payload = {
                reportId: selectedReport.id,
                approved: true
            };

            const response = await approveReport(payload);
            if (response && response.status === 200) {
                enqueueSnackbar('Report approved successfully', { variant: 'success' });
                handleCloseDetail();
                fetchReports(); // Refresh data
            } else {
                enqueueSnackbar('Failed to approve report', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error approving report:', error);
            enqueueSnackbar('Failed to approve report', { variant: 'error' });
        } finally {
            setApproving(false);
        }
    };

    const handleRejectReport = async () => {
        if (!selectedReport) return;

        try {
            setApproving(true);
            const payload = {
                reportId: selectedReport.id,
                approved: false
            };

            const response = await approveReport(payload);
            if (response && response.status === 200) {
                enqueueSnackbar('Report rejected successfully', { variant: 'success' });
                handleCloseDetail();
                fetchReports(); // Refresh data
            } else {
                enqueueSnackbar('Failed to reject report', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error rejecting report:', error);
            enqueueSnackbar('Failed to reject report', { variant: 'error' });
        } finally {
            setApproving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#f59e0b';
            case 'approved':
                return '#10b981';
            case 'rejected':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'pending':
                return '#fef3c7';
            case 'approved':
                return '#d1fae5';
            case 'rejected':
                return '#fee2e2';
            default:
                return '#f3f4f6';
        }
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        approved: reports.filter(r => r.status === 'approved').length,
        rejected: reports.filter(r => r.status === 'rejected').length
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh' 
            }}>
                <Typography variant="h6" sx={{ color: '#64748b' }}>
                    Loading reports...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
            {/* Header Section */}
            <Box 
                sx={{ 
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.1)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "url('/unisew.jpg') center/cover",
                        opacity: 0.15,
                        borderRadius: 3,
                        zIndex: -1
                    }
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AssessmentIcon sx={{ fontSize: 32, mr: 2, color: "#ef4444" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Report Management
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#64748b",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        mb: 3
                    }}
                >
                    Review and manage user reports and feedback across the system.
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AssessmentIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Total Reports
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <WarningIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Pending Review
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {stats.approved}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Approved
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThumbDownIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {stats.rejected}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Rejected
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Reports List */}
            <Paper elevation={0} sx={{ 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                <Box sx={{ p: 3, backgroundColor: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                            All Reports
                        </Typography>
                        <Chip
                            label={`${stats.total} Total`}
                            sx={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {reports.length === 0 ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '2px dashed #cbd5e1'
                        }}>
                            <AssessmentIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                No Reports Found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                There are no reports to review at the moment.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {reports.map((report) => (
                                <Grid item xs={12} key={report.id}>
                                    <Card elevation={0} sx={{ 
                                        borderRadius: 2, 
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ 
                                                        bgcolor: report.isReport ? '#ef4444' : '#10b981',
                                                        width: 40,
                                                        height: 40
                                                    }}>
                                                        {report.isReport ? <ReportIcon /> : <FeedbackIcon />}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                            {report.isReport ? 'Report' : 'Feedback'} #{report.id}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            {report.requestId ? `Design Request #${report.requestId}` : 
                                                             report.orderId ? `Order #${report.orderId}` : 'Unknown Item'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Chip
                                                        label={report.status}
                                                        sx={{
                                                            backgroundColor: getStatusBgColor(report.status),
                                                            color: getStatusColor(report.status),
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewDetail(report)}
                                                        sx={{
                                                            borderColor: '#3b82f6',
                                                            color: '#3b82f6',
                                                            '&:hover': {
                                                                borderColor: '#2563eb',
                                                                backgroundColor: '#eff6ff'
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                    Content:
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#1e293b' }}>
                                                    {report.content}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    {report.rating && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                                Rating:
                                                            </Typography>
                                                            <Rating value={report.rating} readOnly size="small" />
                                                        </Box>
                                                    )}
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        {formatDate(report.creationDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>

            {/* Report Detail Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AssessmentIcon />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Report Details
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
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, pb: 2 }}>
                    {selectedReport && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Report Info */}
                            <Paper elevation={0} sx={{ 
                                p: 3, 
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                    Report Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Type
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {selectedReport.isReport ? 'Report' : 'Feedback'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Status
                                            </Typography>
                                            <Chip
                                                label={selectedReport.status}
                                                sx={{
                                                    backgroundColor: getStatusBgColor(selectedReport.status),
                                                    color: getStatusColor(selectedReport.status),
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Item ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {selectedReport.requestId ? `Design Request #${selectedReport.requestId}` : 
                                                 selectedReport.orderId ? `Order #${selectedReport.orderId}` : 'Unknown'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Created Date
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {formatDate(selectedReport.creationDate)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Content */}
                            <Paper elevation={0} sx={{ 
                                p: 3, 
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                    Content
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#1e293b', lineHeight: 1.6 }}>
                                    {selectedReport.content}
                                </Typography>
                            </Paper>

                            {/* Rating (for both feedback and report) */}
                            {selectedReport.rating && (
                                <Paper elevation={0} sx={{ 
                                    p: 3, 
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Rating
                                    </Typography>
                                    <Rating value={selectedReport.rating} readOnly size="large" />
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                                        {selectedReport.isReport 
                                            ? 'Severity rating of the reported issue'
                                            : 'User experience rating'
                                        }
                                    </Typography>
                                </Paper>
                            )}

                            {/* Image (for reports) */}
                            {selectedReport.isReport && selectedReport.imageUrl && (
                                <Paper elevation={0} sx={{ 
                                    p: 3, 
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Evidence Image
                                    </Typography>
                                    <Box sx={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <DisplayImage
                                            imageUrl={selectedReport.imageUrl}
                                            alt="Report evidence"
                                            width="100%"
                                            height="200px"
                                        />
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
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
                    {selectedReport?.status === 'pending' && (
                        <>
                            <Button
                                onClick={handleRejectReport}
                                disabled={approving}
                                variant="outlined"
                                sx={{
                                    borderColor: '#ef4444',
                                    color: '#ef4444',
                                    '&:hover': {
                                        borderColor: '#dc2626',
                                        backgroundColor: '#fef2f2'
                                    }
                                }}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApproveReport}
                                disabled={approving}
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
                                {approving ? 'Processing...' : 'Approve'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}