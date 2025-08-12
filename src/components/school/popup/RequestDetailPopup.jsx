import React, {useState} from 'react';
import {Avatar, Button, Card, Col, InputNumber, Rate, Row, Space, Spin, Tag, Typography} from 'antd';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    PictureOutlined,
    ShopOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import {parseID} from "../../../utils/ParseIDUtil.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../../ui/DisplayImage.jsx';

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color;
    let icon = null;
    switch (status) {
        case 'pending':
            color = 'processing';
            icon = <ClockCircleOutlined/>;
            break;
        case 'processing':
            color = 'purple';
            icon = <SyncOutlined/>;
            break;
        case 'completed':
            color = 'success';
            icon = <CheckCircleOutlined/>;
            break;
        case 'canceled':
            color = 'red';
            icon = <CloseCircleOutlined/>;
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

    const {Text} = Typography;

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
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '90vh'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid #f0f0f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
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
                            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                            border: '1px solid rgba(46, 125, 50, 0.2)',
                            borderRadius: 8
                        }}
                    >
                        <Row gutter={[16, 8]} align="middle">
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Text style={{fontWeight: 600, fontSize: '16px', color: '#1e293b'}}>
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
                                    <InfoCircleOutlined style={{color: '#2e7d32'}}/>
                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Designer Note</span>
                                </Space>
                            }
                            size="small"
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)'
                            }}
                        >
                            <Box sx={{p: 1.5, bgcolor: 'rgba(46, 125, 50, 0.1)', borderRadius: 6, border: '1px solid rgba(46, 125, 50, 0.2)'}}>
                                <Text style={{color: '#1e293b', fontSize: '14px', lineHeight: 1.6}}>
                                    {resultDelivery.note}
                                </Text>
                            </Box>
                        </Card>
                    )}

                    {/* Design Items */}
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined style={{color: '#2e7d32'}}/>
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
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#2e7d32',
                                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                                        }
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
                                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
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
                                                        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
                                                        borderRadius: 4,
                                                        border: '1px solid rgba(46, 125, 50, 0.2)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#2e7d32',
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
                                                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.15) 100%)',
                                                        borderRadius: 4,
                                                        border: '1px solid rgba(255, 152, 0, 0.2)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#f57c00',
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
            case 'pending':
                buttons.push(
                    <Button key="action" type="primary" onClick={onCancel} style={{
                        backgroundColor: '#2e7d32',
                        borderColor: '#2e7d32'
                    }}>
                        Submit design request
                    </Button>
                );
                break;
            case 'completed':
                // Add View Final Design button if resultDelivery exists
                if (request.resultDelivery) {
                    buttons.push(
                        <Button
                            key="viewFinal"
                            type="default"
                            icon={<EyeOutlined/>}
                            onClick={() => setShowResultDeliveryModal(true)}
                            style={{
                                backgroundColor: '#2e7d32',
                                borderColor: '#2e7d32',
                                color: 'white'
                            }}
                        >
                            View Final Design
                        </Button>
                    );
                }
                break;
            case 'processing':
                buttons.push(
                    <Button key="chat" type="primary" onClick={() => {
                        // Store only the request ID
                        localStorage.setItem('currentDesignRequestId', request.id);
                        onCancel();
                        window.location.href = '/school/chat';
                    }} style={{
                        backgroundColor: '#2e7d32',
                        borderColor: '#2e7d32'
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
        return amount.toLocaleString("vi-VN");
    };
    return (
        <>
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '85vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
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
                                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                                border: '1px solid rgba(46, 125, 50, 0.1)',
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
                                                    <UserOutlined style={{color: '#2e7d32'}}/>
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
                                                        border: '2px solid #2e7d32',
                                                        backgroundColor: '#2e7d32'
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
                                                            <ShopOutlined style={{color: '#2e7d32', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px'}}>
                                                                {request.finalDesignQuotation.designer.customer.business}
                                                            </Text>
                                                        </Space>
                                                        <Space>
                                                            <PhoneOutlined
                                                                style={{color: '#2e7d32', fontSize: '12px'}}/>
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
                                                                style={{color: '#2e7d32', fontSize: '12px'}}/>
                                                            <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                                {(() => {
                                                                    const formatTime = (timeString) => {
                                                                        if (!timeString) return 'N/A';
                                                                        const time = new Date(`2000-01-01T${timeString}`);
                                                                        return time.toLocaleTimeString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            hour12: false
                                                                        });
                                                                    };
                                                                    return `${formatTime(request.finalDesignQuotation.designer.startTime)} - ${formatTime(request.finalDesignQuotation.designer.endTime)}`;
                                                                })()}
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
                                                    <DollarOutlined style={{color: '#2e7d32'}}/>
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
                                                        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
                                                        borderRadius: 6,
                                                        border: '1px solid rgba(46, 125, 50, 0.2)',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#2e7d32',
                                                            fontWeight: 600
                                                        }}>
                                                            PRICE (VND)
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#2e7d32',
                                                            fontWeight: 700
                                                        }}>
                                                            {formatCurrency(request.price)}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.15) 100%)',
                                                        borderRadius: 6,
                                                        border: '1px solid rgba(255, 152, 0, 0.2)',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#f57c00',
                                                            fontWeight: 600
                                                        }}>
                                                            DELIVERY
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#f57c00',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.finalDesignQuotation.deliveryWithIn} days
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.15) 100%)',
                                                        borderRadius: 6,
                                                        border: '1px solid rgba(124, 58, 237, 0.2)',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#7c3aed',
                                                            fontWeight: 600
                                                        }}>
                                                            REVISIONS
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#7c3aed',
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
                                                    bgcolor: 'rgba(46, 125, 50, 0.05)',
                                                    borderRadius: 6,
                                                    border: '1px solid rgba(46, 125, 50, 0.1)'
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
                                                    <PictureOutlined style={{color: '#2e7d32'}}/>
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
                                            <FileTextOutlined style={{color: '#2e7d32'}}/>
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
                                                    flexDirection: 'column',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        borderColor: '#2e7d32',
                                                        boxShadow: '0 4px 15px rgba(46, 125, 50, 0.1)'
                                                    }
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
                                                            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                            color: 'white',
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
                                        <InfoCircleOutlined style={{color: '#2e7d32'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>Feedback</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)'
                                }}
                            >
                                <Box sx={{p: 1.5, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 6, border: '1px solid rgba(255, 193, 7, 0.2)'}}>
                                    <Text style={{color: '#92400e', fontSize: '12px'}}>
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
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white'
                }}>
                    <EditOutlined style={{color: 'white'}}/>
                    <span style={{fontWeight: 600}}>
                        Add Extra Revisions
                    </span>
                </DialogTitle>
                <DialogContent sx={{padding: '24px'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Box sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                            borderRadius: 2,
                            border: '1px solid rgba(46, 125, 50, 0.1)'
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
                                    background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(46, 125, 50, 0.2)'
                                }}>
                                    <Typography.Text style={{color: '#2e7d32', fontWeight: 600}}>
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
                            backgroundColor: '#2e7d32',
                            borderColor: '#2e7d32'
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