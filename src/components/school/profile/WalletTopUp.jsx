import React, {useState} from 'react';
import {Box, Paper, Stack} from '@mui/material';
import {Button, InputNumber, Modal, Typography as AntTypography} from 'antd';
import {CreditCardOutlined, InfoCircleOutlined, WalletOutlined} from '@ant-design/icons';
import {getPaymentUrl} from '../../../services/PaymentService.jsx';
import {enqueueSnackbar} from 'notistack';

const {Title, Text} = AntTypography;

export default function WalletTopUp() {
    const [amount, setAmount] = useState(100000); // Default 100,000 VND
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAmount, setConfirmAmount] = useState(0);

    const predefinedAmounts = [
        {value: 50000, label: '50,000 VND'},
        {value: 100000, label: '100,000 VND'},
        {value: 200000, label: '200,000 VND'},
        {value: 500000, label: '500,000 VND'},
        {value: 1000000, label: '1,000,000 VND'},
        {value: 2000000, label: '2,000,000 VND'},
        {value: 5000000, label: '5,000,000 VND'},
        {value: 10000000, label: '10,000,000 VND'},
        {value: 20000000, label: '20,000,000 VND'},
        {value: 50000000, label: '50,000,000 VND'}
    ];

    const handleAmountChange = (value) => {
        if (value && value >= 10000) { // Minimum 10,000 VND
            setAmount(value);
        }
    };

    const handleQuickSelect = (selectedAmount) => {
        setAmount(selectedAmount);
    };

    const handleProceedToPayment = async () => {
        if (!amount || amount < 10000) {
            enqueueSnackbar('Please enter a valid amount (minimum 10,000 VND)', {variant: 'error'});
            return;
        }

        setConfirmAmount(amount);
        setShowConfirmModal(true);
    };

    const confirmPayment = async () => {
        setIsLoading(true);
        try {
            // Store wallet details in sessionStorage for PaymentResult component
            const walletDetails = {
                totalPrice: amount,
                description: `Wallet top-up - ${amount.toLocaleString('vi-VN')} VND`
            };
            sessionStorage.setItem('walletDetails', JSON.stringify(walletDetails));
            sessionStorage.setItem('currentPaymentType', 'wallet');

            const response = await getPaymentUrl(
                amount,
                `Wallet top-up - ${amount.toLocaleString('vi-VN')} VND`,
                'wallet',
                '/school/payment/result'
            );

            if (response && response.status === 200) {
                window.location.href = response.data.body.url;
            } else {
                enqueueSnackbar('Failed to generate payment URL. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error generating payment URL:', error);
            enqueueSnackbar('Error generating payment URL', {variant: 'error'});
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    };

    return (
        <Box>
            <Stack spacing={4} sx={{mt: 3}}>
                {/* Header */}
                <Box sx={{textAlign: 'center'}}>
                    <Title level={3} style={{color: '#1e293b', margin: 0, fontWeight: 700}}>
                        Wallet Top-up
                    </Title>
                    <Text style={{fontSize: '16px', color: '#64748b'}}>
                        Add funds to your wallet for faster and more convenient payments
                    </Text>
                </Box>

                {/* Main Content */}
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 3, md: 4},
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <Stack spacing={4}>
                        {/* Quick Select Amounts */}
                        <Box>
                            <Title level={4} style={{margin: '0 0 16px 0', color: '#1e293b'}}>
                                Quick Select Amount
                            </Title>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: 2
                            }}>
                                {predefinedAmounts.map((item) => (
                                    <Button
                                        key={item.value}
                                        size="large"
                                        style={{
                                            height: '60px',
                                            border: amount === item.value ? '2px solid #1976d2' : '1px solid #d9d9d9',
                                            backgroundColor: amount === item.value ? '#e3f2fd' : 'white',
                                            color: amount === item.value ? '#1976d2' : '#475569',
                                            fontWeight: amount === item.value ? 600 : 400
                                        }}
                                        onClick={() => handleQuickSelect(item.value)}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        {/* Custom Amount Input */}
                        <Box>
                            <Title level={4} style={{margin: '0 0 16px 0', color: '#1e293b'}}>
                                Custom Amount
                            </Title>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <InputNumber
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: 'max-content'
                                    }}
                                    placeholder="Enter amount (minimum 10,000 VND)"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    min={10000}
                                    max={100000000}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                                <Text style={{color: '#64748b', whiteSpace: 'nowrap'}}>
                                    VND
                                </Text>
                            </Box>
                            <Text style={{fontSize: '12px', color: '#94a3b8', marginTop: '8px', display: 'block'}}>
                                Minimum amount: 10,000 VND | Maximum amount: 100,000,000 VND
                            </Text>
                        </Box>

                        {/* Payment Summary */}
                        <Box sx={{
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 3,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Title level={4} style={{margin: '0 0 16px 0', color: '#1e293b'}}>
                                Payment Summary
                            </Title>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <WalletOutlined style={{color: '#1976d2', fontSize: '18px'}}/>
                                    <Text style={{color: '#475569', fontSize: '16px'}}>
                                        <strong>Top-up Amount:</strong>
                                    </Text>
                                </Box>
                                <Title level={3} style={{margin: 0, color: '#1976d2', fontWeight: 700}}>
                                    {formatCurrency(amount)}
                                </Title>
                            </Box>
                        </Box>

                        {/* Proceed Button */}
                        <Button
                            type="primary"
                            size="large"
                            icon={<CreditCardOutlined/>}
                            style={{
                                height: '56px',
                                fontSize: '18px',
                                fontWeight: 600,
                                backgroundColor: '#1976d2',
                                borderColor: '#1976d2'
                            }}
                            onClick={handleProceedToPayment}
                            disabled={!amount || amount < 10000}
                        >
                            Proceed to Payment
                        </Button>

                        {/* Info Section */}
                        <Box sx={{
                            p: 3,
                            backgroundColor: '#f0f9ff',
                            borderRadius: 3,
                            border: '1px solid #bae6fd'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                <InfoCircleOutlined style={{color: '#0284c7', fontSize: '20px', marginTop: '2px'}}/>
                                <Box>
                                    <Text style={{
                                        color: '#0284c7',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        display: 'block',
                                        marginBottom: '8px'
                                    }}>
                                        Important Information
                                    </Text>
                                    <Text style={{
                                        color: '#0369a1',
                                        fontSize: '14px',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        • Funds will be added to your wallet immediately after successful payment
                                    </Text>
                                    <Text style={{
                                        color: '#0369a1',
                                        fontSize: '14px',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        • You can use wallet funds for any future payments on the platform
                                    </Text>
                                    <Text style={{
                                        color: '#0369a1',
                                        fontSize: '14px',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        • All transactions are secure and encrypted
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>

            {/* Confirmation Modal */}
            <Modal
                title="Confirm Wallet Top-up"
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={isLoading}
                        onClick={confirmPayment}
                        style={{
                            backgroundColor: '#1976d2',
                            borderColor: '#1976d2'
                        }}
                    >
                        Confirm Payment
                    </Button>
                ]}
                centered
                zIndex={9999}
                style={{ zIndex: 9999 }}
            >
                <Box sx={{textAlign: 'center', py: 2}}>
                    <WalletOutlined style={{fontSize: '48px', color: '#1976d2', marginBottom: '16px'}}/>
                    <Title level={4} style={{margin: '0 0 16px 0', color: '#1e293b'}}>
                        Confirm Your Top-up
                    </Title>
                    <Text style={{fontSize: '16px', color: '#64748b', display: 'block', marginBottom: '16px'}}>
                        You are about to top-up your wallet with:
                    </Text>
                    <Title level={2} style={{margin: 0, color: '#1976d2', fontWeight: 700}}>
                        {formatCurrency(confirmAmount)}
                    </Title>
                    <Text style={{fontSize: '14px', color: '#94a3b8', display: 'block', marginTop: '16px'}}>
                        Click "Confirm Payment" to proceed to the payment gateway
                    </Text>
                </Box>
            </Modal>
        </Box>
    );
} 