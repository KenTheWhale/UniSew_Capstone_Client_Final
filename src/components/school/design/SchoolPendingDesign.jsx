import React, {useEffect, useState} from 'react';
import {Box, Chip, IconButton, Paper, Tooltip, Typography} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {Space, Table} from 'antd';
import 'antd/dist/reset.css';
import FindingDesignerPopup, {statusTag} from '../popup/FindingDesignerPopup.jsx';
import DesignPaymentPopup from '../popup/DesignPaymentPopup';
import {getSchoolDesignRequests} from "../../../services/DesignService.jsx";
import {parseID} from "../../../utils/ParseIDUtil.jsx";

export default function SchoolPendingDesign() {
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
        request.status === 'pending'
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

        // Only open FindingDesignerPopup for 'pending' status
        if (request.status === 'pending') {
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
                <Typography variant="body2" sx={{fontWeight: 600, color: '#2e7d32'}}>
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
                            {daysDiff < 1 ? 'Today' : `${daysDiff} days ago`}
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
                                color: '#2e7d32',
                                '&:hover': {
                                    backgroundColor: '#e8f5e8',
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
                    <PendingActionsIcon sx={{ fontSize: 32, mr: 2, color: "#2e7d32" }} />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Pending Requests
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
                    Review and manage your pending design requests. Take action to move them forward.
                </Typography>
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
                            Pending Design Requests
                        </Typography>
                        <Chip
                            label={`${stats.total} Pending`}
                            sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
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
                            pageSizeOptions: ['5', '10'],
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} pending requests`,
                            style: {marginTop: 16}
                        }}
                        scroll={{x: 'max-content'}}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px'
                        }}
                        rowHoverColor="#f8fafc"
                    />
                </Box>
            </Paper>

            {
                isModalVisible &&
                <FindingDesignerPopup
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