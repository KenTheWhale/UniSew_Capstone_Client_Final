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
import {buyExtraRevision, pickQuotation} from "../../services/DesignService.jsx";
import {approveQuotation} from "../../services/OrderService.jsx";
import {createDesignTransaction, createOrderTransaction, createDepositTransaction} from "../../services/PaymentService.jsx";
import {useEffect, useState} from 'react';

export default function PaymentResult() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const [isProcessing, setIsProcessing] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(() => {
        // Check if payment has already been processed from localStorage
        const processedKey = `payment_processed_${urlParams.get('vnp_TxnRef')}`;
        return localStorage.getItem(processedKey) === 'true';
    });
    const [isInitialRender, setIsInitialRender] = useState(true);

    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    const vnpAmount = urlParams.get('vnp_Amount');
    const vnpOrderInfo = urlParams.get('vnp_OrderInfo');
    const vnpTxnRef = urlParams.get('vnp_TxnRef');
    const paymentType = sessionStorage.getItem('currentPaymentType') || 'design'; // Get payment type from sessionStorage
    const quotationId = urlParams.get('quotationId'); // Get quotation ID for order payment

    let success = false;
    let quotationDetails = null;
    let orderDetails = null;
    let revisionPurchaseDetails = null;
    let isOrderPayment = paymentType === 'order';
    let isRevisionPurchase = paymentType === 'revision';
    let isDepositPayment = paymentType === 'deposit';

    // Check if we have valid payment data
    const hasDesignPayment = !isOrderPayment && !isRevisionPurchase && !isDepositPayment && !!sessionStorage.getItem('paymentQuotationDetails');
    const hasOrderPayment = (isOrderPayment || isDepositPayment) && !!sessionStorage.getItem('paymentQuotationDetails');
    const hasRevisionPurchase = isRevisionPurchase && !!sessionStorage.getItem('revisionPurchaseDetails');

    // Debug logs
    console.log('PaymentResult Debug:', {
        paymentType,
        isOrderPayment,
        isRevisionPurchase,
        isDepositPayment,
        hasDesignPayment: !!hasDesignPayment,
        hasOrderPayment: !!hasOrderPayment,
        hasRevisionPurchase: !!hasRevisionPurchase,
        revisionPurchaseDetails: sessionStorage.getItem('revisionPurchaseDetails'),
        currentPaymentType: sessionStorage.getItem('currentPaymentType'),
        vnpResponseCode,
        success: vnpResponseCode === '00'
    });

    // Only redirect if no payment data AND no VNPay response AND this is initial render
    if (!hasDesignPayment && !hasOrderPayment && !hasRevisionPurchase && vnpResponseCode === null && isInitialRender) {
        console.log('No valid payment data found and no VNPay response on initial render, redirecting to /school/design');
        window.location.href = '/school/design';
    }

    if (vnpResponseCode !== null) {
        success = vnpResponseCode === '00';

        // Parse payment details regardless of success/failure
        try {
            if (isOrderPayment || isDepositPayment) {
                // For order payments (including deposit), get from session storage
                const storedOrderDetails = sessionStorage.getItem('paymentQuotationDetails');
                if (storedOrderDetails) {
                    orderDetails = JSON.parse(storedOrderDetails);
                }
            } else if (isRevisionPurchase) {
                // For revision purchase payments, get from session storage
                const storedRevisionDetails = sessionStorage.getItem('revisionPurchaseDetails');
                if (storedRevisionDetails) {
                    revisionPurchaseDetails = JSON.parse(storedRevisionDetails);
                }
            } else {
                // For design payments, get from session storage
                const storedQuotationDetails = sessionStorage.getItem('paymentQuotationDetails');
                if (storedQuotationDetails) {
                    try {
                        quotationDetails = JSON.parse(storedQuotationDetails);
                        console.log('Parsed quotation details:', quotationDetails);
                        console.log('quotationDetails structure:', {
                            hasQuotation: !!quotationDetails?.quotation,
                            hasRequest: !!quotationDetails?.request,
                            quotationKeys: quotationDetails?.quotation ? Object.keys(quotationDetails.quotation) : null,
                            requestKeys: quotationDetails?.request ? Object.keys(quotationDetails.request) : null
                        });
                    } catch (error) {
                        console.error('Error parsing quotation details:', error);
                        quotationDetails = null;
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing payment details:', error);
        }
    } else {
        // Only redirect if we have a payment type but no VNPay response AND this is initial render
        if (paymentType && isInitialRender) {
            console.log('No VNPay response but have payment type on initial render, redirecting based on type');
            if (isOrderPayment) {
                window.location.href = '/school/order';
            } else if (isRevisionPurchase) {
                window.location.href = '/school/chat';
            } else {
                window.location.href = '/school/design';
            }
        }
    }

    const {quotation, request, serviceFee: designServiceFee, subtotal, totalAmount} = quotationDetails || {};
    const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');

    // Handle successful payment
    const handleSuccessfulPayment = async () => {
        console.log('Processing successful payment');

        if (isDepositPayment && quotationId && orderDetails) {
            await handleSuccessfulDeposit();
        } else if (isOrderPayment && quotationId && orderDetails) {
            console.log('Full order payment completed - no additional API call needed');
        } else if (isRevisionPurchase && revisionPurchaseDetails) {
            await handleSuccessfulRevision();
        } else if (quotationDetails) {
            await handleSuccessfulDesign();
        }
    };

    // Handle failed payment
    const handleFailedPayment = async () => {
        console.log('Processing failed payment');

        if (isDepositPayment) {
            await handleFailedDeposit();
        } else if (isOrderPayment) {
            await handleFailedOrder();
        } else if (quotationDetails) {
            await handleFailedDesign();
        }
    };

    // Helper functions for successful payments
    const handleSuccessfulDeposit = async () => {
        console.log('handleSuccessfulDeposit called');
        const data = {
            quotationId: parseInt(quotationId),
            createTransactionRequest: {
                type: "deposit",
                receiverId: orderDetails.quotation.garmentId,
                itemId: orderDetails.order.id,
                totalPrice: parseInt(vnpAmount) / 100,
                gatewayCode: vnpResponseCode,
                serviceFee: orderDetails.serviceFee,
                payFromWallet: false
            }
        };

        const response = await approveQuotation(data);
        if (response && response.status === 201) {
            console.log('Deposit payment processed successfully');
        } else {
            console.error('Failed to process deposit payment:', response);
        }
    };

    const handleSuccessfulRevision = async () => {
        console.log('handleSuccessfulRevision called');
        const response = await buyExtraRevision(
            revisionPurchaseDetails.requestId,
            revisionPurchaseDetails.revisionQuantity,
            revisionPurchaseDetails.designerId,
            parseInt(vnpAmount) / 100,
            vnpResponseCode
        );

        if (response && response.status === 200) {
            console.log('Extra revisions purchased successfully');
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            console.error('Failed to purchase extra revisions');
        }
    };

    const handleSuccessfulDesign = async () => {
        console.log('handleSuccessfulDesign called');
        const data = {
            designQuotationId: quotation.id,
            designRequestId: request.id,
            extraRevision: extraRevision,
            serviceFee: designServiceFee || 0,
            createTransactionRequest: {
                type: "design",
                receiverId: quotation.designer.id,
                itemId: request.id,
                totalPrice: parseInt(vnpAmount) / 100,
                gatewayCode: vnpResponseCode,
                serviceFee: designServiceFee || 0,
                payFromWallet: false
            }
        };

        const response = await pickQuotation(data);
        if (response && response.status === 200) {
            console.log('Design quotation picked successfully');
        } else {
            console.error('Failed to pick design quotation');
        }
    };

    // Helper functions for failed payments
    const handleFailedDeposit = async () => {
        console.log('handleFailedDeposit called');
        if (!orderDetails) return;

        const response = await createDepositTransaction(
            orderDetails.quotation.garmentId,
            orderDetails.order.id,
            parseInt(vnpAmount) / 100,
            vnpResponseCode,
            orderDetails.serviceFee,
            false
        );
        if (response && response.status === 201) {
            console.log('Failed deposit payment transaction recorded successfully');
        } else {
            console.error('Failed to record deposit payment transaction:', response);
        }
    };

    const handleFailedOrder = async () => {
        console.log('handleFailedOrder called');
        if (!orderDetails) return;

        const response = await createOrderTransaction(
            orderDetails.quotation.garmentId,
            orderDetails.order.id,
            parseInt(vnpAmount) / 100,
            vnpResponseCode,
            isDepositPayment ? orderDetails.serviceFee : 0,
            false
        );
        if (response && response.status === 201) {
            console.log('Failed order/deposit payment transaction recorded successfully');
        } else {
            console.error('Failed to record order/deposit payment transaction:', response);
        }
    };

    const handleFailedDesign = async () => {
        console.log('handleFailedDesign called');
        if (!quotation || !request) {
            console.error('Missing quotation or request data');
            return;
        }

        const response = await createDesignTransaction(
            quotation.designer?.id,
            request.id,
            parseInt(vnpAmount) / 100,
            vnpResponseCode,
            designServiceFee || 0,
            false
        );
        if (response && response.status === 201) {
            console.log('Failed design payment transaction recorded successfully');
        } else {
            console.error('Failed to record design payment transaction:', response);
        }
    };

    // Set isInitialRender to false after first render
    useEffect(() => {
        setIsInitialRender(false);
    }, []);

    // Process payment success and failure
    useEffect(() => {
        const processPayment = async () => {
            // Prevent duplicate processing
            if (hasProcessed || isProcessing || vnpResponseCode === null) {
                return;
            }

            console.log('Processing payment:', {
                success,
                paymentType,
                vnpResponseCode,
                vnpAmount
            });

            setIsProcessing(true);

            try {
                if (success) {
                    await handleSuccessfulPayment();
                } else {
                    await handleFailedPayment();
                }
            } catch (error) {
                console.error('Error processing payment:', error);
            } finally {
                setIsProcessing(false);
                setHasProcessed(true);

                // Save processing status to localStorage
                const processedKey = `payment_processed_${vnpTxnRef}`;
                localStorage.setItem(processedKey, 'true');
            }
        };

        processPayment();
    }, [success, quotationDetails, hasProcessed, isProcessing, quotation, request, isOrderPayment, quotationId, isRevisionPurchase, revisionPurchaseDetails]);

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
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>

                    {/* Main Result Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: {xs: 3, md: 5},
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
                                    <CheckCircleOutlined style={{fontSize: '48px', color: '#52c41a'}}/>
                                </Box>
                                <Typography.Title level={2} style={{color: '#52c41a', margin: 0, fontWeight: 700}}>
                                    Payment Successful!
                                </Typography.Title>
                                <Typography.Paragraph
                                    style={{fontSize: '16px', color: '#475569', margin: 0, maxWidth: '500px'}}>
                                    {isOrderPayment
                                        ? 'Your payment for the order has been successfully processed.'
                                        : isDepositPayment
                                            ? 'Your deposit payment for the order has been successfully processed.'
                                            : isRevisionPurchase
                                                ? 'Your payment for extra revisions has been successfully processed.'
                                                : 'Your payment for the design quotation has been successfully processed.'
                                    }
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
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
                                                    <CheckCircleOutlined style={{color: 'white', fontSize: '24px'}}/>
                                                </Box>
                                                <Box sx={{flex: 1}}>
                                                    <Typography.Title level={3} style={{
                                                        margin: 0,
                                                        color: 'white',
                                                        fontWeight: 700
                                                    }}>
                                                        Payment Confirmation
                                                    </Typography.Title>
                                                    <Typography.Text
                                                        style={{color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px'}}>
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
                                        <Box sx={{p: 4}}>
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
                                                        <Box
                                                            sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
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
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
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
                                                        {new Date().toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
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
                                                    Your payment has been processed successfully, you will receive a
                                                    confirmation email shortly.
                                                </Typography.Text>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                {/* Success Features */}
                                <Box sx={{display: 'flex', gap: 3, mt: 2}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <SafetyCertificateOutlined style={{color: '#52c41a', fontSize: '16px'}}/>
                                        <Typography.Text style={{fontSize: '14px', color: '#475569'}}>
                                            Secure Payment
                                        </Typography.Text>
                                    </Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <ClockCircleOutlined style={{color: '#52c41a', fontSize: '16px'}}/>
                                        <Typography.Text style={{fontSize: '14px', color: '#475569'}}>
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
                                    <CloseCircleOutlined style={{fontSize: '48px', color: '#f5222d'}}/>
                                </Box>
                                <Typography.Title level={2} style={{color: '#f5222d', margin: 0, fontWeight: 700}}>
                                    Payment Failed
                                </Typography.Title>
                                <Typography.Paragraph
                                    style={{fontSize: '16px', color: '#475569', margin: 0, maxWidth: '500px'}}>
                                    There was an issue with your payment. Please check your payment method and try
                                    again.
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
                                        <Typography.Text style={{fontSize: '14px', color: '#f5222d', fontWeight: 600}}>
                                            Response Code: {vnpResponseCode}
                                        </Typography.Text>
                                        {vnpTxnRef && (
                                            <Typography.Text
                                                style={{fontSize: '14px', color: '#f5222d', display: 'block', mt: 1}}>
                                                Transaction ID: {vnpTxnRef}
                                            </Typography.Text>
                                        )}
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Paper>

                    {/* Order Summary Card */}
                    {success && (quotationDetails || orderDetails || revisionPurchaseDetails) && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: {xs: 3, md: 4},
                                borderRadius: 4,
                                width: '100%',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
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
                                    <FileTextOutlined style={{fontSize: '18px'}}/>
                                </Box>
                                <Typography.Title level={4} style={{margin: 0, color: '#1e293b'}}>
                                    {isOrderPayment ? 'Order Payment Summary' : isDepositPayment ? 'Deposit Payment Summary' : isRevisionPurchase ? 'Revision Purchase Summary' : 'Design Order Summary'}
                                </Typography.Title>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                {(isOrderPayment || isDepositPayment) ? (
                                    /* Order Payment Info */
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 2
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <FileTextOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Payment Type:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {isDepositPayment ? 'Deposit Payment' : 'Order Payment'}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <FileTextOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Order ID:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {parseID(orderDetails?.order?.id, 'ord')}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <UserOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Garment Factory:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {orderDetails?.quotation?.garment?.customer?.business || 'Unknown Factory'}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <UserOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Description:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {isDepositPayment ? 'Deposit for Order Payment' : (orderDetails?.description || 'Order Payment')}
                                            </Typography.Text>
                                        </Box>
                                    </Box>
                                ) : isRevisionPurchase ? (
                                    /* Revision Purchase Info */
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 2
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <FileTextOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Request ID:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {parseID(revisionPurchaseDetails?.requestId, 'dr')}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <EditOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Revisions Purchased:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {revisionPurchaseDetails?.revisionQuantity} revision{revisionPurchaseDetails?.revisionQuantity !== 1 ? 's' : ''}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <DollarOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Price per Revision:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {revisionPurchaseDetails?.extraRevisionPrice?.toLocaleString('vi-VN')} VND
                                            </Typography.Text>
                                        </Box>
                                    </Box>
                                ) : (
                                    /* Design Request Info */
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 2
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <FileTextOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Request ID:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {parseID(request?.id, 'dr')}
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
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <UserOutlined style={{color: '#64748b', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Selected Designer:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text
                                                style={{color: '#1e293b', fontSize: '14px', fontWeight: 600}}>
                                                {quotation?.designer?.customer?.name}
                                            </Typography.Text>
                                        </Box>
                                    </Box>
                                )}

                                <Divider style={{margin: '16px 0'}}/>

                                {/* Payment Details */}
                                <Box>
                                    <Typography.Title level={4} style={{
                                        margin: '0 0 16px 0',
                                        color: '#475569',
                                        fontSize: '16px'
                                    }}>
                                        Payment Details
                                    </Typography.Title>

                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            backgroundColor: '#fff7e6',
                                            borderRadius: 2,
                                            border: '1px solid #ffd591'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <DollarOutlined style={{color: '#fa8c16', fontSize: '16px'}}/>
                                                <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                    <strong>Payment Amount:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Title level={4}
                                                              style={{margin: 0, color: '#fa8c16', fontWeight: 700}}>
                                                {
                                                    (parseInt(vnpAmount) / 100).toLocaleString('vi-VN') + ' VND'
                                                }
                                            </Typography.Title>
                                        </Box>

                                        {isDepositPayment && (
                                            <>
                                                {/* Service Fee for Deposit */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 2,
                                                    backgroundColor: '#f0f9ff',
                                                    borderRadius: 2,
                                                    border: '1px solid #bae6fd'
                                                }}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <FileTextOutlined style={{color: '#0284c7', fontSize: '16px'}}/>
                                                        <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                                            <strong>Service Fee:</strong>
                                                        </Typography.Text>
                                                    </Box>
                                                    <Typography.Text
                                                        style={{color: '#0284c7', fontSize: '14px', fontWeight: 600}}>
                                                        {orderDetails.serviceFee.toLocaleString('vi-VN')} VND
                                                    </Typography.Text>
                                                </Box>
                                            </>
                                        )}

                                        {!isOrderPayment && !isDepositPayment && !isRevisionPurchase && (
                                            <>
                                                {/* Service Fee for Design Payment */}
                                                {designServiceFee && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 2,
                                                        backgroundColor: '#f0f9ff',
                                                        borderRadius: 2,
                                                        border: '1px solid #bae6fd'
                                                    }}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <FileTextOutlined
                                                                style={{color: '#0284c7', fontSize: '16px'}}/>
                                                            <Typography.Text
                                                                style={{color: '#475569', fontSize: '14px'}}>
                                                                <strong>Service Fee:</strong>
                                                            </Typography.Text>
                                                        </Box>
                                                        <Typography.Text style={{
                                                            color: '#0284c7',
                                                            fontSize: '14px',
                                                            fontWeight: 600
                                                        }}>
                                                            {designServiceFee.toLocaleString('vi-VN')} VND
                                                        </Typography.Text>
                                                    </Box>
                                                )}

                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Box sx={{
                                                        flex: 1,
                                                        p: 2,
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: 2,
                                                        textAlign: 'center'
                                                    }}>
                                                        <CalendarOutlined style={{
                                                            color: '#1976d2',
                                                            fontSize: '20px',
                                                            marginBottom: '8px'
                                                        }}/>
                                                        <Typography.Text style={{
                                                            color: '#475569',
                                                            fontSize: '13px',
                                                            display: 'block'
                                                        }}>
                                                            <strong>Design Time</strong>
                                                        </Typography.Text>
                                                        <Typography.Text style={{
                                                            color: '#1e293b',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {quotation?.deliveryWithIn} days
                                                        </Typography.Text>
                                                    </Box>

                                                    <Box sx={{
                                                        flex: 1,
                                                        p: 2,
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: 2,
                                                        textAlign: 'center'
                                                    }}>
                                                        <EditOutlined style={{
                                                            color: '#1976d2',
                                                            fontSize: '20px',
                                                            marginBottom: '8px'
                                                        }}/>
                                                        <Typography.Text style={{
                                                            color: '#475569',
                                                            fontSize: '13px',
                                                            display: 'block'
                                                        }}>
                                                            <strong>Max Revisions</strong>
                                                        </Typography.Text>
                                                        <Typography.Text style={{
                                                            color: '#1e293b',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {quotation?.revisionTime === 9999 ? 'Unlimited' : quotation?.revisionTime}
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
                                                        <PlusOutlined style={{
                                                            color: '#fa8c16',
                                                            fontSize: '20px',
                                                            marginBottom: '8px'
                                                        }}/>
                                                        <Typography.Text style={{
                                                            color: '#475569',
                                                            fontSize: '13px',
                                                            display: 'block'
                                                        }}>
                                                            <strong>Extra Revisions Purchased</strong>
                                                        </Typography.Text>
                                                        <Typography.Text style={{
                                                            color: '#fa8c16',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {extraRevision} additional revisions
                                                            - {(extraRevision * (quotation?.extraRevisionPrice || 0)).toLocaleString('vi-VN')} VND
                                                        </Typography.Text>
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        width: '100%',
                        maxWidth: '400px',
                        mb: 4
                    }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ArrowRightOutlined/>}
                            style={{
                                height: '48px',
                                fontSize: '16px',
                                fontWeight: 600,
                                backgroundColor: '#1976d2',
                                borderColor: '#1976d2'
                            }}
                            onClick={() => {
                                // Clear sessionStorage and localStorage after successful processing
                                if (isOrderPayment || isDepositPayment) {
                                    sessionStorage.removeItem('paymentQuotationDetails');
                                    sessionStorage.removeItem('currentPaymentType');
                                    // Clear payment processed status
                                    const processedKey = `payment_processed_${vnpTxnRef}`;
                                    localStorage.removeItem(processedKey);
                                    window.location.href = '/school/order';
                                } else if (isRevisionPurchase) {
                                    sessionStorage.removeItem('revisionPurchaseDetails');
                                    sessionStorage.removeItem('currentPaymentType');
                                    // Clear payment processed status
                                    const processedKey = `payment_processed_${vnpTxnRef}`;
                                    localStorage.removeItem(processedKey);
                                    window.location.href = '/school/chat';
                                } else {
                                    sessionStorage.removeItem('paymentQuotationDetails');
                                    sessionStorage.removeItem('extraRevision');
                                    sessionStorage.removeItem('currentPaymentType');
                                    // Clear payment processed status
                                    const processedKey = `payment_processed_${vnpTxnRef}`;
                                    localStorage.removeItem(processedKey);
                                    window.location.href = '/school/design';
                                }
                            }}
                        >
                            {isOrderPayment || isDepositPayment ? 'Go to Order Management' : isRevisionPurchase ? 'Go to Design Chat' : 'Go to Design Management'}
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
                                onClick={() => {
                                    // Clear payment processed status when trying again
                                    const processedKey = `payment_processed_${vnpTxnRef}`;
                                    localStorage.removeItem(processedKey);
                                    sessionStorage.removeItem('currentPaymentType');

                                    if (isOrderPayment || isDepositPayment) {
                                        window.location.href = '/school/order';
                                    } else if (isRevisionPurchase) {
                                        window.location.href = '/school/chat';
                                    } else {
                                        window.location.href = '/school/design';
                                    }
                                }}
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