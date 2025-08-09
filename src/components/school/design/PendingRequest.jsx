import React, {useEffect, useState} from 'react';
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
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {Table, Space} from 'antd';
import 'antd/dist/reset.css';
import RequestDesignerPopup, {statusTag} from '../popup/RequestDesignerPopup';
import DesignPaymentPopup from '../popup/DesignPaymentPopup';
import {getSchoolDesignRequests} from "../../../services/DesignService.jsx";
import {parseID} from "../../../utils/ParseIDUtil.jsx";

export default function PendingRequest() {
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    const [pendingRequestsData, setPendingRequestsData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function FetchSchoolDesign() {
        try {
            setLoading(true);
            const response = await getSchoolDesignRequests();
            if (response && response.status === 200) {
                console.log("Design request: ", response.data.body);
                const newData = response.data.body || [];
                setPendingRequestsData(newData);
                

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

    const pendingRequests = pendingRequestsData.filter(request =>
        request.status === 'created'
    );

    // Calculate statistics
    const stats = {
        total: pendingRequests.length,
        thisWeek: pendingRequests.filter(req => {
            const requestDate = new Date(req.creationDate);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return requestDate >= weekAgo;
        }).length
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentRequestDetails, setPaymentRequestDetails] = useState(null);

    const handleViewDetail = (id) => {
        const request = pendingRequestsData.find(req => req.id === id);
        setSelectedRequest(request);

        // Only open RequestDesignerPopup for 'created' status
        if (request.status === 'created') {
            setPaymentRequestDetails(null);
            setIsPaymentModalVisible(false);
            setIsModalVisible(true);
        }
    };

    const handleCloseDesignerModal = () => {
        setIsModalVisible(false);
        setSelectedRequest(null);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalVisible(false);
        setPaymentRequestDetails(null);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            defaultSortOrder: 'descend',
            width: 110,
            fixed: 'left',
            render: (text) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#f57c00'}}>
                    {parseID(text, 'dr')}
                </Typography>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 120,
            filters: [...new Set(pendingRequests.map(request => request.status))].map(status => ({
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
            width: 200,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (text) => {
                const date = new Date(text);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569', fontSize: '0.875rem'}}>
                            {`${day}/${month}/${year}`}
                        </Typography>
                        <Typography variant="caption"
                                    sx={{color: daysDiff > 30 ? '#dc2626' : '#64748b', fontSize: '0.75rem'}}>
                            {daysDiff} days ago
                        </Typography>
                    </Box>
                );
            },
        },

        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            minWidth: 200,
            ellipsis: true,
            render: (text) => (
                <Typography
                    variant="body2"
                    sx={{
                        color: '#1e293b',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    {text}
                </Typography>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <IconButton
                            onClick={() => handleViewDetail(record.id)}
                            sx={{
                                color: '#f57c00',
                                '&:hover': {
                                    backgroundColor: '#fff3e0',
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

    return (
        <Box sx={{backgroundColor: '#fafafa', height: 'max-content', width: '100%'}}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                    py: {xs: 6, md: 8},
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    width: '100%',
                    height: 'max-content',
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
                <Container maxWidth={false} sx={{width: '95vw', position: "relative", zIndex: 1, mx: 'auto'}}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid>
                            <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                                <PendingActionsIcon sx={{fontSize: 48, mr: 2, opacity: 0.9}}/>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: {xs: "2rem", md: "2.8rem"},
                                        letterSpacing: "-0.02em"
                                    }}
                                >
                                    Pending Requests
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.95,
                                    fontSize: {xs: "1rem", md: "1.2rem"},
                                    lineHeight: 1.6,
                                    mb: 3
                                }}
                            >
                                Review and manage your pending design requests. Take action to move them forward.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Table Section */}
            <Container maxWidth={false} sx={{width: '100%', pb: {xs: 4, md: 6}, mt: 5, height: 'max-content'}}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        width: '85%'
                    }}
                >
                    <Box sx={{p: {xs: 3, md: 4}, backgroundColor: "white"}}>
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    fontSize: {xs: "1.3rem", md: "1.5rem"}
                                }}
                            >
                                Pending Design Requests
                            </Typography>
                            <Chip
                                label={`${stats.total} Pending`}
                                sx={{
                                    backgroundColor: "#fff3e0",
                                    color: "#f57c00",
                                    fontWeight: 600
                                }}
                            />
                        </Box>

                        <Table
                            columns={columns}
                            dataSource={pendingRequests}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 5,
                                pageSizeOptions: ['5', '8', '10', '15'],
                                showSizeChanger: true,
                                showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} pending requests`,
                                style: {marginTop: 16}
                            }}
                            scroll={{x: 'max-content', y: 'calc(100vh)'}}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                width: '100%',
                                height: 'max-content',
                                overflow: 'auto'
                            }}
                            rowHoverColor="#fff8e1"
                        />
                    </Box>
                </Paper>
            </Container>

            {
                isModalVisible &&
                <RequestDesignerPopup
                    visible={isModalVisible}
                    onCancel={handleCloseDesignerModal}
                    request={selectedRequest}
                />
            }

            {
                isPaymentModalVisible &&
                <DesignPaymentPopup
                    visible={isPaymentModalVisible}
                    onCancel={handleClosePaymentModal}
                    selectedQuotationDetails={paymentRequestDetails}
                />
            }
        </Box>
    );
}