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
    TrendingUp as StatsIcon,
    Refresh as RefreshIcon,
    Pending as PendingIcon
} from '@mui/icons-material';
import { Space, Table, Empty } from 'antd';
import 'antd/dist/reset.css';
import { parseID } from "../../utils/ParseIDUtil.jsx";
import { getOrdersByGarment } from "../../services/OrderService.jsx";
import GarmentCreateQuotation from "./dialog/GarmentCreateQuotation.jsx";



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
            Loading Pending Orders...
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
                    No pending orders available
                </Typography>
            }
        />
    </Box>
));

export default function GarmentPendingOrders() {
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
            
            const response = await getOrdersByGarment();
            if (response && response.status === 200) {
                console.log("Garment Orders: ", response.data.body);
                setOrders(response.data.body || []);
            } else {
                console.log("API failed, no data available");
                setOrders([]);
            }
            
        } catch (err) {
            console.error("Error fetching garment orders:", err);
            setError('An error occurred while fetching pending orders');
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

    // Filter orders for pending orders only
    const pendingOrders = orders.filter(order => 
        order.status === 'pending'
    );



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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return { color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)' };
            case 'processing':
                return { color: '#1976d2', bgColor: '#e3f2fd' };
            case 'completed':
                return { color: '#2e7d32', bgColor: 'rgba(46, 125, 50, 0.1)' };
            case 'cancelled':
            case 'canceled':
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
                return <TrendingUp as StatsIcon />;
            case 'completed':
                return <StatsIcon />;
            case 'cancelled':
            case 'canceled':
                return <OrderIcon />;
            default:
                return <OrderIcon />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDaysUntilDeadline = (deadline) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline;
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
            render: (text) => {
                const daysUntilDeadline = getDaysUntilDeadline(text);
                let color = '#64748b'; // default gray
                let fontWeight = 400;
                
                if (daysUntilDeadline > 30) {
                    color = '#2e7d32'; // green
                    fontWeight = 600;
                } else if (daysUntilDeadline > 14) {
                    color = '#ff9800'; // orange
                    fontWeight = 600;
                } else if (daysUntilDeadline > 0) {
                    color = '#d32f2f'; // red
                    fontWeight = 600;
                } else {
                    color = '#d32f2f'; // red for overdue
                    fontWeight = 600;
                }
                
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {formatDate(text)}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: color,
                                fontWeight: fontWeight
                            }}
                        >
                            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'}
                        </Typography>
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
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
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
                    background: "linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.08) 100%)",
                    border: "1px solid rgba(255, 152, 0, 0.1)",
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
                    <PendingIcon sx={{ fontSize: 32, mr: 2, color: "#ff9800" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Pending Orders
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
                    Monitor and manage orders awaiting production. Track deadlines and prioritize urgent requests.
                </Typography>
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
                            Pending Orders
                        </Typography>
                        <Chip
                            label={`${pendingOrders.length} Pending Orders`}
                            sx={{
                                backgroundColor: "rgba(255, 152, 0, 0.1)",
                                color: "#ff9800",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {pendingOrders.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={pendingOrders}
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
            <GarmentCreateQuotation
                visible={isModalVisible}
                onCancel={handleCloseModal}
                order={selectedOrder}
            />
        </Box>
    );
}