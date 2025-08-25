import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Tooltip, 
    Paper,
    Card,
    CardContent,
    Chip,
    CircularProgress
} from "@mui/material";
import { Table, Space, Empty, Input, Select, Modal, Descriptions, Badge, Tag, DatePicker, Form } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, ToolOutlined, ShopOutlined, FilterOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { Visibility, PersonOff } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { getAccountList, changeAccountStatus } from '../../services/AccountService.jsx';
import dayjs from 'dayjs';

const { Search, TextArea } = Input;
const { Option } = Select;

// Constants
const ROLE_COLORS = {
    ADMIN: '#1890ff',
    SCHOOL: '#52c41a', 
    DESIGNER: '#722ed1',
    GARMENT: '#fa8c16'
};

const STATUS_COLORS = {
    ACCOUNT_ACTIVE: '#52c41a',
    ACCOUNT_INACTIVE: '#ff4d4f'
};

// StatCard Component
const StatCard = React.memo(({ icon, value, label, color, bgColor }) => (
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
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

// EmptyState Component
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
                <Typography variant="body1" sx={{ color: '#64748b', mt: 2 }}>
                    No accounts found
                </Typography>
            }
        />
    </Box>
);

export default function AdminAccount() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [restrictModalVisible, setRestrictModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [restrictForm] = Form.useForm();

    // Fetch accounts from API
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAccountList();
            
            if (response && response.status === 200) {
                let accountsData = response.data;
                
                // Handle different response structures
                if (accountsData && typeof accountsData === 'object') {
                    // If data is wrapped in a property like { accounts: [...] }
                    if (accountsData.accounts && Array.isArray(accountsData.accounts)) {
                        accountsData = accountsData.accounts;
                    }
                    // If data is directly an array
                    else if (Array.isArray(accountsData)) {
                        // Data is already an array, use it directly
                    }
                    // If data has other structure, try to find the array
                    else {
                        const keys = Object.keys(accountsData);
                        const arrayKey = keys.find(key => Array.isArray(accountsData[key]));
                        if (arrayKey) {
                            accountsData = accountsData[arrayKey];
                        } else {
                            accountsData = [];
                        }
                    }
                } else {
                    accountsData = [];
                }
                
                setAccounts(accountsData);
                enqueueSnackbar(`Loaded ${accountsData.length} accounts successfully`, { variant: 'success' });
            } else {
                enqueueSnackbar('Failed to load accounts', { variant: 'error' });
                setAccounts([]);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            enqueueSnackbar('Error loading accounts', { variant: 'error' });
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Helper functions
    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN':
                return <UserOutlined style={{ color: ROLE_COLORS.ADMIN }} />;
            case 'SCHOOL':
                return <BookOutlined style={{ color: ROLE_COLORS.SCHOOL }} />;
            case 'DESIGNER':
                return <ToolOutlined style={{ color: ROLE_COLORS.DESIGNER }} />;
            case 'GARMENT':
                return <ShopOutlined style={{ color: ROLE_COLORS.GARMENT }} />;
            default:
                return <UserOutlined />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'blue';
            case 'SCHOOL':
                return 'green';
            case 'DESIGNER':
                return 'purple';
            case 'GARMENT':
                return 'orange';
            default:
                return 'default';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrator';
            case 'SCHOOL':
                return 'School';
            case 'DESIGNER':
                return 'Designer';
            case 'GARMENT':
                return 'Garment Factory';
            default:
                return role;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCOUNT_ACTIVE':
                return 'success';
            case 'ACCOUNT_INACTIVE':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ACCOUNT_ACTIVE':
                return 'Active';
            case 'ACCOUNT_INACTIVE':
                return 'Inactive';
            default:
                return status;
        }
    };

    // Event handlers
    const handleViewDetail = (record) => {
        setSelectedAccount(record);
        setDetailModalVisible(true);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleRoleFilter = (value) => {
        setRoleFilter(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleRefresh = () => {
        fetchAccounts();
    };

    const handleRestrict = (account) => {
        setSelectedAccount(account);
        setRestrictModalVisible(true);
        restrictForm.resetFields();
    };

    const handleRestrictAccount = async (values) => {
        setActionLoading(true);
        try {
            const response = await changeAccountStatus({
                accountId: selectedAccount.id,
                status: 'ACCOUNT_INACTIVE',
                reason: values.reason,
                endDate: values.endDate.format('YYYY-MM-DD')
            });

            if (response && response.status === 200) {
                enqueueSnackbar('Account restricted successfully', { variant: 'success' });
                setRestrictModalVisible(false);
                fetchAccounts(); // Refresh data
            } else {
                enqueueSnackbar('Failed to restrict account', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error restricting account:', error);
            enqueueSnackbar('Error restricting account', { variant: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    // Filtered accounts
    const filteredAccounts = useMemo(() => {
        if (!Array.isArray(accounts)) {
            return [];
        }
        return accounts.filter(account => {
            const matchesSearch = account.email.toLowerCase().includes(searchText.toLowerCase()) ||
                            account.id.toString().includes(searchText);
        const matchesRole = roleFilter === 'all' || account.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    }, [accounts, searchText, roleFilter, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        if (!Array.isArray(accounts)) {
            return { total: 0, active: 0, inactive: 0, schools: 0, designers: 0, garments: 0 };
        }
        const total = accounts.length;
        const active = accounts.filter(a => a.status === 'ACCOUNT_ACTIVE').length;
        const inactive = accounts.filter(a => a.status === 'ACCOUNT_INACTIVE').length;
        const schools = accounts.filter(a => a.role === 'SCHOOL').length;
        const designers = accounts.filter(a => a.role === 'DESIGNER').length;
        const garments = accounts.filter(a => a.role === 'GARMENT').length;

        return { total, active, inactive, schools, designers, garments };
    }, [accounts]);

    // Table columns
    const columns = useMemo(() => [
        {
            title: 'Account ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            render: (id) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    #{id}
                </Typography>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <Typography variant="body2" sx={{ color: '#334155' }}>
                    {email}
                </Typography>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 140,
            align: 'left',
            filters: [
                { text: 'School', value: 'SCHOOL' },
                { text: 'Designer', value: 'DESIGNER' },
                { text: 'Garment Factory', value: 'GARMENT' }
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => (
                <Space>
                    {getRoleIcon(role)}
                    <Tag color={getRoleColor(role)}>
                        {getRoleText(role)}
                    </Tag>
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
                { text: 'Active', value: 'ACCOUNT_ACTIVE' },
                { text: 'Inactive', value: 'ACCOUNT_INACTIVE' }
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
            title: 'Register Date',
            dataIndex: 'registerDate',
            key: 'registerDate',
            width: 140,
            align: 'center',
            sorter: (a, b) => new Date(a.registerDate) - new Date(b.registerDate),
            render: (date) => {
                const registerDate = new Date(date);
                return (
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {registerDate.toLocaleDateString('vi-VN')}
                    </Typography>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                <Tooltip title="View Details">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetail(record)}
                            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
                        >
                            <Visibility style={{ fontSize: 16 }} />
                        </Button>
                    </Tooltip>
                    {record.status === 'ACCOUNT_ACTIVE' && (
                        <Tooltip title="Restrict Account">
                            <Button
                                danger
                                size="small"
                                loading={actionLoading && selectedAccount?.id === record.id}
                                onClick={() => handleRestrict(record)}
                                style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}
                            >
                                <PersonOff style={{ fontSize: 16, color: '#ff4d4f' }} />
                            </Button>
                </Tooltip>
                    )}
                </Space>
            )
        }
    ], []);

    return (
        <Box sx={{ 
            height: '100%', 
            overflowY: 'auto',
            '& @keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.4 },
                '100%': { opacity: 1 }
            }
        }}>
            {/* Header Section */}
            <Box 
                sx={{ 
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.08) 100%)",
                    border: "1px solid rgba(220, 53, 69, 0.1)",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <UserOutlined style={{ fontSize: 32, color: '#dc3545', marginRight: 16 }} />
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                mb: 1
                            }}
                        >
                        System Accounts Management
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                fontWeight: 500
                            }}
                        >
                        Manage all user accounts in the UniSew system
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                {/* Filters */}
                    <Search
                            placeholder="Search by email or ID..."
                        allowClear
                        style={{ width: 300 }}
                        onSearch={handleSearch}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        placeholder="Filter by role"
                        style={{ width: 150 }}
                        value={roleFilter}
                        onChange={handleRoleFilter}
                            loading={loading}
                    >
                            <Option value="all">All Roles ({loading ? '...' : Array.isArray(accounts) ? accounts.length : 0})</Option>
                            <Option value="SCHOOL">School ({loading ? '...' : Array.isArray(accounts) ? accounts.filter(a => a.role === 'SCHOOL').length : 0})</Option>
                            <Option value="DESIGNER">Designer ({loading ? '...' : Array.isArray(accounts) ? accounts.filter(a => a.role === 'DESIGNER').length : 0})</Option>
                            <Option value="GARMENT">Garment ({loading ? '...' : Array.isArray(accounts) ? accounts.filter(a => a.role === 'GARMENT').length : 0})</Option>
                    </Select>
                    <Select
                        placeholder="Filter by status"
                        style={{ width: 150 }}
                        value={statusFilter}
                        onChange={handleStatusFilter}
                            loading={loading}
                    >
                            <Option value="all">All Status ({loading ? '...' : Array.isArray(accounts) ? accounts.length : 0})</Option>
                            <Option value="ACCOUNT_ACTIVE">Active ({loading ? '...' : Array.isArray(accounts) ? accounts.filter(a => a.status === 'ACCOUNT_ACTIVE').length : 0})</Option>
                            <Option value="ACCOUNT_INACTIVE">Inactive ({loading ? '...' : Array.isArray(accounts) ? accounts.filter(a => a.status === 'ACCOUNT_INACTIVE').length : 0})</Option>
                    </Select>
                    <Button 
                        onClick={() => {
                            setSearchText('');
                            setRoleFilter('all');
                            setStatusFilter('all');
                        }}
                    >
                        Clear Filters
                    </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Refresh Data">
                            <IconButton
                                onClick={handleRefresh}
                                sx={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#c82333',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ReloadOutlined />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
                {loading ? (
                    // Skeleton loading for stats cards
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                            icon={<UserOutlined style={{ fontSize: 24 }} />}
                            value={stats.total}
                            label="Total Accounts"
                            color="#dc3545"
                        />
                        <StatCard
                            icon={<UserOutlined style={{ fontSize: 24 }} />}
                            value={stats.active}
                            label="Active Accounts"
                            color="#52c41a"
                        />
                        <StatCard
                            icon={<StopOutlined style={{ fontSize: 24 }} />}
                            value={stats.inactive}
                            label="Inactive Accounts"
                            color="#ff4d4f"
                        />
                        <StatCard
                            icon={<BookOutlined style={{ fontSize: 24 }} />}
                            value={stats.schools}
                            label="Schools"
                            color="#52c41a"
                        />
                        <StatCard
                            icon={<ToolOutlined style={{ fontSize: 24 }} />}
                            value={stats.designers}
                            label="Designers"
                            color="#722ed1"
                        />
                        <StatCard
                            icon={<ShopOutlined style={{ fontSize: 24 }} />}
                            value={stats.garments}
                            label="Garment Factories"
                            color="#fa8c16"
                        />
                    </>
                )}
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
                            All System Accounts
                        </Typography>
                        <Chip
                            label={`${filteredAccounts.length} of ${stats.total} accounts`}
                            sx={{
                                backgroundColor: "#fef2f2",
                                color: "#dc3545",
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
                            <CircularProgress size={40} sx={{ color: '#dc3545', mb: 2 }} />
                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                Loading accounts...
                            </Typography>
                        </Box>
                    ) : filteredAccounts.length === 0 ? (
                        <EmptyState />
                    ) : (
                <Table
                    columns={columns}
                    dataSource={filteredAccounts}
                    rowKey="id"
                            loading={false}
                    pagination={{
                                defaultPageSize: 10,
                                pageSizeOptions: ['5', '10', '20'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                                    `Showing ${range[0]}-${range[1]} of ${total} accounts`,
                                style: { marginTop: 16 }
                    }}
                            scroll={{ x: 'max-content' }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </Box>
            </Paper>

            {/* Detail Modal */}
            <Modal
                title="Account Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedAccount && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Account ID">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                #{selectedAccount.id}
                            </Typography>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedAccount.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Role">
                            <Space>
                                {getRoleIcon(selectedAccount.role)}
                                <Tag color={getRoleColor(selectedAccount.role)}>
                                    {getRoleText(selectedAccount.role)}
                                </Tag>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Badge 
                                status={getStatusColor(selectedAccount.status)} 
                                text={getStatusText(selectedAccount.status)}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Register Date">
                            {new Date(selectedAccount.registerDate).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Restrict Account Modal */}
            <Modal
                title="Restrict Account"
                open={restrictModalVisible}
                onCancel={() => setRestrictModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setRestrictModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button 
                        key="restrict" 
                        danger 
                        loading={actionLoading}
                        onClick={() => restrictForm.submit()}
                    >
                        Restrict Account
                    </Button>
                ]}
                width={500}
            >
                {selectedAccount && (
                    <div>
                        <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff2f0', borderRadius: 1, border: '1px solid #ffccc7' }}>
                            <Typography variant="body2" sx={{ color: '#cf1322', fontWeight: 500 }}>
                                ⚠️ You are about to restrict account: <strong>{selectedAccount.email}</strong>
                            </Typography>
                        </Box>
                        
                        <Form
                            form={restrictForm}
                            layout="vertical"
                            onFinish={handleRestrictAccount}
                        >
                            <Form.Item
                                label="Reason for Restriction"
                                name="reason"
                                rules={[
                                    { required: true, message: 'Please provide a reason for restricting this account' },
                                    { min: 10, message: 'Reason must be at least 10 characters long' }
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Enter the reason why this account should be restricted..."
                                />
                            </Form.Item>
                            
                            <Form.Item
                                label="Restriction End Date"
                                name="endDate"
                                rules={[
                                    { required: true, message: 'Please select an end date for the restriction' }
                                ]}
                                help="Select when the restriction should end"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select end date for restriction"
                                    disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
                                />
                            </Form.Item>
                        </Form>
        </div>
                )}
            </Modal>
        </Box>
    );
}