import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Paper,
    Chip
} from '@mui/material';
import {
    Table,
    Badge,
    Tag,
    Space,
    Rate,
    Col,
    Row
} from 'antd';
import {
    Avatar,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert
} from '@mui/material';
import {
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import {
    ShoppingCartOutlined as ShoppingCartIcon,
    CheckCircleOutlined as CheckCircleIcon,
    PendingActionsOutlined as PendingIcon,
    LocalShippingOutlined as ShippingIcon,
    CancelOutlined as CancelIcon,
    SchoolOutlined
} from '@mui/icons-material';
import {getAllOrdersForAdmin} from '../../services/OrderService';
import {parseID} from '../../utils/ParseIDUtil';
import {formatDateTime, formatDate} from '../../utils/TimestampUtil';
import {enqueueSnackbar} from 'notistack';
import DisplayImage from '../ui/DisplayImage.jsx';
import OrderAdminDetailPopup from './dialog/OrderAdminDetailPopup.jsx';

// Using MUI components only, Ant icons only

// Statistics Card Component
const StatCard = React.memo(({icon, value, label, color, bgColor}) => (
    <Card
        sx={{
            height: '100%',
            background: bgColor || `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
            border: `1px solid ${color}20`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${color}25`
            }
        }}
    >
        <CardContent sx={{p: 3}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: color,
                            mb: 0.5
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748b',
                            fontWeight: 500
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: `${color}10`,
                        color: color
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
));

// Empty State Component
const EmptyState = () => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8
    }}>
        <Alert severity="info" sx={{ border: 'none', backgroundColor: 'transparent' }}>
            <Typography variant="body1" sx={{color: '#64748b'}}>
                No orders found
            </Typography>
        </Alert>
    </Box>
);

export default function OrderList() {
    // States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching orders...');
            const response = await getAllOrdersForAdmin();
            console.log('API response:', response);

            if (response && response.data.body) {
                setOrders(response.data.body);
                console.log('Orders loaded:', response.data.body.length, 'items');
            } else {
                console.log('No data in response body');
                setOrders([]);
            }
        } catch (err) {
            setError('Unable to load orders');
            console.error('Error fetching orders:', err);
            enqueueSnackbar('Error loading orders', {variant: 'error'});
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();

        const timeoutId = setTimeout(() => {
            if (loading) {
                console.log('API call timeout, stopping loading...');
                setLoading(false);
                if (orders.length === 0) {
                    setError('Timeout: Unable to load data. Please try again.');
                }
            }
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [fetchOrders]);

    // Status configuration
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'processing';
            case 'delivering':
                return 'cyan';
            case 'completed':
                return 'success';
            case 'cancelled':
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
            case 'delivering':
                return 'Delivering';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Get total items count
    const getTotalItems = (orderDetails) => {
        return orderDetails?.reduce((total, detail) => total + (detail.quantity || 0), 0) || 0;
    };

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleRefresh = () => {
        fetchOrders();
    };

    const handleViewDetail = (record) => {
        setSelectedOrder(record);
        setDetailModalVisible(true);
    };

    // Filtered data
    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) {
            return [];
        }
        return orders.filter(order => {
            const matchesSearch = order.school?.name.toLowerCase().includes(searchText.toLowerCase()) ||
                order.school?.business.toLowerCase().includes(searchText.toLowerCase()) ||
                order.selectedDesign?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                parseID(order.id, 'ord').toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchText, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        if (!Array.isArray(orders)) {
            return {total: 0, pending: 0, processing: 0, delivering: 0, completed: 0, cancelled: 0};
        }
        const total = orders.length;
        const pending = orders.filter(o => o.status === 'pending').length;
        const processing = orders.filter(o => o.status === 'processing').length;
        const delivering = orders.filter(o => o.status === 'delivering').length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;

        return {total, pending, processing, delivering, completed, cancelled};
    }, [orders]);

    // Table columns
    const columns = useMemo(() => [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            render: (id) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#1976d2'}}>
                    {parseID(id, "ord")}
                </Typography>
            )
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
            width: 250,
            render: (school) => (
                <Space>
                    <Avatar
                        src={school?.avatar}
                        size="small"
                        style={{border: '1px solid #d9d9d9'}}
                    >
                        {school?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{color: '#334155', fontWeight: 500}}>
                            {school?.name}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b'}}>
                            {school?.business}
                        </Typography>
                    </Box>
                </Space>
            )
        },
        {
            title: 'Design',
            dataIndex: 'selectedDesign',
            key: 'selectedDesign',
            width: 200,
            render: (design, record) => (
                <Box>
                        <Typography variant="body2" sx={{color: '#334155', fontWeight: 500}}>
                            {design?.name || 'No design'}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b'}}>
                            {getTotalItems(record.orderDetails)} items
                        </Typography>
                </Box>
            )
        },
        {
            title: 'Garment',
            dataIndex: 'garment',
            key: 'garment',
            width: 180,
            render: (garment) => (
                <Box>
                    {garment ? (
                        <>
                            <Typography variant="body2" sx={{color: '#334155', fontWeight: 500}}>
                                {garment.customer?.name}
                            </Typography>
                            <Typography variant="caption" sx={{color: '#64748b'}}>
                                {garment.customer?.business}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" sx={{color: '#94a3b8', fontStyle: 'italic'}}>
                            No garment factory
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price) => (
                <Typography variant="body2" sx={{color: '#059669', fontWeight: 600}}>
                    {formatCurrency(price || 0)}
                </Typography>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            filters: [
                {text: 'Pending', value: 'pending'},
                {text: 'Processing', value: 'processing'},
                {text: 'Delivering', value: 'delivering'},
                {text: 'Completed', value: 'completed'},
                {text: 'Cancelled', value: 'cancelled'}
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Badge
                    status={getStatusColor(status)}
                    text={getStatusText(status)}
                />
            )
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 120,
            align: 'center',
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (date) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDate(date)}
                </Typography>
            )
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            width: 120,
            align: 'center',
            sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline),
            render: (date) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDate(date)}
                </Typography>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="View Details">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetail(record)}
                        style={{display: 'flex', alignItems: 'center', padding: '4px 8px'}}
                    >
                        <EyeOutlined style={{fontSize: 16}}/>
                    </Button>
                </Tooltip>
            )
        }
    ], []);

    return (
        <Box sx={{
            height: '100%',
            overflowY: 'auto',
            '& @keyframes pulse': {
                '0%': {opacity: 1},
                '50%': {opacity: 0.4},
                '100%': {opacity: 1}
            }
        }}>
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.08) 100%)",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <ShoppingCartIcon style={{fontSize: 32, color: '#3b82f6', marginRight: 16}}/>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                mb: 1
                            }}
                        >
                            Order Management
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                fontWeight: 500
                            }}
                        >
                            Track and manage all orders in the system
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Box sx={{display: "flex", gap: 2}}>
                        <TextField
                            placeholder="Search by school, design, order ID..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            size="small"
                            sx={{width: 300}}
                            InputProps={{
                                startAdornment: <SearchOutlined style={{marginRight: 8, color: '#64748b'}} />
                            }}
                        />
                        <FormControl size="small" sx={{width: 150}}>
                            <InputLabel>Filter by status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                disabled={loading}
                                label="Filter by status"
                            >
                                <MenuItem value="all">
                                    All Status ({loading ? '...' : Array.isArray(orders) ? orders.length : 0})
                                </MenuItem>
                                <MenuItem value="pending">
                                    Pending ({loading ? '...' : Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0})
                                </MenuItem>
                                <MenuItem value="processing">
                                    Processing ({loading ? '...' : Array.isArray(orders) ? orders.filter(o => o.status === 'processing').length : 0})
                                </MenuItem>
                                <MenuItem value="delivering">
                                    Delivering ({loading ? '...' : Array.isArray(orders) ? orders.filter(o => o.status === 'delivering').length : 0})
                                </MenuItem>
                                <MenuItem value="completed">
                                    Completed ({loading ? '...' : Array.isArray(orders) ? orders.filter(o => o.status === 'completed').length : 0})
                                </MenuItem>
                                <MenuItem value="cancelled">
                                    Cancelled ({loading ? '...' : Array.isArray(orders) ? orders.filter(o => o.status === 'cancelled').length : 0})
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            onClick={() => {
                                setSearchText('');
                                setStatusFilter('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Box>

                    <Box sx={{display: "flex", gap: 1}}>
                        <Tooltip title="Refresh Data">
                            <IconButton
                                onClick={handleRefresh}
                                sx={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#2563eb',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ReloadOutlined/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4}}>
                {loading ? (
                    Array.from({length: 6}).map((_, index) => (
                        <Card key={index} sx={{height: '100%', borderRadius: 2}}>
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 40,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 1,
                                                mb: 1,
                                                animation: 'pulse 1.5s ease-in-out infinite'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 16,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 1,
                                                animation: 'pulse 1.5s ease-in-out infinite'
                                            }}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 2,
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <StatCard
                            icon={<ShoppingCartIcon style={{fontSize: 24}}/>}
                            value={stats.total}
                            label="Total Orders"
                            color="#3b82f6"
                        />
                        <StatCard
                            icon={<CheckCircleIcon style={{fontSize: 24}}/>}
                            value={stats.completed}
                            label="Completed"
                            color="#10b981"
                        />
                        <StatCard
                            icon={<PendingIcon style={{fontSize: 24}}/>}
                            value={stats.pending}
                            label="Pending"
                            color="#f59e0b"
                        />
                        <StatCard
                            icon={<ShippingIcon style={{fontSize: 24}}/>}
                            value={stats.processing}
                            label="Processing"
                            color="#3b82f6"
                        />
                        <StatCard
                            icon={<ShippingIcon style={{fontSize: 24}}/>}
                            value={stats.delivering}
                            label="Delivering"
                            color="#8b5cf6"
                        />
                        <StatCard
                            icon={<CancelIcon style={{fontSize: 24}}/>}
                            value={stats.cancelled}
                            label="Cancelled"
                            color="#ef4444"
                        />
                    </>
                )}
            </Box>

            {/* Main Table */}
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
                            All Orders
                        </Typography>
                        <Chip
                            label={`${filteredOrders.length} of ${stats.total} orders`}
                            sx={{
                                backgroundColor: "#e3f2fd",
                                color: "#3b82f6",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8
                        }}>
                            <CircularProgress size={40} sx={{color: '#3b82f6', mb: 2}}/>
                            <Typography variant="body1" sx={{color: '#64748b'}}>
                                Loading orders...
                            </Typography>
                        </Box>
                    ) : filteredOrders.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredOrders}
                            rowKey="id"
                            loading={false}
                            pagination={{
                                defaultPageSize: 10,
                                pageSizeOptions: ['5', '10', '20'],
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `Showing ${range[0]}-${range[1]} of ${total} orders`,
                                style: {marginTop: 16}
                            }}
                            scroll={{x: 'max-content'}}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </Box>
            </Paper>

            {/* Order Detail Modal */}
            <OrderAdminDetailPopup
                open={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                selectedOrder={selectedOrder}
            />
        </Box>
    );
}