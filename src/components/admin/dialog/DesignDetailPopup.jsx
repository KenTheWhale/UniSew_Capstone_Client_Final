import React from 'react';
import {
    Box,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    Avatar
} from '@mui/material';
import { Space, Badge, Tag, Row, Col, Rate } from 'antd';
import {
    CloseCircleOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    PictureOutlined,
    DollarOutlined,
    UserOutlined,
    ShopOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";
import { parseID } from "../../../utils/ParseIDUtil.jsx";
import { formatDate } from '../../../utils/TimestampUtil';
import DisplayImage from '../../ui/DisplayImage.jsx';
import { PiPantsFill, PiShirtFoldedFill } from "react-icons/pi";
import { GiSkirt } from "react-icons/gi";

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

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'imported':
            return 'processing';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'imported':
            return 'Imported';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status;
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

export default function DesignDetailPopup({ open, onClose, selectedRequest }) {
    if (!selectedRequest) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                            <Typography style={{
                                fontWeight: 700,
                                fontSize: '20px',
                                color: '#111827',
                                letterSpacing: '-0.025em'
                            }}>
                                Design Request Details
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <Typography style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: 500,
                                    background: '#f3f4f6',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    ID: {parseID(selectedRequest.id, 'dr')}
                                </Typography>
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
                        }} onClick={onClose}>
                            <CloseCircleOutlined style={{
                                color: '#6b7280',
                                fontSize: '20px'
                            }}/>
                        </Box>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{padding: '28px', overflowY: 'auto'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    {/* Request Information Section */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        p: 4,
                        mt: 4,
                        background: '#ffffff',
                        borderRadius: '20px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background Pattern */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '150px',
                            height: '150px',
                            background: 'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.04) 0%, transparent 70%)',
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
                                gap: 4
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 64,
                                    height: 64,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '2px solid #e2e8f0',
                                    position: 'relative',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}>
                                    <FileTextOutlined style={{
                                        color: '#10b981',
                                        fontSize: '28px'
                                    }}/>
                                </Box>
                                
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5
                                }}>
                                    <Typography style={{
                                        fontWeight: 700,
                                        fontSize: '20px',
                                        color: '#111827',
                                        letterSpacing: '-0.025em',
                                        lineHeight: 1.2
                                    }}>
                                        {selectedRequest.name}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Typography style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            fontWeight: 500,
                                            background: '#f9fafb',
                                            padding: '6px 14px',
                                            borderRadius: '16px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {parseID(selectedRequest.id, 'dr')}
                                        </Typography> 
                                    </Box>
                                </Box>
                            </Box>
                            
                            {/* Right Side - Status */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 1.5,
                                pr: 2
                            }}>
                                <Typography style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Current Status
                                </Typography>
                                <Box sx={{
                                    transform: 'scale(1.3)',
                                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))'
                                }}>
                                    <Badge
                                        status={getStatusColor(selectedRequest.status)}
                                        text={getStatusText(selectedRequest.status)}
                                    />
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Bottom Info Bar */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            pt: 3,
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
                                    gap: 1.5,
                                    px: 3,
                                    py: 1.5,
                                    background: 'rgba(16, 185, 129, 0.06)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.15)'
                                }}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: '#10b981'
                                    }} />
                                    <Typography style={{
                                        fontSize: '13px',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}>
                                        {selectedRequest.status === 'imported' ? 'Imported Design' : 'Design Request'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: 2,
                                py: 1,
                                background: '#f9fafb',
                                borderRadius: '10px',
                                border: '1px solid #f3f4f6'
                            }}>
                                <ClockCircleOutlined style={{
                                    color: '#6b7280',
                                    fontSize: '16px'
                                }} />
                                <Typography style={{
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    fontWeight: 500
                                }}>
                                    Created: {formatDate(selectedRequest.creationDate)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Designer and Service Summary Section */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 3,
                        marginTop: '24px',
                        alignItems: 'stretch'
                    }}>
                        {/* Selected Designer */}
                        {selectedRequest.quotation && selectedRequest.quotation.designer && (
                            <Box sx={{flex: 1}}>
                                <Typography style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <UserOutlined style={{color: '#2e7d32', fontSize: '16px'}}/>
                                    Selected Designer
                                </Typography>
                                <Card
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 16,
                                        height: '100%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{
                                        padding: '20px'
                                    }}
                                >
                                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2}}>
                                        <Avatar
                                            size={48}
                                            src={selectedRequest.quotation.designer.customer.avatar || selectedRequest.quotation.designer.customer.name.charAt(0)}
                                            style={{
                                                border: '2px solid #2e7d32',
                                                backgroundColor: '#2e7d32'
                                            }}
                                        >
                                            {selectedRequest.quotation.designer.customer.name.charAt(0)}
                                        </Avatar>
                                        <Box sx={{flex: 1}}>
                                            <Typography style={{fontWeight: 600, fontSize: '14px', color: '#1e293b'}}>
                                                {selectedRequest.quotation.designer.customer.name}
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                                <Rate
                                                    disabled
                                                    defaultValue={selectedRequest.quotation.designer.rating || 0}
                                                    style={{fontSize: '10px'}}
                                                />
                                                <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                    ({selectedRequest.quotation.designer.rating || 0})
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <Space direction="vertical" size="small">
                                                <Space>
                                                    <ShopOutlined style={{color: '#2e7d32', fontSize: '12px'}}/>
                                                    <Typography style={{fontSize: '12px'}}>
                                                        {selectedRequest.quotation.designer.customer.business}
                                                    </Typography>
                                                </Space>
                                                <Space>
                                                    <PhoneOutlined style={{color: '#2e7d32', fontSize: '12px'}}/>
                                                    <Typography style={{fontSize: '12px', color: '#64748b'}}>
                                                        {selectedRequest.quotation.designer.customer.phone}
                                                    </Typography>
                                                </Space>
                                            </Space>
                                        </Col>
                                        <Col span={12}>
                                            <Space direction="vertical" size="small">
                                                <Space>
                                                    <EnvironmentOutlined style={{color: '#64748b', fontSize: '12px'}}/>
                                                    <Typography style={{fontSize: '12px', color: '#64748b'}}>
                                                        {selectedRequest.quotation.designer.customer.address}
                                                    </Typography>
                                                </Space>
                                                <Space>
                                                    <ClockCircleOutlined style={{color: '#2e7d32', fontSize: '12px'}}/>
                                                    <Typography style={{fontSize: '12px', color: '#64748b'}}>
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
                                                            return `${formatTime(selectedRequest.quotation.designer.startTime)} - ${formatTime(selectedRequest.quotation.designer.endTime)}`;
                                                        })()}
                                                    </Typography>
                                                </Space>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            </Box>
                        )}

                        {/* Service Summary */}
                        {selectedRequest.quotation && typeof selectedRequest.quotation === 'object' && (
                            <Box sx={{flex: 1}}>
                                <Typography style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <DollarOutlined style={{color: '#2e7d32', fontSize: '16px'}}/>
                                    Service Summary
                                </Typography>
                                <Card
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 16,
                                        height: '100%',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{
                                        padding: '20px'
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
                                                <Typography style={{
                                                    fontSize: '10px',
                                                    color: '#2e7d32',
                                                    fontWeight: 600
                                                }}>
                                                    PRICE (VND)
                                                </Typography>
                                                <Typography variant="h6" style={{
                                                    margin: '4px 0 0 0',
                                                    color: '#2e7d32',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}>
                                                    {formatCurrency(selectedRequest.quotation.price)}
                                                </Typography>
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
                                                <Typography style={{
                                                    fontSize: '10px',
                                                    color: '#f57c00',
                                                    fontWeight: 600
                                                }}>
                                                    DELIVERY
                                                </Typography>
                                                <Typography variant="h6" style={{
                                                    margin: '4px 0 0 0',
                                                    color: '#f57c00',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}>
                                                    {selectedRequest.quotation.deliveryWithIn} days
                                                </Typography>
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
                                                <Typography style={{
                                                    fontSize: '10px',
                                                    color: '#7c3aed',
                                                    fontWeight: 600
                                                }}>
                                                    REVISIONS
                                                </Typography>
                                                <Typography variant="h6" style={{
                                                    margin: '4px 0 0 0',
                                                    color: '#7c3aed',
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}>
                                                    {selectedRequest.quotation.revisionTime === 9999 ? 'Unlimited' : selectedRequest.quotation.revisionTime}
                                                </Typography>
                                            </Box>
                                        </Col>
                                    </Row>
                                    {selectedRequest.quotation.note && (
                                        <Box sx={{
                                            mt: 1.5,
                                            p: 1.5,
                                            bgcolor: 'rgba(46, 125, 50, 0.05)',
                                            borderRadius: 6,
                                            border: '1px solid rgba(46, 125, 50, 0.1)'
                                        }}>
                                            <Typography style={{
                                                fontStyle: 'italic',
                                                color: '#475569',
                                                fontSize: '12px'
                                            }}>
                                                <strong>Note:</strong> {selectedRequest.quotation.note}
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            </Box>
                        )}
                    </Box>

                    {/* Logo Image Section */}
                    {selectedRequest.logoImage && (
                        <Card
                            title={
                                <Space size="middle">
                                    <PictureOutlined style={{color: '#2e7d32', fontSize: '16px'}}/>
                                    <span style={{fontWeight: 600, fontSize: '15px'}}>Logo Image</span>
                                </Space>
                            }
                            size="small"
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 16,
                                marginTop: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{
                                padding: '24px'
                            }}
                        >
                            <Box sx={{
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                p: 3,
                                background: '#f9fafb',
                                borderRadius: '16px',
                                border: '1px solid #f3f4f6'
                            }}>
                                <DisplayImage
                                    imageUrl={selectedRequest.logoImage}
                                    alt="Logo Design"
                                    width="180px"
                                    height="180px"
                                />
                            </Box>
                        </Card>
                    )}

                    {/* Design Items Section */}
                    <Card
                        title={
                            <Space size="middle">
                                <FileTextOutlined style={{color: '#2e7d32', fontSize: '16px'}}/>
                                <span style={{
                                    fontWeight: 600,
                                    fontSize: '15px'
                                }}>Design Items ({selectedRequest.items?.length || 0})</span>
                            </Space>
                        }
                        size="small"
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 16,
                            height: 'fit-content',
                            marginTop: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                        bodyStyle={{
                            padding: '24px'
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 3,
                            alignItems: 'stretch',
                            minHeight: '300px'
                        }}>
                            {/* Boy Items */}
                            {(() => {
                                const boyItems = selectedRequest.items?.filter(item => item.gender === 'boy') || [];
                                if (boyItems.length > 0) {
                                    const regularItems = boyItems.filter(item => item.category === 'regular');
                                    const peItems = boyItems.filter(item => item.category === 'pe');

                                    return (
                                        <Box sx={{flex: 1}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mb: 2.5,
                                                p: 2,
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.18) 100%)',
                                                borderRadius: 12,
                                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    color: 'white',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    👦
                                                </Box>
                                                <Typography style={{
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: '#1e40af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Boy ({boyItems.length} items)
                                                </Typography>
                                            </Box>

                                            {/* Regular Items */}
                                            {regularItems.length > 0 && (
                                                <Box sx={{mb: 2.5}}>
                                                    <Box sx={{
                                                        p: 2.5,
                                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(22, 163, 74, 0.1) 100%)',
                                                        borderRadius: 12,
                                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 2,
                                                        height: '100%',
                                                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            p: 1.5,
                                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.18) 100%)',
                                                            borderRadius: 8,
                                                            border: '1px solid rgba(34, 197, 94, 0.25)',
                                                            mb: 1.5
                                                        }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 600
                                                            }}>
                                                                🎓
                                                            </Box>
                                                            <Typography style={{
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                color: '#15803d',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                Regular Uniform ({regularItems.length} items)
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {regularItems.map((item, index) => (
                                                                <Box
                                                                    key={item.id || index}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                        borderRadius: 8,
                                                                        background: 'linear-gradient(135deg, #ffffff 0%, rgba(34, 197, 94, 0.02) 100%)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 1
                                                                    }}
                                                                >
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
                                                                            <Typography style={{
                                                                                fontSize: '12px',
                                                                                color: '#1e293b',
                                                                                display: 'block',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                            </Typography>
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
                                                                    <Box sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Fabric:</strong> {item.fabricName}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Color:</strong> {item.color}
                                                                        </Typography>
                                                                        {item.logoPosition && (
                                                                            <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                                <strong>Logo:</strong> {item.logoPosition}
                                                                            </Typography>
                                                                        )}
                                                                        {item.note && (
                                                                            <Typography style={{fontSize: '10px', color: '#64748b', gridColumn: 'span 2'}}>
                                                                                <strong>Note:</strong> {item.note}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* PE Items */}
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
                                                            <Typography style={{
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                color: '#a16207',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                PE Uniform ({peItems.length} items)
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {peItems.map((item, index) => (
                                                                <Box
                                                                    key={item.id || index}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                        borderRadius: 8,
                                                                        background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 1
                                                                    }}
                                                                >
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
                                                                            <Typography style={{
                                                                                fontSize: '12px',
                                                                                color: '#1e293b',
                                                                                display: 'block',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                            </Typography>
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
                                                                    <Box sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Fabric:</strong> {item.fabricName}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Color:</strong> {item.color}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Logo:</strong> {item.logoPosition || 'No logo'}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Note:</strong> {item.note || 'No note'}
                                                                        </Typography>
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

                            {/* Girl Items */}
                            {(() => {
                                const girlItems = selectedRequest.items?.filter(item => item.gender === 'girl') || [];
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
                                                <Typography style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#be185d',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Girl ({girlItems.length} items)
                                                </Typography>
                                            </Box>

                                            {/* Regular Items for Girls - Similar structure but with pink colors */}
                                            {regularItems.length > 0 && (
                                                <Box sx={{mb: 1.5}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.08) 100%)',
                                                        borderRadius: 8,
                                                        border: '1px solid rgba(236, 72, 153, 0.15)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1
                                                    }}>
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
                                                            <Typography style={{
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                color: '#be185d',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                Regular Uniform ({regularItems.length} items)
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {regularItems.map((item, index) => (
                                                                <Box
                                                                    key={item.id || index}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        border: '1px solid #e2e8f0',
                                                                        borderRadius: 8,
                                                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 1
                                                                    }}
                                                                >
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
                                                                            <Typography style={{
                                                                                fontSize: '12px',
                                                                                color: '#1e293b',
                                                                                display: 'block',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                            </Typography>
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
                                                                    <Box sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Fabric:</strong> {item.fabricName}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Color:</strong> {item.color}
                                                                        </Typography>
                                                                        {item.logoPosition ? (
                                                                            <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                                <strong>Logo:</strong> {item.logoPosition}
                                                                            </Typography>
                                                                        ) : (
                                                                            <Typography style={{fontSize: '10px', color: '#94a3b8'}}>
                                                                                <strong>Logo:</strong> No logo
                                                                            </Typography>
                                                                        )}
                                                                        {item.note ? (
                                                                            <Typography style={{fontSize: '10px', color: '#64748b', gridColumn: 'span 1'}}>
                                                                                <strong>Note:</strong> {item.note}
                                                                            </Typography>
                                                                        ) : (
                                                                            <Typography style={{fontSize: '10px', color: '#94a3b8'}}>
                                                                                <strong>Note:</strong> No note
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* PE Items for Girls */}
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
                                                            <Typography style={{
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                color: '#a16207',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px'
                                                            }}>
                                                                PE Uniform ({peItems.length} items)
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1
                                                        }}>
                                                            {peItems.map((item, index) => (
                                                                <Box
                                                                    key={item.id || index}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                        borderRadius: 8,
                                                                        background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 1
                                                                    }}
                                                                >
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
                                                                            <Typography style={{
                                                                                fontSize: '12px',
                                                                                color: '#1e293b',
                                                                                display: 'block',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                            </Typography>
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
                                                                    <Box sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Fabric:</strong> {item.fabricName}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Color:</strong> {item.color}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Logo:</strong> {item.logoPosition || 'No logo'}
                                                                        </Typography>
                                                                        <Typography style={{fontSize: '10px', color: '#64748b'}}>
                                                                            <strong>Note:</strong> {item.note || 'No note'}
                                                                        </Typography>
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
                </Box>
            </DialogContent>
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
