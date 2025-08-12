import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Divider,
    IconButton,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Schedule as ScheduleIcon,
    AttachMoney as MoneyIcon,
    StickyNote2 as NoteIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { viewQuotation, approveQuotation } from '../../../services/OrderService.jsx';
import { getPaymentUrl } from '../../../services/PaymentService.jsx';
import { serviceFee } from '../../../configs/FixedVariables.jsx';
import QuotationSummaryPopup from '../popup/QuotationSummaryPopup.jsx';

// Status chip component for quotations
const QuotationStatusChip = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'garment_quotation_pending':
                return {
                    label: 'Pending',
                    color: '#fff',
                    bgColor: '#f59e0b',
                    icon: <PendingIcon sx={{ fontSize: 14 }} />
                };
            case 'garment_quotation_approved':
                return {
                    label: 'Accepted',
                    color: '#fff',
                    bgColor: '#10b981',
                    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />
                };
            case 'garment_quotation_rejected':
                return {
                    label: 'Rejected',
                    color: '#fff',
                    bgColor: '#ef4444',
                    icon: <CancelIcon sx={{ fontSize: 14 }} />
                };
            default:
                return {
                    label: 'Unknown',
                    color: '#374151',
                    bgColor: '#f3f4f6',
                    icon: <PendingIcon sx={{ fontSize: 14 }} />
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
                fontSize: '0.75rem',
                '& .MuiChip-icon': {
                    color: config.color
                }
            }}
        />
    );
};

export default function QuotationViewer({ visible, onCancel, orderId }) {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [approvingQuotationId, setApprovingQuotationId] = useState(null);
    const [showSummaryPopup, setShowSummaryPopup] = useState(false);
    const [selectedQuotationForPayment, setSelectedQuotationForPayment] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (visible && orderId) {
            fetchQuotations();
        }
    }, [visible, orderId]);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await viewQuotation(orderId);
            
            if (response && response.status === 200) {
                setQuotations(response.data.body || []);
                console.log('Quotations loaded:', response.data.body);
            } else {
                setError('Failed to load quotations');
                enqueueSnackbar('Failed to load quotations', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching quotations:', error);
            setError('An error occurred while loading quotations');
            enqueueSnackbar('An error occurred while loading quotations', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

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

    const handleAcceptQuotation = (quotationId) => {
        // Find the selected quotation and show summary popup
        const selectedQuotation = quotations.find(q => q.id === quotationId);
        if (selectedQuotation) {
            setSelectedQuotationForPayment(selectedQuotation);
            setShowSummaryPopup(true);
        }
    };

    const handlePayment = async (quotation) => {
        try {
            setApprovingQuotationId(quotation.id);
            
            // Calculate service fee
            const fee = serviceFee(quotation.price);
            
            // Store order payment details in sessionStorage
            const orderPaymentDetails = {
                quotation: quotation,
                orderId: orderId, // from props
                serviceFee: fee,
                totalAmount: quotation.price + fee
            };
            sessionStorage.setItem('orderPaymentDetails', JSON.stringify(orderPaymentDetails));
            
            // Get payment URL directly (approveQuotation will be called in PaymentResult)
            const amount = quotation.price + fee; // Include service fee in payment amount
            const description = `Thanh toan don hang tu ${quotation.garmentName}`;
            const orderType = 'order';
            const returnUrl = `/school/payment/result?orderType=order&quotationId=${quotation.id}`;
            
            const paymentResponse = await getPaymentUrl(amount, description, orderType, returnUrl);
            
            if (paymentResponse && paymentResponse.status === 200 && paymentResponse.data.body) {
                // Redirect to payment URL
                window.location.href = paymentResponse.data.body.url;
            } else {
                enqueueSnackbar('Failed to get payment URL. Please try again.', { variant: 'error' });
            }
            
            setShowSummaryPopup(false);
        } catch (error) {
            console.error('Error processing payment:', error);
            enqueueSnackbar('An error occurred while processing payment. Please try again.', { variant: 'error' });
        } finally {
            setApprovingQuotationId(null);
        }
    };

    const handleCloseSummaryPopup = () => {
        setShowSummaryPopup(false);
        setSelectedQuotationForPayment(null);
    };

    if (!visible) return null;

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="lg"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 3,
                    minHeight: '70vh',
                    maxHeight: '90vh',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Quotations for Order
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        View and manage quotations from garment manufacturers
                    </Typography>
                </Box>
                <IconButton onClick={onCancel} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                        <Button onClick={fetchQuotations} variant="outlined">
                            Try Again
                        </Button>
                    </Box>
                ) : quotations.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: 300,
                        p: 3 
                    }}>
                        <ViewIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                            No Quotations Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            No garment manufacturers have submitted quotations for this order yet.
                            Check back later or contact manufacturers directly.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ p: 3 }}>
                        {/* Summary */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Quotations Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f0f9ff' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0369a1' }}>
                                            {quotations.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Quotations
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f0fdf4' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                                            {quotations.filter(q => q.status === 'GARMENT_QUOTATION_PENDING').length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending Review
                                        </Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#fffbeb' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                                            {quotations.length > 0 ? formatCurrency(Math.min(...quotations.map(q => q.price))) : '0'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Best Price
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Quotation Details Cards */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Quotations from Manufacturers
                            </Typography>
                            <Grid container spacing={3}>
                                {quotations.map((quotation) => (
                                    <Grid item xs={12} md={6} key={quotation.id}>
                                        <Card sx={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {quotation.garmentName}
                                                    </Typography>
                                                    <QuotationStatusChip status={quotation.status} />
                                                </Box>

                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <MoneyIcon sx={{ color: '#059669', fontSize: 18 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Price:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                                                            {formatCurrency(quotation.price)}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CalendarIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Delivery:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {formatDate(quotation.earlyDeliveryDate)}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <ScheduleIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Valid until:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {formatDate(quotation.acceptanceDeadline)}
                                                        </Typography>
                                                    </Box>

                                                    {quotation.note && (
                                                        <Box sx={{
                                                            mt: 2,
                                                            p: 2,
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: 2,
                                                            border: '1px solid #e5e7eb'
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                <NoteIcon sx={{ color: '#6b7280', fontSize: 16 }} />
                                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                                                                    Notes:
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {quotation.note}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {quotation.status === 'GARMENT_QUOTATION_ACCEPTED' && (
                                                    <Box sx={{ mt: 3 }}>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            disabled
                                                            startIcon={<CheckCircleIcon />}
                                                            sx={{
                                                                backgroundColor: '#10b981',
                                                                py: 1.5,
                                                                fontSize: '1rem',
                                                                fontWeight: 600,
                                                                '&:disabled': {
                                                                    backgroundColor: '#10b981',
                                                                    color: 'white',
                                                                    opacity: 0.9
                                                                }
                                                            }}
                                                        >
                                                            Quotation Accepted
                                                        </Button>
                                                    </Box>
                                                )}
                                                
                                                {quotation.status === 'GARMENT_QUOTATION_PENDING' && (
                                                    <Box sx={{ mt: 3 }}>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleAcceptQuotation(quotation.id)}
                                                            startIcon={<CheckCircleIcon />}
                                                            sx={{
                                                                backgroundColor: '#10b981',
                                                                py: 1.5,
                                                                fontSize: '1rem',
                                                                fontWeight: 600,
                                                                '&:hover': { 
                                                                    backgroundColor: '#059669',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                                                                },
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            Accept Quotation
                                                        </Button>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            {/* Quotation Summary Popup */}
            <QuotationSummaryPopup
                visible={showSummaryPopup}
                onCancel={handleCloseSummaryPopup}
                quotation={selectedQuotationForPayment}
                onPayment={handlePayment}
                isProcessing={approvingQuotationId === selectedQuotationForPayment?.id}
            />
        </Dialog>
    );
} 