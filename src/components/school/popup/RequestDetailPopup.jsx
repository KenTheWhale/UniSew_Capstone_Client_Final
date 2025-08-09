import React, {useState} from 'react';
import {Button, Space, Spin, Tag, Typography, Card, Row, Col, Avatar, Divider, InputNumber, Rate} from 'antd';
import {Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SyncOutlined,
    UserOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    PictureOutlined,
    BankOutlined,
    GiftOutlined,
    StarOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ShopOutlined,
    EyeOutlined
} from '@ant-design/icons';
import {DesignServices} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import {Box, Chip} from '@mui/material';
import {PiShirtFoldedFill, PiPantsFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../../ui/DisplayImage.jsx';

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color = '';
    let icon = null;
    switch (status) {
        case 'created':
            color = 'blue';
            icon = <FileTextOutlined/>;
            break;
        case 'paid':
            color = 'green';
            icon = <CheckCircleOutlined/>;
            break;
        case 'unpaid':
            color = 'orange';
            icon = <CloseCircleOutlined/>;
            break;
        case 'progressing':
            color = 'purple';
            icon = <SyncOutlined/>;
            break;
        case 'completed':
            color = 'cyan';
            icon = <CheckCircleOutlined/>;
            break;
        case 'rejected':
            color = 'red';
            icon = <CloseCircleOutlined/>;
            break;
        case 'pending':
            color = 'processing';
            icon = <ClockCircleOutlined/>;
            break;
        case 'selected':
            color = 'green';
            icon = <CheckCircleOutlined/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag style={{margin: 0}} color={color}>{icon} {status}</Tag>;
}

// Function to get appropriate icon based on item type
const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';

    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('pant') || type.includes('quần')) {
        return <PiPantsFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt style={{fontSize: '20px'}}/>;
    } else {
        return <FileTextOutlined/>;
    }
};

// Result Delivery Modal Component
function ResultDeliveryModal({visible, onCancel, resultDelivery}) {
    if (!resultDelivery) return null;

    const {Text, Title} = Typography;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid #f0f0f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
            }}>
                <CheckCircleOutlined style={{color: 'white', fontSize: '18px'}}/>
                <span style={{fontWeight: 600, fontSize: '16px'}}>
                    Final Design Result
                </span>
            </DialogTitle>
            <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>

                    {/* Header Info */}
                    <Card
                        size="small"
                        style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                            border: '1px solid #bbf7d0',
                            borderRadius: 8
                        }}
                    >
                        <Row gutter={[16, 8]} align="middle">
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Text style={{fontWeight: 600, fontSize: '16px', color: '#166534'}}>
                                        {resultDelivery.name}
                                    </Text>
                                    <Text style={{color: '#64748b', fontSize: '12px'}}>
                                        Submitted: {formatDate(resultDelivery.submitDate)}
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{textAlign: 'center'}}>
                                <Space direction="vertical" size="small">
                                    <Text style={{fontSize: '12px', color: '#64748b'}}>
                                        Final Delivery
                                    </Text>
                                    <Text style={{fontSize: '10px', color: '#94a3b8'}}>
                                        Design Result
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right'}}>
                                <Space direction="vertical" size="small">
                                    <Tag color="success" style={{margin: 0}}>
                                        <CheckCircleOutlined/> Completed
                                    </Tag>
                                    <Text style={{color: '#64748b', fontSize: '12px'}}>
                                        ID: {parseID(resultDelivery.id, 'dd')}
                                    </Text>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Note Section */}
                    {resultDelivery.note && (
                        <Card
                            title={
                                <Space>
                                    <InfoCircleOutlined style={{color: '#10b981'}}/>
                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Designer Note</span>
                                </Space>
                            }
                            size="small"
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
                            }}
                        >
                            <Box sx={{p: 1.5, bgcolor: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0'}}>
                                <Text style={{color: '#166534', fontSize: '14px', lineHeight: 1.6}}>
                                    {resultDelivery.note}
                                </Text>
                            </Box>
                        </Card>
                    )}

                    {/* Design Items */}
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined style={{color: '#10b981'}}/>
                                <span style={{
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}>Final Design Items ({resultDelivery.items?.length || 0})</span>
                            </Space>
                        }
                        size="small"
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            {resultDelivery.items?.map((item, index) => (
                                <Col span={12} key={index}>
                                    <Box sx={{
                                        p: 3,
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        {/* Item Header */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            mb: 2
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: '#10b981',
                                                color: 'white',
                                                flexShrink: 0
                                            }}>
                                                {getItemIcon(item.designItem?.type)}
                                            </Box>
                                            <Box sx={{flex: 1}}>
                                                <Text strong
                                                      style={{fontSize: '14px', color: '#1e293b', display: 'block'}}>
                                                    {item.designItem?.type?.charAt(0).toUpperCase() + item.designItem?.type?.slice(1)} - {item.designItem?.category}
                                                </Text>
                                                <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                    Item #{index + 1}
                                                </Text>
                                            </Box>
                                        </Box>

                                        {/* Item Details */}
                                        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 1, mb: 2}}>
                                            <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                Fabric: {item.designItem?.fabricName}
                                            </Text>

                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Text style={{fontSize: '12px', color: '#475569'}}>
                                                    Color: {item.designItem?.color}
                                                </Text>
                                                <Box sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: item.designItem?.color,
                                                    border: '1px solid #e0e0e0'
                                                }}/>
                                            </Box>

                                            {item.designItem?.logoPosition && (
                                                <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                    Logo Position: {item.designItem.logoPosition}
                                                </Text>
                                            )}

                                            {/* Logo Size for Shirt */}
                                            {item.designItem?.type?.toLowerCase().includes('shirt') && (
                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                        Logo Size: {item.baseLogoHeight}cm × {item.baseLogoWidth}cm
                                                    </Text>
                                                </Box>
                                            )}


                                            {item.designItem?.note && (
                                                <Text style={{fontSize: '11px', fontStyle: 'italic', color: '#64748b'}}>
                                                    Note: {item.designItem.note}
                                                </Text>
                                            )}
                                        </Box>

                                        {/* Design Images */}
                                        <Box sx={{mt: 'auto'}}>
                                            <Row gutter={[8, 8]}>
                                                <Col span={12}>
                                                    <Box sx={{
                                                        p: 1,
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 4,
                                                        border: '1px solid #bbf7d0',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#166534',
                                                            display: 'block',
                                                            mb: 0.5,
                                                            fontWeight: 600
                                                        }}>
                                                            Front Design
                                                        </Text>
                                                        <DisplayImage
                                                            imageUrl={item.frontImageUrl}
                                                            alt="Front Design"
                                                            width="100%"
                                                            height="120px"
                                                            style={{borderRadius: 4, objectFit: 'cover'}}
                                                        />
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{
                                                        p: 1,
                                                        backgroundColor: '#fef2f2',
                                                        borderRadius: 4,
                                                        border: '1px solid #fca5a5',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#991b1b',
                                                            display: 'block',
                                                            mb: 0.5,
                                                            fontWeight: 600
                                                        }}>
                                                            Back Design
                                                        </Text>
                                                        <DisplayImage
                                                            imageUrl={item.backImageUrl}
                                                            alt="Back Design"
                                                            width="100%"
                                                            height="120px"
                                                            style={{borderRadius: 4, objectFit: 'cover'}}
                                                        />
                                                    </Box>
                                                </Col>
                                            </Row>
                                        </Box>
                                    </Box>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Box>
            </DialogContent>
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onCancel}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function RequestDetailPopup({visible, onCancel, request}) {
    const [extraRevision, setExtraRevision] = useState(0);
    const [showExtraRevisionModal, setShowExtraRevisionModal] = useState(false);
    const [showResultDeliveryModal, setShowResultDeliveryModal] = useState(false);

    if (!request) {
        return (
            <Dialog open={visible} onClose={onCancel} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4}}>
                        <Spin size="large" tip="Loading request details..."/>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    const {Text, Title} = Typography;

    const getFooterButtons = (status) => {
        let buttons = [];

        switch (status) {
            case 'created':
                buttons.push(
                    <Button key="action" type="primary" onClick={onCancel}>
                        Submit design request
                    </Button>
                );
                break;
            case 'completed':
                buttons.push(
                    <Button key="order" type="primary" onClick={onCancel}>
                        Create Order
                    </Button>
                );
                // Add View Final Design button if resultDelivery exists
                if (request.resultDelivery) {
                    buttons.push(
                        <Button
                            key="viewFinal"
                            type="default"
                            icon={<EyeOutlined/>}
                            onClick={() => setShowResultDeliveryModal(true)}
                            style={{
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                color: 'white'
                            }}
                        >
                            View Final Design
                        </Button>
                    );
                }
                break;
            case 'unpaid':
                buttons.push(
                    <Button key="payment" type="primary" onClick={() => setShowExtraRevisionModal(true)}>
                        Make Payment
                    </Button>
                );
                break;
            case 'paid':
                buttons.push(
                    <Button key="chat" type="primary" onClick={() => {
                        // Store only the request ID
                        localStorage.setItem('currentDesignRequestId', request.id);
                        onCancel();
                        window.location.href = '/school/chat';
                    }}>
                        Chat with designer
                    </Button>
                );
                break;
            case 'canceled':
                return null;
            default:
                return null;
        }

        return buttons;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN');
    };

    const formatDeadline = (deadlineString) => {
        const date = new Date(deadlineString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <InfoCircleOutlined style={{color: 'white', fontSize: '18px'}}/>
                    <span style={{fontWeight: 600, fontSize: '16px'}}>
                        Design Request: {parseID(request.id, 'dr')}
                    </span>
                </DialogTitle>
                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                        {/* Compact Header */}
                        <Card
                            size="small"
                            style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8
                            }}
                        >
                            <Row gutter={[16, 8]} align="middle">
                                <Col span={8}>
                                    <Space direction="vertical" size="small">
                                        <Text style={{fontWeight: 600, fontSize: '16px', color: '#1e293b'}}>
                                            {request.name}
                                        </Text>
                                        <Text style={{color: '#64748b', fontSize: '12px'}}>
                                            Created: {formatDate(request.creationDate)}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{textAlign: 'center'}}>
                                    <Space direction="vertical" size="small">
                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                            Design Request
                                        </Text>
                                        <Text style={{fontSize: '10px', color: '#94a3b8'}}>
                                            Basic Information
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right'}}>
                                    <Space direction="vertical" size="small">
                                        {statusTag(request.status)}
                                        <Text style={{color: '#64748b', fontSize: '12px'}}>
                                            Privacy: {request.privacy ? 'Private' : 'Public'}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        {/* Main Content - Two Columns */}
                        <Row gutter={[16, 16]}>
                            {/* Left Column - Designer & Quotation */}
                            <Col span={12}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                                    {/* Designer Info */}
                                    {request.finalDesignQuotation && (
                                        <Card
                                            title={
                                                <Space>
                                                    <UserOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    }}>Selected Designer</span>
                                                </Space>
                                            }
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                <Avatar
                                                    size={48}
                                                    src={request.finalDesignQuotation.designer.customer.avatar || request.finalDesignQuotation.designer.customer.name.charAt(0)}
                                                    style={{
                                                        border: '2px solid #1976d2',
                                                        backgroundColor: '#1976d2'
                                                    }}
                                                >
                                                    {request.finalDesignQuotation.designer.customer.name.charAt(0)}
                                                </Avatar>
                                                <Box sx={{flex: 1}}>
                                                    <Text style={{fontWeight: 600, fontSize: '14px', color: '#1e293b'}}>
                                                        {request.finalDesignQuotation.designer.customer.name}
                                                    </Text>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                                        <Rate
                                                            disabled
                                                            defaultValue={request.finalDesignQuotation.designer.rating}
                                                            style={{fontSize: '10px'}}
                                                        />
                                                        <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                            ({request.finalDesignQuotation.designer.rating})
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Row gutter={[8, 8]}>
                                                <Col span={12}>
                                                    <Space direction="vertical" size="small">
                                                        <Space>
                                                            <ShopOutlined style={{color: '#1976d2', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px'}}>
                                                                {request.finalDesignQuotation.designer.customer.business}
                                                            </Text>
                                                        </Space>
                                                        <Space>
                                                            <PhoneOutlined
                                                                style={{color: '#1976d2', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                                {request.finalDesignQuotation.designer.customer.phone}
                                                            </Text>
                                                        </Space>
                                                    </Space>
                                                </Col>
                                                <Col span={12}>
                                                    <Space direction="vertical" size="small">
                                                        <Space>
                                                            <EnvironmentOutlined
                                                                style={{color: '#64748b', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                                {request.finalDesignQuotation.designer.customer.address}
                                                            </Text>
                                                        </Space>
                                                        <Space>
                                                            <ClockCircleOutlined
                                                                style={{color: '#1976d2', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                                {request.finalDesignQuotation.designer.startTime} - {request.finalDesignQuotation.designer.endTime}
                                                            </Text>
                                                        </Space>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Card>
                                    )}

                                    {/* Service Summary */}
                                    {request.finalDesignQuotation && (
                                        <Card
                                            title={
                                                <Space>
                                                    <DollarOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    }}>Service Summary</span>
                                                </Space>
                                            }
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Row gutter={[8, 8]} style={{display: 'flex'}}>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 6,
                                                        border: '1px solid #bbf7d0',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#166534',
                                                            fontWeight: 600
                                                        }}>
                                                            PRICE (VND)
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#166534',
                                                            fontWeight: 700
                                                        }}>
                                                            {formatCurrency(request.price)}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#fef3c7',
                                                        borderRadius: 6,
                                                        border: '1px solid #fde68a',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#92400e',
                                                            fontWeight: 600
                                                        }}>
                                                            DELIVERY
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#92400e',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.finalDesignQuotation.deliveryWithIn} days
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#dbeafe',
                                                        borderRadius: 6,
                                                        border: '1px solid #93c5fd',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#1e40af',
                                                            fontWeight: 600
                                                        }}>
                                                            REVISIONS
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#1e40af',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.revisionTime === 9999 ? 'Unlimited' : request.revisionTime}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                            </Row>
                                            {request.finalDesignQuotation.note && (
                                                <Box sx={{
                                                    mt: 1.5,
                                                    p: 1.5,
                                                    bgcolor: '#f8fafc',
                                                    borderRadius: 6,
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <Text style={{
                                                        fontStyle: 'italic',
                                                        color: '#475569',
                                                        fontSize: '12px'
                                                    }}>
                                                        <strong>Note:</strong> {request.finalDesignQuotation.note}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Card>
                                    )}

                                    {/* Logo Design */}
                                    {request.logoImage && (
                                        <Card
                                            title={
                                                <Space>
                                                    <PictureOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Image</span>
                                                </Space>
                                            }
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Box sx={{display: 'flex', justifyContent: 'center', p: 1}}>
                                                <DisplayImage
                                                    imageUrl={request.logoImage}
                                                    alt="Logo Design"
                                                    width="150px"
                                                    height="150px"
                                                />
                                            </Box>
                                        </Card>
                                    )}
                                </Box>
                            </Col>

                            {/* Right Column - Requested Design Items */}
                            <Col span={12}>
                                <Card
                                    title={
                                        <Space>
                                            <FileTextOutlined style={{color: '#1976d2'}}/>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}>Requested Design Items ({request.items?.length || 0})</span>
                                        </Space>
                                    }
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        height: 'fit-content'
                                    }}
                                >
                                    <Row gutter={[12, 12]}>
                                        {request.items?.map((item, index) => (
                                            <Col span={12} key={index}>
                                                <Box sx={{
                                                    p: 2,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 8,
                                                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}>
                                                    {/* Header */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mb: 1.5
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 6,
                                                            bgcolor: '#e3f2fd',
                                                            flexShrink: 0
                                                        }}>
                                                            {getItemIcon(item.type)}
                                                        </Box>
                                                        <Box sx={{flex: 1}}>
                                                            <Text strong style={{
                                                                fontSize: '13px',
                                                                color: '#1e293b',
                                                                display: 'block'
                                                            }}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </Text>
                                                            <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                                {item.category.toUpperCase()}
                                                            </Text>
                                                        </Box>
                                                    </Box>

                                                    {/* Details */}
                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 0.5
                                                    }}>
                                                        <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                            Fabric: {item.fabricName}
                                                        </Text>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            mt: 0.5
                                                        }}>
                                                            <Text style={{fontSize: '11px', color: '#475569'}}>
                                                                Color: {item.color}
                                                            </Text>
                                                            <Box sx={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                bgcolor: item.color,
                                                                border: '1px solid #e0e0e0'
                                                            }}/>
                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                mt: 0.5
                                                            }}>
                                                                <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                    Logo: {item.logoPosition}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Text style={{
                                                                fontSize: '10px',
                                                                fontStyle: 'italic',
                                                                color: '#64748b',
                                                                mt: 0.5
                                                            }}>
                                                                Note: {item.note}
                                                            </Text>
                                                        )}
                                                    </Box>

                                                    {/* Sample Images */}
                                                    {item.sampleImages && item.sampleImages.length > 0 && (
                                                        <Box sx={{mt: 1.5, pt: 1, borderTop: '1px solid #f1f5f9'}}>
                                                            <Text style={{
                                                                fontSize: '9px',
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                display: 'block',
                                                                color: '#475569',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Sample Images
                                                            </Text>
                                                            <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                                                {item.sampleImages.map((image, imgIndex) => (
                                                                    <DisplayImage
                                                                        key={imgIndex}
                                                                        imageUrl={image.url}
                                                                        alt={`Sample ${imgIndex + 1}`}
                                                                        width="32px"
                                                                        height="32px"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>
                            </Col>
                        </Row>

                        {/* Feedback */}
                        {request.feedback && request.feedback !== '' && (
                            <Card
                                title={
                                    <Space>
                                        <InfoCircleOutlined style={{color: '#1976d2'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>Feedback</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)'
                                }}
                            >
                                <Box sx={{p: 1.5, bgcolor: '#fff3cd', borderRadius: 6, border: '1px solid #ffeaa7'}}>
                                    <Text style={{color: '#856404', fontSize: '12px'}}>
                                        {request.feedback}
                                    </Text>
                                </Box>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    {getFooterButtons(request.status)}
                </DialogActions>
            </Dialog>

            {/* Extra Revision Dialog */}
            <Dialog
                open={showExtraRevisionModal}
                onClose={() => setShowExtraRevisionModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <EditOutlined style={{color: '#1976d2'}}/>
                    <span style={{fontWeight: 600}}>
                        Add Extra Revisions
                    </span>
                </DialogTitle>
                <DialogContent sx={{padding: '24px'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Box sx={{
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography.Text style={{fontSize: '14px', color: '#475569'}}>
                                You can purchase additional revisions for your design request. Each extra revision costs
                                500,000 VND.
                            </Typography.Text>
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Typography.Text strong>Number of Extra Revisions:</Typography.Text>
                                <InputNumber
                                    min={0}
                                    max={10}
                                    value={extraRevision}
                                    onChange={setExtraRevision}
                                    style={{width: 120}}
                                />
                            </Box>

                            {extraRevision > 0 && (
                                <Box sx={{
                                    p: 2,
                                    backgroundColor: '#e3f2fd',
                                    borderRadius: 2,
                                    border: '1px solid #1976d2'
                                }}>
                                    <Typography.Text style={{color: '#1976d2', fontWeight: 600}}>
                                        Extra Revision Cost: {(extraRevision * 500000).toLocaleString('vi-VN')} VND
                                    </Typography.Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    <Button onClick={() => setShowExtraRevisionModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            // Store extra revision in sessionStorage
                            sessionStorage.setItem('extraRevision', extraRevision.toString());
                            setShowExtraRevisionModal(false);
                            onCancel();
                            // Redirect to payment or handle payment logic
                            window.location.href = '/school/payment';
                        }}
                        style={{
                            backgroundColor: '#1976d2',
                            borderColor: '#1976d2'
                        }}
                    >
                        Proceed to Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Result Delivery Modal */}
            {request.resultDelivery && (
                <ResultDeliveryModal
                    visible={showResultDeliveryModal}
                    onCancel={() => setShowResultDeliveryModal(false)}
                    resultDelivery={request.resultDelivery}
                />
            )}
        </>
    );
}