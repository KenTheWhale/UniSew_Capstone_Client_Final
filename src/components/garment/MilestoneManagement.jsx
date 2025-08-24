import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    IconButton,
    List,
    Paper,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {assignMilestone, createPhase, getGarmentOrders, updateMilestoneStatus, viewPhase} from '../../services/OrderService';
import {uploadCloudinary} from '../../services/UploadImageService';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
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
    const [newPhase, setNewPhase] = useState({name: '', description: ''});
    const [creatingPhase, setCreatingPhase] = useState(false);

    // States for milestone assignment
    const [assignMilestoneDialogOpen, setAssignMilestoneDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPhases, setSelectedPhases] = useState([]);
    const [assigningMilestone, setAssigningMilestone] = useState(false);
    const [showDateSettings, setShowDateSettings] = useState(false);
    const [durationDialogOpen, setDurationDialogOpen] = useState(false);
    const [stageDurations, setStageDurations] = useState({}); // Lưu duration cho từng stage
    const [viewMilestoneDialogOpen, setViewMilestoneDialogOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [milestoneViewMode, setMilestoneViewMode] = useState('stepper'); // 'stepper' or 'box'
    const [currentPhase, setCurrentPhase] = useState(1); // Track current phase
    const [phaseStatuses, setPhaseStatuses] = useState({}); // Track phase statuses
    const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [updatingData, setUpdatingData] = useState(false);

    // Drag and drop states
    const [draggedPhase, setDraggedPhase] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [draggedSelectedPhase, setDraggedSelectedPhase] = useState(null);
    const [dragOverSelectedIndex, setDragOverSelectedIndex] = useState(null);
    const [isDragOverAvailable, setIsDragOverAvailable] = useState(false);


    // Active tab
    const [activeTab, setActiveTab] = useState('phases'); // 'phases', 'assignments', or 'manage'

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
            enqueueSnackbar('Failed to load phases', {variant: 'error'});
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
            enqueueSnackbar('Failed to load orders', {variant: 'error'});
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchOrderMilestones = async (orderId) => {
        try {
            setMilestonesLoading(prev => ({...prev, [orderId]: true}));
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
            setOrderMilestones(prev => ({...prev, [orderId]: []}));
        } finally {
            setMilestonesLoading(prev => ({...prev, [orderId]: false}));
        }
    };

    const handleCreatePhase = async () => {
        if (!newPhase.name.trim() || !newPhase.description.trim()) {
            enqueueSnackbar('Please fill in all fields', {variant: 'warning'});
            return;
        }

        try {
            setCreatingPhase(true);
            const response = await createPhase(newPhase);
            if (response && response.status === 201) {
                enqueueSnackbar('Phase created successfully', {variant: 'success'});
                setCreatePhaseDialogOpen(false);
                setNewPhase({name: '', description: ''});
                fetchPhases(); // Refresh phases list
            } else {
                enqueueSnackbar('Failed to create phase', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error creating phase:', error);
            enqueueSnackbar('Failed to create phase', {variant: 'error'});
        } finally {
            setCreatingPhase(false);
        }
    };

    const openAssignMilestoneDialog = (order) => {
        setSelectedOrder(order);
        setSelectedPhases([]);
        setAssignMilestoneDialogOpen(true);
    };

    const openViewMilestoneDialog = (order) => {
        setViewingOrder(order);
        setViewMilestoneDialogOpen(true);
        // Initialize phase statuses based on API status
        const statuses = {};
        if (order.milestone && order.milestone.length > 0) {
            order.milestone.forEach((phase) => {
                const stage = phase.stage;
                // Map API status to UI status
                if (phase.status === 'completed') {
                    statuses[stage] = 'done';
                } else if (phase.status === 'processing') {
                    statuses[stage] = 'active';
                } else if (phase.status === 'assigned') {
                    statuses[stage] = 'not_started';
                } else if (phase.status === 'late') {
                    statuses[stage] = 'late';
                }
            });
        }
        setPhaseStatuses(statuses);
    };

    const handlePhaseSelection = (phase) => {
        const isSelected = selectedPhases.find(p => p.id === phase.id);
        if (isSelected) {
            setSelectedPhases(selectedPhases.filter(p => p.id !== phase.id));
        } else {
            // Check if any existing stage is at maximum limit
            const hasStageAtMaximum = selectedPhases.some((_, index) => {
                const stage = index + 1;
                const stageDuration = stageDurations[stage];
                if (stageDuration && selectedOrder?.deadline) {
                    const maxStartDate = dayjs(selectedOrder.deadline).subtract(2, 'day');
                    const maxEndDate = dayjs(selectedOrder.deadline).subtract(1, 'day');

                    return (stageDuration.startDate && dayjs(stageDuration.startDate).isSame(maxStartDate)) ||
                        (stageDuration.endDate && dayjs(stageDuration.endDate).isSame(maxEndDate));
                }
                return false;
            });

            if (hasStageAtMaximum) {
                enqueueSnackbar('Cannot add more phases. A stage has reached the maximum deadline limit.', {variant: 'warning'});
                return;
            }

            setSelectedPhases([...selectedPhases, {
                ...phase,
                stage: selectedPhases.length + 1,
                startDate: null,
                endDate: null
            }]);
        }
    };

    // Drag and drop functions
    const handleDragStart = (e, phase) => {
        setDraggedPhase(phase);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleAvailableDragOver = (e) => {
        e.preventDefault();
        setIsDragOverAvailable(true);
    };

    const handleAvailableDragLeave = (e) => {
        e.preventDefault();
        setIsDragOverAvailable(false);
    };

    const handleAvailableDrop = (e) => {
        e.preventDefault();
        setIsDragOverAvailable(false);

        if (draggedSelectedPhase) {
            // Remove the phase from selected phases
            setSelectedPhases(selectedPhases.filter((_, index) => index !== draggedSelectedPhase.index));
            setDraggedSelectedPhase(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (draggedPhase) {
            const isAlreadySelected = selectedPhases.find(p => p.id === draggedPhase.id);
            if (!isAlreadySelected) {
                // Check if any existing stage is at maximum limit
                const hasStageAtMaximum = selectedPhases.some((_, index) => {
                    const stage = index + 1;
                    const stageDuration = stageDurations[stage];
                    if (stageDuration && selectedOrder?.deadline) {
                        const maxStartDate = dayjs(selectedOrder.deadline).subtract(2, 'day');
                        const maxEndDate = dayjs(selectedOrder.deadline).subtract(1, 'day');

                        return (stageDuration.startDate && dayjs(stageDuration.startDate).isSame(maxStartDate)) ||
                            (stageDuration.endDate && dayjs(stageDuration.endDate).isSame(maxEndDate));
                    }
                    return false;
                });

                if (hasStageAtMaximum) {
                    enqueueSnackbar('Cannot add more phases. A stage has reached the maximum deadline limit.', {variant: 'warning'});
                    setDraggedPhase(null);
                    return;
                }

                const newPhase = {
                    ...draggedPhase,
                    stage: selectedPhases.length + 1,
                    startDate: null,
                    endDate: null
                };
                setSelectedPhases([...selectedPhases, newPhase]);
            }
        }
        setDraggedPhase(null);
    };

    // Drag and drop functions for reordering selected phases
    const handleSelectedPhaseDragStart = (e, phase, index) => {
        setDraggedSelectedPhase({phase, index});
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSelectedPhaseDragOver = (e, index) => {
        e.preventDefault();
        setDragOverSelectedIndex(index);
    };

    const handleSelectedPhaseDragLeave = (e) => {
        e.preventDefault();
        setDragOverSelectedIndex(null);
    };

    const handleSelectedPhaseDrop = (e, dropIndex) => {
        e.preventDefault();
        setDragOverSelectedIndex(null);

        if (draggedSelectedPhase && draggedSelectedPhase.index !== dropIndex) {
            const reorderedPhases = [...selectedPhases];
            const [movedPhase] = reorderedPhases.splice(draggedSelectedPhase.index, 1);
            reorderedPhases.splice(dropIndex, 0, movedPhase);

            // Update stage numbers and apply duration from stageDurations
            const updatedPhases = reorderedPhases.map((phase, index) => {
                const newStage = index + 1;
                const stageDuration = stageDurations[newStage];

                return {
                    ...phase,
                    stage: newStage,
                    startDate: stageDuration ? stageDuration.startDate : null,
                    endDate: stageDuration ? stageDuration.endDate : null
                };
            });

            setSelectedPhases(updatedPhases);
        }
        setDraggedSelectedPhase(null);
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

    const handleSetDuration = () => {
        setDurationDialogOpen(true);
    };

    const handleSaveDurations = () => {
        // Check if all stages have dates set
        const stagesWithoutDates = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            return !stageDuration || !stageDuration.startDate || !stageDuration.endDate;
        });

        if (stagesWithoutDates.length > 0) {
            enqueueSnackbar('Please set dates for all stages', {variant: 'warning'});
            return;
        }

        // Check if any start date exceeds order deadline - 2 days
        const stagesStartExceedingDeadline = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            if (stageDuration && stageDuration.startDate && selectedOrder?.deadline) {
                return dayjs(stageDuration.startDate).isAfter(dayjs(selectedOrder.deadline).subtract(2, 'day'));
            }
            return false;
        });

        if (stagesStartExceedingDeadline.length > 0) {
            enqueueSnackbar(`Start date must be at least 2 days before order deadline (${dayjs(selectedOrder.deadline).format('DD/MM/YYYY')})`, {variant: 'warning'});
            return;
        }

        // Check if any end date exceeds order deadline - 1 day
        const stagesEndExceedingDeadline = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            if (stageDuration && stageDuration.endDate && selectedOrder?.deadline) {
                return dayjs(stageDuration.endDate).isAfter(dayjs(selectedOrder.deadline).subtract(1, 'day'));
            }
            return false;
        });

        if (stagesEndExceedingDeadline.length > 0) {
            enqueueSnackbar(`End date must be at least 1 day before order deadline (${dayjs(selectedOrder.deadline).format('DD/MM/YYYY')})`, {variant: 'warning'});
            return;
        }

        // Apply stage durations to phases
        const updatedPhases = selectedPhases.map((phase, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];

            return {
                ...phase,
                startDate: stageDuration.startDate,
                endDate: stageDuration.endDate
            };
        });

        setSelectedPhases(updatedPhases);
        setDurationDialogOpen(false);
    };

    const handleAssignMilestone = async () => {
        if (selectedPhases.length === 0) {
            enqueueSnackbar('Please select at least one phase', {variant: 'warning'});
            return;
        }

        // Check if all phases have dates set
        const phasesWithoutDates = selectedPhases.filter(phase => !phase.startDate || !phase.endDate);
        if (phasesWithoutDates.length > 0) {
            enqueueSnackbar('Please set dates for all phases before assigning milestone', {variant: 'warning'});
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
                enqueueSnackbar('Milestone assigned successfully', {variant: 'success'});
                setAssignMilestoneDialogOpen(false);
                setSelectedOrder(null);
                setSelectedPhases([]);
                setShowDateSettings(false);
                // Refresh all orders to get updated milestone data
                fetchOrders();
            } else {
                enqueueSnackbar('Failed to assign milestone', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error assigning milestone:', error);
            enqueueSnackbar('Failed to assign milestone', {variant: 'error'});
        } finally {
            setAssigningMilestone(false);
        }
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
                <CircularProgress size={60}/>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{height: '100%', overflowY: 'auto'}}>
                {/* Header Section */}
                <Box
                    sx={{
                        mb: 4,
                        position: "relative",
                        p: 4,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)",
                        border: "1px solid rgba(63, 81, 181, 0.1)",
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
                        <TimelineIcon sx={{fontSize: 32, mr: 2, color: "#3f51b5"}}/>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                fontSize: {xs: "1.5rem", md: "2rem"}
                            }}
                        >
                            Milestone Management
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
                        Create production phases and assign milestones to processing orders with real-time tracking.
                    </Typography>
                </Box>

                {/* Tab Navigation */}
                <Box sx={{mb: 4}}>
                    <Paper elevation={0} sx={{
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{display: 'flex'}}>
                            <Button
                                onClick={() => setActiveTab('phases')}
                                sx={{
                                    flex: 1,
                                    py: 2.5,
                                    backgroundColor: activeTab === 'phases' ? '#3f51b5' : 'transparent',
                                    color: activeTab === 'phases' ? 'white' : '#64748b',
                                    borderRadius: 0,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        backgroundColor: activeTab === 'phases' ? '#303f9f' : '#f8fafc'
                                    }
                                }}
                                startIcon={<BuildIcon/>}
                            >
                                Production Phases
                            </Button>
                            <Button
                                onClick={() => setActiveTab('assignments')}
                                sx={{
                                    flex: 1,
                                    py: 2.5,
                                    backgroundColor: activeTab === 'assignments' ? '#3f51b5' : 'transparent',
                                    color: activeTab === 'assignments' ? 'white' : '#64748b',
                                    borderRadius: 0,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        backgroundColor: activeTab === 'assignments' ? '#303f9f' : '#f8fafc'
                                    }
                                }}
                                startIcon={<AssignmentIcon/>}
                            >
                                Assign Milestones
                            </Button>
                            <Button
                                onClick={() => setActiveTab('manage')}
                                sx={{
                                    flex: 1,
                                    py: 2.5,
                                    backgroundColor: activeTab === 'manage' ? '#3f51b5' : 'transparent',
                                    color: activeTab === 'manage' ? 'white' : '#64748b',
                                    borderRadius: 0,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        backgroundColor: activeTab === 'manage' ? '#303f9f' : '#f8fafc'
                                    }
                                }}
                                startIcon={<TimelineIcon/>}
                            >
                                Manage Milestones
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Content based on active tab */}
                {activeTab === 'phases' ? (
                    /* Phases Management */
                    <Box>
                        {/* Header with Create Button */}
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                            <Box>
                                <Typography variant="h5" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                    Production Phases
                                </Typography>
                                <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                    Manage your production workflow phases
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Typography variant="caption" sx={{color: '#64748b'}}>
                                        {phases.length}/10 phases created
                                    </Typography>
                                    {phases.length >= 10 && (
                                        <Typography variant="caption" sx={{color: '#d32f2f', fontWeight: 600}}>
                                            (Maximum reached)
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={() => setCreatePhaseDialogOpen(true)}
                                disabled={phases.length >= 10}
                                sx={{
                                    backgroundColor: phases.length >= 10 ? '#9ca3af' : '#3f51b5',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    '&:hover': {
                                        backgroundColor: phases.length >= 10 ? '#9ca3af' : '#303f9f'
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#9ca3af'
                                    }
                                }}
                            >
                                {phases.length >= 10 ? 'Max Phases Reached' : 'Create Phase'}
                            </Button>
                        </Box>

                        {/* Phases Grid */}
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3,
                            '& > *': {
                                flex: '1 1 calc(25% - 18px)',
                                minWidth: '280px',
                                maxWidth: 'calc(25% - 18px)'
                            }
                        }}>
                            {phases.map((phase) => (
                                <Card
                                    key={phase.id}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        height: 'fit-content',
                                        '&:hover': {
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Avatar sx={{
                                                bgcolor: '#3f51b5',
                                                width: 48,
                                                height: 48
                                            }}>
                                                <BuildIcon/>
                                            </Avatar>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                                                    {phase.name}
                                                </Typography>
                                                <Chip
                                                    label={phase.status}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: phase.status === 'active' ? '#e8f5e8' : '#ffebee',
                                                        color: phase.status === 'active' ? '#2e7d32' : '#d32f2f',
                                                        fontWeight: 600,
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

                                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                            <Button
                                                size="small"
                                                startIcon={<DeleteIcon/>}
                                                sx={{
                                                    color: '#d32f2f',
                                                    borderColor: '#d32f2f',
                                                    '&:hover': {
                                                        borderColor: '#c62828',
                                                        backgroundColor: '#ffebee'
                                                    }
                                                }}
                                                variant="outlined"
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {/* No Phases Message */}
                        {phases.length === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <BuildIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                                <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                    No Phases Created
                                </Typography>
                                <Typography variant="body2" sx={{color: '#94a3b8', mb: 3}}>
                                    Create your first production phase to get started
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    onClick={() => setCreatePhaseDialogOpen(true)}
                                    disabled={phases.length >= 10}
                                    sx={{
                                        backgroundColor: phases.length >= 10 ? '#9ca3af' : '#3f51b5',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.5,
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: phases.length >= 10 ? '#9ca3af' : '#303f9f'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#9ca3af'
                                        }
                                    }}
                                >
                                    {phases.length >= 10 ? 'Max Phases Reached' : 'Create First Phase'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : activeTab === 'assignments' ? (
                    /* Milestone Assignments */
                    <Box>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                Assign Milestones to Orders
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                Select phases and assign them to processing orders
                            </Typography>


                        </Box>

                        {/* Orders List */}
                        <Grid container spacing={3}>
                            {orders.filter(order => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                // Only show orders without milestones in Assign Milestones tab
                                return !hasMilestone;
                            }).map((order) => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                const isLoading = false; // No longer loading as data comes with orders

                                return (
                                    <Grid item xs={12} md={6} key={order.id}>
                                        <Card elevation={0} sx={{
                                            borderRadius: 2,
                                            border: hasMilestone ? '2px solid #3f51b5' : '1px solid #e2e8f0',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: hasMilestone ? '#f8fafc' : '#ffffff',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}>
                                            <CardContent sx={{p: 3}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <Avatar sx={{
                                                        bgcolor: hasMilestone ? '#3f51b5' : '#ff9800',
                                                        width: 48,
                                                        height: 48
                                                    }}>
                                                        {hasMilestone ? <CheckCircleIcon/> : <AssignmentIcon/>}
                                                    </Avatar>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            Order #{order.id}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            {order.school?.business || 'Unknown School'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        alignItems: 'flex-end'
                                                    }}>
                                                        <Chip
                                                            label="Processing"
                                                            sx={{
                                                                backgroundColor: '#fef3c7',
                                                                color: '#d97706',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                        {isLoading ? (
                                                            <CircularProgress size={16}/>
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

                                                <Box sx={{mb: 3}}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Deadline:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {formatDate(order.deadline)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Total Uniform:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {Math.floor((order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0) / 2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Order Date:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {formatDate(order.orderDate)}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={hasMilestone ? <TimelineIcon/> : <AssignmentIcon/>}
                                                        onClick={() => hasMilestone ? openViewMilestoneDialog(order) : openAssignMilestoneDialog(order)}
                                                        sx={{
                                                            flex: 1,
                                                            backgroundColor: hasMilestone ? '#4caf50' : '#3f51b5',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                backgroundColor: hasMilestone ? '#388e3c' : '#303f9f'
                                                            }
                                                        }}
                                                    >
                                                        {hasMilestone ? 'View Milestone' : 'Assign Milestone'}
                                                    </Button>

                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* No Orders Message */}
                        {orders.filter(order => {
                            const orderMilestone = order.milestone || [];
                            const hasMilestone = orderMilestone.length > 0;
                            return !hasMilestone;
                        }).length === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                backgroundColor: '#f8fafc',
                                borderRadius: 3,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <AssignmentIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                                <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                    No Orders Available for Assignment
                                </Typography>
                                <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                    All processing orders already have milestones assigned. Check the Manage Milestones
                                    tab to view existing assignments.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ) : (
                    /* Manage Milestones */
                    <Box>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                Manage Milestones
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                View and manage all milestone assignments across orders
                            </Typography>


                        </Box>

                        {/* Orders with Milestones List */}
                        <Grid container spacing={3}>
                            {orders.filter(order => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                // Only show orders with milestones in Manage Milestones tab
                                return hasMilestone;
                            }).map((order) => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;

                                return (
                                    <Grid item xs={12} md={6} key={order.id}>
                                        <Card elevation={0} sx={{
                                            borderRadius: 2,
                                            border: '2px solid #3f51b5',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: '#f8fafc',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}>
                                            <CardContent sx={{p: 3}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <Avatar sx={{
                                                        bgcolor: '#3f51b5',
                                                        width: 48,
                                                        height: 48
                                                    }}>
                                                        <TimelineIcon/>
                                                    </Avatar>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            Order #{order.id}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            {order.school?.business || 'Unknown School'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        alignItems: 'flex-end'
                                                    }}>
                                                        <Chip
                                                            label="Processing"
                                                            sx={{
                                                                backgroundColor: '#fef3c7',
                                                                color: '#d97706',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${orderMilestone.length} Phases`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#d1fae5',
                                                                color: '#059669',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                <Box sx={{mb: 3}}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Deadline:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {formatDate(order.deadline)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Total Uniform:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {Math.floor((order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0) / 2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            Order Date:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {formatDate(order.orderDate)}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<TimelineIcon/>}
                                                        onClick={() => openViewMilestoneDialog(order)}
                                                        sx={{
                                                            flex: 1,
                                                            backgroundColor: '#4caf50',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                backgroundColor: '#388e3c'
                                                            }
                                                        }}
                                                    >
                                                        View Milestone
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* No Orders with Milestones Message */}
                        {orders.filter(order => {
                            const orderMilestone = order.milestone || [];
                            const hasMilestone = orderMilestone.length > 0;
                            return hasMilestone;
                        }).length === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                backgroundColor: '#f8fafc',
                                borderRadius: 3,
                                border: '2px dashed #cbd5e1'
                            }}>
                                <TimelineIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                                <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                    No Milestones to Manage
                                </Typography>
                                <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                    No orders have milestones assigned yet. Go to the Assign Milestones tab to create
                                    milestone assignments.
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
                        backgroundColor: '#3f51b5',
                        '&:hover': {
                            backgroundColor: '#303f9f'
                        }
                    }}
                >
                    <RefreshIcon/>
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
                        backgroundColor: '#3f51b5',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <BuildIcon/>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
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
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{p: 4, pb: 2, pt: 8}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, mt: 2}}>
                            <TextField
                                label="Phase Name"
                                value={newPhase.name}
                                onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
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
                                onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
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

                    <DialogActions sx={{p: 3, pt: 0}}>
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
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#303f9f'
                                },
                                '&:disabled': {
                                    backgroundColor: '#9ca3af'
                                }
                            }}
                        >
                            {creatingPhase ? (
                                <>
                                    <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
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
                        backgroundColor: '#3f51b5',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <AssignmentIcon/>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                {(selectedOrder?.milestone || []).length > 0 ? 'Edit' : 'Assign'} Milestone to Order
                                #{selectedOrder?.id}
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
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{p: 4, pb: 2, pt: 6}}>
                        {selectedOrder && (
                            <Box sx={{display: 'flex', gap: 3}}>
                                {/* Available Phases */}
                                <Box sx={{flex: 1}}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                        Available Phases (Drag to add / Drop here to remove)
                                    </Typography>
                                    <Paper elevation={0} sx={{
                                        p: 2,
                                        border: isDragOverAvailable ? '2px dashed #3f51b5' : '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        maxHeight: 400,
                                        overflow: 'auto',
                                        backgroundColor: isDragOverAvailable ? '#f0f4ff' : '#ffffff',
                                        transition: 'all 0.2s ease'
                                    }}
                                           onDragOver={handleAvailableDragOver}
                                           onDragLeave={handleAvailableDragLeave}
                                           onDrop={handleAvailableDrop}
                                    >
                                        {phases.map((phase) => (
                                            <Card
                                                key={phase.id}
                                                elevation={0}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, phase)}
                                                onClick={() => handlePhaseSelection(phase)}
                                                sx={{
                                                    mb: 2,
                                                    cursor: 'grab',
                                                    border: selectedPhases.find(p => p.id === phase.id)
                                                        ? '2px solid #3f51b5'
                                                        : '1px solid #e2e8f0',
                                                    borderRadius: 2,
                                                    backgroundColor: selectedPhases.find(p => p.id === phase.id)
                                                        ? '#eff6ff'
                                                        : '#ffffff',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#3f51b5',
                                                        backgroundColor: '#f8fafc'
                                                    },
                                                    '&:active': {
                                                        cursor: 'grabbing'
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{p: 2}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <CheckCircleIcon
                                                            sx={{
                                                                color: selectedPhases.find(p => p.id === phase.id)
                                                                    ? '#3b82f6'
                                                                    : '#cbd5e1',
                                                                fontSize: 20
                                                            }}
                                                        />
                                                        <Box sx={{flex: 1}}>
                                                            <Typography variant="subtitle2"
                                                                        sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                                {phase.name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{color: '#64748b'}}>
                                                                {phase.description}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Paper>
                                </Box>

                                {/* Selected Phases */}
                                <Box sx={{flex: 1}}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            Selected Phases ({selectedPhases.length}) - Drag to reorder
                                        </Typography>
                                        {selectedPhases.length > 0 && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleSetDuration}
                                                sx={{
                                                    backgroundColor: '#3f51b5',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 1.5,
                                                    fontSize: '0.8rem',
                                                    '&:hover': {
                                                        backgroundColor: '#303f9f'
                                                    }
                                                }}
                                            >
                                                Set Duration
                                            </Button>
                                        )}
                                    </Box>

                                    {selectedPhases.length > 0 ? (
                                        <Paper
                                            elevation={0}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            sx={{
                                                p: 2,
                                                border: isDragOver ? '2px dashed #3f51b5' : '1px solid #e2e8f0',
                                                borderRadius: 2,
                                                maxHeight: 600,
                                                overflow: 'auto',
                                                backgroundColor: isDragOver ? '#f8fafc' : '#ffffff',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <List>
                                                {selectedPhases.map((phase, index) => (
                                                    <Box
                                                        key={phase.id}
                                                        draggable
                                                        onDragStart={(e) => handleSelectedPhaseDragStart(e, phase, index)}
                                                        onDragOver={(e) => handleSelectedPhaseDragOver(e, index)}
                                                        onDragLeave={handleSelectedPhaseDragLeave}
                                                        onDrop={(e) => handleSelectedPhaseDrop(e, index)}
                                                        sx={{
                                                            mb: 2,
                                                            border: dragOverSelectedIndex === index ? '2px dashed #3f51b5' : '1px solid #e2e8f0',
                                                            borderRadius: 2,
                                                            backgroundColor: dragOverSelectedIndex === index ? '#f0f4ff' : '#f8fafc',
                                                            position: 'relative',
                                                            p: 2,
                                                            cursor: 'grab',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                borderColor: '#3f51b5',
                                                                backgroundColor: '#f0f4ff'
                                                            },
                                                            '&:active': {
                                                                cursor: 'grabbing'
                                                            }
                                                        }}
                                                    >
                                                        {/* Delete Button - Top Right */}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedPhases(selectedPhases.filter(p => p.id !== phase.id));
                                                            }}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                color: '#d32f2f',
                                                                backgroundColor: '#ffebee',
                                                                width: 24,
                                                                height: 24,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                '&:hover': {
                                                                    backgroundColor: '#ffcdd2',
                                                                    color: '#c62828'
                                                                }
                                                            }}
                                                        >
                                                            X
                                                        </IconButton>

                                                        {/* Phase Content */}
                                                        <Box
                                                            sx={{display: 'flex', alignItems: 'center', gap: 3, pr: 4}}>
                                                            {/* Left Side - Phase Info */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                flex: 1
                                                            }}>
                                                                <Avatar sx={{
                                                                    bgcolor: '#3f51b5',
                                                                    width: 40,
                                                                    height: 40,
                                                                    fontSize: '1rem',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {phase.stage}
                                                                </Avatar>
                                                                <Box sx={{flex: 1}}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        mb: 0.5
                                                                    }}>
                                                                        <Typography variant="h6" sx={{
                                                                            fontWeight: 'bold',
                                                                            color: '#1e293b',
                                                                            fontSize: '1rem'
                                                                        }}>
                                                                            {phase.name}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={`Stage ${phase.stage}`}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: '#e8eaf6',
                                                                                color: '#3f51b5',
                                                                                fontWeight: 'bold',
                                                                                fontSize: '0.7rem'
                                                                            }}
                                                                        />
                                                                    </Box>

                                                                    <Typography variant="body2" sx={{
                                                                        color: '#64748b',
                                                                        fontSize: '0.875rem',
                                                                        lineHeight: 1.4
                                                                    }}>
                                                                        {phase.description}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            {/* Right Side - Status Only */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                minWidth: '200px',
                                                                justifyContent: 'center'
                                                            }}>
                                                                {phase.startDate && phase.endDate ? (
                                                                    <>
                                                                        <Typography variant="body2" sx={{
                                                                            color: '#64748b',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                            <span
                                                                                style={{fontWeight: 'bold'}}>Start:</span> {dayjs(phase.startDate).format('DD/MM/YYYY')}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            color: '#64748b',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                            <span
                                                                                style={{fontWeight: 'bold'}}>End:</span> {dayjs(phase.endDate).format('DD/MM/YYYY')}
                                                                        </Typography>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Typography variant="body2" sx={{
                                                                            color: '#64748b',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                            No dates set
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#94a3b8',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                            Click "Set Duration" to configure
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </List>


                                            {/* Drop Zone for Additional Phases */}
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    p: 3,
                                                    border: isDragOver ? '2px dashed #3f51b5' : '2px dashed #cbd5e1',
                                                    borderRadius: 2,
                                                    backgroundColor: isDragOver ? '#f8fafc' : '#f8fafc',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease',
                                                    minHeight: 80,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <AssignmentIcon sx={{fontSize: 24, color: '#94a3b8', mb: 1}}/>
                                                <Typography variant="caption" sx={{color: '#64748b'}}>
                                                    Drag more phases here to add
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ) : (
                                        <Paper
                                            elevation={0}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            sx={{
                                                p: 4,
                                                minHeight: 400,
                                                border: isDragOver ? '2px dashed #3f51b5' : '2px dashed #cbd5e1',
                                                borderRadius: 2,
                                                backgroundColor: isDragOver ? '#f8fafc' : '#f8fafc',
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <AssignmentIcon sx={{fontSize: 48, color: '#94a3b8', mb: 2}}/>
                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                Drag phases from the left or click to select them
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
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
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#303f9f'
                                },
                                '&:disabled': {
                                    backgroundColor: '#9ca3af'
                                }
                            }}
                        >
                            {assigningMilestone ? (
                                <>
                                    <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                    Assigning...
                                </>
                            ) : (
                                'Assign Milestone'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Duration Settings Dialog */}
                <Dialog
                    open={durationDialogOpen}
                    onClose={() => setDurationDialogOpen(false)}
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
                        backgroundColor: '#3f51b5',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <TimelineIcon/>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                Set Stage Durations
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setDurationDialogOpen(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'white'
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{p: 4, pb: 2, pt: 6}}>
                        <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                            Set start and end dates for each stage position. Any phase placed in a stage will inherit
                            its duration.
                        </Typography>
                        {selectedOrder?.deadline && (
                            <Box sx={{mb: 3}}>
                                <Typography variant="body2" sx={{color: '#d32f2f', fontWeight: 'bold', mb: 1}}>
                                    ⚠️ Deadline Constraints:
                                </Typography>
                                <Typography variant="body2" sx={{color: '#d32f2f', mb: 1}}>
                                    Order Deadline: {dayjs(selectedOrder.deadline).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="body2" sx={{color: '#d32f2f', mb: 0.5}}>
                                    • Start date
                                    maximum: {dayjs(selectedOrder.deadline).subtract(2, 'day').format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="body2" sx={{color: '#d32f2f'}}>
                                    • End date
                                    maximum: {dayjs(selectedOrder.deadline).subtract(1, 'day').format('DD/MM/YYYY')}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {selectedPhases.map((_, index) => {
                                const stage = index + 1;
                                const stageDuration = stageDurations[stage] || {};

                                return (
                                    <Card
                                        key={`stage-${stage}`}
                                        elevation={0}
                                        sx={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            p: 3
                                        }}
                                    >
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Avatar sx={{
                                                bgcolor: '#3f51b5',
                                                width: 40,
                                                height: 40,
                                                fontSize: '1rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {stage}
                                            </Avatar>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                    Stage {stage} Duration
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                                    Set duration for the phase that will be in position {stage}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={`Stage ${stage}`}
                                                sx={{
                                                    backgroundColor: '#e8eaf6',
                                                    color: '#3f51b5',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <DatePicker
                                                label="Start Date"
                                                value={stageDuration.startDate ? dayjs(stageDuration.startDate) : null}
                                                minDate={(() => {
                                                    if (stage === 1) {
                                                        return dayjs();
                                                    } else {
                                                        const previousStageDuration = stageDurations[stage - 1];
                                                        return previousStageDuration && previousStageDuration.endDate
                                                            ? dayjs(previousStageDuration.endDate).add(1, 'day')
                                                            : dayjs();
                                                    }
                                                })()}
                                                maxDate={selectedOrder?.deadline ? dayjs(selectedOrder.deadline).subtract(2, 'day') : null}
                                                onChange={(date) => {
                                                    const newStartDate = date.format('YYYY-MM-DD');
                                                    setStageDurations(prev => ({
                                                        ...prev,
                                                        [stage]: {
                                                            ...prev[stage],
                                                            startDate: newStartDate,
                                                            endDate: dayjs(newStartDate).add(1, 'day').format('YYYY-MM-DD')
                                                        }
                                                    }));
                                                }}
                                                format="DD/MM/YYYY"
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        sx: {flex: 1}
                                                    }
                                                }}
                                            />
                                            <DatePicker
                                                label="End Date"
                                                value={stageDuration.endDate ? dayjs(stageDuration.endDate) : null}
                                                minDate={stageDuration.startDate ? dayjs(stageDuration.startDate).add(1, 'day') : dayjs().add(1, 'day')}
                                                maxDate={selectedOrder?.deadline ? dayjs(selectedOrder.deadline).subtract(1, 'day') : null}
                                                onChange={(date) => {
                                                    const newEndDate = date.format('YYYY-MM-DD');
                                                    setStageDurations(prev => ({
                                                        ...prev,
                                                        [stage]: {
                                                            ...prev[stage],
                                                            endDate: newEndDate
                                                        }
                                                    }));
                                                }}
                                                format="DD/MM/YYYY"
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        sx: {flex: 1}
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Card>
                                );
                            })}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
                        <Button
                            onClick={() => setDurationDialogOpen(false)}
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
                            onClick={handleSaveDurations}
                            variant="contained"
                            sx={{
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#303f9f'
                                }
                            }}
                        >
                            Save Durations
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* View Milestone Dialog */}
                <Dialog
                    open={viewMilestoneDialogOpen}
                    onClose={() => setViewMilestoneDialogOpen(false)}
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
                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                        color: 'white',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(63, 81, 181, 0.3)'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <TimelineIcon sx={{fontSize: 28}}/>
                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                View Milestone - Order #{viewingOrder?.id}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setViewMilestoneDialogOpen(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{p: 4, pb: 2, pt: 6, position: 'relative'}}>
                        {viewingOrder && (
                            <Box>
                                

                                {/* Order Information */}
                                <Box sx={{
                                    mb: 4,
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                    borderRadius: 3,
                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'url("/unisew.jpg") center/cover',
                                        opacity: 0.05,
                                        borderRadius: 3,
                                        zIndex: -1
                                    }
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                                        <Avatar sx={{
                                            bgcolor: '#3f51b5',
                                            width: 48,
                                            height: 48
                                        }}>
                                            <AssignmentIcon/>
                                        </Avatar>
                                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                            Order Details
                                        </Typography>
                                    </Box>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(63, 81, 181, 0.1)'
                                        }}>
                                            <Typography variant="body2"
                                                        sx={{color: '#64748b', fontWeight: 600}}>School:</Typography>
                                            <Typography variant="body2" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                {viewingOrder.school?.business || 'Unknown School'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(63, 81, 181, 0.1)'
                                        }}>
                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 600}}>Order
                                                Date:</Typography>
                                            <Typography variant="body2" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                {formatDate(viewingOrder.orderDate)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(63, 81, 181, 0.1)'
                                        }}>
                                            <Typography variant="body2"
                                                        sx={{color: '#64748b', fontWeight: 600}}>Deadline:</Typography>
                                            <Typography variant="body2" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                {formatDate(viewingOrder.deadline)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(63, 81, 181, 0.1)'
                                        }}>
                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 600}}>Total
                                                Uniform:</Typography>
                                            <Typography variant="body2" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                {Math.floor((viewingOrder.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0) / 2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Milestone Phases Header */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 3
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <Avatar sx={{
                                            bgcolor: '#3f51b5',
                                            width: 48,
                                            height: 48
                                        }}>
                                            <TimelineIcon/>
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                Milestone Phases
                                            </Typography>
                                            <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                {viewingOrder.milestone?.length || 0} phases assigned to this order
                                            </Typography>

                                        </Box>
                                    </Box>

                                    {/* View Mode Toggle */}
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <Button
                                            variant={milestoneViewMode === 'stepper' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setMilestoneViewMode('stepper')}
                                            sx={{
                                                backgroundColor: milestoneViewMode === 'stepper' ? '#3f51b5' : 'transparent',
                                                color: milestoneViewMode === 'stepper' ? 'white' : '#3f51b5',
                                                borderColor: '#3f51b5',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                px: 2,
                                                py: 0.5,
                                                '&:hover': {
                                                    backgroundColor: milestoneViewMode === 'stepper' ? '#303f9f' : 'rgba(63, 81, 181, 0.1)'
                                                }
                                            }}
                                        >
                                            Stepper
                                        </Button>
                                        <Button
                                            variant={milestoneViewMode === 'box' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setMilestoneViewMode('box')}
                                            sx={{
                                                backgroundColor: milestoneViewMode === 'box' ? '#3f51b5' : 'transparent',
                                                color: milestoneViewMode === 'box' ? 'white' : '#3f51b5',
                                                borderColor: '#3f51b5',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                px: 2,
                                                py: 0.5,
                                                '&:hover': {
                                                    backgroundColor: milestoneViewMode === 'box' ? '#303f9f' : 'rgba(63, 81, 181, 0.1)'
                                                }
                                            }}
                                        >
                                            Box
                                        </Button>
                                    </Box>
                                </Box>

                                {milestoneViewMode === 'stepper' ? (
                                    /* Stepper View */
                                    <Box sx={{mt: 2}}>
                                        <Stepper orientation="vertical"
                                                 sx={{'& .MuiStepConnector-line': {minHeight: '40px'}}}>
                                            {viewingOrder.milestone?.sort((a, b) => a.stage - b.stage).map((phase, index) => (
                                                <Step key={phase.id} active={true} completed={false}>
                                                    <StepLabel
                                                        StepIconComponent={() => (
                                                            <Avatar sx={{
                                                                background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                                                width: 40,
                                                                height: 40,
                                                                fontSize: '1rem',
                                                                fontWeight: 'bold',
                                                                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
                                                            }}>
                                                                {phase.stage}
                                                            </Avatar>
                                                        )}
                                                        sx={{
                                                            '& .MuiStepLabel-label': {
                                                                color: '#1e293b',
                                                                fontWeight: 600,
                                                                fontSize: '1.1rem',
                                                                marginTop: '-20px' // Đẩy label xuống nhiều hơn để ngang với stage
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{mb: 1}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                mb: 2
                                                            }}>
                                                                <Typography variant="h6"
                                                                            sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                    {phase.name}
                                                                </Typography>
                                                                {updatingData ? (
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                                                                        border: '1px solid rgba(63, 81, 181, 0.2)'
                                                                    }}>
                                                                        <CircularProgress size={12} sx={{color: '#3f51b5'}}/>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#3f51b5',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}>
                                                                            Updating...
                                                                        </Typography>
                                                                    </Box>
                                                                ) : phaseStatuses[phase.stage] && (
                                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                        <Chip
                                                                            label={phaseStatuses[phase.stage] === 'done' ? 'Done' :
                                                                                phaseStatuses[phase.stage] === 'active' ? 'Active' :
                                                                                    phaseStatuses[phase.stage] === 'late' ? 'LATE' : 'Not Started'}
                                                                            size="small"
                                                                            sx={{
                                                                                background: phaseStatuses[phase.stage] === 'done'
                                                                                    ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                                                                                    : phaseStatuses[phase.stage] === 'active'
                                                                                        ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                                                                                        : phaseStatuses[phase.stage] === 'late'
                                                                                            ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                                                                                            : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                                                                color: 'white',
                                                                                fontWeight: 700,
                                                                                fontSize: '0.7rem',
                                                                                px: 1.5,
                                                                                py: 0.5
                                                                            }}
                                                                        />
                                                                        {phase.completedDate && phase.completedDate !== "" && (
                                                                            <Chip
                                                                                label={`Completed: ${formatDate(phase.completedDate)}`}
                                                                                size="small"
                                                                                sx={{
                                                                                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                                                                    color: 'white',
                                                                                    fontWeight: 600,
                                                                                    fontSize: '0.65rem',
                                                                                    px: 1,
                                                                                    py: 0.3,
                                                                                    border: '1px solid rgba(76, 175, 80, 0.3)'
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            <Box sx={{display: 'flex', gap: 2}}>
                                                                <Box sx={{
                                                                    flex: 1,
                                                                    p: 2,
                                                                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                                                    borderRadius: 2,
                                                                    border: '1px solid rgba(63, 81, 181, 0.1)'
                                                                }}>
                                                                    <Typography variant="body2" sx={{
                                                                        color: '#64748b',
                                                                        mb: 0.5,
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px'
                                                                    }}>
                                                                        Start Date
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{
                                                                        fontWeight: 700,
                                                                        color: '#1e293b',
                                                                        fontSize: '1rem'
                                                                    }}>
                                                                        {formatDate(phase.startDate)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{
                                                                    flex: 1,
                                                                    p: 2,
                                                                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                                                    borderRadius: 2,
                                                                    border: '1px solid rgba(63, 81, 181, 0.1)'
                                                                }}>
                                                                    <Typography variant="body2" sx={{
                                                                        color: '#64748b',
                                                                        mb: 0.5,
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px'
                                                                    }}>
                                                                        End Date
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{
                                                                        fontWeight: 700,
                                                                        color: '#1e293b',
                                                                        fontSize: '1rem'
                                                                    }}>
                                                                        {formatDate(phase.endDate)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>
                                ) : (
                                    /* Box View */
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                                        {viewingOrder.milestone?.sort((a, b) => a.stage - b.stage).map((phase, index) => (
                                            <Card
                                                key={phase.id}
                                                elevation={0}
                                                sx={{
                                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                                    borderRadius: 3,
                                                    p: 3,
                                                    flex: '1 1 calc(50% - 8px)',
                                                    minWidth: '300px',
                                                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.02) 0%, rgba(48, 63, 159, 0.05) 100%)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 32px rgba(63, 81, 181, 0.15)',
                                                        transform: 'translateY(-2px)',
                                                        borderColor: 'rgba(63, 81, 181, 0.2)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                                                    <Avatar sx={{
                                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                                        width: 48,
                                                        height: 48,
                                                        fontSize: '1.2rem',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
                                                    }}>
                                                        {phase.stage}
                                                    </Avatar>
                                                    <Box sx={{flex: 1, display: 'flex', alignItems: 'center'}}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Typography variant="h6"
                                                                        sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {phase.name}
                                                            </Typography>
                                                            {updatingData ? (
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                                                                    border: '1px solid rgba(63, 81, 181, 0.2)'
                                                                }}>
                                                                    <CircularProgress size={12} sx={{color: '#3f51b5'}}/>
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#3f51b5',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.7rem'
                                                                    }}>
                                                                        Updating...
                                                                    </Typography>
                                                                </Box>
                                                            ) : phaseStatuses[phase.stage] && (
                                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                                    <Chip
                                                                        label={phaseStatuses[phase.stage] === 'done' ? 'Done' :
                                                                            phaseStatuses[phase.stage] === 'active' ? 'Active' :
                                                                                phaseStatuses[phase.stage] === 'late' ? 'LATE' : 'Not Started'}
                                                                        size="small"
                                                                        sx={{
                                                                            background: phaseStatuses[phase.stage] === 'done'
                                                                                ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                                                                                : phaseStatuses[phase.stage] === 'active'
                                                                                    ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                                                                                    : phaseStatuses[phase.stage] === 'late'
                                                                                        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                                                                                        : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                                                            color: 'white',
                                                                            fontWeight: 700,
                                                                            fontSize: '0.7rem',
                                                                            px: 1.5,
                                                                            py: 0.5,
                                                                            alignSelf: 'flex-start'
                                                                        }}
                                                                    />
                                                                    {phase.completedDate && phase.completedDate !== "" && (
                                                                        <Chip
                                                                            label={`Completed: ${formatDate(phase.completedDate)}`}
                                                                            size="small"
                                                                            sx={{
                                                                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                                                                color: 'white',
                                                                                fontWeight: 600,
                                                                                fontSize: '0.65rem',
                                                                                px: 1,
                                                                                py: 0.3,
                                                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                                                                                alignSelf: 'flex-start'
                                                                            }}
                                                                                                                                                />
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    <Chip
                                                        label={`#${phase.stage}`}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                                                            color: '#3f51b5',
                                                            fontWeight: 700,
                                                            border: '1px solid rgba(63, 81, 181, 0.2)'
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Box sx={{
                                                        flex: 1,
                                                        p: 2.5,
                                                        background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(63, 81, 181, 0.1)',
                                                        position: 'relative'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#64748b',
                                                            mb: 0.5,
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Start Date
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {formatDate(phase.startDate)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        flex: 1,
                                                        p: 2.5,
                                                        background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(63, 81, 181, 0.1)',
                                                        position: 'relative'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#64748b',
                                                            mb: 0.5,
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            End Date
                                                        </Typography>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {formatDate(phase.endDate)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Box>

                                )}

                                {(!viewingOrder.milestone || viewingOrder.milestone.length === 0) && (
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: 6,
                                        background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.02) 0%, rgba(48, 63, 159, 0.05) 100%)',
                                        borderRadius: 3,
                                        border: '2px dashed rgba(63, 81, 181, 0.2)',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'url("/unisew.jpg") center/cover',
                                            opacity: 0.03,
                                            borderRadius: 3,
                                            zIndex: -1
                                        }
                                    }}>
                                        <Avatar sx={{
                                            width: 80,
                                            height: 80,
                                            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                                            border: '2px solid rgba(63, 81, 181, 0.2)',
                                            mb: 3
                                        }}>
                                            <TimelineIcon sx={{fontSize: 40, color: '#3f51b5'}}/>
                                        </Avatar>
                                        <Typography variant="h6" sx={{color: '#1e293b', mb: 1, fontWeight: 700}}>
                                            No Milestone Assigned
                                        </Typography>
                                        <Typography variant="body2"
                                                    sx={{color: '#64748b', maxWidth: '400px', mx: 'auto'}}>
                                            This order does not have any milestone phases assigned yet. Assign phases to
                                            track production progress.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
                        <Button
                            onClick={() => setViewMilestoneDialogOpen(false)}
                            sx={{
                                color: '#64748b',
                                borderColor: '#d1d5db',
                                '&:hover': {
                                    borderColor: '#9ca3af',
                                    backgroundColor: '#f9fafb'
                                }
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const isLastPhase = viewingOrder?.milestone && viewingOrder.milestone.length > 0 && 
                                                   viewingOrder.milestone.some(phase => phase.status === 'processing') &&
                                                   viewingOrder.milestone.find(phase => phase.status === 'processing')?.stage === viewingOrder.milestone.length;
                                
                                if (isLastPhase) {
                                    // Close dialog for "Confirm out of delivery"
                                    setViewMilestoneDialogOpen(false);
                                    enqueueSnackbar('Order confirmed for delivery!', {variant: 'success'});
                                } else {
                                    // Open upload dialog for "Process to Next Phase"
                                    setUploadImageDialogOpen(true);
                                }
                            }}
                            sx={{
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#303f9f'
                                }
                            }}
                        >
                            {viewingOrder?.milestone && viewingOrder.milestone.length > 0 && 
                             viewingOrder.milestone.some(phase => phase.status === 'processing') &&
                             viewingOrder.milestone.find(phase => phase.status === 'processing')?.stage === viewingOrder.milestone.length
                                ? 'Confirm out of delivery'
                                : 'Process to Next Phase'
                            }
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Upload Image Dialog */}
                <Dialog
                    open={uploadImageDialogOpen}
                    onClose={() => setUploadImageDialogOpen(false)}
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
                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                        color: 'white',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(63, 81, 181, 0.3)'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Avatar sx={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                width: 40,
                                height: 40
                            }}>
                                <AssignmentIcon/>
                            </Avatar>
                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                Complete Current Phase
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setUploadImageDialogOpen(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{p: 4, pb: 2, pt: 6}}>
                        <Box sx={{textAlign: 'center', mb: 3}}>
                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                Phase Completion Evidence
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                Please upload an image as proof of completion for the current phase
                            </Typography>
                        </Box>

                        {/* Current Phase Info */}
                        <Box sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                            borderRadius: 2,
                            border: '1px solid rgba(63, 81, 181, 0.1)',
                            mb: 3
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <Avatar sx={{
                                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                    width: 40,
                                    height: 40,
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}>
                                    {currentPhase}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                        {viewingOrder?.milestone?.find(p => p.stage === currentPhase)?.name || 'Current Phase'}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Stage {currentPhase} - Upload completion evidence
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Image Upload Area */}
                        <Box sx={{
                            border: '2px dashed rgba(63, 81, 181, 0.3)',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: 'rgba(63, 81, 181, 0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'rgba(63, 81, 181, 0.5)',
                                backgroundColor: 'rgba(63, 81, 181, 0.05)'
                            }
                        }}
                        onClick={() => document.getElementById('image-upload').click()}
                        >
                            {selectedImage ? (
                                <Box>
                                    <img 
                                        src={URL.createObjectURL(selectedImage)} 
                                        alt="Selected" 
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: '8px',
                                            marginBottom: '16px'
                                        }}
                                    />
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Click to change image
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <Avatar sx={{
                                        width: 80,
                                        height: 80,
                                        background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                                        border: '2px solid rgba(63, 81, 181, 0.2)',
                                        mb: 2
                                    }}>
                                        <AssignmentIcon sx={{fontSize: 40, color: '#3f51b5'}}/>
                                    </Avatar>
                                    <Typography variant="h6" sx={{color: '#1e293b', mb: 1, fontWeight: 600}}>
                                        Upload Image
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                        Click to select an image file
                                    </Typography>
                                    <Typography variant="caption" sx={{color: '#94a3b8'}}>
                                        Supported formats: JPG, PNG, GIF, Webp (Max 10MB)
                                    </Typography>
                                </Box>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                style={{display: 'none'}}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setSelectedImage(file);
                                    }
                                }}
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
                        <Button
                            onClick={() => {
                                setUploadImageDialogOpen(false);
                                setSelectedImage(null);
                            }}
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
                            variant="contained"
                            disabled={!selectedImage || uploadingImage}
                            onClick={async () => {
                                // Check file size before processing
                                if (selectedImage && selectedImage.size > 10 * 1024 * 1024) {
                                    enqueueSnackbar('Please select an image file under 10MB', {variant: 'warning'});
                                    return;
                                }
                                
                                try {
                                    setUploadingImage(true);
                                    
                                    // Upload image to Cloudinary first
                                    let imageUrl = '';
                                    if (selectedImage) {
                                        const uploadResponse = await uploadCloudinary(selectedImage);
                                        if (uploadResponse) {
                                            imageUrl = uploadResponse;
                                        }
                                    }
                                    
                                    // Call API to update milestone status
                                    const updateData = {
                                        orderId: viewingOrder.id,
                                        imageUrl: imageUrl
                                    };
                                    
                                    const response = await updateMilestoneStatus(updateData);
                                    
                                    if (response && response.status === 200) {
                                        enqueueSnackbar('Phase completed successfully!', {variant: 'success'});
                                        setUploadImageDialogOpen(false);
                                        setSelectedImage(null);
                                        
                                        // Show loading while updating data
                                        setUpdatingData(true);
                                        
                                        // Refresh orders and update viewingOrder with new data
                                        const updatedOrdersResponse = await getGarmentOrders();
                                        if (updatedOrdersResponse && updatedOrdersResponse.data) {
                                            const processingOrders = (updatedOrdersResponse.data.body || []).filter(order => order.status === 'processing');
                                            setOrders(processingOrders);
                                            
                                            // Update viewingOrder with fresh data
                                            const updatedOrder = processingOrders.find(order => order.id === viewingOrder.id);
                                            if (updatedOrder) {
                                                setViewingOrder(updatedOrder);
                                                
                                                // Update phase statuses for the updated order
                                                const statuses = {};
                                                if (updatedOrder.milestone && updatedOrder.milestone.length > 0) {
                                                    updatedOrder.milestone.forEach((phase) => {
                                                        const stage = phase.stage;
                                                        if (phase.status === 'completed') {
                                                            statuses[stage] = 'done';
                                                        } else if (phase.status === 'processing') {
                                                            statuses[stage] = 'active';
                                                        } else if (phase.status === 'assigned') {
                                                            statuses[stage] = 'not_started';
                                                        } else if (phase.status === 'late') {
                                                            statuses[stage] = 'late';
                                                        }
                                                    });
                                                }
                                                setPhaseStatuses(statuses);
                                            }
                                        }
                                    } else {
                                        enqueueSnackbar('Failed to complete phase', {variant: 'error'});
                                    }
                                } catch (error) {
                                    console.error('Error completing phase:', error);
                                    enqueueSnackbar('Failed to complete phase. Please try again.', {variant: 'error'});
                                } finally {
                                    setUploadingImage(false);
                                    setUpdatingData(false);
                                }
                            }}
                            sx={{
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#303f9f'
                                },
                                '&:disabled': {
                                    backgroundColor: '#9ca3af'
                                }
                            }}
                        >
                            {uploadingImage ? (
                                <>
                                    <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                    Processing...
                                </>
                            ) : (
                                'Complete Phase'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </LocalizationProvider>
    );
}