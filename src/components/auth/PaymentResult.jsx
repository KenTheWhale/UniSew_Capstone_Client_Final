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
    SafetyCertificateOutlined,
    UserOutlined
} from '@ant-design/icons';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {pickPackage} from "../../services/DesignService.jsx";
import {useEffect, useState} from 'react';

export default function PaymentResult() {
    if(!sessionStorage.getItem('paymentPackageDetails')){
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
    let packageDetails = null;

    if (vnpResponseCode !== null) {

        success = vnpResponseCode === '00';
        

        if (success && vnpOrderInfo) {

            try {
                const storedPackageDetails = sessionStorage.getItem('paymentPackageDetails');
                if (storedPackageDetails) {
                    packageDetails = JSON.parse(storedPackageDetails);
                }
            } catch (error) {
                console.error('Error parsing stored package details:', error);
            }
        }
    } else {
        // Fallback to old state parameter method
        const stateParam = urlParams.get('state');
        if (stateParam) {
            try {
                const decodedState = decodeURIComponent(stateParam);
                const parsedState = JSON.parse(decodedState);
                success = parsedState.success;
                packageDetails = parsedState.packageDetails;
            } catch (error) {
                console.error('Error parsing state from URL:', error);
            }
        }
    }

    const { designer, package: pkg, request } = packageDetails || {};

    // Call pickPackage when payment is successful
    useEffect(() => {
        const processPaymentSuccess = async () => {
            if (success && packageDetails && !hasProcessed && !isProcessing) {
                setIsProcessing(true);
                try {
                    const data = {
                        packageId: pkg.id,
                        designRequestId: request.id
                    };
                    
                    const response = await pickPackage(data);
                    if (response && response.status === 200) {
                        console.log('Package picked successfully');
                    } else {
                        console.error('Failed to pick package');
                    }
                } catch (error) {
                    console.error('Error picking package:', error);
                } finally {
                    setIsProcessing(false);
                    setHasProcessed(true);
                }
            }
        };

        processPaymentSuccess();
    }, [success, packageDetails, hasProcessed, isProcessing, pkg, request]);

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
                                    Your payment for the design package has been successfully processed.
                                </Typography.Paragraph>
                                
                                {/* VNPay Transaction Details */}
                                {vnpTxnRef && (
                                    <Box sx={{ 
                                        mt: 2, 
                                        p: 2, 
                                        backgroundColor: '#f6ffed', 
                                        borderRadius: 2,
                                        border: '1px solid #b7eb8f'
                                    }}>
                                        <Typography.Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 600 }}>
                                            Transaction ID: {vnpTxnRef}
                                        </Typography.Text>
                                        {vnpAmount && (
                                            <Typography.Text style={{ fontSize: '14px', color: '#52c41a', display: 'block', mt: 1 }}>
                                                Amount: {(parseInt(vnpAmount) / 100).toLocaleString('vi-VN')} VND
                                            </Typography.Text>
                                        )}
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
                    {success && packageDetails && (
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
                                            {designer.designerName}
                                        </Typography.Text>
                                    </Box>
                                </Box>

                                <Divider style={{ margin: '16px 0' }} />

                                {/* Package Details */}
                                <Box>
                                    <Typography.Title level={5} style={{ margin: '0 0 16px 0', color: '#475569' }}>
                                        Package Details
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
                                                    <strong>Package Price:</strong>
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Title level={4} style={{ margin: 0, color: '#fa8c16', fontWeight: 700 }}>
                                                {pkg.pkgFee.toLocaleString('vi-VN')} VND
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
                                                    {pkg.pkgDuration} days
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
                                                    {pkg.pkgRevisionTime === 9999 ? 'Unlimited' : pkg.pkgRevisionTime}
                                                </Typography.Text>
                                            </Box>
                                        </Box>
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
                                sessionStorage.removeItem('paymentPackageDetails');
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