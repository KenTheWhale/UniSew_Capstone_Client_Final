import React, { useState, useEffect, useCallback } from 'react';
import {Button, Modal, Spin, Typography, Radio} from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EditOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined,
    WalletOutlined
} from '@ant-design/icons';
import {Box, Chip, Paper} from '@mui/material';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";
import {getPhoneLink} from "../../../../utils/PhoneUtil.jsx";
import {getPaymentUrl, getPaymentUrlUsingWallet, getWalletBalance} from "../../../../services/PaymentService.jsx";
import {enqueueSnackbar} from "notistack";
import {serviceFee} from "../../../../configs/FixedVariables.jsx";
import {getConfigByKey, configKey} from "../../../../services/SystemService.jsx";

export default function DesignPaymentPopup({visible, onCancel, selectedQuotationDetails}) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [businessConfig, setBusinessConfig] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loadingWallet, setLoadingWallet] = useState(false);

    // Fetch business configuration and wallet balance on component mount
    useEffect(() => {
        const fetchBusinessConfig = async () => {
            try {
                const response = await getConfigByKey(configKey.business);
                if (response?.status === 200 && response.data?.body?.business) {
                    setBusinessConfig(response.data.body.business);
                }
            } catch (error) {
                console.error('Error fetching business config:', error);
            }
        };

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

        if (visible) {
            fetchBusinessConfig();
            fetchWalletBalance();
        }
    }, [visible]);

    // Service fee calculation using API config
    const calculateServiceFee = useCallback((amount) => {
        if (businessConfig?.serviceRate) {
            return Math.round(amount * businessConfig.serviceRate);
        }
        // Fallback to hardcoded serviceFee function if API config is not available
        return serviceFee(amount);
    }, [businessConfig]);

    // Calculate total amount for payment
    const calculateTotalAmount = useCallback(() => {
        if (!selectedQuotationDetails) return 0;
        const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
        const rawSubtotal = selectedQuotationDetails.quotation.price + (extraRevision * (selectedQuotationDetails.quotation.extraRevisionPrice || 0));
        const subtotal = Math.round(rawSubtotal);
        const fee = Math.round(calculateServiceFee(subtotal));
        return Math.round(subtotal + fee);
    }, [selectedQuotationDetails, calculateServiceFee]);

    // Check if wallet has sufficient balance
    const hasInsufficientBalance = useCallback(() => {
        if (paymentMethod !== 'wallet') return false;
        const totalAmount = calculateTotalAmount();
        return walletBalance < totalAmount;
    }, [paymentMethod, walletBalance, calculateTotalAmount]);

    if (!selectedQuotationDetails) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                    gap: 2
                }}>
                    <Spin size="large"/>
                    <Typography.Text style={{color: '#64748b'}}>
                        Loading payment details...
                    </Typography.Text>
                </Box>
            </Modal>
        );
    }

    const {quotation, request} = selectedQuotationDetails;

    const handleProceedToPayment = async () => {
        setIsLoading(true);
        setLoadingMessage('Preparing payment details...');
        
        try {
            const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
            const rawSubtotal = quotation.price + (extraRevision * (quotation.extraRevisionPrice || 0));
            const subtotal = Math.round(rawSubtotal);
            const fee = Math.round(calculateServiceFee(subtotal));
            const totalAmount = Math.round(subtotal + fee);

            const quotationDetailsToStore = {
                quotation: quotation,
                request: request,
                serviceFee: fee,
                subtotal: subtotal,
                totalAmount: totalAmount
            };
            sessionStorage.setItem('paymentQuotationDetails', JSON.stringify(quotationDetailsToStore));
            sessionStorage.setItem('currentPaymentType', 'design');

            if (paymentMethod === 'wallet') {
                // Wallet payment flow
                setLoadingMessage('Processing wallet payment...');
                localStorage.setItem('paymentMethod', 'wallet');
                
                const walletPaymentUrl = getPaymentUrlUsingWallet(totalAmount);
                setLoadingMessage('Redirecting to payment result...');
                
                setTimeout(() => {
                    window.location.href = walletPaymentUrl;
                }, 500);
            } else {
                // Gateway payment flow (existing logic)
                setLoadingMessage('Connecting to payment gateway...');
                localStorage.setItem('paymentMethod', 'gateway');
                
                const response = await getPaymentUrl(
                    totalAmount,
                    `Payment for design quotation - Design Request ${parseID(request.id, 'dr')}`,
                    'design',
                    '/school/payment/result'
                );

                if (response && response.status === 200) {
                    setLoadingMessage('Redirecting to secure payment...');
                    setTimeout(() => {
                        window.location.href = response.data.body.url;
                    }, 500);
                } else {
                    enqueueSnackbar('Failed to generate payment URL. Please try again.', {variant: 'error'});
                    setIsLoading(false);
                    setLoadingMessage('');
                }
            }
        } catch (error) {
            console.error('Payment URL generation error:', error);
            enqueueSnackbar('Error generating payment URL. Please try again.', {variant: 'error'});
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <Modal
            title={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <DollarOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                    <Typography.Title level={4} style={{margin: 0, color: '#1e293b'}}>
                        Payment Details
                    </Typography.Title>
                    <Chip
                        label={`${parseID(request.id, 'dr')}`}
                        color="success"
                        size="small"
                        style={{backgroundColor: '#2e7d32'}}
                    />
                </Box>
            }
            open={visible}
            onCancel={!isLoading ? onCancel : undefined}
            centered
            footer={[
                <Button 
                    key="back" 
                    onClick={onCancel} 
                    disabled={isLoading}
                    style={{marginRight: 8}}
                >
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleProceedToPayment}
                    loading={isLoading}
                    disabled={hasInsufficientBalance()}
                    icon={!isLoading ? (paymentMethod === 'wallet' ? <WalletOutlined/> : <CreditCardOutlined/>) : null}
                    style={{
                        backgroundColor: hasInsufficientBalance() ? '#d1d5db' : '#2e7d32',
                        borderColor: hasInsufficientBalance() ? '#d1d5db' : '#2e7d32'
                    }}
                >
                    {isLoading ? (loadingMessage || 'Processing...') : 
                     hasInsufficientBalance() ? 'Insufficient Wallet Balance' : 
                     `Proceed to Payment${paymentMethod === 'wallet' ? ' (Wallet)' : ' (Gateway)'}`}
                </Button>,
            ]}
            width={800}
            styles={{
                body: {
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: '24px'
                },
                header: {
                    borderBottom: '1px solid #e2e8f0',
                    padding: '20px 24px'
                }
            }}
        >
            <Box sx={{width: '100%', position: 'relative'}}>
                {/* Loading overlay */}
                {isLoading && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        borderRadius: 2
                    }}>
                        <Spin size="large" />
                        <Typography.Text style={{
                            marginTop: 16,
                            color: '#2e7d32',
                            fontSize: '16px',
                            fontWeight: 600
                        }}>
                            {loadingMessage || 'Processing...'}
                        </Typography.Text>
                        <Typography.Text style={{
                            marginTop: 8,
                            color: '#64748b',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            Please do not close this window
                        </Typography.Text>
                    </Box>
                )}
                
                {/* Payment Summary */}
                <Box sx={{
                    mb: 4,
                    p: 3,
                    background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                    borderRadius: 2,
                    border: '1px solid rgba(46, 125, 50, 0.1)'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                        <InfoCircleOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                        <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                            Payment Summary
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                        Please select your payment method and review the payment details below.
                    </Typography.Text>
                </Box>

                {/* Payment Method Selection */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                        }
                    }}
                >
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
                            <CreditCardOutlined style={{fontSize: '18px'}}/>
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                Payment Method
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                Choose how you want to pay
                            </Typography.Text>
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
                                            <CreditCardOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                                            <Box sx={{flex: 1}}>
                                                <Typography.Text style={{color: '#1e293b', fontWeight: 600, fontSize: '16px'}}>
                                                    Payment Gateway
                                                </Typography.Text>
                                                <Typography.Text style={{color: '#64748b', fontSize: '14px', display: 'block'}}>
                                                    Pay securely with VNPay, credit/debit cards, or bank transfer
                                                </Typography.Text>
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
                                            <Typography.Text style={{
                                                color: '#64748b',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                lineHeight: '1.2'
                                            }}>
                                                Secure payment
                                            </Typography.Text>
                                            <Box sx={{height: '16px'}} /> {/* Placeholder to maintain height consistency */}
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
                                            <WalletOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                                            <Box sx={{flex: 1}}>
                                                <Typography.Text style={{color: '#1e293b', fontWeight: 600, fontSize: '16px'}}>
                                                    UniSew Wallet
                                                </Typography.Text>
                                                <Typography.Text style={{color: '#64748b', fontSize: '14px', display: 'block'}}>
                                                    Pay instantly from your wallet balance
                                                </Typography.Text>
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
                                                    <Typography.Text style={{
                                                        color: hasInsufficientBalance() ? '#ef4444' : '#2e7d32',
                                                        fontWeight: 600,
                                                        fontSize: '16px',
                                                        display: 'block',
                                                        lineHeight: '1.2'
                                                    }}>
                                                        {walletBalance.toLocaleString('vi-VN')} VND
                                                    </Typography.Text>
                                                    {hasInsufficientBalance() ? (
                                                        <Typography.Text style={{
                                                            color: '#ef4444',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            lineHeight: '1.2'
                                                        }}>
                                                            Insufficient balance
                                                        </Typography.Text>
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
                </Paper>

                {/* Designer Information */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                        }
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <InfoCircleOutlined style={{fontSize: '18px'}}/>
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                Designer Information
                            </Typography.Title>
                        </Box>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                <strong>Name:</strong> {quotation.designer.customer.name}
                            </Typography.Text>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                <strong>Email:</strong> {quotation.designer.customer.account.email}
                            </Typography.Text>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                <strong>Phone:</strong>
                            </Typography.Text>
                            <Typography.Text
                                style={{
                                    color: '#475569',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                }}
                                onClick={() => window.open(getPhoneLink(quotation.designer.customer.phone), '_blank')}
                            >
                                {quotation.designer.customer.phone}
                            </Typography.Text>
                        </Box>
                    </Box>
                </Paper>

                {}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                        }
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <DollarOutlined style={{fontSize: '18px'}}/>
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                Design Quotation Details
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                Custom Quotation
                            </Typography.Text>
                        </Box>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                            borderRadius: 2,
                            border: '1px solid rgba(46, 125, 50, 0.1)'
                        }}>
                            <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                                <strong>Quotation Price:</strong>
                            </Typography.Text>
                            <Typography.Title level={4} style={{margin: 0, color: '#2e7d32'}}>
                                {quotation.price.toLocaleString('vi-VN')} VND
                            </Typography.Title>
                        </Box>

                        <Box sx={{display: 'flex', gap: 3}}>
                            <Box sx={{
                                flex: 1,
                                p: 2,
                                background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                                borderRadius: 2,
                                textAlign: 'center',
                                border: '1px solid rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.15)'
                                }
                            }}>
                                <CalendarOutlined style={{color: '#2e7d32', fontSize: '20px', marginBottom: '8px'}}/>
                                <Typography.Text style={{color: '#475569', fontSize: '13px', display: 'block'}}>
                                    <strong>Design Time</strong>
                                </Typography.Text>
                                <Typography.Text style={{color: '#1e293b', fontSize: '16px', fontWeight: 'bold'}}>
                                    {quotation.deliveryWithIn} days
                                </Typography.Text>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                p: 2,
                                background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                                borderRadius: 2,
                                textAlign: 'center',
                                border: '1px solid rgba(46, 125, 50, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.15)'
                                }
                            }}>
                                <EditOutlined style={{color: '#2e7d32', fontSize: '20px', marginBottom: '8px'}}/>
                                <Typography.Text style={{color: '#475569', fontSize: '13px', display: 'block'}}>
                                    <strong>Max Revisions</strong>
                                </Typography.Text>
                                <Typography.Text style={{color: '#1e293b', fontSize: '16px', fontWeight: 'bold'}}>
                                    {quotation.revisionTime === 9999 ? 'Unlimited' : quotation.revisionTime}
                                </Typography.Text>
                            </Box>
                        </Box>

                        {}
                        {(() => {
                            const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
                            return extraRevision > 0 ? (
                                <Box sx={{
                                    p: 2,
                                    background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)",
                                    borderRadius: 2,
                                    border: '1px solid rgba(255, 193, 7, 0.3)',
                                    textAlign: 'center',
                                    mt: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)'
                                    }
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mb: 1
                                    }}>
                                        <EditOutlined style={{color: '#f57c00', fontSize: '16px'}}/>
                                        <Typography.Text style={{color: '#f57c00', fontWeight: 600, fontSize: '14px'}}>
                                            Extra Revisions Purchased
                                        </Typography.Text>
                                    </Box>
                                    <Typography.Text style={{color: '#f57c00', fontSize: '16px', fontWeight: 'bold'}}>
                                        {extraRevision} additional revisions
                                        - {(extraRevision * (quotation.extraRevisionPrice || 0)).toLocaleString('vi-VN')} VND
                                    </Typography.Text>
                                </Box>
                            ) : null;
                        })()}
                    </Box>
                </Paper>

                {}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                        }
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <DollarOutlined style={{fontSize: '18px'}}/>
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                Service Fee
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                {businessConfig?.serviceRate 
                                    ? `Platform service charge (${(businessConfig.serviceRate * 100).toFixed(0)}%)`
                                    : 'Platform service charge'
                                }
                            </Typography.Text>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        background: "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.15) 100%)",
                        borderRadius: 2,
                        border: '1px solid rgba(255, 152, 0, 0.2)'
                    }}>
                        <Typography.Text style={{color: '#475569', fontSize: '14px'}}>
                            <strong>Service Fee{businessConfig?.serviceRate ? ` (${(businessConfig.serviceRate * 100).toFixed(0)}%)` : ''}:</strong>
                        </Typography.Text>
                        <Typography.Title level={4} style={{margin: 0, color: '#f57c00'}}>
                            {(() => {
                                const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
                                const rawSubtotal = quotation.price + (extraRevision * (quotation.extraRevisionPrice || 0));
                                const subtotal = Math.round(rawSubtotal);
                                const fee = Math.round(calculateServiceFee(subtotal));
                                return fee.toLocaleString('vi-VN') + ' VND';
                            })()}
                        </Typography.Title>
                    </Box>
                </Paper>

                {}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                        borderRadius: 3,
                        border: '1px solid rgba(46, 125, 50, 0.1)'
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                        <SafetyCertificateOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                        <Typography.Title level={6} style={{margin: 0, color: '#2e7d32'}}>
                            Secure Payment
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{fontSize: '13px'}}>
                        Your payment will be processed through our secure payment gateway. All transactions are
                        encrypted and protected.
                    </Typography.Text>
                </Paper>

                {}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: '2px solid #2e7d32',
                        borderRadius: 3,
                        background: "linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)",
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(46, 125, 50, 0.2)'
                        }
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <CheckCircleOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                            <Typography.Title level={5} style={{margin: 0, color: '#2e7d32'}}>
                                Total Amount
                            </Typography.Title>
                        </Box>
                        <Typography.Title level={3} style={{margin: 0, color: '#2e7d32', fontWeight: 'bold'}}>
                            {(() => {
                                const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
                                const rawSubtotal = quotation.price + (extraRevision * (quotation.extraRevisionPrice || 0));
                                const subtotal = Math.round(rawSubtotal);
                                const fee = Math.round(calculateServiceFee(subtotal));
                                const totalAmount = Math.round(subtotal + fee);
                                return totalAmount.toLocaleString('vi-VN') + ' VND';
                            })()}
                        </Typography.Title>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
}