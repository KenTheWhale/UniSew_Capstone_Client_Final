import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Divider,
    Paper,
    Chip,
    IconButton
} from '@mui/material';
import {
    Close as CloseIcon,
    Payment as PaymentIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { serviceFee } from '../../../configs/FixedVariables';

export default function QuotationSummaryPopup({ 
    visible, 
    onCancel, 
    quotation, 
    onPayment,
    isProcessing = false
}) {
    if (!quotation) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    py: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PaymentIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            Quotation Summary
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Review and proceed to payment
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 4 }}>
                    {/* Garment Manufacturer Info */}
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            mb: 3, 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <BusinessIcon sx={{ color: '#3b82f6' }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Garment Manufacturer
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                            {quotation.garmentName}
                        </Typography>
                    </Paper>

                    {/* Quotation Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                        {/* Delivery Date */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                backgroundColor: '#fef3f2',
                                border: '1px solid #fecaca',
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <CalendarIcon sx={{ color: '#dc2626' }} />
                                <Typography variant="subtitle2" sx={{ color: '#7f1d1d', fontWeight: 'bold' }}>
                                    Delivery Date
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {formatDate(quotation.earlyDeliveryDate)}
                            </Typography>
                        </Paper>

                        {/* Valid Until */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                backgroundColor: '#fff7ed',
                                border: '1px solid #fed7aa',
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <TimeIcon sx={{ color: '#ea580c' }} />
                                <Typography variant="subtitle2" sx={{ color: '#9a3412', fontWeight: 'bold' }}>
                                    Valid Until
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                {formatDate(quotation.acceptanceDeadline)}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Notes */}
                    {quotation.note && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                mb: 3,
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ color: '#075985', fontWeight: 'bold', mb: 1 }}>
                                Additional Notes
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#0c4a6e' }}>
                                {quotation.note}
                            </Typography>
                        </Paper>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Price Breakdown */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, 
                            mb: 3,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 3
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1e293b' }}>
                            Price Breakdown
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Quotation Price */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 2,
                                backgroundColor: '#f0f9ff',
                                borderRadius: 2,
                                border: '1px solid #bae6fd'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <MoneyIcon sx={{ color: '#0284c7', fontSize: 20 }} />
                                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                                        Quotation Price
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                                    {formatCurrency(quotation.price)}
                                </Typography>
                            </Box>

                            {/* Service Fee */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 2,
                                backgroundColor: '#fef3c7',
                                borderRadius: 2,
                                border: '1px solid #fbbf24'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <MoneyIcon sx={{ color: '#d97706', fontSize: 20 }} />
                                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                                        Service Fee
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                                    {formatCurrency(serviceFee(quotation.price))}
                                </Typography>
                            </Box>

                            {/* Total Amount */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 3,
                                backgroundColor: '#dcfce7',
                                borderRadius: 2,
                                border: '2px solid #16a34a',
                                mt: 1
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <MoneyIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                                    <Typography variant="h6" sx={{ color: '#166534', fontWeight: 'bold' }}>
                                        Total Amount
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                                    {formatCurrency(quotation.price + serviceFee(quotation.price))}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: 4, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderColor: '#d1d5db',
                            color: '#6b7280',
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
                        onClick={() => onPayment(quotation)}
                        disabled={isProcessing}
                        startIcon={isProcessing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PaymentIcon />}
                        sx={{
                            flex: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                            },
                            '&:disabled': {
                                background: '#9ca3af',
                                color: 'white'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
} 