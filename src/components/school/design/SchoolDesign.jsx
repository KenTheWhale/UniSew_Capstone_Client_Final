import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Tooltip, 
    Container,
    Paper,
    Grid,
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

export default function SchoolDesign() {
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    const navigate = useNavigate();
    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    async function FetchSchoolDesign() {
        try {
            setLoading(true);
            const response = await getSchoolDesignRequests();
            if(response && response.status === 200){
                console.log("Design request: ", response.data.body);
                const newData = response.data.body || [];
                setDesignRequests(newData);
                

            }
        } catch (error) {
            console.error("Error fetching design requests:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        FetchSchoolDesign();
    }, []);

    // Refresh data when user returns from other pages
    useEffect(() => {
        const handleFocus = () => {
            FetchSchoolDesign();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    const filteredDesignRequests = designRequests.filter(request => request.status !== 'pending');

    // Calculate statistics
    const stats = {
        total: filteredDesignRequests.length,
        completed: filteredDesignRequests.filter(req => req.status === 'completed').length,
        processing: filteredDesignRequests.filter(req => req.status === 'processing').length,
        canceled: filteredDesignRequests.filter(req => req.status === 'canceled').length
    };

    const handleViewDetail = (id) => {
        const request = designRequests.find(req => req.id === id);
        setSelectedRequest(request);
        setIsModalVisible(true);
    };

    const handleCreateDesignRequest = () => {
        navigate('/school/request/create');
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    };

    const columns = [
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
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return (
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        {`${day}/${month}/${year}`}
                    </Typography>
                );
            },
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
    ];

    return (
        <Box sx={{ backgroundColor: '#fafafa', height: 'max-content', overflowY: 'scroll', flex: 1}}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    py: { xs: 6, md: 8 },
                    color: "white",
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "url('/unisew.jpg') center/cover",
                        opacity: 0.1,
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <DesignServicesIcon sx={{ fontSize: 48, mr: 2, opacity: 0.9 }} />
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: "2rem", md: "2.8rem" },
                                        letterSpacing: "-0.02em"
                                    }}
                                >
                                    Design Management
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.95,
                                    fontSize: { xs: "1rem", md: "1.2rem" },
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
                                    backgroundColor: "white",
                                    color: "#1976d2",
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    borderRadius: "50px",
                                    textTransform: "none",
                                    boxShadow: "0 4px 15px rgba(255,255,255,0.3)",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 25px rgba(255,255,255,0.4)"
                                    }
                                }}
                            >
                                Create New Request
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Statistics Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                <Grid container spacing={3} sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#1976d2",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(25, 118, 210, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#e3f2fd",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <TrendingUpIcon sx={{ color: "#1976d2", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Total Requests
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#2e7d32",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(46, 125, 50, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#e8f5e8",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                                    {stats.completed}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Completed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#f57c00",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(245, 124, 0, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#fff3e0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <PendingIcon sx={{ color: "#f57c00", fontSize: 30 }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#f57c00", mb: 1 }}>
                                    {stats.processing}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Processing
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={6} sm={3} sx={{ flex: 1 }}>
                        <Card
                            elevation={0}
                            sx={{
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderColor: "#d32f2f",
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 25px rgba(211, 47, 47, 0.15)"
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: "center", p: 3 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        backgroundColor: "#ffebee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mx: "auto",
                                        mb: 2
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: "#d32f2f", fontWeight: 700 }}>
                                        ✕
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "#d32f2f", mb: 1 }}>
                                    {stats.canceled}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Cancelled
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Table Section */}
            <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: "1px solid #e2e8f0",
                        overflow: "auto"
                    }}
                >
                    <Box sx={{ p: { xs: 3, md: 4 }, backgroundColor: "white" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    fontSize: { xs: "1.3rem", md: "1.5rem" }
                                }}
                            >
                                Recent Design Requests
                            </Typography>
                            <Chip
                                label={`${stats.total} Total`}
                                sx={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
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
                                pageSizeOptions: ['5', '10'],
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
            </Container>

            <RequestDetailPopup 
                visible={isModalVisible}
                onCancel={handleCancel}
                request={selectedRequest}
            />
        </Box>
    );
}