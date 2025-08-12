import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Tooltip, 
    Paper,
    Card,
    CardContent,
    Chip
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Table, Space } from 'antd';
import 'antd/dist/reset.css';
import RequestDetailPopup, { statusTag } from '../popup/RequestDetailPopup';
import { useNavigate } from 'react-router-dom';
import {getSchoolDesignRequests} from "../../../services/DesignService.jsx";
import { parseID } from "../../../utils/ParseIDUtil.jsx";

// Constants
const STATUS_COLORS = {
    completed: '#2e7d32',
    processing: '#f57c00',
    canceled: '#d32f2f'
};

const TABLE_PAGE_SIZE_OPTIONS = ['5', '10'];

// Utility function for date formatting
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// StatCard Component
const StatCard = React.memo(({ icon, value, label, color, bgColor }) => (
    <Card
        elevation={0}
        sx={{
            flex: 1,
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
                borderColor: color,
                transform: "translateY(-2px)",
                boxShadow: `0 4px 15px ${color}20`
            }
        }}
    >
        <CardContent sx={{ textAlign: "center", p: 2 }}>
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5
                }}
            >
                {icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

export default function SchoolDesign() {
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    const navigate = useNavigate();
    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const FetchSchoolDesign = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getSchoolDesignRequests();
            if(response && response.status === 200){
                console.log("Design request: ", response.data.body);
                const newData = response.data.body || [];
                setDesignRequests(newData);
            }
        } catch (error) {
            console.error("Error fetching design requests:", error);
            setError("Failed to load design requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        FetchSchoolDesign();
    }, [FetchSchoolDesign]);

    // Refresh data when user returns from other pages
    useEffect(() => {
        const handleFocus = () => {
            FetchSchoolDesign();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [FetchSchoolDesign]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    // Memoized filtered data
    const filteredDesignRequests = useMemo(() => 
        designRequests.filter(request => request.status !== 'pending'),
        [designRequests]
    );

    // Memoized statistics
    const stats = useMemo(() => {
        const total = filteredDesignRequests.length;
        const completed = filteredDesignRequests.filter(req => req.status === 'completed').length;
        const processing = filteredDesignRequests.filter(req => req.status === 'processing').length;
        const canceled = filteredDesignRequests.filter(req => req.status === 'canceled').length;
        
        return { total, completed, processing, canceled };
    }, [filteredDesignRequests]);

    const handleViewDetail = useCallback((id) => {
        const request = designRequests.find(req => req.id === id);
        setSelectedRequest(request);
        setIsModalVisible(true);
    }, [designRequests]);

    const handleCreateDesignRequest = useCallback(() => {
        navigate('/school/request/create');
    }, [navigate]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    }, []);

    // Memoized table columns
    const columns = useMemo(() => [
        {
            title: 'Request ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            filters: [...new Set(filteredDesignRequests.map(request => request.status))].map(status => ({ text: status, value: status })),
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (text) => statusTag(text),
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'center',
            width: 140,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#475569' }}>
                    {formatDate(text)}
                </Typography>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            width: 'auto',
            render: (text) => (
                <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <IconButton 
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#e3f2fd',
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
    ], [filteredDesignRequests, handleViewDetail]);

    return (
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
            {/* Header Section */}
            <Box 
                sx={{ 
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                    border: "1px solid rgba(46, 125, 50, 0.1)",
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
                    <DesignServicesIcon sx={{ fontSize: 32, mr: 2, color: "#2e7d32" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Design Management
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
                    Manage and track your school's uniform design requests with ease. From concept to completion.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDesignRequest}
                    sx={{
                        background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                        boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(46, 125, 50, 0.4)"
                        }
                    }}
                >
                    Create New Request
                </Button>
            </Box>

            {/* Statistics Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <StatCard
                        icon={<TrendingUpIcon sx={{ color: STATUS_COLORS.completed, fontSize: 24 }} />}
                        value={stats.total}
                        label="Total Requests"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<CheckCircleIcon sx={{ color: STATUS_COLORS.completed, fontSize: 24 }} />}
                        value={stats.completed}
                        label="Completed"
                        color={STATUS_COLORS.completed}
                        bgColor="#e8f5e8"
                    />
                    <StatCard
                        icon={<PendingIcon sx={{ color: STATUS_COLORS.processing, fontSize: 24 }} />}
                        value={stats.processing}
                        label="Processing"
                        color={STATUS_COLORS.processing}
                        bgColor="#fff3e0"
                    />
                    <StatCard
                        icon={<Typography variant="h6" sx={{ color: STATUS_COLORS.canceled, fontWeight: 700 }}>✕</Typography>}
                        value={stats.canceled}
                        label="Cancelled"
                        color={STATUS_COLORS.canceled}
                        bgColor="#ffebee"
                    />
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
                            Recent Design Requests
                        </Typography>
                        <Chip
                            label={`${stats.total} Total`}
                            sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    <Table 
                        columns={columns} 
                        dataSource={filteredDesignRequests} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ 
                            defaultPageSize: 5,
                            pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} requests`,
                            style: { marginTop: 16 }
                        }}
                        scroll={{ x: 'max-content' }}
                        style={{ 
                            backgroundColor: 'white',
                            borderRadius: '8px'
                        }}
                        rowHoverColor="#f8fafc"
                    />
                </Box>
            </Paper>

            <RequestDetailPopup 
                visible={isModalVisible}
                onCancel={handleCancel}
                request={selectedRequest}
            />
        </Box>
    );
}