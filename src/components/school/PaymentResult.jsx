import {Box, Container, Divider, Paper, Stack} from '@mui/material';
import {Button, Typography} from 'antd';
import {
    ArrowRightOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    UserOutlined
} from '@ant-design/icons';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {pickQuotation} from "../../services/DesignService.jsx";
import {useEffect, useState} from 'react';

export default function PaymentResult() {
    if(!sessionStorage.getItem('paymentQuotationDetails')){
        window.location.href = '/school/design'
    }

    const [isProcessing, setIsProcessing] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(false);
    
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    const vnpTransactionStatus = urlParams.get('vnp_TransactionStatus');
    const vnpAmount = urlParams.get('vnp_Amount');
    const vnpOrderInfo = urlParams.get('vnp_OrderInfo');
    const vnpTxnRef = urlParams.get('vnp_TxnRef');

    let success = false;
    let quotationDetails = null;

    if (vnpResponseCode !== null) {
        success = vnpResponseCode === '00';
        if (success && vnpOrderInfo) {
            try {
                const storedQuotationDetails = sessionStorage.getItem('paymentQuotationDetails');
                if (storedQuotationDetails) {
                    quotationDetails = JSON.parse(storedQuotationDetails);
                }
            } catch (error) {
                console.error('Error parsing stored quotation details:', error);
            }
        }
    } else {
        window.location.href = '/school/design'
    }

    const { quotation, request } = quotationDetails || {};
    const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');

    // Call pickQuotation when payment is successful
    useEffect(() => {
        const processPaymentSuccess = async () => {
            if (success && quotationDetails && !hasProcessed && !isProcessing) {
                setIsProcessing(true);
                try {
                    const data = {
                        designQuotationId: quotation.id,
                        designRequestId: request.id,
                        extraRevision: extraRevision
                    };
                    
                    const response = await pickQuotation(data);
                    if (response && response.status === 200) {
                        console.log('Quotation picked successfully');
                    } else {
                        console.error('Failed to pick quotation');
                    }
                } catch (error) {
                    console.error('Error picking quotation:', error);
                } finally {
                    setIsProcessing(false);
                    setHasProcessed(true);
                }
            }
        };

        processPaymentSuccess();
    }, [success, quotationDetails, hasProcessed, isProcessing, quotation, request]);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
        }}>
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    
                    {/* Main Result Card */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: { xs: 3, md: 5 }, 
                            borderRadius: 4, 
                            textAlign: 'center', 
                            width: '100%', 
                            backgroundColor: 'white',
                            border: success ? '2px solid #52c41a' : '2px solid #f5222d',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {success ? (
                            <Stack spacing={3} alignItems="center">
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: '#f6ffed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2
                                }}>
                                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                                </Box>
                                <Typography.Title level={2} style={{ color: '#52c41a', margin: 0, fontWeight: 700 }}>
                                    Payment Successful!
                                </Typography.Title>
                                <Typography.Paragraph style={{ fontSize: '16px', color: '#475569', margin: 0, maxWidth: '500px' }}>
                                    Your payment for the design quotation has been successfully processed.
                                </Typography.Paragraph>
                                
                                {/* VNPay Transaction Details */}
                                {vnpTxnRef && (
                                    <Box sx={{ 
                                        mt: 3, 
                                        backgroundColor: 'white',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Header */}
                                        <Box sx={{
                                            p: 4,
                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                            color: 'white'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography.Title level={3} style={{ margin: 0, color: 'white', fontWeight: 700 }}>
                                                        Payment Confirmation
                                                    </Typography.Title>
                                                    <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                                                        Transaction completed successfully
                                                    </Typography.Text>
                                                </Box>
                                                <Box sx={{
                                                    px: 3,
                                                    py: 1.5,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: 3,
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                                }}>
                                                    <Typography.Text style={{
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        fontWeight: 600
                                                    }}>
                                                        SUCCESS
                                                    </Typography.Text>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ p: 4 }}>
                                            <Box sx={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                gap: 3
                                            }}>

                                                {/* Amount */}
                                                {vnpAmount && (
                                                    <Box sx={{
                                                        p: 3,
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 2,
                                                        border: '1px solid #bbf7d0',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                            <Box sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                backgroundColor: '#16a34a',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Typography.Text style={{
                                                                    color: 'white',
                                                                    fontSize: '12px',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    ₫
                                                                </Typography.Text>
                                                            </Box>
                                                            <Typography.Text style={{
                                                                color: '#166534',
                                                                fontSize: '14px',
                                                                fontWeight: 600
                                                            }}>
                                                                TRANSACTION AMOUNT
                                                            </Typography.Text>
                                                        </Box>
                                                        <Typography.Title level={3} style={{
                                                            margin: 0,
                                                            color: '#059669',
                                                            fontWeight: 700,
                                                            textAlign: 'center'
                                                        }}>
                                                            {(parseInt(vnpAmount) / 100).toLocaleString('vi-VN')} VND
                                                        </Typography.Title>
                                                    </Box>
                                                )}

                                                {/* Date */}
                                                <Box sx={{
                                                    p: 3,
                                                    backgroundColor: '#fef3c7',
                                                    borderRadius: 2,
                                                    border: '1px solid #f59e0b',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <Box sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#f59e0b',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography.Text style={{
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                📅
                                                            </Typography.Text>
                                                        </Box>
                                                        <Typography.Text style={{
                                                            color: '#92400e',
                                                            fontSize: '14px',
                                                            fontWeight: 600
                                                        }}>
                                                            PAYMENT DATE
                                                        </Typography.Text>
                                                    </Box>
                                                    <Typography.Title level={4} style={{
                                                        margin: 0,
                                                        color: '#d97706',
                                                        fontWeight: 700,
                                                        textAlign: 'center'
                                                    }}>
                                                        {new Date().toLocaleDateString('vi-VN')}
                                                    </Typography.Title>
                                                </Box>
                                            </Box>

                                            {/* Summary */}
                                            <Box sx={{
                                                mt: 4,
                                                p: 3,
                                                backgroundColor: '#f8fafc',
                                                borderRadius: 2,
                                                border: '1px solid #e2e8f0',
                                                textAlign: 'center'
                                            }}>
                                                <Typography.Text style={{
                                                    color: '#475569',
                                                    fontSize: '16px',
                                                    fontWeight: 500
                                                }}>
                                                    Your payment has been processed successfully, you will receive a confirmation email shortly.
                                                </Typography.Text>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                                
                                {/* Success Features */}
                                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                                        <Typography.Text style={{ fontSize: '14px', color: '#475569' }}>
                                            Secure Payment
                                        </Typography.Text>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ClockCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                                        <Typography.Text style={{ fontSize: '14px', color: '#475569' }}>
                                            Instant Processing
                                        </Typography.Text>
                                    </Box>
                                </Box>
                            </Stack>
                        ) : (
                            <Stack spacing={3} alignItems="center">
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: '#fff2f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2
                                }}>
                                    <CloseCircleOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                                </Box>
                                <Typography.Title level={2} style={{ color: '#f5222d', margin: 0, fontWeight: 700 }}>
                                    Payment Failed
                                </Typography.Title>
                                <Typography.Paragraph style={{ fontSize: '16px', color: '#475569', margin: 0, maxWidth: '500px' }}>
                                    There was an issue with your payment. Please check your payment method and try again.
                                </Typography.Paragraph>
                                
                                {/* VNPay Error Details */}
                                {vnpResponseCode && vnpResponseCode !== '00' && (
                                    <Box sx={{ 
                                        mt: 2, 
                                        p: 2, 
                                        backgroundColor: '#fff2f0', 
                                        borderRadius: 2,
                                        border: '1px solid #ffccc7'
                                    }}>
                                        <Typography.Text style={{ fontSize: '14px', color: '#f5222d', fontWeight: 600 }}>
                                            Response Code: {vnpResponseCode}
                                        </Typography.Text>
                                        {vnpTxnRef && (
                                            <Typography.Text style={{ fontSize: '14px', color: '#f5222d', display: 'block', mt: 1 }}>
                                                Transaction ID: {vnpTxnRef}
                                            </Typography.Text>
                                        )}
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Paper>

                    {/* Order Summary Card */}
                    {success && quotationDetails && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 3, md: 4 }, 
                                borderRadius: 4, 
                                width: '100%', 
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1976d2'
                                }}>
                                    <FileTextOutlined style={{ fontSize: '18px' }} />
                                </Box>
                                <Typography.Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                                    Order Summary
                                </Typography.Title>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Request & Designer Info */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        p: 2,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <FileTextOutlined style={{ color: '#64748b', fontSize: '16px' }} />
                                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                                <strong>Request ID:</strong>
                                            </Typography.Text>
                                        </Box>
                                        <Typography.Text style={{ color: '#1e293b', fontSize: '14px', fontWeight: 600 }}>
                                            {parseID(request.id, 'dr')}
                                        </Typography.Text>
                                    </Box>

                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        p: 2,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <UserOutlined style={{ color: '#64748b', fontSize: '16px' }} />
                                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                                <strong>Selected Designer:</strong>
                                            </Typography.Text>
                                        </Box>
                                        <Typography.Text style={{ color: '#1e293b', fontSize: '14px', fontWeight: 600 }}>
                                            {quotation.designer.customer.name}
                                        </Typography.Text>
                                    </Box>
                                </Box>

                                <Divider style={{ margin: '16px 0' }} />

                                {/* Quotation Details */}
                                <Box>
                                    <Typography.Title level={5} style={{ margin: '0 0 16px 0', color: '#475569' }}>
                                        Quotation Details
                                    </Typography.Title>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            p: 2,
                                            backgroundColor: '#fff7e6',
                                            borderRadius: 2,
                                            border: '1px solid #ffd591'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <DollarOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                                                <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                                    <strong>Quotation Price:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Title level={4} style={{ margin: 0, color: '#fa8c16', fontWeight: 700 }}>
                                                {quotation.price.toLocaleString('vi-VN')} VND
                                            </Typography.Title>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ 
                                                flex: 1, 
                                                p: 2, 
                                                backgroundColor: '#f8fafc', 
                                                borderRadius: 2,
                                                textAlign: 'center'
                                            }}>
                                                <CalendarOutlined style={{ color: '#1976d2', fontSize: '20px', marginBottom: '8px' }} />
                                                <Typography.Text style={{ color: '#475569', fontSize: '13px', display: 'block' }}>
                                                    <strong>Design Time</strong>
                                                </Typography.Text>
                                                <Typography.Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
                                                    {quotation.deliveryWithIn} days
                                                </Typography.Text>
                                            </Box>

                                            <Box sx={{ 
                                                flex: 1, 
                                                p: 2, 
                                                backgroundColor: '#f8fafc', 
                                                borderRadius: 2,
                                                textAlign: 'center'
                                            }}>
                                                <EditOutlined style={{ color: '#1976d2', fontSize: '20px', marginBottom: '8px' }} />
                                                <Typography.Text style={{ color: '#475569', fontSize: '13px', display: 'block' }}>
                                                    <strong>Max Revisions</strong>
                                                </Typography.Text>
                                                <Typography.Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
                                                    {quotation.revisionTime === 9999 ? 'Unlimited' : quotation.revisionTime}
                                                </Typography.Text>
                                            </Box>
                                        </Box>

                                        {extraRevision > 0 && (
                                            <Box sx={{ 
                                                p: 2, 
                                                backgroundColor: '#fff7e6', 
                                                borderRadius: 2,
                                                border: '1px solid #ffd591',
                                                textAlign: 'center'
                                            }}>
                                                <PlusOutlined style={{ color: '#fa8c16', fontSize: '20px', marginBottom: '8px' }} />
                                                <Typography.Text style={{ color: '#475569', fontSize: '13px', display: 'block' }}>
                                                    <strong>Extra Revisions Purchased</strong>
                                                </Typography.Text>
                                                <Typography.Text style={{ color: '#fa8c16', fontSize: '16px', fontWeight: 'bold' }}>
                                                    {extraRevision} additional revisions - {(extraRevision * (quotation.extraRevisionPrice || 0)).toLocaleString('vi-VN')} VND
                                                </Typography.Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px', mb: 4 }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ArrowRightOutlined />}
                            style={{ 
                                height: '48px',
                                fontSize: '16px',
                                fontWeight: 600,
                                backgroundColor: '#1976d2',
                                borderColor: '#1976d2'
                            }}
                            onClick={() => {
                                // Clear sessionStorage after successful processing
                                sessionStorage.removeItem('paymentQuotationDetails');
                                sessionStorage.removeItem('extraRevision');
                                window.location.href = '/school/design'
                            }}
                        >
                            Go to Design Management
                        </Button>
                        
                        {!success && (
                            <Button 
                                size="large"
                                style={{ 
                                    height: '48px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    borderColor: '#d9d9d9',
                                    color: '#475569'
                                }}
                                onClick={() => window.history.back()}
                            >
                                Try Again
                            </Button>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}