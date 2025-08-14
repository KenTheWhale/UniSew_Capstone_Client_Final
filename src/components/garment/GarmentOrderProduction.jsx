import React, {useEffect, useState} from 'react';
import {
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
    Fab,
    Grid,
    IconButton,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material';
import {
    AssignmentTurnedIn as AssignmentTurnedInIcon,
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
import {getOrdersByGarment, updateMilestoneStatus, viewMilestone} from '../../services/OrderService';
import {uploadCloudinary} from '../../services/UploadImageService';
import DisplayImage from '../ui/DisplayImage';
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
    const [milestones, setMilestones] = useState({});
    const [milestonesLoading, setMilestonesLoading] = useState({});
    const [milestoneUpdateDialogOpen, setMilestoneUpdateDialogOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [milestoneImage, setMilestoneImage] = useState(null);
    const [milestoneImagePreview, setMilestoneImagePreview] = useState(null);
    const [updatingMilestone, setUpdatingMilestone] = useState(false);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch milestones when orders are loaded
    useEffect(() => {
        if (orders.length > 0) {
            orders.forEach(order => {
                fetchMilestones(order.id);
            });
        }
    }, [orders]);

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



    const fetchMilestones = async (orderId) => {
        try {
            setMilestonesLoading(prev => ({ ...prev, [orderId]: true }));
            const response = await viewMilestone(orderId);
            if (response && response.data) {
                setMilestones(prev => ({ 
                    ...prev, 
                    [orderId]: response.data.body || [] 
                }));
            }
        } catch (error) {
            console.error('Error fetching milestones:', error);
            // Fallback to empty array if API not available
            setMilestones(prev => ({ ...prev, [orderId]: [] }));
        } finally {
            setMilestonesLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };



    const openMilestoneUpdateDialog = (milestone, order) => {
        setSelectedMilestone(milestone);
        setSelectedOrder(order);
        setMilestoneImage(null);
        setMilestoneImagePreview(null);
        setMilestoneUpdateDialogOpen(true);
    };

    const handleMilestoneImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                enqueueSnackbar('Invalid file type. Only images are accepted.', { variant: 'error' });
                return;
            }
            
            setMilestoneImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setMilestoneImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMilestoneUpdate = async () => {
        if (!selectedMilestone || !selectedOrder) return;

        try {
            setUpdatingMilestone(true);
            
            let imageUrl = selectedMilestone.imageUrl;
            
            // Upload image to Cloudinary if a new image is selected
            if (milestoneImage) {
                const uploadedUrl = await uploadCloudinary(milestoneImage);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                    console.log('Image uploaded successfully:', uploadedUrl);
                } else {
                    enqueueSnackbar('Failed to upload image. Please try again.', { variant: 'error' });
                    return;
                }
            }
            
            const data = {
                milestoneId: selectedMilestone.id,
                imageUrl: imageUrl
            };

            const response = await updateMilestoneStatus(data);

            if (response && response.status === 200) {
                enqueueSnackbar('Milestone updated successfully', { variant: 'success' });
                setMilestoneUpdateDialogOpen(false);
                setSelectedMilestone(null);
                setMilestoneImage(null);
                setMilestoneImagePreview(null);
                
                // Refresh milestones for this order
                fetchMilestones(selectedOrder.id);
            } else {
                enqueueSnackbar('Failed to update milestone', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error updating milestone:', error);
            enqueueSnackbar('Failed to update milestone', { variant: 'error' });
        } finally {
            setUpdatingMilestone(false);
        }
    };

    const getStatusInfo = (statusKey) => {
        return PRODUCTION_STATUSES.find(status => status.key === statusKey) || PRODUCTION_STATUSES[0];
    };

    const getStatusIndex = (statusKey) => {
        return PRODUCTION_STATUSES.findIndex(status => status.key === statusKey);
    };

    const canUpdateMilestone = (milestone, orderMilestones) => {
        // Can only update if status is 'assigned' or 'processing'
        if (milestone.status !== 'assigned' && milestone.status !== 'processing') {
            return false;
        }

        // Check if previous milestone is completed (for sequential updates)
        const currentIndex = orderMilestones.findIndex(m => m.id === milestone.id);
        if (currentIndex > 0) {
            const previousMilestone = orderMilestones[currentIndex - 1];
            if (previousMilestone.status !== 'completed') {
                return false;
            }
        }

        return true;
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'assigned':
                return 'processing';
            case 'processing':
                return 'completed';
            default:
                return currentStatus;
        }
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
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

            {/* Orders List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {orders.map((order) => {
                    const currentStatus = getStatusInfo(order.status || 'fabric_preparation');
                    const statusIndex = getStatusIndex(order.status || 'fabric_preparation');
                    
                    return (
                        <Box key={order.id}>
                            <Card elevation={0} sx={{ 
                                borderRadius: 3, 
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        {/* Order Info Section */}
                                        <Grid item xs={12} md={4}>
                                            {/* Order Header */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                <Avatar sx={{ 
                                                    bgcolor: currentStatus.bgColor, 
                                                    color: currentStatus.color,
                                                    width: 48,
                                                    height: 48
                                                }}>
                                                    <currentStatus.icon />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        Order #{order.id}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        {order.school?.business || 'Unknown School'}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    label={currentStatus.label}
                                                    sx={{ 
                                                        backgroundColor: currentStatus.bgColor,
                                                        color: currentStatus.color,
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>

                                            {/* Order Details */}
                                            <Box sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        Deadline:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        {formatDate(order.deadline)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        Total Items:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        {order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        Order Date:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        {formatDate(order.orderDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Progress Section */}
                                        <Grid item xs={12} md={8}>
                                            {/* Combined Progress & Milestones */}
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#475569' }}>
                                                    Production Progress & Milestones
                                                </Typography>
                                                {(() => {
                                                    const orderMilestones = milestones[order.id] || [];
                                                    const isLoading = milestonesLoading[order.id];
                                                    
                                                    if (isLoading) {
                                                        return (
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'center', 
                                                                alignItems: 'center', 
                                                                py: 2 
                                                            }}>
                                                                <CircularProgress size={20} />
                                                                <Typography variant="body2" sx={{ ml: 1, color: '#64748b' }}>
                                                                    Loading milestones...
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }
                                                    
                                                    if (orderMilestones.length > 0) {
                                                        return (
                                                            <Grid container spacing={2}>
                                                                {orderMilestones.map((milestone, index) => {
                                                                    const isCompleted = milestone.status === 'completed';
                                                                    const isProcessing = milestone.status === 'processing';
                                                                    const canUpdate = canUpdateMilestone(milestone, orderMilestones);
                                                                    
                                                                    return (
                                                                        <Grid item xs={12} sm={6} key={milestone.id}>
                                                                            <Paper
                                                                                elevation={0}
                                                                                sx={{
                                                                                    p: 2.5,
                                                                                    border: '1px solid #e2e8f0',
                                                                                    borderRadius: 2,
                                                                                    backgroundColor: '#f8fafc',
                                                                                    transition: 'all 0.2s ease',
                                                                                    height: '100%',
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    position: 'relative',
                                                                                    '&:hover': {
                                                                                        backgroundColor: '#f1f5f9',
                                                                                        transform: 'translateY(-2px)',
                                                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {/* Progress Indicator */}
                                                                                <Box sx={{ 
                                                                                    display: 'flex', 
                                                                                    alignItems: 'center', 
                                                                                    gap: 2, 
                                                                                    mb: 2,
                                                                                    pb: 2,
                                                                                    borderBottom: '1px solid #e2e8f0'
                                                                                }}>
                                                                                    {/* Stage Circle */}
                                                                                    <Box sx={{
                                                                                        width: 48,
                                                                                        height: 48,
                                                                                        borderRadius: '50%',
                                                                                        backgroundColor: isCompleted ? '#10b981' : isProcessing ? '#f59e0b' : '#3b82f6',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        color: 'white',
                                                                                        fontWeight: 'bold',
                                                                                        fontSize: '18px',
                                                                                        border: '3px solid white',
                                                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                                                        position: 'relative'
                                                                                    }}>
                                                                                        {isCompleted ? <CheckCircleIcon sx={{ fontSize: 24 }} /> : milestone.stage}
                                                                                    </Box>
                                                                                    
                                                                                    {/* Stage Info */}
                                                                                    <Box sx={{ flex: 1 }}>
                                                                                        <Typography variant="h6" sx={{ 
                                                                                            fontWeight: 'bold', 
                                                                                            color: '#1e293b',
                                                                                            mb: 0.5
                                                                                        }}>
                                                                                            {milestone.name || `Stage ${milestone.stage}`}
                                                                                        </Typography>
                                                                                        <Chip
                                                                                            label={milestone.status}
                                                                                            size="small"
                                                                                            sx={{
                                                                                                backgroundColor: isCompleted ? '#d1fae5' : 
                                                                                                                isProcessing ? '#fef3c7' : '#e0e7ff',
                                                                                                color: isCompleted ? '#059669' : 
                                                                                                       isProcessing ? '#d97706' : '#3730a3',
                                                                                                fontWeight: 'bold',
                                                                                                fontSize: '0.7rem',
                                                                                                height: '24px',
                                                                                                mb: 1
                                                                                            }}
                                                                                        />
                                                                                        {milestone.description && (
                                                                                            <Typography variant="caption" sx={{ 
                                                                                                color: '#64748b',
                                                                                                display: 'block',
                                                                                                fontSize: '0.75rem',
                                                                                                lineHeight: 1.4
                                                                                            }}>
                                                                                                {milestone.description}
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                    
                                                                                    {/* Update Button - Floating */}
                                                                                    {canUpdate && (
                                                                                        <Button
                                                                                            variant="contained"
                                                                                            size="small"
                                                                                            onClick={() => openMilestoneUpdateDialog(milestone, order)}
                                                                                            sx={{
                                                                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                                                                color: 'white',
                                                                                                fontWeight: 'bold',
                                                                                                fontSize: '0.7rem',
                                                                                                py: 0.5,
                                                                                                px: 1.5,
                                                                                                minWidth: 'auto',
                                                                                                height: '32px',
                                                                                                '&:hover': {
                                                                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                                                                    transform: 'translateY(-1px)'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            Update
                                                                                        </Button>
                                                                                    )}
                                                                                </Box>

                                                                                {/* Timeline */}
                                                                                <Box sx={{ mb: 2 }}>
                                                                                    <Typography variant="caption" sx={{ 
                                                                                        color: '#64748b',
                                                                                        display: 'block',
                                                                                        mb: 1,
                                                                                        fontWeight: 'bold',
                                                                                        textTransform: 'uppercase',
                                                                                        fontSize: '0.7rem'
                                                                                    }}>
                                                                                        Timeline
                                                                                    </Typography>
                                                                                    <Box sx={{ 
                                                                                        display: 'flex', 
                                                                                        flexDirection: 'column', 
                                                                                        gap: 0.5,
                                                                                        fontSize: '0.75rem'
                                                                                    }}>
                                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                                                                Start:
                                                                                            </Typography>
                                                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                                                                {formatDate(milestone.startDate)}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                                                                End:
                                                                                            </Typography>
                                                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                                                                {formatDate(milestone.endDate)}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </Box>

                                                                                {/* Image Preview */}
                                                                                <Box sx={{ mb: 2, flex: 1 }}>
                                                                                    <Typography variant="caption" sx={{ 
                                                                                        color: '#64748b',
                                                                                        display: 'block',
                                                                                        mb: 1,
                                                                                        fontWeight: 'bold',
                                                                                        textTransform: 'uppercase',
                                                                                        fontSize: '0.7rem'
                                                                                    }}>
                                                                                        Current Image
                                                                                    </Typography>
                                                                                    
                                                                                    {milestone.imageUrl && milestone.imageUrl.trim() !== '' ? (
                                                                                        <Box sx={{
                                                                                            width: '100%',
                                                                                            height: 80,
                                                                                            borderRadius: 1,
                                                                                            overflow: 'hidden',
                                                                                            border: '1px solid #e2e8f0',
                                                                                            backgroundColor: '#f1f5f9'
                                                                                        }}>
                                                                                            <DisplayImage
                                                                                                imageUrl={milestone.imageUrl}
                                                                                                alt={`Milestone ${milestone.stage}`}
                                                                                                width="100%"
                                                                                                height="80px"
                                                                                            />
                                                                                        </Box>
                                                                                    ) : (
                                                                                        <Box sx={{
                                                                                            width: '100%',
                                                                                            height: 80,
                                                                                            borderRadius: 1,
                                                                                            border: '1px solid #e2e8f0',
                                                                                            backgroundColor: '#f1f5f9',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            color: '#64748b'
                                                                                        }}>
                                                                                            <Typography variant="caption">
                                                                                                No Image Available
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    )}
                                                                                </Box>

                                                                                {/* Progress Connector */}
                                                                                {index < orderMilestones.length - 1 && (
                                                                                    <Box sx={{
                                                                                        position: 'absolute',
                                                                                        top: '50%',
                                                                                        right: '-16px',
                                                                                        width: '32px',
                                                                                        height: '2px',
                                                                                        backgroundColor: '#e2e8f0',
                                                                                        transform: 'translateY(-50%)',
                                                                                        zIndex: 1
                                                                                    }} />
                                                                                )}
                                                                            </Paper>
                                                                        </Grid>
                                                                    );
                                                                })}
                                                            </Grid>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <Box sx={{ 
                                                            textAlign: 'center', 
                                                            py: 4,
                                                            color: '#64748b',
                                                            fontSize: '0.9rem',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: 2,
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            No milestones available
                                                        </Box>
                                                    );
                                                })()}
                                            </Box>
                                        </Grid>
                                    </Grid>
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

            {/* Milestone Update Dialog */}
            <Dialog 
                open={milestoneUpdateDialogOpen} 
                onClose={() => setMilestoneUpdateDialogOpen(false)}
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
                            Update Milestone Status
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setMilestoneUpdateDialogOpen(false)}
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
                    {selectedMilestone && selectedOrder && (
                        <Grid container spacing={3}>
                            {/* Milestone Info */}
                            <Grid item xs={12} md={selectedMilestone?.status === 'processing' && getNextStatus(selectedMilestone?.status) === 'completed' ? 12 : 5}>
                                <Paper elevation={0} sx={{ 
                                    p: 3, 
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Milestone Information
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            backgroundColor: '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {selectedMilestone.stage}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Stage
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                Stage {selectedMilestone.stage}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <CalendarIcon sx={{ color: '#64748b' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Timeline
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {formatDate(selectedMilestone.startDate)} - {formatDate(selectedMilestone.endDate)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <BusinessIcon sx={{ color: '#64748b' }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Order
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                #{selectedOrder.id} - {selectedOrder.school?.business || 'Unknown School'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Chip
                                            label={`Current: ${selectedMilestone.status}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: selectedMilestone.status === 'completed' ? '#d1fae5' : 
                                                                selectedMilestone.status === 'processing' ? '#fef3c7' : '#e0e7ff',
                                                color: selectedMilestone.status === 'completed' ? '#059669' : 
                                                       selectedMilestone.status === 'processing' ? '#d97706' : '#3730a3',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            →
                                        </Typography>
                                        <Chip
                                            label={`Next: ${getNextStatus(selectedMilestone.status)}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#dbeafe',
                                                color: '#1d4ed8',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Image Upload - Only show if not updating to completed */}
                            {!(selectedMilestone?.status === 'processing' && getNextStatus(selectedMilestone?.status) === 'completed') && (
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Upload Progress Image
                                    </Typography>
                                
                                <Paper elevation={0} sx={{ 
                                    p: 3, 
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: 2,
                                    backgroundColor: '#f8fafc',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: '#3b82f6',
                                        backgroundColor: '#eff6ff'
                                    }
                                }}>
                                    {milestoneImagePreview ? (
                                        <Box>
                                            <Box sx={{
                                                width: '100%',
                                                height: 200,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                mb: 2,
                                                border: '2px solid #e2e8f0'
                                            }}>
                                                <DisplayImage
                                                    imageUrl={milestoneImagePreview}
                                                    alt="Preview"
                                                    width="100%"
                                                    height="200px"
                                                />
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setMilestoneImage(null);
                                                    setMilestoneImagePreview(null);
                                                }}
                                                sx={{
                                                    borderColor: '#ef4444',
                                                    color: '#ef4444',
                                                    '&:hover': {
                                                        borderColor: '#dc2626',
                                                        backgroundColor: '#fef2f2'
                                                    }
                                                }}
                                            >
                                                Remove Image
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <input
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id="milestone-image-upload"
                                                type="file"
                                                onChange={handleMilestoneImageChange}
                                            />
                                            <label htmlFor="milestone-image-upload">
                                                <Box sx={{ cursor: 'pointer' }}>
                                                    <Box sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#e0e7ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto',
                                                        mb: 2,
                                                        color: '#3730a3'
                                                    }}>
                                                        <BrushIcon sx={{ fontSize: 40 }} />
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                                                        Upload Progress Image (Optional)
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                                                        Click to upload an image showing the current progress of this milestone
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        component="span"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                                            }
                                                        }}
                                                    >
                                                        Choose Image
                                                    </Button>
                                                </Box>
                                            </label>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Current Image */}
                                {selectedMilestone.imageUrl && !milestoneImagePreview && (
                                    <Paper elevation={0} sx={{ 
                                        p: 3, 
                                        mt: 2,
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: 2,
                                        border: '1px solid #bae6fd'
                                    }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#0369a1' }}>
                                            Current Milestone Image
                                        </Typography>
                                        <Box sx={{
                                            width: '100%',
                                            height: 150,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: '2px solid #bae6fd'
                                        }}>
                                            <DisplayImage
                                                imageUrl={selectedMilestone.imageUrl}
                                                alt="Current milestone"
                                                width="100%"
                                                height="150px"
                                            />
                                        </Box>
                                    </Paper>
                                )}
                            </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setMilestoneUpdateDialogOpen(false)}
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
                        onClick={handleMilestoneUpdate}
                        disabled={updatingMilestone}
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
                        {updatingMilestone ? (
                            <>
                                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                                Updating...
                            </>
                        ) : (
                            `Update to ${getNextStatus(selectedMilestone?.status || 'assigned')}`
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}