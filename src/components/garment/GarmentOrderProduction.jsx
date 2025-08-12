import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material';
import {
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    AttachMoney as MoneyIcon,
    Brush as BrushIcon,
    Build as BuildIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    ContentCut as ContentCutIcon,
    Inventory as InventoryIcon,
    Inventory2 as Inventory2Icon,
    LocalLaundryService as LocalLaundryServiceIcon,
    LocalShipping as LocalShippingIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    Timeline as TimelineIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {getOrdersByGarment, updateMilestoneStatus} from '../../services/OrderService';
import dayjs from "dayjs";

// Production status configuration
const PRODUCTION_STATUSES = [
    {
        key: 'fabric_preparation',
        label: 'Fabric Preparation',
        description: 'Preparing and cutting fabric materials',
        icon: InventoryIcon,
        color: '#3b82f6',
        bgColor: '#dbeafe'
    },
    {
        key: 'cutting',
        label: 'Cutting',
        description: 'Cutting fabric into pattern pieces',
        icon: ContentCutIcon,
        color: '#8b5cf6',
        bgColor: '#ede9fe'
    },
    {
        key: 'patching',
        label: 'Patching',
        description: 'Applying patches and reinforcements',
        icon: BrushIcon,
        color: '#f59e0b',
        bgColor: '#fef3c7'
    },
    {
        key: 'sewing',
        label: 'Sewing',
        description: 'Machine sewing of garment pieces',
        icon: ContentCutIcon,
        color: '#10b981',
        bgColor: '#d1fae5'
    },
    {
        key: 'embroidering',
        label: 'Embroidering',
        description: 'Adding embroidered logos/details',
        icon: BuildIcon,
        color: '#ef4444',
        bgColor: '#fee2e2'
    },
    {
        key: 'hand_sewing',
        label: 'Hand Sewing',
        description: 'Final hand stitching and finishing',
        icon: AssignmentTurnedInIcon,
        color: '#06b6d4',
        bgColor: '#cffafe'
    },
    {
        key: 'ironing',
        label: 'Ironing',
        description: 'Pressing and finishing garments',
        icon: LocalLaundryServiceIcon,
        color: '#84cc16',
        bgColor: '#ecfccb'
    },
    {
        key: 'quality_check',
        label: 'Quality Check',
        description: 'Final inspection and quality control',
        icon: VerifiedIcon,
        color: '#f97316',
        bgColor: '#fed7aa'
    },
    {
        key: 'packaging',
        label: 'Packaging',
        description: 'Packaging and labeling orders',
        icon: Inventory2Icon,
        color: '#6366f1',
        bgColor: '#e0e7ff'
    },
    {
        key: 'delivering',
        label: 'Delivering',
        description: 'Out for delivery to school',
        icon: LocalShippingIcon,
        color: '#14b8a6',
        bgColor: '#ccfbf1'
    },
    {
        key: 'completed',
        label: 'Completed',
        description: 'Order successfully delivered',
        icon: CheckCircleIcon,
        color: '#059669',
        bgColor: '#d1fae5'
    }
];

export default function GarmentOrderProduction() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [productionHistory, setProductionHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getOrdersByGarment();
            if (response && response.data) {
                setOrders(response.data.body || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            enqueueSnackbar('Failed to load orders', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchProductionHistory = async (orderId) => {
        try {
            setHistoryLoading(false);
            // const response = await getOrderProductionHistory(orderId);
            // if (response && response.data) {
            //     setProductionHistory(response.data.body || []);
            // }
        } catch (error) {
            console.error('Error fetching production history:', error);
            // Fallback to empty array if API not available
            setProductionHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setUpdating(true);
            // const data = {
            //     orderId: selectedOrder.id,
            //     status: newStatus
            // };
            //
            // const response = await updateMilestoneStatus(data)
            //
            // if (response && response.status === 200) {
            //     enqueueSnackbar('Production status updated successfully', { variant: 'success' });
            //     setUpdateDialogOpen(false);
            //     setNewStatus('');
            //     setSelectedOrder(null);
            //     fetchOrders(); // Refresh orders
            // } else {
            //     enqueueSnackbar('Failed to update production status', { variant: 'error' });
            // }
            fetchOrders(); // Refresh orders
        } catch (error) {
            console.error('Error updating production status:', error);
            enqueueSnackbar('Failed to update production status', { variant: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const openUpdateDialog = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status || 'fabric_preparation');
        setUpdateDialogOpen(true);
        fetchProductionHistory(order.id);
    };

    const getStatusInfo = (statusKey) => {
        return PRODUCTION_STATUSES.find(status => status.key === statusKey) || PRODUCTION_STATUSES[0];
    };

    const getStatusIndex = (statusKey) => {
        return PRODUCTION_STATUSES.findIndex(status => status.key === statusKey);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh' 
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, px: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                    Production Management
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Track and update production status for all orders
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <InventoryIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {orders.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Total Orders
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {orders.filter(order => order.status === 'completed').length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Completed
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ScheduleIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {orders.filter(order => order.status !== 'completed' && order.status !== 'delivering').length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    In Production
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <LocalShippingIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    {orders.filter(order => order.status === 'delivering').length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Delivering
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Orders Grid */}
            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                width: '100%'
            }}>
                {orders.map((order) => {
                    const currentStatus = getStatusInfo(order.status || 'fabric_preparation');
                    const statusIndex = getStatusIndex(order.status || 'fabric_preparation');
                    
                    return (
                        <Box sx={{ 
                            flex: '1 1 300px',
                            minWidth: '300px',
                            maxWidth: '400px'
                        }} key={order.id}>
                            <Card elevation={0} sx={{ 
                                borderRadius: 3, 
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-4px)'
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    {/* Order Header */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                        <Avatar sx={{ 
                                            bgcolor: currentStatus.bgColor, 
                                            color: currentStatus.color,
                                            width: 36,
                                            height: 36
                                        }}>
                                            <currentStatus.icon sx={{ fontSize: 18 }} />
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>
                                                #{order.id}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {order.school?.business || 'Unknown School'}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={currentStatus.label}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: currentStatus.bgColor,
                                                color: currentStatus.color,
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                height: 20
                                            }}
                                        />
                                    </Box>

                                    {/* Order Details */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                Deadline:
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {dayjs(order.deadline).format('DD/MM')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                Items:
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                Order:
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {dayjs(order.orderDate).format('DD/MM')}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Progress Indicator */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569' }}>
                                                Progress
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: currentStatus.color }}>
                                                {Math.round(((statusIndex + 1) / PRODUCTION_STATUSES.length) * 100)}%
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            width: '100%',
                                            height: 6,
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: 3,
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{
                                                width: `${((statusIndex + 1) / PRODUCTION_STATUSES.length) * 100}%`,
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${currentStatus.color} 0%, ${currentStatus.color}80 100%)`,
                                                borderRadius: 3,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                                            {currentStatus.label}
                                        </Typography>
                                    </Box>

                                    {/* Action Button */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="small"
                                        onClick={() => openUpdateDialog(order)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            py: 1,
                                            fontSize: '0.8rem',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Update Status
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>

            {/* No Orders Message */}
            {orders.length === 0 && !loading && (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    backgroundColor: '#f8fafc',
                    borderRadius: 3,
                    border: '2px dashed #cbd5e1'
                }}>
                    <InventoryIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                        No Orders Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        There are no orders assigned to your garment factory yet.
                    </Typography>
                </Box>
            )}

            {/* Update Status Dialog */}
            <Dialog 
                open={updateDialogOpen} 
                onClose={() => setUpdateDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TimelineIcon />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Update Production Status
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setUpdateDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, pb: 2 }}>
                    {selectedOrder && (
                        <Grid container spacing={3}>
                            {/* Order Info */}
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, 
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    mt: 1
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Order Information
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <BusinessIcon sx={{ color: '#64748b' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                School
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {selectedOrder.school?.business || 'Unknown'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <CalendarIcon sx={{ color: '#64748b' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Deadline
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {formatDate(selectedOrder.deadline)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <MoneyIcon sx={{ color: '#64748b' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Total Items
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {selectedOrder.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Status Selection */}
                            <Grid item xs={12} md={7}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b', mt: 1 }}>
                                    Select New Status
                                </Typography>
                                
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 1.5, 
                                    maxHeight: 400, 
                                    overflowY: 'auto',
                                    pr: 1
                                }}>
                                    {PRODUCTION_STATUSES.map((status) => {
                                        const isSelected = newStatus === status.key;
                                        const isCompleted = getStatusIndex(selectedOrder.status || 'fabric_preparation') >= getStatusIndex(status.key);
                                        
                                        return (
                                            <Paper
                                                key={status.key}
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    cursor: 'pointer',
                                                    border: isSelected ? `2px solid ${status.color}` : '1px solid #e2e8f0',
                                                    backgroundColor: isSelected ? status.bgColor : 'white',
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: status.color,
                                                        backgroundColor: status.bgColor,
                                                        transform: 'translateX(4px)',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                    }
                                                }}
                                                onClick={() => setNewStatus(status.key)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                    <Box sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '50%',
                                                        backgroundColor: isCompleted ? '#10b981' : status.color,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}>
                                                        {isCompleted ? (
                                                            <CheckCircleIcon sx={{ fontSize: 20 }} />
                                                        ) : (
                                                            <status.icon sx={{ fontSize: 20 }} />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" sx={{ 
                                                            fontWeight: 'bold', 
                                                            color: '#1e293b',
                                                            mb: 0.5,
                                                            fontSize: '0.95rem'
                                                        }}>
                                                            {status.label}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#64748b',
                                                            fontSize: '0.85rem',
                                                            lineHeight: 1.4
                                                        }}>
                                                            {status.description}
                                                        </Typography>
                                                    </Box>
                                                    {isSelected && (
                                                        <CheckCircleIcon sx={{ 
                                                            color: status.color, 
                                                            fontSize: 22,
                                                            flexShrink: 0
                                                        }} />
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Grid>

                            {/* Production History */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                    Production History
                                </Typography>
                                
                                {historyLoading ? (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        py: 4,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <CircularProgress size={32} sx={{ mb: 2 }} />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Loading production history...
                                        </Typography>
                                    </Box>
                                ) : productionHistory.length > 0 ? (
                                    <Box sx={{ 
                                        backgroundColor: '#f8fafc', 
                                        borderRadius: 2, 
                                        border: '1px solid #e2e8f0',
                                        maxHeight: 200,
                                        overflowY: 'auto'
                                    }}>
                                        <List sx={{ p: 0 }}>
                                            {productionHistory.map((history, index) => {
                                                const statusInfo = getStatusInfo(history.status);
                                                return (
                                                    <ListItem key={index} sx={{ 
                                                        borderBottom: index < productionHistory.length - 1 ? '1px solid #e2e8f0' : 'none',
                                                        py: 2
                                                    }}>
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ 
                                                                bgcolor: statusInfo.bgColor, 
                                                                color: statusInfo.color,
                                                                width: 36,
                                                                height: 36
                                                            }}>
                                                                <statusInfo.icon sx={{ fontSize: 18 }} />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={statusInfo.label}
                                                            secondary={`Updated on ${formatDate(history.updatedAt || history.timestamp)}`}
                                                            primaryTypographyProps={{ 
                                                                fontWeight: 'bold',
                                                                fontSize: '0.9rem'
                                                            }}
                                                            secondaryTypographyProps={{
                                                                fontSize: '0.8rem'
                                                            }}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                ) : (
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        No production history available for this order.
                                    </Alert>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setUpdateDialogOpen(false)}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusUpdate}
                        disabled={updating || !newStatus}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            '&:disabled': {
                                background: '#9ca3af'
                            }
                        }}
                    >
                        {updating ? (
                            <>
                                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                                Updating...
                            </>
                        ) : (
                            'Update Status'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Refresh FAB */}
            <Fab
                color="primary"
                aria-label="refresh"
                onClick={fetchOrders}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                    }
                }}
            >
                <RefreshIcon />
            </Fab>
        </Box>
    );
}