import {Button, Modal, Spin, Tag, Typography} from 'antd';
import {
    CalendarOutlined as CalendarIcon,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import {Box, Chip, Divider, Paper} from '@mui/material';
import {useEffect, useState} from 'react';
import DesignPaymentPopup from './DesignPaymentPopup';
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import {getRequestReceipt} from "../../../services/DesignService.jsx";

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color = '';
    let icon = null;
    let text = '';
    switch (status) {
        case 'Created':
        case 'created':
            color = 'blue';
            icon = <FileTextOutlined />;
            text = 'Finding designer';
            break;
        case 'Paid':
        case 'paid':
            color = 'green';
            icon = <CheckCircleOutlined />;
            text = status;
            break;
        case 'Unpaid':
        case 'unpaid':
            color = 'orange';
            icon = <CloseCircleOutlined />;
            text = status;
            break;
        case 'Progressing':
        case 'progressing':
            color = 'purple';
            icon = <SyncOutlined />;
            text = status;
            break;
        case 'Completed':
        case 'completed':
            color = 'cyan';
            icon = <CheckCircleOutlined />;
            text = status;
            break;
        case 'Rejected':
        case 'rejected':
            color = 'red';
            icon = <CloseCircleOutlined />;
            text = status;
            break;
        case 'Waiting for Designer':
        case 'waiting for designer':
            color = 'volcano';
            icon = <InfoCircleOutlined />;
            text = status;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag color={color}>{icon} {text}</Tag>;
}

export default function RequestDesignerPopup({ visible, onCancel, request }) {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [showDesigners, setShowDesigners] = useState(false);
    // Applied designers data
    const [appliedDesigners, setAppliedDesigners] = useState([]);

    useEffect(() => {
        async function FetchAppliedDesigner(){
            setSelectedPackage(null);
            setPaymentDetails(null);
            setShowDesigners(false);
            return await getRequestReceipt({designRequestId: request.id})
        }

        FetchAppliedDesigner().then(res => {
            if(res && res.status === 200){
                setAppliedDesigners(res.data.body)
            }
        })
    }, []);

    if (!request) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Spin size="large" tip="Loading request details..." />
                </Box>
            </Modal>
        );
    }
    const handlePackageSelect = (designerId, packageId) => {
        const designer = appliedDesigners.find(d => d.id === designerId);
        const pkg = designer ? designer.packages.find(p => p.id === packageId) : null;
        if (designer && pkg) {
            setSelectedPackage({ designerId, packageId });
            setPaymentDetails({ designer, package: pkg, request });
        }
    };

    const handleOpenPaymentModal = () => {
        setIsPaymentModalVisible(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalVisible(false);
        setPaymentDetails(null);
    };

    const getFooterButtons = (status) => {
        switch (status) {
            case 'created':
                return [
                    <Button 
                        key="cancel" 
                        onClick={onCancel}
                        style={{ marginRight: 8 }}
                    >
                        Cancel
                    </Button>,
                    <Button 
                        key="confirmSelection" 
                        type="primary" 
                        onClick={() => {
                            if (selectedPackage) {
                                handleOpenPaymentModal();
                            } else {
                                alert('Please select a package first.');
                            }
                        }}
                        disabled={!selectedPackage}
                        icon={<CheckCircleOutlined />}
                        style={{ 
                            backgroundColor: '#1976d2',
                            borderColor: '#1976d2'
                        }}
                    >
                        Confirm Selection
                    </Button>,
                ];
            default:
                return null;
        }
    };

    return (
        <Modal
            title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InfoCircleOutlined style={{ color: '#1976d2', fontSize: '20px' }} />
                    <Typography.Title level={4} style={{ margin: 0, color: '#1e293b' }}>
                        Designer Applications
                    </Typography.Title>
                    <Chip 
                        label={parseID(request.id, 'dr')}
                        color="primary" 
                        size="small"
                        style={{ backgroundColor: '#1976d2' }}
                    />
                </Box>
            }
            open={visible}
            onCancel={onCancel}
            centered
            width={1000}
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
            footer={getFooterButtons(request.status)}
        >
            {request.status === 'created' && (
                <Box sx={{ width: '100%' }}>
                    {/* Header Section */}
                    <Box sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                Applied Designers ({appliedDesigners.length})
                            </Typography.Title>
                            <Button 
                                type={showDesigners ? "default" : "primary"}
                                onClick={() => setShowDesigners(!showDesigners)}
                                icon={showDesigners ? <CloseCircleOutlined /> : <UserOutlined />}
                                style={{ 
                                    backgroundColor: showDesigners ? '#f1f5f9' : '#1976d2',
                                    borderColor: showDesigners ? '#cbd5e1' : '#1976d2',
                                    color: showDesigners ? '#475569' : 'white'
                                }}
                            >
                                {showDesigners ? 'Hide Designers' : 'View Designers'}
                            </Button>
                        </Box>
                        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                            Review and select from the designers who have applied to your request. Each designer offers different packages with varying timelines and features.
                        </Typography.Text>
                    </Box>

                    {/* Designers List */}
                    {showDesigners && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {appliedDesigners.map((designer, index) => (
                                <Paper 
                                    key={index}
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 3,
                                        backgroundColor: 'white',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#1976d2',
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)'
                                        }
                                    }}
                                >
                                    {/* Designer Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                backgroundColor: '#1976d2',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '18px'
                                            }}>
                                                {designer.designerName.charAt(0)}
                                            </Box>
                                            <Box>
                                                <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                                    {designer.designerName}
                                                </Typography.Title>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {/*⭐ {designer.rating} ({designer.completedProjects} projects)*/}
                                                        ⭐ {designer.rating}
                                                    </Typography.Text>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Chip 
                                            label={`Valid Until: ${new Date(designer.acceptance).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}`}
                                            color="warning"
                                            size="small"
                                            icon={<ClockCircleOutlined />}
                                        />
                                    </Box>

                                    {/* Designer Contact Info */}
                                    <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MailOutlined style={{ color: '#64748b' }} />
                                            <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                                                {designer.email}
                                            </Typography.Text>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneOutlined style={{ color: '#64748b' }} />
                                            <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                                                {designer.phone}
                                            </Typography.Text>
                                        </Box>
                                    </Box>

                                    <Divider style={{ margin: '16px 0' }} />

                                    {/* Packages Section */}
                                    <Box>
                                        <Typography.Title level={6} style={{ margin: '0 0 16px 0', color: '#475569' }}>
                                            Available Packages
                                        </Typography.Title>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 2
                                        }}>
                                            {designer.packages.map((pkg, index) => (
                                                <Paper
                                                    key={index}
                                                    elevation={selectedPackage && selectedPackage.designerId === designer.id && selectedPackage.packageId === pkg.id ? 4 : 1}
                                                    sx={{
                                                        border: selectedPackage && selectedPackage.designerId === designer.id && selectedPackage.packageId === pkg.id 
                                                            ? '2px solid #1976d2' 
                                                            : '1px solid #e2e8f0',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedPackage && selectedPackage.designerId === designer.id && selectedPackage.packageId === pkg.id 
                                                            ? '#e3f2fd' 
                                                            : '#ffffff',
                                                        transition: 'all 0.3s ease',
                                                        flex: '1 1 280px',
                                                        minWidth: '280px',
                                                        '&:hover': {
                                                            borderColor: '#1976d2',
                                                            backgroundColor: selectedPackage && selectedPackage.designerId === designer.id && selectedPackage.packageId === pkg.id 
                                                                ? '#e3f2fd' 
                                                                : '#f8fafc',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                                                        },
                                                    }}
                                                    onClick={() => handlePackageSelect(designer.id, pkg.id)}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Typography.Title level={5} style={{ margin: 0, color: '#1976d2' }}>
                                                            {pkg.name}
                                                        </Typography.Title>
                                                        {selectedPackage && selectedPackage.designerId === designer.id && selectedPackage.packageId === pkg.id && (
                                                            <CheckCircleOutlined style={{ color: '#1976d2', fontSize: '20px' }} />
                                                        )}
                                                    </Box>
                                                    
                                                    <Typography.Title level={4} style={{ margin: '8px 0', color: '#1e293b' }}>
                                                        {pkg.pkgFee.toLocaleString('vi-VN')} VND
                                                    </Typography.Title>

                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <CalendarIcon style={{ color: '#64748b', fontSize: '14px' }} />
                                                            <Typography.Text style={{ fontSize: '13px', color: '#475569' }}>
                                                                <strong>{pkg.pkgDuration} days</strong> design time
                                                            </Typography.Text>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <EditOutlined style={{ color: '#64748b', fontSize: '14px' }} />
                                                            <Typography.Text style={{ fontSize: '13px', color: '#475569' }}>
                                                                Up to <strong>{pkg.pkgRevisionTime === 9999 ? 'Unlimited' : pkg.pkgRevisionTime}</strong> revisions
                                                            </Typography.Text>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {/* Selection Summary */}
                    {selectedPackage && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 3, 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: 2,
                            border: '1px solid #1976d2'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <CheckCircleOutlined style={{ color: '#1976d2', fontSize: '20px' }} />
                                <Typography.Title level={5} style={{ margin: 0, color: '#1976d2' }}>
                                    Selected Package
                                </Typography.Title>
                            </Box>
                            <Typography.Text style={{ color: '#1e293b' }}>
                                You have selected a package from {appliedDesigners.find(d => d.id === selectedPackage.designerId)?.designerName}.
                                Click "Confirm Selection" to proceed to payment.
                            </Typography.Text>
                        </Box>
                    )}
                </Box>
            )}

            <DesignPaymentPopup 
                visible={isPaymentModalVisible}
                onCancel={handleClosePaymentModal}
                selectedPackageDetails={paymentDetails}
            />
        </Modal>
    );
}
