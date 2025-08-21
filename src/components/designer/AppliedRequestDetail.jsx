import React from 'react';
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
    let color;
    let icon = null;
    switch (status) {
        case 'pending':
            color = 'processing';
            icon = <ClockCircleOutlined/>;
            break;
        case 'processing':
            color = 'orange';
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

export default function AppliedRequestDetail({visible, onCancel, request, hideFooterButtons = false}) {
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
        // If hideFooterButtons is true, show only Close button
        if (hideFooterButtons) {
            return [
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>,
            ];
        }

        let buttonText = '';
        let buttonAction;

        switch (status) {
            case 'processing':
                buttonText = 'Start Chat with School';
                buttonAction = () => {
                    localStorage.setItem('currentDesignRequestId', request.id);
                    onCancel();
                    window.location.href = '/designer/chat';
                };
                break;
            case 'completed':
                buttonText = 'View Final Design';
                buttonAction = onCancel;
                break;
            case 'canceled':
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
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.08) 100%)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
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
                                        <Box sx={{height: '12px'}}></Box>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        {/* School & Service Summary - Full Width */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            marginTop: '16px',
                            alignItems: 'stretch'
                        }}>

                            {/* School Info */}
                            <Box sx={{flex: 1}}>
                                <Card
                                    title={
                                        <Space>
                                            <BankOutlined style={{color: '#667eea'}}/>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}>Selected School</span>
                                        </Space>
                                    }
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        height: '100%'
                                    }}
                                >
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: '#667eea',
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
                                                    <ShopOutlined style={{color: '#667eea', fontSize: '12px'}}/>
                                                    <Text style={{fontSize: '12px'}}>
                                                        {request.school?.name || 'School Institution'}
                                                    </Text>
                                                </Space>
                                                <Space>
                                                    <PhoneOutlined style={{color: '#667eea', fontSize: '12px'}}/>
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
                            </Box>

                            {/* Service Summary */}
                            {request.finalDesignQuotation && request.price && (
                                <Box sx={{flex: 1}}>
                                    <Card
                                        title={
                                            <Space>
                                                <DollarOutlined style={{color: '#667eea'}}/>
                                                <span style={{
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>Service Summary</span>
                                            </Space>
                                        }
                                        size="small"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            height: '100%'
                                        }}
                                    >
                                        <Row gutter={[8, 8]} style={{display: 'flex'}}>
                                            <Col span={6} style={{display: 'flex'}}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                                    borderRadius: 6,
                                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={{
                                                        fontSize: '10px',
                                                        color: '#667eea',
                                                        fontWeight: 600
                                                    }}>
                                                        PRICE (VND)
                                                    </Text>
                                                    <Title level={4} style={{
                                                        margin: '4px 0 0 0',
                                                        color: '#667eea',
                                                        fontWeight: 700
                                                    }}>
                                                        {formatCurrency(request.price || 0)}
                                                    </Title>
                                                </Box>
                                            </Col>
                                            <Col span={6} style={{display: 'flex'}}>
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
                                                        {request.finalDesignQuotation?.deliveryWithIn || 7} days
                                                    </Title>
                                                </Box>
                                            </Col>
                                            <Col span={6} style={{display: 'flex'}}>
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
                                            <Col span={6} style={{display: 'flex'}}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%)',
                                                    borderRadius: 6,
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Text style={{
                                                        fontSize: '10px',
                                                        color: '#dc2626',
                                                        fontWeight: 600
                                                    }}>
                                                        DEADLINE
                                                    </Text>
                                                    <Title level={5} style={{
                                                        margin: '4px 0 0 0',
                                                        color: '#dc2626',
                                                        fontWeight: 700
                                                    }}>
                                                        {request.finalDesignQuotation?.acceptanceDeadline ? formatDeadline(request.finalDesignQuotation.acceptanceDeadline) : 'TBD'}
                                                    </Title>
                                                </Box>
                                            </Col>
                                        </Row>
                                        {request.finalDesignQuotation?.note && (
                                            <Box sx={{
                                                mt: 1.5,
                                                p: 1.5,
                                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                                                borderRadius: 6,
                                                border: '1px solid rgba(102, 126, 234, 0.1)'
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
                                </Box>
                            )}
                        </Box>

                        {/* Logo Image - Full Width */}
                        {request.logoImage && request.logoImage !== '' && (
                            <Card
                                title={
                                    <Space>
                                        <PictureOutlined style={{color: '#667eea'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Image</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    marginTop: '16px'
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

                        {/* Requested Design Items - Full Width */}
                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined style={{color: '#667eea'}}/>
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
                                height: 'fit-content',
                                marginTop: '16px'
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'stretch',
                                minHeight: '200px'
                            }}>
                                {/* Boy Section */}
                                {(() => {
                                    const boyItems = request.items?.filter(item => item.gender === 'boy') || [];
                                    if (boyItems.length > 0) {
                                        const regularItems = boyItems.filter(item => item.category === 'regular');
                                        const peItems = boyItems.filter(item => item.category === 'pe');

                                        return (
                                            <Box sx={{flex: 1}}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 1,
                                                    p: 1,
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)',
                                                    borderRadius: 6,
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}>
                                                        👦
                                                    </Box>
                                                    <Text style={{
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        color: '#1e40af',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Boy ({boyItems.length} cloths)
                                                    </Text>
                                                </Box>

                                                {/* Regular Uniform Subsection */}
                                                {regularItems.length > 0 && (
                                                    <Box sx={{mb: 1.5}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.08) 100%)',
                                                            borderRadius: 8,
                                                            border: '1px solid rgba(34, 197, 94, 0.15)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1,
                                                            height: '100%'
                                                        }}>
                                                            {/* Header inside the box */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 100%)',
                                                                borderRadius: 4,
                                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                mb: 1
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    🎓
                                                                </Box>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    color: '#15803d',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.3px'
                                                                }}>
                                                                    Regular Uniform
                                                                    ({regularItems.length} cloths)
                                                                </Text>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 1,
                                                                alignItems: 'stretch'
                                                            }}>
                                                                {regularItems.map((item, index) => (
                                                                    <Box
                                                                        key={item.id || index}
                                                                        sx={{
                                                                            flex: 1,
                                                                            p: 1.5,
                                                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                            borderRadius: 8,
                                                                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(34, 197, 94, 0.02) 100%)',
                                                                            transition: 'all 0.3s ease',
                                                                            position: 'relative',
                                                                            height: '100%',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            '&:hover': {
                                                                                borderColor: '#22c55e',
                                                                                boxShadow: '0 3px 12px rgba(34, 197, 94, 0.15)',
                                                                                background: 'linear-gradient(135deg, #ffffff 0%, rgba(34, 197, 94, 0.05) 100%)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Compact Header */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                width: 28,
                                                                                height: 28,
                                                                                borderRadius: 6,
                                                                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                                                color: 'white',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {getItemIcon(item.type)}
                                                                            </Box>
                                                                            <Box sx={{flex: 1}}>
                                                                                <Text strong style={{
                                                                                    fontSize: '12px',
                                                                                    color: '#1e293b',
                                                                                    display: 'block',
                                                                                    fontWeight: 600
                                                                                }}>
                                                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                                </Text>
                                                                            </Box>
                                                                            <Tag
                                                                                color="green"
                                                                                style={{
                                                                                    margin: 0,
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    padding: '1px 6px',
                                                                                    height: 'auto'
                                                                                }}
                                                                            >
                                                                                #{index + 1}
                                                                            </Tag>
                                                                        </Box>

                                                                        {/* Compact Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {/* Fabric */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(46, 125, 50, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(46, 125, 50, 0.15)'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    color: '#2e7d32',
                                                                                    fontWeight: 600,
                                                                                    display: 'block',
                                                                                    mb: 0.5,
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Fabric
                                                                                </Text>
                                                                                <Text style={{
                                                                                    fontSize: '10px',
                                                                                    color: '#1e293b',
                                                                                    fontWeight: 500
                                                                                }}>
                                                                                    {item.fabricName}
                                                                                </Text>
                                                                            </Box>

                                                                            {/* Color */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(124, 58, 237, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 12,
                                                                                    height: 12,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: item.color,
                                                                                    border: '1px solid #ffffff',
                                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#7c3aed',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Color
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.color}
                                                                                    </Text>
                                                                                </Box>
                                                                            </Box>

                                                                            {/* Logo Position */}
                                                                            {item.logoPosition ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(255, 152, 0, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#f57c00',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Logo
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.logoPosition}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(255, 152, 0, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(255, 152, 0, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(255, 152, 0, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Text>
                                                                                </Box>
                                                                            )}

                                                                            {/* Note */}
                                                                            {item.note ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(236, 72, 153, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(236, 72, 153, 0.15)',
                                                                                    gridColumn: 'span 1'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#ec4899',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Note
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500,
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        {item.note}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(236, 72, 153, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(236, 72, 153, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(236, 72, 153, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Note
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>

                                                                        {/* Compact Sample Images */}
                                                                        <Box sx={{
                                                                            pt: 1,
                                                                            borderTop: '1px solid #f1f5f9',
                                                                            flex: 1,
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            justifyContent: item.sampleImages && item.sampleImages.length > 0 ? 'flex-start' : 'center'
                                                                        }}>
                                                                            <Text style={{
                                                                                fontSize: '9px',
                                                                                fontWeight: 600,
                                                                                mb: 0.5,
                                                                                display: 'block',
                                                                                color: '#475569',
                                                                                textTransform: 'uppercase'
                                                                            }}>
                                                                                Samples
                                                                                {item.sampleImages && item.sampleImages.length > 0 ? ` (${item.sampleImages.length})` : ' (0)'}
                                                                            </Text>
                                                                            {item.sampleImages && item.sampleImages.length > 0 ? (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    gap: 0.5,
                                                                                    flexWrap: 'wrap'
                                                                                }}>
                                                                                    {item.sampleImages.map((image, imgIndex) => (
                                                                                        <Box
                                                                                            key={imgIndex}
                                                                                            sx={{
                                                                                                position: 'relative',
                                                                                                overflow: 'hidden',
                                                                                                height: '36px',
                                                                                                width: '36px',
                                                                                                border: '1px solid #e2e8f0',
                                                                                                transition: 'all 0.2s ease',
                                                                                                boxSizing: 'border-box',
                                                                                                '&:hover': {
                                                                                                    borderColor: '#22c55e',
                                                                                                    transform: 'scale(1.05)'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <DisplayImage
                                                                                                imageUrl={image.url}
                                                                                                alt={`Sample ${imgIndex + 1}`}
                                                                                                width="36px"
                                                                                                height="36px"
                                                                                            />
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    height: '36px',
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#94a3b8',
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        No samples available
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Physical Education Uniform Subsection */}
                                                {peItems.length > 0 && (
                                                    <Box sx={{mb: 1.5}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.08) 100%)',
                                                            borderRadius: 8,
                                                            border: '1px solid rgba(245, 158, 11, 0.15)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {/* Header inside the box */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
                                                                borderRadius: 4,
                                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                mb: 1
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    ⚽
                                                                </Box>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    color: '#a16207',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.3px'
                                                                }}>
                                                                    Physical Education Uniform ({peItems.length} cloths)
                                                                </Text>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 1
                                                            }}>
                                                                {peItems.map((item, index) => (
                                                                    <Box
                                                                        key={item.id || index}
                                                                        sx={{
                                                                            flex: 1,
                                                                            p: 1.5,
                                                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                            borderRadius: 8,
                                                                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                                            transition: 'all 0.3s ease',
                                                                            position: 'relative',
                                                                            '&:hover': {
                                                                                borderColor: '#f59e0b',
                                                                                boxShadow: '0 3px 12px rgba(245, 158, 11, 0.15)',
                                                                                background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.05) 100%)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Compact Header */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                width: 28,
                                                                                height: 28,
                                                                                borderRadius: 6,
                                                                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                                                color: 'white',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {getItemIcon(item.type)}
                                                                            </Box>
                                                                            <Box sx={{flex: 1}}>
                                                                                <Text strong style={{
                                                                                    fontSize: '12px',
                                                                                    color: '#1e293b',
                                                                                    display: 'block',
                                                                                    fontWeight: 600
                                                                                }}>
                                                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                                </Text>
                                                                            </Box>
                                                                            <Tag
                                                                                color="orange"
                                                                                style={{
                                                                                    margin: 0,
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    padding: '1px 6px',
                                                                                    height: 'auto'
                                                                                }}
                                                                            >
                                                                                #{index + 1}
                                                                            </Tag>
                                                                        </Box>

                                                                        {/* Compact Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {/* Fabric */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(46, 125, 50, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(46, 125, 50, 0.15)'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    color: '#2e7d32',
                                                                                    fontWeight: 600,
                                                                                    display: 'block',
                                                                                    mb: 0.5,
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Fabric
                                                                                </Text>
                                                                                <Text style={{
                                                                                    fontSize: '10px',
                                                                                    color: '#1e293b',
                                                                                    fontWeight: 500
                                                                                }}>
                                                                                    {item.fabricName}
                                                                                </Text>
                                                                            </Box>

                                                                            {/* Color */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(124, 58, 237, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 12,
                                                                                    height: 12,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: item.color,
                                                                                    border: '1px solid #ffffff',
                                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#7c3aed',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Color
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.color}
                                                                                    </Text>
                                                                                </Box>
                                                                            </Box>

                                                                            {/* Logo Position */}
                                                                            {item.logoPosition ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(255, 152, 0, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#f57c00',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Logo
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.logoPosition}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(255, 152, 0, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(255, 152, 0, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(255, 152, 0, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Text>
                                                                                </Box>
                                                                            )}

                                                                            {/* Note */}
                                                                            {item.note ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(236, 72, 153, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(236, 72, 153, 0.15)',
                                                                                    gridColumn: 'span 1'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#ec4899',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Note
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500,
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        {item.note}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(236, 72, 153, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(236, 72, 153, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(236, 72, 153, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Note
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>

                                                                        {/* Compact Sample Images */}
                                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                                            <Box sx={{
                                                                                pt: 1,
                                                                                borderTop: '1px solid #f1f5f9'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    mb: 0.5,
                                                                                    display: 'block',
                                                                                    color: '#475569',
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Samples ({item.sampleImages.length})
                                                                                </Text>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    gap: 0.5,
                                                                                    flexWrap: 'wrap'
                                                                                }}>
                                                                                    {item.sampleImages.map((image, imgIndex) => (
                                                                                        <Box
                                                                                            key={imgIndex}
                                                                                            sx={{
                                                                                                position: 'relative',
                                                                                                overflow: 'hidden',
                                                                                                height: '36px',
                                                                                                width: '36px',
                                                                                                border: '1px solid #e2e8f0',
                                                                                                transition: 'all 0.2s ease',
                                                                                                boxSizing: 'border-box',
                                                                                                '&:hover': {
                                                                                                    borderColor: '#f59e0b',
                                                                                                    transform: 'scale(1.05)'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <DisplayImage
                                                                                                imageUrl={image.url}
                                                                                                alt={`Sample ${imgIndex + 1}`}
                                                                                                width="36px"
                                                                                                height="36px"
                                                                                            />
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Girl Section */}
                                {(() => {
                                    const girlItems = request.items?.filter(item => item.gender === 'girl') || [];
                                    if (girlItems.length > 0) {
                                        const regularItems = girlItems.filter(item => item.category === 'regular');
                                        const peItems = girlItems.filter(item => item.category === 'pe');

                                        return (
                                            <Box sx={{flex: 1}}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 1,
                                                    p: 1,
                                                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.15) 100%)',
                                                    borderRadius: 6,
                                                    border: '1px solid rgba(236, 72, 153, 0.2)'
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}>
                                                        👧
                                                    </Box>
                                                    <Text style={{
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        color: '#be185d',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Girl ({girlItems.length} cloths)
                                                    </Text>
                                                </Box>

                                                {/* Regular Uniform Subsection */}
                                                {regularItems.length > 0 && (
                                                    <Box sx={{mb: 1.5}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.08) 100%)',
                                                            borderRadius: 8,
                                                            border: '1px solid rgba(236, 72, 153, 0.15)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1,
                                                            height: '100%'
                                                        }}>
                                                            {/* Header inside the box */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.15) 100%)',
                                                                borderRadius: 4,
                                                                border: '1px solid rgba(236, 72, 153, 0.2)',
                                                                mb: 1
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    🎓
                                                                </Box>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    color: '#be185d',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.3px'
                                                                }}>
                                                                    Regular Uniform ({regularItems.length} cloths)
                                                                </Text>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 1,
                                                                alignItems: 'stretch'
                                                            }}>
                                                                {regularItems.map((item, index) => (
                                                                    <Box
                                                                        key={item.id || index}
                                                                        sx={{
                                                                            flex: 1,
                                                                            p: 1.5,
                                                                            border: '1px solid #e2e8f0',
                                                                            borderRadius: 8,
                                                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                                            transition: 'all 0.3s ease',
                                                                            position: 'relative',
                                                                            height: '100%',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            '&:hover': {
                                                                                borderColor: '#ec4899',
                                                                                boxShadow: '0 3px 12px rgba(236, 72, 153, 0.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Compact Header */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                width: 28,
                                                                                height: 28,
                                                                                borderRadius: 6,
                                                                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                                                color: 'white',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {getItemIcon(item.type)}
                                                                            </Box>
                                                                            <Box sx={{flex: 1}}>
                                                                                <Text strong style={{
                                                                                    fontSize: '12px',
                                                                                    color: '#1e293b',
                                                                                    display: 'block',
                                                                                    fontWeight: 600
                                                                                }}>
                                                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                                </Text>
                                                                            </Box>
                                                                            <Tag
                                                                                color="pink"
                                                                                style={{
                                                                                    margin: 0,
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    padding: '1px 6px',
                                                                                    height: 'auto'
                                                                                }}
                                                                            >
                                                                                #{index + 1}
                                                                            </Tag>
                                                                        </Box>

                                                                        {/* Compact Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {/* Fabric */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(46, 125, 50, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(46, 125, 50, 0.15)'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    color: '#2e7d32',
                                                                                    fontWeight: 600,
                                                                                    display: 'block',
                                                                                    mb: 0.5,
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Fabric
                                                                                </Text>
                                                                                <Text style={{
                                                                                    fontSize: '10px',
                                                                                    color: '#1e293b',
                                                                                    fontWeight: 500
                                                                                }}>
                                                                                    {item.fabricName}
                                                                                </Text>
                                                                            </Box>

                                                                            {/* Color */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(124, 58, 237, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 12,
                                                                                    height: 12,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: item.color,
                                                                                    border: '1px solid #ffffff',
                                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#7c3aed',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Color
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.color}
                                                                                    </Text>
                                                                                </Box>
                                                                            </Box>

                                                                            {/* Logo Position */}
                                                                            {item.logoPosition ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(255, 152, 0, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#f57c00',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Logo
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.logoPosition}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(255, 152, 0, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(255, 152, 0, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '50px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(255, 152, 0, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Text>
                                                                                </Box>
                                                                            )}

                                                                            {/* Note */}
                                                                            {item.note ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(236, 72, 153, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(236, 72, 153, 0.15)',
                                                                                    gridColumn: 'span 1'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#ec4899',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Note
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500,
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        {item.note}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(236, 72, 153, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(236, 72, 153, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '50px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(236, 72, 153, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Note
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>

                                                                        {/* Compact Sample Images */}
                                                                        <Box sx={{
                                                                            pt: 1,
                                                                            borderTop: '1px solid #f1f5f9',
                                                                            flex: 1,
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            justifyContent: item.sampleImages && item.sampleImages.length > 0 ? 'flex-start' : 'center'
                                                                        }}>
                                                                            <Text style={{
                                                                                fontSize: '9px',
                                                                                fontWeight: 600,
                                                                                mb: 0.5,
                                                                                display: 'block',
                                                                                color: '#475569',
                                                                                textTransform: 'uppercase'
                                                                            }}>
                                                                                Samples
                                                                                {item.sampleImages && item.sampleImages.length > 0 ? ` (${item.sampleImages.length})` : ' (0)'}
                                                                            </Text>
                                                                            {item.sampleImages && item.sampleImages.length > 0 ? (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    gap: 0.5,
                                                                                    flexWrap: 'wrap'
                                                                                }}>
                                                                                    {item.sampleImages.map((image, imgIndex) => (
                                                                                        <Box
                                                                                            key={imgIndex}
                                                                                            sx={{
                                                                                                position: 'relative',
                                                                                                overflow: 'hidden',
                                                                                                height: '36px',
                                                                                                width: '36px',
                                                                                                border: '1px solid #e2e8f0',
                                                                                                transition: 'all 0.2s ease',
                                                                                                boxSizing: 'border-box',
                                                                                                '&:hover': {
                                                                                                    borderColor: '#ec4899',
                                                                                                    transform: 'scale(1.05)'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <DisplayImage
                                                                                                imageUrl={image.url}
                                                                                                alt={`Sample ${imgIndex + 1}`}
                                                                                                width="36px"
                                                                                                height="36px"
                                                                                            />
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    height: '36px',
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#94a3b8',
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        No samples available
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Physical Education Uniform Subsection */}
                                                {peItems.length > 0 && (
                                                    <Box sx={{mb: 1.5}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.08) 100%)',
                                                            borderRadius: 8,
                                                            border: '1px solid rgba(245, 158, 11, 0.15)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {/* Header inside the box */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
                                                                borderRadius: 4,
                                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                mb: 1
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    ⚽
                                                                </Box>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    color: '#a16207',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.3px'
                                                                }}>
                                                                    Physical Education Uniform ({peItems.length} cloths)
                                                                </Text>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 1
                                                            }}>
                                                                {peItems.map((item, index) => (
                                                                    <Box
                                                                        key={item.id || index}
                                                                        sx={{
                                                                            flex: 1,
                                                                            p: 1.5,
                                                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                            borderRadius: 8,
                                                                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                                            transition: 'all 0.3s ease',
                                                                            position: 'relative',
                                                                            '&:hover': {
                                                                                borderColor: '#f59e0b',
                                                                                boxShadow: '0 3px 12px rgba(245, 158, 11, 0.15)',
                                                                                background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.05) 100%)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Compact Header */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                width: 28,
                                                                                height: 28,
                                                                                borderRadius: 6,
                                                                                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                                                                color: 'white',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {getItemIcon(item.type)}
                                                                            </Box>
                                                                            <Box sx={{flex: 1}}>
                                                                                <Text strong style={{
                                                                                    fontSize: '12px',
                                                                                    color: '#1e293b',
                                                                                    display: 'block',
                                                                                    fontWeight: 600
                                                                                }}>
                                                                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                                </Text>
                                                                            </Box>
                                                                            <Tag
                                                                                color="orange"
                                                                                style={{
                                                                                    margin: 0,
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    padding: '1px 6px',
                                                                                    height: 'auto'
                                                                                }}
                                                                            >
                                                                                #{index + 1}
                                                                            </Tag>
                                                                        </Box>

                                                                        {/* Compact Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {/* Fabric */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(46, 125, 50, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(46, 125, 50, 0.15)'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    color: '#2e7d32',
                                                                                    fontWeight: 600,
                                                                                    display: 'block',
                                                                                    mb: 0.5,
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Fabric
                                                                                </Text>
                                                                                <Text style={{
                                                                                    fontSize: '10px',
                                                                                    color: '#1e293b',
                                                                                    fontWeight: 500
                                                                                }}>
                                                                                    {item.fabricName}
                                                                                </Text>
                                                                            </Box>

                                                                            {/* Color */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                background: 'rgba(124, 58, 237, 0.08)',
                                                                                borderRadius: 4,
                                                                                border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 0.5
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 12,
                                                                                    height: 12,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: item.color,
                                                                                    border: '1px solid #ffffff',
                                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#7c3aed',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Color
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.color}
                                                                                    </Text>
                                                                                </Box>
                                                                            </Box>

                                                                            {/* Logo Position */}
                                                                            {item.logoPosition ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(255, 152, 0, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#f57c00',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Logo
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                        {item.logoPosition}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(255, 152, 0, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(255, 152, 0, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(255, 152, 0, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Logo
                                                                                    </Text>
                                                                                </Box>
                                                                            )}

                                                                            {/* Note */}
                                                                            {item.note ? (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    background: 'rgba(236, 72, 153, 0.08)',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid rgba(236, 72, 153, 0.15)',
                                                                                    gridColumn: 'span 1'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: '#ec4899',
                                                                                        fontWeight: 600,
                                                                                        display: 'block',
                                                                                        mb: 0.5,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        Note
                                                                                    </Text>
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500,
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        {item.note}
                                                                                    </Text>
                                                                                </Box>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    border: '1px dashed rgba(236, 72, 153, 0.2)',
                                                                                    borderRadius: 4,
                                                                                    background: 'rgba(236, 72, 153, 0.02)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    minHeight: '48px'
                                                                                }}>
                                                                                    <Text style={{
                                                                                        fontSize: '9px',
                                                                                        color: 'rgba(236, 72, 153, 0.5)',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'uppercase'
                                                                                    }}>
                                                                                        No Note
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>

                                                                        {/* Compact Sample Images */}
                                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                                            <Box sx={{
                                                                                pt: 1,
                                                                                borderTop: '1px solid #f1f5f9'
                                                                            }}>
                                                                                <Text style={{
                                                                                    fontSize: '9px',
                                                                                    fontWeight: 600,
                                                                                    mb: 0.5,
                                                                                    display: 'block',
                                                                                    color: '#475569',
                                                                                    textTransform: 'uppercase'
                                                                                }}>
                                                                                    Samples ({item.sampleImages.length})
                                                                                </Text>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    gap: 0.5,
                                                                                    flexWrap: 'wrap'
                                                                                }}>
                                                                                    {item.sampleImages.map((image, imgIndex) => (
                                                                                        <Box
                                                                                            key={imgIndex}
                                                                                            sx={{
                                                                                                position: 'relative',
                                                                                                overflow: 'hidden',
                                                                                                height: '36px',
                                                                                                width: '36px',
                                                                                                border: '1px solid #e2e8f0',
                                                                                                transition: 'all 0.2s ease',
                                                                                                boxSizing: 'border-box',
                                                                                                '&:hover': {
                                                                                                    borderColor: '#f59e0b',
                                                                                                    transform: 'scale(1.05)'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <DisplayImage
                                                                                                imageUrl={image.url}
                                                                                                alt={`Sample ${imgIndex + 1}`}
                                                                                                width="36px"
                                                                                                height="36px"
                                                                                            />
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    }
                                    return null;
                                })()}
                            </Box>
                        </Card>

                        {/* Feedback */}
                        {request.feedback && request.feedback !== '' && request.feedback !== null && (
                            <Card 
                                title={
                                    <Space>
                                        <InfoCircleOutlined style={{color: '#667eea'}}/>
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
                                <Box sx={{
                                    p: 1.5,
                                    bgcolor: 'rgba(255, 193, 7, 0.1)',
                                    borderRadius: 6,
                                    border: '1px solid rgba(255, 193, 7, 0.2)'
                                }}>
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
        </>
    );
}