import React from 'react';
import {Button, Modal, Spin, Typography} from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import {Box, Chip, Paper} from '@mui/material';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";
import {getPaymentUrl} from "../../../../services/PaymentService.jsx";
import {enqueueSnackbar} from "notistack";
import {serviceFee} from "../../../../configs/FixedVariables.jsx";
import {getPhoneLink} from "../../../../utils/PhoneUtil.jsx";

export default function OrderPaymentPopup({ visible, onCancel, selectedQuotationDetails }) {

    if (!selectedQuotationDetails || !selectedQuotationDetails.quotation || !selectedQuotationDetails.order) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4, gap: 2 }}>
                    <Spin size="large" />
                    <Typography.Text style={{ color: '#64748b' }}>
                        Loading payment details...
                    </Typography.Text>
                </Box>
            </Modal>
        );
    }

    const { quotation, order } = selectedQuotationDetails;

    const handleProceedToPayment = async () => {
        try {
            const subtotal = Math.round(quotation?.price || 0);
            const fee = Math.round(serviceFee(subtotal));
            const totalAmount = Math.round(subtotal + fee);
            const isDeposit = order?.status === 'pending';
            const paymentAmount = isDeposit ? Math.round(totalAmount * 0.5) : totalAmount;

            const quotationDetailsToStore = {
                quotation: quotation,
                order: order,
                serviceFee: fee,
                subtotal: subtotal,
                totalAmount: totalAmount,
                paymentAmount: paymentAmount
            };
            sessionStorage.setItem('paymentQuotationDetails', JSON.stringify(quotationDetailsToStore));

            sessionStorage.setItem('currentPaymentType', isDeposit ? 'deposit' : 'order');

            const response = await getPaymentUrl(
                paymentAmount,
                isDeposit
                    ? `Payment deposit for garment quotation - Order ${parseID(order.id, 'ord')}`
                    : `Payment for garment quotation - Order ${parseID(order.id, 'ord')}`,
                'order',
                `/school/payment/result?quotationId=${quotation.id}`
            );

            if (response && response.status === 200) {
                window.location.href = response.data.body.url;
            } else {
                enqueueSnackbar('Failed to generate payment URL. Please try again.', {variant: 'error'})
            }
        } catch (error) {
            enqueueSnackbar('Error generating payment URL', {variant: 'error'})
        }
    };

    return (
        <Modal
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DollarOutlined style={{ color: '#2e7d32', fontSize: '20px' }} />
                    <Typography.Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                        Payment Details
                    </Typography.Title>
                    <Chip
                        label={`${parseID(order.id, 'ord')}`}
                        color="success"
                        size="small"
                        style={{ backgroundColor: '#2e7d32' }}
                    />
                </Box>
            }
            open={visible}
            onCancel={onCancel}
            centered
            footer={[
                <Button key="back" onClick={onCancel} style={{ marginRight: 8 }}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleProceedToPayment}
                    icon={<CreditCardOutlined />}
                    style={{
                        backgroundColor: '#2e7d32',
                        borderColor: '#2e7d32'
                    }}
                >
                    Proceed to Payment
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
            <Box sx={{ width: '100%' }}>
                {}
                <Box sx={{
                    mb: 4,
                    p: 3,
                    background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                    borderRadius: 2,
                    border: '1px solid rgba(46, 125, 50, 0.1)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <InfoCircleOutlined style={{ color: '#2e7d32', fontSize: '18px' }} />
                        <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                            Payment Summary
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                        Please review the payment details below before proceeding to the secure payment gateway.
                    </Typography.Text>
                </Box>

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                            <InfoCircleOutlined style={{ fontSize: '18px' }} />
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Garment Factory Information
                            </Typography.Title>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Garment Factory:</strong> {quotation?.garment?.customer?.business || 'Unknown Factory'}
                            </Typography.Text>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Contact Person:</strong> {quotation?.garment?.customer?.name || 'N/A'}
                            </Typography.Text>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Email:</strong> {quotation?.garment?.customer?.account?.email || 'N/A'}
                            </Typography.Text>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Phone:</strong> {quotation?.garment?.customer?.phone ? (
                                    <span 
                                        style={{ 
                                            color: '#2e7d32', 
                                            cursor: 'pointer', 
                                            textDecoration: 'none',
                                            fontWeight: '500'
                                        }}
                                        onClick={() => {
                                            const phoneLink = getPhoneLink(quotation.garment.customer.phone);
                                            window.open(phoneLink, '_blank');
                                        }}
                                    >
                                        {quotation.garment.customer.phone}
                                    </span>
                                ) : 'N/A'}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                            <DollarOutlined style={{ fontSize: '18px' }} />
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Garment Quotation Details
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                Production Quotation
                            </Typography.Text>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            background: "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)",
                            borderRadius: 2,
                            border: '1px solid rgba(46, 125, 50, 0.1)'
                        }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Quotation Price:</strong>
                            </Typography.Text>
                            <Typography.Title level={4} style={{ margin: 0, color: '#2e7d32' }}>
                                {(quotation?.price || 0).toLocaleString('vi-VN')} VND
                            </Typography.Title>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3 }}>
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
                                <CalendarOutlined style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '8px' }} />
                                <Typography.Text style={{ color: '#475569', fontSize: '13px', display: 'block' }}>
                                    <strong>Est. Delivery Date</strong>
                                </Typography.Text>
                                <Typography.Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
                                    {quotation?.earlyDeliveryDate ? new Date(quotation.earlyDeliveryDate).toLocaleDateString('vi-VN') : 'N/A'}
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
                                <CreditCardOutlined style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '8px' }} />
                                <Typography.Text style={{ color: '#475569', fontSize: '13px', display: 'block' }}>
                                    <strong>Payment Type</strong>
                                </Typography.Text>
                                <Typography.Text style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
                                    {order?.status === 'pending' ? 'Deposit (50%)' : 'Full Payment'}
                                </Typography.Text>
                            </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                            <DollarOutlined style={{ fontSize: '18px' }} />
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Service Fee
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                Platform service charge
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
                        <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                            <strong>Service Fee:</strong>
                        </Typography.Text>
                        <Typography.Title level={4} style={{ margin: 0, color: '#f57c00' }}>
                            {(() => {
                                const subtotal = Math.round(quotation?.price || 0);
                                const fee = Math.round(serviceFee(subtotal));
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <SafetyCertificateOutlined style={{ color: '#2e7d32', fontSize: '18px' }} />
                        <Typography.Title level={6} style={{ margin: 0, color: '#2e7d32' }}>
                            Secure Payment
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                        Your payment will be processed through our secure payment gateway. All transactions are encrypted and protected.
                    </Typography.Text>
                </Paper>

                {/* Shipping Note */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.08) 100%)",
                        borderRadius: 3,
                        border: '1px solid rgba(245, 158, 11, 0.15)',
                        borderLeft: '4px solid #f57c00'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <InfoCircleOutlined style={{ color: '#f57c00', fontSize: '18px' }} />
                        <Typography.Title level={6} style={{ margin: 0, color: '#f57c00' }}>
                            Important Note
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{ fontSize: '13px', color: '#92400e' }}>
                        The total price shown above does not include shipping costs. Shipping fees will be calculated and added separately during the delivery process.
                    </Typography.Text>
                </Paper>

                {/* Deposit Amount */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircleOutlined style={{ color: '#2e7d32', fontSize: '20px' }} />
                            <Typography.Title level={5} style={{ margin: 0, color: '#2e7d32' }}>
                                {order?.status === 'pending' ? 'Deposit Amount' : 'Total Amount'}
                            </Typography.Title>
                        </Box>
                        <Typography.Title level={3} style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
                            {(() => {
                                const subtotal = Math.round(quotation?.price || 0);
                                const fee = Math.round(serviceFee(subtotal));
                                const totalAmount = Math.round(subtotal + fee);
                                const finalAmount = order?.status === 'pending' ? Math.round(totalAmount * 0.5) : totalAmount;
                                return finalAmount.toLocaleString('vi-VN') + ' VND';
                            })()}
                        </Typography.Title>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
}