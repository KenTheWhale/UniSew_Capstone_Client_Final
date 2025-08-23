import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Tooltip, 
    Paper,
    Card,
    CardContent,
    Chip,
    CircularProgress
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Table, Space, Empty } from 'antd';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ReportIcon from '@mui/icons-material/Report';
import 'antd/dist/reset.css';
import RequestDetailPopup, { statusTag } from './dialog/RequestDetailPopup.jsx';
import FindingDesignerPopup from './dialog/FindingDesignerPopup.jsx';
import DesignPaymentPopup from './dialog/DesignPaymentPopup.jsx';
import { enqueueSnackbar } from 'notistack';
import FeedbackReportPopup from '../popup/FeedbackReportPopup.jsx';
import { useNavigate } from 'react-router-dom';
import {getSchoolDesignRequests} from "../../../services/DesignService.jsx";
import { parseID } from "../../../utils/ParseIDUtil.jsx";

// Constants
const STATUS_COLORS = {
    completed: '#2e7d32',
    processing: '#7c3aed',
    canceled: '#d32f2f'
};

const TABLE_PAGE_SIZE_OPTIONS = ['5', '10'];

// Utility function for date formatting
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// StatCard Component
const StatCard = React.memo(({ icon, value, label, color, bgColor }) => (
    <Card
        elevation={0}
        sx={{
            flex: 1,
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
                borderColor: color,
                transform: "translateY(-2px)",
                boxShadow: `0 4px 15px ${color}20`
            }
        }}
    >
        <CardContent sx={{ textAlign: "center", p: 2 }}>
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5
                }}
            >
                {icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

// Loading State Component
const LoadingState = React.memo(() => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3
    }}>
        <CircularProgress size={60} sx={{color: '#2e7d32'}}/>
        <Typography variant="h6" sx={{color: '#1e293b', fontWeight: 600}}>
            Loading Design Requests...
        </Typography>
    </Box>
));

// Error State Component
const ErrorState = React.memo(({error, onRetry, isRetrying}) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3
    }}>
        <Box sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 2,
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
                startIcon={isRetrying ? <CircularProgress size={16}/> : <RefreshIcon/>}
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

// Empty State Component
const EmptyState = React.memo(() => (
    <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 4
    }}>
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Typography variant="body1" sx={{color: '#64748b', mt: 2}}>
                    No design requests available
                </Typography>
            }
        />
    </Box>
));

export default function SchoolDesign() {
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    const navigate = useNavigate();
    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const FetchSchoolDesign = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);
            const response = await getSchoolDesignRequests();
            if(response && response.status === 200){
                console.log("Design request: ", response.data.body);
                const newData = response.data.body || [];
                setDesignRequests(newData);
            } else {
                setError('Failed to fetch design requests');
            }
        } catch (error) {
            console.error("Error fetching design requests:", error);
            setError("Failed to load design requests");
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, []);

    useEffect(() => {
        FetchSchoolDesign();
    }, [FetchSchoolDesign]);

    // Refresh data when user returns from other pages
    useEffect(() => {
        const handleFocus = () => {
            FetchSchoolDesign(false);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [FetchSchoolDesign]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        FetchSchoolDesign();
    }, [FetchSchoolDesign]);

    const handleRefresh = useCallback(() => {
        FetchSchoolDesign(false);
    }, [FetchSchoolDesign]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentRequestDetails, setPaymentRequestDetails] = useState(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedRequestForFeedback, setSelectedRequestForFeedback] = useState(null);

    // Memoized filtered data - now includes all requests
    const filteredDesignRequests = useMemo(() => 
        designRequests, // Show all requests including pending
        [designRequests]
    );

    // Memoized statistics
    const stats = useMemo(() => {
        const total = filteredDesignRequests.length;
        const pending = filteredDesignRequests.filter(req => req.status === 'pending').length;
        const completed = filteredDesignRequests.filter(req => req.status === 'completed').length;
        const processing = filteredDesignRequests.filter(req => req.status === 'processing').length;
        const canceled = filteredDesignRequests.filter(req => req.status === 'canceled').length;
        
        return { total, pending, completed, processing, canceled };
    }, [filteredDesignRequests]);

    const handleViewDetail = useCallback((id) => {
        const request = designRequests.find(req => req.id === id);
        setSelectedRequest(request);

        // Only open FindingDesignerPopup for 'pending' status
        if (request.status === 'pending') {
            setPaymentRequestDetails(null);
            setIsPaymentModalVisible(false);
            setIsModalVisible(true);
        } else {
            // For non-pending requests, open RequestDetailPopup
            setIsModalVisible(true);
        }
    }, [designRequests]);

    const handleCreateDesignRequest = useCallback(() => {
        navigate('/school/request/create');
    }, [navigate]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    }, []);

    const handleCloseDesignerModal = useCallback(() => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    }, []);

    const handleClosePaymentModal = useCallback(() => {
        setIsPaymentModalVisible(false);
        setPaymentRequestDetails(null);
    }, []);

    const handleOpenFeedback = useCallback((request) => {
        // Only allow feedback for completed requests
        if (request.status !== 'completed') {
            enqueueSnackbar('Feedback is only available for completed requests', { variant: 'warning' });
            return;
        }
        // Only allow feedback once per request
        if (request.feedback) {
            enqueueSnackbar('Feedback has already been submitted for this request', { variant: 'warning' });
            return;
        }
        setSelectedRequestForFeedback(request);
        setIsFeedbackModalVisible(true);
    }, []);

    const handleOpenReport = useCallback((request) => {
        // Don't allow report for pending requests
        if (request.status === 'pending') {
            enqueueSnackbar('Report is not available for pending requests', { variant: 'warning' });
            return;
        }
        // Don't allow report for requests that already have feedback
        if (request.feedback) {
            enqueueSnackbar('Report is not available for requests that already have feedback', { variant: 'warning' });
            return;
        }
        setSelectedRequestForFeedback(request);
        setIsReportModalVisible(true);
    }, []);

    const handleCloseFeedbackModal = useCallback(() => {
        setIsFeedbackModalVisible(false);
        setSelectedRequestForFeedback(null);
    }, []);

    const handleCloseReportModal = useCallback(() => {
        setIsReportModalVisible(false);
        setSelectedRequestForFeedback(null);
    }, []);

    const handleFeedbackSuccess = useCallback(() => {
        FetchSchoolDesign(); // Refresh data after successful feedback
    }, [FetchSchoolDesign]);

    // Memoized table columns
    const columns = useMemo(() => [
        {
            title: 'Request ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            filters: [...new Set(filteredDesignRequests.map(request => request.status))].map(status => ({ text: status, value: status })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => statusTag(text),
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 200,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569', fontSize: '0.875rem'}}>
                            {`${day}/${month}/${year}`}
                        </Typography>
                        <Typography variant="caption"
                                    sx={{color: daysDiff > 30 ? '#dc2626' : '#64748b', fontSize: '0.75rem'}}>
                            {daysDiff < 1 ? 'Today' : `${daysDiff} days ago`}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            minWidth: 200,
            ellipsis: true,
            render: (text) => (
                <Typography
                    variant="body2"
                    sx={{
                        color: '#1e293b',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <IconButton 
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#e3f2fd',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={
                        record.status !== 'completed' ? "Feedback only available for completed requests" :
                        record.feedback ? "Feedback already submitted" :
                        "Give Feedback"
                    }>
                        <IconButton
                            onClick={() => handleOpenFeedback(record)}
                            disabled={record.status !== 'completed' || !!record.feedback}
                            sx={{
                                color: (record.status === 'completed' && !record.feedback) ? '#10b981' : '#9ca3af',
                                '&:hover': {
                                    backgroundColor: (record.status === 'completed' && !record.feedback) ? '#d1fae5' : 'transparent',
                                    transform: (record.status === 'completed' && !record.feedback) ? 'scale(1.1)' : 'none'
                                },
                                transition: 'all 0.2s ease',
                                '&:disabled': {
                                    color: '#9ca3af',
                                    cursor: 'not-allowed'
                                }
                            }}
                            size="small"
                        >
                            <FeedbackIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={
                        record.status === 'pending' ? "Report not available for pending requests" :
                        record.feedback ? "Report not available for feedbacked requests" :
                        "Report Issue"
                    }>
                        <IconButton
                            onClick={() => handleOpenReport(record)}
                            disabled={record.status === 'pending' || !!record.feedback}
                            sx={{
                                color: (record.status !== 'pending' && !record.feedback) ? '#ef4444' : '#9ca3af',
                                '&:hover': {
                                    backgroundColor: (record.status !== 'pending' && !record.feedback) ? '#fee2e2' : 'transparent',
                                    transform: (record.status !== 'pending' && !record.feedback) ? 'scale(1.1)' : 'none'
                                },
                                transition: 'all 0.2s ease',
                                '&:disabled': {
                                    color: '#9ca3af',
                                    cursor: 'not-allowed'
                                }
                            }}
                            size="small"
                        >
                            <ReportIcon />
                        </IconButton>
                    </Tooltip>
                </Space>
            ),
        },
    ], [filteredDesignRequests, handleViewDetail]);

    if (loading) {
        return <LoadingState/>;
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
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
                    background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                    border: "1px solid rgba(46, 125, 50, 0.1)",
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
                    <DesignServicesIcon sx={{ fontSize: 32, mr: 2, color: "#2e7d32" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Design Management
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
                    Manage and track your school's uniform design requests with ease. From concept to completion.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDesignRequest}
                    sx={{
                        background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(46, 125, 50, 0.4)"
                        }
                    }}
                >
                    Create New Request
                </Button>
            </Box>

            {/* Statistics Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <StatCard
                        icon={<TrendingUpIcon sx={{ color: STATUS_COLORS.completed, fontSize: 24 }} />}
                        value={stats.total}
                        label="Total Requests"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<PendingIcon sx={{ color: '#f57c00', fontSize: 24 }} />}
                        value={stats.pending}
                        label="Pending"
                        color="#f57c00"
                        bgColor="#fff3e0"
                    />
                    <StatCard
                        icon={<PendingIcon sx={{ color: STATUS_COLORS.processing, fontSize: 24 }} />}
                        value={stats.processing}
                        label="Processing"
                        color={STATUS_COLORS.processing}
                        bgColor="#f3f4f6"
                    />
                    <StatCard
                        icon={<CheckCircleIcon sx={{ color: STATUS_COLORS.completed, fontSize: 24 }} />}
                        value={stats.completed}
                        label="Completed"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<Typography variant="h6" sx={{ color: STATUS_COLORS.canceled, fontWeight: 700 }}>✕</Typography>}
                        value={stats.canceled}
                        label="Cancelled"
                        color={STATUS_COLORS.canceled}
                        bgColor="#ffebee"
                    />
                </Box>
            </Box>

            {/* Table Section */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                }}
            >
                <Box sx={{ p: 3, backgroundColor: "white" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#1e293b"
                            }}
                        >
                            All Design Requests
                        </Typography>
                        <Chip
                            label={`${stats.total} Total`}
                            sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {filteredDesignRequests.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredDesignRequests}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 5,
                                pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
                                showSizeChanger: true,
                                showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} design requests`,
                                style: { marginTop: 16 }
                            }}
                            scroll={{ x: 'max-content' }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }}
                            rowHoverColor="#f8fafc"
                        />
                    )}
                </Box>
            </Paper>

            {/* RequestDetailPopup for non-pending requests */}
            {selectedRequest && selectedRequest.status !== 'pending' && (
                <RequestDetailPopup 
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    request={selectedRequest}
                />
            )}

            {/* FindingDesignerPopup for pending requests */}
            {selectedRequest && selectedRequest.status === 'pending' && (
                <FindingDesignerPopup
                    visible={isModalVisible}
                    onCancel={handleCloseDesignerModal}
                    request={selectedRequest}
                />
            )}

            {/* DesignPaymentPopup */}
            {isPaymentModalVisible && (
                <DesignPaymentPopup
                    visible={isPaymentModalVisible}
                    onCancel={handleClosePaymentModal}
                    selectedQuotationDetails={paymentRequestDetails}
                />
            )}

            {/* FeedbackReportPopup for Feedback */}
            {isFeedbackModalVisible && selectedRequestForFeedback && (
                <FeedbackReportPopup
                    visible={isFeedbackModalVisible}
                    onCancel={handleCloseFeedbackModal}
                    type="feedback"
                    requestData={selectedRequestForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {/* FeedbackReportPopup for Report */}
            {isReportModalVisible && selectedRequestForFeedback && (
                <FeedbackReportPopup
                    visible={isReportModalVisible}
                    onCancel={handleCloseReportModal}
                    type="report"
                    requestData={selectedRequestForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}
        </Box>
    );
}