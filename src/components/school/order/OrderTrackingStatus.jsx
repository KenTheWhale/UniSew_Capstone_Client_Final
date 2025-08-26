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
    Divider,
    Grid,
    IconButton,
    Popover,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    DesignServices as DesignServicesIcon,
    Email as EmailIcon,
    Groups as GroupsIcon,
    Info as InfoIcon,
    LocalShipping as LocalShippingIcon,
    LocationOn as LocationIcon,
    Pending as PendingIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    ShoppingCart as ShoppingCartIcon,
    TableChart as TableChartIcon,
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {getOrderDetailBySchool} from '../../../services/OrderService';
import {parseID} from '../../../utils/ParseIDUtil';
import {useSnackbar} from 'notistack';
import DisplayImage from '../../ui/DisplayImage';
import {serviceFee} from '../../../configs/FixedVariables';

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
    const [popoverPosition, setPopoverPosition] = useState({ vertical: 'center', horizontal: 'right' });

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

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const handleRetry = () => {
        setIsRetrying(true);
        fetchOrderDetail();
    };

    const handleGoBack = () => {
        navigate('/school/order');
    };

    const handleOpenQuantityDetails = (groupedItem) => {
        setSelectedQuantityDetails(groupedItem);
        setShowQuantityDetailsDialog(true);
    };

    const handleCloseQuantityDetails = () => {
        setShowQuantityDetailsDialog(false);
        setSelectedQuantityDetails(null);
    };

    const handleViewImages = (groupedItem) => {
        setSelectedItemImages(groupedItem);
        setShowImagesDialog(true);
    };

    const handleCloseImagesDialog = () => {
        setShowImagesDialog(false);
        setSelectedItemImages(null);
    };

    const handleMilestoneHover = (event, milestone) => {
        setHoveredMilestone(milestone);
        setPopoverAnchor(event.currentTarget);

        const rect = event.currentTarget.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const spaceOnRight = windowWidth - rect.right;
        const spaceOnLeft = rect.left;

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

        setPopoverPosition({ vertical, horizontal });
    };

    const handleMilestoneLeave = () => {
        setHoveredMilestone(null);
        setPopoverAnchor(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getServiceFee = () => {
        if (!orderDetail?.price) return 0;
        return serviceFee(orderDetail.price);
    };

    const getDepositAmount = () => {
        if (!orderDetail?.price) return 0;
        const totalAmount = orderDetail.price;
        const fee = getServiceFee();
        return (totalAmount + fee) * 0.5;
    };

    const getRemainingAmount = () => {
        if (!orderDetail?.price) return 0;
        const totalAmount = orderDetail.price;
        const fee = getServiceFee();
        const deposit = getDepositAmount();
        return (totalAmount + fee) - deposit;
    };

    const getTotalUniforms = () => {
        if (!orderDetail?.orderDetails) return 0;
        const totalItems = orderDetail.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
        return Math.ceil(totalItems / 2);
    };

    const getSizeBreakdown = () => {
        if (!orderDetail?.orderDetails) return {};

        const sizeBreakdown = {};
        orderDetail.orderDetails.forEach(detail => {
            const size = detail.size;
            if (!sizeBreakdown[size]) {
                sizeBreakdown[size] = 0;
            }
            sizeBreakdown[size] += detail.quantity;
        });

        return sizeBreakdown;
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
                stage: milestone.stage || (index + 2)
            };
        });

        const deliveringPhase = {
            title: 'Delivering',
            description: 'Order is being shipped to your location',
            isCompleted: false,
            isActive: false,
            isNotStarted: true,
            startDate: null,
            endDate: null,
            completedDate: null,
            stage: apiMilestones.length + 2
        };

        const completedPhase = {
            title: 'Completed',
            description: 'Order has been delivered successfully',
            isCompleted: false,
            isActive: false,
            isNotStarted: true,
            startDate: null,
            endDate: null,
            completedDate: null,
            stage: apiMilestones.length + 3
        };

        return [startSewingPhase, ...apiMilestones, deliveringPhase, completedPhase];
    };

    if (loading) {
        return <LoadingState/>;
    }

    if (error) {
        return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    if (!orderDetail) {
        return <ErrorState error="Order not found" onRetry={handleRetry} isRetrying={isRetrying}/>;
    }

    const sizeBreakdown = getSizeBreakdown();
    const milestones = getMilestones();

    return (
        <Box sx={{height: '100%', overflowY: 'auto', p: 3}}>
            {}
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

                {}
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
                    {}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2e7d32 0%, #388e3c 30%, #4caf50 60%, #66bb6a 100%)'
                    }}/>

                    {}
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
                            {}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                flex: 1,
                                minWidth: {xs: '100%', md: 'auto'}
                            }}>
                                {}
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

                                {}
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

                            {}
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

                {}
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
                    {}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 30%, #8b5cf6 60%, #7c3aed 100%)'
                    }}/>

                    {}
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

                    {}
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
                                {}
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
                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: 120,
                                                minHeight: 180,
                                                position: 'relative'
                                            }}>
                                                {}
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
                                                                : milestone.isNotStarted
                                                                    ? '0 4px 12px rgba(148, 163, 184, 0.3)'
                                                                    : '0 4px 12px rgba(148, 163, 184, 0.3)',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            boxShadow: milestone.isCompleted
                                                                ? '0 8px 25px rgba(34, 197, 94, 0.4)'
                                                                : milestone.isActive
                                                                    ? '0 8px 25px rgba(59, 130, 246, 0.4)'
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
                                            ) : milestone.isNotStarted ? (
                                                <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                            ) : (
                                                <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                            )}
                                                </Box>

                                                {}
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

                                                {}
                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontSize: '0.75rem',
                                                    mt: 1
                                                }}>
                                                    Step {index + 1}
                                                </Typography>
                                            </Box>

                                            {}
                                            {index < milestones.length - 1 && (
                                                <Box sx={{
                                                    flex: 1,
                                                    height: 2,
                                                    background: milestone.isCompleted
                                                        ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                                        : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                                                    borderRadius: 1,
                                                    mx: 2,
                                                    minWidth: 40
                                                }}/>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>

                                {}
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
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {}
            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 4,
                flexDirection: {xs: 'column', lg: 'row'}
            }}>
                {}
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
                    {}
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
                        {}
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

                            {}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                            }}>
                                {}
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2
                            }}>
                                {}
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

                                {}
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

                                {}
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
                            </Box>
                        </Box>



                        {}
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

                {}
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
                    {}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 30%, #0d9488 60%, #0f766e 100%)'
                    }}/>

                    {}
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

                    {}
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
                        {}
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

                        {}
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
                                        {orderDetail.garment?.customer?.phone}
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

            {}
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
                {}
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
                    {orderDetail.status === 'processing' ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: {xs: 'column', md: 'row'},
                            gap: 2
                        }}>
                            {}
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

                            {}
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
                                            {formatCurrency(getServiceFee())}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {}
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

                            {}
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
                                            Deposit (50% Total Price)
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
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                                border: '1px solid rgba(34, 197, 94, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                minWidth: 300,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
                                }
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(34, 197, 94, 0.1)',
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
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
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
                                            Base Price
                                        </Typography>
                                        <Typography variant="h5" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '1.25rem'
                                        }}>
                                            {formatCurrency(orderDetail.price)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {}
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
                {}
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
                    {}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'},
                        gap: 3,
                        mb: 4
                    }}>
                        {}
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

                        {}
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

                        {}
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

                    {}
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

                    {}
                    <Box>
                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 2}}>
                            Order Items Breakdown
                        </Typography>
                        <Box sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                            {}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                width: '100%'
                            }}>
                                {}
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

                                {}
                                {(() => {
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

                                    const groupedItems = groupItemsByCategory(orderDetail.orderDetails || []);

                                    return groupedItems.map((groupedItem, index) => (
                                        <React.Fragment
                                            key={`${groupedItem.category}-${groupedItem.gender}-${groupedItem.type}-${index}`}>
                                            {}
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

                                            {}
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

                                            {}
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

                                            {}
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
                                                    {groupedItem.sizes.sort((a, b) => {
                                                        const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
                                                        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                                                    }).join(', ')}
                                                </Typography>
                                            </Box>

                                            {}
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
                                                    startIcon={<InfoIcon/>}
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
                                                    View
                                                </Button>
                                            </Box>

                                            {}
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
                                                    backgroundColor: groupedItem.color || '#000',
                                                    borderRadius: 0.5,
                                                    border: '1px solid #e5e7eb'
                                                }}/>
                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontSize: '12px'
                                                }}>
                                                    {groupedItem.color || '#000'}
                                                </Typography>
                                            </Box>

                                            {}
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
                                                    const logoPosition = groupedItem.logoPosition;
                                                    const logoHeight = groupedItem.baseLogoHeight || 0;
                                                    const logoWidth = groupedItem.baseLogoWidth || 0;

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

                                            {}
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
                                                    onClick={() => handleViewImages(groupedItem)}
                                                    startIcon={<InfoIcon/>}
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
                                    ));
                                })()}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            )}



    {
    }
    {
        orderDetail.shippingCode && (
            <Card sx={{mt: 3, border: '1px solid #e2e8f0'}}>
                <CardContent>
                    <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', mb: 2}}>
                        Shipping Information
                    </Typography>
                    <Typography variant="body1" sx={{color: '#64748b'}}>
                        Tracking Code: {orderDetail.shippingCode}
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    {}
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
                    {}
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

                    {}
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

    {}
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
                    {}
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

                    {}
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
                            {}
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
                                        <Typography variant="body2" sx={{color: '#9ca3af', fontStyle: 'italic'}}>
                                            No Front Design
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {}
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
                                        <Typography variant="body2" sx={{color: '#9ca3af', fontStyle: 'italic'}}>
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

    {}
    <Popover
        open={Boolean(hoveredMilestone)}
        anchorEl={popoverAnchor}
        onClose={handleMilestoneLeave}
        anchorOrigin={{
            vertical: popoverPosition.vertical,
            horizontal: popoverPosition.horizontal,
        }}
        transformOrigin={{
            vertical: popoverPosition.vertical,
            horizontal: popoverPosition.horizontal === 'right' ? 'left' : 'right',
        }}
        sx={{
            pointerEvents: 'none',
            '& .MuiPopover-paper': {
                borderRadius: 3,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                maxWidth: 400,
                minWidth: 350,
                p: 0,
                margin: 2
            }
        }}
        disableRestoreFocus
        disableScrollLock
    >
        {hoveredMilestone && (
            <Box sx={{p: 4}}>
                {}
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
                                : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: hoveredMilestone.isCompleted
                            ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                            : hoveredMilestone.isActive
                                ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                                : '0 4px 12px rgba(148, 163, 184, 0.3)'
                    }}>
                        {hoveredMilestone.isCompleted ? (
                            <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                        ) : hoveredMilestone.isActive ? (
                            <DesignServicesIcon sx={{color: 'white', fontSize: 20}}/>
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

                {}
                {(hoveredMilestone.startDate || hoveredMilestone.endDate || hoveredMilestone.completedDate) && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mb: 3
                    }}>
                        {hoveredMilestone.completedDate && (
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
                                        Completed
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#065f46',
                                        fontWeight: 600
                                    }}>
                                        {formatDate(hoveredMilestone.completedDate)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {hoveredMilestone.startDate && (
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
                                        Start Date
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#92400e',
                                        fontWeight: 600
                                    }}>
                                        {formatDate(hoveredMilestone.startDate)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {hoveredMilestone.endDate && !hoveredMilestone.completedDate && (
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
                                        End Date
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#1e40af',
                                        fontWeight: 600
                                    }}>
                                        {formatDate(hoveredMilestone.endDate)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Chip
                        label={hoveredMilestone.isCompleted ? 'Completed' : hoveredMilestone.isActive ? 'Active' : hoveredMilestone.isNotStarted ? 'Not Started' : 'Pending'}
                        size="small"
                        sx={{
                            backgroundColor: hoveredMilestone.isCompleted
                                ? '#dcfce7'
                                : hoveredMilestone.isActive
                                    ? '#dbeafe'
                                    : hoveredMilestone.isNotStarted
                                        ? '#f1f5f9'
                                        : '#f1f5f9',
                            color: hoveredMilestone.isCompleted
                                ? '#065f46'
                                : hoveredMilestone.isActive
                                    ? '#1e40af'
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
        </Box>
    );
}