import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Avatar,
    Box,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {
    Assignment as OrderIcon,
    Business as SchoolIcon,
    CheckCircle as CompletedIcon,
    Info as InfoIcon,
    Inventory as InventoryIcon,
    Pending as PendingIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {DataLoadingState, EmptyState, ErrorState} from '../ui/LoadingSpinner.jsx';
import {Space, Table} from 'antd';
import 'antd/dist/reset.css';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {getGarmentOrders, getOrdersByGarment} from "../../services/OrderService.jsx";
import GarmentCreateQuotation from "./dialog/GarmentCreateQuotation.jsx";

const LoadingState = React.memo(() => (
    <DataLoadingState
        text="Loading My Orders..."
        size={60}
        color="#3f51b5"
    />
));

const ErrorStateComponent = React.memo(({error, onRetry, isRetrying}) => (
    <ErrorState
        error={error}
        onRetry={onRetry}
        isRetrying={isRetrying}
        retryText="Retry"
        errorTitle="Error Loading Orders"
    />
));

const EmptyStateComponent = React.memo(() => (
    <EmptyState
        title="No orders found"
        description="No orders match your current filters"
        icon="📦"
    />
));

export default function MyOrders() {
    const navigate = useNavigate();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);

    // Tab and filter states
    const [currentTab, setCurrentTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states for quotation (for pending orders)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const tabsConfig = [
        {
            label: 'Pending Orders',
            status: 'pending',
            color: '#ff9800',
            icon: <PendingIcon/>,
            description: 'Orders awaiting quotation and approval'
        },
        {
            label: 'Rejected Orders',
            status: 'rejected',
            color: '#f44336',
            icon: <CompletedIcon/>,
            description: 'Orders that have been rejected'
        }
    ];

    const fetchPendingOrders = useCallback(async () => {
        try {
            const response = await getOrdersByGarment();
            if (response && response.status === 200) {
                console.log("Pending Orders Data: ", response.data.body);
                const pending = (response.data.body || []).filter(order => order.status === 'pending');
                setPendingOrders(pending);
            } else {
                console.log("Pending orders API failed");
                setPendingOrders([]);
            }
        } catch (err) {
            console.error("Error fetching pending orders:", err);
            setPendingOrders([]);
            throw err;
        }
    }, []);

    const fetchRejectedOrders = useCallback(async () => {
        try {
            const response = await getOrdersByGarment();
            if (response && response.status === 200) {
                console.log("Rejected Orders Data: ", response.data.body);
                const rejected = (response.data.body || []).filter(order => order.status === 'rejected');
                setRejectedOrders(rejected);
            } else {
                console.log("Rejected orders API failed");
                setRejectedOrders([]);
            }
        } catch (err) {
            console.error("Error fetching rejected orders:", err);
            setRejectedOrders([]);
            throw err;
        }
    }, []);

    const fetchOrders = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            await Promise.all([fetchPendingOrders(), fetchRejectedOrders()]);

        } catch (err) {
            console.error("Error fetching orders:", err);
            setError('An error occurred while fetching orders');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, [fetchPendingOrders, fetchRejectedOrders]);

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

    // Filter orders based on current tab and search term
    useEffect(() => {
        let filtered = [];

        // Get data based on current tab
        const currentTabStatus = tabsConfig[currentTab]?.status;
        if (currentTabStatus === 'pending') {
            filtered = pendingOrders;
        } else if (currentTabStatus === 'rejected') {
            filtered = rejectedOrders;
        }

        // Filter by search term (order ID, school name)
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                parseID(order.id, 'ord').toLowerCase().includes(searchLower) ||
                order.school?.business?.toLowerCase().includes(searchLower) ||
                order.school?.name?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredOrders(filtered);
    }, [pendingOrders, rejectedOrders, currentTab, searchTerm, tabsConfig]);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        fetchOrders();
    }, [fetchOrders]);

    const handleViewDetail = (id) => {
        const currentTabStatus = tabsConfig[currentTab]?.status;

        if (currentTabStatus === 'pending') {
            // For pending orders, show quotation modal
            const order = pendingOrders.find(ord => ord.id === id);
            setSelectedOrder(order);
            setIsModalVisible(true);
        } else if (currentTabStatus === 'rejected') {
            // For rejected orders, just view details (no special action needed)
            console.log('View rejected order detail for ID:', id);
            // You may want to implement a different view for rejected orders
            // For now, we'll just log it
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const getStatusColor = (status) => {
        const tabConfig = tabsConfig.find(tab => tab.status === status);
        return tabConfig ? tabConfig.color : '#64748b';
    };

    const getStatusIcon = (status) => {
        const tabConfig = tabsConfig.find(tab => tab.status === status);
        return tabConfig ? tabConfig.icon : <OrderIcon/>;
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

    const getDaysUntilDeadline = (deadline) => {
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline;
    };

    const getStatusCounts = () => {
        const counts = {};

        // Initialize counts for each tab
        tabsConfig.forEach(tab => {
            counts[tab.status] = 0;
        });

        // Count pending orders
        counts.pending = pendingOrders.length;

        // Count rejected orders
        counts.rejected = rejectedOrders.length;

        return counts;
    };

    const statusCounts = getStatusCounts();

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
            width: 120,
            render: (status) => {
                const color = getStatusColor(status);
                const icon = getStatusIcon(status);

                return (
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
                        <Box sx={{color: color, display: 'flex', alignItems: 'center'}}>
                            {React.cloneElement(icon, {sx: {fontSize: 16}})}
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: color,
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'School Info',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 250,
            render: (school) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar
                        src={school?.avatar}
                        sx={{width: 40, height: 40}}
                    >
                        <SchoolIcon/>
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                            {school?.business || 'School Name'}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b'}}>
                            {school?.name || 'Contact Name'}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            align: 'center',
            width: 120,
            render: (text) => {
                const orderDate = new Date(text);
                orderDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysSinceOrder = Math.ceil((today - orderDate) / (1000 * 60 * 60 * 24));

                return (
                    <Box sx={{textAlign: 'center'}}>
                        <Typography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                            {formatDate(text)}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{color: '#64748b'}}
                        >
                            {daysSinceOrder === 0 ? 'Today' : daysSinceOrder === 1 ? '1 day ago' : `${daysSinceOrder} days ago`}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            align: 'center',
            width: 120,
            render: (text) => {
                const daysUntilDeadline = getDaysUntilDeadline(text);
                let color = '#64748b';
                let fontWeight = 400;

                if (daysUntilDeadline > 30) {
                    color = '#2e7d32';
                    fontWeight = 600;
                } else if (daysUntilDeadline > 14) {
                    color = '#ff9800';
                    fontWeight = 600;
                } else if (daysUntilDeadline > 0) {
                    color = '#d32f2f';
                    fontWeight = 600;
                } else {
                    color = '#d32f2f';
                    fontWeight = 600;
                }

                return (
                    <Box sx={{textAlign: 'center'}}>
                        <Typography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
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
            title: 'Total Uniforms',
            dataIndex: 'orderDetails',
            key: 'totalItems',
            align: 'center',
            width: 100,
            render: (orderDetails) => {
                const totalItems = orderDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                            {totalItems/2}
                        </Typography>
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
                            <InfoIcon/>
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
        return <ErrorStateComponent error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
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
                    background: "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(63, 81, 181, 0.08) 100%)",
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
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <OrderIcon sx={{fontSize: 32, mr: 2, color: "#3f51b5"}}/>
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
                    {tabsConfig[currentTab]?.description || 'Manage your orders efficiently across different stages of production.'}
                </Typography>
            </Box>

            {/* Tabs Section */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                }}
            >
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        backgroundColor: '#f8fafc',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 2,
                        },
                        '& .MuiTabs-indicator': {
                            height: 3,
                        }
                    }}
                >
                    {tabsConfig.map((tab, index) => (
                        <Tab
                            key={index}
                            label={
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    {React.cloneElement(tab.icon, {sx: {fontSize: 20}})}
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {tab.label} ({statusCounts[tab.status]})
                                    </Typography>
                                </Box>
                            }
                            sx={{
                                color: tab.color,
                                '&.Mui-selected': {
                                    color: tab.color,
                                    backgroundColor: `${tab.color}10`
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Search Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                }}
            >
                <TextField
                    placeholder="Search by Order ID or School name..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{color: '#64748b'}}/>
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Orders Table */}
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
                            {tabsConfig[currentTab]?.label || 'Orders List'}
                        </Typography>
                        <Chip
                            label={`${filteredOrders.length} ${searchTerm ? 'filtered' : 'total'} orders`}
                            sx={{
                                backgroundColor: `${tabsConfig[currentTab]?.color}15`,
                                color: tabsConfig[currentTab]?.color || "#3f51b5",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {filteredOrders.length === 0 ? (
                        <EmptyStateComponent/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredOrders}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 10,
                                pageSizeOptions: ['5', '10', '20'],
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

            {/* Quotation Modal for Pending Orders */}
            <GarmentCreateQuotation
                visible={isModalVisible}
                onCancel={handleCloseModal}
                order={selectedOrder}
            />
        </Box>
    );
}
