import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import {Assignment as AssignmentIcon, Info as InfoIcon, Refresh as RefreshIcon} from '@mui/icons-material';
import {Empty, Space, Table} from 'antd';
import 'antd/dist/reset.css';
import {statusTag} from '../school/design/dialog/RequestDetailPopup.jsx';
import AppliedRequestDetail from './AppliedRequestDetail';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {getAppliedDesignerDesignRequests} from "../../services/DesignService.jsx";
import {useLocation, useNavigate} from 'react-router-dom';

const TABLE_PAGE_SIZE_OPTIONS = ['5', '10'];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const calculateDaysDiff = (dateString) => {
    const requestDate = new Date(dateString);
    const today = new Date();
    requestDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const timeDiff = today.getTime() - requestDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
};

const StatCard = React.memo(({icon, value, label, color, bgColor}) => (
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
        <CardContent sx={{textAlign: "center", p: 2}}>
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
            <Typography variant="h5" sx={{fontWeight: 700, color, mb: 0.5}}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{color: "#64748b", fontWeight: 500}}>
                {label}
            </Typography>
        </CardContent>
    </Card>
));

const LoadingState = React.memo(() => (
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
            Loading Applied Design Requests...
        </Typography>
    </Box>
));

const ErrorState = React.memo(({error, onRetry, isRetrying}) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3
    }}>
        <Box sx={{
            textAlign: 'center',
            p: 4,
            borderRadius: 2,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            maxWidth: 500
        }}>
            <Typography variant="h6" sx={{color: '#dc2626', fontWeight: 600, mb: 2}}>
                Error Loading Data
            </Typography>
            <Typography variant="body1" sx={{color: '#7f1d1d', mb: 3}}>
                {error}
            </Typography>
            <Button
                variant="contained"
                onClick={onRetry}
                disabled={isRetrying}
                startIcon={isRetrying ? <CircularProgress size={16}/> : <RefreshIcon/>}
                sx={{
                    backgroundColor: '#dc2626',
                    '&:hover': {
                        backgroundColor: '#b91c1c'
                    }
                }}
            >
                {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
        </Box>
    </Box>
));

const EmptyState = React.memo(() => (
    <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 4
    }}>
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Typography variant="body1" sx={{color: '#64748b', mt: 2}}>
                    No applied design requests available
                </Typography>
            }
        />
    </Box>
));

const HeaderSection = React.memo(({onRefresh}) => (
    <Box
        sx={{
            mb: 4,
            position: "relative",
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.08) 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
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
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
                <AssignmentIcon sx={{fontSize: 32, mr: 2, color: "#667eea"}}/>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: "#2c3e50",
                        fontSize: {xs: "1.5rem", md: "2rem"}
                    }}
                >
                    Applied Design Requests
                </Typography>
            </Box>
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
            View your accepted and paid design projects. Track the progress of your ongoing work and completed projects.
        </Typography>
    </Box>
));


const TableSection = React.memo(({
                                     columns,
                                     filteredDesignRequests,
                                     loading
                                 }) => (
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
                        color: "#2c3e50"
                    }}
                >
                    Applied Design Requests
                </Typography>
                <Chip
                    label={`${filteredDesignRequests.length} Applied`}
                    sx={{
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        fontWeight: 600
                    }}
                />
            </Box>

            {filteredDesignRequests.length === 0 ? (
                <EmptyState/>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredDesignRequests}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} requests`,
                        style: {marginTop: 16}
                    }}
                    scroll={{x: 'max-content'}}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px'
                    }}
                    rowHoverColor="#f8fafc"
                />
            )}
        </Box>
    </Paper>
));

export default function AppliedRequestList() {
    const [designRequests, setDesignRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const openIdParam = useMemo(
        () => new URLSearchParams(location.search).get('openId'),
        [location.search]
    );

    const openedRef = useRef(false);

    useEffect(() => {
        if (loading) return;
        if (!openIdParam || openedRef.current) return;

        const id = Number(openIdParam);
        const target = designRequests.find(req => Number(req.id) === id);

        if (target) {
            handleViewDetail(id);
            openedRef.current = true;

            navigate('/designer/applied/requests', {replace: true});
        }
    }, [loading, openIdParam, designRequests, navigate]);

    const fetchDesignRequests = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');
            const response = await getAppliedDesignerDesignRequests();
            if (response && response.status === 200) {
                console.log("Applied design requests: ", response.data.body);
                setDesignRequests(response.data.body || []);
            } else {
                setError('Failed to fetch applied design requests');
            }
        } catch (err) {
            console.error("Error fetching applied design requests:", err);
            setError('An error occurred while fetching applied design requests');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    useEffect(() => {
        fetchDesignRequests();
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            fetchDesignRequests(false);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const filteredDesignRequests = designRequests;


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
        setIsRetrying(true);
        fetchDesignRequests();
    };

    const handleRefresh = () => {
        fetchDesignRequests(false);
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
                const daysDiff = calculateDaysDiff(text);
                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569'}}>
                            {formatDate(text)}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: daysDiff < 1 ? '#059669' : daysDiff < 10 ? '#f59e0b' : '#dc2626',
                            fontWeight: 600
                        }}>
                            {daysDiff < 1 ? 'Today' : daysDiff === 1 ? '1 day ago' : `${daysDiff} days ago`}
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
                                '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
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

    if (loading) {
        return <LoadingState/>;
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
            <HeaderSection onRefresh={handleRefresh}/>

            <TableSection
                columns={columns}
                filteredDesignRequests={filteredDesignRequests}
                loading={loading}
            />

            <AppliedRequestDetail
                visible={isModalVisible}
                onCancel={handleCancel}
                request={selectedRequest}
            />
        </Box>
    );
}