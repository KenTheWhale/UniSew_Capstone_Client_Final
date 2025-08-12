import React, {useState, useEffect} from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Grid,
    Divider,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    InfoOutlined as InfoIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    LocalShipping as ShippingIcon,
    Cancel as CancelledIcon,
    RequestQuote as QuoteIcon
} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {getOrdersBySchool, cancelOrder} from '../../../services/OrderService.jsx';
import DisplayImage from '../../ui/DisplayImage.jsx';
import QuotationViewer from './QuotationViewer.jsx';

// Helper function to transform API data to component format
const transformOrderData = (apiOrders) => {
    return apiOrders.map(order => {
        // Transform order details to items with individual pricing
        const items = order.orderDetails.map(detail => {
            const itemPrice = 150000; // Default price per item
            return {
                name: `${detail.deliveryItem.designItem.gender === 'boy' ? 'Male' : 'Female'} ${detail.deliveryItem.designItem.type.charAt(0).toUpperCase() + detail.deliveryItem.designItem.type.slice(1)}`,
                quantity: detail.quantity,
                price: itemPrice,
                size: detail.size,
                category: detail.deliveryItem.designItem.category,
                fabricName: detail.deliveryItem.designItem.fabricName,
                color: detail.deliveryItem.designItem.color,
                frontImageUrl: detail.deliveryItem.frontImageUrl,
                backImageUrl: detail.deliveryItem.backImageUrl,
                logoPosition: detail.deliveryItem.designItem.logoPosition,
                logoImageUrl: detail.deliveryItem.designItem.logoImageUrl,
                baseLogoWidth: detail.deliveryItem.baseLogoWidth,
                baseLogoHeight: detail.deliveryItem.baseLogoHeight
            };
        });

        return {
            id: order.id.toString(),
            orderNumber: `ORD-${new Date(order.orderDate).getFullYear()}-${order.id.toString().padStart(3, '0')}`,
            schoolName: order.school?.business || 'N/A',
            schoolContactName: order.school?.name || '',
            schoolBusiness: order.school?.business || '',
            schoolAddress: order.school?.address || '',
            schoolPhone: order.school?.phone || '',
            schoolAvatar: order.school?.avatar || '',
            schoolEmail: order.school?.account?.email || '',
            orderDate: order.orderDate,
            deliveryDate: order.deadline,
            status: order.status,
            items: items,
            paymentStatus: 'paid',
            shippingStatus: order.status === 'completed' ? 'delivered' : order.status === 'processing' ? 'shipped' : 'preparing',
            note: order.note,
            serviceFee: order.serviceFee,
            price: order.price
        };
    });
};

const SchoolOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openOrderDetail, setOpenOrderDetail] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [quotationViewerOpen, setQuotationViewerOpen] = useState(false);
    const [selectedOrderIdForQuotations, setSelectedOrderIdForQuotations] = useState(null);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getOrdersBySchool();

            if (response && response.status === 200) {
                const transformedOrders = transformOrderData(response.data.body || []);
                setOrders(transformedOrders);
                console.log('Orders loaded:', transformedOrders);
            } else {
                enqueueSnackbar('Failed to load orders', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            enqueueSnackbar('An error occurred while loading orders', {variant: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setOpenOrderDetail(true);
    };

    const handleCloseOrderDetail = () => {
        setOpenOrderDetail(false);
        setSelectedOrder(null);
    };

    const handleViewQuotations = (orderId) => {
        setSelectedOrderIdForQuotations(orderId);
        setQuotationViewerOpen(true);
    };

    const handleCloseQuotationViewer = () => {
        setQuotationViewerOpen(false);
        setSelectedOrderIdForQuotations(null);
    };

    const handleCancelOrder = async (orderId) => {
        try {
            setCancellingOrderId(orderId);
            const response = await cancelOrder(orderId);

            if (response && response.status === 200) {
                setOrders(prev => prev.map(order =>
                    order.id === orderId
                        ? {...order, status: 'cancelled'}
                        : order
                ));
                enqueueSnackbar('Order cancelled successfully!', {variant: 'success'});
            } else {
                enqueueSnackbar('Failed to cancel order', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            enqueueSnackbar('An error occurred while cancelling the order', {variant: 'error'});
        } finally {
            setCancellingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#f59e0b';
            case 'processing':
                return '#3b82f6';
            case 'completed':
                return '#10b981';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ScheduleIcon/>;
            case 'processing':
                return <ShippingIcon/>;
            case 'completed':
                return <CheckCircleIcon/>;
            case 'cancelled':
                return <CancelledIcon/>;
            default:
                return <ScheduleIcon/>;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'processing':
                return 'Processing';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{p: 4, backgroundColor: '#f8fafc', minHeight: '100vh'}}>
            {/* Header */}
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{fontWeight: 700, color: '#1e293b', mb: 2}}>
                    Order Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage and track your school uniform orders
                </Typography>
            </Box>

            {/* Orders Table */}
            <Paper sx={{borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{backgroundColor: '#f1f5f9'}}>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>Order Number</TableCell>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>School</TableCell>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>Order Date</TableCell>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>Status</TableCell>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>Total Items</TableCell>
                                <TableCell sx={{fontWeight: 600, color: '#374151'}}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} sx={{'&:hover': {backgroundColor: '#f9fafb'}}}>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, color: '#1e293b'}}>
                                            {order.orderNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            {order.schoolAvatar && (
                                                <Box
                                                    component="img"
                                                    src={order.schoolAvatar}
                                                    alt="School"
                                                    sx={{width: 32, height: 32, borderRadius: 1, objectFit: 'cover'}}
                                                />
                                            )}
                                            <Box>
                                                <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                                    {order.schoolName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.schoolContactName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(order.orderDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getStatusIcon(order.status)}
                                            label={getStatusText(order.status)}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${getStatusColor(order.status)}20`,
                                                color: getStatusColor(order.status),
                                                fontWeight: 600,
                                                '& .MuiChip-icon': {color: getStatusColor(order.status)}
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{fontWeight: 600}}>
                                            {order.items.reduce((total, item) => total + item.quantity, 0)} items
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => handleViewDetails(order)}
                                                    sx={{
                                                        color: '#3b82f6',
                                                        backgroundColor: '#eff6ff',
                                                        '&:hover': {
                                                            backgroundColor: '#dbeafe',
                                                            transform: 'scale(1.1)'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    size="small"
                                                >
                                                    <InfoIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Quotations">
                                                <IconButton
                                                    onClick={() => handleViewQuotations(order.id)}
                                                    sx={{
                                                        color: '#059669',
                                                        backgroundColor: '#ecfdf5',
                                                        '&:hover': {
                                                            backgroundColor: '#d1fae5',
                                                            transform: 'scale(1.1)'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    size="small"
                                                >
                                                    <QuoteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel Order">
                                                <IconButton
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    disabled={order.status === 'cancelled' || order.status === 'completed' || cancellingOrderId === order.id}
                                                    sx={{
                                                        color: order.status === 'cancelled' || order.status === 'completed' ? '#9ca3af' : '#ef4444',
                                                        backgroundColor: order.status === 'cancelled' || order.status === 'completed' ? 'transparent' : '#fef2f2',
                                                        '&:hover': {
                                                            backgroundColor: order.status === 'cancelled' || order.status === 'completed' ? 'transparent' : '#fee2e2',
                                                            transform: order.status === 'cancelled' || order.status === 'completed' ? 'none' : 'scale(1.1)'
                                                        },
                                                        transition: 'all 0.2s ease',
                                                        cursor: order.status === 'cancelled' || order.status === 'completed' || cancellingOrderId === order.id ? 'not-allowed' : 'pointer'
                                                    }}
                                                    size="small"
                                                >
                                                    {cancellingOrderId === order.id ? (
                                                        <CircularProgress size={16}/>
                                                    ) : (
                                                        <CancelIcon fontSize="small"/>
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Order Detail Dialog */}
            <Dialog
                open={openOrderDetail}
                onClose={handleCloseOrderDetail}
                maxWidth="lg"
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden'
                    }
                }}
            >
                {selectedOrder && (
                    <>
                        {/* Header Section */}
                        <DialogTitle sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600,
                            py: 3,
                            px: 4
                        }}>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Typography variant="h5" sx={{fontWeight: 700, color: 'white'}}>
                                    Order Details - {selectedOrder.orderNumber}
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                                    <Chip
                                        icon={getStatusIcon(selectedOrder.status)}
                                        label={getStatusText(selectedOrder.status)}
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            '& .MuiChip-icon': {color: 'white'}
                                        }}
                                    />
                                    <Typography variant="body1" sx={{opacity: 0.9, color: 'white'}}>
                                        Order placed on {formatDate(selectedOrder.orderDate)}
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{p: 0}}>
                            {/* School Information Card */}
                            <Box sx={{p: 4, borderBottom: '1px solid #f1f5f9'}}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 3, color: '#1e293b'}}>
                                    School Information
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 3}}>
                                            {selectedOrder.schoolAvatar && (
                                                <Box
                                                    component="img"
                                                    src={selectedOrder.schoolAvatar}
                                                    alt="School Avatar"
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: 2,
                                                        border: '3px solid #e2e8f0',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="h6"
                                                            sx={{fontWeight: 600, color: '#1e293b', mb: 1}}>
                                                    {selectedOrder.schoolName}
                                                </Typography>
                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <Box sx={{
                                                            width: 8,
                                                            height: 8,
                                                            backgroundColor: '#3b82f6',
                                                            borderRadius: '50%'
                                                        }}/>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Contact: <strong>{selectedOrder.schoolContactName}</strong>
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <Box sx={{
                                                            width: 8,
                                                            height: 8,
                                                            backgroundColor: '#10b981',
                                                            borderRadius: '50%'
                                                        }}/>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Email: <strong>{selectedOrder.schoolEmail}</strong>
                                                        </Typography>
                                                    </Box>
                                                    {selectedOrder.schoolPhone && (
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                backgroundColor: '#f59e0b',
                                                                borderRadius: '50%'
                                                            }}/>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Phone: <strong>{selectedOrder.schoolPhone}</strong>
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {selectedOrder.schoolAddress && (
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 2,
                                                            mt: 1
                                                        }}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                backgroundColor: '#8b5cf6',
                                                                borderRadius: '50%',
                                                                mt: 0.5
                                                            }}/>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Address: <strong>{selectedOrder.schoolAddress}</strong>
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Product List by Category */}
                            <Box sx={{p: 4}}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 3, color: '#1e293b'}}>
                                    Product Details
                                </Typography>
                                {(() => {
                                    const regularItems = selectedOrder.items.filter(item => item.category === 'regular');
                                    const peItems = selectedOrder.items.filter(item => item.category === 'physical education' || item.category === 'pe');

                                    return (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                            {/* Regular Uniforms Section */}
                                            <Box sx={{
                                                border: '2px solid #e2e8f0',
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                                backgroundColor: 'white'
                                            }}>
                                                {/* Regular Header */}
                                                <Box sx={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    p: 3,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                                                        Regular Uniforms
                                                    </Typography>
                                                    <Typography variant="body2" sx={{opacity: 0.9}}>
                                                        Daily school uniforms
                                                    </Typography>
                                                </Box>

                                                {/* Regular Items */}
                                                <Box sx={{p: 3}}>
                                                    {regularItems.length > 0 ? (
                                                        regularItems.map((item, index) => (
                                                            <Box key={index} sx={{
                                                                border: '1px solid #f1f5f9',
                                                                borderRadius: 3,
                                                                p: 3,
                                                                mb: 2,
                                                                backgroundColor: '#fafbff',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    borderColor: '#3b82f6',
                                                                    backgroundColor: '#f0f4ff',
                                                                    transform: 'translateX(4px)'
                                                                },
                                                                '&:last-child': {mb: 0}
                                                            }}>
                                                                {/* Item Header */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    mb: 2
                                                                }}>
                                                                    <Typography variant="subtitle1" sx={{
                                                                        fontWeight: 600,
                                                                        color: '#1e293b'
                                                                    }}>
                                                                        {item.name}
                                                                    </Typography>
                                                                    <Box sx={{
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white',
                                                                        px: 2,
                                                                        py: 0.5,
                                                                        borderRadius: 20,
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {item.quantity}
                                                                    </Box>
                                                                </Box>

                                                                {/* Item Details */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    flexWrap: 'wrap',
                                                                    mb: 2
                                                                }}>
                                                                    <Chip
                                                                        label={item.size}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: '#dbeafe',
                                                                            color: '#1e40af',
                                                                            fontWeight: 600
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        label={item.fabricName}
                                                                        size="small"
                                                                        sx={{borderColor: '#cbd5e1'}}
                                                                    />
                                                                </Box>

                                                                {/* Color and Logo */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography variant="body2"
                                                                                    color="text.secondary">Color:</Typography>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            backgroundColor: item.color,
                                                                            borderRadius: 1,
                                                                            border: '2px solid #e2e8f0',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}/>
                                                                    </Box>
                                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) && (
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary">
                                                                            Logo: {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                                        </Typography>
                                                                    )}
                                                                </Box>

                                                                {/* Logo Information */}
                                                                {(item.logoPosition || item.logoImageUrl) && (
                                                                    <Box sx={{
                                                                        backgroundColor: '#f0f4ff',
                                                                        borderRadius: 2,
                                                                        p: 2,
                                                                        mt: 2,
                                                                        border: '1px solid #c7d2fe'
                                                                    }}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 2
                                                                        }}>
                                                                            {item.logoImageUrl && (
                                                                                <DisplayImage
                                                                                    imageUrl={item.logoImageUrl}
                                                                                    alt="Logo"
                                                                                    width={32}
                                                                                    height={32}
                                                                                />
                                                                            )}
                                                                            <Box sx={{flex: 1}}>
                                                                                {item.logoPosition && (
                                                                                    <Typography variant="body2" sx={{
                                                                                        color: '#4338ca',
                                                                                        fontWeight: 500,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1,
                                                                                        mb: item.logoImageUrl ? 0.5 : 0
                                                                                    }}>
                                                                                        <Box component="span" sx={{
                                                                                            width: 6,
                                                                                            height: 6,
                                                                                            backgroundColor: '#4338ca',
                                                                                            borderRadius: '50%'
                                                                                        }}/>
                                                                                        Position: {item.logoPosition}
                                                                                    </Typography>
                                                                                )}
                                                                                {item.logoImageUrl && (
                                                                                    <Typography variant="caption" sx={{
                                                                                        color: '#6366f1',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        Custom logo included
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))
                                                    ) : (
                                                        <Box sx={{
                                                            textAlign: 'center',
                                                            py: 4,
                                                            color: 'text.secondary'
                                                        }}>
                                                            <Typography variant="h6" sx={{mb: 1, opacity: 0.6}}>
                                                                No Data
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                No regular uniforms in this order
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>

                                            {/* Physical Education Section */}
                                            <Box sx={{
                                                border: '2px solid #e2e8f0',
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                                backgroundColor: 'white'
                                            }}>
                                                {/* PE Header */}
                                                <Box sx={{
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                    color: 'white',
                                                    p: 3,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                                                        Physical Education
                                                    </Typography>
                                                    <Typography variant="body2" sx={{opacity: 0.9}}>
                                                        Sports & PE uniforms
                                                    </Typography>
                                                </Box>

                                                {/* PE Items */}
                                                <Box sx={{p: 3}}>
                                                    {peItems.length > 0 ? (
                                                        peItems.map((item, index) => (
                                                            <Box key={index} sx={{
                                                                border: '1px solid #f1f5f9',
                                                                borderRadius: 3,
                                                                p: 3,
                                                                mb: 2,
                                                                backgroundColor: '#f0fdf4',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    borderColor: '#059669',
                                                                    backgroundColor: '#dcfce7',
                                                                    transform: 'translateX(4px)'
                                                                },
                                                                '&:last-child': {mb: 0}
                                                            }}>
                                                                {/* Item Header */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    mb: 2
                                                                }}>
                                                                    <Typography variant="subtitle1" sx={{
                                                                        fontWeight: 600,
                                                                        color: '#1e293b'
                                                                    }}>
                                                                        {item.name}
                                                                    </Typography>
                                                                    <Box sx={{
                                                                        backgroundColor: '#059669',
                                                                        color: 'white',
                                                                        px: 2,
                                                                        py: 0.5,
                                                                        borderRadius: 20,
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {item.quantity}
                                                                    </Box>
                                                                </Box>

                                                                {/* Item Details */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    flexWrap: 'wrap',
                                                                    mb: 2
                                                                }}>
                                                                    <Chip
                                                                        label={item.size}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: '#d1fae5',
                                                                            color: '#065f46',
                                                                            fontWeight: 600
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        label={item.fabricName}
                                                                        size="small"
                                                                        sx={{borderColor: '#a7f3d0'}}
                                                                    />
                                                                </Box>

                                                                {/* Color and Logo */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography variant="body2"
                                                                                    color="text.secondary">Color:</Typography>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            backgroundColor: item.color,
                                                                            borderRadius: 1,
                                                                            border: '2px solid #e2e8f0',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}/>
                                                                    </Box>
                                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) && (
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary">
                                                                            Logo: {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                                        </Typography>
                                                                    )}
                                                                </Box>

                                                                {/* Logo Information */}
                                                                {(item.logoPosition || item.logoImageUrl) && (
                                                                    <Box sx={{
                                                                        backgroundColor: '#ecfdf5',
                                                                        borderRadius: 2,
                                                                        p: 2,
                                                                        mt: 2,
                                                                        border: '1px solid #a7f3d0'
                                                                    }}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 2
                                                                        }}>
                                                                            {item.logoImageUrl && (
                                                                                <DisplayImage
                                                                                    imageUrl={item.logoImageUrl}
                                                                                    alt="Logo"
                                                                                    width={32}
                                                                                    height={32}
                                                                                />
                                                                            )}
                                                                            <Box sx={{flex: 1}}>
                                                                                {item.logoPosition && (
                                                                                    <Typography variant="body2" sx={{
                                                                                        color: '#047857',
                                                                                        fontWeight: 500,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1,
                                                                                        mb: item.logoImageUrl ? 0.5 : 0
                                                                                    }}>
                                                                                        <Box component="span" sx={{
                                                                                            width: 6,
                                                                                            height: 6,
                                                                                            backgroundColor: '#047857',
                                                                                            borderRadius: '50%'
                                                                                        }}/>
                                                                                        Position: {item.logoPosition}
                                                                                    </Typography>
                                                                                )}
                                                                                {item.logoImageUrl && (
                                                                                    <Typography variant="caption" sx={{
                                                                                        color: '#10b981',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        Custom logo included
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))
                                                    ) : (
                                                        <Box sx={{
                                                            textAlign: 'center',
                                                            py: 4,
                                                            color: 'text.secondary'
                                                        }}>
                                                            <Typography variant="h6" sx={{mb: 1, opacity: 0.6}}>
                                                                No Data
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                No PE uniforms in this order
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })()}

                                {/* Additional Information */}
                                {(selectedOrder.note || selectedOrder.serviceFee > 0) && (
                                    <Box sx={{mt: 4}}>
                                        <Typography variant="h6" sx={{fontWeight: 600, mb: 3, color: '#1e293b'}}>
                                            Additional Information
                                        </Typography>
                                        <Grid container spacing={3}>
                                            {selectedOrder.note && (
                                                <Grid item xs={12} md={selectedOrder.serviceFee > 0 ? 8 : 12}>
                                                    <Box sx={{
                                                        backgroundColor: '#fffbeb',
                                                        borderRadius: 3,
                                                        p: 3,
                                                        border: '1px solid #fed7aa'
                                                    }}>
                                                        <Typography variant="subtitle1"
                                                                    sx={{fontWeight: 600, color: '#92400e', mb: 1}}>
                                                            Order Notes
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{color: '#451a03', lineHeight: 1.6}}>
                                                            {selectedOrder.note}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}

                                            {selectedOrder.serviceFee > 0 && (
                                                <Grid item xs={12} md={selectedOrder.note ? 4 : 12}>
                                                    <Box sx={{
                                                        backgroundColor: '#f0f9ff',
                                                        borderRadius: 3,
                                                        p: 3,
                                                        border: '1px solid #bae6fd',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1"
                                                                    sx={{fontWeight: 600, color: '#0369a1', mb: 1}}>
                                                            Service Fee
                                                        </Typography>
                                                        <Typography variant="h5"
                                                                    sx={{fontWeight: 700, color: '#0c4a6e'}}>
                                                            {formatCurrency(selectedOrder.serviceFee)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>

                        {/* Footer Actions */}
                        <DialogActions sx={{
                            p: 4,
                            backgroundColor: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Order ID: {selectedOrder.id}
                            </Typography>
                            <Button
                                onClick={handleCloseOrderDetail}
                                variant="contained"
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Quotation Viewer */}
            <QuotationViewer
                visible={quotationViewerOpen}
                onCancel={handleCloseQuotationViewer}
                orderId={selectedOrderIdForQuotations}
            />
        </Box>
    );
};

export default SchoolOrderManagement;