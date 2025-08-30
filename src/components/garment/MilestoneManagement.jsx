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
    IconButton,
    List,
    Paper,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Checkroom as CheckroomIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Info as InfoIcon,
    LocationOn as LocationOnIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {
    assignMilestone,
    createPhase,
    deletePhase,
    getGarmentOrders,
    updateMilestoneStatus,
    viewPhase
} from '../../services/OrderService';
import {uploadCloudinary} from '../../services/UploadImageService';
import {calculateShippingTime} from '../../services/ShippingService';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {getShippingDaysFromTimestamp} from "../../utils/TimestampUtil.jsx";

export default function MilestoneManagement() {
    const getOrderDisplayStatus = (order, orderMilestone) => {
        let displayStatus = order.status || 'Unknown';
        let backgroundColor = '#f3f4f6';
        let textColor = '#6b7280';

        if (order.status === 'processing' && orderMilestone.length > 0) {
            const allPhasesCompleted = orderMilestone.every(phase => phase.status === 'completed');
            if (allPhasesCompleted) {
                displayStatus = 'waiting for delivery';
                backgroundColor = '#fef3c7';
                textColor = '#d97706';
                return {displayStatus, backgroundColor, textColor};
            }
        }

        switch (order.status?.toLowerCase()) {
            case 'pending':
                backgroundColor = '#fef3c7';
                textColor = '#d97706';
                break;
            case 'processing':
                backgroundColor = '#dbeafe';
                textColor = '#1d4ed8';
                break;
            case 'completed':
                backgroundColor = '#d1fae5';
                textColor = '#059669';
                break;
            case 'cancelled':
            case 'canceled':
                backgroundColor = '#fee2e2';
                textColor = '#dc2626';
                break;
            default:
                backgroundColor = '#f3f4f6';
                textColor = '#6b7280';
        }

        return {displayStatus, backgroundColor, textColor};
    };

    // States for phases
    const [phases, setPhases] = useState([]);
    const [phasesLoading, setPhasesLoading] = useState(true);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [orderMilestones, setOrderMilestones] = useState({});
    const [milestonesLoading, setMilestonesLoading] = useState({});

    const [createPhaseDialogOpen, setCreatePhaseDialogOpen] = useState(false);
    const [newPhase, setNewPhase] = useState({name: '', description: ''});
    const [creatingPhase, setCreatingPhase] = useState(false);

    // States for phase deletion
    const [deletingPhase, setDeletingPhase] = useState(false);

    const [assignMilestoneDialogOpen, setAssignMilestoneDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPhases, setSelectedPhases] = useState([]);
    const [assigningMilestone, setAssigningMilestone] = useState(false);
    const [showDateSettings, setShowDateSettings] = useState(false);
    const [durationDialogOpen, setDurationDialogOpen] = useState(false);
    const [stageDurations, setStageDurations] = useState({});
    const [viewMilestoneDialogOpen, setViewMilestoneDialogOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [milestoneViewMode, setMilestoneViewMode] = useState('stepper');
    const [currentPhase, setCurrentPhase] = useState(1);
    const [phaseStatuses, setPhaseStatuses] = useState({});
    const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [updatingData, setUpdatingData] = useState(false);

    const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [showQuantityDetailsDialog, setShowQuantityDetailsDialog] = useState(false);
    const [selectedQuantityDetails, setSelectedQuantityDetails] = useState(null);

    const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
    const [selectedItemImages, setSelectedItemImages] = useState(null);

    const [draggedPhase, setDraggedPhase] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [draggedSelectedPhase, setDraggedSelectedPhase] = useState(null);
    const [dragOverSelectedIndex, setDragOverSelectedIndex] = useState(null);
    const [isDragOverAvailable, setIsDragOverAvailable] = useState(false);

    // Shipping calculation states
    const [shippingLeadTime, setShippingLeadTime] = useState(null);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingCalculationError, setShippingCalculationError] = useState(null);


    const [activeTab, setActiveTab] = useState('manage');

    useEffect(() => {
        fetchPhases();
        fetchOrders();
    }, []);


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
                const processingOrders = (response.data.body || []).filter(order => order.status === 'processing');
                setOrders(processingOrders);

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

        // Check for restricted phase names
        const restrictedKeywords = [
            'delivering', 'delivery', 'deliver', 'shipping', 'ship', 'transport', 'transportation',
            'completed', 'complete', 'finish', 'finished', 'done', 'final', 'finalize', 'finalized',
            'end', 'ending', 'conclude', 'concluded', 'accomplish', 'accomplished'
        ];

        const phaseNameLower = newPhase.name.toLowerCase();
        const hasRestrictedKeyword = restrictedKeywords.some(keyword =>
            phaseNameLower.includes(keyword)
        );

        if (hasRestrictedKeyword) {
            enqueueSnackbar(
                'Cannot create phase with "delivering" or "completed" related names. These phases are built-in and automatically managed by the system.',
                {variant: 'warning'}
            );
            return;
        }

        try {
            setCreatingPhase(true);
            const response = await createPhase(newPhase);
            if (response && response.status === 201) {
                enqueueSnackbar('Phase created successfully', {variant: 'success'});
                setCreatePhaseDialogOpen(false);
                setNewPhase({name: '', description: ''});
                fetchPhases();
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

    const handleDeletePhase = async (phaseId) => {
        if (!phaseId) {
            enqueueSnackbar('Invalid phase ID', {variant: 'error'});
            return;
        }

        try {
            setDeletingPhase(true);
            const response = await deletePhase(phaseId);
            if (response && response.status === 200) {
                enqueueSnackbar('Phase deleted successfully', {variant: 'success'});
                fetchPhases(); // Refresh phases list
            } else {
                enqueueSnackbar('Failed to delete phase', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error deleting phase:', error);
            enqueueSnackbar('Failed to delete phase', {variant: 'error'});
        } finally {
            setDeletingPhase(false);
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
        const statuses = {};
        let activePhase = 1;

        if (order.milestone && order.milestone.length > 0) {
            order.milestone.forEach((phase) => {
                const stage = phase.stage;
                if (phase.status === 'completed') {
                    statuses[stage] = 'done';
                } else if (phase.status === 'processing') {
                    statuses[stage] = 'active';
                    activePhase = stage;
                } else if (phase.status === 'assigned') {
                    statuses[stage] = 'not_started';
                } else if (phase.status === 'late') {
                    statuses[stage] = 'late';
                }
            });
        }

        setPhaseStatuses(statuses);
        setCurrentPhase(activePhase);
    };

    const handlePhaseSelection = (phase) => {
        const isSelected = selectedPhases.find(p => p.id === phase.id);
        if (isSelected) {
            setSelectedPhases(selectedPhases.filter(p => p.id !== phase.id));
        } else {
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

        const updatedPhases = reorderedPhases.map((phase, index) => ({
            ...phase,
            stage: index + 1
        }));

        setSelectedPhases(updatedPhases);
    };

    const handleSetDuration = () => {
        setDurationDialogOpen(true);
        // Calculate shipping time when opening duration dialog
        if (selectedOrder) {
            calculateShippingTimeForOrder();
        }

        // Auto-set start date for stage 1 to today
        const today = dayjs().format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

        setStageDurations(prev => ({
            ...prev,
            1: {
                ...prev[1],
                startDate: today,
                endDate: tomorrow
            }
        }));
    };

    const calculateShippingTimeForOrder = async () => {
        try {
            setIsCalculatingShipping(true);
            setShippingCalculationError(null);

            // Get user shipping UID from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const garmentShippingUID = user?.partner?.shippingUID;

            if (!garmentShippingUID) {
                setShippingCalculationError('Shipping UID not found. Please contact support.');
                return;
            }

            // Get school address from the order
            const schoolAddress = selectedOrder?.school?.address;
            if (!schoolAddress) {
                setShippingCalculationError('School address not found.');
                return;
            }

            const response = await calculateShippingTime(
                garmentShippingUID,
                schoolAddress
            );

            if (response && response.data.code === 200) {
                const leadtime = response.data.data.leadtime;
                setShippingLeadTime(leadtime);
                console.log('Shipping API response:', {
                    response: response.data,
                    leadtime: leadtime,
                    type: typeof leadtime
                });

                // Test the calculation immediately
                const testMaxDelivery = getMaxDeliveryTime();
                console.log('Test max delivery calculation:', {
                    leadtime,
                    deadline: selectedOrder?.deadline,
                    maxDelivery: testMaxDelivery
                });
            } else {
                setShippingCalculationError('Failed to calculate shipping time. Please try again.');
            }
        } catch (error) {
            console.error('Error calculating shipping time:', error);
            setShippingCalculationError('An error occurred while calculating shipping time.');
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const getCalculatedShippingDays = () => {
        if (!shippingLeadTime) return 0;

        // Use the new utility function from TimestampUtil
        return getShippingDaysFromTimestamp(shippingLeadTime);
    };

    const getMaxDeliveryTime = () => {
        if (!shippingLeadTime || !selectedOrder?.deadline) return null;

        try {
            const leadtimeDays = getCalculatedShippingDays();

            if (isNaN(leadtimeDays) || leadtimeDays <= 0) {
                console.warn('Invalid shipping lead time:', shippingLeadTime, 'calculated days:', leadtimeDays);
                return null;
            }

            // Calculate: deadline - shipping_time - 1 day (buffer)
            const deadlineDate = new Date(selectedOrder.deadline);
            const maxDeliveryDate = new Date(deadlineDate);

            // Subtract shipping time and buffer day
            maxDeliveryDate.setDate(maxDeliveryDate.getDate() - leadtimeDays - 1);

            console.log('Shipping calculation:', {
                originalLeadTime: shippingLeadTime,
                calculatedDays: leadtimeDays,
                deadline: selectedOrder.deadline,
                maxDeliveryDate: maxDeliveryDate.toISOString().split('T')[0]
            });

            return maxDeliveryDate;
        } catch (error) {
            console.error('Error calculating max delivery time:', error);
            return null;
        }
    };

    const getMaxStartDate = () => {
        const maxDeliveryTime = getMaxDeliveryTime();
        if (!maxDeliveryTime) return null;

        // Start date maximum = End date maximum - 1 day
        const maxStartDate = new Date(maxDeliveryTime);
        maxStartDate.setDate(maxStartDate.getDate() - 1);

        return maxStartDate;
    };

    const handleSaveDurations = () => {
        const stagesWithoutDates = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            return !stageDuration || !stageDuration.startDate || !stageDuration.endDate;
        });

        if (stagesWithoutDates.length > 0) {
            enqueueSnackbar('Please set dates for all stages', {variant: 'warning'});
            return;
        }

        // Get maximum delivery time based on shipping calculation
        const maxDeliveryTime = getMaxDeliveryTime();
        const maxStartTime = getMaxStartDate();
        const maxDeliveryDate = maxDeliveryTime ? dayjs(maxDeliveryTime) : dayjs(selectedOrder?.deadline).subtract(1, 'day');
        const maxStartDate = maxStartTime ? dayjs(maxStartTime) : dayjs(selectedOrder?.deadline).subtract(2, 'day');

        const stagesStartExceedingDeadline = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            if (stageDuration && stageDuration.startDate && selectedOrder?.deadline) {
                return dayjs(stageDuration.startDate).isAfter(maxStartDate);
            }
            return false;
        });

        if (stagesStartExceedingDeadline.length > 0) {
            const errorMessage = maxStartTime
                ? `Start date must be before maximum start date (${maxStartDate.format('DD/MM/YYYY')})`
                : `Start date must be at least 2 days before order deadline (${dayjs(selectedOrder.deadline).format('DD/MM/YYYY')})`;
            enqueueSnackbar(errorMessage, {variant: 'warning'});
            return;
        }

        const stagesEndExceedingDeadline = selectedPhases.filter((_, index) => {
            const stage = index + 1;
            const stageDuration = stageDurations[stage];
            if (stageDuration && stageDuration.endDate && selectedOrder?.deadline) {
                return dayjs(stageDuration.endDate).isAfter(maxDeliveryDate);
            }
            return false;
        });

        if (stagesEndExceedingDeadline.length > 0) {
            const errorMessage = maxDeliveryTime
                ? `End date must be before maximum delivery date (${maxDeliveryDate.format('DD/MM/YYYY')})`
                : `End date must be at least 1 day before order deadline (${dayjs(selectedOrder.deadline).format('DD/MM/YYYY')})`;
            enqueueSnackbar(errorMessage, {variant: 'warning'});
            return;
        }

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

    const getTotalItems = (orderDetails) => {
        if (!orderDetails) return 0;
        return orderDetails.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getDaysUntilDeadline = (deadline) => {
        const deadlineDate = dayjs(deadline);
        const today = dayjs();
        return deadlineDate.diff(today, 'day');
    };

    const openOrderDetailDialog = (order) => {
        setSelectedOrderDetail(order);
        setOrderDetailDialogOpen(true);
    };

    const closeOrderDetailDialog = () => {
        setOrderDetailDialogOpen(false);
        setSelectedOrderDetail(null);
    };

    const groupItemsByCategory = (orderDetails) => {
        if (!orderDetails || orderDetails.length === 0) return [];

        const categoryGroups = {};

        orderDetails.forEach((item) => {
            const category = item.deliveryItem?.designItem?.category || 'regular';
            const gender = item.deliveryItem?.designItem?.gender || 'unknown';
            const type = item.deliveryItem?.designItem?.type || 'item';

            if (!categoryGroups[category]) {
                categoryGroups[category] = {};
            }

            if (!categoryGroups[category][gender]) {
                categoryGroups[category][gender] = [];
            }

            let existingGroup = categoryGroups[category][gender].find(group =>
                group.type === type
            );

            if (!existingGroup) {
                existingGroup = {
                    category,
                    gender,
                    type,
                    sizes: [],
                    quantities: {},
                    items: [],
                    totalQuantity: 0,
                    color: item.deliveryItem?.designItem?.color,
                    logoPosition: item.deliveryItem?.designItem?.logoPosition,
                    baseLogoHeight: item.deliveryItem?.baseLogoHeight,
                    baseLogoWidth: item.deliveryItem?.baseLogoWidth,
                    frontImageUrl: item.deliveryItem?.frontImageUrl,
                    backImageUrl: item.deliveryItem?.backImageUrl,
                    logoImageUrl: item.deliveryItem?.designItem?.logoImageUrl
                };
                categoryGroups[category][gender].push(existingGroup);
            }

            const size = item.size || 'M';
            const quantity = item.quantity || 0;

            if (!existingGroup.sizes.includes(size)) {
                existingGroup.sizes.push(size);
            }

            existingGroup.quantities[size] = quantity;
            existingGroup.items.push(item);
            existingGroup.totalQuantity += quantity;
        });

        const result = [];
        Object.entries(categoryGroups).forEach(([category, genderGroups]) => {
            const totalCategoryRows = Object.values(genderGroups).reduce((sum, groups) =>
                sum + groups.length, 0
            );

            Object.entries(genderGroups).forEach(([gender, groups]) => {
                groups.forEach((group, index) => {
                    const isFirstInCategory = Object.keys(genderGroups).indexOf(gender) === 0 && index === 0;
                    const isFirstInGender = index === 0;

                    result.push({
                        ...group,
                        isFirstInCategory,
                        categoryRowSpan: totalCategoryRows,
                        isFirstInGender,
                        genderRowSpan: groups.length
                    });
                });
            });
        });

        return result;
    };

    const handleOpenQuantityDetails = (groupedItem) => {
        setSelectedQuantityDetails(groupedItem);
        setShowQuantityDetailsDialog(true);
    };

    const handleCloseQuantityDetails = () => {
        setShowQuantityDetailsDialog(false);
        setSelectedQuantityDetails(null);
    };

    const handleOpenImagesDialog = (groupedItem) => {
        setSelectedItemImages(groupedItem);
        setImagesDialogOpen(true);
    };

    const handleCloseImagesDialog = () => {
        setImagesDialogOpen(false);
        setSelectedItemImages(null);
    };

    const sortSizes = (sizes) => {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        return sizes.sort((a, b) => {
            const indexA = sizeOrder.indexOf(a);
            const indexB = sizeOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return a.localeCompare(b);
        });
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

                <Box sx={{mb: 4}}>
                    <Paper elevation={0} sx={{
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{display: 'flex'}}>
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
                        </Box>
                    </Paper>
                </Box>

                {activeTab === 'manage' ? (
                    <Box>
                        <Box sx={{mb: 3}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                Manage Milestones
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                View and manage all milestone assignments across orders
                            </Typography>

                        </Box>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                            gap: 3
                        }}>
                            {orders.filter(order => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                return hasMilestone;
                            }).map((order) => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;

                                return (
                                    <Box key={order.id}>
                                        <Card elevation={0} sx={{
                                            borderRadius: 2,
                                            border: '2px solid #3f51b5',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: '#f8fafc',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}>
                                            <CardContent sx={{p: 3, flex: 1, display: 'flex', flexDirection: 'column'}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <Avatar sx={{
                                                        bgcolor: '#3f51b5',
                                                        width: 48,
                                                        height: 48
                                                    }}>
                                                        <TimelineIcon/>
                                                    </Avatar>
                                                    <Box sx={{flex: 1, minWidth: 0}}>
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            Order {parseID(order.id, 'ord')}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#64748b',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={order.school?.business || 'Unknown School'}
                                                        >
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
                                                            label={(() => {
                                                                const {displayStatus} = getOrderDisplayStatus(order, orderMilestone);
                                                                return displayStatus;
                                                            })()}
                                                            sx={{
                                                                backgroundColor: (() => {
                                                                    const {backgroundColor} = getOrderDisplayStatus(order, orderMilestone);
                                                                    return backgroundColor;
                                                                })(),
                                                                color: (() => {
                                                                    const {textColor} = getOrderDisplayStatus(order, orderMilestone);
                                                                    return textColor;
                                                                })(),
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize'
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

                                                <Box sx={{flex: 1, mb: 3}}>
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

                                                <Box sx={{display: 'flex', gap: 2, mt: 'auto'}}>
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
                                    </Box>
                                );
                            })}
                        </Box>

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
                ) : activeTab === 'assignments' ? (
                    <Box>
                        <Box sx={{mb: 3}}>
                            <Typography variant="h5" sx={{fontWeight: 700, color: '#1e293b', mb: 1}}>
                                Assign Milestones to Orders
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                Select phases and assign them to processing orders
                            </Typography>


                        </Box>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                            gap: 3
                        }}>
                            {orders.filter(order => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                return !hasMilestone;
                            }).map((order) => {
                                const orderMilestone = order.milestone || [];
                                const hasMilestone = orderMilestone.length > 0;
                                const isLoading = false;

                                return (
                                    <Box key={order.id}>
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
                                                            Order {parseID(order.id, 'ord')}
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
                                                            label={(() => {
                                                                const {displayStatus} = getOrderDisplayStatus(order, orderMilestone);
                                                                return displayStatus;
                                                            })()}
                                                            sx={{
                                                                backgroundColor: (() => {
                                                                    const {backgroundColor} = getOrderDisplayStatus(order, orderMilestone);
                                                                    return backgroundColor;
                                                                })(),
                                                                color: (() => {
                                                                    const {textColor} = getOrderDisplayStatus(order, orderMilestone);
                                                                    return textColor;
                                                                })(),
                                                                fontWeight: 'bold',
                                                                textTransform: 'capitalize'
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

                                                <Box sx={{display: 'flex', gap: 2, flexDirection: 'column'}}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={hasMilestone ? <TimelineIcon/> : <AssignmentIcon/>}
                                                        onClick={() => hasMilestone ? openViewMilestoneDialog(order) : openAssignMilestoneDialog(order)}
                                                        sx={{
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

                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<AssignmentIcon/>}
                                                        onClick={() => openOrderDetailDialog(order)}
                                                        sx={{
                                                            borderColor: '#3f51b5',
                                                            color: '#3f51b5',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                borderColor: '#303f9f',
                                                                backgroundColor: 'rgba(63, 81, 181, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        View Detail
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                );
                            })}
                        </Box>

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
                    <Box>
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
                                                onClick={() => handleDeletePhase(phase.id)}
                                                disabled={deletingPhase}
                                                sx={{
                                                    color: '#d32f2f',
                                                    borderColor: '#d32f2f',
                                                    '&:hover': {
                                                        borderColor: '#c62828',
                                                        backgroundColor: '#ffebee'
                                                    },
                                                    '&:disabled': {
                                                        color: '#9ca3af',
                                                        borderColor: '#9ca3af',
                                                        backgroundColor: '#f3f4f6'
                                                    }
                                                }}
                                                variant="outlined"
                                            >
                                                {deletingPhase ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

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
                )}

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
                        <Box sx={{
                            p: 3,
                            mb: 2,
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            borderRadius: 2,
                            borderLeft: '4px solid #f59e0b'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    mt: 0.5
                                }}>
                                    <InfoIcon sx={{color: '#d97706', fontSize: 18}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#92400e',
                                        fontSize: '0.9rem',
                                        mb: 1
                                    }}>
                                        Built-in Phases
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#451a03',
                                        lineHeight: 1.5,
                                        fontSize: '0.85rem'
                                    }}>
                                        <strong>"Delivering"</strong> and <strong>"Completed"</strong> phases are
                                        automatically managed by the system and cannot be created manually.
                                        Focus on creating production-specific phases like Cutting, Sewing, Quality
                                        Check, etc.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

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
                                {(selectedOrder?.milestone || []).length > 0 ? 'Edit' : 'Assign'} Milestone to
                                Order {parseID(selectedOrder?.id, 'ord')}
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

                                                        <Box
                                                            sx={{display: 'flex', alignItems: 'center', gap: 3, pr: 4}}>
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
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Typography variant="body2" sx={{color: '#64748b', flex: 3}}>
                                Set start and end dates for each stage position. Any phase placed in a stage will
                                inherit
                                its duration.
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={calculateShippingTimeForOrder}
                                disabled={isCalculatingShipping}
                                startIcon={isCalculatingShipping ? <CircularProgress size={16}/> : <RefreshIcon/>}
                                sx={{
                                    flex: 1,
                                    height: '40px',
                                    borderColor: '#3b82f6',
                                    color: '#3b82f6',
                                    fontSize: '0.8rem',
                                    '&:hover': {
                                        borderColor: '#2563eb',
                                        backgroundColor: 'rgba(59, 130, 246, 0.04)'
                                    }
                                }}
                            >
                                {isCalculatingShipping ? 'Calculating...' : 'Refresh Shipping Time'}
                            </Button>
                        </Box>
                        {selectedOrder?.deadline && (
                            <Box sx={{mb: 3}}>
                                <Typography variant="body2" sx={{color: '#d32f2f', fontWeight: 'bold', mb: 1}}>
                                    ⚠️ Deadline Constraints:
                                </Typography>
                                <Typography variant="body2" sx={{color: '#d32f2f', mb: 1}}>
                                    Order Deadline: {dayjs(selectedOrder.deadline).format('DD/MM/YYYY')}
                                </Typography>

                                {/* Shipping calculation status */}
                                {isCalculatingShipping && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 2,
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        mb: 2
                                    }}>
                                        <CircularProgress size={16} sx={{color: '#3b82f6'}}/>
                                        <Typography variant="body2" sx={{color: '#1e40af', fontWeight: 600}}>
                                            Calculating shipping time...
                                        </Typography>
                                    </Box>
                                )}

                                {shippingCalculationError && (
                                    <Box sx={{
                                        p: 2,
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        mb: 2
                                    }}>
                                        <Typography variant="body2" sx={{color: '#dc2626', fontWeight: 600, mb: 1}}>
                                            ⚠️ Shipping Calculation Error:
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#991b1b', fontSize: '0.9rem'}}>
                                            {shippingCalculationError}
                                        </Typography>
                                    </Box>
                                )}

                                {shippingLeadTime && !isCalculatingShipping && !shippingCalculationError && (
                                    <Box sx={{
                                        p: 2,
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        mb: 2
                                    }}>
                                        <Typography variant="body2" sx={{color: '#065f46', fontSize: '0.9rem'}}>
                                            ✅ Estimated shipping
                                            time: <strong>{getCalculatedShippingDays()} days</strong>
                                        </Typography>
                                    </Box>
                                )}

                                {/* Dynamic constraints based on shipping calculation */}
                                {(() => {
                                    const maxDeliveryTime = getMaxDeliveryTime();
                                    const maxStartTime = getMaxStartDate();
                                    const maxDeliveryDate = maxDeliveryTime ? dayjs(maxDeliveryTime) : dayjs(selectedOrder.deadline).subtract(1, 'day');
                                    const maxStartDate = maxStartTime ? dayjs(maxStartTime) : dayjs(selectedOrder.deadline).subtract(8, 'day');

                                    return (
                                        <>
                                            <Typography variant="body2" sx={{color: '#d32f2f'}}>
                                                • End date maximum: {maxDeliveryDate.format('DD/MM/YYYY')}
                                            </Typography>
                                        </>
                                    );
                                })()}
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
                                            {stage === 1 ? (
                                                <TextField
                                                    label="Start Date"
                                                    value={dayjs().format('DD/MM/YYYY')}
                                                    disabled
                                                    size="small"
                                                    sx={{flex: 1}}
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: {
                                                            backgroundColor: '#f5f5f5',
                                                            '& .MuiInputBase-input.Mui-disabled': {
                                                                WebkitTextFillColor: '#666',
                                                                color: '#666'
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <DatePicker
                                                    label="Start Date"
                                                    value={stageDuration.startDate ? dayjs(stageDuration.startDate) : null}
                                                    minDate={(() => {
                                                        const previousStageDuration = stageDurations[stage - 1];
                                                        return previousStageDuration && previousStageDuration.endDate
                                                            ? dayjs(previousStageDuration.endDate).add(1, 'day')
                                                            : dayjs();
                                                    })()}
                                                    maxDate={(() => {
                                                        const maxStartTime = getMaxStartDate();
                                                        return maxStartTime ? dayjs(maxStartTime) : (selectedOrder?.deadline ? dayjs(selectedOrder.deadline).subtract(2, 'day') : null);
                                                    })()}
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

                                                        // Auto-set start date for next stage (if exists)
                                                        const nextStage = stage + 1;
                                                        if (nextStage <= selectedPhases.length) {
                                                            const nextStageDuration = prev[nextStage];
                                                            if (nextStageDuration) {
                                                                const nextStartDate = dayjs(newStartDate).add(2, 'day').format('YYYY-MM-DD');
                                                                setStageDurations(prev => ({
                                                                    ...prev,
                                                                    [nextStage]: {
                                                                        ...prev[nextStage],
                                                                        startDate: nextStartDate,
                                                                        endDate: dayjs(nextStartDate).add(1, 'day').format('YYYY-MM-DD')
                                                                    }
                                                                }));
                                                            }
                                                        }
                                                    }}
                                                    format="DD/MM/YYYY"
                                                    slotProps={{
                                                        textField: {
                                                            size: 'small',
                                                            sx: {flex: 1}
                                                        }
                                                    }}
                                                />
                                            )}
                                            <DatePicker
                                                label="End Date"
                                                value={stageDuration.endDate ? dayjs(stageDuration.endDate) : null}
                                                minDate={stageDuration.startDate ? dayjs(stageDuration.startDate).add(1, 'day') : dayjs().add(1, 'day')}
                                                maxDate={(() => {
                                                    const maxDeliveryTime = getMaxDeliveryTime();
                                                    return maxDeliveryTime ? dayjs(maxDeliveryTime) : (selectedOrder?.deadline ? dayjs(selectedOrder.deadline).subtract(1, 'day') : null);
                                                })()}
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
                                View Milestone - Order {parseID(viewingOrder?.id, 'ord')}
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

                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<InfoIcon/>}
                                            onClick={() => {
                                                setSelectedOrderDetail(viewingOrder);
                                                setOrderDetailDialogOpen(true);
                                            }}
                                            sx={{
                                                borderColor: '#3f51b5',
                                                color: '#3f51b5',
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1,
                                                borderRadius: 2,
                                                '&:hover': {
                                                    borderColor: '#303f9f',
                                                    backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            View More Details
                                        </Button>
                                    </Box>
                                </Box>

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
                                                                marginTop: '-20px'
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
                                                                        <CircularProgress size={12}
                                                                                          sx={{color: '#3f51b5'}}/>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#3f51b5',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}>
                                                                            Updating...
                                                                        </Typography>
                                                                    </Box>
                                                                ) : phaseStatuses[phase.stage] && (
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}>
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
                                                                    <CircularProgress size={12}
                                                                                      sx={{color: '#3f51b5'}}/>
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#3f51b5',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.7rem'
                                                                    }}>
                                                                        Updating...
                                                                    </Typography>
                                                                </Box>
                                                            ) : phaseStatuses[phase.stage] && (
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 1
                                                                }}>
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
                        {(() => {
                            // Check if all phases are completed using phaseStatuses
                            const allPhasesCompleted = viewingOrder?.milestone &&
                                viewingOrder.milestone.length > 0 &&
                                viewingOrder.milestone.every(phase => phaseStatuses[phase.stage] === 'done');

                            // Only show "Process to Next Phase" button if not all phases are completed
                            if (!allPhasesCompleted) {
                                return (
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setUploadImageDialogOpen(true);
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
                                        Process to Next Phase
                                    </Button>
                                );
                            }
                        })()}
                    </DialogActions>
                </Dialog>

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
                                if (selectedImage && selectedImage.size > 10 * 1024 * 1024) {
                                    enqueueSnackbar('Please select an image file under 10MB', {variant: 'warning'});
                                    return;
                                }

                                try {
                                    setUploadingImage(true);

                                    let imageUrl = '';
                                    if (selectedImage) {
                                        const uploadResponse = await uploadCloudinary(selectedImage);
                                        if (uploadResponse) {
                                            imageUrl = uploadResponse;
                                        }
                                    }

                                    const updateData = {
                                        orderId: viewingOrder.id,
                                        imageUrl: imageUrl
                                    };

                                    const response = await updateMilestoneStatus(updateData);

                                    if (response && response.status === 200) {
                                        enqueueSnackbar('Phase completed successfully!', {variant: 'success'});
                                        setUploadImageDialogOpen(false);
                                        setSelectedImage(null);

                                        setUpdatingData(true);

                                        const updatedOrdersResponse = await getGarmentOrders();
                                        if (updatedOrdersResponse && updatedOrdersResponse.data) {
                                            const processingOrders = (updatedOrdersResponse.data.body || []).filter(order => order.status === 'processing');
                                            setOrders(processingOrders);

                                            const updatedOrder = processingOrders.find(order => order.id === viewingOrder.id);
                                            if (updatedOrder) {
                                                setViewingOrder(updatedOrder);

                                                const statuses = {};
                                                let activePhase = 1;

                                                if (updatedOrder.milestone && updatedOrder.milestone.length > 0) {
                                                    updatedOrder.milestone.forEach((phase) => {
                                                        const stage = phase.stage;
                                                        if (phase.status === 'completed') {
                                                            statuses[stage] = 'done';
                                                        } else if (phase.status === 'processing') {
                                                            statuses[stage] = 'active';
                                                            activePhase = stage;
                                                        } else if (phase.status === 'assigned') {
                                                            statuses[stage] = 'not_started';
                                                        } else if (phase.status === 'late') {
                                                            statuses[stage] = 'late';
                                                        }
                                                    });
                                                }

                                                setPhaseStatuses(statuses);
                                                setCurrentPhase(activePhase);
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

                <Dialog
                    open={orderDetailDialogOpen}
                    onClose={closeOrderDetailDialog}
                    maxWidth="xl"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            minHeight: '80vh',
                            maxHeight: '90vh',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <Box sx={{
                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Avatar sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                width: 48,
                                height: 48
                            }}>
                                <AssignmentIcon sx={{fontSize: 24}}/>
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>
                                    Order Details
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 500}}>
                                    Order #{selectedOrderDetail?.id}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={closeOrderDetailDialog} sx={{color: 'white'}}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>

                    <DialogContent sx={{p: 0, overflow: 'auto'}}>
                        {selectedOrderDetail && (
                            <Box sx={{p: 4, display: 'flex', flexDirection: 'column', gap: 4}}>
                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                    borderRadius: 3,
                                    boxShadow: '0 8px 32px rgba(63, 81, 181, 0.08)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(63, 81, 181, 0.12)',
                                        border: '1px solid rgba(63, 81, 181, 0.2)'
                                    }
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                        p: 3,
                                        borderRadius: '12px 12px 0 0',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}>
                                            <AssignmentIcon sx={{fontSize: 20}}/>
                                            Order Information
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 2,
                                            mb: 3
                                        }}>
                                            <Box sx={{
                                                flex: 1,
                                                minWidth: {xs: '100%', sm: 'auto'}
                                            }}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(63, 81, 181, 0.05)',
                                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(63, 81, 181, 0.08)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2
                                                    }}>
                                                        <TimelineIcon sx={{color: '#3f51b5', fontSize: 24}}/>
                                                    </Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Order Date
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem',
                                                        mb: 0.5
                                                    }}>
                                                        {formatDate(selectedOrderDetail.orderDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                flex: 1,
                                                minWidth: {xs: '100%', sm: 'auto'}
                                            }}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                    border: '1px solid rgba(245, 158, 11, 0.1)',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2
                                                    }}>
                                                        <TimelineIcon sx={{color: '#f59e0b', fontSize: 24}}/>
                                                    </Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Deadline
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem',
                                                        mb: 0.5
                                                    }}>
                                                        {formatDate(selectedOrderDetail.deadline)}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: (() => {
                                                            const daysLeft = getDaysUntilDeadline(selectedOrderDetail.deadline);
                                                            if (daysLeft > 30) return '#2e7d32';
                                                            if (daysLeft > 14) return '#ff9800';
                                                            return '#d32f2f';
                                                        })(),
                                                        fontSize: '0.8rem',
                                                        lineHeight: 1.2
                                                    }}>
                                                        {getDaysUntilDeadline(selectedOrderDetail.deadline) > 0
                                                            ? `${getDaysUntilDeadline(selectedOrderDetail.deadline)} days left`
                                                            : 'overdue'
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                flex: 1,
                                                minWidth: {xs: '100%', sm: 'auto'}
                                            }}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                                    border: '1px solid rgba(139, 92, 246, 0.1)',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 2
                                                    }}>
                                                        <CheckroomIcon sx={{color: '#8b5cf6', fontSize: 24}}/>
                                                    </Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        Total Uniforms
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem',
                                                        mb: 0.5
                                                    }}>
                                                        {Math.ceil(getTotalItems(selectedOrderDetail.orderDetails) / 2)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Status */}
                                            {(() => {
                                                const {
                                                    displayStatus,
                                                    backgroundColor,
                                                    textColor
                                                } = getOrderDisplayStatus(selectedOrderDetail, selectedOrderDetail.milestone || []);

                                                // Helper function to convert hex to rgba
                                                const hexToRgba = (hex, alpha) => {
                                                    const r = parseInt(hex.slice(1, 3), 16);
                                                    const g = parseInt(hex.slice(3, 5), 16);
                                                    const b = parseInt(hex.slice(5, 7), 16);
                                                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                                                };

                                                // Helper function to get icon based on status
                                                const getStatusIcon = () => {
                                                    if (displayStatus === 'waiting for delivery') {
                                                        return <TimelineIcon sx={{color: '#d97706', fontSize: 24}}/>;
                                                    } else if (displayStatus === 'completed') {
                                                        return <CheckCircleIcon sx={{color: '#10b981', fontSize: 24}}/>;
                                                    } else if (displayStatus === 'processing') {
                                                        return <TimelineIcon sx={{color: '#1d4ed8', fontSize: 24}}/>;
                                                    } else if (displayStatus === 'pending') {
                                                        return <TimelineIcon sx={{color: '#d97706', fontSize: 24}}/>;
                                                    } else {
                                                        return <CheckCircleIcon sx={{color: '#6b7280', fontSize: 24}}/>;
                                                    }
                                                };

                                                return (
                                                    <Box sx={{
                                                        flex: 1,
                                                        minWidth: {xs: '100%', sm: 'auto'}
                                                    }}>
                                                        <Box sx={{
                                                            p: 3,
                                                            borderRadius: 2,
                                                            backgroundColor: hexToRgba(backgroundColor, 0.15),
                                                            border: `1px solid ${hexToRgba(backgroundColor, 0.2)}`,
                                                            textAlign: 'center',
                                                            transition: 'all 0.3s ease',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            '&:hover': {
                                                                backgroundColor: hexToRgba(backgroundColor, 0.25),
                                                                transform: 'translateY(-2px)'
                                                            }
                                                        }}>
                                                            <Box sx={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: '50%',
                                                                backgroundColor: hexToRgba(backgroundColor, 0.2),
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                mx: 'auto',
                                                                mb: 2
                                                            }}>
                                                                {getStatusIcon()}
                                                            </Box>
                                                            <Typography variant="body2" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 500,
                                                                mb: 1,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                Status
                                                            </Typography>
                                                            <Typography variant="h6" sx={{
                                                                fontWeight: 700,
                                                                fontSize: '1rem',
                                                                textTransform: 'capitalize',
                                                                color: textColor,
                                                                mb: 0.5
                                                            }}>
                                                                {displayStatus}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            })()}
                                        </Box>

                                        {selectedOrderDetail.note && (
                                            <Box sx={{
                                                mt: 4,
                                                p: 3,
                                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                borderRadius: 3,
                                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                                borderLeft: '4px solid #f59e0b'
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <Box sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <AssignmentIcon sx={{color: '#d97706', fontSize: 20}}/>
                                                    </Box>
                                                    <Typography variant="subtitle1" sx={{
                                                        fontWeight: 600,
                                                        color: '#92400e',
                                                        fontSize: '1rem'
                                                    }}>
                                                        Order Notes
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#451a03',
                                                    lineHeight: 1.6,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {selectedOrderDetail.note}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                    borderRadius: 3,
                                    boxShadow: '0 8px 32px rgba(63, 81, 181, 0.08)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(63, 81, 181, 0.12)',
                                        border: '1px solid rgba(63, 81, 181, 0.2)'
                                    }
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                        p: 3,
                                        borderRadius: '12px 12px 0 0',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}>
                                            <BusinessIcon sx={{fontSize: 20}}/>
                                            School Information
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 3}}>
                                            <Avatar sx={{
                                                width: 80,
                                                height: 80,
                                                backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                                border: '2px solid rgba(63, 81, 181, 0.2)'
                                            }}>
                                                {selectedOrderDetail.school?.avatar ? (
                                                    <img
                                                        src={selectedOrderDetail.school.avatar}
                                                        alt="School Logo"
                                                        referrerPolicy="no-referrer"
                                                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                    />
                                                ) : (
                                                    <BusinessIcon sx={{fontSize: 40, color: '#3f51b5'}}/>
                                                )}
                                            </Avatar>

                                            <Box sx={{
                                                flex: 1,
                                                display: 'grid',
                                                gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)'},
                                                gap: 2
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <BusinessIcon sx={{color: '#3f51b5', fontSize: 20}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            School Name
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {selectedOrderDetail.school?.business || 'School Name'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <PersonIcon sx={{color: '#3b82f6', fontSize: 20}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Contact Person
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {selectedOrderDetail.school?.name || 'Contact Person'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <PhoneIcon sx={{color: '#10b981', fontSize: 20}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Phone Number
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {selectedOrderDetail.school?.phone || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <EmailIcon sx={{color: '#f59e0b', fontSize: 20}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Email
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {selectedOrderDetail.school?.account?.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 2,
                                                    gridColumn: {xs: '1', sm: '1 / -1'}
                                                }}>
                                                    <LocationOnIcon sx={{color: '#ef4444', fontSize: 20, mt: 0.5}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Address
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {selectedOrderDetail.school?.address || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid rgba(63, 81, 181, 0.1)',
                                    borderRadius: 3,
                                    boxShadow: '0 8px 32px rgba(63, 81, 181, 0.08)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(63, 81, 181, 0.12)',
                                        border: '1px solid rgba(63, 81, 181, 0.2)'
                                    }
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                        p: 3,
                                        borderRadius: '12px 12px 0 0',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}>
                                            <CheckroomIcon sx={{fontSize: 20}}/>
                                            Order Items
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        {selectedOrderDetail.orderDetails && selectedOrderDetail.orderDetails.length > 0 ? (
                                            <Box sx={{
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(9, 1fr)',
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                    minWidth: '1200px'
                                                }}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Category
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Gender
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Type
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Size
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Quantity
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Color
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Logo Position
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Logo Size
                                                        </Typography>
                                                        <Typography variant="caption" sx={{
                                                            color: '#1976d2',
                                                            fontSize: '11px',
                                                            fontWeight: 500
                                                        }}>
                                                            (height × width)
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        p: 2,
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Images
                                                        </Typography>
                                                    </Box>

                                                    {(() => {
                                                        const groupedItems = groupItemsByCategory(selectedOrderDetail.orderDetails);
                                                        const rows = [];

                                                        groupedItems.forEach((groupedItem, index) => {
                                                            rows.push(
                                                                <React.Fragment
                                                                    key={`${groupedItem.category}-${groupedItem.gender}-${groupedItem.type}-${index}`}>
                                                                    {groupedItem.isFirstInCategory && (
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gridRow: `span ${groupedItem.categoryRowSpan}`,
                                                                            minHeight: `${60 * groupedItem.categoryRowSpan}px`
                                                                        }}>
                                                                            <Chip
                                                                                label={groupedItem.category === 'pe' ? 'PE' : 'Regular'}
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: groupedItem.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                                                    color: groupedItem.category === 'pe' ? '#065f46' : '#1e40af',
                                                                                    fontWeight: 600,
                                                                                    fontSize: '11px',
                                                                                    height: 20
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    )}

                                                                    {groupedItem.isFirstInGender && (
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gridRow: `span ${groupedItem.genderRowSpan}`,
                                                                            minHeight: `${60 * groupedItem.genderRowSpan}px`
                                                                        }}>
                                                                            <Typography variant="body2" sx={{
                                                                                fontWeight: 600,
                                                                                color: '#374151',
                                                                                fontSize: '13px',
                                                                                textTransform: 'capitalize'
                                                                            }}>
                                                                                {groupedItem.gender === 'boy' ? 'Boy' :
                                                                                    groupedItem.gender === 'girl' ? 'Girl' :
                                                                                        groupedItem.gender || 'Unknown'}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#374151',
                                                                            fontSize: '13px',
                                                                            textTransform: 'capitalize'
                                                                        }}>
                                                                            {groupedItem.type || 'Item'}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#3f51b5',
                                                                            fontSize: '13px'
                                                                        }}>
                                                                            {groupedItem.sizes.sort().join(', ')}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleOpenQuantityDetails(groupedItem)}
                                                                            startIcon={<CheckroomIcon/>}
                                                                            sx={{
                                                                                borderColor: '#3f51b5',
                                                                                color: '#3f51b5',
                                                                                fontSize: '11px',
                                                                                py: 0.5,
                                                                                px: 1.5,
                                                                                minWidth: 'auto',
                                                                                borderRadius: 1.5,
                                                                                textTransform: 'none',
                                                                                fontWeight: 600,
                                                                                '&:hover': {
                                                                                    borderColor: '#1976d2',
                                                                                    backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                                                                    transform: 'scale(1.02)'
                                                                                },
                                                                                '& .MuiButton-startIcon': {
                                                                                    marginRight: '4px',
                                                                                    '& > svg': {
                                                                                        fontSize: '14px'
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            View ({groupedItem.totalQuantity})
                                                                        </Button>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexDirection: 'column',
                                                                        gap: 1
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: groupedItem.color || '#cccccc',
                                                                            border: '2px solid #ffffff',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}/>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#64748b',
                                                                            fontSize: '10px',
                                                                            fontWeight: 500
                                                                        }}>
                                                                            {groupedItem.color || 'N/A'}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 500,
                                                                            color: '#374151',
                                                                            fontSize: '12px',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            {groupedItem.logoPosition || 'N/A'}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 500,
                                                                            color: '#374151',
                                                                            fontSize: '12px',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            {groupedItem.baseLogoHeight && groupedItem.baseLogoWidth
                                                                                ? `${groupedItem.baseLogoHeight} × ${groupedItem.baseLogoWidth}`
                                                                                : 'N/A'
                                                                            }
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleOpenImagesDialog(groupedItem)}
                                                                            sx={{
                                                                                fontSize: '11px',
                                                                                py: 0.5,
                                                                                px: 1.5,
                                                                                minWidth: 'auto',
                                                                                borderColor: '#3f51b5',
                                                                                color: '#3f51b5',
                                                                                fontWeight: 600,
                                                                                borderRadius: 1.5,
                                                                                textTransform: 'none',
                                                                                '&:hover': {
                                                                                    borderColor: '#1976d2',
                                                                                    backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                                                                    transform: 'scale(1.02)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </Box>
                                                                </React.Fragment>
                                                            );
                                                        });

                                                        return rows;
                                                    })()}
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                textAlign: 'center',
                                                py: 6,
                                                backgroundColor: '#f8fafc',
                                                borderRadius: 3,
                                                border: '2px dashed #cbd5e1'
                                            }}>
                                                <CheckroomIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                                                <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                                    No Order Items
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                                    This order doesn't have any items yet.
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showQuantityDetailsDialog}
                    onClose={handleCloseQuantityDetails}
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
                        position: 'relative'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <CheckroomIcon/>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                Size Breakdown Details
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={handleCloseQuantityDetails}
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
                        {selectedQuantityDetails && (
                            <Box>
                                <Card sx={{
                                    mb: 3,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2
                                }}>
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Chip
                                                label={selectedQuantityDetails.category}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#f0f4ff',
                                                    color: '#3730a3',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                            <Chip
                                                label={selectedQuantityDetails.gender}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                            <Chip
                                                label={selectedQuantityDetails.type}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#e0e7ff',
                                                    color: '#3730a3',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            Total Quantity: {selectedQuantityDetails.totalQuantity}
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card sx={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}>
                                        <CheckroomIcon sx={{color: 'white', fontSize: 20}}/>
                                        <Typography variant="h6" sx={{color: 'white', fontWeight: 600}}>
                                            Size Breakdown
                                        </Typography>
                                    </Box>

                                    <Box sx={{p: 0}}>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            borderBottom: '2px solid #e2e8f0'
                                        }}>
                                            <Box sx={{
                                                p: 2,
                                                backgroundColor: '#f8fafc',
                                                borderRight: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2"
                                                            sx={{fontWeight: 700, color: '#1e293b'}}>
                                                    Size
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 2,
                                                backgroundColor: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2"
                                                            sx={{fontWeight: 700, color: '#1e293b'}}>
                                                    Quantity
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {selectedQuantityDetails.sizes.sort().map((size) => (
                                            <Box key={size} sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                '&:hover': {
                                                    backgroundColor: '#f8fafc'
                                                }
                                            }}>
                                                <Box sx={{
                                                    p: 2,
                                                    borderRight: '1px solid #e2e8f0',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 600, color: '#1e293b'}}>
                                                        {size}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    p: 2,
                                                    borderBottom: '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="body1" sx={{color: '#64748b'}}>
                                                        {selectedQuantityDetails.quantities[size] || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Card>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
                        <Button
                            onClick={handleCloseQuantityDetails}
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
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={imagesDialogOpen}
                    onClose={handleCloseImagesDialog}
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
                        position: 'relative'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <CheckroomIcon/>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                Design Images
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={handleCloseImagesDialog}
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
                        {selectedItemImages && (
                            <Box>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 2,
                                    mb: 3
                                }}>
                                    <CardContent sx={{p: 2.5}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Chip
                                                label={selectedItemImages.category === 'pe' ? 'PE' : 'Regular'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: selectedItemImages.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                    color: selectedItemImages.category === 'pe' ? '#065f46' : '#1e40af',
                                                    fontWeight: 600
                                                }}
                                            />
                                            <Chip
                                                label={selectedItemImages.gender === 'boy' ? 'Boy' : 'Girl'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    fontWeight: 600
                                                }}
                                            />
                                            <Chip
                                                label={selectedItemImages.type}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#e0e7ff',
                                                    color: '#3730a3',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {selectedItemImages.gender === 'boy' ? 'Boy' : 'Girl'} {selectedItemImages.type} - {selectedItemImages.category === 'pe' ? 'Physical Education' : 'Regular'}
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: selectedItemImages.logoImageUrl ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
                                    },
                                    gap: 3
                                }}>
                                    {selectedItemImages.logoImageUrl && (
                                        <Card sx={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 32px rgba(63, 81, 181, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                                p: 2,
                                                textAlign: 'center'
                                            }}>
                                                <Typography variant="subtitle1" sx={{
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>
                                                    Logo Image
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#f8fafc',
                                                minHeight: 200
                                            }}>
                                                <img
                                                    src={selectedItemImages.logoImageUrl}
                                                    alt="Logo"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '180px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                            </Box>
                                        </Card>
                                    )}

                                    {selectedItemImages.frontImageUrl && (
                                        <Card sx={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 32px rgba(63, 81, 181, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                p: 2,
                                                textAlign: 'center'
                                            }}>
                                                <Typography variant="subtitle1" sx={{
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>
                                                    Front Design
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#f8fafc',
                                                minHeight: 200
                                            }}>
                                                <img
                                                    src={selectedItemImages.frontImageUrl}
                                                    alt="Front Design"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '180px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                            </Box>
                                        </Card>
                                    )}

                                    {selectedItemImages.backImageUrl && (
                                        <Card sx={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 32px rgba(63, 81, 181, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                p: 2,
                                                textAlign: 'center'
                                            }}>
                                                <Typography variant="subtitle1" sx={{
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>
                                                    Back Design
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#f8fafc',
                                                minHeight: 200
                                            }}>
                                                <img
                                                    src={selectedItemImages.backImageUrl}
                                                    alt="Back Design"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '180px',
                                                        objectFit: 'contain',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                            </Box>
                                        </Card>
                                    )}
                                </Box>

                                {!selectedItemImages.logoImageUrl && !selectedItemImages.frontImageUrl && !selectedItemImages.backImageUrl && (
                                    <Box sx={{
                                        textAlign: 'center',
                                        py: 6,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 3,
                                        border: '2px dashed #cbd5e1'
                                    }}>
                                        <CheckroomIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                                        <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                            No Images Available
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                            No design images have been uploaded for this item.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{p: 3, pt: 0}}>
                        <Button
                            onClick={handleCloseImagesDialog}
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
                    </DialogActions>
                </Dialog>

            </Box>
        </LocalizationProvider>
    );
}