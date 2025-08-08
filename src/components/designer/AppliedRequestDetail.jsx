import React, {useState} from 'react';
import {Button, Card, Col, Row, Space, Spin, Tag, Typography} from 'antd';
import {Avatar, Box, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    PictureOutlined,
    ShopOutlined,
    SyncOutlined
} from '@ant-design/icons';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../ui/DisplayImage.jsx';

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

export default function AppliedRequestDetail({visible, onCancel, request}) {
    const [showChatModal, setShowChatModal] = useState(false);

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
        let buttonText = '';
        let buttonAction;

        switch (status) {
            case 'paid':
                buttonText = 'Start Chat with School';
                buttonAction = () => {
                    localStorage.setItem('currentDesignRequest', JSON.stringify(request));
                    onCancel();
                    window.location.href = '/designer/chat';
                };
                break;
            case 'progressing':
                buttonText = 'Continue Working';
                buttonAction = () => {
                    localStorage.setItem('currentDesignRequest', JSON.stringify(request));
                    onCancel();
                    window.location.href = '/designer/chat';
                };
                break;
            case 'completed':
                buttonText = 'View Final Design';
                buttonAction = onCancel;
                break;
            case 'rejected':
                return null;
            default:
                return null;
        }

        return [
            <Button key="action" type="primary" onClick={buttonAction}>
                {buttonText}
            </Button>,
        ];
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
                        Applied Design Request: {parseID(request.id, 'dr')}
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
                                            Applied: {formatDate(request.creationDate)}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{textAlign: 'center'}}>
                                    <Space direction="vertical" size="small">
                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                            Design Request
                                        </Text>
                                        <Text style={{fontSize: '10px', color: '#94a3b8'}}>
                                            Project Information
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
                            {/* Left Column - School & Quotation */}
                            <Col span={12}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    
                                    {/* School Info */}
                                    <Card 
                                        title={
                                            <Space>
                                                <BankOutlined style={{color: '#1976d2'}}/>
                                                <span style={{fontWeight: 600, fontSize: '14px'}}>School Information</span>
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
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    backgroundColor: '#1976d2',
                                                    fontSize: '18px',
                                                    fontWeight: 600
                                                }}
                                                src={request.school?.avatar}
                                                slotProps={{
                                                    img: {
                                                        referrerPolicy: 'no-referrer'
                                                    }
                                                }}
                                            />
                                            <Box sx={{flex: 1}}>
                                                <Text style={{fontWeight: 600, fontSize: '14px', color: '#1e293b'}}>
                                                    {request.school?.business || 'School Name'}
                                                </Text>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                                    <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                        School Client
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
                                                            {request.school?.name || 'School Institution'}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <PhoneOutlined style={{color: '#1976d2', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Contact: {request.school?.phone || 'Available'}
                                                        </Text>
                                                    </Space>
                                                </Space>
                                            </Col>
                                            <Col span={12}>
                                                <Space direction="vertical" size="small">
                                                    <Space>
                                                        <EnvironmentOutlined style={{color: '#64748b', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Location: {request.school?.address || 'Available'}
                                                        </Text>
                                                    </Space>
                                                    <Space></Space>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Quotation Summary */}
                                    {request.finalDesignQuotation && request.price && (
                                        <Card 
                                            title={
                                                <Space>
                                                    <DollarOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Your Quotation</span>
                                                </Space>
                                            } 
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Row gutter={[8, 8]} style={{display: 'flex'}}>
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                        <Text style={{fontSize: '10px', color: '#166534', fontWeight: 600}}>
                                                            PRICE (VND)
                                                        </Text>
                                                        <Title level={4} style={{margin: '4px 0 0 0', color: '#166534', fontWeight: 700}}>
                                                            {formatCurrency(request.price || 0)}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                        <Text style={{fontSize: '10px', color: '#92400e', fontWeight: 600}}>
                                                            DELIVERY
                                                        </Text>
                                                        <Title level={4} style={{margin: '4px 0 0 0', color: '#92400e', fontWeight: 700}}>
                                                            {request.finalDesignQuotation?.deliveryWithIn || 7} days
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                        <Text style={{fontSize: '10px', color: '#1e40af', fontWeight: 600}}>
                                                            REVISIONS
                                                        </Text>
                                                        <Title level={4} style={{margin: '4px 0 0 0', color: '#1e40af', fontWeight: 700}}>
                                                            {request.revisionTime === 9999 ? 'Unlimited' : request.revisionTime}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={6} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#fef2f2',
                                                        borderRadius: 6,
                                                        border: '1px solid #fca5a5',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{fontSize: '10px', color: '#991b1b', fontWeight: 600}}>
                                                            DEADLINE
                                                        </Text>
                                                        <Title level={5} style={{margin: '4px 0 0 0', color: '#991b1b', fontWeight: 700}}>
                                                            {request.finalDesignQuotation?.acceptanceDeadline ? formatDeadline(request.finalDesignQuotation.acceptanceDeadline) : 'TBD'}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                            </Row>
                                            {request.finalDesignQuotation?.note && (
                                                <Box sx={{mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0'}}>
                                                    <Text style={{fontStyle: 'italic', color: '#475569', fontSize: '12px'}}>
                                                        <strong>Your Note:</strong> {request.finalDesignQuotation.note}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Card>
                                    )}

                                    {/* Logo Image */}
                                    {request.logoImage && request.logoImage !== '' && (
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

                            {/* Right Column - Uniform Items */}
                            <Col span={12}>
                                <Card 
                                    title={
                                        <Space>
                                            <FileTextOutlined style={{color: '#1976d2'}}/>
                                            <span style={{fontWeight: 600, fontSize: '14px'}}>Design Requirements ({request.items?.length || 0})</span>
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
                                                            <Text strong style={{fontSize: '13px', color: '#1e293b', display: 'block'}}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </Text>
                                                            <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                                {item.category.toUpperCase()}
                                                            </Text>
                                                        </Box>
                                                    </Box>

                                                    {/* Details */}
                                                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                                        <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                            Fabric: {item.fabricName}
                                                        </Text>
                                                        
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
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
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
                                                                <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                    Logo: {item.logoPosition}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Text style={{fontSize: '10px', fontStyle: 'italic', color: '#64748b', mt: 0.5}}>
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
                                                                Reference Images
                                                            </Text>
                                                            <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                                                {item.sampleImages?.map((image, imgIndex) => (
                                                                    <DisplayImage
                                                                        key={image.id || imgIndex}
                                                                        imageUrl={image.url}
                                                                        alt={`Reference ${imgIndex + 1}`}
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
                        {request.feedback && request.feedback !== '' && request.feedback !== null && (
                            <Card 
                                title={
                                    <Space>
                                        <InfoCircleOutlined style={{color: '#1976d2'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>School Feedback</span>
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
        </>
    );
}