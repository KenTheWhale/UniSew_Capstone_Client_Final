import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
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
    Info as InfoIcon,
    LocalShipping as LocalShippingIcon,
    LocationOn as LocationIcon,
    Pending as PendingIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {getOrderDetailBySchool} from '../../../services/OrderService';
import {parseID} from '../../../utils/ParseIDUtil';
import {useSnackbar} from 'notistack';

// Status Tag Component
const statusTag = (status) => {
    let color;
    let icon = null;
    switch (status) {
        case 'pending':
            color = 'warning';
            icon = <PendingIcon/>;
            break;
        case 'processing':
            color = 'info';
            icon = <TrendingUpIcon/>;
            break;
        case 'delivering':
            color = 'primary';
            icon = <LocalShippingIcon/>;
            break;
        case 'completed':
            color = 'success';
            icon = <CheckCircleIcon/>;
            break;
        case 'cancelled':
            color = 'error';
            icon = <CancelIcon/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Chip icon={icon} label={status} color={color} variant="outlined"/>;
};

// Loading State Component
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

// Error State Component
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

    // Lấy orderId từ sessionStorage
    const orderId = sessionStorage.getItem('trackingOrderId');

    // Fetch order details
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

    // Tính toán tổng số lượng uniforms
    const getTotalUniforms = () => {
        if (!orderDetail?.orderDetails) return 0;
        const totalItems = orderDetail.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
        return Math.ceil(totalItems / 2); // Mỗi uniform gồm 2 items (áo + quần)
    };

    // Tính toán tổng số lượng theo size
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

    // Định nghĩa các bước trong quy trình
    const getSteps = () => {
        const steps = [
            {
                label: 'Order Placed',
                description: 'Order has been successfully placed and confirmed',
                icon: <ShoppingCartIcon/>,
                completed: true
            },
            {
                label: 'Design Approved',
                description: 'Design has been approved and selected',
                icon: <DesignServicesIcon/>,
                completed: orderDetail?.selectedDesign ? true : false
            },
            {
                label: 'Production Started',
                description: 'Manufacturing process has begun',
                icon: <TrendingUpIcon/>,
                completed: orderDetail?.status === 'processing' || orderDetail?.status === 'delivering' || orderDetail?.status === 'completed'
            },
            {
                label: 'Quality Check',
                description: 'Products are being quality checked',
                icon: <CheckCircleIcon/>,
                completed: orderDetail?.status === 'delivering' || orderDetail?.status === 'completed'
            },
            {
                label: 'Shipping',
                description: 'Order is being delivered to your school',
                icon: <LocalShippingIcon/>,
                completed: orderDetail?.status === 'delivering' || orderDetail?.status === 'completed'
            },
            {
                label: 'Delivered',
                description: 'Order has been successfully delivered',
                icon: <CheckCircleIcon/>,
                completed: orderDetail?.status === 'completed'
            }
        ];
        return steps;
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
    const steps = getSteps();

    return (
        <Box sx={{height: '100%', overflowY: 'auto', p: 3}}>
            {/* Header */}
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
                        Order Tracking
                    </Typography>
                </Box>

                {/* Order ID & Status Card */}
                <Card sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #2e7d32 0%, #1b5e20 100%)'
                    }
                }}>
                    <CardContent sx={{p: 3}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: {xs: 'wrap', sm: 'nowrap'},
                            gap: 2
                        }}>
                            {/* Order ID Section */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flex: 1
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
                                }}>
                                    <InventoryIcon sx={{color: 'white', fontSize: 24}} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        mb: 0.5,
                                        display: 'block'
                                    }}>
                                        Order ID
                                    </Typography>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        fontSize: {xs: '1.25rem', sm: '1.5rem'}
                                    }}>
                                        {parseID(orderDetail.id, 'ord')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Status Section */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexShrink: 0
                            }}>
                                <Box sx={{textAlign: 'right'}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        {statusTag(orderDetail.status)}
                                    </Box>
                                </Box>

                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Box sx={{display: 'flex', gap: 3, mb: 3, flexWrap: {xs: 'wrap', md: 'nowrap'}}}>
                    {/* Order Information Card */}
                    <Card sx={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                        }
                    }}>
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                    <CalendarIcon sx={{color: 'white', fontSize: 20}} />
                                </Box>
                                <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                    Order Information
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {/* First Row - 3 Items */}
                                <Box sx={{display: 'flex', gap: 2, flexWrap: {xs: 'wrap', md: 'nowrap'}}}>
                                    {/* Order Date */}
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                                        }}>
                                            <CalendarIcon sx={{color: 'white', fontSize: 18}} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Order Date
                                            </Typography>
                                            <Typography variant="body1" sx={{fontWeight: 600, color: '#1e293b'}}>
                                                {formatDate(orderDetail.orderDate)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Deadline */}
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                        border: '1px solid rgba(239, 68, 68, 0.1)'
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <CalendarIcon sx={{color: 'white', fontSize: 18}} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Deadline
                                            </Typography>
                                            <Typography variant="body1" sx={{fontWeight: 600, color: '#1e293b'}}>
                                                {formatDate(orderDetail.deadline)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Total Uniforms */}
                                    <Box sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                        border: '1px solid rgba(168, 85, 247, 0.1)'
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)'
                                        }}>
                                            <InventoryIcon sx={{color: 'white', fontSize: 18}} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Total Uniforms
                                            </Typography>
                                            <Typography variant="body1" sx={{fontWeight: 600, color: '#1e293b'}}>
                                                {getTotalUniforms()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Note */}
                                {orderDetail.note && (
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                                        border: '1px solid rgba(107, 114, 128, 0.1)'
                                    }}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <InfoIcon sx={{fontSize: 16, color: '#6b7280'}} />
                                            Note
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#64748b',
                                            fontStyle: 'italic',
                                            lineHeight: 1.6
                                        }}>
                                            {orderDetail.note}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Payment Information Card */}
                    <Card sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                        }
                    }}>
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}>
                                    <MoneyIcon sx={{color: 'white', fontSize: 20}} />
                                </Box>
                                <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                    Payment Information
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {/* Total Amount */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)',
                                    border: '1px solid rgba(34, 197, 94, 0.1)'
                                }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2,
                                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                                    }}>
                                        <MoneyIcon sx={{color: 'white', fontSize: 18}} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            Total Amount
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {formatCurrency(orderDetail.price)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Selected Design */}
            {orderDetail.selectedDesign && (
                <Card sx={{mb: 3, border: '1px solid #e2e8f0'}}>
                    <CardContent>
                        <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', mb: 3}}>
                            Selected Design
                        </Typography>
                        
                        {/* Basic Information */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                Design Name: {orderDetail.selectedDesign.name}
                            </Typography>
                            <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                Submit Date: {formatDate(orderDetail.selectedDesign.submitDate)}
                            </Typography>
                            {orderDetail.selectedDesign.note && (
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    Note: {orderDetail.selectedDesign.note}
                                </Typography>
                            )}
                        </Box>

                        {/* Order Items with Size Breakdown */}
                        <Box>
                            <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 2}}>
                                Order Items Breakdown
                            </Typography>
                            <Box sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Excel-Style Table */}
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    width: '100%'
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
                                    
                                    {/* Data Rows */}
                                    {orderDetail.orderDetails?.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <Box sx={{
                                                p: 2,
                                                borderRight: '1px solid #000000',
                                                borderBottom: '1px solid #000000',
                                                backgroundColor: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Chip
                                                    label={item.deliveryItem?.designItem?.category === 'pe' ? 'PE' : 'Regular'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: item.deliveryItem?.designItem?.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                        color: item.deliveryItem?.designItem?.category === 'pe' ? '#065f46' : '#1e40af',
                                                        fontWeight: 600,
                                                        fontSize: '11px',
                                                        height: 20,
                                                        order: item.deliveryItem?.designItem?.category === 'pe' ? 2 : 1
                                                    }}
                                                />
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
                                                    color: '#374151',
                                                    fontSize: '13px',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {item.deliveryItem?.designItem?.gender === 'boy' ? 'Boy' : 
                                                     item.deliveryItem?.designItem?.gender === 'girl' ? 'Girl' : 
                                                     item.deliveryItem?.designItem?.gender || 'Unknown'}
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
                                                    color: '#374151',
                                                    fontSize: '13px',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {item.deliveryItem?.designItem?.type || 'Item'}
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
                                                    {item.size || 'M'}
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
                                                    {item.quantity || 0}
                                                </Typography>
                                            </Box>
                                            
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
                                            
                                            <Box sx={{
                                                p: 2,
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
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Grid container spacing={3}>
                {/* Progress Tracking */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{border: '1px solid #e2e8f0'}}>
                        <CardContent>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', mb: 3}}>
                                Order Progress
                            </Typography>
                            <Stepper orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={index} active={step.completed} completed={step.completed}>
                                        <StepLabel
                                            icon={step.icon}
                                            sx={{
                                                '& .MuiStepLabel-iconContainer': {
                                                    color: step.completed ? '#2e7d32' : '#94a3b8'
                                                }
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                {step.label}
                                            </Typography>
                                        </StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" sx={{color: '#64748b', mt: 1}}>
                                                {step.description}
                                            </Typography>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Garment Information */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{border: '1px solid #e2e8f0', mb: 3}}>
                        <CardContent>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', mb: 2}}>
                                Garment Factory Information
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <Avatar
                                    src={orderDetail.garment?.customer?.avatar}
                                    referrerPolicy="no-referrer"
                                    sx={{
                                        width: 50, 
                                        height: 50, 
                                        mr: 2,
                                        '& img': {
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: '100%'
                                        }
                                    }}
                                >
                                    {orderDetail.garment?.customer?.business?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                        {orderDetail.garment?.customer?.business}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        {orderDetail.garment?.customer?.name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{my: 2}}/>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                <LocationIcon sx={{fontSize: 16, mr: 1, color: '#64748b'}}/>
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    {orderDetail.garment?.customer?.address}
                                </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                <PhoneIcon sx={{fontSize: 16, mr: 1, color: '#64748b'}}/>
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    {orderDetail.garment?.customer?.phone}
                                </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <EmailIcon sx={{fontSize: 16, mr: 1, color: '#64748b'}}/>
                                <Typography variant="body2" sx={{color: '#64748b'}}>
                                    {orderDetail.garment?.customer?.account?.email}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Size Breakdown */}
                    <Card sx={{border: '1px solid #e2e8f0'}}>
                        <CardContent>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', mb: 2}}>
                                Size Breakdown
                            </Typography>
                            <Box sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Excel-Style Table */}
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
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
                                            Size
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
                                            Quantity
                                        </Typography>
                                    </Box>
                                    
                                    {/* Data Rows */}
                                    {Object.entries(sizeBreakdown)
                                        .sort(([a], [b]) => {
                                            const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
                                            return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                                        })
                                        .map(([size, quantity]) => (
                                            <React.Fragment key={size}>
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
                                                        fontSize: '13px'
                                                    }}>
                                                        {size}
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
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: '#3f51b5',
                                                        fontSize: '13px'
                                                    }}>
                                                        {quantity} items
                                                    </Typography>
                                                </Box>
                                            </React.Fragment>
                                        ))}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Shipping Information */}
            {orderDetail.shippingCode && (
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
            )}
        </Box>
    );
}