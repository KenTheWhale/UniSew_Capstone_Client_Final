import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    Divider,
    Grid,
    CircularProgress
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    Cancel as CancelIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import {Space, Table, Tag, Empty} from 'antd';
import 'antd/dist/reset.css';
import {DataLoadingState, EmptyState, ErrorState} from '../ui/LoadingSpinner.jsx';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {enqueueSnackbar} from "notistack";

// Mock data structure - replace with actual API calls
const mockQuotations = [
    {
        id: 1,
        designRequestId: 101,
        designRequestName: "School Uniform Design 2024",
        schoolName: "ABC High School",
        price: 1500000,
        deliveryWithin: 14,
        revisionTime: 3,
        extraRevisionPrice: 200000,
        acceptanceDeadline: "2024-12-31",
        status: "pending",
        creationDate: "2024-01-15",
        note: "Modern and comfortable design for students"
    },
    {
        id: 2,
        designRequestId: 102,
        designRequestName: "Sports Team Jersey",
        schoolName: "XYZ Academy",
        price: 800000,
        deliveryWithin: 10,
        revisionTime: 2,
        extraRevisionPrice: 150000,
        acceptanceDeadline: "2024-12-25",
        status: "accepted",
        creationDate: "2024-01-10",
        note: "Dynamic design for sports activities"
    },
    {
        id: 3,
        designRequestId: 103,
        designRequestName: "Graduation Ceremony Outfit",
        schoolName: "DEF College",
        price: 2500000,
        deliveryWithin: 21,
        revisionTime: 5,
        extraRevisionPrice: 300000,
        acceptanceDeadline: "2025-01-15",
        status: "rejected",
        creationDate: "2024-01-05",
        note: "Elegant design for graduation ceremony"
    }
];

// Utility functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const getStatusConfig = (status) => {
    switch (status) {
        case 'pending':
            return {
                color: '#f59e0b',
                bgColor: '#fef3c7',
                icon: <ScheduleIcon />,
                label: 'Pending',
                antdColor: 'warning'
            };
        case 'accepted':
            return {
                color: '#059669',
                bgColor: '#d1fae5',
                icon: <CheckCircleIcon />,
                label: 'Accepted',
                antdColor: 'success'
            };
        case 'rejected':
            return {
                color: '#dc2626',
                bgColor: '#fee2e2',
                icon: <CancelIcon />,
                label: 'Rejected',
                antdColor: 'error'
            };
        default:
            return {
                color: '#6b7280',
                bgColor: '#f3f4f6',
                icon: <AssignmentIcon />,
                label: status,
                antdColor: 'default'
            };
    }
};

// StatCard Component - Updated to match DesignerPendingDesign style
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

// Loading State Component
const LoadingState = React.memo(() => (
    <DataLoadingState
        text="Loading Quotations..."
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
        errorTitle="Error Loading Quotations"
    />
));

// Empty State Component
const EmptyStateComponent = React.memo(({activeTab}) => (
    <EmptyState
        title="No quotations found"
        description={`No quotations in ${activeTab === 0 ? 'all' : activeTab === 1 ? 'pending' : activeTab === 2 ? 'accepted' : 'rejected'} status`}
        icon="📋"
    />
));

// Header Section - Updated to match DesignerPendingDesign style
const HeaderSection = React.memo(({onRefresh, stats}) => (
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
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
                <ReceiptIcon sx={{fontSize: 32, mr: 2, color: "#7c3aed"}}/>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: {xs: "1.5rem", md: "2rem"}
                    }}
                >
                    Quotation Management
                </Typography>
            </Box>
            <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                sx={{
                    borderColor: '#7c3aed',
                    color: '#7c3aed',
                    '&:hover': {
                        borderColor: '#5b21b6',
                        backgroundColor: 'rgba(124, 58, 237, 0.04)'
                    }
                }}
            >
                Refresh
            </Button>
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
            Manage your design quotations and track their status. Monitor pending, accepted, and rejected quotations.
        </Typography>
    </Box>
));

// Table Section - Updated to match DesignerPendingDesign style
const TableSection = React.memo(({
    columns,
    filteredQuotations,
    loading,
    stats,
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
                    Quotation List
                </Typography>
                <Chip
                    label={`${filteredQuotations.length} Quotation${filteredQuotations.length !== 1 ? 's' : ''}`}
                    sx={{
                        backgroundColor: "rgba(124, 58, 237, 0.1)",
                        color: "#7c3aed",
                        fontWeight: 600
                    }}
                />
            </Box>

            {filteredQuotations.length === 0 ? (
                <EmptyStateComponent activeTab={activeTab} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredQuotations}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        defaultPageSize: 10,
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `Showing ${range[0]}-${range[1]} of ${total} quotations`,
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

// Quotation Detail Dialog
const QuotationDetailDialog = React.memo(({open, onClose, quotation}) => {
    if (!quotation) return null;

    const statusConfig = getStatusConfig(quotation.status);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e5e7eb',
                pb: 2
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <ReceiptIcon sx={{color: '#7c3aed'}} />
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Quotation Details
                    </Typography>
                </Box>
                <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    sx={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        fontWeight: 600
                    }}
                />
            </DialogTitle>
            
            <DialogContent sx={{pt: 3}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Design Request ID
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {parseID(quotation.designRequestId, 'dr')}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Design Request Name
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {quotation.designRequestName}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            School Name
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {quotation.schoolName}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Price
                        </Typography>
                        <Typography variant="h6" sx={{color: '#059669', fontWeight: 700, mb: 2}}>
                            {formatCurrency(quotation.price)}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Delivery Time
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {quotation.deliveryWithin} days
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Revision Time
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {quotation.revisionTime === 9999 ? 'Unlimited' : `${quotation.revisionTime} times`}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Extra Revision Price
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {quotation.revisionTime === 9999 ? 'N/A' : formatCurrency(quotation.extraRevisionPrice)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Acceptance Deadline
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {formatDate(quotation.acceptanceDeadline)}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                            Creation Date
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 600, mb: 2}}>
                            {formatDate(quotation.creationDate)}
                        </Typography>
                    </Grid>
                    
                    {quotation.note && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{color: '#6b7280', mb: 1}}>
                                Note
                            </Typography>
                            <Typography variant="body1" sx={{
                                backgroundColor: '#f8fafc',
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                {quotation.note}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{p: 3, borderTop: '1px solid #e5e7eb'}}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
});

// Main Component
export default function DesignerQuotationManagement() {
    const [quotations, setQuotations] = useState(mockQuotations);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [sortBy, setSortBy] = useState('creationDate');
    const [sortOrder, setSortOrder] = useState('descend');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Filter and sort quotations based on active tab and sort criteria
    const filteredQuotations = useMemo(() => {
        let filtered = quotations;
        
        // Filter by status based on active tab
        if (activeTab === 0) { // All
            // No status filter
        } else if (activeTab === 1) { // Pending
            filtered = filtered.filter(q => q.status === 'pending');
        } else if (activeTab === 2) { // Accepted
            filtered = filtered.filter(q => q.status === 'accepted');
        } else if (activeTab === 3) { // Rejected
            filtered = filtered.filter(q => q.status === 'rejected');
        }
        
        // Sort quotations
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'designRequestName':
                    aValue = a.designRequestName.toLowerCase();
                    bValue = b.designRequestName.toLowerCase();
                    break;
                case 'schoolName':
                    aValue = a.schoolName.toLowerCase();
                    bValue = b.schoolName.toLowerCase();
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'deliveryWithin':
                    aValue = a.deliveryWithin;
                    bValue = b.deliveryWithin;
                    break;
                case 'status':
                    aValue = a.status.toLowerCase();
                    bValue = b.status.toLowerCase();
                    break;
                case 'creationDate':
                default:
                    aValue = new Date(a.creationDate);
                    bValue = new Date(b.creationDate);
                    break;
            }
            
            if (sortOrder === 'ascend') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? -1 : 1;
            }
        });
        
        return filtered;
    }, [quotations, activeTab, sortBy, sortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = quotations.length;
        const pending = quotations.filter(q => q.status === 'pending').length;
        const accepted = quotations.filter(q => q.status === 'accepted').length;
        const rejected = quotations.filter(q => q.status === 'rejected').length;
        
        return {total, pending, accepted, rejected};
    }, [quotations]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle sort change
    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
        } else {
            setSortBy(field);
            setSortOrder('ascend');
        }
    };

    // Handle view detail
    const handleViewDetail = (quotation) => {
        setSelectedQuotation(quotation);
        setIsDetailDialogOpen(true);
    };

    // Handle close detail dialog
    const handleCloseDetailDialog = () => {
        setIsDetailDialogOpen(false);
        setSelectedQuotation(null);
    };

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            enqueueSnackbar('Data refreshed successfully', {variant: 'success'});
        }, 1000);
    };

    // Handle table change
    const handleTableChange = useCallback((pagination, filters, sorter) => {
        if (sorter.field) {
            setSortBy(sorter.field);
            setSortOrder(sorter.order);
        }
    }, []);

    // Table columns
    const columns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            sorter: true,
            defaultSortOrder: 'descend',
            render: (id) => (
                <Typography variant="body2" sx={{
                    color: '#7c3aed',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                }}>
                    #{id}
                </Typography>
            )
        },
        {
            title: 'Design Request',
            dataIndex: 'designRequestName',
            key: 'designRequestName',
            width: 200,
            sorter: true,
            render: (name, record) => (
                <Box>
                    <Typography variant="body2" sx={{fontWeight: 600, mb: 0.5}}>
                        {name}
                    </Typography>
                    <Typography variant="caption" sx={{color: '#6b7280'}}>
                        {parseID(record.designRequestId, 'dr')}
                    </Typography>
                </Box>
            )
        },
        {
            title: 'School',
            dataIndex: 'schoolName',
            key: 'schoolName',
            width: 150,
            sorter: true,
            render: (name) => (
                <Typography variant="body2" sx={{color: '#374151'}}>
                    {name}
                </Typography>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            sorter: true,
            render: (price) => (
                <Typography variant="body2" sx={{
                    color: '#059669',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                }}>
                    {formatCurrency(price)}
                </Typography>
            )
        },
        {
            title: 'Delivery',
            dataIndex: 'deliveryWithin',
            key: 'deliveryWithin',
            width: 100,
            align: 'center',
            sorter: true,
            render: (days) => (
                <Chip
                    icon={<TimeIcon />}
                    label={`${days} days`}
                    size="small"
                    sx={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 600
                    }}
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            sorter: true,
            render: (status) => {
                const config = getStatusConfig(status);
                return (
                    <Tag color={config.antdColor}>
                        {config.label}
                    </Tag>
                    );
            }
        },
        {
            title: 'Created',
            dataIndex: 'creationDate',
            key: 'creationDate',
            width: 120,
            align: 'center',
            sorter: true,
            defaultSortOrder: 'descend',
            render: (date) => (
                <Typography variant="body2" sx={{color: '#6b7280'}}>
                    {formatDate(date)}
                </Typography>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="View Details">
                    <IconButton
                        onClick={() => handleViewDetail(record)}
                        size="small"
                        sx={{
                            color: '#7c3aed',
                            '&:hover': {
                                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ], [handleViewDetail]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <ErrorStateComponent
                error={error}
                onRetry={handleRefresh}
                isRetrying={loading}
            />
        );
    }

    return (
        <Box sx={{p: 3}}>
            {/* Header Section */}
            <HeaderSection onRefresh={handleRefresh} stats={stats} />

            {/* Statistics Cards */}
            <Box sx={{mb: 4}}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3} sx={{flex: 1}}>
                        <StatCard
                            icon={<AssignmentIcon sx={{color: '#7c3aed'}} />}
                            value={stats.total}
                            label="Total Quotations"
                            color="#7c3aed"
                            bgColor="#ede9fe"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{flex: 1}}>
                        <StatCard
                            icon={<ScheduleIcon sx={{color: '#f59e0b'}} />}
                            value={stats.pending}
                            label="Pending"
                            color="#f59e0b"
                            bgColor="#fef3c7"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{flex: 1}}>
                        <StatCard
                            icon={<CheckCircleIcon sx={{color: '#059669'}} />}
                            value={stats.accepted}
                            label="Accepted"
                            color="#059669"
                            bgColor="#d1fae5"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{flex: 1}}>
                        <StatCard
                            icon={<CancelIcon sx={{color: '#dc2626'}} />}
                            value={stats.rejected}
                            label="Rejected"
                            color="#dc2626"
                            bgColor="#fee2e2"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Main Content */}
            <Paper sx={{
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                overflow: "hidden"
            }}>
                {/* Sort Info and Tabs */}
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{color: '#6b7280'}}>
                            Sorted by: <strong>{
                                sortBy === 'id' ? 'ID' : 
                                sortBy === 'designRequestName' ? 'Design Request' : 
                                sortBy === 'schoolName' ? 'School' : 
                                sortBy === 'price' ? 'Price' : 
                                sortBy === 'deliveryWithin' ? 'Delivery Time' : 
                                sortBy === 'status' ? 'Status' : 
                                'Creation Date'
                            }</strong>
                        </Typography>
                            <Chip
                                label={sortOrder === 'ascend' ? 'Ascending' : 'Descending'}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                    color: '#7c3aed',
                                    fontWeight: 600
                                }}
                            />
                        </Box>
                        
                        <Typography variant="body2" sx={{color: '#6b7280'}}>
                            {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''} found
                        </Typography>
                    </Box>

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
                        <Tab label={`All (${stats.total})`} />
                        <Tab label={`Pending (${stats.pending})`} />
                        <Tab label={`Accepted (${stats.accepted})`} />
                        <Tab label={`Rejected (${stats.rejected})`} />
                    </Tabs>
                </Box>

                {/* Table Section */}
                <TableSection
                    columns={columns}
                    filteredQuotations={filteredQuotations}
                    loading={loading}
                    stats={stats}
                    activeTab={activeTab}
                    onTableChange={handleTableChange}
                />
            </Paper>

            {/* Quotation Detail Dialog */}
            <QuotationDetailDialog
                open={isDetailDialogOpen}
                onClose={handleCloseDetailDialog}
                quotation={selectedQuotation}
            />
        </Box>
    );
}