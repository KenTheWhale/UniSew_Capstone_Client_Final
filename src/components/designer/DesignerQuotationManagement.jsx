import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Box,
    Chip,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Info as InfoIcon,
    DesignServices as DesignServicesIcon
} from '@mui/icons-material';
import {Space, Table} from 'antd';
import 'antd/dist/reset.css';
import {DataLoadingState, EmptyState, ErrorState} from '../ui/LoadingSpinner.jsx';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {getDesignRequests, getAppliedDesignerDesignRequests, getRejectedDesignerDesignRequests} from "../../services/DesignService.jsx";
import {statusTag} from '../school/design/dialog/RequestDetailPopup.jsx';
import DesignerPendingDesignDetail from './dialog/DesignerPendingDesignDetail.jsx';
import AppliedRequestDetail from './dialog/AppliedRequestDetail.jsx';
import {useLocation, useNavigate} from 'react-router-dom';

// Utility functions
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

// Loading State Component
const LoadingState = React.memo(() => (
    <DataLoadingState
        text="Loading Design Requests..."
        size={60}
        color="#7c3aed"
    />
));

// Error State Component
const ErrorStateComponent = React.memo(({error, onRetry, isRetrying}) => (
    <ErrorState
        error={error}
        onRetry={onRetry}
        isRetrying={isRetrying}
        retryText="Retry"
        errorTitle="Error Loading Data"
    />
));

// Empty State Component
const EmptyStateComponent = React.memo(({activeTab}) => (
    <EmptyState
        title={
            activeTab === 0 ? "No available design requests" : 
            activeTab === 1 ? "No applied design requests" : 
            "No rejected design requests"
        }
        description={
            activeTab === 0 ? "There are no available design requests to display" : 
            activeTab === 1 ? "You haven't applied for any design requests yet" :
            "You don't have any rejected design requests"
        }
        icon={activeTab === 0 ? "🎨" : activeTab === 1 ? "📋" : "❌"}
    />
));

// Header Section
const HeaderSection = React.memo(({activeTab}) => (
    <Box
        sx={{
            mb: 4,
            position: "relative",
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(91, 33, 182, 0.08) 100%)",
            border: "1px solid rgba(124, 58, 237, 0.1)",
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
        <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
            <DesignServicesIcon sx={{fontSize: 32, mr: 2, color: "#7c3aed"}}/>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: {xs: "1.5rem", md: "2rem"}
                }}
            >
                Design Request Management
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
            {activeTab === 0 
                ? "Browse and apply for design projects from schools. Find opportunities that match your skills and expertise."
                : activeTab === 1
                ? "View your accepted and paid design projects. Track the progress of your ongoing work and completed projects."
                : "View your rejected design requests. Learn from feedback and improve your future applications."
            }
        </Typography>
    </Box>
));

// Table Section
const TableSection = React.memo(({
    columns,
    data,
    loading,
    activeTab,
    onTableChange
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
                        color: "#1e293b"
                    }}
                >
                    {activeTab === 0 ? "Available Design Requests" : 
                     activeTab === 1 ? "Applied Design Requests" : 
                     "Rejected Design Requests"}
                </Typography>
                <Chip
                    label={`${data.length} ${
                        activeTab === 0 ? 'Available' : 
                        activeTab === 1 ? 'Applied' : 
                        'Rejected'
                    }`}
                    sx={{
                        backgroundColor: "rgba(124, 58, 237, 0.1)",
                        color: "#7c3aed",
                        fontWeight: 600
                    }}
                />
            </Box>

            {data.length === 0 ? (
                <EmptyStateComponent activeTab={activeTab} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['5', '10', '20', '50'],
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
                    rowHoverColor="#f8fafc"
                    onChange={onTableChange}
                />
            )}
        </Box>
    </Paper>
));

// Main Component
export default function DesignerQuotationManagement() {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);
    
    // Available requests state
    const [availableRequests, setAvailableRequests] = useState([]);
    const [availableSortBy, setAvailableSortBy] = useState('creationDate');
    const [availableSortOrder, setAvailableSortOrder] = useState('descend');
    
    // Applied requests state
    const [appliedRequests, setAppliedRequests] = useState([]);
    const [appliedSortBy, setAppliedSortBy] = useState('creationDate');
    const [appliedSortOrder, setAppliedSortOrder] = useState('descend');
    
    // Rejected requests state
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [rejectedSortBy, setRejectedSortBy] = useState('creationDate');
    const [rejectedSortOrder, setRejectedSortOrder] = useState('descend');
    
    // Modal states
    const [isAvailableModalVisible, setIsAvailableModalVisible] = useState(false);
    const [isAppliedModalVisible, setIsAppliedModalVisible] = useState(false);
    const [selectedAvailableRequest, setSelectedAvailableRequest] = useState(null);
    const [selectedAppliedRequest, setSelectedAppliedRequest] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const openIdParam = useMemo(
        () => new URLSearchParams(location.search).get('openId'),
        [location.search]
    );

    const openedRef = useRef(false);

    // Clear localStorage on component mount
    useEffect(() => {
        localStorage.removeItem('currentDesignRequest');
    }, []);

    // Fetch all data (available, applied, and rejected requests)
    const fetchAllData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');
            
            // Fetch all three APIs in parallel
            const [availableResponse, appliedResponse, rejectedResponse] = await Promise.all([
                getDesignRequests(),
                getAppliedDesignerDesignRequests(),
                getRejectedDesignerDesignRequests()
            ]);

            // Handle available requests response
            if (availableResponse && availableResponse.status === 200) {
                console.log("Available design requests: ", availableResponse.data.body);
                setAvailableRequests(availableResponse.data.body || []);
            } else {
                console.error('Failed to fetch available design requests');
                setAvailableRequests([]);
            }

            // Handle applied requests response
            if (appliedResponse && appliedResponse.status === 200) {
                console.log("Applied design requests: ", appliedResponse.data.body);
                setAppliedRequests(appliedResponse.data.body || []);
            } else {
                console.error('Failed to fetch applied design requests');
                setAppliedRequests([]);
            }

            // Handle rejected requests response
            if (rejectedResponse && rejectedResponse.status === 200) {
                console.log("Rejected design requests: ", rejectedResponse.data.body);
                setRejectedRequests(rejectedResponse.data.body || []);
            } else {
                console.error('Failed to fetch rejected design requests');
                setRejectedRequests([]);
            }

            // Set error only if all APIs fail
            if ((!availableResponse || availableResponse.status !== 200) && 
                (!appliedResponse || appliedResponse.status !== 200) &&
                (!rejectedResponse || rejectedResponse.status !== 200)) {
                setError('Failed to fetch design requests data');
            }

        } catch (err) {
            console.error("Error fetching design requests:", err);
            setError('An error occurred while fetching design requests');
            setAvailableRequests([]);
            setAppliedRequests([]);
            setRejectedRequests([]);
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, []);

    // Initial data fetch - fetch all APIs
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Handle window focus - refresh all APIs
    useEffect(() => {
        const handleFocus = () => {
            fetchAllData(false);
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchAllData]);

    // Handle URL parameter for opening specific request
    useEffect(() => {
        if (loading) return;
        if (!openIdParam || openedRef.current) return;

        const id = Number(openIdParam);
        // Check in both applied and rejected requests
        const appliedTarget = appliedRequests.find(req => Number(req.id) === id);
        const rejectedTarget = rejectedRequests.find(req => Number(req.id) === id);
        const target = appliedTarget || rejectedTarget;

        if (target) {
            handleViewAppliedDetail(id);
            openedRef.current = true;
            navigate('/designer/quotation-management', {replace: true});
        }
    }, [loading, openIdParam, appliedRequests, rejectedRequests, navigate]);

    // Filter and sort available requests
    const filteredAvailableRequests = useMemo(() => {
        let filtered = availableRequests.filter(request => request.status === 'pending');

        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (availableSortBy) {
                case 'creationDate':
                    aValue = new Date(a.creationDate);
                    bValue = new Date(b.creationDate);
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'school':
                    aValue = a.school?.business || a.school?.name || '';
                    bValue = b.school?.business || b.school?.name || '';
                    break;
                default:
                    aValue = a[availableSortBy];
                    bValue = b[availableSortBy];
            }

            if (availableSortOrder === 'ascend') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [availableRequests, availableSortBy, availableSortOrder]);

    // Filter and sort applied requests
    const filteredAppliedRequests = useMemo(() => {
        let filtered = appliedRequests;

        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (appliedSortBy) {
                case 'creationDate':
                    aValue = new Date(a.creationDate);
                    bValue = new Date(b.creationDate);
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'school':
                    aValue = a.school?.business || a.school?.name || '';
                    bValue = b.school?.business || b.school?.name || '';
                    break;
                default:
                    aValue = a[appliedSortBy];
                    bValue = b[appliedSortBy];
            }

            if (appliedSortOrder === 'ascend') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [appliedRequests, appliedSortBy, appliedSortOrder]);

    // Filter and sort rejected requests
    const filteredRejectedRequests = useMemo(() => {
        let filtered = rejectedRequests;

        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (rejectedSortBy) {
                case 'creationDate':
                    aValue = new Date(a.creationDate);
                    bValue = new Date(b.creationDate);
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'school':
                    aValue = a.school?.business || a.school?.name || '';
                    bValue = b.school?.business || b.school?.name || '';
                    break;
                default:
                    aValue = a[rejectedSortBy];
                    bValue = b[rejectedSortBy];
            }

            if (rejectedSortOrder === 'ascend') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [rejectedRequests, rejectedSortBy, rejectedSortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
        const available = filteredAvailableRequests.length;
        const applied = filteredAppliedRequests.length;
        const rejected = filteredRejectedRequests.length;

        return {available, applied, rejected};
    }, [filteredAvailableRequests, filteredAppliedRequests, filteredRejectedRequests]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle view available detail
    const handleViewAvailableDetail = useCallback((id) => {
        const request = availableRequests.find(req => req.id === id);
        setSelectedAvailableRequest(request);
        setIsAvailableModalVisible(true);
    }, [availableRequests]);

    // Handle view applied detail (works for both applied and rejected)
    const handleViewAppliedDetail = useCallback((id) => {
        // Check in applied requests first
        let request = appliedRequests.find(req => req.id === id);
        let isRejectedRequest = false;
        
        // If not found in applied, check in rejected
        if (!request) {
            request = rejectedRequests.find(req => req.id === id);
            isRejectedRequest = true;
        }
        
        // Create a copy of the request with the flag instead of mutating
        if (request) {
            const requestWithFlag = {
                ...request,
                _isRejectedRequest: isRejectedRequest
            };
            setSelectedAppliedRequest(requestWithFlag);
        } else {
            setSelectedAppliedRequest(null);
        }
        
        setIsAppliedModalVisible(true);
    }, [appliedRequests, rejectedRequests]);

    // Handle cancel modals
    const handleCancelAvailable = useCallback(() => {
        setIsAvailableModalVisible(false);
        setSelectedAvailableRequest(null);
    }, []);

    const handleCancelApplied = useCallback(() => {
        setIsAppliedModalVisible(false);
        setSelectedAppliedRequest(null);
    }, []);

    // Handle retry - fetch all APIs
    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        fetchAllData();
    }, [fetchAllData]);

    // Handle table change
    const handleTableChange = useCallback((pagination, filters, sorter) => {
        if (sorter.field) {
            if (activeTab === 0) {
                setAvailableSortBy(sorter.field);
                setAvailableSortOrder(sorter.order);
            } else if (activeTab === 1) {
                setAppliedSortBy(sorter.field);
                setAppliedSortOrder(sorter.order);
            } else {
                setRejectedSortBy(sorter.field);
                setRejectedSortOrder(sorter.order);
            }
        }
    }, [activeTab]);

    // Available requests columns
    const availableColumns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'left',
            sorter: true,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{
                    color: '#7c3aed',
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
            render: (text) => statusTag(text),
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 150,
            sorter: true,
            render: (text) => {
                const daysDiff = calculateDaysDiff(text);
                return (
                    <Box>
                        <Typography variant="body2" sx={{color: '#475569'}}>
                            {formatDate(text)}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: daysDiff < 1 ? '#059669' : daysDiff < 7 ? '#f59e0b' : '#dc2626',
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
            sorter: true,
            render: (text, record) => {
                const designName = record.name || 'Design Request';
                return (
                    <Typography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                        {designName}
                    </Typography>
                );
            },
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            sorter: true,
            render: (text, record) => {
                const schoolName = record.school?.business || record.school?.name || 'School Name';
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{fontWeight: 500, color: '#2c3e50'}}>
                            {schoolName}
                        </Typography>
                    </Box>
                );
            },
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
                            onClick={() => handleViewAvailableDetail(record.id)}
                            sx={{
                                color: '#7c3aed',
                                '&:hover': {
                                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
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
    ], [handleViewAvailableDetail]);

    // Applied requests columns
    const appliedColumns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'left',
            sorter: true,
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
            filters: [...new Set(filteredAppliedRequests.map(request => request.status))].map(status => ({
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
            sorter: true,
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
            render: (text, record) => {
                const designName = record.name || 'Design Request';
                return (
                    <Typography variant="body2" sx={{color: '#34495e', fontWeight: 500}}>
                        {designName}
                    </Typography>
                );
            },
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            render: (text, record) => {
                const schoolName = record.school?.business || 'School Name';
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{fontWeight: 500, color: '#2c3e50'}}>
                            {schoolName}
                        </Typography>
                    </Box>
                );
            },
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
                            onClick={() => handleViewAppliedDetail(record.id)}
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
    ], [handleViewAppliedDetail, filteredAppliedRequests]);

    // Rejected requests columns
    const rejectedColumns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'left',
            sorter: true,
            defaultSortOrder: 'descend',
            width: 120,
            render: (text) => (
                <Typography variant="body2" sx={{
                    color: '#dc2626',
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
            render: (text) => {
                // Force rejected status to always show as "Rejected" with red color
                return (
                    <Chip
                        label="Rejected"
                        sx={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 600,
                            border: '1px solid #fecaca'
                        }}
                        size="small"
                    />
                );
            },
        },
        {
            title: 'Request Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            align: 'left',
            width: 150,
            sorter: true,
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
            sorter: true,
            render: (text, record) => {
                const designName = record.name || 'Design Request';
                return (
                    <Typography variant="body2" sx={{color: '#dc2626', fontWeight: 500}}>
                        {designName}
                    </Typography>
                );
            },
        },
        {
            title: 'School Name',
            dataIndex: 'school',
            key: 'school',
            align: 'left',
            width: 300,
            sorter: true,
            render: (text, record) => {
                const schoolName = record.school?.business || 'School Name';
                return (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Typography variant="body2" sx={{fontWeight: 500, color: '#2c3e50'}}>
                            {schoolName}
                        </Typography>
                    </Box>
                );
            },
        },
        // Removed Actions column completely for rejected requests
    ], []);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <ErrorStateComponent
                error={error}
                onRetry={handleRetry}
                isRetrying={isRetrying}
            />
        );
    }

    const currentData = activeTab === 0 ? filteredAvailableRequests : 
                       activeTab === 1 ? filteredAppliedRequests : 
                       filteredRejectedRequests;
    const currentColumns = activeTab === 0 ? availableColumns : 
                          activeTab === 1 ? appliedColumns : 
                          rejectedColumns;

    return (
        <Box sx={{p: 3}}>
            {/* Header Section */}
            <HeaderSection activeTab={activeTab} />

            {/* Main Content */}
            <Paper sx={{
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                overflow: "hidden"
            }}>
                {/* Tabs */}
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc'
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 48,
                                '&.MuiTab-selected': {
                                    color: '#7c3aed'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#7c3aed'
                            }
                        }}
                    >
                        <Tab label={`Available Requests (${stats.available})`} />
                        <Tab label={`Applied Requests (${stats.applied})`} />
                        <Tab label={`Rejected Requests (${stats.rejected})`} />
                    </Tabs>
                </Box>

                {/* Table Section */}
                <TableSection
                    columns={currentColumns}
                    data={currentData}
                    loading={loading}
                    stats={stats}
                    activeTab={activeTab}
                    onTableChange={handleTableChange}
                />
            </Paper>

            {/* Available Request Detail Modal */}
            <DesignerPendingDesignDetail
                visible={isAvailableModalVisible}
                onCancel={handleCancelAvailable}
                request={selectedAvailableRequest}
            />

            {/* Applied Request Detail Modal */}
            <AppliedRequestDetail
                visible={isAppliedModalVisible}
                onCancel={handleCancelApplied}
                request={selectedAppliedRequest}
            />
        </Box>
    );
}