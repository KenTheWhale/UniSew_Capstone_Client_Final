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
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Checkroom as CheckroomIcon,
    Close as CloseIcon,
    Email as EmailIcon,
    Factory as FactoryIcon,
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Place as PlaceIcon,
    Schedule as ScheduleIcon,
    StickyNote2 as NoteIcon,
    AttachMoney as MoneyIcon,
    RequestQuote as QuoteIcon,
    Send as SendIcon,
    TableChart as TableChartIcon,
    DesignServices as DesignServicesIcon,
    LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { PiPantsFill, PiShirtFoldedFill } from "react-icons/pi";
import { GiSkirt } from "react-icons/gi";
import { parseID } from "../../../utils/ParseIDUtil.jsx";
import DisplayImage from "../../ui/DisplayImage.jsx";
import { createQuotation, getSizes } from "../../../services/OrderService.jsx";
import { enqueueSnackbar } from "notistack";

// Status chip component
const StatusChip = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return {
                    label: 'Pending',
                    color: '#fff',
                    bgColor: '#f59e0b',
                    icon: <ScheduleIcon sx={{ fontSize: 16 }} />
                };
            case 'processing':
                return {
                    label: 'Processing',
                    color: '#fff',
                    bgColor: '#3b82f6',
                    icon: <ShippingIcon sx={{ fontSize: 16 }} />
                };
            case 'completed':
                return {
                    label: 'Completed',
                    color: '#fff',
                    bgColor: '#10b981',
                    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
                };
            case 'cancelled':
            case 'canceled':
                return {
                    label: 'Cancelled',
                    color: '#fff',
                    bgColor: '#ef4444',
                    icon: <CancelIcon sx={{ fontSize: 16 }} />
                };
            default:
                return {
                    label: 'Unknown',
                    color: '#374151',
                    bgColor: '#f3f4f6',
                    icon: <InfoIcon sx={{ fontSize: 16 }} />
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            sx={{
                backgroundColor: config.bgColor,
                color: config.color,
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '6px 12px',
                transition: 'all 0.3s ease',
                '& .MuiChip-icon': {
                    color: config.color,
                    transition: 'all 0.3s ease'
                },
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            }}
        />
    );
};

// Function to get appropriate icon based on item type
const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';

    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill size={24} color="#3b82f6" />;
    } else if (type.includes('pants') || type.includes('quần')) {
        return <PiPantsFill size={24} color="#059669" />;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt size={24} color="#ec4899" />;
    } else {
        return <CheckroomIcon sx={{ fontSize: 24, color: '#6b7280' }} />;
    }
};

export default function GarmentCreateQuotation({ visible, onCancel, order }) {
    const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [showQuotationForm, setShowQuotationForm] = useState(false);
    const [quotationData, setQuotationData] = useState({
        totalPrice: '',
        deliveryTime: '',
        note: '',
        validUntil: ''
    });
    const [submittingQuotation, setSubmittingQuotation] = useState(false);
    const [deliveryTimeError, setDeliveryTimeError] = useState('');
    const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
    const [selectedItemImages, setSelectedItemImages] = useState(null);
    const [deliveryOption, setDeliveryOption] = useState('date'); // 'date' or 'days'
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('');
    const [priceError, setPriceError] = useState('');
    const [validUntilError, setValidUntilError] = useState('');
    const [sizes, setSizes] = useState([]);
    const [showSizeSpecsDialog, setShowSizeSpecsDialog] = useState(false);
    const [selectedSizeSpecs, setSelectedSizeSpecs] = useState(null);
    const [showLogoPositionDialog, setShowLogoPositionDialog] = useState(false);

    const mergedOrderData = order || {};

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDaysUntilDeadline = (deadline) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getTotalItems = () => {
        return mergedOrderData.orderDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
    };

    const getUniqueTypes = () => {
        return mergedOrderData.orderDetails?.length || 0;
    };

    const handleUpdateStatus = () => {
        setUpdateStatusDialogOpen(true);
    };

    const handleStatusUpdate = () => {
        // TODO: Implement status update API call
        console.log('Updating status to:', newStatus, 'with note:', statusNote);
        setUpdateStatusDialogOpen(false);
        setNewStatus('');
        setStatusNote('');
    };

    const handleViewImages = (item) => {
        setSelectedItemImages(item);
        setImagesDialogOpen(true);
    };

    const handleCloseImagesDialog = () => {
        setImagesDialogOpen(false);
        setSelectedItemImages(null);
    };

    // Fetch sizes from API
    const fetchSizes = async () => {
        try {
            console.log('Fetching sizes from API...');
            const response = await getSizes();
            if (response && response.status === 200) {
                console.log("Sizes fetched successfully: ", response.data.body);
                setSizes(response.data.body || []);
            } else {
                console.log("API response not successful:", response);
            }
        } catch (err) {
            console.error("Error fetching sizes:", err);
        }
    };

    const handleCloseSizeSpecs = () => {
        setShowSizeSpecsDialog(false);
        setSelectedSizeSpecs(null);
    };

    const handleOpenSizeSpecsForItem = (designItem) => {
        console.log('handleOpenSizeSpecsForItem called with:', designItem);
        
        if (!designItem) {
            console.log('No design item provided, using default values');
            setSelectedSizeSpecs({
                type: 'regular',
                gender: 'male'
            });
        } else {
            console.log('Setting size specs with design item data');
            setSelectedSizeSpecs({
                type: designItem.deliveryItem?.designItem?.category || 'regular',
                gender: designItem.deliveryItem?.designItem?.gender === 'boy' ? 'male' : 'female'
            });
        }
        
        console.log('Opening size specs dialog');
        setShowSizeSpecsDialog(true);
    };

    const handleOpenLogoPositionDialog = () => {
        console.log('Opening logo position dialog');
        setShowLogoPositionDialog(true);
    };

    const handleCloseLogoPositionDialog = () => {
        setShowLogoPositionDialog(false);
    };

    const handleCreateQuotation = () => {
        setShowQuotationForm(true);
    };

    const handleSubmitQuotation = async () => {
        try {
            setSubmittingQuotation(true);
            
            // Validation
            const price = parseInt(quotationData.totalPrice);
            if (price < 10000) {
                enqueueSnackbar('Total price must be at least 10,000 VND', { variant: 'error' });
                setSubmittingQuotation(false);
                return;
            }
            
            if (price > 200000000) {
                enqueueSnackbar('Total price cannot exceed 200,000,000 VND', { variant: 'error' });
                setSubmittingQuotation(false);
                return;
            }

            const deliveryDays = parseInt(quotationData.deliveryTime);
            if (deliveryOption === 'days' && deliveryDays < 1) {
                enqueueSnackbar('Delivery time must be at least 1 day', { variant: 'error' });
                setSubmittingQuotation(false);
                return;
            }
            
            const validUntilDate = new Date(quotationData.validUntil);
            const orderDeadline = new Date(mergedOrderData.deadline);
            const dayBeforeDeadline = new Date(orderDeadline);
            dayBeforeDeadline.setDate(orderDeadline.getDate() - 1);
            dayBeforeDeadline.setHours(23, 59, 59, 999);
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            if (validUntilDate < tomorrow) {
                enqueueSnackbar('Valid until date must be from tomorrow onwards', { variant: 'error' });
                setSubmittingQuotation(false);
                return;
            }
            
            if (validUntilDate > dayBeforeDeadline) {
                enqueueSnackbar(`Valid until date must be before order deadline (${formatDate(mergedOrderData.deadline)})`, { variant: 'error' });
                setSubmittingQuotation(false);
                return;
            }
            
            // Calculate early delivery date based on selected option
            let earlyDeliveryDate;
            if (deliveryOption === 'date') {
                earlyDeliveryDate = new Date(selectedDeliveryDate);
            } else {
                const orderDate = new Date(mergedOrderData.orderDate);
                earlyDeliveryDate = new Date(orderDate);
                earlyDeliveryDate.setDate(orderDate.getDate() + deliveryDays);
            }
            
            // Check if delivery time exceeds the order deadline (only for days option)
            if (deliveryOption === 'days') {
                const orderDeadline = new Date(mergedOrderData.deadline);
                orderDeadline.setHours(23, 59, 59, 999); // Set to end of day
                
                if (earlyDeliveryDate > orderDeadline) {
                    enqueueSnackbar(`Delivery time cannot exceed the order deadline (${formatDate(mergedOrderData.deadline)})`, { variant: 'error' });
                    setSubmittingQuotation(false);
                    return;
                }
            }
            
            // Prepare data according to API structure
            const quotationPayload = {
                orderId: parseInt(mergedOrderData.id),
                earlyDeliveryDate: earlyDeliveryDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
                acceptanceDeadline: quotationData.validUntil,
                price: parseInt(quotationData.totalPrice) || 0,
                note: quotationData.note || ''
            };
            
            console.log('Submitting quotation:', quotationPayload);
            
            // const response = await createQuotation(quotationPayload);
            //
            // if (response && response.status === 200) {
            //     enqueueSnackbar('Quotation sent successfully!', { variant: 'success' });
            //     // Reset form and close
            //     setShowQuotationForm(false);
            //     setQuotationData({
            //         totalPrice: '',
            //         deliveryTime: '',
            //         note: '',
            //         validUntil: ''
            //     });
            // } else {
            //     enqueueSnackbar('Failed to send quotation. Please try again.', { variant: 'error' });
            // }
        } catch (error) {
            console.error('Error submitting quotation:', error);
            enqueueSnackbar('An error occurred while sending the quotation.', { variant: 'error' });
        } finally {
            setSubmittingQuotation(false);
        }
    };

    const handleTotalPriceChange = (value) => {
        const numericValue = value.replace(/[^\d]/g, '');
        setQuotationData(prev => ({
            ...prev,
            totalPrice: numericValue
        }));

        // Clear error if empty
        if (!numericValue) {
            setPriceError('');
            return;
        }

        const price = parseInt(numericValue);
        
        // Validate minimum price
        if (price < 10000) {
            setPriceError('Total price must be at least 10,000 VND');
            return;
        }
        
        // Validate maximum price
        if (price > 200000000) {
            setPriceError('Total price cannot exceed 200,000,000 VND');
            return;
        }

        setPriceError('');
    };

    const handleDeliveryTimeChange = (value) => {
        const deliveryDays = parseInt(value);
        setQuotationData(prev => ({
            ...prev,
            deliveryTime: value
        }));

        // Clear error if empty
        if (!value) {
            setDeliveryTimeError('');
            return;
        }

        // Validate delivery time
        if (deliveryDays < 1) {
            setDeliveryTimeError('Delivery time must be at least 1 day');
            return;
        }

        // Check if delivery time exceeds the order deadline
        const orderDate = new Date(mergedOrderData.orderDate);
        const earlyDeliveryDate = new Date(orderDate);
        earlyDeliveryDate.setDate(orderDate.getDate() + deliveryDays);
        
        const orderDeadline = new Date(mergedOrderData.deadline);
        orderDeadline.setHours(23, 59, 59, 999); // Set to end of day
        
        if (earlyDeliveryDate > orderDeadline) {
            setDeliveryTimeError(`Cannot exceed order deadline (${formatDate(mergedOrderData.deadline)})`);
            return;
        }

        setDeliveryTimeError('');
    };

    const handleDeliveryDateChange = (date) => {
        setSelectedDeliveryDate(date);
        
        if (!date) {
            setDeliveryTimeError('');
            return;
        }

        const selectedDate = new Date(date);
        const orderDeadline = new Date(mergedOrderData.deadline);
        orderDeadline.setHours(23, 59, 59, 999);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayBeforeDeadline = new Date(orderDeadline);
        dayBeforeDeadline.setDate(orderDeadline.getDate() - 1);
        dayBeforeDeadline.setHours(23, 59, 59, 999);

        if (selectedDate < tomorrow) {
            setDeliveryTimeError('Delivery date must be from tomorrow onwards');
            return;
        }

        if (selectedDate > dayBeforeDeadline) {
            setDeliveryTimeError(`Delivery date must be before deadline (${formatDate(mergedOrderData.deadline)})`);
            return;
        }

        setDeliveryTimeError('');
    };

    const getCalculatedDeliveryDate = () => {
        if (!quotationData.deliveryTime) return '';
        
        const deliveryDays = parseInt(quotationData.deliveryTime);
        const orderDate = new Date(mergedOrderData.orderDate);
        const calculatedDate = new Date(orderDate);
        calculatedDate.setDate(orderDate.getDate() + deliveryDays);
        
        return calculatedDate.toISOString().split('T')[0];
    };

    // Fetch sizes when component mounts
    useEffect(() => {
        if (visible) {
            console.log('Component visible, fetching sizes...');
            fetchSizes();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="xl"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 3,
                    minHeight: '80vh',
                    maxHeight: '90vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        width: 48,
                        height: 48
                    }}>
                        <AssignmentIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Order Details
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            {parseID(mergedOrderData.id, 'ord')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={onCancel} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 0, overflow: 'auto' }}>
                <Container maxWidth={false} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                        {/* Left Column - Order Information, School Information, Order Items */}
                        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Order Information Card */}
                            <Card sx={{
                                mb: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(63, 81, 181, 0.08)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 12px 40px rgba(63, 81, 181, 0.12)',
                                    transform: 'translateY(-2px)',
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
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(30px, -30px)'
                                    }} />
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <InfoIcon sx={{ fontSize: 20 }} />
                                        </Box>
                                        Order Information
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 4 }}>
                                    {/* Main Information Grid */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        gap: 3, 
                                        height: '100%',
                                        flexWrap: { xs: 'wrap', sm: 'nowrap' }
                                    }}>
                                        {/* Order Date */}
                                        <Box sx={{ 
                                            flex: 1,
                                            height: '100%',
                                            minWidth: { xs: '100%', sm: 'auto' }
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
                                                    <CalendarIcon sx={{ color: '#3f51b5', fontSize: 24 }} />
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
                                                    {formatDate(mergedOrderData.orderDate)}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: 'transparent',
                                                    fontSize: '0.8rem',
                                                    lineHeight: 1.2
                                                }}>
                                                    &nbsp;
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Delivery Deadline */}
                                        <Box sx={{ 
                                            flex: 1,
                                            height: '100%',
                                            minWidth: { xs: '100%', sm: 'auto' }
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
                                                    <ScheduleIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
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
                                                    {formatDate(mergedOrderData.deadline)}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    color: (() => {
                                                        const daysLeft = getDaysUntilDeadline(mergedOrderData.deadline);
                                                        if (daysLeft > 30) return '#2e7d32'; // xanh
                                                        if (daysLeft > 14) return '#ff9800'; // cam
                                                        return '#d32f2f'; // đỏ
                                                    })(),
                                                    fontSize: '0.8rem',
                                                    lineHeight: 1.2
                                                }}>
                                                    {getDaysUntilDeadline(mergedOrderData.deadline) > 0 
                                                        ? `${getDaysUntilDeadline(mergedOrderData.deadline)} days left`
                                                        : 'overdue'
                                                    }
                                                </Typography>
                                            </Box>
                                        </Box>



                                        {/* Total Uniforms */}
                                        <Box sx={{ 
                                            flex: 1,
                                            height: '100%',
                                            minWidth: { xs: '100%', sm: 'auto' }
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
                                                    <CheckroomIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
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
                                                    {Math.ceil(getTotalItems() / 2)}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: 'transparent',
                                                    fontSize: '0.8rem',
                                                    lineHeight: 1.2
                                                }}>
                                                    &nbsp;
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Status */}
                                        <Box sx={{ 
                                            flex: 1,
                                            height: '100%',
                                            minWidth: { xs: '100%', sm: 'auto' }
                                        }}>
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                                textAlign: 'center',
                                                transition: 'all 0.3s ease',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 2
                                                }}>
                                                    <InfoIcon sx={{ color: '#10b981', fontSize: 24 }} />
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
                                                    color: (() => {
                                                        const status = mergedOrderData.status?.toLowerCase();
                                                        switch (status) {
                                                            case 'pending':
                                                                return '#f59e0b';
                                                            case 'processing':
                                                                return '#3b82f6';
                                                            case 'completed':
                                                                return '#10b981';
                                                            case 'cancelled':
                                                            case 'canceled':
                                                                return '#ef4444';
                                                            default:
                                                                return '#6b7280';
                                                        }
                                                    })(),
                                                    mb: 0.5
                                                }}>
                                                    {mergedOrderData.status || 'Unknown'}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: 'transparent',
                                                    fontSize: '0.8rem',
                                                    lineHeight: 1.2
                                                }}>
                                                    &nbsp;
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    {/* Order Notes Section */}
                                    {mergedOrderData.note && (
                                        <Box sx={{
                                            mt: 4,
                                            p: 3,
                                            backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                            borderRadius: 3,
                                            border: '1px solid rgba(245, 158, 11, 0.15)',
                                            borderLeft: '4px solid #f59e0b'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{
                                                    p: 1,
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <NoteIcon sx={{ color: '#d97706', fontSize: 20 }} />
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
                                                {mergedOrderData.note}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* School Information */}
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
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(30px, -30px)'
                                    }} />
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <BusinessIcon sx={{ fontSize: 20 }} />
                                        </Box>
                                        School Information
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                        {/* Avatar */}
                                        <Avatar sx={{
                                            width: 80,
                                            height: 80,
                                            backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                            border: '2px solid rgba(63, 81, 181, 0.2)'
                                        }}>
                                            {mergedOrderData.school?.avatar ? (
                                                <img 
                                                    src={mergedOrderData.school.avatar} 
                                                    alt="School Logo"
                                                    referrerPolicy="no-referrer"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <BusinessIcon sx={{ fontSize: 40, color: '#3f51b5' }} />
                                            )}
                                        </Avatar>

                                        {/* Information Grid */}
                                        <Box sx={{ 
                                            flex: 1,
                                            display: 'grid', 
                                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                            gap: 2 
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <BusinessIcon sx={{ color: '#3f51b5', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        School Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {mergedOrderData.school?.business || 'School Name'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PersonIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Contact Person
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {mergedOrderData.school?.name || 'Contact Person'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <EmailIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {mergedOrderData.school?.account?.email || 'email@school.edu'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PhoneIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Phone
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {mergedOrderData.school?.phone || 'Phone Number'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {mergedOrderData.school?.address && (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'flex-start', 
                                                    gap: 2,
                                                    gridColumn: { xs: '1', sm: '1 / -1' }
                                                }}>
                                                    <PlaceIcon sx={{ color: '#ef4444', fontSize: 20, mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Address
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {mergedOrderData.school.address}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Order Items Section */}
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
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100px',
                                        height: '100px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(30px, -30px)'
                                    }} />
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <CheckroomIcon sx={{ fontSize: 20 }} />
                                            </Box>
                                            Order Items
                                            <Chip 
                                                label={`${mergedOrderData.orderDetails?.length || 0} clothes`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    ml: 2
                                                }}
                                            />
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CheckroomIcon />}
                                                onClick={handleOpenLogoPositionDialog}
                                                sx={{
                                                    px: 2.5,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    textTransform: 'none',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    whiteSpace: 'nowrap',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                        color: 'white',
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                View Logo Position
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<TableChartIcon />}
                                                onClick={() => {
                                                    console.log('Opening size specs dialog');
                                                    console.log('Order details:', mergedOrderData.orderDetails);
                                                    console.log('First order detail:', mergedOrderData.orderDetails?.[0]);
                                                    handleOpenSizeSpecsForItem(mergedOrderData.orderDetails?.[0]);
                                                }}
                                                sx={{
                                                    px: 2.5,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    textTransform: 'none',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    whiteSpace: 'nowrap',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                        color: 'white',
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                View Size Specifications
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ p: 3 }}>
                                    {mergedOrderData.orderDetails?.length === 0 ? (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 6,
                                            color: '#64748b'
                                        }}>
                                            <CheckroomIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                            <Typography variant="h6" sx={{ mb: 1 }}>
                                                No Items Found
                                            </Typography>
                                            <Typography variant="body2">
                                                This order doesn't contain any items yet.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {/* Excel-Style Table */}
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '120px 100px 100px 100px 100px 100px 120px 120px 120px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Header Row */}
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
                                                
                                                {/* Data Rows */}
                                                {(() => {
                                                    // Group items by category and then by gender within each category
                                                    const groupedByCategory = {};
                                                    mergedOrderData.orderDetails?.forEach((item, index) => {
                                                        const category = item.deliveryItem?.designItem?.category || 'regular';
                                                        const gender = item.deliveryItem?.designItem?.gender || 'unknown';
                                                        
                                                        if (!groupedByCategory[category]) {
                                                            groupedByCategory[category] = {};
                                                        }
                                                        if (!groupedByCategory[category][gender]) {
                                                            groupedByCategory[category][gender] = [];
                                                        }
                                                        groupedByCategory[category][gender].push({ ...item, originalIndex: index });
                                                    });

                                                    let currentRow = 1; // Start from row 1 (after header)
                                                    const rows = [];

                                                    Object.entries(groupedByCategory).forEach(([category, genderGroups]) => {
                                                        // Calculate total rows for this category
                                                        const totalCategoryRows = Object.values(genderGroups).reduce((sum, items) => sum + items.length, 0);
                                                        
                                                        Object.entries(genderGroups).forEach(([gender, items]) => {
                                                            const genderRowSpan = items.length;
                                                            
                                                            items.forEach((item, itemIndex) => {
                                                                const isFirstInCategory = Object.keys(genderGroups).indexOf(gender) === 0 && itemIndex === 0;
                                                                const isFirstInGender = itemIndex === 0;
                                                                const rowIndex = currentRow + itemIndex;
                                                                
                                                                rows.push(
                                                                    <React.Fragment key={`${category}-${gender}-${item.originalIndex}`}>
                                                                        {/* Category - only show for first item in category */}
                                                                        {isFirstInCategory && (
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRight: '1px solid #000000',
                                                                                borderBottom: '1px solid #000000',
                                                                                backgroundColor: '#f8fafc',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gridRow: `span ${totalCategoryRows}`,
                                                                                minHeight: `${60 * totalCategoryRows}px`
                                                                            }}>
                                                                                <Chip
                                                                                    label={category === 'pe' ? 'PE' : 'Regular'}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        backgroundColor: category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                                                        color: category === 'pe' ? '#065f46' : '#1e40af',
                                                                                        fontWeight: 600,
                                                                                        fontSize: '11px',
                                                                                        height: 20
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        )}
                                                                        
                                                                        {/* Gender - only show for first item in gender group */}
                                                                        {isFirstInGender && (
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRight: '1px solid #000000',
                                                                                borderBottom: '1px solid #000000',
                                                                                backgroundColor: '#f8fafc',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gridRow: `span ${genderRowSpan}`,
                                                                                minHeight: `${60 * genderRowSpan}px`
                                                                            }}>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#374151',
                                                                                    fontSize: '13px',
                                                                                    textTransform: 'capitalize'
                                                                                }}>
                                                                                    {gender === 'male' ? 'Boy' : 
                                                                                     gender === 'female' ? 'Girl' : 
                                                                                     gender || 'Unknown'}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                        
                                                                    {/* Type */}
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
                                                                            {item.deliveryItem?.designItem?.type || 'Item'}
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    {/* Size */}
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
                                                                            {item.size || 'M'}
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    {/* Quantity */}
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Typography variant="h6" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#1976d2',
                                                                            fontSize: '16px'
                                                                        }}>
                                                                            {item.quantity || 0}
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    {/* Color */}
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: 1
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 26,
                                                                            height: 16,
                                                                            backgroundColor: item.deliveryItem?.designItem?.color || '#000',
                                                                            borderRadius: 0.5,
                                                                            border: '1px solid #e5e7eb'
                                                                        }} />
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#64748b',
                                                                            fontSize: '12px'
                                                                        }}>
                                                                            {item.deliveryItem?.designItem?.color || '#000'}
                                                                        </Typography>
                                                                    </Box>
                                                                    
                                                                    {/* Logo Position */}
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {(() => {
                                                                            const logoPosition = item.deliveryItem?.designItem?.logoPosition;
                                                                            const logoHeight = item.deliveryItem?.baseLogoHeight || 0;
                                                                            const logoWidth = item.deliveryItem?.baseLogoWidth || 0;
                                                                            
                                                                            if (logoPosition && logoHeight > 0 && logoWidth > 0) {
                                                                                return (
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 500,
                                                                                        color: '#1e293b',
                                                                                        fontSize: '12px'
                                                                                    }}>
                                                                                        {logoPosition}
                                                                                    </Typography>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <Typography variant="caption" sx={{
                                                                                        color: '#9ca3af',
                                                                                        fontSize: '11px',
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Typography>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Box>
                                                                    
                                                                    {/* Logo Size */}
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {(() => {
                                                                            const logoHeight = item.deliveryItem?.baseLogoHeight || 0;
                                                                            const logoWidth = item.deliveryItem?.baseLogoWidth || 0;
                                                                            
                                                                            if (logoHeight > 0 && logoWidth > 0) {
                                                                                return (
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 600,
                                                                                        color: '#1976d2',
                                                                                        fontSize: '13px',
                                                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                                                        padding: '4px 8px',
                                                                                        borderRadius: '4px',
                                                                                        border: '1px solid rgba(25, 118, 210, 0.2)'
                                                                                    }}>
                                                                                        {logoHeight} × {logoWidth} cm
                                                                                    </Typography>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <Typography variant="caption" sx={{
                                                                                        color: '#9ca3af',
                                                                                        fontSize: '11px',
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Typography>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Box>
                                                                    
                                                                    {/* Images */}
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
                                                                            onClick={() => handleViewImages(item)}
                                                                            startIcon={<InfoIcon />}
                                                                            sx={{
                                                                                borderColor: '#3f51b5',
                                                                                color: '#3f51b5',
                                                                                fontSize: '11px',
                                                                                py: 0.5,
                                                                                px: 1.5,
                                                                                minWidth: 'auto',
                                                                                '&:hover': {
                                                                                    borderColor: '#303f9f',
                                                                                    backgroundColor: 'rgba(63, 81, 181, 0.1)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            View Images
                                                                        </Button>
                                                                    </Box>
                                                                </React.Fragment>
                                                            );
                                                        });
                                                        
                                                        currentRow += genderRowSpan;
                                                    });
                                                    
                                                    currentRow += totalCategoryRows; // Increment row by total rows for the current category
                                                });
                                                
                                                return rows;
                                            })()}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        </Box>

                        {/* Right Column - Quotation Panel */}
                        <Box sx={{ flex: 1 }}>

                            {/* Quotation Panel */}
                            <Card sx={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(102, 126, 234, 0.15)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                    p: 2,
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        Wanna to get this order ?
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                            opacity: 0.9,
                                            textAlign: 'center',
                                            mt: 0.5,
                                            color: 'white'
                                        }}>
                                            Provide your quotation for this order
                                        </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    {!showQuotationForm ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={handleCreateQuotation}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                                    color: 'white',
                                                    py: 1.5,
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px rgba(63, 81, 181, 0.3)'
                                                    }
                                                }}
                                            >
                                                Create Quotation
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {/* Total Price */}
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: '#1e293b'
                                                }}>
                                                    Total Order Price (VND) *
                                                </Typography>
                                                <TextField
                                                    type="text"
                                                    value={quotationData.totalPrice ? parseFloat(quotationData.totalPrice).toLocaleString('vi-VN') : ''}
                                                    onChange={(e) => handleTotalPriceChange(e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Enter total price (10,000 - 200,000,000 VND)"
                                                    error={!!priceError}
                                                    helperText={priceError || 'Price range: 10,000 - 200,000,000 VND'}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: priceError ? '#ef4444' : 'rgba(63, 81, 181, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: priceError ? '#ef4444' : 'rgba(63, 81, 181, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: priceError ? '#ef4444' : '#3f51b5'
                                                            }
                                                        },
                                                        '& .MuiFormHelperText-root': {
                                                            color: priceError ? '#ef4444' : '#64748b',
                                                            fontSize: '0.75rem',
                                                            marginTop: 0.5
                                                        }
                                                    }}
                                                />
                                            </Box>



                                            {/* Delivery Time */}
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: '#1e293b'
                                                }}>
                                                    Delivery Time *
                                                </Typography>
                                                
                                                {/* Delivery Option Toggle */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <Button
                                                            variant={deliveryOption === 'date' ? 'contained' : 'outlined'}
                                                            size="small"
                                                            onClick={() => setDeliveryOption('date')}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                py: 0.5,
                                                                px: 1.5,
                                                                minWidth: 'auto',
                                                                ...(deliveryOption === 'date' && {
                                                                    backgroundColor: '#3f51b5',
                                                                    '&:hover': { backgroundColor: '#303f9f' }
                                                                })
                                                            }}
                                                        >
                                                            Select Date
                                                        </Button>
                                                        <Button
                                                            variant={deliveryOption === 'days' ? 'contained' : 'outlined'}
                                                            size="small"
                                                            onClick={() => setDeliveryOption('days')}
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                py: 0.5,
                                                                px: 1.5,
                                                                minWidth: 'auto',
                                                                ...(deliveryOption === 'days' && {
                                                                    backgroundColor: '#3f51b5',
                                                                    '&:hover': { backgroundColor: '#303f9f' }
                                                                })
                                                            }}
                                                        >
                                                            Enter Days
                                                        </Button>
                                                    </Box>
                                                </Box>

                                                {/* Option 1: Select Date */}
                                                {deliveryOption === 'date' && (
                                                    <TextField
                                                        type="date"
                                                        value={selectedDeliveryDate}
                                                        onChange={(e) => handleDeliveryDateChange(e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Select delivery date"
                                                        error={!!deliveryTimeError}
                                                        helperText={deliveryTimeError || 'Select a date from tomorrow until before deadline'}
                                                        inputProps={{
                                                            min: (() => {
                                                                const tomorrow = new Date();
                                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                                return tomorrow.toISOString().split('T')[0];
                                                            })(),
                                                            max: (() => {
                                                                const orderDeadline = new Date(mergedOrderData.deadline);
                                                                orderDeadline.setDate(orderDeadline.getDate() - 1);
                                                                return orderDeadline.toISOString().split('T')[0];
                                                            })()
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                '& fieldset': {
                                                                    borderColor: deliveryTimeError ? '#ef4444' : 'rgba(63, 81, 181, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: deliveryTimeError ? '#ef4444' : 'rgba(63, 81, 181, 0.5)'
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: deliveryTimeError ? '#ef4444' : '#3f51b5'
                                                                }
                                                            },
                                                            '& .MuiFormHelperText-root': {
                                                                color: deliveryTimeError ? '#ef4444' : '#64748b',
                                                                fontSize: '0.75rem',
                                                                marginTop: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}

                                                {/* Option 2: Enter Days */}
                                                {deliveryOption === 'days' && (
                                                    <Box>
                                                        <TextField
                                                            type="number"
                                                            value={quotationData.deliveryTime}
                                                            onChange={(e) => handleDeliveryTimeChange(e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Enter number of days needed"
                                                            inputProps={{ min: 1 }}
                                                            error={!!deliveryTimeError}
                                                            helperText={deliveryTimeError || `Order date: ${formatDate(mergedOrderData.orderDate)}`}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                                    '& fieldset': {
                                                                        borderColor: deliveryTimeError ? '#ef4444' : 'rgba(63, 81, 181, 0.3)'
                                                                    },
                                                                    '&:hover fieldset': {
                                                                        borderColor: deliveryTimeError ? '#ef4444' : 'rgba(63, 81, 181, 0.5)'
                                                                    },
                                                                    '&.Mui-focused fieldset': {
                                                                        borderColor: deliveryTimeError ? '#ef4444' : '#3f51b5'
                                                                    }
                                                                },
                                                                '& .MuiFormHelperText-root': {
                                                                    color: deliveryTimeError ? '#ef4444' : '#64748b',
                                                                    fontSize: '0.75rem',
                                                                    marginTop: 0.5
                                                                }
                                                            }}
                                                        />
                                                        {quotationData.deliveryTime && !deliveryTimeError && (
                                                            <Box sx={{
                                                                mt: 1,
                                                                p: 1.5,
                                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                                borderRadius: 1,
                                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                                            }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#065f46',
                                                                    fontWeight: 500,
                                                                    display: 'block'
                                                                }}>
                                                                    Estimated Delivery Date: {formatDate(getCalculatedDeliveryDate())}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Valid Until */}
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: '#1e293b'
                                                }}>
                                                    Valid Until *
                                                </Typography>
                                                <TextField
                                                    type="date"
                                                    value={quotationData.validUntil}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        setQuotationData({
                                                            ...quotationData,
                                                            validUntil: selectedDate
                                                        });

                                                        // Clear error if empty
                                                        if (!selectedDate) {
                                                            setValidUntilError('');
                                                            return;
                                                        }

                                                        const validUntilDate = new Date(selectedDate);
                                                        const orderDeadline = new Date(mergedOrderData.deadline);
                                                        const dayBeforeDeadline = new Date(orderDeadline);
                                                        dayBeforeDeadline.setDate(orderDeadline.getDate() - 1);
                                                        dayBeforeDeadline.setHours(23, 59, 59, 999);

                                                        const tomorrow = new Date();
                                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                                        tomorrow.setHours(0, 0, 0, 0);

                                                        if (validUntilDate < tomorrow) {
                                                            setValidUntilError('Valid until date must be from tomorrow onwards');
                                                            return;
                                                        }

                                                        if (validUntilDate > dayBeforeDeadline) {
                                                            setValidUntilError(`Valid until date must be before order deadline (${formatDate(mergedOrderData.deadline)})`);
                                                            return;
                                                        }

                                                        setValidUntilError('');
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    error={!!validUntilError}
                                                    helperText={validUntilError || 'Select a date before the order deadline'}
                                                    inputProps={{
                                                        min: (() => {
                                                            const tomorrow = new Date();
                                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                                            return tomorrow.toISOString().split('T')[0];
                                                        })(),
                                                        max: (() => {
                                                            const orderDeadline = new Date(mergedOrderData.deadline);
                                                            orderDeadline.setDate(orderDeadline.getDate() - 1);
                                                            return orderDeadline.toISOString().split('T')[0];
                                                        })()
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: validUntilError ? '#ef4444' : 'rgba(63, 81, 181, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: validUntilError ? '#ef4444' : 'rgba(63, 81, 181, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: validUntilError ? '#ef4444' : '#3f51b5'
                                                            }
                                                        },
                                                        '& .MuiFormHelperText-root': {
                                                            color: validUntilError ? '#ef4444' : '#64748b',
                                                            fontSize: '0.75rem',
                                                            marginTop: 0.5
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Notes */}
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: '#1e293b'
                                                }}>
                                                    Additional Notes
                                                </Typography>
                                                <TextField
                                                    multiline
                                                    rows={3}
                                                    value={quotationData.note}
                                                    onChange={(e) => setQuotationData({
                                                        ...quotationData,
                                                        note: e.target.value
                                                    })}
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Add any additional notes or terms..."
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: 'rgba(63, 81, 181, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(63, 81, 181, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#3f51b5'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => setShowQuotationForm(false)}
                                                    sx={{
                                                        borderColor: '#6b7280',
                                                        color: '#6b7280',
                                                        '&:hover': {
                                                            borderColor: '#4b5563',
                                                            backgroundColor: '#f9fafb'
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={submittingQuotation ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SendIcon />}
                                                    onClick={handleSubmitQuotation}
                                                    disabled={!quotationData.totalPrice || 
                                                             !!priceError ||
                                                             (deliveryOption === 'date' ? !selectedDeliveryDate : !quotationData.deliveryTime) || 
                                                             !quotationData.validUntil || 
                                                             !!validUntilError ||
                                                             !!deliveryTimeError || 
                                                             submittingQuotation}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)',
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
                                                        },
                                                        '&:disabled': {
                                                            background: '#9ca3af',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    {submittingQuotation ? 'Sending...' : 'Send Quotation'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Container>
            </DialogContent>

            {/* Update Status Dialog */}
            <Dialog
                open={updateStatusDialogOpen}
                onClose={() => setUpdateStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Update Order Status
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Select new status for order {parseID(mergedOrderData.id, 'ord')}:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                            {['pending', 'processing', 'completed'].map((status) => (
                                <Button
                                    key={status}
                                    variant={newStatus === status ? 'contained' : 'outlined'}
                                    onClick={() => setNewStatus(status)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {status}
                                </Button>
                            ))}
                        </Box>

                        <TextField
                            label="Update Note"
                            multiline
                            rows={3}
                            fullWidth
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="Add a note about this status update..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setUpdateStatusDialogOpen(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStatusUpdate}
                        variant="contained"
                        disabled={!newStatus}
                        sx={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                            }
                        }}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Images Dialog */}
            <Dialog
                open={imagesDialogOpen}
                onClose={handleCloseImagesDialog}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InfoIcon />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Item Images
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedItemImages && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Item Information */}
                            <Box sx={{
                                p: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                border: '1px solid rgba(63, 81, 181, 0.1)'
                            }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                                    Item Details
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            Type
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {selectedItemImages.deliveryItem?.designItem?.type || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            Size
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {selectedItemImages.size || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            Color
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {selectedItemImages.deliveryItem?.designItem?.color || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            Quantity
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {selectedItemImages.quantity || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Logo Image */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                border: '1px solid rgba(63, 81, 181, 0.1)'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3f51b5' }}>
                                    Logo Image
                                </Typography>
                                {selectedItemImages.deliveryItem?.designItem?.logoImageUrl ? (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 200,
                                        border: '2px dashed rgba(63, 81, 181, 0.3)',
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(63, 81, 181, 0.05)'
                                    }}>
                                        <DisplayImage
                                            imageUrl={selectedItemImages.deliveryItem.designItem.logoImageUrl}
                                            alt="Logo"
                                            width={300}
                                            height={200}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 200,
                                        border: '2px dashed #d1d5db',
                                        borderRadius: 2,
                                        backgroundColor: '#f9fafb'
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                            No Logo Image Available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Design Images */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                border: '1px solid rgba(63, 81, 181, 0.1)'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3f51b5' }}>
                                    Design Images
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {/* Front Design */}
                                    <Box sx={{ flex: 1, minWidth: 250 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#10b981' }}>
                                            Front Design
                                        </Typography>
                                        {selectedItemImages.deliveryItem?.frontImageUrl ? (
                                            <Box sx={{
                                                border: '2px dashed rgba(16, 185, 129, 0.3)',
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 200
                                            }}>
                                                <DisplayImage
                                                    imageUrl={selectedItemImages.deliveryItem.frontImageUrl}
                                                    alt="Front Design"
                                                    width={250}
                                                    height={200}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                border: '2px dashed #d1d5db',
                                                borderRadius: 2,
                                                backgroundColor: '#f9fafb',
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 200
                                            }}>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                    No Front Design
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Back Design */}
                                    <Box sx={{ flex: 1, minWidth: 250 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#8b5cf6' }}>
                                            Back Design
                                        </Typography>
                                        {selectedItemImages.deliveryItem?.backImageUrl ? (
                                            <Box sx={{
                                                border: '2px dashed rgba(139, 92, 246, 0.3)',
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 200
                                            }}>
                                                <DisplayImage
                                                    imageUrl={selectedItemImages.deliveryItem.backImageUrl}
                                                    alt="Back Design"
                                                    width={250}
                                                    height={200}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                border: '2px dashed #d1d5db',
                                                borderRadius: 2,
                                                backgroundColor: '#f9fafb',
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 200
                                            }}>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                    No Back Design
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseImagesDialog}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Logo Position Dialog */}
            <Dialog
                open={showLogoPositionDialog}
                onClose={handleCloseLogoPositionDialog}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckroomIcon sx={{ fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Logo Position Guide
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body1" sx={{
                            color: '#374151',
                            fontWeight: 500,
                            mb: 2
                        }}>
                            Reference guide for logo positioning on uniforms
                        </Typography>
                        
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                            <img
                                src="/logoPos.png"
                                alt="Logo Position Guide"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                                }}
                            />
                        </Box>
                        
                        <Box sx={{
                            p: 3,
                            backgroundColor: 'rgba(63, 81, 181, 0.05)',
                            borderRadius: 3,
                            border: '1px solid rgba(63, 81, 181, 0.1)'
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#3f51b5',
                                mb: 2
                            }}>
                                Common Logo Positions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    • <strong>Left Chest:</strong> Logo positioned on the left side of the chest
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    • <strong>Right Sleeve:</strong> Logo positioned on the right sleeve
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    • <strong>Left Sleeve:</strong> Logo positioned on the left sleeve
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    • <strong>Center Back:</strong> Logo positioned in the center of the back
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    • <strong>Right Chest:</strong> Logo positioned on the right side of the chest
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseLogoPositionDialog}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Size Specifications Dialog */}
            <Dialog
                open={showSizeSpecsDialog}
                onClose={handleCloseSizeSpecs}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
                    }
                }}
            >
                {console.log('Size specs dialog open state:', showSizeSpecsDialog)}
                {console.log('Selected size specs:', selectedSizeSpecs)}
                {console.log('Sizes data:', sizes)}
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TableChartIcon sx={{ fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Size Specifications - {selectedSizeSpecs?.gender === 'male' ? 'Boy' : 'Girl'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Selection Controls */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.15) 100%)',
                            border: '1px solid #3f51b5'
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#3f51b5',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <TableChartIcon sx={{ fontSize: 20 }} />
                                Select Specifications to View
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                {/* Gender Selection */}
                                <Box sx={{ minWidth: 200 }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 600,
                                        color: '#374151',
                                        mb: 1
                                    }}>
                                        Gender:
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedSizeSpecs?.gender || 'male'}
                                            onChange={(e) => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                gender: e.target.value
                                            }))}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                }
                                            }}
                                        >
                                            <MenuItem value="male">Boy</MenuItem>
                                            <MenuItem value="female">Girl</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                {/* Uniform Type Selection */}
                                <Box sx={{ minWidth: 200 }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 600,
                                        color: '#374151',
                                        mb: 1
                                    }}>
                                        Uniform Type:
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        minHeight: '40px',
                                        alignItems: 'center'
                                    }}>
                                        <Button
                                            variant={selectedSizeSpecs?.type === 'regular' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                type: 'regular'
                                            }))}
                                            sx={{
                                                minWidth: '120px',
                                                height: '36px',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                backgroundColor: selectedSizeSpecs?.type === 'regular' ? '#3f51b5' : 'transparent',
                                                color: selectedSizeSpecs?.type === 'regular' ? '#ffffff' : '#3f51b5',
                                                borderColor: '#3f51b5',
                                                borderWidth: '2px',
                                                '&:hover': {
                                                    backgroundColor: selectedSizeSpecs?.type === 'regular' ? '#303f9f' : 'rgba(63, 81, 181, 0.08)',
                                                    borderColor: '#3f51b5',
                                                    borderWidth: '2px'
                                                },
                                                '&:focus': {
                                                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                                                }
                                            }}
                                        >
                                            Regular
                                        </Button>
                                        <Button
                                            variant={selectedSizeSpecs?.type === 'pe' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                type: 'pe'
                                            }))}
                                            sx={{
                                                minWidth: '140px',
                                                height: '36px',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                backgroundColor: selectedSizeSpecs?.type === 'pe' ? '#3f51b5' : 'transparent',
                                                color: selectedSizeSpecs?.type === 'pe' ? '#ffffff' : '#3f51b5',
                                                borderColor: '#3f51b5',
                                                borderWidth: '2px',
                                                '&:hover': {
                                                    backgroundColor: selectedSizeSpecs?.type === 'pe' ? '#303f9f' : 'rgba(63, 81, 181, 0.08)',
                                                    borderColor: '#3f51b5',
                                                    borderWidth: '2px'
                                                },
                                                '&:focus': {
                                                    boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)'
                                                }
                                            }}
                                        >
                                            Physical Education
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Size Specifications Table */}
                        {selectedSizeSpecs && (
                            <Card sx={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <DesignServicesIcon sx={{ color: '#3f51b5' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#3f51b5' }}>
                                            {selectedSizeSpecs.gender === 'male' ? 'Boy' : 'Girl'} {selectedSizeSpecs.type === 'regular' ? 'Regular' : 'Physical Education'} Sizes
                                        </Typography>
                                    </Box>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 600,
                                                        fontSize: '14px',
                                                        color: '#1e293b'
                                                    }}>Size
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 600,
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        borderLeft: '1px solid #e2e8f0'
                                                    }} colSpan="2">Shirt
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 600,
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        borderLeft: '1px solid #e2e8f0'
                                                    }} colSpan="2">Pants
                                                    </th>
                                                    {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                        <th style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            borderBottom: '1px solid #e2e8f0',
                                                            fontWeight: 600,
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            borderLeft: '1px solid #e2e8f0'
                                                        }} colSpan="2">Skirt</th>
                                                    )}
                                                </tr>
                                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                                    <th style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }}></th>
                                                    <th style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                        borderLeft: '1px solid #e2e8f0'
                                                    }}>Height (cm)
                                                    </th>
                                                    <th style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }}>Weight (kg)
                                                    </th>
                                                    <th style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }}>Height (cm)
                                                    </th>
                                                    <th style={{
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 500,
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }}>Weight (kg)
                                                    </th>
                                                    {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                        <>
                                                            <th style={{
                                                                padding: '8px',
                                                                textAlign: 'center',
                                                                borderBottom: '1px solid #e2e8f0',
                                                                fontWeight: 500,
                                                                fontSize: '12px',
                                                                color: '#64748b',
                                                                borderLeft: '1px solid #e2e8f0'
                                                            }}>Height (cm)
                                                            </th>
                                                            <th style={{
                                                                padding: '8px',
                                                                textAlign: 'center',
                                                                borderBottom: '1px solid #e2e8f0',
                                                                fontWeight: 500,
                                                                fontSize: '12px',
                                                                color: '#64748b'
                                                            }}>Weight (kg)
                                                            </th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    // Get all shirt sizes for the selected gender
                                                    const shirtSizes = sizes.filter(size =>
                                                        size.gender === selectedSizeSpecs.gender &&
                                                        size.type === 'shirt'
                                                    );
                                                    
                                                    console.log('Shirt sizes:', shirtSizes);
                                                    
                                                    if (shirtSizes.length === 0) {
                                                        return (
                                                            <tr>
                                                                <td colSpan={selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' ? 7 : 5} style={{
                                                                    padding: '20px',
                                                                    textAlign: 'center',
                                                                    color: '#666',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    No size data available for {selectedSizeSpecs.gender === 'male' ? 'Boy' : 'Girl'} {selectedSizeSpecs.type === 'regular' ? 'Regular' : 'Physical Education'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                    
                                                    return shirtSizes.map((shirtSize) => {
                                                        // Find corresponding pants size for the same size label
                                                        const pantsSize = sizes.find(s =>
                                                            s.gender === selectedSizeSpecs.gender &&
                                                            s.type === 'pants' &&
                                                            s.size === shirtSize.size
                                                        );
                                                        
                                                        // Find corresponding skirt size for females (only for regular uniform)
                                                        const skirtSize = selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' ? sizes.find(s =>
                                                            s.gender === selectedSizeSpecs.gender &&
                                                            s.type === 'skirt' &&
                                                            s.size === shirtSize.size
                                                        ) : null;

                                                        return (
                                                            <tr key={`${shirtSize.type}-${shirtSize.size}-${shirtSize.gender}`} style={{
                                                                borderBottom: '1px solid #f1f5f9',
                                                                backgroundColor: '#ffffff'
                                                            }}>
                                                                <td style={{
                                                                    padding: '12px',
                                                                    fontWeight: 600,
                                                                    textAlign: 'center',
                                                                    fontSize: '14px',
                                                                    color: '#1e293b',
                                                                    backgroundColor: '#f8fafc'
                                                                }}>{shirtSize.size}</td>
                                                                <td style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    fontSize: '13px',
                                                                    color: '#374151',
                                                                    borderLeft: '1px solid #e2e8f0'
                                                                }}>
                                                                    {`${shirtSize.minHeight}-${shirtSize.maxHeight}`}
                                                                </td>
                                                                <td style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    fontSize: '13px',
                                                                    color: '#374151'
                                                                }}>
                                                                    {`${shirtSize.minWeight}-${shirtSize.maxWeight}`}
                                                                </td>
                                                                <td style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    fontSize: '13px',
                                                                    color: '#374151',
                                                                    borderLeft: '1px solid #e2e8f0'
                                                                }}>
                                                                    {pantsSize ? `${pantsSize.minHeight}-${pantsSize.maxHeight}` : '-'}
                                                                </td>
                                                                <td style={{
                                                                    padding: '12px',
                                                                    textAlign: 'center',
                                                                    fontSize: '13px',
                                                                    color: '#374151'
                                                                }}>
                                                                    {pantsSize ? `${pantsSize.minWeight}-${pantsSize.maxWeight}` : '-'}
                                                                </td>
                                                                {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                                    <>
                                                                        <td style={{
                                                                            padding: '12px',
                                                                            textAlign: 'center',
                                                                            fontSize: '13px',
                                                                            color: '#374151',
                                                                            borderLeft: '1px solid #e2e8f0'
                                                                        }}>
                                                                            {skirtSize ? `${skirtSize.minHeight}-${skirtSize.maxHeight}` : '-'}
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '12px',
                                                                            textAlign: 'center',
                                                                            fontSize: '13px',
                                                                            color: '#374151'
                                                                        }}>
                                                                            {skirtSize ? `${skirtSize.minWeight}-${skirtSize.maxWeight}` : '-'}
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseSizeSpecs}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}