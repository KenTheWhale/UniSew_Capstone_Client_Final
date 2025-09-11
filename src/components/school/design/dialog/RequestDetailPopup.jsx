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
    FileTextOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    PictureOutlined,
    ShopOutlined,
    StopOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../../../ui/DisplayImage.jsx';

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
        case 'imported':
            color = 'pink';
            icon = <FileTextOutlined/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag style={{margin: 0}} color={color}>{icon} {status}</Tag>;
}

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

export default function RequestDetailPopup({visible, onCancel, request, hideFooterButtons = false}) {
    const [extraRevision, setExtraRevision] = useState(0);
    const [showExtraRevisionModal, setShowExtraRevisionModal] = useState(false);


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

            case 'processing':
            case 'completed':
                buttons.push(
                    <Button key="chat" type="primary" onClick={() => {
                        localStorage.setItem('currentDesignRequestId', request.id);
                        onCancel();
                        window.location.href = '/school/chat';
                    }} style={{
                        backgroundColor: '#2e7d32',
                        borderColor: '#2e7d32'
                    }}>
                        {status === 'completed' ? 'View designer chat' : 'Chat with designer'}
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
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0',
                    background: '#ffffff',
                    color: '#1f2937',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {/* Top accent bar */}
                    <Box sx={{
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
                        width: '100%'
                    }} />
                    
                    <Box sx={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 52,
                                height: 52,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                position: 'relative'
                            }}>
                                <InfoCircleOutlined style={{
                                    color: 'white',
                                    fontSize: '24px'
                                }}/>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    border: '2px solid #10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Box sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#10b981'
                                    }} />
                                </Box>
                            </Box>
                            
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Text style={{
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    color: '#111827',
                                    letterSpacing: '-0.025em'
                                }}>
                                    Design Request Details
                                </Text>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Text style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        fontWeight: 500,
                                        background: '#f3f4f6',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        ID: {parseID(request.id, 'dr')}
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: '#f3f4f6',
                                    borderColor: '#d1d5db',
                                    transform: 'scale(1.05)'
                                }
                            }} onClick={onCancel}>
                                <CloseCircleOutlined style={{
                                    color: '#6b7280',
                                    fontSize: '20px'
                                }}/>
                            </Box>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                        {/* Basic Information Card */}
                        {/* Request Information Section */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            p: 3,
                            mt: 4,
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Background Pattern */}
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '120px',
                                height: '120px',
                                background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }} />
                            
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {/* Left Side - Request Details */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 56,
                                        height: 56,
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        border: '2px solid #e2e8f0',
                                        position: 'relative'
                                    }}>
                                        <FileTextOutlined style={{
                                            color: '#10b981',
                                            fontSize: '24px'
                                        }}/>
                                    </Box>
                                    
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}>
                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: '18px',
                                            color: '#111827',
                                            letterSpacing: '-0.025em'
                                        }}>
                                            {request.name}
                                        </Text>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Text style={{
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                fontWeight: 500,
                                                background: '#f9fafb',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                {parseID(request.id, 'dr')}
                                            </Text> 
                                        </Box>
                                    </Box>
                                </Box>
                                
                                {/* Right Side - Status */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: 1
                                }}>
                                                                    <Text style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Current Status
                                </Text>
                                    <Box sx={{
                                        transform: 'scale(1.2)',
                                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                                    }}>
                                        {statusTag(request.status)}
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Bottom Info Bar */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                pt: 2,
                                mt: 2,
                                borderTop: '1px solid #f3f4f6',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 1,
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#10b981'
                                        }} />
                                        <Text style={{
                                            fontSize: '12px',
                                            color: '#10b981',
                                            fontWeight: 600
                                        }}>
                                            {request.status === 'imported' ? 'Imported Design' : 'Design Request'}
                                        </Text>
                                    </Box>
                                </Box>
                                
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <ClockCircleOutlined style={{
                                        color: '#6b7280',
                                        fontSize: '14px'
                                    }} />
                                    <Text style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        fontWeight: 500
                                    }}>
                                        Created: {formatDate(request.creationDate)}
                                    </Text>
                                </Box>
                            </Box>
                        </Box>


                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            marginTop: '16px',
                            alignItems: 'stretch'
                        }}>


                            {request.finalDesignQuotation && (
                                <Box sx={{flex: 1}}>
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
                                            borderRadius: 8,
                                            height: '100%'
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
                                </Box>
                            )}

                            {request.finalDesignQuotation && (
                                <Box sx={{flex: 1}}>
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
                                            borderRadius: 8,
                                            height: '100%'
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
                                </Box>
                            )}
                        </Box>

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

                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined style={{color: '#2e7d32'}}/>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: '14px'
                                    }}>{request.status === 'imported' ? 'Design Items' : 'Requested Design Items'} ({request.items?.length || 0})</span>
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
                                {}
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

                                                {}
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
                                                            {}
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
                                                                        {}
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

                                                                        {}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {}
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

                                                                            {}
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

                                                                            {}
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
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500
                                                                                    }}>
                                                                                    </Text>
                                                                                </Box>
                                                                            )}

                                                                            {}
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

                                                                        {}
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

                                                {}
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
                                                            {}
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
                                                                    �?
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
                                                                        {}
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

                                                                        {}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {}
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

                                                                            {}
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

                                                                            {}
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
                                                                                    {item.logoPosition || 'No logo'}
                                                                                </Text>
                                                                            </Box>

                                                                            {}
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
                                                                                    {item.note || 'No note'}
                                                                                </Text>
                                                                            </Box>
                                                                        </Box>

                                                                        {}
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
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    height: '36px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'flex-start'
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
                                            </Box>
                                        );
                                    }
                                    return null;
                                })()}

                                {}
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

                                                {}
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
                                                            {}
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
                                                                        {}
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

                                                                        {}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {}
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

                                                                            {}
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

                                                                            {}
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

                                                                            {}
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
                                                                                    <Text style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#1e293b',
                                                                                        fontWeight: 500,
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                        </Box>

                                                                        {}
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

                                                {}
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
                                                            {}
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
                                                                    �?
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
                                                                        {}
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

                                                                        {}
                                                                        <Box sx={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: '1fr 1fr',
                                                                            gap: 1,
                                                                            mb: 1
                                                                        }}>
                                                                            {}
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

                                                                            {}
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

                                                                            {}
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
                                                                                    {item.logoPosition || 'No logo'}
                                                                                </Text>
                                                                            </Box>

                                                                            {}
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
                                                                                    {item.note || 'No note'}
                                                                                </Text>
                                                                            </Box>
                                                                        </Box>

                                                                        {}
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
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    height: '36px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'flex-start'
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
                                            </Box>
                                        );
                                    }
                                    return null;
                                })()}
                            </Box>
                        </Card>

                        {/* Design Results Section - Only show for imported or completed status */}
                        {(request.status === 'imported' || request.status === 'completed') && request.resultDelivery && (
                            <Card
                                title={
                                    <Space>
                                        <PictureOutlined style={{color: '#10b981'}}/>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '14px'
                                        }}>Design Results</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    marginTop: '16px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.05) 100%)'
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    {/* Result Info Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 32,
                                                height: 32,
                                                borderRadius: '8px',
                                                background: '#10b981',
                                                color: 'white'
                                            }}>
                                                <FileTextOutlined style={{fontSize: '16px'}} />
                                            </Box>
                                            <Box sx={{gap: 1, display: 'flex', alignItems: 'center'}}>
                                                <Text style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#111827'
                                                }}>
                                                    {request.resultDelivery.name || 'Design Result'}
                                                </Text>
                                                <Text style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280'
                                                }}>
                                                    Submitted: {formatDate(request.resultDelivery.submitDate)}
                                                </Text>
                                            </Box>
                                        </Box>
                                        <Text style={{
                                            fontSize: '11px',
                                            color: '#10b981',
                                            fontWeight: 600,
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            padding: '4px 8px',
                                            borderRadius: '12px'
                                        }}>
                                            ID: {parseID(request.resultDelivery.id, 'dd')}
                                        </Text>
                                    </Box>

                                    {/* Design Items Results */}
                                    {request.resultDelivery.items && request.resultDelivery.items.length > 0 && (
                                        <Box>
                                            <Text style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#374151',
                                                marginBottom: '12px',
                                                display: 'block'
                                            }}>
                                                Total items: ({request.resultDelivery.items.length} items)
                                            </Text>
                                            
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2
                                            }}>
                                                {request.resultDelivery.items.map((resultItem, index) => (
                                                    <Box
                                                        key={resultItem.id || index}
                                                        sx={{
                                                            p: 2,
                                                            background: '#ffffff',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        {/* Item Header */}
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            mb: 2
                                                        }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: '6px',
                                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                    color: 'white'
                                                                }}>
                                                                    {getItemIcon(resultItem.designItem.type)}
                                                                </Box>
                                                                <Box sx={{gap: 1, display: 'flex', alignItems: 'center'}}>
                                                                    <Text style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: 600,
                                                                        color: '#111827'
                                                                    }}>
                                                                        {resultItem.designItem.type.charAt(0).toUpperCase() + resultItem.designItem.type.slice(1)} - {resultItem.designItem.category}
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#6b7280',
                                                                        textTransform: 'capitalize'
                                                                    }}>
                                                                        {resultItem.designItem.gender} • {resultItem.designItem.fabricName}
                                                                    </Text>
                                                                </Box>
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

                                                        {/* Design Images */}
                                                        <Box sx={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: 2,
                                                            mb: 2
                                                        }}>
                                                            {/* Front Image */}
                                                            {resultItem.frontImageUrl && (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #e5e7eb',
                                                                    background: '#f9fafb'
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={resultItem.frontImageUrl}
                                                                        alt="Front Design"
                                                                        width="100%"
                                                                        height="500px"
                                                                    />
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        top: 4,
                                                                        left: 4,
                                                                        background: 'rgba(0,0,0,0.7)',
                                                                        color: 'white',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 6px',
                                                                        fontSize: '9px',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        Front
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {/* Back Image */}
                                                            {resultItem.backImageUrl && (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #e5e7eb',
                                                                    background: '#f9fafb'
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={resultItem.backImageUrl}
                                                                        alt="Back Design"
                                                                        width="100%"
                                                                        height="500px"
                                                                    />
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        top: 4,
                                                                        left: 4,
                                                                        background: 'rgba(0,0,0,0.7)',
                                                                        color: 'white',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 6px',
                                                                        fontSize: '9px',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        Back
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        {/* Item Details */}
                                                        <Box sx={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: 1
                                                        }}>
                                                            {/* Color */}
                                                            <Box sx={{
                                                                p: 1,
                                                                background: 'rgba(124, 58, 237, 0.05)',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(124, 58, 237, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5
                                                            }}>
                                                                <Box sx={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: '50%',
                                                                    bgcolor: resultItem.designItem.color,
                                                                    border: '1px solid #ffffff',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                    flexShrink: 0
                                                                }}/>
                                                                <Box sx={{flex: 1, gap: 1, display: 'flex', alignItems: 'center'}}>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#7c3aed',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Color
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.designItem.color}
                                                                    </Text>
                                                                </Box>
                                                            </Box>

                                                            {/* Logo Position */}
                                                            {resultItem.designItem.logoPosition ? (
                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(255, 152, 0, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 152, 0, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#f57c00',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Logo Position
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.designItem.logoPosition}
                                                                    </Text>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{
                                                                    p: 1,
                                                                    border: '1px dashed rgba(255, 152, 0, 0.2)',
                                                                    borderRadius: '6px',
                                                                    background: 'rgba(255, 152, 0, 0.02)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
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

                                                            {/* Logo Size */}
                                                            {(resultItem.baseLogoWidth > 0 || resultItem.baseLogoHeight > 0) && (
                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(16, 185, 129, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                                                    gridColumn: 'span 2',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#10b981',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Logo Size
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '10px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.baseLogoWidth}cm × {resultItem.baseLogoHeight}cm
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Design Notes */}
                                    {request.resultDelivery.note && (
                                        <Box sx={{
                                            p: 2,
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(16, 185, 129, 0.1)'
                                        }}>
                                            <Text style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#10b981',
                                                marginBottom: '4px',
                                                display: 'block'
                                            }}>
                                                Design Notes
                                            </Text>
                                            <Text style={{
                                                fontSize: '12px',
                                                color: '#374151',
                                                lineHeight: '1.5'
                                            }}>
                                                {request.resultDelivery.note}
                                            </Text>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        )}

                        {}
                        {request.feedback && (
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
                                <Box sx={{
                                    p: 1.5,
                                    bgcolor: 'rgba(255, 193, 7, 0.1)',
                                    borderRadius: 6,
                                    border: '1px solid rgba(255, 193, 7, 0.2)'
                                }}>
                                    {typeof request.feedback === 'string' ? (
                                        <Text style={{color: '#92400e', fontSize: '12px'}}>
                                            {request.feedback}
                                        </Text>
                                    ) : request.feedback && typeof request.feedback === 'object' ? (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            {request.feedback.rating && (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <Text style={{
                                                        color: '#92400e',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        Rating:
                                                    </Text>
                                                    <Rate
                                                        disabled
                                                        defaultValue={request.feedback.rating}
                                                        size="small"
                                                        style={{fontSize: '12px'}}
                                                    />
                                                </Box>
                                            )}
                                            {request.feedback.content && (
                                                <Text style={{color: '#92400e', fontSize: '12px'}}>
                                                    {request.feedback.content}
                                                </Text>
                                            )}
                                            {request.feedback.creationDate && (
                                                <Text style={{color: '#92400e', fontSize: '10px', opacity: 0.7}}>
                                                    {new Date(request.feedback.creationDate).toLocaleDateString('vi-VN')}
                                                </Text>
                                            )}
                                        </Box>
                                    ) : (
                                        <Text style={{color: '#92400e', fontSize: '12px'}}>
                                            {String(request.feedback)}
                                        </Text>
                                    )}
                                </Box>
                            </Card>
                        )}

                        {/* Cancellation Reason Section - Full Width at Bottom */}
                        {request.status === 'canceled' && request.cancelReason && (
                            <Box sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                border: '2px solid rgba(239, 68, 68, 0.2)',
                                borderLeft: '6px solid #ef4444',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 2
                                }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <StopOutlined style={{
                                            color: '#dc2626',
                                            fontSize: '20px'
                                        }} />
                                    </Box>
                                    <Box>
                                        <Text style={{
                                            fontSize: '18px',
                                            color: '#dc2626',
                                            fontWeight: 700,
                                            display: 'block'
                                        }}>
                                            Cancellation Reason
                                        </Text>
                                        <Text style={{
                                            fontSize: '14px',
                                            color: '#7f1d1d',
                                            opacity: 0.8
                                        }}>
                                            This request was cancelled by the school
                                        </Text>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)'
                                }}>
                                    <Text style={{
                                        fontSize: '15px',
                                        color: '#7f1d1d',
                                        lineHeight: 1.7,
                                        fontStyle: 'italic',
                                        display: 'block',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        "{request.cancelReason}"
                                    </Text>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    {hideFooterButtons ? (
                        <Button onClick={onCancel}>
                            Close
                        </Button>
                    ) : (
                        getFooterButtons(request.status)
                    )}
                </DialogActions>
            </Dialog>

            {}
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
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0',
                    background: '#ffffff',
                    color: '#1f2937',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {/* Top accent bar */}
                    <Box sx={{
                        height: '4px',
                        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                        width: '100%'
                    }} />
                    
                    <Box sx={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                position: 'relative'
                            }}>
                                <EditOutlined style={{
                                    color: 'white',
                                    fontSize: '20px'
                                }}/>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    border: '2px solid #f59e0b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Box sx={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: '50%',
                                        background: '#f59e0b'
                                    }} />
                                </Box>
                            </Box>
                            
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <Text style={{
                                    fontWeight: 700,
                                    fontSize: '18px',
                                    color: '#111827',
                                    letterSpacing: '-0.025em'
                                }}>
                                    Add Extra Revisions
                                </Text>
                                <Text style={{
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    fontWeight: 500
                                }}>
                                    Purchase additional design revisions
                                </Text>
                            </Box>
                        </Box>
                        
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                background: '#f3f4f6',
                                borderColor: '#d1d5db',
                                transform: 'scale(1.05)'
                            }
                        }} onClick={() => setShowExtraRevisionModal(false)}>
                            <CloseCircleOutlined style={{
                                color: '#6b7280',
                                fontSize: '18px'
                            }}/>
                        </Box>
                    </Box>
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
                            sessionStorage.setItem('extraRevision', extraRevision.toString());
                            setShowExtraRevisionModal(false);
                            onCancel();
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
        </>
    );
}