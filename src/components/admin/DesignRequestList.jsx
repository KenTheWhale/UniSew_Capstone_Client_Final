import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getAllDesignRequests} from '../../services/DesignService.jsx';
import {
    Box, 
    Card, 
    CardContent, 
    Chip, 
    CircularProgress, 
    IconButton, 
    Paper, 
    Tooltip, 
    Typography,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Avatar,
    Alert,
    Stack
} from '@mui/material';
import {Table, Space, Badge} from 'antd';
import {
    CheckCircleOutlined,
    DesignServicesOutlined,
    SchoolOutlined,
    StopOutlined
} from '@mui/icons-material';
import {
    ClockCircleOutlined, 
    EyeOutlined, 
    ReloadOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import {enqueueSnackbar} from "notistack";
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {formatDateTime, formatDate} from '../../utils/TimestampUtil';
import DisplayImage from '../ui/DisplayImage.jsx';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DesignDetailPopup from './dialog/DesignDetailPopup.jsx';

// Using MUI components only, Ant icons only

const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';

    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('pant') || type.includes('quần')) {
        return <PiPantsFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt style={{fontSize: '20px'}}/>;
    } else {
        return <FileTextOutlined/>;
    }
};

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
                    No design requests found
                </Typography>
        </Alert>
    </Box>
);

export default function DesignRequestList() {
    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const fetchDesignRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching design requests...');
            const response = await getAllDesignRequests();
            console.log('API response:', response);

            if (response && response.data.body) {
                setDesignRequests(response.data.body);
                console.log('Design requests loaded:', response.data.body.length, 'items');
            } else {
                console.log('No data in response body');
                setDesignRequests([]);
            }
        } catch (err) {
            setError('Unable to load design requests');
            console.error('Error fetching design requests:', err);
            enqueueSnackbar('Error loading design requests', {variant: 'error'});
            setDesignRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDesignRequests();

        const timeoutId = setTimeout(() => {
            if (loading) {
                console.log('API call timeout, stopping loading...');
                setLoading(false);
                if (designRequests.length === 0) {
                    setError('Timeout: Unable to load data. Please try again.');
                }
            }
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [fetchDesignRequests]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'imported':
                return 'processing';
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
            case 'imported':
                return 'Imported';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
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

    const handleViewDetail = (record) => {
        setSelectedRequest(record);
        setDetailModalVisible(true);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleRefresh = () => {
        fetchDesignRequests();
    };

    const filteredRequests = useMemo(() => {
        if (!Array.isArray(designRequests)) {
            return [];
        }
        return designRequests.filter(request => {
            const matchesSearch = request.name.toLowerCase().includes(searchText.toLowerCase()) ||
                request.school.name.toLowerCase().includes(searchText.toLowerCase()) ||
                request.school.business.toLowerCase().includes(searchText.toLowerCase()) ||
                request.id.toString().includes(searchText);
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [designRequests, searchText, statusFilter]);

    const stats = useMemo(() => {
        if (!Array.isArray(designRequests)) {
            return {total: 0, pending: 0, imported: 0, completed: 0, cancelled: 0, withQuotation: 0};
        }
        const total = designRequests.length;
        const pending = designRequests.filter(r => r.status === 'pending').length;
        const imported = designRequests.filter(r => r.status === 'imported').length;
        const completed = designRequests.filter(r => r.status === 'completed').length;
        const cancelled = designRequests.filter(r => r.status === 'cancelled').length;
        const withQuotation = designRequests.filter(r => r.quotation && typeof r.quotation === 'object').length;

        return {total, pending, imported, completed, cancelled, withQuotation};
    }, [designRequests]);

    const columns = useMemo(() => [
        {
            title: 'Design ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            render: (id) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#1976d2'}}>
                    {parseID(id, "dr")}
                </Typography>
            )
        },
        {
            title: 'Design Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name, record) => (
                <Space>
                    <Avatar
                        src={record.logoImage}
                        size="small"
                        style={{border: '1px solid #d9d9d9'}}
                    />
                    <Typography variant="body2" sx={{color: '#334155', fontWeight: 500}}>
                        {name}
                    </Typography>
                </Space>
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
                        src={school.avatar}
                        size="small"
                        style={{border: '1px solid #d9d9d9'}}
                    />
                    <Box>
                        <Typography variant="body2" sx={{color: '#334155', fontWeight: 500}}>
                            {school.name}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b'}}>
                            {school.business}
                        </Typography>
                    </Box>
                </Space>
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
                {text: 'Imported', value: 'imported'},
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
            title: 'Created Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            width: 120,
            align: 'center',
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
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
                    background: "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(63, 81, 181, 0.08) 100%)",
                    border: "1px solid rgba(63, 81, 181, 0.1)",
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <DesignServicesOutlined style={{fontSize: 32, color: '#3f51b5', marginRight: 16}}/>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                mb: 1
                            }}
                        >
                            Design Requests Management
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                fontWeight: 500
                            }}
                        >
                            Track and manage all design requests from schools
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Box sx={{display: "flex", gap: 2}}>
                        <TextField
                            placeholder="Search by name, school, ID..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            size="small"
                            sx={{width: 300}}
                            InputProps={{
                                startAdornment: <InfoCircleOutlined style={{marginRight: 8, color: '#64748b'}} />
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
                                    All Status ({loading ? '...' : Array.isArray(designRequests) ? designRequests.length : 0})
                                </MenuItem>
                                <MenuItem value="pending">
                                    Pending ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'pending').length : 0})
                                </MenuItem>
                                <MenuItem value="imported">
                                    Imported ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'imported').length : 0})
                                </MenuItem>
                                <MenuItem value="completed">
                                    Completed ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'completed').length : 0})
                                </MenuItem>
                                <MenuItem value="cancelled">
                                    Cancelled ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'cancelled').length : 0})
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
                        <Button
                            onClick={() => {
                                console.log('Testing with mock data...');
                                setDesignRequests([
                                    {
                                        id: 1,
                                        name: "Test Design Request",
                                        status: "pending",
                                        creationDate: new Date().toISOString(),
                                        logoImage: "/logo.png",
                                        school: {
                                            name: "Test School",
                                            business: "Test Business",
                                            avatar: "/logo.png",
                                            account: {email: "test@test.com"}
                                        },
                                        items: [
                                            {
                                                id: 1,
                                                type: "shirt",
                                                color: "#FF0000",
                                                gender: "boy"
                                            }
                                        ],
                                        quotation: ""
                                    }
                                ]);
                                setLoading(false);
                                setError(null);
                            }}
                        >
                            Test Data
                        </Button>
                    </Box>

                    <Box sx={{display: "flex", gap: 1}}>
                        <Tooltip title="Refresh Data">
                            <IconButton
                                onClick={handleRefresh}
                                sx={{
                                    backgroundColor: '#3f51b5',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#303f9f',
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
                            icon={<DesignServicesOutlined style={{fontSize: 24}}/>}
                            value={stats.total}
                            label="Total Requests"
                            color="#3f51b5"
                        />
                        <StatCard
                            icon={<CheckCircleOutlined style={{fontSize: 24}}/>}
                            value={stats.completed}
                            label="Completed"
                            color="#4caf50"
                        />
                        <StatCard
                            icon={<ClockCircleOutlined style={{fontSize: 24}}/>}
                            value={stats.pending}
                            label="Pending"
                            color="#ff9800"
                        />
                        <StatCard
                            icon={<SchoolOutlined style={{fontSize: 24}}/>}
                            value={stats.imported}
                            label="Imported"
                            color="#2196f3"
                        />
                        <StatCard
                            icon={<StopOutlined style={{fontSize: 24}}/>}
                            value={stats.cancelled}
                            label="Cancelled"
                            color="#f44336"
                        />
                        <StatCard
                            icon={<DesignServicesOutlined style={{fontSize: 24}}/>}
                            value={stats.withQuotation}
                            label="With Quotation"
                            color="#9c27b0"
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
                            All Design Requests
                        </Typography>
                        <Chip
                            label={`${filteredRequests.length} of ${stats.total} requests`}
                            sx={{
                                backgroundColor: "#e3f2fd",
                                color: "#3f51b5",
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
                            <CircularProgress size={40} sx={{color: '#3f51b5', mb: 2}}/>
                            <Typography variant="body1" sx={{color: '#64748b'}}>
                                Loading design requests...
                            </Typography>
                        </Box>
                    ) : filteredRequests.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredRequests}
                            rowKey="id"
                            loading={false}
                            pagination={{
                                defaultPageSize: 10,
                                pageSizeOptions: ['5', '10', '20'],
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `Showing ${range[0]}-${range[1]} of ${total} requests`,
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

            {/* Detail Modal - Using DesignDetailPopup component */}
            <DesignDetailPopup
                open={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                selectedRequest={selectedRequest}
            />
        </Box>
    );
}