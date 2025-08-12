import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Divider,
    IconButton,
    Paper,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
    Chip
} from "@mui/material";
import {
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    Assignment as OrderIcon,
    TrendingUp as StatsIcon
} from '@mui/icons-material';
import { Space, Table } from 'antd';
import 'antd/dist/reset.css';
import { parseID } from "../../utils/ParseIDUtil.jsx";
import { getOrdersByGarment } from "../../services/OrderService.jsx";
import GarmentOrderDetail from "./GarmentOrderDetail.jsx";

// Mock data for fallback
const mockOrders = [
    {
        id: 1,
        status: 'pending',
        orderDate: '2024-01-15',
        deadline: '2024-02-15',
        school: {
            business: 'ABC High School',
            name: 'John Doe',
            phone: '+1234567890',
            email: 'john@abcschool.edu'
        },
        orderDetails: [
            {
                quantity: 50,
                size: 'M',
                deliveryItem: {
                    designItem: {
                        type: 'shirt',
                        gender: 'boy',
                        color: '#ff0000'
                    }
                }
            },
            {
                quantity: 30,
                size: 'L',
                deliveryItem: {
                    designItem: {
                        type: 'pants',
                        gender: 'boy',
                        color: '#000080'
                    }
                }
            }
        ],
        note: 'Rush order for graduation ceremony',
        serviceFee: 100
    },
    {
        id: 2,
        status: 'processing',
        orderDate: '2024-01-10',
        deadline: '2024-02-10',
        school: {
            business: 'XYZ Elementary School',
            name: 'Jane Smith',
            phone: '+0987654321',
            email: 'jane@xyzschool.edu'
        },
        orderDetails: [
            {
                quantity: 25,
                size: 'S',
                deliveryItem: {
                    designItem: {
                        type: 'shirt',
                        gender: 'girl',
                        color: '#ff69b4'
                    }
                }
            }
        ],
        note: '',
        serviceFee: 0
    }
];

export default function GarmentOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await getOrdersByGarment();
            if (response && response.status === 200) {
                console.log("Garment Orders: ", response.data.body);
                setOrders(response.data.body || []);
            } else {
                // Fallback to mock data if API fails
                console.log("API failed, using mock data");
                setOrders(mockOrders);
            }
            
        } catch (err) {
            console.error("Error fetching garment orders:", err);
            setError('An error occurred while fetching garment orders');
            // Fallback to mock data in case of error
            setOrders(mockOrders);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders for garment processing
    const filteredOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
    );

    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        processing: orders.filter(order => order.status === 'processing').length,
        completed: orders.filter(order => order.status === 'completed').length,
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

    const handleRetry = () => {
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
            case 'canceled':
                return 'error';
            default:
                return 'default';
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
            case 'canceled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

        return (
            <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {`${day}/${month}/${year}`}
                </Typography>
                <Typography variant="caption" sx={{ color: daysDiff > 30 ? '#e74c3c' : '#7f8c8d' }}>
                    {daysDiff < 0 ? 0 : daysDiff} day(s) ago
                </Typography>
            </Box>
        );
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            align: 'left',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{ 
                    color: '#059669', 
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
            align: 'left',
            width: 120,
            filters: [...new Set(filteredOrders.map(order => order.status))].map(status => ({
                text: getStatusText(status),
                value: status
            })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => (
                <Chip
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
            align: 'left',
            width: 150,
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (text) => formatDate(text),
        },
        {
            title: 'Delivery Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'left',
            width: 150,
            sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline),
            render: (text) => formatDate(text),
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            render: (school) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                        {school?.business || 'School Name'}
                    </Typography>
                </Box>
            ),
        },
        {
            title: 'Total Items',
            dataIndex: 'orderDetails',
            key: 'totalItems',
            align: 'center',
            width: 120,
            render: (orderDetails) => {
                const totalItems = orderDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
                const uniqueProducts = orderDetails?.length || 0;
                return (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}>
                            <OrderIcon sx={{ fontSize: 16, color: '#059669' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                {totalItems}
                            </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}>
                            {uniqueProducts} types
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'Order Info',
            key: 'orderInfo',
            align: 'left',
            width: 200,
            render: (_, record) => {
                const hasNote = record.note && record.note.trim() !== '';
                const hasServiceFee = record.serviceFee && record.serviceFee > 0;
                
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {hasNote && (
                            <Box sx={{
                                backgroundColor: '#fff3cd',
                                borderRadius: 1,
                                p: 1,
                                border: '1px solid #ffeaa7'
                            }}>
                                <Typography variant="caption" sx={{ 
                                    color: '#856404', 
                                    fontWeight: 500,
                                    display: 'block'
                                }}>
                                    Note: {record.note}
                                </Typography>
                            </Box>
                        )}
                        {hasServiceFee && (
                            <Box sx={{
                                backgroundColor: '#d1ecf1',
                                borderRadius: 1,
                                p: 1,
                                border: '1px solid #bee5eb'
                            }}>
                                <Typography variant="caption" sx={{ 
                                    color: '#0c5460', 
                                    fontWeight: 500,
                                    display: 'block'
                                }}>
                                    Service Fee: ${record.serviceFee}
                                </Typography>
                            </Box>
                        )}
                        {!hasNote && !hasServiceFee && (
                            <Typography variant="caption" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
                                No additional info
                            </Typography>
                        )}
                    </Box>
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
                <Space size="middle">
                    <Tooltip title="View Order Details">
                        <IconButton
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#059669',
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
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
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    <CircularProgress size={60} sx={{ color: '#059669' }} />
                    <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        Loading Garment Orders...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2c3e50', mb: 1 }}>
                            Production Orders
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                            Manage and track uniform production orders from schools
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                    gap: 3
                }}>
                    {/* Total Orders */}
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <OrderIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Orders
                        </Typography>
                    </Paper>

                    {/* Pending Orders */}
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <OrderIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.pending}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Pending
                        </Typography>
                    </Paper>

                    {/* Processing Orders */}
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <ShippingIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.processing}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Processing
                        </Typography>
                    </Paper>

                    {/* Completed Orders */}
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <StatsIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.completed}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Completed
                        </Typography>
                    </Paper>

                    {/* Cancelled Orders */}
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.cancelled}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Cancelled
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Table Section */}
            <Paper elevation={8} sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                            Production Orders
                        </Typography>
                        <Chip
                            label={`${filteredOrders.length} Active Orders`}
                            color="success"
                            sx={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    </Box>
                </Box>

                <Divider />

                <Box sx={{ p: 3 }}>
                    <Table
                        columns={columns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{
                            defaultPageSize: 5,
                            pageSizeOptions: ['5', '10'],
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} orders`,
                            style: { marginTop: 16 }
                        }}
                        scroll={{ x: 'max-content', y: '60vh' }}
                        style={{
                            backgroundColor: 'transparent',
                            borderRadius: '8px'
                        }}
                        rowClassName={(record, index) =>
                            index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        }
                    />
                </Box>
            </Paper>

            {/* Order Detail Modal Component */}
            <GarmentOrderDetail
                visible={isModalVisible}
                onCancel={handleCloseModal}
                order={selectedOrder}
            />
        </Container>
    );
}