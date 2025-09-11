import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
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
    IconButton,
    Paper,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {DataLoadingState, EmptyState, ErrorState} from '../../ui/LoadingSpinner.jsx';
import {useLoading} from '../../../contexts/LoadingContext.jsx';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import {Table} from 'antd';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ReportIcon from '@mui/icons-material/Report';
import CancelIcon from '@mui/icons-material/Cancel';
import 'antd/dist/reset.css';
import RequestDetailPopup, {statusTag} from './dialog/RequestDetailPopup.jsx';
import FindingDesignerPopup from './dialog/FindingDesignerPopup.jsx';
import DesignPaymentPopup from './dialog/DesignPaymentPopup.jsx';
import {enqueueSnackbar} from 'notistack';
import FeedbackReportPopup from './dialog/FeedbackReportPopup.jsx';
import {useNavigate} from 'react-router-dom';
import {cancelDesignRequest, getSchoolDesignRequests} from "../../../services/DesignService.jsx";
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const STATUS_COLORS = {
    completed: '#2e7d32',
    processing: '#7c3aed',
    canceled: '#d32f2f'
};

const TABLE_PAGE_SIZE_OPTIONS = ['5', '10'];

const StatCard = React.memo(({icon, value, label, color, bgColor}) => (
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
        <CardContent sx={{textAlign: "center", p: 2}}>
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
            <Typography variant="h5" sx={{fontWeight: 700, color, mb: 0.5}}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

const LoadingState = React.memo(() => (
    <DataLoadingState
        text="Loading Design Requests..."
        size={60}
        color="#2e7d32"
    />
));

// Error State Component - Sử dụng component thống nhất
const ErrorStateComponent = React.memo(({error, onRetry, isRetrying}) => (
    <ErrorState
        error={error}
        onRetry={onRetry}
        isRetrying={isRetrying}
        retryText="Retry"
        errorTitle="Error Loading Data"
    />
));

// Empty State Component - Sử dụng component thống nhất
const EmptyStateComponent = React.memo(() => (
    <EmptyState
        title="No design requests available"
        description="There are no design requests to display"
        icon="🎨"
    />
));

export default function SchoolDesign() {
    const {setDataLoading} = useLoading();

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
            if (showLoading) {
                setLoading(true);
                setDataLoading(true);
            }
            setError(null);
            const response = await getSchoolDesignRequests();
            if (response && response.status === 200) {
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
            setDataLoading(false);
            setIsRetrying(false);
        }
    }, []);

    useEffect(() => {
        FetchSchoolDesign();
    }, [FetchSchoolDesign]);

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

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentRequestDetails, setPaymentRequestDetails] = useState(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedRequestForFeedback, setSelectedRequestForFeedback] = useState(null);
    const [cancellingRequestId, setCancellingRequestId] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowId, setMenuRowId] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [requestToCancel, setRequestToCancel] = useState(null);

    const filteredDesignRequests = useMemo(() => {
        if (currentTab === 0) {
            // Design Requests tab - exclude imported status
            return designRequests.filter(req => req.status !== 'imported');
        } else {
            // Imported Design tab - only imported status
            return designRequests.filter(req => req.status === 'imported');
        }
    }, [designRequests, currentTab]);

    const stats = useMemo(() => {
        if (currentTab === 0) {
            // Design Requests tab - exclude imported
            const nonImportedRequests = designRequests.filter(req => req.status !== 'imported');
            const total = nonImportedRequests.length;
            const pending = nonImportedRequests.filter(req => req.status === 'pending').length;
            const completed = nonImportedRequests.filter(req => req.status === 'completed').length;
            const processing = nonImportedRequests.filter(req => req.status === 'processing').length;
            const canceled = nonImportedRequests.filter(req => req.status === 'canceled').length;

            return {total, pending, completed, processing, canceled, imported: 0};
        } else {
            // Imported Design tab - only imported
            const importedRequests = designRequests.filter(req => req.status === 'imported');
            const total = importedRequests.length;

            return {total, pending: 0, completed: 0, processing: 0, canceled: 0, imported: total};
        }
    }, [designRequests, currentTab]);

    const handleViewDetail = useCallback((id) => {
        const request = designRequests.find(req => req.id === id);
        setSelectedRequest(request);

        if (request.status === 'pending') {
            setPaymentRequestDetails(null);
            setIsPaymentModalVisible(false);
            setIsModalVisible(true);
        } else {
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
        if (request.status === 'imported') {
            enqueueSnackbar('Feedback is not available for imported requests', {variant: 'warning'});
            return;
        }
        if (request.status !== 'completed') {
            enqueueSnackbar('Feedback is only available for completed requests', {variant: 'warning'});
            return;
        }
        if (request.feedback) {
            enqueueSnackbar('Feedback has already been submitted for this request', {variant: 'warning'});
            return;
        }
        setSelectedRequestForFeedback(request);
        setIsFeedbackModalVisible(true);
    }, []);

    const handleOpenReport = useCallback((request) => {
        if (request.status === 'imported') {
            enqueueSnackbar('Report is not available for imported requests', {variant: 'warning'});
            return;
        }
        if (request.status === 'pending') {
            enqueueSnackbar('Report is not available for pending requests', {variant: 'warning'});
            return;
        }
        if (request.feedback) {
            enqueueSnackbar('Report is not available for requests that already have feedback', {variant: 'warning'});
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
        FetchSchoolDesign();
    }, [FetchSchoolDesign]);

    const handleOpenCancelDialog = useCallback((request) => {
        if (request.status === 'imported') {
            enqueueSnackbar('Cannot cancel imported requests', {variant: 'warning'});
            return;
        }

        if (request.status !== 'pending' && request.status !== 'processing') {
            enqueueSnackbar('Can only cancel pending or processing requests', {variant: 'warning'});
            return;
        }

        setRequestToCancel(request);
        setCancelDialogOpen(true);
        setCancelReason('');
    }, [enqueueSnackbar]);

    const handleCloseCancelDialog = useCallback(() => {
        setCancelDialogOpen(false);
        setRequestToCancel(null);
        setCancelReason('');
    }, []);

    const handleCancelRequest = useCallback(async () => {
        if (!requestToCancel || !cancelReason.trim()) {
            enqueueSnackbar('Please provide a cancellation reason', {variant: 'warning'});
            return;
        }

        try {
            setCancellingRequestId(requestToCancel.id);

            const response = await cancelDesignRequest({
                requestId: requestToCancel.id,
                reason: cancelReason.trim()
            });

            if (response && response.status === 200) {
                enqueueSnackbar('Design request cancelled successfully!', {
                    variant: 'success',
                    autoHideDuration: 3000
                });

                await FetchSchoolDesign(false);
                handleCloseCancelDialog();
            } else {
                enqueueSnackbar('Failed to cancel design request. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });
            }
        } catch (error) {
            console.error('Error cancelling design request:', error);
            enqueueSnackbar('An error occurred while cancelling the design request. Please try again.', {
                variant: 'error',
                autoHideDuration: 4000
            });
        } finally {
            setCancellingRequestId(null);
        }
    }, [requestToCancel, cancelReason, FetchSchoolDesign, handleCloseCancelDialog, enqueueSnackbar]);

    const handleOpenMenu = (event, rowId) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowId(rowId);
    };
    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setMenuRowId(null);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const designRequestsColumns = useMemo(() => [
        {
            title: 'Request ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#1976d2'}}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 160,
            filters: [...new Set(filteredDesignRequests.map(request => request.status))].map(status => ({
                text: status,
                value: status
            })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => statusTag(text),
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 160,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569', fontSize: '0.875rem'}}>
                            {`${day}/${month}/${year}`}
                        </Typography>
                        <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.75rem'}}>
                            {`${hours}:${minutes}:${seconds}`}
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
            width: 160,
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
            title: 'Detail',
            key: 'details',
            align: 'center',
            width: 80,
            render: (_, record) => (
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
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            ),
        },
        {
            title: 'More',
            key: 'more',
            align: 'center',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <>
                    <IconButton
                        onClick={e => handleOpenMenu(e, record.id)}
                        size="small"
                        sx={{
                            color: '#64748b',
                            '&:hover': {
                                backgroundColor: '#f1f5f9',
                                color: '#1e293b'
                            }
                        }}
                    >
                        <MoreVertIcon/>
                    </IconButton>
                    {menuRowId === record.id && (
                        <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl) && menuRowId === record.id}
                            onClose={handleCloseMenu}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleOpenFeedback(record);
                                    handleCloseMenu();
                                }}
                                disabled={record.status === 'imported' || record.status !== 'completed' || !!record.feedback}
                            >
                                <FeedbackIcon fontSize="small" sx={{
                                    mr: 1,
                                    color: (record.status === 'completed' && !record.feedback && record.status !== 'imported') ? '#10b981' : '#9ca3af'
                                }}/>
                                Feedback
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleOpenReport(record);
                                    handleCloseMenu();
                                }}
                                disabled={record.status === 'imported' || record.status === 'pending' || !!record.feedback || (record.status === 'canceled' && !record.finalDesignQuotation)}
                            >
                                <ReportIcon fontSize="small" sx={{
                                    mr: 1,
                                    color: (record.status !== 'pending' && record.status !== 'imported' && !record.feedback) ? '#ef4444' : '#9ca3af'
                                }}/>
                                Report
                            </MenuItem>
                            {(record.status === 'pending' || record.status === 'processing') && record.status !== 'imported' && (
                                <MenuItem
                                    onClick={() => {
                                        handleOpenCancelDialog(record);
                                        handleCloseMenu();
                                    }}
                                    disabled={cancellingRequestId === record.id}
                                >
                                    {cancellingRequestId === record.id ?
                                        <CircularProgress size={16} sx={{color: '#9ca3af', mr: 1}}/> :
                                        <CancelIcon fontSize="small" sx={{mr: 1, color: '#f59e0b'}}/>
                                    }
                                    Cancel
                                </MenuItem>
                            )}
                        </Menu>
                    )}
                </>
            ),
        },
    ], [filteredDesignRequests, handleViewDetail, handleOpenFeedback, handleOpenReport, handleCancelRequest, cancellingRequestId, menuAnchorEl, menuRowId]);

    const importedDesignColumns = useMemo(() => [
        {
            title: 'Design ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#1976d2'}}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Import Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 160,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569', fontSize: '0.875rem'}}>
                            {`${day}/${month}/${year}`}
                        </Typography>
                        <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.75rem'}}>
                            {`${hours}:${minutes}:${seconds}`}
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
            width: 160,
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
            title: 'Detail',
            key: 'details',
            align: 'center',
            width: 80,
            render: (_, record) => (
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
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            ),
        },
    ], [handleViewDetail]);

    const columns = currentTab === 0 ? designRequestsColumns : importedDesignColumns;

    if (loading) {
        // Không hiển thị loading UI ở đây nữa, sẽ dùng GlobalLoadingOverlay
        return null;
    }

    if (error) {
        return <ErrorStateComponent error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
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
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <DesignServicesIcon sx={{fontSize: 32, mr: 2, color: "#2e7d32"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon/>}
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
            </Box>

            <Box sx={{mb: 4}}>
                <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                    <StatCard
                        icon={<TrendingUpIcon sx={{color: STATUS_COLORS.completed, fontSize: 24}}/>}
                        value={stats.total}
                        label="Total Requests"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<PendingIcon sx={{color: '#f57c00', fontSize: 24}}/>}
                        value={stats.pending}
                        label="Pending"
                        color="#f57c00"
                        bgColor="#fff3e0"
                    />
                    <StatCard
                        icon={<PendingIcon sx={{color: STATUS_COLORS.processing, fontSize: 24}}/>}
                        value={stats.processing}
                        label="Processing"
                        color={STATUS_COLORS.processing}
                        bgColor="#f3f4f6"
                    />
                    <StatCard
                        icon={<CheckCircleIcon sx={{color: STATUS_COLORS.completed, fontSize: 24}}/>}
                        value={stats.completed}
                        label="Completed"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<DesignServicesIcon sx={{color: '#e91e63', fontSize: 24}}/>}
                        value={stats.imported}
                        label="Imported"
                        color="#e91e63"
                        bgColor="#fce4ec"
                    />
                    <StatCard
                        icon={<Typography variant="h6"
                                          sx={{color: STATUS_COLORS.canceled, fontWeight: 700}}>✕</Typography>}
                        value={stats.canceled}
                        label="Cancelled"
                        color={STATUS_COLORS.canceled}
                        bgColor="#ffebee"
                    />
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                }}
            >
                <Box sx={{backgroundColor: "white"}}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            px: 3,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#64748b',
                                '&.Mui-selected': {
                                    color: '#2e7d32',
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#2e7d32',
                            }
                        }}
                    >
                        <Tab label="Design Requests" />
                        <Tab label="Imported Design" />
                    </Tabs>

                    <Box sx={{p: 3}}>
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b"
                                }}
                            >
                                {currentTab === 0 ? 'Design Requests' : 'Imported Design'}
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
                            <EmptyStateComponent/>
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
                                    showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} ${currentTab === 0 ? 'design requests' : 'imported designs'}`,
                                    style: {marginTop: 16}
                                }}
                                scroll={{x: 'max-content'}}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px'
                                }}
                                rowHoverColor="#f8fafc"
                            />
                        )}
                    </Box>
                </Box>
            </Paper>

            {selectedRequest && selectedRequest.status !== 'pending' && selectedRequest.status !== 'imported' && (
                <RequestDetailPopup
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    request={selectedRequest}
                />
            )}

            {selectedRequest && selectedRequest.status === 'pending' && (
                <FindingDesignerPopup
                    visible={isModalVisible}
                    onCancel={handleCloseDesignerModal}
                    request={selectedRequest}
                />
            )}

            {selectedRequest && selectedRequest.status === 'imported' && (
                <RequestDetailPopup
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    request={selectedRequest}
                />
            )}

            {isPaymentModalVisible && (
                <DesignPaymentPopup
                    visible={isPaymentModalVisible}
                    onCancel={handleClosePaymentModal}
                    selectedQuotationDetails={paymentRequestDetails}
                />
            )}

            {isFeedbackModalVisible && selectedRequestForFeedback && (
                <FeedbackReportPopup
                    visible={isFeedbackModalVisible}
                    onCancel={handleCloseFeedbackModal}
                    type="feedback"
                    requestData={selectedRequestForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {isReportModalVisible && selectedRequestForFeedback && (
                <FeedbackReportPopup
                    visible={isReportModalVisible}
                    onCancel={handleCloseReportModal}
                    type="report"
                    requestData={selectedRequestForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {/* Cancel Design Request Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={handleCloseCancelDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CancelIcon sx={{fontSize: 20}}/>
                    </Box>
                    Cancel Design Request
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    <Box sx={{textAlign: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 2}}>
                            Cancel Design Request {requestToCancel ? parseID(requestToCancel.id, 'dr') : ''}
                        </Typography>
                        <Typography variant="body2" sx={{color: '#64748b', lineHeight: 1.6, mb: 3}}>
                            Please provide a reason for cancelling this design request. This action cannot be undone.
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Cancellation Reason *"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Please explain why you want to cancel this design request..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: '#f59e0b'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#f59e0b'
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#f59e0b'
                            }
                        }}
                    />

                    <Box sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderLeft: '4px solid #ef4444'
                    }}>
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            color: '#dc2626',
                            mb: 1
                        }}>
                            Important Notice
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: '#7f1d1d',
                            lineHeight: 1.6,
                            fontSize: '0.9rem'
                        }}>
                            Once you cancel this design request, it cannot be restored. Make sure you really want to proceed with this action.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseCancelDialog}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Keep Request
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCancelRequest}
                        disabled={!cancelReason.trim() || cancellingRequestId === requestToCancel?.id}
                        sx={{
                            background: (!cancelReason.trim() || cancellingRequestId === requestToCancel?.id) 
                                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': {
                                background: (!cancelReason.trim() || cancellingRequestId === requestToCancel?.id)
                                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                    : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            }
                        }}
                    >
                        {cancellingRequestId === requestToCancel?.id ? (
                            <>
                                <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                Cancelling...
                            </>
                        ) : !cancelReason.trim() ? (
                            'Reason Required'
                        ) : (
                            'Cancel Request'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}