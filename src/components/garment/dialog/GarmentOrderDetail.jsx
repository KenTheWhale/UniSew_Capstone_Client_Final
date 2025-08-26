import React, {useState} from 'react';
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
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    AttachMoney as MoneyIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Checkroom as CheckroomIcon,
    Close as CloseIcon,
    Email as EmailIcon,
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Place as PlaceIcon,
    RequestQuote as QuoteIcon,
    Schedule as ScheduleIcon,
    Send as SendIcon,
    StickyNote2 as NoteIcon
} from '@mui/icons-material';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import DisplayImage from "../../ui/DisplayImage.jsx";
import {createQuotation} from "../../../services/OrderService.jsx";
import {enqueueSnackbar} from "notistack";

const StatusChip = ({status}) => {
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return {
                    label: 'Pending',
                    color: '#fff',
                    bgColor: '#f59e0b',
                    icon: <ScheduleIcon sx={{fontSize: 16}}/>
                };
            case 'processing':
                return {
                    label: 'Processing',
                    color: '#fff',
                    bgColor: '#3b82f6',
                    icon: <ShippingIcon sx={{fontSize: 16}}/>
                };
            case 'completed':
                return {
                    label: 'Completed',
                    color: '#fff',
                    bgColor: '#10b981',
                    icon: <CheckCircleIcon sx={{fontSize: 16}}/>
                };
            case 'cancelled':
            case 'canceled':
                return {
                    label: 'Cancelled',
                    color: '#fff',
                    bgColor: '#ef4444',
                    icon: <CancelIcon sx={{fontSize: 16}}/>
                };
            default:
                return {
                    label: 'Unknown',
                    color: '#374151',
                    bgColor: '#f3f4f6',
                    icon: <InfoIcon sx={{fontSize: 16}}/>
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

const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';

    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill size={24} color="#3b82f6"/>;
    } else if (type.includes('pants') || type.includes('quần')) {
        return <PiPantsFill size={24} color="#059669"/>;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt size={24} color="#ec4899"/>;
    } else {
        return <CheckroomIcon sx={{fontSize: 24, color: '#6b7280'}}/>;
    }
};

export default function GarmentOrderDetail({visible, onCancel, order}) {
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

    const defaultOrder = {
        id: 0,
        status: 'pending',
        orderDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        school: {
            business: 'Sample School',
            name: 'Contact Person',
            phone: '+1234567890',
            email: 'contact@school.edu',
            address: 'School Address'
        },
        orderDetails: [],
        note: '',
        serviceFee: 0
    };

    const mergedOrderData = order ? {...defaultOrder, ...order} : defaultOrder;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
        console.log('Updating status to:', newStatus, 'with note:', statusNote);
        setUpdateStatusDialogOpen(false);
        setNewStatus('');
        setStatusNote('');
    };

    const handleCreateQuotation = () => {
        setShowQuotationForm(true);
    };

    const handleSubmitQuotation = async () => {
        try {
            setSubmittingQuotation(true);

            const deliveryDays = parseInt(quotationData.deliveryTime);
            if (deliveryDays < 1) {
                enqueueSnackbar('Delivery time must be at least 1 day', {variant: 'error'});
                setSubmittingQuotation(false);
                return;
            }

            const validUntilDate = new Date(quotationData.validUntil);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (validUntilDate <= today) {
                enqueueSnackbar('Valid until date must be in the future', {variant: 'error'});
                setSubmittingQuotation(false);
                return;
            }

            const currentDate = new Date();
            const earlyDeliveryDate = new Date(currentDate);
            earlyDeliveryDate.setDate(currentDate.getDate() + deliveryDays);

            const orderDeadline = new Date(mergedOrderData.deadline);
            orderDeadline.setHours(23, 59, 59, 999);

            if (earlyDeliveryDate > orderDeadline) {
                enqueueSnackbar(`Delivery time cannot exceed the order deadline (${formatDate(mergedOrderData.deadline)})`, {variant: 'error'});
                setSubmittingQuotation(false);
                return;
            }

            const quotationPayload = {
                orderId: parseInt(mergedOrderData.id),
                garmentId: 1,
                earlyDeliveryDate: earlyDeliveryDate.toISOString().split('T')[0],
                acceptanceDeadline: quotationData.validUntil,
                price: parseInt(quotationData.totalPrice) || 0,
                note: quotationData.note || ''
            };

            console.log('Submitting quotation:', quotationPayload);

            const response = await createQuotation(quotationPayload);

            if (response && response.status === 200) {
                enqueueSnackbar('Quotation sent successfully!', {variant: 'success'});
                setShowQuotationForm(false);
                setQuotationData({
                    totalPrice: '',
                    deliveryTime: '',
                    note: '',
                    validUntil: ''
                });
            } else {
                enqueueSnackbar('Failed to send quotation. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error submitting quotation:', error);
            enqueueSnackbar('An error occurred while sending the quotation.', {variant: 'error'});
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
    };

    const handleDeliveryTimeChange = (value) => {
        const deliveryDays = parseInt(value);
        setQuotationData(prev => ({
            ...prev,
            deliveryTime: value
        }));

        if (!value) {
            setDeliveryTimeError('');
            return;
        }

        if (deliveryDays < 1) {
            setDeliveryTimeError('Delivery time must be at least 1 day');
            return;
        }

        const currentDate = new Date();
        const earlyDeliveryDate = new Date(currentDate);
        earlyDeliveryDate.setDate(currentDate.getDate() + deliveryDays);

        const orderDeadline = new Date(mergedOrderData.deadline);
        orderDeadline.setHours(23, 59, 59, 999);

        if (earlyDeliveryDate > orderDeadline) {
            setDeliveryTimeError(`Cannot exceed order deadline (${formatDate(mergedOrderData.deadline)})`);
            return;
        }

        setDeliveryTimeError('');
    };

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
            {}
            <Box sx={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                            Production Order Details
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 500}}>
                            {parseID(mergedOrderData.id, 'ord')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <StatusChip status={mergedOrderData.status}/>
                    <IconButton onClick={onCancel} sx={{color: 'white'}}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </Box>

            {}
            <DialogContent sx={{p: 0, overflow: 'auto'}}>
                <Container maxWidth={false} sx={{p: 3}}>
                    <Grid container spacing={3}>
                        {}
                        <Grid item xs={12} lg={8}>
                            {}
                            <Card sx={{
                                mb: 3,
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                    transform: 'translateY(-2px)',
                                    background: 'rgba(255, 255, 255, 0.95)'
                                }
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    p: 2,
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <InfoIcon sx={{fontSize: 20}}/>
                                        Order Information
                                    </Typography>
                                </Box>
                                <CardContent sx={{p: 3}}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                <CalendarIcon sx={{color: '#059669', fontSize: 20}}/>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Order Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {formatDate(mergedOrderData.orderDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                <ScheduleIcon sx={{color: '#f59e0b', fontSize: 20}}/>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Delivery Deadline
                                                    </Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {formatDate(mergedOrderData.deadline)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                <CheckroomIcon sx={{color: '#3b82f6', fontSize: 20}}/>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Total Items
                                                    </Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {getTotalItems()} items ({getUniqueTypes()} types)
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        {mergedOrderData.serviceFee > 0 && (
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <MoneyIcon sx={{color: '#10b981', fontSize: 20}}/>
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Service Fee
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            {formatCurrency(mergedOrderData.serviceFee)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {mergedOrderData.note && (
                                        <Box sx={{
                                            mt: 3,
                                            p: 2,
                                            backgroundColor: '#fffbeb',
                                            borderRadius: 2,
                                            border: '1px solid #fed7aa'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                                <NoteIcon sx={{color: '#d97706', fontSize: 18}}/>
                                                <Typography variant="subtitle2"
                                                            sx={{fontWeight: 600, color: '#92400e'}}>
                                                    Order Notes
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{color: '#451a03'}}>
                                                {mergedOrderData.note}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {}
                            <Card sx={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    p: 2,
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <CheckroomIcon sx={{fontSize: 20}}/>
                                        Order Items
                                    </Typography>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{backgroundColor: '#f8fafc'}}>
                                                <TableCell sx={{fontWeight: 600}}>Item</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Type</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Gender</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Size</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Color</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Quantity</TableCell>
                                                <TableCell sx={{fontWeight: 600}}>Logo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {mergedOrderData.orderDetails?.map((item, index) => (
                                                <TableRow key={index} sx={{'&:hover': {backgroundColor: '#f9fafb'}}}>
                                                    <TableCell>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            {getItemIcon(item.deliveryItem?.designItem?.type)}
                                                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                                                {item.deliveryItem?.designItem?.type?.charAt(0).toUpperCase() +
                                                                    item.deliveryItem?.designItem?.type?.slice(1) || 'Item'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.deliveryItem?.designItem?.category || 'Regular'}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: item.deliveryItem?.designItem?.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                                color: item.deliveryItem?.designItem?.category === 'pe' ? '#065f46' : '#1e40af'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{textTransform: 'capitalize'}}>
                                                            {item.deliveryItem?.designItem?.gender || 'Unisex'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.size || 'M'}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{fontWeight: 600}}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{
                                                                width: 20,
                                                                height: 20,
                                                                backgroundColor: item.deliveryItem?.designItem?.color || '#000',
                                                                borderRadius: 1,
                                                                border: '2px solid #e5e7eb'
                                                            }}/>
                                                            <Typography variant="body2">
                                                                {item.deliveryItem?.designItem?.color || '#000'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={item.quantity || 0}
                                                            sx={{
                                                                backgroundColor: '#059669',
                                                                color: 'white',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.deliveryItem?.designItem?.logoImageUrl ? (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                <DisplayImage
                                                                    imageUrl={item.deliveryItem.designItem.logoImageUrl}
                                                                    alt="Logo"
                                                                    width={24}
                                                                    height={24}
                                                                />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.deliveryItem?.baseLogoWidth}×{item.deliveryItem?.baseLogoHeight}cm
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">
                                                                No logo
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Grid>

                        {}
                        <Grid item xs={12} lg={4}>
                            {}
                            <Card sx={{
                                mb: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(102, 126, 234, 0.15)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    p: 2,
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <BusinessIcon sx={{fontSize: 20}}/>
                                        School Information
                                    </Typography>
                                </Box>
                                <CardContent sx={{p: 3}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <BusinessIcon sx={{color: '#059669', fontSize: 20}}/>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    School Name
                                                </Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                                    {mergedOrderData.school?.business || 'School Name'}
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
                                                    {mergedOrderData.school?.name || 'Contact Person'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <EmailIcon sx={{color: '#8b5cf6', fontSize: 20}}/>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Email
                                                </Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                                    {mergedOrderData.school?.account?.email || 'email@school.edu'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <PhoneIcon sx={{color: '#f59e0b', fontSize: 20}}/>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Phone
                                                </Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                                    {mergedOrderData.school?.phone || 'Phone Number'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {mergedOrderData.school?.address && (
                                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                                <PlaceIcon sx={{color: '#ef4444', fontSize: 20, mt: 0.2}}/>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Address
                                                    </Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {mergedOrderData.school.address}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>

                            {}
                            <Card sx={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(102, 126, 234, 0.15)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    p: 2,
                                    borderRadius: '8px 8px 0 0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        {showQuotationForm ? 'Create Quotation' : 'Order Actions'}
                                    </Typography>
                                    {showQuotationForm && (
                                        <Typography variant="body2" sx={{
                                            opacity: 0.9,
                                            textAlign: 'center',
                                            mt: 0.5,
                                            color: 'white'
                                        }}>
                                            Provide your quotation for this order
                                        </Typography>
                                    )}
                                </Box>
                                <CardContent sx={{p: 3}}>
                                    {!showQuotationForm ? (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<QuoteIcon/>}
                                                onClick={handleCreateQuotation}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    py: 1.5,
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                                                    }
                                                }}
                                            >
                                                Create Quotation
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                            {}
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
                                                    placeholder="Enter total price for entire order"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: 'rgba(102, 126, 234, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(102, 126, 234, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#667eea'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {}
                                            <Box sx={{
                                                p: 2,
                                                backgroundColor: '#f0f9ff',
                                                borderRadius: 2,
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <Typography variant="body2"
                                                            sx={{color: '#0369a1', fontWeight: 600, mb: 1}}>
                                                    Order Summary
                                                </Typography>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                    <Typography variant="caption" sx={{color: '#0c4a6e'}}>
                                                        Total Items:
                                                    </Typography>
                                                    <Typography variant="caption"
                                                                sx={{color: '#0c4a6e', fontWeight: 600}}>
                                                        {getTotalItems()} items
                                                    </Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                    <Typography variant="caption" sx={{color: '#0c4a6e'}}>
                                                        Product Types:
                                                    </Typography>
                                                    <Typography variant="caption"
                                                                sx={{color: '#0c4a6e', fontWeight: 600}}>
                                                        {getUniqueTypes()} types
                                                    </Typography>
                                                </Box>
                                                {quotationData.totalPrice && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        pt: 1,
                                                        borderTop: '1px solid #bae6fd'
                                                    }}>
                                                        <Typography variant="body2"
                                                                    sx={{color: '#0369a1', fontWeight: 600}}>
                                                            Estimated Price per Item:
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{color: '#0369a1', fontWeight: 600}}>
                                                            {formatCurrency(Math.round(parseInt(quotationData.totalPrice) / getTotalItems()))}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {}
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: '#1e293b'
                                                }}>
                                                    Delivery Time (Days) *
                                                </Typography>
                                                <TextField
                                                    type="number"
                                                    value={quotationData.deliveryTime}
                                                    onChange={(e) => handleDeliveryTimeChange(e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Enter delivery time in days"
                                                    inputProps={{min: 1}}
                                                    error={!!deliveryTimeError}
                                                    helperText={deliveryTimeError}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: deliveryTimeError ? '#ef4444' : 'rgba(102, 126, 234, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: deliveryTimeError ? '#ef4444' : 'rgba(102, 126, 234, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: deliveryTimeError ? '#ef4444' : '#667eea'
                                                            }
                                                        },
                                                        '& .MuiFormHelperText-root': {
                                                            color: '#ef4444',
                                                            fontSize: '0.75rem',
                                                            marginTop: 0.5
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {}
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
                                                    onChange={(e) => setQuotationData({
                                                        ...quotationData,
                                                        validUntil: e.target.value
                                                    })}
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{shrink: true}}
                                                    inputProps={{
                                                        min: (() => {
                                                            const tomorrow = new Date();
                                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                                            return tomorrow.toISOString().split('T')[0];
                                                        })()
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            '& fieldset': {
                                                                borderColor: 'rgba(102, 126, 234, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(102, 126, 234, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#667eea'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {}
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
                                                                borderColor: 'rgba(102, 126, 234, 0.3)'
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(102, 126, 234, 0.5)'
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#667eea'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {}
                                            <Box sx={{display: 'flex', gap: 2, mt: 2}}>
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
                                                    startIcon={submittingQuotation ?
                                                        <CircularProgress size={16} sx={{color: 'white'}}/> :
                                                        <SendIcon/>}
                                                    onClick={handleSubmitQuotation}
                                                    disabled={!quotationData.totalPrice || !quotationData.deliveryTime || !quotationData.validUntil || !!deliveryTimeError || submittingQuotation}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
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
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>

            {}
            <Dialog
                open={updateStatusDialogOpen}
                onClose={() => setUpdateStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Update Order Status
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{mt: 2}}>
                        <Typography variant="body2" sx={{mb: 2}}>
                            Select new status for order {parseID(mergedOrderData.id, 'ord')}:
                        </Typography>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, mb: 3}}>
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
        </Dialog>
    );
}