import React from 'react';
import {Button, Modal, Spin, Typography} from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EditOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import {Box, Chip, Paper} from '@mui/material';
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import {getPaymentUrl} from "../../../services/PaymentService.jsx";
import {enqueueSnackbar} from "notistack";

export default function DesignPaymentPopup({ visible, onCancel, selectedQuotationDetails }) {

    if (!selectedQuotationDetails) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Spin size="large" spinning tip="Loading payment details..." />
                </Box>
            </Modal>
        );
    }

    const { quotation, request } = selectedQuotationDetails;

    const handleProceedToPayment = async () => {
        try {
            // Store quotation details in sessionStorage for VNPay callback
            const quotationDetailsToStore = {
                quotation: quotation,
                request: request
            };
            sessionStorage.setItem('paymentQuotationDetails', JSON.stringify(quotationDetailsToStore));
            
            const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
            const totalAmount = quotation.price + (extraRevision * (quotation.extraRevisionPrice || 0));
            
            const response = await getPaymentUrl(
                totalAmount,
                `Payment for design quotation - Design Request ${parseID(request.id, 'dr')}`,
                'design_request',
                '/school/payment/result'
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
                    <DollarOutlined style={{ color: '#1976d2', fontSize: '20px' }} />
                    <Typography.Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                        Payment Details
                    </Typography.Title>
                    <Chip 
                        label={`${parseID(request.id, 'dr')}`}
                        color="primary" 
                        size="small"
                        style={{ backgroundColor: '#1976d2' }}
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
                        backgroundColor: '#1976d2',
                        borderColor: '#1976d2'
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
                {/* Header Section */}
                <Box sx={{ 
                    mb: 4, 
                    p: 3, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <InfoCircleOutlined style={{ color: '#1976d2', fontSize: '18px' }} />
                        <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                            Payment Summary
                        </Typography.Title>
                    </Box>
                    <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                        Please review the payment details below before proceeding to the secure payment gateway.
                    </Typography.Text>
                </Box>

                {/* Designer Information */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Designer Information
                            </Typography.Title>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Name:</strong> {quotation.designer.customer.name}
                            </Typography.Text>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Email:</strong> {quotation.designer.customer.account.email}
                            </Typography.Text>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Phone:</strong> {quotation.designer.customer.phone}
                            </Typography.Text>
                        </Box>
                    </Box>
                </Paper>

                {/* Quotation Details */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: 'white'
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
                            <DollarOutlined style={{ fontSize: '18px' }} />
                        </Box>
                        <Box>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Design Quotation Details
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                                Custom Quotation
                            </Typography.Text>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 2,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2
                        }}>
                            <Typography.Text style={{ color: '#475569', fontSize: '14px' }}>
                                <strong>Quotation Price:</strong>
                            </Typography.Text>
                            <Typography.Title level={4} style={{ margin: 0, color: '#1976d2' }}>
                                {quotation.price.toLocaleString('vi-VN')} VND
                            </Typography.Title>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3 }}>
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

                        {/* Extra Revision Information */}
                        {(() => {
                            const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
                            return extraRevision > 0 ? (
                                <Box sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fff7e6', 
                                    borderRadius: 2,
                                    border: '1px solid #ffd591',
                                    textAlign: 'center',
                                    mt: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                        <EditOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                                        <Typography.Text style={{ color: '#fa8c16', fontWeight: 600, fontSize: '14px' }}>
                                            Extra Revisions Purchased
                                        </Typography.Text>
                                    </Box>
                                    <Typography.Text style={{ color: '#fa8c16', fontSize: '16px', fontWeight: 'bold' }}>
                                        {extraRevision} additional revisions - {(extraRevision * (quotation.extraRevisionPrice || 0)).toLocaleString('vi-VN')} VND
                                    </Typography.Text>
                                </Box>
                            ) : null;
                        })()}
                    </Box>
                </Paper>

                {/* Security & Payment Info */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        backgroundColor: '#f8fafc'
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

                {/* Total Amount */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        border: '2px solid #1976d2',
                        borderRadius: 3,
                        backgroundColor: '#e3f2fd'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircleOutlined style={{ color: '#1976d2', fontSize: '20px' }} />
                            <Typography.Title level={5} style={{ margin: 0, color: '#1976d2' }}>
                                Total Amount
                            </Typography.Title>
                        </Box>
                        <Typography.Title level={3} style={{ margin: 0, color: '#1976d2', fontWeight: 'bold' }}>
                            {(() => {
                                const extraRevision = parseInt(sessionStorage.getItem('extraRevision') || '0');
                                const totalAmount = quotation.price + (extraRevision * (quotation.extraRevisionPrice || 0));
                                return totalAmount.toLocaleString('vi-VN') + ' VND';
                            })()}
                        </Typography.Title>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
}