import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Container,
    Divider,
    IconButton,
    Paper,
    Card,
    CardContent,
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    Button
} from "@mui/material";
import {
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    Assignment as OrderIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    Factory as FactoryIcon
} from '@mui/icons-material';
import { Space, Table, Empty } from 'antd';
import 'antd/dist/reset.css';
import { parseID } from "../../utils/ParseIDUtil.jsx";
import { getGarmentOrders } from "../../services/OrderService.jsx";
import GarmentOrderDetail from "./dialog/GarmentOrderDetail.jsx";

// Status Tag Component
const StatusTag = React.memo(({ status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return { color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)' };
            case 'processing':
                return { color: '#1976d2', bgColor: '#e3f2fd' };
            case 'delivering':
                return { color: '#9c27b0', bgColor: 'rgba(156, 39, 176, 0.1)' };
            case 'completed':
                return { color: '#2e7d32', bgColor: 'rgba(46, 125, 50, 0.1)' };
            case 'cancelled':
            case 'canceled':
                return { color: '#d32f2f', bgColor: '#ffebee' };
            default:
                return { color: '#64748b', bgColor: '#f1f5f9' };
        }
    };
    
    const { color, bgColor } = getStatusColor(status);
    const displayStatus = status === 'delivering' ? 'Delivered' : status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
        <Typography
            variant="body2"
            sx={{
                color: color,
                backgroundColor: bgColor,
                padding: '4px 12px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'inline-block',
                textAlign: 'center',
                minWidth: '80px'
            }}
        >
            {displayStatus}
        </Typography>
    );
});



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
        <CircularProgress size={60} sx={{color: '#3f51b5'}}/>
        <Typography variant="h6" sx={{color: '#1e293b', fontWeight: 600}}>
            Loading Production Orders...
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
                    No production orders available
                </Typography>
            }
        />
    </Box>
));

export default function GarmentOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch orders from API
    const fetchOrders = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');
            
            const response = await getGarmentOrders();
            if (response && response.status === 200) {
                console.log("Garment Orders: ", response.data.body);
                setOrders(response.data.body || []);
            } else {
                console.log("API failed, no data available");
                setOrders([]);
            }
            
        } catch (err) {
            console.error("Error fetching garment orders:", err);
            setError('An error occurred while fetching production orders');
            setOrders([]);
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

    // Filter orders for garment processing - show orders with status other than pending
    const filteredOrders = orders.filter(order => 
        order.status !== 'pending'
    );

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
        completed: orders.filter(order => order.status === 'completed').length,
        delivered: orders.filter(order => order.status === 'delivering').length,
        cancelled: orders.filter(order => order.status === 'cancelled' || order.status === 'canceled').length
    };

    const handleViewDetail = (id) => {
        console.log('View order detail for ID:', id);
        const order = orders.find(ord => ord.id === id);
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <OrderIcon />;
            case 'processing':
                return <TrendingUpIcon />;
            case 'delivering':
                return <ShippingIcon />;
            case 'completed':
                return <TrendingUpIcon />;
            case 'cancelled':
            case 'canceled':
                return <OrderIcon />;
            default:
                return <OrderIcon />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        
        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // Calculate days difference
        const timeDiff = date.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        if (daysDiff > 0) {
            return `${day}/${month}/${year} (+${daysDiff}d)`;
        } else if (daysDiff < 0) {
            return `${day}/${month}/${year} (${daysDiff}d)`;
        } else {
            return `${day}/${month}/${year}`;
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
                <Typography variant="body2" sx={{ 
                    color: '#3f51b5', 
                    fontWeight: 600,
                    fontFamily: 'monospace'
                }}>
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
            render: (status) => <StatusTag status={status} />,
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
            width: 140,
            render: (text) => {
                const date = new Date(text);
                const today = new Date();
                const timeDiff = date.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const dateStr = date.toDateString() === today.toDateString() ? 'Today' : `${day}/${month}/${year}`;
                
                let dayCounter = '';
                let dayCounterColor = '#1976d2'; // Blue color for day counter
                
                if (daysDiff > 0) {
                    dayCounter = `${daysDiff} days left`;
                } else if (daysDiff < 0) {
                    dayCounter = `${Math.abs(daysDiff)} days ago`;
                }
                
                const isToday = dateStr === 'Today';
                
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: isToday ? '#3f51b5' : '#64748b',
                                fontWeight: isToday ? 600 : 400,
                                fontSize: isToday ? '0.875rem' : '0.75rem',
                                mb: dayCounter ? 0.5 : 0
                            }}
                        >
                            {dateStr}
                        </Typography>
                        {dayCounter && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: isToday ? '#3f51b5' : dayCounterColor,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    fontWeight: 500
                                }}
                            >
                                {dayCounter}
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'center',
            width: 140,
            render: (text) => {
                const date = new Date(text);
                const today = new Date();
                const timeDiff = date.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const dateStr = date.toDateString() === today.toDateString() ? 'Today' : `${day}/${month}/${year}`;
                
                let dayCounter = '';
                let dayCounterColor = '#94a3b8';
                
                if (daysDiff > 0) {
                    dayCounter = `${daysDiff} days left`;
                    // Color coding based on days remaining
                    if (daysDiff > 30) {
                        dayCounterColor = '#2e7d32'; // Green
                    } else if (daysDiff > 14) {
                        dayCounterColor = '#ff9800'; // Orange
                    } else {
                        dayCounterColor = '#d32f2f'; // Red
                    }
                } else if (daysDiff < 0) {
                    dayCounter = `${Math.abs(daysDiff)} days ago`;
                    dayCounterColor = '#d32f2f'; // Red for overdue
                }
                
                const isToday = dateStr === 'Today';
                const isOverdue = daysDiff < 0;
                
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: isToday ? '#ff9800' : isOverdue ? '#d32f2f' : '#64748b',
                                fontWeight: isToday || isOverdue ? 600 : 400,
                                fontSize: isToday || isOverdue ? '0.875rem' : '0.75rem',
                                mb: dayCounter ? 0.5 : 0
                            }}
                        >
                            {dateStr}
                        </Typography>
                        {dayCounter && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: isToday ? '#ff9800' : dayCounterColor,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    fontWeight: 500
                                }}
                            >
                                {dayCounter}
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            render: (school) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: 500, 
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '280px'
                    }}
                    title={school?.business || 'School Name'}
                >
                    {school?.business || 'School Name'}
                </Typography>
            ),
        },
        {
            title: 'Total Uniforms',
            dataIndex: 'orderDetails',
            key: 'totalUniforms',
            align: 'center',
            width: 120,
            render: (orderDetails) => {
                const totalItems = orderDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
                const totalUniforms = Math.ceil(totalItems / 2);
                return (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {totalUniforms}
                    </Typography>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Order Details">
                        <IconButton
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#3f51b5',
                                '&:hover': {
                                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                </Space>
            ),
        },
    ];

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
                    background: "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)",
                    border: "1px solid rgba(63, 81, 181, 0.1)",
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
                    <FactoryIcon sx={{ fontSize: 32, mr: 2, color: "#3f51b5" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Production Orders
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
                    Manage and track uniform production orders from schools with status tracking.
                </Typography>
            </Box>

            {/* Statistics Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(63, 81, 181, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 1.5
                                }}
                            >
                                <OrderIcon sx={{ color: "#3f51b5", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#3f51b5", mb: 0.5 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Total Orders
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
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
                                <OrderIcon sx={{ color: "#ff9800", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9800", mb: 0.5 }}>
                                {stats.pending}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Pending
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
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
                                <TrendingUpIcon sx={{ color: "#1976d2", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}>
                                {stats.processing}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Processing
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
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
                                <ShippingIcon sx={{ color: "#9c27b0", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#9c27b0", mb: 0.5 }}>
                                {stats.delivered}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Delivered
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
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
                                <TrendingUpIcon sx={{ color: "#2e7d32", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32", mb: 0.5 }}>
                                {stats.completed}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Completed
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            border: "1px solid #e2e8f0",
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ textAlign: "center", p: 2 }}>
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
                                <OrderIcon sx={{ color: "#d32f2f", fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#d32f2f", mb: 0.5 }}>
                                {stats.cancelled}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                Cancelled
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
                <Box sx={{ p: 3, backgroundColor: "white" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#1e293b"
                            }}
                        >
                            Production Orders
                        </Typography>
                        <Chip
                            label={`${filteredOrders.length} Total`}
                            sx={{
                                backgroundColor: "rgba(255, 152, 0, 0.1)",
                                color: "#ff9800",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {filteredOrders.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredOrders}
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
                    )}
                </Box>
            </Paper>

            {/* Order Detail Modal Component */}
            <GarmentOrderDetail
                visible={isModalVisible}
                onCancel={handleCloseModal}
                order={selectedOrder}
            />
        </Box>
    );
}