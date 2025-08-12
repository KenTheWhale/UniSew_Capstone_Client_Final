import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Input, Select, Card, Typography, Avatar, Tooltip, Modal, Descriptions, Badge } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined, BookOutlined, ToolOutlined, ShopOutlined, FilterOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function AdminAccount() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Mock data - Replace with actual API call
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockAccounts = [
                {
                    id: 1,
                    email: 'school1@example.com',
                    role: 'school',
                    status: 'active',
                    name: 'Trường THPT Chuyên Lê Hồng Phong',
                    createdAt: '2024-02-01',
                    lastLogin: '2024-03-19 09:15:00',
                    phone: '+84 987 654 321',
                    avatar: null
                },
                {
                    id: 2,
                    email: 'designer1@example.com',
                    role: 'designer',
                    status: 'active',
                    name: 'Nguyễn Văn Designer',
                    createdAt: '2024-02-10',
                    lastLogin: '2024-03-20 16:45:00',
                    phone: '+84 555 123 456',
                    avatar: null
                },
                {
                    id: 3,
                    email: 'garment1@example.com',
                    role: 'garment',
                    status: 'active',
                    name: 'Công ty May ABC',
                    createdAt: '2024-02-15',
                    lastLogin: '2024-03-18 11:20:00',
                    phone: '+84 777 888 999',
                    avatar: null
                },
                {
                    id: 4,
                    email: 'school2@example.com',
                    role: 'school',
                    status: 'inactive',
                    name: 'Trường THPT Nguyễn Thị Minh Khai',
                    createdAt: '2024-02-20',
                    lastLogin: '2024-03-10 08:30:00',
                    phone: '+84 111 222 333',
                    avatar: null
                },
                {
                    id: 5,
                    email: 'designer2@example.com',
                    role: 'designer',
                    status: 'inactive',
                    name: 'Trần Thị Designer',
                    createdAt: '2024-02-25',
                    lastLogin: '2024-03-15 13:45:00',
                    phone: '+84 444 555 666',
                    avatar: null
                }
            ];
            setAccounts(mockAccounts);
            setLoading(false);
        }, 1000);
    }, []);

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <UserOutlined style={{ color: '#1890ff' }} />;
            case 'school':
                return <BookOutlined style={{ color: '#52c41a' }} />;
            case 'designer':
                return <ToolOutlined style={{ color: '#722ed1' }} />;
            case 'garment':
                return <ShopOutlined style={{ color: '#fa8c16' }} />;
            default:
                return <UserOutlined />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'blue';
            case 'school':
                return 'green';
            case 'designer':
                return 'purple';
            case 'garment':
                return 'orange';
            default:
                return 'default';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'school':
                return 'School';
            case 'designer':
                return 'Designer';
            case 'garment':
                return 'Garment';
            default:
                return role;
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getStatusText = (status) => {
        return status === 'active' ? 'Active' : 'Inactive';
    };

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

    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = account.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            account.email.toLowerCase().includes(searchText.toLowerCase()) ||
                            account.id.toString().includes(searchText);
        const matchesRole = roleFilter === 'all' || account.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Debug: Log accounts and filtered results
    console.log('All accounts:', accounts);
    console.log('Filtered accounts:', filteredAccounts);
    console.log('Role filter:', roleFilter);
    console.log('Status filter:', statusFilter);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id) => <Text strong>#{id}</Text>
        },
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role) => (
                <Space>
                    {getRoleIcon(role)}
                    <Tag color={getRoleColor(role)}>
                        {getRoleText(role)}
                    </Tag>
                </Space>
            ),
            filters: [
                { text: 'Administrator', value: 'admin' },
                { text: 'School', value: 'school' },
                { text: 'Designer', value: 'designer' },
                { text: 'Garment', value: 'garment' }
            ],
            onFilter: (value, record) => record.role === value
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Badge 
                    status={status === 'active' ? 'success' : 'error'} 
                    text={getStatusText(status)}
                />
            ),
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 150,
            render: (date) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Tooltip title="View Details">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetail(record)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={3} style={{ margin: 0, marginBottom: '16px' }}>
                        System Accounts Management
                    </Title>
                    <Text type="secondary">
                        Manage all user accounts in the UniSew system
                    </Text>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Search
                        placeholder="Search by name, email, or ID..."
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
                    >
                        <Option value="all">All Roles ({accounts.length})</Option>
                        <Option value="admin">Administrator ({accounts.filter(a => a.role === 'admin').length})</Option>
                        <Option value="school">School ({accounts.filter(a => a.role === 'school').length})</Option>
                        <Option value="designer">Designer ({accounts.filter(a => a.role === 'designer').length})</Option>
                        <Option value="garment">Garment ({accounts.filter(a => a.role === 'garment').length})</Option>
                    </Select>
                    <Select
                        placeholder="Filter by status"
                        style={{ width: 150 }}
                        value={statusFilter}
                        onChange={handleStatusFilter}
                    >
                        <Option value="all">All Status ({accounts.length})</Option>
                        <Option value="active">Active ({accounts.filter(a => a.status === 'active').length})</Option>
                        <Option value="inactive">Inactive ({accounts.filter(a => a.status === 'inactive').length})</Option>
                    </Select>
                    <Button 
                        type="primary" 
                        onClick={() => {
                            setSearchText('');
                            setRoleFilter('all');
                            setStatusFilter('all');
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={filteredAccounts}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} accounts`
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

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
                            <Text strong>#{selectedAccount.id}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Name">
                            {selectedAccount.name}
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
                                status={selectedAccount.status === 'active' ? 'success' : 'error'} 
                                text={getStatusText(selectedAccount.status)}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {selectedAccount.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created Date">
                            {new Date(selectedAccount.createdAt).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Login">
                            {new Date(selectedAccount.lastLogin).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}