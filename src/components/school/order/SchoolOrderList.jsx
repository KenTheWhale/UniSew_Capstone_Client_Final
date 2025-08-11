import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    ShoppingCart as ShoppingCartIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as MoneyIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { Table, Space } from 'antd';
import 'antd/dist/reset.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { parseID } from '../../../utils/ParseIDUtil.jsx';

// Mock data for demonstration
const mockOrders = [
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        schoolName: 'ABC High School',
        designerName: 'John Smith',
        orderDate: '2024-01-15',
        deliveryDate: '2024-02-15',
        totalAmount: 15000000,
        status: 'pending',
        items: [
            { name: 'Male Uniform Shirt', quantity: 500, price: 150000 },
            { name: 'Female Uniform Shirt', quantity: 500, price: 150000 }
        ],
        paymentStatus: 'paid',
        shippingStatus: 'preparing'
    },
    {
        id: '2',
        orderNumber: 'ORD-2024-002',
        schoolName: 'XYZ Middle School',
        designerName: 'Sarah Johnson',
        orderDate: '2024-01-10',
        deliveryDate: '2024-02-10',
        totalAmount: 12000000,
        status: 'processing',
        items: [
            { name: 'Male Uniform Pants', quantity: 300, price: 200000 },
            { name: 'Female Uniform Skirt', quantity: 300, price: 200000 }
        ],
        paymentStatus: 'paid',
        shippingStatus: 'shipped'
    },
    {
        id: '3',
        orderNumber: 'ORD-2024-003',
        schoolName: 'DEF Elementary School',
        designerName: 'Michael Brown',
        orderDate: '2024-01-05',
        deliveryDate: '2024-02-05',
        totalAmount: 8000000,
        status: 'completed',
        items: [
            { name: 'Male Uniform Set', quantity: 200, price: 400000 },
            { name: 'Female Uniform Set', quantity: 200, price: 400000 }
        ],
        paymentStatus: 'paid',
        shippingStatus: 'delivered'
    }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'processing':
            return 'info';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'pending':
            return <PendingIcon />;
        case 'processing':
            return <RefreshIcon />;
        case 'completed':
            return <CheckCircleIcon />;
        case 'cancelled':
            return <CancelIcon />;
        default:
            return <PendingIcon />;
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'processing':
            return 'Processing';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'paid':
            return 'success';
        case 'pending':
            return 'warning';
        case 'failed':
            return 'error';
        default:
            return 'default';
    }
};

const getPaymentStatusText = (status) => {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'pending':
            return 'Pending';
        case 'failed':
            return 'Failed';
        default:
            return 'Unknown';
    }
};

const getShippingStatusColor = (status) => {
    switch (status) {
        case 'preparing':
            return 'warning';
        case 'shipped':
            return 'info';
        case 'delivered':
            return 'success';
        default:
            return 'default';
    }
};

const getShippingStatusText = (status) => {
    switch (status) {
        case 'preparing':
            return 'Preparing';
        case 'shipped':
            return 'Shipped';
        case 'delivered':
            return 'Delivered';
        default:
            return 'Unknown';
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export default function SchoolOrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Simulate API call
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setOrders(mockOrders);
            } catch (error) {
                enqueueSnackbar('Failed to load order list', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [enqueueSnackbar]);

    const handleCreateOrder = () => {
        navigate('/school/order/create');
    };

    const handleViewDetail = (id) => {
        const order = orders.find(ord => ord.id === id);
        setSelectedOrder(order);
        setOrderDetailDialogOpen(true);
    };

    const handleCloseOrderDetail = () => {
        setOrderDetailDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleDeleteOrder = (orderId) => {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        enqueueSnackbar('Order deleted successfully!', { variant: 'success' });
    };

    // Calculate statistics
    const stats = {
        total: orders.length,
        completed: orders.filter(order => order.status === 'completed').length,
        processing: orders.filter(order => order.status === 'processing').length,
        pending: orders.filter(order => order.status === 'pending').length
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id.localeCompare(b.id),
            defaultSortOrder: 'descend',
            width: 120,
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
            width: 130,
            filters: [...new Set(orders.map(order => order.status))].map(status => ({ text: getStatusText(status), value: status })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => (
                <Chip
                    icon={getStatusIcon(text)}
                    label={getStatusText(text)}
                    color={getStatusColor(text)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
            width: 140,
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#475569' }}>
                    {formatDate(text)}
                </Typography>
            ),
        },
        {
            title: 'School Name',
            dataIndex: 'schoolName',
            key: 'schoolName',
            align: 'left',
            width: 'auto',
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Designer',
            dataIndex: 'designerName',
            key: 'designerName',
            align: 'left',
            width: 150,
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right',
            width: 150,
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
                    {formatCurrency(text)}
                </Typography>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 120,
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
                    <Tooltip title="Edit Order">
                        <IconButton
                            sx={{
                                color: '#f59e0b',
                                '&:hover': {
                                    backgroundColor: '#fef3c7',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Order">
                        <IconButton
                            onClick={() => handleDeleteOrder(record.id)}
                            sx={{
                                color: '#ef4444',
                                '&:hover': {
                                    backgroundColor: '#fef2f2',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Box sx={{ backgroundColor: '#fafafa', height: 'max-content',overflowY: 'scroll' , flex: 1 }}>
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
                                Manage and track your school's uniform orders with ease. From order placement to delivery.
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
                <Grid container spacing={3} sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
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

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
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

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
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
                                    <RefreshIcon sx={{ color: "#f57c00", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#f57c00", mb: 1 }}>
                                    {stats.processing}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Processing
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#ff9800",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(255, 152, 0, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#fff8e1",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <PendingIcon sx={{ color: "#ff9800", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800", mb: 1 }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Pending
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
                        overflow: "hidden"
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
                                pageSizeOptions: ['5', '10'],
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

            {/* Order Detail Dialog */}
            {selectedOrder && (
                <Dialog
                    open={orderDetailDialogOpen}
                    onClose={handleCloseOrderDetail}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3 }
                    }}
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600
                    }}                    >
                        Order Details: {selectedOrder.orderNumber}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    School Information
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {selectedOrder.schoolName}
                                </Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Designer
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {selectedOrder.designerName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Order Date
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {formatDate(selectedOrder.orderDate)}
                                </Typography>
                                
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Delivery Date
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                                    {formatDate(selectedOrder.deliveryDate)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Status
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Chip
                                        icon={getStatusIcon(selectedOrder.status)}
                                        label={getStatusText(selectedOrder.status)}
                                        color={getStatusColor(selectedOrder.status)}
                                    />
                                    <Chip
                                        label={getPaymentStatusText(selectedOrder.paymentStatus)}
                                        color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={getShippingStatusText(selectedOrder.shippingStatus)}
                                        color={getShippingStatusColor(selectedOrder.shippingStatus)}
                                        variant="outlined"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Product List
                                </Typography>
                                <Box sx={{ backgroundColor: '#f8fafc', borderRadius: 2, p: 2 }}>
                                    {selectedOrder.items.map((item, index) => (
                                        <Box key={index} sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            py: 1,
                                            borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #e2e8f0' : 'none'
                                        }}>
                                            <Typography variant="body2">
                                                {item.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.quantity} x {formatCurrency(item.price)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {formatCurrency(item.quantity * item.price)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: 2,
                                    p: 2,
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#166534' }}>
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#166534' }}>
                                        {formatCurrency(selectedOrder.totalAmount)}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseOrderDetail} variant="outlined">
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                                }
                            }}
                        >
                            Edit
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}