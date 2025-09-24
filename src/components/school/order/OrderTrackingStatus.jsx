import React, {useEffect, useState, useRef} from 'react';
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
    IconButton,
    Popover,
    Typography
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import {Radio, Spin} from 'antd';
import {
    ArrowBack as ArrowBackIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    CreditCard as CreditCardIcon,
    Delete as DeleteIcon,
    DesignServices as DesignServicesIcon,
    Email as EmailIcon,
    Groups as GroupsIcon,
    Info as InfoIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    LocationOn as LocationIcon,
    Pending as PendingIcon,
    Phone as PhoneIcon,
    PlayArrow as PlayArrowIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    Stop as StopIcon,
    TableChart as TableChartIcon,
    TrendingUp as TrendingUpIcon,
    Videocam as VideocamIcon,
    Wallet as WalletIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {getOrderDetailBySchool, confirmOrder} from '../../../services/OrderService';
import {
    getPaymentUrl,
    getPaymentUrlUsingWalletForOrder,
    getWalletBalance
} from '../../../services/PaymentService';
import {calculateFee, getShippingInfo} from '../../../services/ShippingService';
import {getConfigByKey, configKey} from '../../../services/SystemService';
import {parseID} from '../../../utils/ParseIDUtil';
import {useSnackbar} from 'notistack';
import DisplayImage from '../../ui/DisplayImage';
import OrderDetailTable from '../../ui/OrderDetailTable';
import {serviceFee} from '../../../configs/FixedVariables';
import {getPhoneLink} from '../../../utils/PhoneUtil';
import {uploadCloudinary} from '../../../services/UploadImageService';
import {formatDate, formatDateTime, formatDateTimeSecond} from "../../../utils/TimestampUtil.jsx";

const pulseKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = pulseKeyframes;
    document.head.appendChild(style);
}

const statusTag = (status) => {
    let color;
    switch (status) {
        case 'pending':
            color = 'warning';
            break;
        case 'processing':
            color = 'info';
            break;
        case 'delivering':
            color = 'primary';
            break;
        case 'completed':
            color = 'success';
            break;
        case 'cancelled':
        case 'canceled':
            color = 'error';
            break;
        default:
            color = 'default';
            break;
    }
    return <Chip label={status} color={color} variant="outlined"/>;
};

const LoadingState = () => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3
    }}>
        <CircularProgress size={60} sx={{color: '#2e7d32'}}/>
        <Typography variant="h6" sx={{color: '#1e293b', fontWeight: 600}}>
            Loading Order Details...
        </Typography>
    </Box>
);

const ErrorState = ({error, onRetry, isRetrying}) => (
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
                Error Loading Order
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
);

export default function OrderTrackingStatus() {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [showQuantityDetailsDialog, setShowQuantityDetailsDialog] = useState(false);
    const [selectedQuantityDetails, setSelectedQuantityDetails] = useState(null);
    const [showImagesDialog, setShowImagesDialog] = useState(false);
    const [selectedItemImages, setSelectedItemImages] = useState(null);
    const [hoveredMilestone, setHoveredMilestone] = useState(null);
    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [popoverPosition, setPopoverPosition] = useState({vertical: 'center', horizontal: 'right'});

    // Payment dialog states
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loadingWallet, setLoadingWallet] = useState(false);

    // Shipping fee states
    const [shippingFee, setShippingFee] = useState(0);
    const [shippingFeeLoading, setShippingFeeLoading] = useState(false);
    const [shippingFeeError, setShippingFeeError] = useState(null);

    // Shipping info states
    const [shippingInfo, setShippingInfo] = useState(null);
    const [shippingInfoLoading, setShippingInfoLoading] = useState(false);
    const [shippingInfoError, setShippingInfoError] = useState(null);

    // Confirm order states
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [deliveryImage, setDeliveryImage] = useState(null);
    const [deliveryImageUrl, setDeliveryImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState('');

    // Video dialog states
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [selectedMilestoneVideo, setSelectedMilestoneVideo] = useState(null);

    // Business config states
    const [businessConfig, setBusinessConfig] = useState(null);
    const [businessConfigLoading, setBusinessConfigLoading] = useState(true);

    // Confirm dialog acknowledgement checkbox
    const [confirmAcknowledge, setConfirmAcknowledge] = useState(false);

    // Timeout ref for popover delay
    const popoverTimeoutRef = useRef(null);

    const orderId = sessionStorage.getItem('trackingOrderId');

    const fetchOrderDetail = async (showLoading = true) => {
        if (!orderId) {
            setError('No order ID found. Please go back to order list.');
            setLoading(false);
            return;
        }

        try {
            if (showLoading) setLoading(true);
            setError(null);

            const response = await getOrderDetailBySchool(orderId);

            if (response && response.data) {
                setOrderDetail(response.data.body);
            } else {
                setError('Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError('An error occurred while fetching order details');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    const fetchBusinessConfig = async () => {
        try {
            setBusinessConfigLoading(true);
            const response = await getConfigByKey(configKey.business);
            if (response && response.data && response.data.body && response.data.body.business) {
                const config = response.data.body.business;
                setBusinessConfig(config);
            }
        } catch (error) {
            console.error('Error fetching business configuration:', error);
            enqueueSnackbar('Failed to load business configuration', {variant: 'warning'});
        } finally {
            setBusinessConfigLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
        fetchBusinessConfig();
    }, [orderId]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (popoverTimeoutRef.current) {
                clearTimeout(popoverTimeoutRef.current);
            }
        };
    }, []);

    // Refresh the component when shipping info is loaded
    useEffect(() => {
        // This will trigger a re-render when shipping info changes
        if (shippingInfo) {
            console.log('Shipping info loaded:', shippingInfo);
        }
    }, [shippingInfo]);

    const handleRetry = () => {
        setIsRetrying(true);
        fetchOrderDetail();
    };

    const handleGoBack = () => {
        navigate('/school/order');
    };

    const handleCloseQuantityDetails = () => {
        setShowQuantityDetailsDialog(false);
        setSelectedQuantityDetails(null);
    };

    const handleCloseImagesDialog = () => {
        setShowImagesDialog(false);
        setSelectedItemImages(null);
    };

    const handleMilestoneHover = (event, milestone) => {
        // Clear any existing timeout
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = null;
        }

        setHoveredMilestone(milestone);
        setPopoverAnchor(event.currentTarget);

        // If hovering over delivering phase and we don't have shipping info yet, fetch it
        if (milestone.title === 'Delivering' && !shippingInfo && !shippingInfoLoading && orderDetail?.shippingCode) {
            fetchShippingInfo();
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const spaceOnRight = windowWidth - rect.right;
        const spaceAbove = rect.top;
        const spaceBelow = windowHeight - rect.bottom;

        let vertical = 'center';
        let horizontal = 'right';

        if (spaceOnRight < 400) {
            horizontal = 'left';
        }

        if (spaceBelow < 300) {
            vertical = 'bottom';
        } else if (spaceAbove < 300) {
            vertical = 'top';
        }

        setPopoverPosition({vertical, horizontal});
    };

    const handleMilestoneLeave = () => {
        // Clear any existing timeout
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
        
        // Delay hiding popover to allow moving mouse to popover
        popoverTimeoutRef.current = setTimeout(() => {
            setHoveredMilestone(null);
            setPopoverAnchor(null);
        }, 150);
    };

    // Handle popover mouse events
    const handlePopoverMouseEnter = () => {
        // Clear timeout when mouse enters popover
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = null;
        }
    };

    const handlePopoverMouseLeave = () => {
        // Clear any existing timeout first
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = null;
        }
        
        // Hide popover immediately when mouse leaves popover
        setHoveredMilestone(null);
        setPopoverAnchor(null);
    };

    // Handle video dialog
    const handleOpenVideoDialog = (milestone) => {
        // Close popover when opening video dialog
        setHoveredMilestone(null);
        setPopoverAnchor(null);
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = null;
        }
        
        setSelectedMilestoneVideo(milestone);
        setVideoDialogOpen(true);
    };

    const handleCloseVideoDialog = () => {
        setVideoDialogOpen(false);
        setSelectedMilestoneVideo(null);
    };

    // Force close popover when clicking elsewhere
    const handleForceClosePopover = () => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
            popoverTimeoutRef.current = null;
        }
        setHoveredMilestone(null);
        setPopoverAnchor(null);
    };

    // Fetch shipping information
    const fetchShippingInfo = async () => {
        if (!orderDetail?.shippingCode) {
            setShippingInfoError('No shipping code available');
            return;
        }

        try {
            setShippingInfoLoading(true);
            setShippingInfoError(null);

            const response = await getShippingInfo(orderDetail.shippingCode);

            if (response && response.data && response.data.code === 200) {
                setShippingInfo(response.data.data);
            } else {
                setShippingInfoError('Failed to fetch shipping information');
            }
        } catch (error) {
            console.error('Error fetching shipping info:', error);
            setShippingInfoError('Error fetching shipping information');
        } finally {
            setShippingInfoLoading(false);
        }
    };

    // Calculate shipping fee
    const calculateShippingFee = async () => {
        try {
            setShippingFeeLoading(true);
            setShippingFeeError(null);

            // Get garment shipping UID from order detail
            const garmentShippingUID = orderDetail?.garment?.shippingUID;
            if (!garmentShippingUID) {
                setShippingFeeError('Shipping UID not found');
                return;
            }

            // Get school address from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const schoolAddress = user?.customer?.address;
            if (!schoolAddress) {
                setShippingFeeError('School address not found');
                return;
            }

            const response = await calculateFee(garmentShippingUID, schoolAddress);

            if (response && response.data.code === 200) {
                const totalShippingFee = response.data.data.total;
                setShippingFee(totalShippingFee);
            } else {
                setShippingFeeError('Failed to calculate shipping fee');
            }
        } catch (error) {
            console.error('Error calculating shipping fee:', error);
            setShippingFeeError('Error calculating shipping fee');
        } finally {
            setShippingFeeLoading(false);
        }
    };

    // Calculate remaining payment amount (excluding shipping fee)
    const getRemainingPaymentAmount = () => {
        if (!orderDetail?.price) return 0;
        const basePrice = orderDetail.price;
        const fee = getServiceFee();
        const depositAmount = getDepositAmount();
        return (basePrice + fee) - depositAmount;
    };

    // Fetch wallet balance
    const fetchWalletBalance = async () => {
        try {
            setLoadingWallet(true);
            const response = await getWalletBalance();
            if (response?.status === 200 && response.data?.body?.balance !== undefined) {
                setWalletBalance(response.data.body.balance);
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        } finally {
            setLoadingWallet(false);
        }
    };

    // Handle payment dialog
    const handleOpenPaymentDialog = () => {
        setPaymentDialogOpen(true);
        // Calculate shipping fee when opening payment dialog
        calculateShippingFee();
        // Fetch wallet balance
        fetchWalletBalance();
    };

    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
    };

    // Check if wallet has sufficient balance
    const hasInsufficientBalance = () => {
        if (paymentMethod !== 'wallet') return false;
        const totalAmount = getRemainingPaymentAmount() + shippingFee;
        return walletBalance < totalAmount;
    };

    // Handle confirm order dialog
    const handleOpenConfirmDialog = () => {
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        // Reset image states when closing dialog
        setDeliveryImage(null);
        setDeliveryImageUrl('');
        setImageUploadError('');
    };

    // Handle image upload
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setImageUploadError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setImageUploadError('Image size must be less than 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            setImageUploadError('');
            
            const imageUrl = await uploadCloudinary(file);
            setDeliveryImageUrl(imageUrl);
            setDeliveryImage(file);
            
        } catch (error) {
            console.error('Error uploading image:', error);
            setImageUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    // Remove uploaded image
    const handleRemoveImage = () => {
        setDeliveryImage(null);
        setDeliveryImageUrl('');
        setImageUploadError('');
    };

    // Handle confirm order process
    const handleConfirmOrder = async () => {
        // Validate delivery image is required
        if (!deliveryImageUrl) {
            setImageUploadError('Please upload a delivery image before confirming');
            return;
        }

        try {
            setConfirmingOrder(true);

            const data = {
                orderId: orderDetail.id,
                deliveryImage: deliveryImageUrl
            };

            const response = await confirmOrder(data);

            if (response && response.status === 200) {
                enqueueSnackbar('Order confirmed successfully! Thank you for your confirmation.', {
                    variant: 'success',
                    autoHideDuration: 4000
                });

                // Refresh order detail to get updated status
                await fetchOrderDetail(false);
                setConfirmDialogOpen(false);
            } else {
                enqueueSnackbar('Failed to confirm order. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            enqueueSnackbar('Error confirming order. Please try again.', {
                variant: 'error',
                autoHideDuration: 4000
            });
        } finally {
            setConfirmingOrder(false);
        }
    };

    // Handle payment process
    const handleProcessPayment = async () => {
        try {
            setProcessingPayment(true);

            const amount = getRemainingPaymentAmount() + shippingFee;
            const description = `Remaining payment for Order ${parseID(orderDetail.id, 'ord')}`;
            const orderType = 'order';
            const quotationId = orderDetail.quotationId || orderDetail.quotation?.id || orderDetail?.garmentQuotationId;
            const returnUrl = `/school/payment/result?quotationId=${quotationId}`;

            // Prepare payment details for PaymentResult component
            const paymentQuotationDetails = {
                quotation: {
                    id: orderDetail.quotationId || orderDetail.quotation?.id,
                    garmentId: orderDetail.garment?.id,
                    garment: {
                        customer: {
                            business: orderDetail.garment?.customer?.business,
                            name: orderDetail.garment?.customer?.name
                        },
                        shippingUID: orderDetail.garment?.shippingUID
                    }
                },
                order: {
                    id: orderDetail.id,
                    price: orderDetail.price
                },
                serviceFee: getServiceFee(),
                shippingFee: shippingFee,
                description: description,
                totalAmount: amount
            };

            // Set payment type and details in sessionStorage
            sessionStorage.setItem('currentPaymentType', 'order');
            sessionStorage.setItem('paymentQuotationDetails', JSON.stringify(paymentQuotationDetails));

            if (paymentMethod === 'wallet') {
                // Wallet payment flow
                localStorage.setItem('paymentMethod', 'wallet');
                
                const walletPaymentUrl = getPaymentUrlUsingWalletForOrder(amount, quotationId);
                
                setTimeout(() => {
                    window.location.href = walletPaymentUrl;
                }, 500);
            } else {
                // Gateway payment flow
                localStorage.setItem('paymentMethod', 'gateway');
                
                const response = await getPaymentUrl(amount, description, orderType, returnUrl);

                if (response && response.status === 200) {
                    // Redirect to payment URL
                    setTimeout(() => {
                        window.location.href = response.data.body.url;
                    }, 500);
                } else {
                    enqueueSnackbar('Failed to get payment URL', {variant: 'error'});
                    setProcessingPayment(false);
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            enqueueSnackbar('Error processing payment. Please try again.', {variant: 'error'});
            setProcessingPayment(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getServiceFee = () => {
        // Use serviceFee from API response if available
        if (orderDetail?.serviceFee !== undefined) {
            return orderDetail.serviceFee;
        }
        
        if (!orderDetail?.price) return 0;
        
        // Use serviceRate from business config if available, otherwise fallback to fixed serviceFee function
        if (businessConfig && businessConfig.serviceRate !== undefined) {
            return Math.round(orderDetail.price * businessConfig.serviceRate);
        }
        
        return serviceFee(orderDetail.price);
    };

    const getDepositAmount = () => {
        if (!orderDetail?.price) return 0;
        const totalAmount = orderDetail.price;
        const fee = getServiceFee();
        
        // Use depositRate from API response if available, otherwise default to 50%
        const depositRate = orderDetail?.depositRate !== undefined ? orderDetail.depositRate : 0.5;
        
        // New formula: subtotal * depositRate + fee
        return Math.round(totalAmount * depositRate + fee);
    };

    const getDepositRatePercentage = () => {
        const depositRate = orderDetail?.depositRate || 0.5;
        return Math.round(depositRate * 100);
    };

    const getTotalUniforms = () => {
        if (!orderDetail?.orderDetails) return 0;
        const totalItems = orderDetail.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
        return Math.ceil(totalItems / 2);
    };

    const getMilestones = () => {
        if (!orderDetail?.milestone || orderDetail.milestone.length === 0) {
            return [{
                title: 'Waiting for Milestones',
                description: 'Waiting for garment factory to assign production milestones',
                isCompleted: false,
                isActive: false,
                isNotStarted: true,
                startDate: null,
                endDate: null,
                completedDate: null,
                stage: 1,
                isWaiting: true
            }];
        }

        const startSewingPhase = {
            title: 'Start Sewing',
            description: 'Production begins with cutting and sewing',
            isCompleted: true,
            isActive: false,
            startDate: new Date().toISOString().split('T')[0],
            endDate: null,
            completedDate: new Date().toISOString().split('T')[0],
            stage: 1
        };

        const apiMilestones = orderDetail.milestone.map((milestone, index) => {
            const status = milestone.status || 'assigned';
            const isCompleted = status === 'completed';
            const isActive = status === 'processing';
            const isNotStarted = status === 'pending' || status === 'assigned';

            return {
                title: milestone.name || `Stage ${milestone.stage}`,
                description: milestone.description || `Production stage ${milestone.stage}`,
                isCompleted: isCompleted,
                isActive: isActive,
                isNotStarted: isNotStarted,
                startDate: milestone.startDate,
                endDate: milestone.endDate,
                completedDate: milestone.completedDate,
                stage: milestone.stage || (index + 2),
                videoUrl: milestone.videoUrl || null
            };
        });

        // Check if all API phases are completed and order is processing
        const allApiPhasesCompleted = apiMilestones.length > 0 && apiMilestones.every(phase => phase.isCompleted);
        // Add fixed phases at the end
        const deliveringPhase = {
            title: 'Delivering',
            description: 'Order is being shipped to your location',
            isCompleted: orderDetail.status === 'completed',
            isActive: orderDetail.status === 'delivering',
            isNotStarted: orderDetail.status !== 'delivering' && orderDetail.status !== 'completed',
            isPaymentRequired: orderDetail.status === 'processing' && allApiPhasesCompleted,
            startDate: shippingInfo?.pickup_time || null,
            endDate: shippingInfo?.leadtime || null,
            completedDate: orderDetail.status === 'completed' ? shippingInfo?.leadtime : null,
            stage: apiMilestones.length + 2
        };

        const completedPhase = {
            title: 'Completed',
            description: 'Order has been delivered successfully',
            isCompleted: orderDetail.status === 'completed',
            isActive: false,
            isNotStarted: orderDetail.status !== 'completed',
            startDate: null,
            endDate: null,
            completedDate: orderDetail.status === 'completed' ? (orderDetail.completedDate || shippingInfo?.leadtime) : null,
            stage: apiMilestones.length + 3
        };

        return [startSewingPhase, ...apiMilestones, deliveringPhase, completedPhase];
    };

    if (loading || businessConfigLoading) {
        return <LoadingState/>;
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    if (!orderDetail) {
        return <ErrorState error="Order not found" onRetry={handleRetry} isRetrying={isRetrying}/>;
    }
    
    const milestones = getMilestones();
    const filteredTransactions = Array.isArray(orderDetail.transactions)
        ? orderDetail.transactions.filter(t => t?.paymentType === 'order' || t?.paymentType === 'deposit')
        : [];

    return (
        <Box sx={{height: '100%', overflowY: 'auto', p: 3}}>
            <Box sx={{mb: 4}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <IconButton
                        onClick={handleGoBack}
                        sx={{mr: 2, color: '#2e7d32'}}
                    >
                        <ArrowBackIcon/>
                    </IconButton>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Order Management
                    </Typography>
                </Box>

                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: 'none',
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                    }
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2e7d32 0%, #388e3c 30%, #4caf50 60%, #66bb6a 100%)'
                    }}/>

                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(46, 125, 50, 0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(50px, -50px)'
                    }}/>

                    <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: {xs: 'wrap', md: 'nowrap'},
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                flex: 1,
                                minWidth: {xs: '100%', md: 'auto'}
                            }}>
                                <Box sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: '-2px',
                                        background: 'linear-gradient(135deg, #2e7d32, #4caf50, #2e7d32)',
                                        borderRadius: '22px',
                                        zIndex: -1,
                                        opacity: 0.3
                                    }
                                }}>
                                    <InventoryIcon sx={{color: 'white', fontSize: 32}}/>
                                </Box>

                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontSize: '0.75rem',
                                        mb: 1,
                                        display: 'block'
                                    }}>
                                        Order
                                    </Typography>
                                    <Typography variant="h4" sx={{
                                        fontWeight: 800,
                                        color: '#1e293b',
                                        fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2rem'},
                                        lineHeight: 1.2,
                                        background: 'linear-gradient(135deg, #1e293b 0%, #2e7d32 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontFamily: 'monospace',
                                        letterSpacing: '1px'
                                    }}>
                                        {parseID(orderDetail.id, 'ord')}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        mt: 0.5,
                                        fontSize: '0.875rem'
                                    }}>
                                        Track your order status and progress
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: {xs: 'flex-start', md: 'flex-end'},
                                gap: 2,
                                minWidth: {xs: '100%', md: 'auto'}
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: {xs: 'flex-start', md: 'flex-end'},
                                    gap: 1
                                }}>
                                    <Box sx={{
                                        transform: 'scale(1.1)',
                                        transformOrigin: {xs: 'left', md: 'right'}
                                    }}>
                                        {statusTag(orderDetail.status)}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>


                    </CardContent>
                </Card>

                {/* Cancel Reason Section - Full Width */}
                {orderDetail.status === 'canceled' && orderDetail.cancelReason && (
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: 'none',
                        borderRadius: 4,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                        }
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 30%, #b91c1c 60%, #991b1b 100%)'
                        }}/>

                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '150px',
                            height: '150px',
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
                            borderRadius: '50%',
                            transform: 'translate(30px, -30px)'
                        }}/>

                        <Box sx={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(-30px, -30px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}>
                                    <StopIcon sx={{color: 'white', fontSize: 24}}/>
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        fontSize: '1.25rem'
                                    }}>
                                        Order Cancelled
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: 500
                                    }}>
                                        This order has been cancelled
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                            <Box sx={{
                                p: 4,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                border: '2px solid rgba(239, 68, 68, 0.2)',
                                borderLeft: '6px solid #ef4444',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    mb: 3
                                }}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <StopIcon sx={{
                                            color: '#dc2626',
                                            fontSize: 28
                                        }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: '20px',
                                            color: '#dc2626',
                                            fontWeight: 700,
                                            display: 'block'
                                        }}>
                                            Cancellation Reason
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: '14px',
                                            color: '#7f1d1d',
                                            opacity: 0.8
                                        }}>
                                            This order was cancelled by the school
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)'
                                }}>
                                    <Typography sx={{
                                        fontSize: '16px',
                                        color: '#7f1d1d',
                                        lineHeight: 1.7,
                                        fontStyle: 'italic',
                                        display: 'block',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        "{orderDetail.cancelReason}"
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: 'none',
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                    }
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 30%, #8b5cf6 60%, #7c3aed 100%)'
                    }}/>

                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(-30px, -30px)'
                    }}/>

                    <Box sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        p: 3,
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
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                                <TrendingUpIcon sx={{color: 'white', fontSize: 24}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    Order Progress
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Track your order milestones
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                        {milestones.length === 1 && milestones[0].isWaiting ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 4,
                                textAlign: 'center'
                            }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <PendingIcon sx={{color: 'white', fontSize: 36}}/>
                                </Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    color: '#92400e',
                                    mb: 1
                                }}>
                                    Waiting for Garment Factory to Assign Milestones
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#64748b',
                                    maxWidth: 300,
                                    lineHeight: 1.6
                                }}>
                                    Waiting for production milestones to be assigned.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: 200,
                                    position: 'relative',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': {
                                        height: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                        }
                                    }
                                }}>
                                    {milestones.map((milestone, index) => (
                                        <React.Fragment key={index}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: 120,
                                                minHeight: 180,
                                                position: 'relative'
                                            }}>
                                                <Box sx={{position: 'relative'}}>
                                                    <Box
                                                        onMouseEnter={(e) => handleMilestoneHover(e, milestone)}
                                                        onMouseLeave={handleMilestoneLeave}
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '50%',
                                                            background: milestone.isCompleted
                                                                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                                                : milestone.isActive
                                                                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                                    : milestone.isPaymentRequired
                                                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                                        : milestone.isNotStarted
                                                                            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                                                                            : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: milestone.isCompleted
                                                                ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                                                                : milestone.isActive
                                                                    ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                                    : milestone.isPaymentRequired
                                                                        ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                                        : milestone.isNotStarted
                                                                            ? '0 4px 12px rgba(148, 163, 184, 0.3)'
                                                                            : '0 4px 12px rgba(148, 163, 184, 0.3)',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                boxShadow: milestone.isCompleted
                                                                    ? '0 8px 25px rgba(34, 197, 94, 0.4)'
                                                                    : milestone.isActive
                                                                        ? '0 8px 25px rgba(59, 130, 246, 0.4)'
                                                                        : milestone.isPaymentRequired
                                                                            ? '0 8px 25px rgba(239, 68, 68, 0.4)'
                                                                            : milestone.isNotStarted
                                                                                ? '0 8px 25px rgba(148, 163, 184, 0.4)'
                                                                                : '0 8px 25px rgba(148, 163, 184, 0.4)'
                                                            }
                                                        }}
                                                    >
                                                        {milestone.isCompleted ? (
                                                            <CheckCircleIcon sx={{color: 'white', fontSize: 28}}/>
                                                        ) : milestone.isActive ? (
                                                            <DesignServicesIcon sx={{color: 'white', fontSize: 28}}/>
                                                        ) : milestone.isPaymentRequired ? (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                        ) : milestone.isNotStarted ? (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                        ) : (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                        )}
                                                    </Box>

                                                    {/* Exclamation mark icon for Required Payment */}
                                                    {milestone.isPaymentRequired && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            right: -8,
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                                            border: '2px solid white',
                                                            zIndex: 1
                                                        }}>
                                                            <Typography sx={{
                                                                color: 'white',
                                                                fontSize: '14px',
                                                                fontWeight: 700,
                                                                lineHeight: 1
                                                            }}>
                                                                !
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Video icon for milestones with video */}
                                                    {milestone.videoUrl && milestone.isCompleted && (
                                                        <Box 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenVideoDialog(milestone);
                                                            }}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                                                                border: '2px solid white',
                                                                cursor: 'pointer',
                                                                zIndex: 2,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)',
                                                                    boxShadow: '0 6px 16px rgba(139, 92, 246, 0.6)'
                                                                }
                                                            }}
                                                        >
                                                            <VideocamIcon sx={{
                                                                color: 'white',
                                                                fontSize: '12px'
                                                            }} />
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem',
                                                    mt: 2,
                                                    textAlign: 'center',
                                                    maxWidth: 100,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {milestone.title}
                                                </Typography>

                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontSize: '0.75rem',
                                                    mt: 1
                                                }}>
                                                    Step {index + 1}
                                                </Typography>
                                            </Box>

                                            {index < milestones.length - 1 && (
                                                <Box sx={{
                                                    flex: 1,
                                                    height: 2,
                                                    background: milestone.isCompleted
                                                        ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                                        : milestone.isPaymentRequired
                                                            ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                                                            : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                                                    borderRadius: 1,
                                                    mx: 2,
                                                    minWidth: 40
                                                }}/>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mt: 2
                                }}>
                                    <Typography variant="body2" sx={{
                                        color: '#64748b',
                                        fontWeight: 500
                                    }}>
                                        Progress:
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        color: '#3b82f6',
                                        fontWeight: 700
                                    }}>
                                        {milestones.filter(m => m.isCompleted).length} / {milestones.length}
                                    </Typography>
                                </Box>

                                {/* Action Buttons Section */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                    mt: 3,
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Process to Payment Button - Show when Delivering phase needs payment */}
                                    {milestones.some(m => m.isPaymentRequired) && (
                                        <Button
                                            variant="contained"
                                            startIcon={<MoneyIcon/>}
                                            onClick={handleOpenPaymentDialog}
                                            sx={{
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Process to Payment
                                        </Button>
                                    )}

                                    {/* Confirm Receipt Button - Show when order is delivering and has pickup date */}
                                    {orderDetail.status === 'delivering' && shippingInfo?.pickup_time && (
                                        <Button
                                            variant="contained"
                                            startIcon={<CheckCircleIcon/>}
                                            onClick={handleOpenConfirmDialog}
                                            sx={{
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Confirm Receipt
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 4,
                flexDirection: {xs: 'column', lg: 'row'}
            }}>
                <Card sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 30%, #22c55e 70%, #16a34a 100%)'
                    }
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        p: 3,
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
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                                <InfoIcon sx={{color: 'white', fontSize: 20}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    Order Information
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Order details and timeline
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4}}>
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#1e293b',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <CalendarIcon sx={{fontSize: 20, color: '#3b82f6'}}/>
                                Order Basic Information
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(10px, -10px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <CalendarIcon sx={{color: 'white', fontSize: 16}}/>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Order Date
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {formatDate(orderDetail.orderDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        flex: 1,
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                        border: '1px solid rgba(239, 68, 68, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(10px, -10px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                            }}>
                                                <CalendarIcon sx={{color: 'white', fontSize: 16}}/>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Deadline
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {formatDate(orderDetail.deadline)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(10px, -10px)'
                                    }}/>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <LocationIcon sx={{color: 'white', fontSize: 16}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                fontSize: '0.7rem'
                                            }}>
                                                Delivery Address
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '0.9rem'
                                            }}>
                                                {orderDetail?.deliveryAddress || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                    border: '1px solid rgba(168, 85, 247, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(10px, -10px)'
                                    }}/>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                                        }}>
                                            <SchoolIcon sx={{color: 'white', fontSize: 16}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                fontSize: '0.7rem'
                                            }}>
                                                Total Uniforms
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '0.9rem'
                                            }}>
                                                {getTotalUniforms()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Payment summary moved here for delivering/completed */}
                                {(orderDetail.status === 'delivering' || orderDetail.status === 'completed') && (
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)'},
                                        gap: 3
                                    }}>
                                        {/* Base Price */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '50%',
                                                transform: 'translate(10px, -10px)'
                                            }}/>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        display: 'block',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        Base Price
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency(orderDetail.price)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Service Fee */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                            border: '1px solid rgba(245, 158, 11, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                borderRadius: '50%',
                                                transform: 'translate(10px, -10px)'
                                            }}/>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                                }}>
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        display: 'block',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        Service Fee
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency(orderDetail.serviceFee || 0)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Shipping Fee */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                            border: '1px solid rgba(16, 185, 129, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '50%',
                                                transform: 'translate(10px, -10px)'
                                            }}/>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                }}>
                                                    <LocalShippingIcon sx={{color: 'white', fontSize: 16}}/>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        display: 'block',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        Shipping Fee
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency(orderDetail.shippingFee || 0)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Total Price (Paid) */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                            border: '1px solid rgba(139, 92, 246, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                borderRadius: '50%',
                                                transform: 'translate(10px, -10px)'
                                            }}/>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                                }}>
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        fontWeight: 500,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        display: 'block',
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        Total Price (Paid)
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#8b5cf6',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency((orderDetail.price || 0) + (orderDetail.serviceFee || 0) + (orderDetail.shippingFee || 0))}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>


                        {orderDetail.note && (
                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                                border: '1px solid rgba(107, 114, 128, 0.15)',
                                borderLeft: '4px solid #6b7280'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        mt: 0.5,
                                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                                    }}>
                                        <InfoIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            mb: 1
                                        }}>
                                            Order Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#6b7280',
                                            lineHeight: 1.6,
                                            fontStyle: 'italic'
                                        }}>
                                            {orderDetail.note}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Card sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: 'none',
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                    }
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 30%, #0d9488 60%, #0f766e 100%)'
                    }}/>

                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)'
                    }}/>

                    <Box sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(-30px, -30px)'
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                                <GroupsIcon sx={{color: 'white', fontSize: 24}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    Garment Factory
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Manufacturing partner details
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            mb: 3,
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                        }}>
                            <Avatar
                                src={orderDetail.garment?.customer?.avatar}
                                referrerPolicy="no-referrer"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                                    border: '3px solid rgba(16, 185, 129, 0.2)',
                                    '& img': {
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%'
                                    }
                                }}
                            >
                                {orderDetail.garment?.customer?.business?.charAt(0)}
                            </Avatar>
                            <Box sx={{flex: 1}}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: '1.25rem',
                                    mb: 0.5
                                }}>
                                    {orderDetail.garment?.customer?.business}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#10b981',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {orderDetail.garment?.customer?.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                background: 'rgba(248, 250, 252, 0.8)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    transform: 'translateX(4px)'
                                }
                            }}>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <LocationIcon sx={{color: 'white', fontSize: 18}}/>
                                </Box>
                                <Box sx={{
                                    flex: 1
                                }}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}>
                                        Address
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#1e293b',
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}>
                                        {orderDetail.garment?.customer?.address}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                background: 'rgba(248, 250, 252, 0.8)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    transform: 'translateX(4px)'
                                }
                            }}>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <PhoneIcon sx={{color: 'white', fontSize: 18}}/>
                                </Box>
                                <Box sx={{
                                    flex: 1
                                }}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}>
                                        Phone
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#1e293b',
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}>
                                        {orderDetail.garment?.customer?.phone ? (
                                            <span
                                                style={{
                                                    color: '#10b981',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    fontWeight: '500'
                                                }}
                                                onClick={() => {
                                                    const phoneLink = getPhoneLink(orderDetail.garment.customer.phone);
                                                    window.open(phoneLink, '_blank');
                                                }}
                                            >
                                                {orderDetail.garment.customer.phone}
                                            </span>
                                        ) : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                background: 'rgba(248, 250, 252, 0.8)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    transform: 'translateX(4px)'
                                }
                            }}>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <EmailIcon sx={{color: 'white', fontSize: 18}}/>
                                </Box>
                                <Box sx={{
                                    flex: 1
                                }}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}>
                                        Email
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#1e293b',
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}>
                                        {orderDetail.garment?.customer?.account?.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Card sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 30%, #10b981 70%, #059669 100%)'
                }
            }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    p: 3,
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
                    }}/>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                        }}>
                            <MoneyIcon sx={{color: 'white', fontSize: 20}}/>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{
                                fontWeight: 700,
                                color: 'white',
                                fontSize: '1.25rem'
                            }}>
                                Payment Information
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500
                            }}>
                                Payment breakdown and financial details
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <CardContent sx={{p: 4}}>
                    {/* Transactions Section */}
                    {filteredTransactions.length > 0 && (
                        <Box sx={{mb: 4}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b'
                                }}>
                                    Transactions
                                </Typography>
                                <Chip
                                    label={`${filteredTransactions.length} transactions`}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#06b6d410',
                                        color: '#06b6d4',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: '1fr 1fr'
                                },
                                gap: 2
                            }}>
                                {[...filteredTransactions]
                                    .sort((a, b) => {
                                        const aPriority = a?.paymentType === 'deposit' ? 0 : 1;
                                        const bPriority = b?.paymentType === 'deposit' ? 0 : 1;
                                        if (aPriority !== bPriority) return aPriority - bPriority;
                                        return new Date(b.creationDate) - new Date(a.creationDate);
                                    })
                                    .map((transaction) => {
                                        const isReceiver = transaction?.receiver?.id === orderDetail?.school?.id;
                                        const otherParty = isReceiver ? transaction?.sender : transaction?.receiver;
                                        const isSuccess = transaction?.status === 'success';
                                        const paymentTypeLabel =
                                            transaction?.paymentType === 'design' ? 'Design Payment' :
                                            transaction?.paymentType === 'design_return' ? 'Design Refund' :
                                            transaction?.paymentType === 'order' ? 'Order Payment' :
                                            transaction?.paymentType === 'order_return' ? 'Order Refund' :
                                            transaction?.paymentType === 'deposit' ? 'Deposit' : (transaction?.paymentType || 'Payment');

                                        return (
                                            <Card
                                                key={transaction.id}
                                                elevation={0}
                                                sx={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 2,
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                        transform: 'translateY(-2px)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <CardContent sx={{p: 3}}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mb: 2
                                                    }}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: '50%',
                                                                backgroundColor: isReceiver ? '#dcfce7' : '#fef3c7'
                                                            }}>
                                                                <MoneyIcon sx={{color: isReceiver ? '#16a34a' : '#d97706'}}/>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{
                                                                    fontWeight: 600,
                                                                    color: '#1e293b'
                                                                }}>
                                                                    {paymentTypeLabel}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b'
                                                                }}>
                                                                    {isReceiver ? 'Received from' : 'Sent to'} {otherParty?.business || 'Unknown'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{textAlign: 'right'}}>
                                                            <Typography variant="h6" sx={{
                                                                fontWeight: 700,
                                                                color: isReceiver ? '#10b981' : '#ef4444'
                                                            }}>
                                                                {isReceiver ? '+' : '-'}{formatCurrency(transaction.amount + transaction.serviceFee)}
                                                            </Typography>
                                                            <Chip
                                                                label={isSuccess ? 'Successful' : 'Failed'}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                                                                    color: isSuccess ? '#166534' : '#dc2626',
                                                                    fontWeight: 600,
                                                                    fontSize: '11px',
                                                                    mt: 0.5
                                                                }}
                                                            />
                                                            {(() => {
                                                                const newBalance = isReceiver ? transaction?.remain?.receiver : transaction?.remain?.sender;
                                                                if (newBalance === undefined || newBalance === null || newBalance === -1) return null;
                                                                const isPending = !transaction.paymentGatewayCode.includes('w');
                                                                return (
                                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                                                                        <Chip
                                                                            size="small"
                                                                            label={`${isPending ? 'Pending' : 'Balance'}: ${formatCurrency(newBalance)}`}
                                                                            sx={{
                                                                                height: 22,
                                                                                fontSize: '11px',
                                                                                fontWeight: 600,
                                                                                color: '#111827',
                                                                                backgroundColor: '#f3f4f6',
                                                                                border: '1px solid #e5e7eb'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        pt: 2,
                                                        mt: 1,
                                                        borderTop: '1px solid #f1f5f9'
                                                    }}>
                                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                            {transaction.itemId && transaction.itemId !== 0 && (
                                                                <Box>
                                                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                                        {transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ? 'Request ID' : 'Order ID'}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ?
                                                                            parseID(transaction.itemId, 'dr') : 
                                                                            parseID(transaction.itemId, 'ord')}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ? '#f3e8ff' : '#e0f2fe',
                                                                            color: transaction.paymentType === 'design' ? '#7c3aed' : '#0369a1',
                                                                            fontWeight: 600,
                                                                            fontSize: '10px',
                                                                            height: '20px'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            )}
                                                            {transaction.serviceFee > 0 && (
                                                                <Box>
                                                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                                        Service Fee
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{
                                                                        color: '#f59e0b',
                                                                        fontWeight: 600,
                                                                        fontSize: '13px',
                                                                        mt: '0.5vh'
                                                                    }}>
                                                                        {formatCurrency(transaction.serviceFee)}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            <Box>
                                                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                                    Paid from
                                                                </Typography>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#0ea5b8',
                                                                    fontWeight: 600,
                                                                    fontSize: '13px',
                                                                    mt: '0.5vh'
                                                                }}>
                                                                    {transaction.paymentGatewayCode?.includes('w') ? 'Wallet' : 'VNPay'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <CalendarIcon sx={{color: '#64748b', fontSize: 16}}/>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontSize: '13px'}}>
                                                                {formatDateTimeSecond(transaction.creationDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </Box>
                        </Box>
                    )}

                    {orderDetail.status === 'processing' && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: {xs: 'column', md: 'row'},
                            gap: 2
                        }}>
                            <Box sx={{
                                flex: 1,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(10px, -10px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block',
                                            fontSize: '0.7rem'
                                        }}>
                                            Base Price
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '0.9rem'
                                        }}>
                                            {formatCurrency(orderDetail.price)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                border: '1px solid rgba(245, 158, 11, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(15px, -15px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 18}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Service Fee
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1rem'
                                        }}>
                                            {getServiceFee().toLocaleString('vi-VN')} VND
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.05) 0%, rgba(31, 41, 55, 0.05) 100%)',
                                border: '1px solid rgba(55, 65, 81, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(55, 65, 81, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(55, 65, 81, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(15px, -15px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(55, 65, 81, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 20}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Total Price
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1rem'
                                        }}>
                                            {formatCurrency(orderDetail.price + getServiceFee())}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                                border: '1px solid rgba(34, 197, 94, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(15px, -15px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 18}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Deposit ({getDepositRatePercentage()}% Total Price)
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1rem'
                                        }}>
                                            {formatCurrency(getDepositAmount())}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                border: '1px solid rgba(168, 85, 247, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(15px, -15px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 18}}/>
                                    </Box>
                                    <Box>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            mb: 1
                                        }}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Remaining
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                color: '#f59e0b',
                                                fontWeight: 500,
                                                fontSize: '0.6rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}>
                                                Excl. shipping fee
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#a855f7',
                                            fontSize: '1.1rem'
                                        }}>
                                            {formatCurrency(getRemainingPaymentAmount())}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {orderDetail.selectedDesign && (
                <Card sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)'
                    }
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '120px',
                            height: '120px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(40px, -40px)'
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                            }}>
                                <DesignServicesIcon sx={{color: 'white', fontSize: 24}}/>
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: {xs: '1.25rem', sm: '1.5rem'}
                                }}>
                                    Selected Design
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Approved design for your order
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4}}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'},
                            gap: 3,
                            mb: 4
                        }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(20px, -20px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                    }}>
                                        <DesignServicesIcon sx={{color: 'white', fontSize: 20}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Design Name
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1.1rem'
                                        }}>
                                            {orderDetail.selectedDesign.designRequest?.name || orderDetail.selectedDesign.name || 'Design Request'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(20px, -20px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }}>
                                        <CalendarIcon sx={{color: 'white', fontSize: 20}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Submit Date
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1.1rem'
                                        }}>
                                            {formatDate(orderDetail.selectedDesign.submitDate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(20px, -20px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Status
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#10b981',
                                            fontSize: '1.1rem'
                                        }}>
                                            Completed
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {orderDetail.selectedDesign.note && (
                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                borderLeft: '4px solid #f59e0b',
                                mb: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        mt: 0.5,
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                    }}>
                                        <InfoIcon sx={{color: 'white', fontSize: 18}}/>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: 600,
                                            color: '#92400e',
                                            fontSize: '1rem',
                                            mb: 1
                                        }}>
                                            Design Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#451a03',
                                            lineHeight: 1.6,
                                            fontSize: '0.9rem'
                                        }}>
                                            {orderDetail.selectedDesign.note}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <Box>
                            <OrderDetailTable order={orderDetail} />
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Dialog
                open={showQuantityDetailsDialog}
                onClose={handleCloseQuantityDetails}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <InfoIcon sx={{fontSize: 20}}/>
                    </Box>
                    Quantity Details
                </DialogTitle>

                <DialogContent sx={{p: 3}}>
                    {selectedQuantityDetails && (
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
                                            label={selectedQuantityDetails.category === 'pe' ? 'PE' : 'Regular'}
                                            size="small"
                                            sx={{
                                                backgroundColor: selectedQuantityDetails.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                color: selectedQuantityDetails.category === 'pe' ? '#065f46' : '#1e40af',
                                                fontWeight: 600
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
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <TableChartIcon sx={{color: 'white', fontSize: 20}}/>
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
                                            <Typography variant="subtitle2" sx={{fontWeight: 700, color: '#1e293b'}}>
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
                                            <Typography variant="subtitle2" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                Quantity
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {selectedQuantityDetails.sizes.sort((a, b) => {
                                        const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
                                        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                                    }).map((size) => (
                                        <Box key={size} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            borderBottom: '1px solid #e2e8f0',
                                            '&:last-child': {
                                                borderBottom: 'none'
                                            }
                                        }}>
                                            <Box sx={{
                                                p: 2,
                                                borderRight: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 600,
                                                    color: '#2e7d32',
                                                    fontSize: '16px'
                                                }}>
                                                    {size}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: '#2e7d32',
                                                    fontSize: '18px'
                                                }}>
                                                    {selectedQuantityDetails.quantities[size]}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Card>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={handleCloseQuantityDetails}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #0d4a14 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showImagesDialog}
                onClose={handleCloseImagesDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <InfoIcon sx={{fontSize: 20}}/>
                    </Box>
                    Item Images
                </DialogTitle>

                <DialogContent sx={{p: 3}}>
                    {selectedItemImages && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {selectedItemImages.type === 'shirt' && (
                                <Box sx={{
                                    p: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(46, 125, 50, 0.1)'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#2e7d32'}}>
                                        Logo Image
                                    </Typography>
                                    {selectedItemImages.logoImageUrl ? (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: 300,
                                            border: '2px dashed rgba(46, 125, 50, 0.3)',
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(46, 125, 50, 0.05)'
                                        }}>
                                            <DisplayImage
                                                imageUrl={selectedItemImages.logoImageUrl}
                                                alt="Logo"
                                                width="100%"
                                                height={300}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: 300,
                                            border: '2px dashed #d1d5db',
                                            borderRadius: 2,
                                            backgroundColor: '#f9fafb'
                                        }}>
                                            <Typography variant="body1" sx={{color: '#9ca3af', fontStyle: 'italic'}}>
                                                No Logo Image Available
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <Box sx={{
                                p: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                border: '1px solid rgba(46, 125, 50, 0.1)'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#2e7d32'}}>
                                    Design Images
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                    <Box sx={{flex: 1, minWidth: 250}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: '#10b981'}}>
                                            Front Design
                                        </Typography>
                                        {selectedItemImages.frontImageUrl ? (
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
                                                    imageUrl={selectedItemImages.frontImageUrl}
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
                                                <Typography variant="body2"
                                                            sx={{color: '#9ca3af', fontStyle: 'italic'}}>
                                                    No Front Design
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{flex: 1, minWidth: 250}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: '#8b5cf6'}}>
                                            Back Design
                                        </Typography>
                                        {selectedItemImages.backImageUrl ? (
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
                                                    imageUrl={selectedItemImages.backImageUrl}
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
                                                <Typography variant="body2"
                                                            sx={{color: '#9ca3af', fontStyle: 'italic'}}>
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

                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={handleCloseImagesDialog}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #0d4a14 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Popover
                open={Boolean(hoveredMilestone)}
                anchorEl={popoverAnchor}
                onClose={handleForceClosePopover}
                anchorOrigin={{
                    vertical: popoverPosition.vertical,
                    horizontal: popoverPosition.horizontal,
                }}
                transformOrigin={{
                    vertical: popoverPosition.vertical,
                    horizontal: popoverPosition.horizontal === 'right' ? 'left' : 'right',
                }}
                sx={{
                    pointerEvents: 'auto',
                    '& .MuiPopover-paper': {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                        maxWidth: 400,
                        minWidth: 350,
                        p: 0,
                        margin: 2,
                        pointerEvents: 'auto'
                    }
                }}
                disableRestoreFocus
                disableScrollLock
                onMouseEnter={handlePopoverMouseEnter}
                onMouseLeave={handlePopoverMouseLeave}
            >
                {hoveredMilestone && (
                    <Box sx={{p: 4}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            mb: 3
                        }}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: hoveredMilestone.isCompleted
                                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                    : hoveredMilestone.isActive
                                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                        : hoveredMilestone.isPaymentRequired
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: hoveredMilestone.isCompleted
                                    ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    : hoveredMilestone.isActive
                                        ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                                        : hoveredMilestone.isPaymentRequired
                                            ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                            : '0 4px 12px rgba(148, 163, 184, 0.3)'
                            }}>
                                {hoveredMilestone.isCompleted ? (
                                    <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                                ) : hoveredMilestone.isActive ? (
                                    <DesignServicesIcon sx={{color: 'white', fontSize: 20}}/>
                                ) : hoveredMilestone.isPaymentRequired ? (
                                    <PendingIcon sx={{color: 'white', fontSize: 20}}/>
                                ) : (
                                    <PendingIcon sx={{color: 'white', fontSize: 20}}/>
                                )}
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: '1.1rem'
                                }}>
                                    {hoveredMilestone.title}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Show loading state for shipping info when hovering over Delivering milestone */}
                        {hoveredMilestone.title === 'Delivering' && shippingInfoLoading && (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 3,
                                mb: 3
                            }}>
                                <CircularProgress size={24} sx={{color: '#3b82f6', mr: 1}}/>
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    Loading shipping information...
                                </Typography>
                            </Box>
                        )}

                        {/* Show shipping error if failed to load */}
                        {hoveredMilestone.title === 'Delivering' && shippingInfoError && (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 2,
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: '#fee2e2',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <Typography variant="body2" sx={{color: '#dc2626', fontSize: '0.9rem'}}>
                                    {shippingInfoError}
                                </Typography>
                            </Box>
                        )}

                        {(hoveredMilestone.startDate || hoveredMilestone.endDate || hoveredMilestone.completedDate || (hoveredMilestone.title === 'Delivering' && shippingInfo && (shippingInfo.pickup_time || shippingInfo.leadtime))) && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                mb: 3
                            }}>
                                {(hoveredMilestone.completedDate || (hoveredMilestone.title === 'Delivering' && orderDetail.status === 'completed' && shippingInfo?.leadtime) || (hoveredMilestone.title === 'Completed' && orderDetail.status === 'completed' && orderDetail.completedDate)) && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#dcfce7',
                                        border: '1px solid rgba(34, 197, 94, 0.2)'
                                    }}>
                                        <CheckCircleIcon sx={{color: '#16a34a', fontSize: 18}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#065f46',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem'
                                            }}>
                                                {hoveredMilestone.title === 'Delivering' ? 'Delivered' : 'Completed'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#065f46',
                                                fontWeight: 600
                                            }}>
                                                {(() => {
                                                    const completedDate = hoveredMilestone.completedDate || 
                                                        (hoveredMilestone.title === 'Completed' ? orderDetail.completedDate : null) ||
                                                        shippingInfo?.leadtime;
                                                    return formatDateTime(completedDate);
                                                })()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {(hoveredMilestone.startDate || (hoveredMilestone.title === 'Delivering' && (orderDetail.status === 'delivering' || orderDetail.status === 'completed') && shippingInfo?.pickup_time)) && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#fef3c7',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}>
                                        <CalendarIcon sx={{color: '#d97706', fontSize: 18}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#92400e',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem'
                                            }}>
                                                {hoveredMilestone.title === 'Delivering' ? 'Pickup Date' : 'Start Date'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#92400e',
                                                fontWeight: 600
                                            }}>
                                                {formatDate(hoveredMilestone.startDate || shippingInfo?.pickup_time)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {((hoveredMilestone.endDate && !hoveredMilestone.completedDate) || (hoveredMilestone.title === 'Delivering' && orderDetail.status === 'delivering' && shippingInfo?.leadtime)) && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#dbeafe',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}>
                                        <CalendarIcon sx={{color: '#2563eb', fontSize: 18}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#1e40af',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem'
                                            }}>
                                                {hoveredMilestone.title === 'Delivering' ? 'Expected Delivery' : 'End Date'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e40af',
                                                fontWeight: 600
                                            }}>
                                                {formatDate(hoveredMilestone.endDate || shippingInfo?.leadtime)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Pre-delivery Image for Delivering phase */}
                        {hoveredMilestone.title === 'Delivering' && orderDetail.preDeliveryImageUrl && (
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(10px, -10px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        <CloudUploadIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#059669',
                                        fontSize: '0.875rem'
                                    }}>
                                        Pre-delivery Image
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    border: '2px solid rgba(16, 185, 129, 0.4)'
                                }}>
                                    <img
                                        src={orderDetail.preDeliveryImageUrl}
                                        alt="Pre-delivery"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: 200,
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    mt: 1,
                                    display: 'block',
                                    textAlign: 'center'
                                }}>
                                    Image provided by garment before delivery
                                </Typography>
                            </Box>
                        )}

                        {/* Delivery Image for completed orders */}
                        {hoveredMilestone.title === 'Completed' && orderDetail.status === 'completed' && orderDetail.deliveryImage && (
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(10px, -10px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    }}>
                                        <CloudUploadIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#16a34a',
                                        fontSize: '0.875rem'
                                    }}>
                                        Delivery Confirmation
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    border: '2px solid #16a34a'
                                }}>
                                    <img
                                        src={orderDetail.deliveryImage}
                                        alt="Delivery confirmation"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: 200,
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    mt: 1,
                                    display: 'block',
                                    textAlign: 'center'
                                }}>
                                    Order delivery confirmed by customer
                                </Typography>
                            </Box>
                        )}

                        {/* Video Preview for completed milestones with video */}
                        {hoveredMilestone.videoUrl && hoveredMilestone.isCompleted && (
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(10px, -10px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                    }}>
                                        <VideocamIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#7c3aed',
                                        fontSize: '0.875rem'
                                    }}>
                                        Progress Video Available
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 120,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    cursor: 'pointer',
                                    '&:hover .play-overlay': {
                                        opacity: 1
                                    }
                                }}
                                onClick={() => handleOpenVideoDialog(hoveredMilestone)}
                                >
                                    <video
                                        src={hoveredMilestone.videoUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        muted
                                        preload="metadata"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <Box 
                                        className="play-overlay"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                        }}>
                                            <PlayArrowIcon sx={{color: '#8b5cf6', fontSize: 24}}/>
                                        </Box>
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    mt: 1,
                                    display: 'block',
                                    textAlign: 'center'
                                }}>
                                    Click to watch full video
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: hoveredMilestone.videoUrl && hoveredMilestone.isCompleted ? 2 : 0
                        }}>
                            <Chip
                                label={hoveredMilestone.isCompleted ? 'Completed' : hoveredMilestone.isActive ? 'Active' : hoveredMilestone.isPaymentRequired ? 'Required Payment' : hoveredMilestone.isNotStarted ? 'Not Started' : 'Pending'}
                                size="small"
                                sx={{
                                    backgroundColor: hoveredMilestone.isCompleted
                                        ? '#dcfce7'
                                        : hoveredMilestone.isActive
                                            ? '#dbeafe'
                                            : hoveredMilestone.isPaymentRequired
                                                ? '#fee2e2'
                                                : hoveredMilestone.isNotStarted
                                                    ? '#f1f5f9'
                                                    : '#f1f5f9',
                                    color: hoveredMilestone.isCompleted
                                        ? '#065f46'
                                        : hoveredMilestone.isActive
                                            ? '#1e40af'
                                            : hoveredMilestone.isPaymentRequired
                                                ? '#dc2626'
                                                : hoveredMilestone.isNotStarted
                                                    ? '#64748b'
                                                    : '#64748b',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Box>
                    </Box>
                )}
            </Popover>

            {/* Payment Dialog */}
            <Dialog
                open={paymentDialogOpen}
                onClose={handleClosePaymentDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MoneyIcon sx={{fontSize: 20}}/>
                    </Box>
                    Complete Payment
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 2}}>
                            Payment Required for Delivery
                        </Typography>
                        <Typography variant="body2" sx={{color: '#64748b', lineHeight: 1.6}}>
                            Please complete the remaining payment to proceed with delivery
                        </Typography>
                    </Box>

                    {/* Payment Method Selection */}
                    <Box sx={{
                        p: 3,
                        mb: 4,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                        }
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <CreditCardIcon style={{fontSize: '18px'}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{margin: 0, color: '#1e293b', fontWeight: 600}}>
                                    Payment Method
                                </Typography>
                                <Typography variant="body2" sx={{fontSize: '14px', color: '#64748b'}}>
                                    Choose how you want to pay
                                </Typography>
                            </Box>
                        </Box>

                        <Radio.Group 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{width: '100%'}}
                        >
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
                                {/* Gateway Payment Option */}
                                <Box sx={{
                                    p: 2,
                                    border: paymentMethod === 'gateway' ? '2px solid #2e7d32' : '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    backgroundColor: paymentMethod === 'gateway' ? 'rgba(46, 125, 50, 0.05)' : 'white',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}>
                                    <Radio value="gateway" style={{width: '100%', display: 'flex'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, width: '100%'}}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flex: 1}}>
                                                <CreditCardIcon style={{color: '#2e7d32', fontSize: '18px'}}/>
                                                <Box sx={{flex: 1}}>
                                                    <Typography variant="body1" sx={{color: '#1e293b', fontWeight: 600, fontSize: '16px'}}>
                                                        Payment Gateway
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px', display: 'block'}}>
                                                        Pay securely with VNPay, credit/debit cards, or bank transfer
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                minWidth: '120px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                marginLeft: 'auto'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#64748b',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    lineHeight: '1.2'
                                                }}>
                                                    Secure payment
                                                </Typography>
                                                <Box sx={{height: '16px'}} />
                                            </Box>
                                        </Box>
                                    </Radio>
                                </Box>

                                {/* Wallet Payment Option */}
                                <Box sx={{
                                    p: 2,
                                    border: paymentMethod === 'wallet' ? '2px solid #2e7d32' : '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    backgroundColor: paymentMethod === 'wallet' ? 'rgba(46, 125, 50, 0.05)' : 'white',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}>
                                    <Radio value="wallet" style={{width: '100%', display: 'flex'}}>
                                        <Box sx={{
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            width: '100%',
                                            gap: 2
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flex: 1}}>
                                                <WalletIcon style={{color: '#2e7d32', fontSize: '18px'}}/>
                                                <Box sx={{flex: 1}}>
                                                    <Typography variant="body1" sx={{color: '#1e293b', fontWeight: 600, fontSize: '16px'}}>
                                                        UniSew Wallet
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px', display: 'block'}}>
                                                        Pay instantly from your wallet balance
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                textAlign: 'right', 
                                                flexShrink: 0,
                                                minWidth: '120px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                marginLeft: '8vw'
                                            }}>
                                                {loadingWallet ? (
                                                    <Spin size="small"/>
                                                ) : (
                                                    <>
                                                        <Typography variant="body1" sx={{
                                                            color: hasInsufficientBalance() ? '#ef4444' : '#2e7d32',
                                                            fontWeight: 600,
                                                            fontSize: '16px',
                                                            display: 'block',
                                                            lineHeight: '1.2'
                                                        }}>
                                                            {walletBalance.toLocaleString('vi-VN')} VND
                                                        </Typography>
                                                        {hasInsufficientBalance() ? (
                                                            <Typography variant="caption" sx={{
                                                                color: '#ef4444',
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                lineHeight: '1.2'
                                                            }}>
                                                                Insufficient balance
                                                            </Typography>
                                                        ) : (
                                                            <Box sx={{height: '16px'}} />
                                                        )}
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </Radio>
                                </Box>
                            </Box>
                        </Radio.Group>
                    </Box>

                    {/* Payment Breakdown */}
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, mb: 4}}>
                        {/* Total Price */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(10px, -10px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'block',
                                        fontSize: '0.7rem'
                                    }}>
                                        Total Price (Incl. Service Fee)
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        fontSize: '1rem'
                                    }}>
                                        {formatCurrency((orderDetail?.price || 0) + getServiceFee())}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Deposit Amount (Already Paid) */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.1)',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(10px, -10px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}>
                                    <CheckCircleIcon sx={{color: 'white', fontSize: 16}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'block',
                                        fontSize: '0.7rem'
                                    }}>
                                        Deposit (Already Paid)
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        fontSize: '1rem'
                                    }}>
                                        {formatCurrency(getDepositAmount())}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Remaining Amount */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(10px, -10px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}>
                                    <MoneyIcon sx={{color: 'white', fontSize: 20}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'block',
                                        fontSize: '0.7rem'
                                    }}>
                                        Remaining Amount
                                    </Typography>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: '#dc2626',
                                        fontSize: '1.25rem'
                                    }}>
                                        {formatCurrency(getRemainingPaymentAmount())}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Shipping Fee */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(10px, -10px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <LocalShippingIcon sx={{color: 'white', fontSize: 18}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'block',
                                        fontSize: '0.7rem'
                                    }}>
                                        Shipping Fee
                                    </Typography>
                                    {shippingFeeLoading ? (
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <CircularProgress size={16} sx={{color: '#10b981'}}/>
                                            <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.9rem'}}>
                                                Calculating...
                                            </Typography>
                                        </Box>
                                    ) : shippingFeeError ? (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                            <Typography variant="body2" sx={{color: '#ef4444', fontSize: '0.9rem'}}>
                                                {shippingFeeError}
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={calculateShippingFee}
                                                disabled={shippingFeeLoading}
                                                sx={{
                                                    borderColor: '#10b981',
                                                    color: '#10b981',
                                                    fontSize: '0.75rem',
                                                    py: 0.25,
                                                    px: 1,
                                                    minWidth: 'auto',
                                                    '&:hover': {
                                                        borderColor: '#059669',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                                    }
                                                }}
                                            >
                                                Retry
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#10b981',
                                            fontSize: '1rem'
                                        }}>
                                            {formatCurrency(shippingFee)}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Total Need to Payment */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.1)',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(10px, -10px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                }}>
                                    <MoneyIcon sx={{color: 'white', fontSize: 18}}/>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'block',
                                        fontSize: '0.7rem'
                                    }}>
                                        Total Need to Payment
                                    </Typography>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: '#8b5cf6',
                                        fontSize: '1.25rem'
                                    }}>
                                        {formatCurrency(getRemainingPaymentAmount() + shippingFee)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Payment Note */}
                    <Box sx={{
                        p: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.15)',
                        borderLeft: '4px solid #f59e0b'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2
                        }}>
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mt: 0.5,
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                            }}>
                                <InfoIcon sx={{color: 'white', fontSize: 18}}/>
                            </Box>
                            <Box sx={{flex: 1}}>
                                <Typography variant="subtitle2" sx={{
                                    fontWeight: 600,
                                    color: '#92400e',
                                    fontSize: '1rem',
                                    mb: 1
                                }}>
                                    Payment Information
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#451a03',
                                    lineHeight: 1.6,
                                    fontSize: '0.9rem'
                                }}>
                                    You have already paid the deposit amount. This is the remaining balance required to
                                    complete your order and proceed with delivery. The shipping fee has been calculated
                                    based on your school's address and is included in the total amount.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleClosePaymentDialog}
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
                        onClick={handleProcessPayment}
                        disabled={processingPayment || hasInsufficientBalance()}
                        startIcon={!processingPayment ? (paymentMethod === 'wallet' ? <WalletIcon/> : <CreditCardIcon/>) : null}
                        sx={{
                            background: hasInsufficientBalance() ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': {
                                background: hasInsufficientBalance() ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            }
                        }}
                    >
                        {processingPayment ? (
                            <>
                                <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                Processing...
                            </>
                        ) : hasInsufficientBalance() ? (
                            'Insufficient Wallet Balance'
                        ) : (
                            `Proceed to Payment${paymentMethod === 'wallet' ? ' (Wallet)' : ' (Gateway)'}`
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Order Receipt Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircleIcon sx={{fontSize: 20}}/>
                    </Box>
                    Confirm Order Receipt
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    <Box sx={{textAlign: 'center', mb: 4, mt: 1}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b', mb: 2}}>
                            Have you received your order ?
                        </Typography>
                        <Typography variant="body1" sx={{color: '#64748b', lineHeight: 1.6, mb: 3}}>
                            Please confirm that you have received your order. This action will mark the order as completed.
                        </Typography>
                        
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.15)',
                            mb: 3
                        }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                color: '#16a34a',
                                mb: 1
                            }}>
                                Order: {parseID(orderDetail?.id, 'ord')}
                            </Typography>
                            {shippingInfo?.pickup_time && (
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    Picked up on: {formatDate(shippingInfo.pickup_time)}
                                </Typography>
                            )}
                        </Box>

                        {/* Delivery Image Upload Section */}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                            border: deliveryImageUrl ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(59, 130, 246, 0.15)',
                            mb: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 2
                            }}>
                                <CloudUploadIcon sx={{color: deliveryImageUrl ? '#16a34a' : '#3b82f6', fontSize: 20}}/>
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 600,
                                    color: deliveryImageUrl ? '#16a34a' : '#3b82f6',
                                    textAlign: 'left'
                                }}>
                                    Upload Delivery Image *
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{
                                color: '#64748b',
                                lineHeight: 1.6,
                                mb: 3,
                                textAlign: 'left'
                            }}>
                                Please upload a photo of the received order to confirm delivery
                            </Typography>

                            {!deliveryImageUrl ? (
                                <Box sx={{textAlign: 'center'}}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="delivery-image-upload"
                                        type="file"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                    <label htmlFor="delivery-image-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            disabled={uploadingImage}
                                            startIcon={uploadingImage ? <CircularProgress size={16}/> : <CloudUploadIcon/>}
                                            sx={{
                                                borderColor: '#3b82f6',
                                                color: '#3b82f6',
                                                '&:hover': {
                                                    borderColor: '#2563eb',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                                }
                                            }}
                                        >
                                            {uploadingImage ? 'Uploading...' : 'Choose Image'}
                                        </Button>
                                    </label>
                                </Box>
                            ) : (
                                <Box sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        position: 'relative',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        maxWidth: 300,
                                        border: '2px solid #16a34a'
                                    }}>
                                        <img
                                            src={deliveryImageUrl}
                                            alt="Delivery confirmation"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: 200,
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleRemoveImage}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(220, 38, 38, 0.9)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon sx={{fontSize: 16}}/>
                                        </IconButton>
                                    </Box>
                                    <Typography variant="caption" sx={{
                                        color: '#16a34a',
                                        fontWeight: 600
                                    }}>
                                        Image uploaded successfully
                                    </Typography>
                                </Box>
                            )}

                            {imageUploadError && (
                                <Box sx={{mt: 2}}>
                                    <Typography variant="body2" sx={{
                                        color: '#dc2626',
                                        fontWeight: 500,
                                        textAlign: 'center'
                                    }}>
                                        {imageUploadError}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.15)'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2
                            }}>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#dc2626',
                                        fontSize: '1rem',
                                        mb: 1,
                                        textAlign: 'left'
                                    }}>
                                        Warning
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#7f1d1d',
                                        lineHeight: 1.6,
                                        fontSize: '0.9rem',
                                        textAlign: 'left'
                                    }}>
                                        You are confirming receipt before the expected delivery date. This action will mark the order as completed. We will not be responsible for any issues related to the shipping process.
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Checkbox
                                    checked={confirmAcknowledge}
                                    onChange={(e) => setConfirmAcknowledge(e.target.checked)}
                                    sx={{ p: 0.5 }}
                                />
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    I have read and understood the warning above. I confirm that I have received the order.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseConfirmDialog}
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
                        onClick={handleConfirmOrder}
                        disabled={confirmingOrder || !deliveryImageUrl || uploadingImage || !confirmAcknowledge}
                        sx={{
                            background: (!deliveryImageUrl || uploadingImage) 
                                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '&:hover': {
                                background: (!deliveryImageUrl || uploadingImage)
                                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            }
                        }}
                    >
                        {confirmingOrder ? (
                            <>
                                <CircularProgress size={16} sx={{color: 'white', mr: 1}}/>
                                Confirming...
                            </>
                        ) : uploadingImage ? (
                            'Uploading Image...'
                        ) : !deliveryImageUrl ? (
                            'Upload Image Required'
                        ) : !confirmAcknowledge ? (
                            'Please acknowledge the warning'
                        ) : (
                            'Yes, I Received My Order'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Dialog */}
            <Dialog
                open={videoDialogOpen}
                onClose={handleCloseVideoDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden',
                        backgroundColor: '#000'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 3
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <VideocamIcon sx={{fontSize: 20}}/>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{fontWeight: 700, fontSize: '1.25rem'}}>
                                {selectedMilestoneVideo?.title || 'Milestone Progress'}
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                            }}>
                                Production progress video
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleCloseVideoDialog}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 0, backgroundColor: '#000'}}>
                    {selectedMilestoneVideo?.videoUrl && (
                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            paddingBottom: '56.25%', // 16:9 aspect ratio
                            height: 0,
                            overflow: 'hidden'
                        }}>
                            <video
                                controls
                                autoPlay
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                src={selectedMilestoneVideo.videoUrl}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </Box>
                    )}
                </DialogContent>

                <Box sx={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    p: 3
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                            }}>
                                <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: '1rem'
                                }}>
                                    Stage {selectedMilestoneVideo?.stage || 1} Completed
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#64748b',
                                    fontSize: '0.875rem'
                                }}>
                                    {selectedMilestoneVideo?.description || 'Production milestone completed successfully'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {selectedMilestoneVideo?.completedDate && (
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                ml: 'auto'
                            }}>
                                <Typography variant="caption" sx={{
                                    color: '#64748b',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    display: 'block',
                                    fontSize: '0.7rem'
                                }}>
                                    Completed Date
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: 700,
                                    color: '#7c3aed',
                                    fontSize: '0.875rem'
                                }}>
                                    {formatDate(selectedMilestoneVideo.completedDate)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}