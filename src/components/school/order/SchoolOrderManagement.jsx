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
    Menu,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {DataLoadingState, EmptyState, ErrorState} from '../../ui/LoadingSpinner.jsx';
import {useLoading} from '../../../contexts/LoadingContext.jsx';
import {
    Add as AddIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Feedback as FeedbackIcon,
    Info as InfoIcon,
    LocalShipping as LocalShippingIcon,
    MoreVert as MoreVertIcon,
    Pending as PendingIcon,
    Report as ReportIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {Table, Tag} from 'antd';
import 'antd/dist/reset.css';
import {useNavigate} from 'react-router-dom';
import {CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {cancelOrder, getOrdersBySchool} from '../../../services/OrderService';
import {parseID} from '../../../utils/ParseIDUtil';
import OrderDetailPopup from './dialog/OrderDetailPopup.jsx';
import {useSnackbar} from 'notistack';
import FeedbackReportPopup from '../design/dialog/FeedbackReportPopup.jsx';

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
        case 'canceled':
            color = 'red';
            icon = <CloseCircleOutlined/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag style={{margin: 0}} color={color}>{icon} {status}</Tag>;
};

const LoadingState = React.memo(() => (
    <DataLoadingState
        text="Loading Orders..."
        size={60}
        color="#2e7d32"
    />
));

const ErrorStateComponent = React.memo(({error, onRetry, isRetrying}) => (
    <ErrorState
        error={error}
        onRetry={onRetry}
        isRetrying={isRetrying}
        retryText="Retry"
        errorTitle="Error Loading Data"
    />
));

const EmptyStateComponent = React.memo(() => (
    <EmptyState
        title="No orders available"
        description="There are no orders to display"
        icon="📦"
    />
));

export default function SchoolOrderList() {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const {setDataLoading} = useLoading();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowId, setMenuRowId] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [orderToCancel, setOrderToCancel] = useState(null);

    const fetchOrders = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
                setDataLoading(true);
            }
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
            setDataLoading(false);
            setIsRetrying(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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
        if (order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' || order.status === 'canceled' || order.status === 'cancelled') {
            sessionStorage.setItem('trackingOrderId', order.id);
            navigate('/school/order/status');
        } else {
            setSelectedOrder(order);
            setIsDetailDialogOpen(true);
        }
    };


    const handleOpenCancelDialog = (order) => {
        setOrderToCancel(order);
        setCancelDialogOpen(true);
        setCancelReason('');
    };

    const handleCloseCancelDialog = () => {
        setCancelDialogOpen(false);
        setOrderToCancel(null);
        setCancelReason('');
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel || !cancelReason.trim()) {
            enqueueSnackbar('Please provide a cancellation reason', {variant: 'warning'});
            return;
        }

        try {
            setCancellingOrderId(orderToCancel.id);

            const data = {
                orderId: orderToCancel.id,
                reason: cancelReason.trim()
            };

            const response = await cancelOrder(data);

            if (response && response.status === 200) {
                enqueueSnackbar('Order cancelled successfully!', {
                    variant: 'success',
                    autoHideDuration: 3000
                });

                await fetchOrders(false);
                handleCloseCancelDialog();
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

    const handleOpenMenu = (event, rowId) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuRowId(rowId);
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        setMenuRowId(null);
    };

    const handleOpenFeedback = useCallback((order) => {
        if (order.status !== 'completed') {
            enqueueSnackbar('Feedback is only available for completed orders', {variant: 'warning'});
            return;
        }
        if (order.feedback) {
            enqueueSnackbar('Feedback has already been submitted for this order', {variant: 'warning'});
            return;
        }
        const orderForFeedback = {
            ...order,
            orderId: order.id
        };
        setSelectedOrderForFeedback(orderForFeedback);
        setIsFeedbackModalVisible(true);
    }, [enqueueSnackbar]);

    const handleOpenReport = useCallback((order) => {
        if (order.status === 'pending') {
            enqueueSnackbar('Report is not available for pending orders', {variant: 'warning'});
            return;
        }
        if (order.feedback) {
            enqueueSnackbar('Report is not available for orders that already have feedback', {variant: 'warning'});
            return;
        }
        if (order.report) {
            enqueueSnackbar('Report has already been submitted for this order', {variant: 'warning'});
            return;
        }
        const orderForReport = {
            ...order,
            orderId: order.id
        };
        setSelectedOrderForFeedback(orderForReport);
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
        fetchOrders(false);
    }, [fetchOrders]);

    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
        delivering: orders.filter(order => order.status === 'delivering').length,
        completed: orders.filter(order => order.status === 'completed').length,
        cancelled: orders.filter(order => order.status === 'cancelled' || order.status === 'canceled').length
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
            case 'canceled':
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
            case 'canceled':
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
            title: 'Detail',
            key: 'details',
            align: 'center',
            width: 80,
            render: (_, record) => (
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
                                disabled={record.status !== 'completed' || !!record.feedback}
                            >
                                <FeedbackIcon fontSize="small" sx={{
                                    mr: 1,
                                    color: (record.status === 'completed' && !record.feedback) ? '#10b981' : '#9ca3af'
                                }}/>
                                Feedback
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleOpenReport(record);
                                    handleCloseMenu();
                                }}
                                disabled={record.status === 'pending' || !!record.feedback || !!record.report || (record.status === 'canceled' && !record.garment)}
                            >
                                <ReportIcon fontSize="small" sx={{
                                    mr: 1,
                                    color: (record.status !== 'pending' && !record.feedback && !record.report) ? '#ef4444' : '#9ca3af'
                                }}/>
                                Report
                            </MenuItem>
                            {record.status === 'pending' && (
                                <MenuItem
                                    onClick={() => {
                                        handleOpenCancelDialog(record);
                                        handleCloseMenu();
                                    }}
                                    disabled={cancellingOrderId === record.id}
                                >
                                    {cancellingOrderId === record.id ?
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
    ], [orders, handleViewDetail, handleOpenFeedback, handleOpenReport, handleCancelOrder, cancellingOrderId]);

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

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderColor: "#d32f2f",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(211, 47, 47, 0.2)"
                            }
                        }}
                    >
                        <CardContent sx={{textAlign: "center", p: 2}}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "#ffebee",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <CancelIcon sx={{color: "#d32f2f", fontSize: 24}}/>
                            </Box>
                            <Typography variant="h5" sx={{fontWeight: 700, color: "#d32f2f", mb: 0.5}}>
                                {stats.cancelled}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                                Cancelled
                            </Typography>
                        </CardContent>
                    </Card>
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
                        <EmptyStateComponent/>
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

            {isDetailDialogOpen && (
                <OrderDetailPopup
                    open={isDetailDialogOpen}
                    onClose={handleCloseDetailDialog}
                    order={selectedOrder}
                />
            )}

            {}
            {isFeedbackModalVisible && selectedOrderForFeedback && (
                <FeedbackReportPopup
                    visible={isFeedbackModalVisible}
                    onCancel={handleCloseFeedbackModal}
                    type="feedback"
                    requestData={selectedOrderForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {}
            {isReportModalVisible && selectedOrderForFeedback && (
                <FeedbackReportPopup
                    visible={isReportModalVisible}
                    onCancel={handleCloseReportModal}
                    type="report"
                    requestData={selectedOrderForFeedback}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {/* Cancel Order Dialog */}
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
                    Cancel Order
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    <Box sx={{textAlign: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 2}}>
                            Cancel Order {orderToCancel ? parseID(orderToCancel.id, 'ord') : ''}
                        </Typography>
                        <Typography variant="body2" sx={{color: '#64748b', lineHeight: 1.6, mb: 3}}>
                            Please provide a reason for cancelling this order. This action cannot be undone.
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Cancellation Reason *"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Please explain why you want to cancel this order..."
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
                            Once you cancel this order, it cannot be restored. Make sure you really want to proceed with this action.
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
                        Keep Order
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCancelOrder}
                        disabled={!cancelReason.trim() || cancellingOrderId === orderToCancel?.id}
                        sx={{
                            background: (!cancelReason.trim() || cancellingOrderId === orderToCancel?.id) 
                                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': {
                                background: (!cancelReason.trim() || cancellingOrderId === orderToCancel?.id)
                                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                    : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            }
                        }}
                    >
                        {cancellingOrderId === orderToCancel?.id ? (
                            <>
                                <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                Cancelling...
                            </>
                        ) : !cancelReason.trim() ? (
                            'Reason Required'
                        ) : (
                            'Cancel Order'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}