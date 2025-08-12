import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    LocalShipping as LocalShippingIcon,
    Cancel as CancelIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { Table, Space } from 'antd';
import 'antd/dist/reset.css';
import { useNavigate } from 'react-router-dom';
import { getOrdersBySchool, cancelOrder } from '../../../services/OrderService';
import { parseID } from '../../../utils/ParseIDUtil';
import OrderDetailDialog from './OrderDetailDialog';
import QuotationViewer from './QuotationViewer';
import { useSnackbar } from 'notistack';

export default function SchoolOrderList() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isQuotationViewerOpen, setIsQuotationViewerOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Refresh data when user returns from other pages
    useEffect(() => {
        const handleFocus = () => {
            fetchOrders();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getOrdersBySchool();
            if (response && response.data) {
                const ordersData = response.data.body || [];
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailDialogOpen(true);
    };

    const handleViewQuotations = (order) => {
        setSelectedOrder(order);
        setIsQuotationViewerOpen(true);
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
                await fetchOrders();
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

    const handleCloseQuotationViewer = () => {
        setIsQuotationViewerOpen(false);
        setSelectedOrder(null);
    };

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
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
                return { color: '#f57c00', bgColor: '#fff3e0' };
            case 'processing':
                return { color: '#1976d2', bgColor: '#e3f2fd' };
            case 'completed':
                return { color: '#2e7d32', bgColor: '#e8f5e8' };
            case 'cancelled':
                return { color: '#d32f2f', bgColor: '#ffebee' };
            default:
                return { color: '#64748b', bgColor: '#f1f5f9' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <PendingIcon />;
            case 'processing':
                return <LocalShippingIcon />;
            case 'completed':
                return <CheckCircleIcon />;
            case 'cancelled':
                return <CancelIcon />;
            default:
                return <PendingIcon />;
        }
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 120,
            fixed: 'left',
            render: (text) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
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
            render: (status) => {
                const { color, bgColor } = getStatusColor(status);
                return (
                    <Chip
                        icon={getStatusIcon(status)}
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        sx={{
                            backgroundColor: bgColor,
                            color: color,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                                color: color
                            }
                        }}
                        size="small"
                    />
                );
            },
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 200,
            render: (school) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {school?.business || 'Unknown School'}
                </Typography>
            ),
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#64748b' }}>
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
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {formatDate(text)}
                </Typography>
            ),
        },
        {
            title: 'Total Items',
            key: 'totalItems',
            align: 'center',
            width: 120,
            render: (_, record) => {
                const totalItems = record.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                return (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {totalItems}
                    </Typography>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <IconButton
                            onClick={() => handleViewDetail(record)}
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
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="View Quotations">
                                <IconButton
                                    onClick={() => handleViewQuotations(record)}
                                    sx={{
                                        color: '#2e7d32',
                                        '&:hover': {
                                            backgroundColor: '#e8f5e8',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                    size="small"
                                >
                                    <TrendingUpIcon />
                                </IconButton>
                            </Tooltip>
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
                                                    '0%': { transform: 'rotate(0deg)' },
                                                    '100%': { transform: 'rotate(360deg)' }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <CancelIcon />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    py: { xs: 6, md: 8 },
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "url('/unisew.jpg') center/cover",
                        opacity: 0.1,
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <ShoppingCartIcon sx={{ fontSize: 48, mr: 2, opacity: 0.9 }} />
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: "2rem", md: "2.8rem" },
                                        letterSpacing: "-0.02em"
                                    }}
                                >
                                    Order Management
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.95,
                                    fontSize: { xs: "1rem", md: "1.2rem" },
                                    lineHeight: 1.6,
                                    mb: 3
                                }}
                            >
                                Manage and track your school's uniform orders with ease. From creation to delivery.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={handleCreateOrder}
                                sx={{
                                    backgroundColor: "white",
                                    color: "#1976d2",
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    borderRadius: "50px",
                                    textTransform: "none",
                                    boxShadow: "0 4px 15px rgba(255,255,255,0.3)",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 25px rgba(255,255,255,0.4)"
                                    }
                                }}
                            >
                                Create New Order
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Statistics Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#1976d2",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <TrendingUpIcon sx={{ color: "#1976d2", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Total Orders
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#f57c00",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(245, 124, 0, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#fff3e0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <PendingIcon sx={{ color: "#f57c00", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#f57c00", mb: 1 }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Pending
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#1976d2",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <LocalShippingIcon sx={{ color: "#1976d2", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                                    {stats.processing}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Processing
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#2e7d32",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(46, 125, 50, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#e8f5e8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                                    {stats.completed}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Completed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Table Section */}
            <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: "1px solid #e2e8f0",
                        overflow: "auto"
                    }}
                >
                    <Box sx={{ p: { xs: 3, md: 4 }, backgroundColor: "white" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    fontSize: { xs: "1.3rem", md: "1.5rem" }
                                }}
                            >
                                Recent Orders
                            </Typography>
                            <Chip
                                label={`${stats.total} Total`}
                                sx={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    fontWeight: 600
                                }}
                            />
                        </Box>

                        <Table
                            columns={columns}
                            dataSource={orders}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 5,
                                pageSizeOptions: ['5', '8', '10', '15'],
                                showSizeChanger: true,
                                showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} orders`,
                                style: { marginTop: 16 }
                            }}
                            scroll={{ x: 'max-content' }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }}
                            rowHoverColor="#f8fafc"
                        />
                    </Box>
                </Paper>
            </Container>

            {/* Modals */}
            {isDetailDialogOpen && (
                <OrderDetailDialog
                    open={isDetailDialogOpen}
                    onClose={handleCloseDetailDialog}
                    order={selectedOrder}
                />
            )}

            {isQuotationViewerOpen && (
                <QuotationViewer
                    visible={isQuotationViewerOpen}
                    onCancel={handleCloseQuotationViewer}
                    orderId={selectedOrder?.id}
                />
            )}
        </Box>
    );
}