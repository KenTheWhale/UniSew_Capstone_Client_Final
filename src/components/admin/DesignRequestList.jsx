import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getAllDesignRequests} from '../../services/DesignService.jsx';
import {Box, Card, CardContent, Chip, CircularProgress, IconButton, Paper, Tooltip, Typography, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {Avatar, Badge, Button, Descriptions, Empty, Input, Modal, Select, Space, Table, Tag} from 'antd';
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
    InfoCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    PictureOutlined,
    DollarOutlined
} from "@ant-design/icons";
import {enqueueSnackbar} from "notistack";
import {parseID} from "../../utils/ParseIDUtil.jsx";

const {Search} = Input;
const {Option} = Select;
const {Text} = Typography;

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
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Typography variant="body1" sx={{color: '#64748b', mt: 2}}>
                    No design requests found
                </Typography>
            }
        />
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
                        <Search
                            placeholder="Search by name, school, ID..."
                            allowClear
                            style={{width: 300}}
                            onSearch={handleSearch}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            placeholder="Filter by status"
                            style={{width: 150}}
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            loading={loading}
                        >
                            <Option value="all">All Status
                                ({loading ? '...' : Array.isArray(designRequests) ? designRequests.length : 0})</Option>
                            <Option value="pending">Pending
                                ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'pending').length : 0})</Option>
                            <Option value="imported">Imported
                                ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'imported').length : 0})</Option>
                            <Option value="completed">Completed
                                ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'completed').length : 0})</Option>
                            <Option value="cancelled">Cancelled
                                ({loading ? '...' : Array.isArray(designRequests) ? designRequests.filter(r => r.status === 'cancelled').length : 0})</Option>
                        </Select>
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

            {/* Detail Modal - Based on RequestDetailPopup Layout */}
            <Dialog
                open={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '85vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0',
                    background: '#ffffff',
                    color: '#1f2937',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {/* Top accent bar */}
                    <Box sx={{
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
                        width: '100%'
                    }} />
                    
                    <Box sx={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 52,
                                height: 52,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                position: 'relative'
                            }}>
                                <InfoCircleOutlined style={{
                                    color: 'white',
                                    fontSize: '24px'
                                }}/>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    border: '2px solid #10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Box sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#10b981'
                                    }} />
                                </Box>
                            </Box>
                            
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Text style={{
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    color: '#111827',
                                    letterSpacing: '-0.025em'
                                }}>
                                    Design Request Details
                                </Text>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Text style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        fontWeight: 500,
                                        background: '#f3f4f6',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        ID: {selectedRequest ? parseID(selectedRequest.id, 'dr') : ''}
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: '#f3f4f6',
                                    borderColor: '#d1d5db',
                                    transform: 'scale(1.05)'
                                }
                            }} onClick={() => setDetailModalVisible(false)}>
                                <CloseCircleOutlined style={{
                                    color: '#6b7280',
                                    fontSize: '20px'
                                }}/>
                            </Box>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    {selectedRequest && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {/* Request Information Section */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                p: 3,
                                mt: 4,
                                background: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Background Pattern */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '120px',
                                    height: '120px',
                                    background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
                                    pointerEvents: 'none'
                                }} />
                                
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {/* Left Side - Request Details */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 56,
                                            height: 56,
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                            border: '2px solid #e2e8f0',
                                            position: 'relative'
                                        }}>
                                            <FileTextOutlined style={{
                                                color: '#10b981',
                                                fontSize: '24px'
                                            }}/>
                                        </Box>
                                        
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1
                                        }}>
                                            <Text style={{
                                                fontWeight: 700,
                                                fontSize: '18px',
                                                color: '#111827',
                                                letterSpacing: '-0.025em'
                                            }}>
                                                {selectedRequest.name}
                                            </Text>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2
                                            }}>
                                                <Text style={{
                                                    fontSize: '13px',
                                                    color: '#6b7280',
                                                    fontWeight: 500,
                                                    background: '#f9fafb',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    {parseID(selectedRequest.id, 'dr')}
                                                </Text> 
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    {/* Right Side - Status */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        gap: 1
                                    }}>
                                        <Text style={{
                                            fontSize: '11px',
                                            color: '#6b7280',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Current Status
                                        </Text>
                                        <Box sx={{
                                            transform: 'scale(1.2)',
                                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                                        }}>
                                            <Badge
                                                status={getStatusColor(selectedRequest.status)}
                                                text={getStatusText(selectedRequest.status)}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                
                                {/* Bottom Info Bar */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    pt: 2,
                                    mt: 2,
                                    borderTop: '1px solid #f3f4f6',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 2,
                                            py: 1,
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(16, 185, 129, 0.1)'
                                        }}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: '#10b981'
                                            }} />
                                            <Text style={{
                                                fontSize: '12px',
                                                color: '#10b981',
                                                fontWeight: 600
                                            }}>
                                                {selectedRequest.status === 'imported' ? 'Imported Design' : 'Design Request'}
                                            </Text>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <ClockCircleOutlined style={{
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }} />
                                        <Text style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            fontWeight: 500
                                        }}>
                                            Created: {formatDate(selectedRequest.creationDate)}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>

                            {/* School Information Section */}
                            <Card
                                title={
                                    <Space>
                                        <SchoolOutlined style={{color: '#2e7d32'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>School Information</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    marginTop: '16px'
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Avatar
                                        size={48}
                                        src={selectedRequest.school.avatar || selectedRequest.school.name.charAt(0)}
                                        style={{
                                            border: '2px solid #2e7d32',
                                            backgroundColor: '#2e7d32'
                                        }}
                                    >
                                        {selectedRequest.school.name.charAt(0)}
                                    </Avatar>
                                    <Box sx={{flex: 1}}>
                                        <Text style={{fontWeight: 600, fontSize: '14px', color: '#1e293b'}}>
                                            {selectedRequest.school.name}
                                        </Text>
                                        <Text style={{fontSize: '12px', color: '#64748b', display: 'block'}}>
                                            {selectedRequest.school.business}
                                        </Text>
                                        <Text style={{fontSize: '12px', color: '#64748b', display: 'block'}}>
                                            {selectedRequest.school.account.email}
                                        </Text>
                                    </Box>
                                </Box>
                            </Card>

                            {/* Logo Image Section */}
                            {selectedRequest.logoImage && (
                                <Card
                                    title={
                                        <Space>
                                            <PictureOutlined style={{color: '#2e7d32'}}/>
                                            <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Image</span>
                                        </Space>
                                    }
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        marginTop: '16px'
                                    }}
                                >
                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 1}}>
                                        <img
                                            src={selectedRequest.logoImage}
                                            alt="Logo Design"
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'contain',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Box>
                                </Card>
                            )}

                            {/* Design Items Section */}
                            <Card
                                title={
                                    <Space>
                                        <FileTextOutlined style={{color: '#2e7d32'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>
                                            Design Items ({selectedRequest.items?.length || 0})
                                        </span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    marginTop: '16px'
                                }}
                            >
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    {selectedRequest.items?.map((item, index) => (
                                        <Box
                                            key={item.id || index}
                                            sx={{
                                                p: 2,
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                background: '#f9fafb'
                                            }}
                                        >
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                                <Text style={{fontWeight: 600, fontSize: '14px'}}>
                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                </Text>
                                                <Tag color={item.gender === 'boy' ? 'blue' : 'pink'}>
                                                    {item.gender === 'boy' ? 'Boy' : 'Girl'}
                                                </Tag>
                                                <Tag>#{index + 1}</Tag>
                                            </Box>
                                            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
                                                <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                    <strong>Fabric:</strong> {item.fabricName}
                                                </Text>
                                                <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                    <strong>Color:</strong> {item.color}
                                                </Text>
                                                {item.logoPosition && (
                                                    <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                        <strong>Logo Position:</strong> {item.logoPosition}
                                                    </Text>
                                                )}
                                                {item.note && (
                                                    <Text style={{fontSize: '12px', color: '#64748b', gridColumn: 'span 2'}}>
                                                        <strong>Note:</strong> {item.note}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>

                            {/* Quotation Section */}
                            {selectedRequest.quotation && typeof selectedRequest.quotation === 'object' && (
                                <Card
                                    title={
                                        <Space>
                                            <DollarOutlined style={{color: '#2e7d32'}}/>
                                            <span style={{fontWeight: 600, fontSize: '14px'}}>Selected Quotation</span>
                                        </Space>
                                    }
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        marginTop: '16px'
                                    }}
                                >
                                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3}}>
                                        <Box>
                                            <Text style={{fontSize: '12px', color: '#64748b', marginBottom: '4px'}}>
                                                Designer
                                            </Text>
                                            <Text style={{fontWeight: 600, fontSize: '14px'}}>
                                                {selectedRequest.quotation.designer.customer.name}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text style={{fontSize: '12px', color: '#64748b', marginBottom: '4px'}}>
                                                Price
                                            </Text>
                                            <Text style={{fontWeight: 600, fontSize: '14px', color: '#2e7d32'}}>
                                                {formatCurrency(selectedRequest.quotation.price)}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text style={{fontSize: '12px', color: '#64748b', marginBottom: '4px'}}>
                                                Delivery Time
                                            </Text>
                                            <Text style={{fontWeight: 600, fontSize: '14px'}}>
                                                {selectedRequest.quotation.deliveryWithIn} days
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text style={{fontSize: '12px', color: '#64748b', marginBottom: '4px'}}>
                                                Revision Time
                                            </Text>
                                            <Text style={{fontWeight: 600, fontSize: '14px'}}>
                                                {selectedRequest.quotation.revisionTime === 9999 ? 'Unlimited' : selectedRequest.quotation.revisionTime} times
                                            </Text>
                                        </Box>
                                    </Box>
                                    {selectedRequest.quotation.note && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: 'rgba(46, 125, 50, 0.05)',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(46, 125, 50, 0.1)'
                                        }}>
                                            <Text style={{
                                                fontStyle: 'italic',
                                                color: '#475569',
                                                fontSize: '12px'
                                            }}>
                                                <strong>Note:</strong> {selectedRequest.quotation.note}
                                            </Text>
                                        </Box>
                                    )}
                                </Card>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    <Button onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}