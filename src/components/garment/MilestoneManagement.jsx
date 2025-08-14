import React, { useState, useEffect } from 'react';
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
    TextField,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
    Edit as EditIcon,
    List as ListIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    Timeline as TimelineIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { createPhase, viewPhase, assignMilestone, getGarmentOrders } from '../../services/OrderService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function MilestoneManagement() {
    // States for phases
    const [phases, setPhases] = useState([]);
    const [phasesLoading, setPhasesLoading] = useState(true);
    
    // States for orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [orderMilestones, setOrderMilestones] = useState({});
    const [milestonesLoading, setMilestonesLoading] = useState({});
    
    // States for phase creation
    const [createPhaseDialogOpen, setCreatePhaseDialogOpen] = useState(false);
    const [newPhase, setNewPhase] = useState({ name: '', description: '' });
    const [creatingPhase, setCreatingPhase] = useState(false);
    
    // States for milestone assignment
    const [assignMilestoneDialogOpen, setAssignMilestoneDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPhases, setSelectedPhases] = useState([]);
    const [assigningMilestone, setAssigningMilestone] = useState(false);
    
    // States for phase preview
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewPhases, setPreviewPhases] = useState([]);
    
    // Active tab
    const [activeTab, setActiveTab] = useState('phases'); // 'phases' or 'assignments'

    // Fetch data on component mount
    useEffect(() => {
        fetchPhases();
        fetchOrders();
    }, []);

    // No need to fetch milestones separately as they come with orders now
    // useEffect(() => {
    //     if (orders.length > 0) {
    //         orders.forEach(order => {
    //             fetchOrderMilestones(order.id);
    //         });
    //     }
    // }, [orders]);

    const fetchPhases = async () => {
        try {
            setPhasesLoading(true);
            const response = await viewPhase();
            if (response && response.data) {
                setPhases(response.data.body || []);
            }
        } catch (error) {
            console.error('Error fetching phases:', error);
            enqueueSnackbar('Failed to load phases', { variant: 'error' });
        } finally {
            setPhasesLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const response = await getGarmentOrders();
            if (response && response.data) {
                // Filter only processing orders and handle new data structure
                const processingOrders = (response.data.body || []).filter(order => order.status === 'processing');
                setOrders(processingOrders);
                
                // Pre-populate milestones from the new API structure
                const milestonesData = {};
                processingOrders.forEach(order => {
                    if (order.milestone && Array.isArray(order.milestone)) {
                        milestonesData[order.id] = order.milestone;
                    }
                });
                setOrderMilestones(milestonesData);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            enqueueSnackbar('Failed to load orders', { variant: 'error' });
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchOrderMilestones = async (orderId) => {
        try {
            setMilestonesLoading(prev => ({ ...prev, [orderId]: true }));
            const response = await viewMilestone(orderId);
            if (response && response.data) {
                setOrderMilestones(prev => ({ 
                    ...prev, 
                    [orderId]: response.data.body || [] 
                }));
            }
        } catch (error) {
            console.error('Error fetching milestones for order:', orderId, error);
            // Set empty array if no milestones found
            setOrderMilestones(prev => ({ ...prev, [orderId]: [] }));
        } finally {
            setMilestonesLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleCreatePhase = async () => {
        if (!newPhase.name.trim() || !newPhase.description.trim()) {
            enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
            return;
        }

        try {
            setCreatingPhase(true);
            const response = await createPhase(newPhase);
            if (response && response.status === 201) {
                enqueueSnackbar('Phase created successfully', { variant: 'success' });
                setCreatePhaseDialogOpen(false);
                setNewPhase({ name: '', description: '' });
                fetchPhases(); // Refresh phases list
            } else {
                enqueueSnackbar('Failed to create phase', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error creating phase:', error);
            enqueueSnackbar('Failed to create phase', { variant: 'error' });
        } finally {
            setCreatingPhase(false);
        }
    };

    const openAssignMilestoneDialog = (order) => {
        setSelectedOrder(order);
        setSelectedPhases([]);
        setAssignMilestoneDialogOpen(true);
    };

    const handlePhaseSelection = (phase) => {
        const isSelected = selectedPhases.find(p => p.id === phase.id);
        if (isSelected) {
            setSelectedPhases(selectedPhases.filter(p => p.id !== phase.id));
        } else {
            setSelectedPhases([...selectedPhases, {
                ...phase,
                stage: selectedPhases.length + 1,
                startDate: dayjs().add(selectedPhases.length, 'day').format('YYYY-MM-DD'),
                endDate: dayjs().add(selectedPhases.length + 1, 'day').format('YYYY-MM-DD')
            }]);
        }
    };

    const handlePhaseReorder = (fromIndex, toIndex) => {
        const reorderedPhases = [...selectedPhases];
        const [movedPhase] = reorderedPhases.splice(fromIndex, 1);
        reorderedPhases.splice(toIndex, 0, movedPhase);
        
        // Update stage numbers
        const updatedPhases = reorderedPhases.map((phase, index) => ({
            ...phase,
            stage: index + 1
        }));
        
        setSelectedPhases(updatedPhases);
    };

    const handleAssignMilestone = async () => {
        if (selectedPhases.length === 0) {
            enqueueSnackbar('Please select at least one phase', { variant: 'warning' });
            return;
        }

        try {
            setAssigningMilestone(true);
            const data = {
                orderId: selectedOrder.id,
                phaseList: selectedPhases.map(phase => ({
                    id: phase.id,
                    stage: phase.stage,
                    startDate: phase.startDate,
                    endDate: phase.endDate
                }))
            };

            const response = await assignMilestone(data);
            if (response && response.status === 200) {
                enqueueSnackbar('Milestone assigned successfully', { variant: 'success' });
                setAssignMilestoneDialogOpen(false);
                setSelectedOrder(null);
                setSelectedPhases([]);
                // Refresh all orders to get updated milestone data
                fetchOrders();
            } else {
                enqueueSnackbar('Failed to assign milestone', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error assigning milestone:', error);
            enqueueSnackbar('Failed to assign milestone', { variant: 'error' });
        } finally {
            setAssigningMilestone(false);
        }
    };

    const openPreviewDialog = (phases) => {
        setPreviewPhases(phases);
        setPreviewDialogOpen(true);
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    if (phasesLoading || ordersLoading) {
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                        Milestone Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Create production phases and assign milestones to orders
                    </Typography>
                </Box>

                {/* Tab Navigation */}
                <Box sx={{ mb: 4 }}>
                    <Paper elevation={0} sx={{ 
                        borderRadius: 3, 
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ display: 'flex' }}>
                            <Button
                                onClick={() => setActiveTab('phases')}
                                sx={{
                                    flex: 1,
                                    py: 2,
                                    backgroundColor: activeTab === 'phases' ? '#3b82f6' : 'transparent',
                                    color: activeTab === 'phases' ? 'white' : '#64748b',
                                    borderRadius: 0,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: activeTab === 'phases' ? '#2563eb' : '#f1f5f9'
                                    }
                                }}
                                startIcon={<BuildIcon />}
                            >
                                Production Phases
                            </Button>
                            <Button
                                onClick={() => setActiveTab('assignments')}
                                sx={{
                                    flex: 1,
                                    py: 2,
                                    backgroundColor: activeTab === 'assignments' ? '#3b82f6' : 'transparent',
                                    color: activeTab === 'assignments' ? 'white' : '#64748b',
                                    borderRadius: 0,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: activeTab === 'assignments' ? '#2563eb' : '#f1f5f9'
                                    }
                                }}
                                startIcon={<AssignmentIcon />}
                            >
                                Assign Milestones
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Content based on active tab */}
                {activeTab === 'phases' ? (
                    /* Phases Management */
                    <Box>
                        {/* Header with Create Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    Production Phases
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Manage your production workflow phases
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreatePhaseDialogOpen(true)}
                                sx={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                    }
                                }}
                            >
                                Create Phase
                            </Button>
                        </Box>

                        {/* Phases Grid */}
                        <Grid container spacing={3}>
                            {phases.map((phase) => (
                                <Grid item xs={12} sm={6} md={4} key={phase.id}>
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ 
                                                    bgcolor: '#3b82f6', 
                                                    width: 48, 
                                                    height: 48 
                                                }}>
                                                    <BuildIcon />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        {phase.name}
                                                    </Typography>
                                                    <Chip 
                                                        label={phase.status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: phase.status === 'active' ? '#d1fae5' : '#fee2e2',
                                                            color: phase.status === 'active' ? '#059669' : '#dc2626',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            
                                            <Typography variant="body2" sx={{ 
                                                color: '#64748b', 
                                                mb: 2,
                                                lineHeight: 1.6
                                            }}>
                                                {phase.description}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    sx={{
                                                        color: '#3b82f6',
                                                        borderColor: '#3b82f6',
                                                        '&:hover': {
                                                            borderColor: '#2563eb',
                                                            backgroundColor: '#eff6ff'
                                                        }
                                                    }}
                                                    variant="outlined"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    sx={{
                                                        color: '#ef4444',
                                                        borderColor: '#ef4444',
                                                        '&:hover': {
                                                            borderColor: '#dc2626',
                                                            backgroundColor: '#fef2f2'
                                                        }
                                                    }}
                                                    variant="outlined"
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* No Phases Message */}
                        {phases.length === 0 && (
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 8,
                                backgroundColor: '#f8fafc',
                                borderRadius: 3,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <BuildIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                    No Phases Created
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                                    Create your first production phase to get started
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreatePhaseDialogOpen(true)}
                                    sx={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        px: 3,
                                        py: 1.5,
                                        borderRadius: 2,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                        }
                                    }}
                                >
                                    Create First Phase
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    /* Milestone Assignments */
                    <Box>
                        {/* Header */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                                Assign Milestones to Orders
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                                Select phases and assign them to processing orders
                            </Typography>
                            
                            {/* Milestone Statistics */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={`${orders.filter(order => (order.milestone || []).length > 0).length} Orders with Milestones`}
                                    sx={{
                                        backgroundColor: '#d1fae5',
                                        color: '#059669',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Chip 
                                    label={`${orders.filter(order => (order.milestone || []).length === 0).length} Orders without Milestones`}
                                    sx={{
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Orders List */}
                        <Grid container spacing={3}>
                            {orders.map((order) => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                const isLoading = false; // No longer loading as data comes with orders
                                
                                return (
                                    <Grid item xs={12} md={6} key={order.id}>
                                        <Card elevation={0} sx={{ 
                                            borderRadius: 3, 
                                            border: hasMilestone ? '2px solid #10b981' : '1px solid #e2e8f0',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: hasMilestone ? '#f0fdf4' : '#ffffff',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ 
                                                        bgcolor: hasMilestone ? '#10b981' : '#f59e0b', 
                                                        width: 48, 
                                                        height: 48 
                                                    }}>
                                                        {hasMilestone ? <CheckCircleIcon /> : <AssignmentIcon />}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                            Order #{order.id}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            {order.school?.business || 'Unknown School'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                                        <Chip 
                                                            label="Processing"
                                                            sx={{
                                                                backgroundColor: '#fef3c7',
                                                                color: '#d97706',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                        {isLoading ? (
                                                            <CircularProgress size={16} />
                                                        ) : (
                                                            <Chip 
                                                                label={hasMilestone ? `${orderMilestone.length} Phases` : 'No Milestone'}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: hasMilestone ? '#d1fae5' : '#fee2e2',
                                                                    color: hasMilestone ? '#059669' : '#dc2626',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            
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
                                            
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={hasMilestone ? <EditIcon /> : <AssignmentIcon />}
                                                    onClick={() => openAssignMilestoneDialog(order)}
                                                    sx={{
                                                        flex: 1,
                                                        background: hasMilestone 
                                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        '&:hover': {
                                                            background: hasMilestone
                                                                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                                                : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                                        }
                                                    }}
                                                >
                                                    {hasMilestone ? 'Edit Milestone' : 'Assign Milestone'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => hasMilestone && openPreviewDialog(orderMilestone)}
                                                    disabled={!hasMilestone}
                                                    sx={{
                                                        borderColor: hasMilestone ? '#10b981' : '#d1d5db',
                                                        color: hasMilestone ? '#10b981' : '#9ca3af',
                                                        '&:hover': {
                                                            borderColor: hasMilestone ? '#059669' : '#d1d5db',
                                                            backgroundColor: hasMilestone ? '#f0fdf4' : '#f9fafb'
                                                        }
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                        </Grid>

                        {/* No Orders Message */}
                        {orders.length === 0 && (
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 8,
                                backgroundColor: '#f8fafc',
                                borderRadius: 3,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <AssignmentIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                    No Processing Orders
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                    There are no orders in processing status to assign milestones to.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Refresh FAB */}
                <Fab
                    color="primary"
                    aria-label="refresh"
                    onClick={() => {
                        fetchPhases();
                        fetchOrders();
                    }}
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

                {/* Create Phase Dialog */}
                <Dialog 
                    open={createPhaseDialogOpen} 
                    onClose={() => setCreatePhaseDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { 
                            borderRadius: 3,
                            '& .MuiDialogContent-root': {
                                paddingTop: '32px !important'
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <BuildIcon />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Create New Phase
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setCreatePhaseDialogOpen(false)}
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

                    <DialogContent sx={{ p: 4, pb: 2, pt: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <TextField
                                label="Phase Name"
                                value={newPhase.name}
                                onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                                fullWidth
                                placeholder="e.g., Cutting, Sewing, Quality Check"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            <TextField
                                label="Description"
                                value={newPhase.description}
                                onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Describe what this phase involves..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setCreatePhaseDialogOpen(false)}
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
                            onClick={handleCreatePhase}
                            disabled={creatingPhase}
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
                            {creatingPhase ? (
                                <>
                                    <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                                    Creating...
                                </>
                            ) : (
                                'Create Phase'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Assign Milestone Dialog */}
                <Dialog 
                    open={assignMilestoneDialogOpen} 
                    onClose={() => setAssignMilestoneDialogOpen(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: { 
                            borderRadius: 3,
                            '& .MuiDialogContent-root': {
                                paddingTop: '32px !important'
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AssignmentIcon />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {(selectedOrder?.milestone || []).length > 0 ? 'Edit' : 'Assign'} Milestone to Order #{selectedOrder?.id}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setAssignMilestoneDialogOpen(false)}
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

                    <DialogContent sx={{ p: 4, pb: 2, pt: 6 }}>
                        {selectedOrder && (
                            <Grid container spacing={3}>
                                {/* Available Phases */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Available Phases
                                    </Typography>
                                    <Paper elevation={0} sx={{ 
                                        p: 2, 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        maxHeight: 400,
                                        overflow: 'auto'
                                    }}>
                                        {phases.map((phase) => (
                                            <Card
                                                key={phase.id}
                                                elevation={0}
                                                onClick={() => handlePhaseSelection(phase)}
                                                sx={{
                                                    mb: 2,
                                                    cursor: 'pointer',
                                                    border: selectedPhases.find(p => p.id === phase.id) 
                                                        ? '2px solid #3b82f6' 
                                                        : '1px solid #e2e8f0',
                                                    borderRadius: 2,
                                                    backgroundColor: selectedPhases.find(p => p.id === phase.id) 
                                                        ? '#eff6ff' 
                                                        : '#ffffff',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#3b82f6',
                                                        backgroundColor: '#f8fafc'
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <CheckCircleIcon 
                                                            sx={{ 
                                                                color: selectedPhases.find(p => p.id === phase.id) 
                                                                    ? '#3b82f6' 
                                                                    : '#cbd5e1',
                                                                fontSize: 20
                                                            }} 
                                                        />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                                {phase.name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                                {phase.description}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Paper>
                                </Grid>

                                {/* Selected Phases */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                        Selected Phases ({selectedPhases.length})
                                    </Typography>
                                    
                                    {selectedPhases.length > 0 ? (
                                        <Paper elevation={0} sx={{ 
                                            p: 2, 
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            maxHeight: 400,
                                            overflow: 'auto'
                                        }}>
                                            <List>
                                                {selectedPhases.map((phase, index) => (
                                                    <ListItem
                                                        key={phase.id}
                                                        sx={{
                                                            mb: 2,
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: 2,
                                                            backgroundColor: '#f8fafc'
                                                        }}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ 
                                                                bgcolor: '#3b82f6', 
                                                                width: 32, 
                                                                height: 32,
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {phase.stage}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                                        {phase.name}
                                                                    </Typography>
                                                                    <Chip 
                                                                        label={`Stage ${phase.stage}`}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: '#dbeafe',
                                                                            color: '#1d4ed8',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '0.6rem'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                                                                        {phase.description}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                                        <DatePicker
                                                                            label="Start Date"
                                                                            value={dayjs(phase.startDate)}
                                                                            onChange={(date) => {
                                                                                const updatedPhases = selectedPhases.map(p => 
                                                                                    p.id === phase.id 
                                                                                        ? { ...p, startDate: date.format('YYYY-MM-DD') }
                                                                                        : p
                                                                                );
                                                                                setSelectedPhases(updatedPhases);
                                                                            }}
                                                                            slotProps={{
                                                                                textField: {
                                                                                    size: 'small',
                                                                                    sx: { width: '100%' }
                                                                                }
                                                                            }}
                                                                        />
                                                                        <DatePicker
                                                                            label="End Date"
                                                                            value={dayjs(phase.endDate)}
                                                                            onChange={(date) => {
                                                                                const updatedPhases = selectedPhases.map(p => 
                                                                                    p.id === phase.id 
                                                                                        ? { ...p, endDate: date.format('YYYY-MM-DD') }
                                                                                        : p
                                                                                );
                                                                                setSelectedPhases(updatedPhases);
                                                                            }}
                                                                            slotProps={{
                                                                                textField: {
                                                                                    size: 'small',
                                                                                    sx: { width: '100%' }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedPhases(selectedPhases.filter(p => p.id !== phase.id));
                                                            }}
                                                            sx={{ color: '#ef4444' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                            
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => openPreviewDialog(selectedPhases)}
                                                    fullWidth
                                                    sx={{
                                                        borderColor: '#3b82f6',
                                                        color: '#3b82f6',
                                                        '&:hover': {
                                                            borderColor: '#2563eb',
                                                            backgroundColor: '#eff6ff'
                                                        }
                                                    }}
                                                >
                                                    Preview Milestone
                                                </Button>
                                            </Box>
                                        </Paper>
                                    ) : (
                                        <Paper elevation={0} sx={{ 
                                            p: 4, 
                                            border: '2px dashed #cbd5e1',
                                            borderRadius: 2,
                                            backgroundColor: '#f8fafc',
                                            textAlign: 'center'
                                        }}>
                                            <AssignmentIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Select phases from the left to create a milestone
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setAssignMilestoneDialogOpen(false)}
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
                            onClick={handleAssignMilestone}
                            disabled={assigningMilestone || selectedPhases.length === 0}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                },
                                '&:disabled': {
                                    background: '#9ca3af'
                                }
                            }}
                        >
                            {assigningMilestone ? (
                                <>
                                    <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                                    Assigning...
                                </>
                            ) : (
                                'Assign Milestone'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog 
                    open={previewDialogOpen} 
                    onClose={() => setPreviewDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { 
                            borderRadius: 3,
                            '& .MuiDialogContent-root': {
                                paddingTop: '32px !important'
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TimelineIcon />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Milestone Preview
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setPreviewDialogOpen(false)}
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

                    <DialogContent sx={{ p: 4, pb: 2, pt: 6 }}>
                        <Stepper orientation="vertical" sx={{ mt: 2 }}>
                            {previewPhases.map((phase, index) => (
                                <Step key={phase.id} active={true} completed={false}>
                                    <StepLabel
                                        icon={
                                            <Avatar sx={{ 
                                                bgcolor: '#8b5cf6', 
                                                width: 32, 
                                                height: 32,
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {phase.stage}
                                            </Avatar>
                                        }
                                    >
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                {phase.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                {phase.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, fontSize: '0.8rem' }}>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                    Start: {formatDate(phase.startDate)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                    End: {formatDate(phase.endDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setPreviewDialogOpen(false)}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
}