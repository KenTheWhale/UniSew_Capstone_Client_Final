import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    LocalShipping as LocalShippingIcon,
    Pending as PendingIcon,
    Refresh as RefreshIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
    Feedback as FeedbackIcon,
    Report as ReportIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import {Empty, Space, Table, Tag} from 'antd';
import 'antd/dist/reset.css';
import {useNavigate} from 'react-router-dom';
import {CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {cancelOrder, getOrdersBySchool} from '../../../services/OrderService';
import {parseID} from '../../../utils/ParseIDUtil';
import OrderDetailPopup from './dialog/OrderDetailPopup.jsx';
import FeedbackReportPopup from '../design/dialog/FeedbackReportPopup.jsx';
import {useSnackbar} from 'notistack';

// Status Tag Component
const statusTag = (status) => {
    let color;
    let icon = null;
    switch (status) {
        case 'pending':
            color = 'orange';
            icon = <ClockCircleOutlined/>;
            break;
        case 'processing':
            color = 'blue';
            icon = <SyncOutlined/>;
            break;
        case 'delivering':
            color = 'purple';
            icon = <LocalShippingIcon style={{fontSize: '14px'}}/>;
            break;
        case 'completed':
            color = 'success';
            icon = <CheckCircleOutlined/>;
            break;
        case 'cancelled':
            color = 'red';
            icon = <CloseCircleOutlined/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag style={{margin: 0}} color={color}>{icon} {status}</Tag>;
};

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
            Loading Orders...
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
                    No orders available
                </Typography>
            }
        />
    </Box>
));

export default function SchoolOrderList() {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    
    // Feedback and Report states
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowId, setMenuRowId] = useState(null);

    // Fetch orders on component mount
    const fetchOrders = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);
            const response = await getOrdersBySchool();
            if (response && response.data) {
                const ordersData = response.data.body || [];
                setOrders(ordersData);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('An error occurred while fetching orders');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Refresh data when user returns from other pages
    useEffect(() => {
        const handleFocus = () => {
            fetchOrders(false);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchOrders]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        fetchOrders();
    }, [fetchOrders]);

    const handleRefresh = useCallback(() => {
        fetchOrders(false);
    }, [fetchOrders]);

    const handleViewDetail = (order) => {
        if (order.status === 'processing' || order.status === 'delivering') {
            // Lưu orderId vào sessionStorage và điều hướng đến OrderTrackingStatus
            sessionStorage.setItem('trackingOrderId', order.id);
            navigate('/school/order/status');
        } else {
            // Hiển thị popup detail cho các status khác
            setSelectedOrder(order);
            setIsDetailDialogOpen(true);
        }
    };


    const handleCancelOrder = async (orderId) => {
        try {
            setCancellingOrderId(orderId);

            const response = await cancelOrder(orderId);

            if (response && response.status === 200) {
                enqueueSnackbar('Order cancelled successfully!', {
                    variant: 'success',
                    autoHideDuration: 3000
                });

                // Refresh the orders list
                await fetchOrders(false);
            } else {
                enqueueSnackbar('Failed to cancel order. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            enqueueSnackbar('An error occurred while cancelling the order. Please try again.', {
                variant: 'error',
                autoHideDuration: 4000
            });
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleCreateOrder = () => {
        navigate('/school/order/create');
    };

    const handleCloseDetailDialog = () => {
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
    };

    // Feedback and Report handlers
    const handleOpenFeedback = useCallback((order) => {
        // Only allow feedback for completed orders
        if (order.status !== 'completed') {
            enqueueSnackbar('Feedback is only available for completed orders', { variant: 'warning' });
            return;
        }
        // Only allow feedback once per order
        if (order.feedback) {
            enqueueSnackbar('Feedback has already been submitted for this order', { variant: 'warning' });
            return;
        }
        // Create order object with orderId for FeedbackReportPopup
        const orderForFeedback = { ...order, orderId: order.id };
        setSelectedOrderForFeedback(orderForFeedback);
        setIsFeedbackModalVisible(true);
    }, [enqueueSnackbar]);

    const handleOpenReport = useCallback((order) => {
        // Don't allow report for pending orders
        if (order.status === 'pending') {
            enqueueSnackbar('Report is not available for pending orders', { variant: 'warning' });
            return;
        }
        // Don't allow report for orders that already have feedback
        if (order.feedback) {
            enqueueSnackbar('Report is not available for orders that already have feedback', { variant: 'warning' });
            return;
        }
        // Create order object with orderId for FeedbackReportPopup
        const orderForFeedback = { ...order, orderId: order.id };
        setSelectedOrderForFeedback(orderForFeedback);
        setIsReportModalVisible(true);
    }, [enqueueSnackbar]);

    const handleCloseFeedbackModal = useCallback(() => {
        setIsFeedbackModalVisible(false);
        setSelectedOrderForFeedback(null);
    }, []);

    const handleCloseReportModal = useCallback(() => {
        setIsReportModalVisible(false);
        setSelectedOrderForFeedback(null);
    }, []);

    const handleFeedbackSuccess = useCallback(() => {
        fetchOrders(); // Refresh data after successful feedback
    }, [fetchOrders]);

    const handleOpenMenu = (event, rowId) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowId(rowId);
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setMenuRowId(null);
    };

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
        delivering: orders.filter(order => order.status === 'delivering').length,
        completed: orders.filter(order => order.status === 'completed').length,
        cancelled: orders.filter(order => order.status === 'cancelled').length
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return {color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)'};
            case 'processing':
                return {color: '#1976d2', bgColor: '#e3f2fd'};
            case 'delivering':
                return {color: '#9c27b0', bgColor: 'rgba(156, 39, 176, 0.1)'};
            case 'completed':
                return {color: '#2e7d32', bgColor: 'rgba(46, 125, 50, 0.1)'};
            case 'cancelled':
                return {color: '#d32f2f', bgColor: '#ffebee'};
            default:
                return {color: '#64748b', bgColor: '#f1f5f9'};
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <PendingIcon/>;
            case 'processing':
                return <TrendingUpIcon/>;
            case 'delivering':
                return <LocalShippingIcon/>;
            case 'completed':
                return <CheckCircleIcon/>;
            case 'cancelled':
                return <CancelIcon/>;
            default:
                return <PendingIcon/>;
        }
    };

    const columns = useMemo(() => [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            fixed: 'left',
            render: (text) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#2e7d32'}}>
                    {parseID(text, 'ord')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 140,
            filters: [...new Set(orders.map(order => order.status))].map(status => ({text: status, value: status})),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (status) => statusTag(status),
        },

        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
            width: 120,
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (text) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDate(text)}
                </Typography>
            ),
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'center',
            width: 120,
            sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline),
            render: (text) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDate(text)}
                </Typography>
            ),
        },
        {
            title: 'Total Uniforms',
            key: 'totalUniforms',
            align: 'center',
            width: 120,
            sorter: (a, b) => {
                const totalItemsA = a.orderDetails?.reduce((sum, uniform) => sum + uniform.quantity, 0) || 0;
                const totalUniformsA = Math.ceil(totalItemsA / 2);
                const totalItemsB = b.orderDetails?.reduce((sum, uniform) => sum + uniform.quantity, 0) || 0;
                const totalUniformsB = Math.ceil(totalItemsB / 2);
                return totalUniformsA - totalUniformsB;
            },
            render: (_, record) => {
                const totalItems = record.orderDetails?.reduce((sum, uniform) => sum + uniform.quantity, 0) || 0;
                const totalUniforms = Math.ceil(totalItems / 2);
                return (
                    <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                        {totalUniforms}
                    </Typography>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 280,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <IconButton
                            onClick={() => handleViewDetail(record)}
                            sx={{
                                color: '#2e7d32',
                                '&:hover': {
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <InfoIcon/>
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Feedback">
                        <IconButton
                            onClick={() => handleOpenFeedback(record)}
                            disabled={record.status !== 'completed' || !!record.feedback}
                            sx={{
                                color: (record.status === 'completed' && !record.feedback) ? '#10b981' : '#9ca3af',
                                '&:hover': {
                                    backgroundColor: (record.status === 'completed' && !record.feedback) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    transform: (record.status === 'completed' && !record.feedback) ? 'scale(1.1)' : 'none'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <FeedbackIcon/>
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Report">
                        <IconButton
                            onClick={() => handleOpenReport(record)}
                            disabled={record.status === 'pending' || !!record.feedback}
                            sx={{
                                color: (record.status !== 'pending' && !record.feedback) ? '#ef4444' : '#9ca3af',
                                '&:hover': {
                                    backgroundColor: (record.status !== 'pending' && !record.feedback) ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    transform: (record.status !== 'pending' && !record.feedback) ? 'scale(1.1)' : 'none'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <ReportIcon/>
                        </IconButton>
                    </Tooltip>
                    
                    {record.status === 'pending' && (
                        <Tooltip title="Cancel Order">
                            <IconButton
                                onClick={() => handleCancelOrder(record.id)}
                                disabled={cancellingOrderId === record.id}
                                sx={{
                                    color: cancellingOrderId === record.id ? '#bdbdbd' : '#d32f2f',
                                    '&:hover': {
                                        backgroundColor: cancellingOrderId === record.id ? 'transparent' : '#ffebee',
                                        transform: cancellingOrderId === record.id ? 'none' : 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease',
                                    '&:disabled': {
                                        cursor: 'not-allowed'
                                    }
                                }}
                                size="small"
                            >
                                {cancellingOrderId === record.id ? (
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            border: '2px solid #bdbdbd',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': {transform: 'rotate(0deg)'},
                                                '100%': {transform: 'rotate(360deg)'}
                                            }
                                        }}
                                    />
                                ) : (
                                    <CancelIcon/>
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [orders, handleViewDetail, handleOpenFeedback, handleOpenReport, handleCancelOrder, cancellingOrderId]);

    if (loading) {
        return <LoadingState/>;
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
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
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <ShoppingCartIcon sx={{fontSize: 32, mr: 2, color: "#2e7d32"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Order Management
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
                    Manage and track your school's uniform orders with ease. From creation to delivery.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon/>}
                    onClick={handleCreateOrder}
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
                    Create New Order
                </Button>
            </Box>

            {/* Statistics Section */}
            <Box sx={{mb: 4}}>
                <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#2e7d32",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(46, 125, 50, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(46, 125, 50, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <ShoppingCartIcon sx={{color: "#2e7d32", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#2e7d32", mb: 0.5}}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Total Orders
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#ff9800",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(255, 152, 0, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <PendingIcon sx={{color: "#ff9800", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#ff9800", mb: 0.5}}>
                                {stats.pending}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Pending
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#1976d2",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(25, 118, 210, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "#e3f2fd",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <TrendingUpIcon sx={{color: "#1976d2", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#1976d2", mb: 0.5}}>
                                {stats.processing}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Processing
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#9c27b0",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(156, 39, 176, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(156, 39, 176, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <LocalShippingIcon sx={{color: "#9c27b0", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#9c27b0", mb: 0.5}}>
                                {stats.delivering}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Delivering
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#2e7d32",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(46, 125, 50, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "#e8f5e8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <CheckCircleIcon sx={{color: "#2e7d32", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#2e7d32", mb: 0.5}}>
                                {stats.completed}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Completed
                            </Typography>
                        </CardContent>
                    </Card>
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
                <Box sx={{p: 3, backgroundColor: "white"}}>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#1e293b"
                            }}
                        >
                            Recent Orders
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

                    {orders.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={orders}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 5,
                                pageSizeOptions: ['5', '10'],
                                showSizeChanger: true,
                                showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} orders`,
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
            </Paper>

            {/* Modals */}
            {isDetailDialogOpen && (
                <OrderDetailPopup
                    open={isDetailDialogOpen}
                    onClose={handleCloseDetailDialog}
                    order={selectedOrder}
                />
            )}

            {/* FeedbackReportPopup for Feedback */}
            {isFeedbackModalVisible && selectedOrderForFeedback && (
                <FeedbackReportPopup
                    visible={isFeedbackModalVisible}
                    onCancel={handleCloseFeedbackModal}
                    type="feedback"
                    requestData={selectedOrderForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {/* FeedbackReportPopup for Report */}
            {isReportModalVisible && selectedOrderForFeedback && (
                <FeedbackReportPopup
                    visible={isReportModalVisible}
                    onCancel={handleCloseReportModal}
                    type="report"
                    requestData={selectedOrderForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

        </Box>
    );
}