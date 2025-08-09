import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import {Info as InfoIcon} from '@mui/icons-material';
import {Space, Table} from 'antd';
import 'antd/dist/reset.css';
import {statusTag} from '../school/popup/RequestDetailPopup';
import DesignerRequestDetail from './DesignerRequestDetail';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {getDesignRequests} from "../../services/DesignService.jsx";

export default function DesignerRequestList() {
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch design requests from API
    const fetchDesignRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getDesignRequests();
            if (response && response.status === 200) {
                console.log("Design requests: ", response.data.body);
                setDesignRequests(response.data.body || []);
            } else {
                setError('Failed to fetch design requests');
            }
        } catch (err) {
            console.error("Error fetching design requests:", err);
            setError('An error occurred while fetching design requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignRequests();
    }, []);

    const filteredDesignRequests = designRequests.filter(request => request.status === 'created');

    // Calculate statistics
    const stats = {
        total: filteredDesignRequests.length,
        thisWeek: filteredDesignRequests.filter(req => {
            const requestDate = new Date(req.creationDate);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return requestDate >= weekAgo;
        }).length,
        thisMonth: filteredDesignRequests.filter(req => {
            const requestDate = new Date(req.creationDate);
            const now = new Date();
            return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
        }).length
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const handleViewDetail = (id) => {
        const request = designRequests.find(req => req.id === id);
        setSelectedRequest(request);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    };

    const handleRetry = () => {
        fetchDesignRequests();
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'left',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{ 
                    color: '#667eea', 
                    fontWeight: 600,
                    fontFamily: 'monospace'
                }}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'left',
            width: 120,
            filters: [...new Set(filteredDesignRequests.map(request => request.status))].map(status => ({
                text: status,
                value: status
            })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => statusTag(text),
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 150,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

                return (
                    <Box sx={{textAlign: 'left'}}>
                        <Typography variant="body2" sx={{fontWeight: 600, color: '#2c3e50'}}>
                            {`${day}/${month}/${year}`}
                        </Typography>
                        <Typography variant="caption" sx={{color: daysDiff > 30 ? '#e74c3c' : '#7f8c8d'}}>
                            {daysDiff < 0 ? 0 : daysDiff} day(s) ago
                        </Typography>
                    </Box>
                );
            },
        },
        {
            title: 'Design Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            width: 'auto',
            render: (text, record) => (
                <Typography variant="body2" sx={{color: '#34495e', fontWeight: 500}}>
                    {record.name || 'Design Request'}
                </Typography>
            ),
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            render: (school) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="body2" sx={{fontWeight: 500, color: '#2c3e50'}}>
                        {school?.business || 'School Name'}
                    </Typography>
                </Box>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <IconButton
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#667eea',
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
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
        return (
            <Container maxWidth="xl" sx={{py: 3}}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    <CircularProgress size={60} sx={{color: '#667eea'}}/>
                    <Typography variant="h6" sx={{color: '#2c3e50', fontWeight: 600}}>
                        Loading Design Requests...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{py: 3}}>
                <Alert
                    severity="error"
                    sx={{mb: 3}}
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
        <Container maxWidth="xl" sx={{py: 3}}>
            {/* Header Section */}
            <Box sx={{mb: 4}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                    <Box>
                        <Typography variant="h3" sx={{fontWeight: 800, color: '#2c3e50', mb: 1}}>
                            Available Design Requests
                        </Typography>
                        <Typography variant="body1" sx={{color: '#7f8c8d', fontSize: '1.1rem'}}>
                            Browse and apply for design projects from schools
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Table Section */}
            <Paper elevation={8} sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <Box sx={{p: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography variant="h5" sx={{fontWeight: 700, color: '#2c3e50'}}>
                            Design Requests
                        </Typography>
                        <Chip
                            label={`${filteredDesignRequests.length} Available`}
                            color="primary"
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    </Box>
                </Box>

                <Divider/>

                <Box sx={{p: 3}}>
                    <Table
                        columns={columns}
                        dataSource={filteredDesignRequests}
                        rowKey="id"
                        pagination={{
                            defaultPageSize: 5,
                            pageSizeOptions: ['5', '10'],
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} requests`,
                            style: {marginTop: 16}
                        }}
                        scroll={{x: 'max-content', y: '60vh'}}
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

            <DesignerRequestDetail
                visible={isModalVisible}
                onCancel={handleCancel}
                request={selectedRequest}
            />
        </Container>
    );
}