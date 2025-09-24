import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    Avatar
} from '@mui/material';
import { Space, Badge, Tag, Row, Col, Rate, Typography as AntTypography } from 'antd';
const { Text } = AntTypography;
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
import { formatDate, formatDateTimeSecond } from '../../../utils/TimestampUtil';
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
        case 'processing':
            return 'Processing';
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
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    border: 'none',
                                    borderRadius: 4,
                                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '6px',
                                        background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 30%, #1d4ed8 60%, #1e40af 100%)'
                                    }}/>

                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '150px',
                                        height: '150px',
                                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                        transform: 'translate(30px, -30px)'
                                    }}/>

                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        p: 3,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(-30px, -30px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <UserOutlined sx={{color: 'white', fontSize: 20}}/>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    fontSize: '1.25rem'
                                                }}>
                                                    Selected Designer
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                    fontWeight: 500
                                                }}>
                                                    Designer information and contact details
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{p: 4}}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            mb: 3
                                        }}>
                                            <Avatar
                                                src={selectedRequest.quotation.designer.customer.avatar}
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    border: '3px solid #3b82f6'
                                                }}
                                            >
                                                {selectedRequest.quotation.designer.customer.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '1.25rem',
                                                    mb: 0.5
                                                }}>
                                                    {selectedRequest.quotation.designer.customer.name}
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 1
                                                }}>
                                                    <Rate
                                                        disabled
                                                        value={selectedRequest.quotation.designer.rating || 0}
                                                        style={{fontSize: '14px'}}
                                                    />
                                                    <Typography variant="body2" sx={{
                                                        color: '#64748b',
                                                        fontSize: '12px'
                                                    }}>
                                                        ({selectedRequest.quotation.designer.rating || 0} reviews)
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#3b82f6',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {selectedRequest.quotation.designer.customer.business}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}>
                                            {selectedRequest.quotation.designer.customer.phone && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    background: 'rgba(248, 250, 252, 0.8)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(59, 130, 246, 0.05)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <PhoneOutlined sx={{color: 'white', fontSize: 18}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Phone
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            lineHeight: 1.4
                                                        }}>
                                                            {selectedRequest.quotation.designer.customer.phone}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            {selectedRequest.quotation.designer.customer.address && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    background: 'rgba(248, 250, 252, 0.8)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(59, 130, 246, 0.05)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <EnvironmentOutlined sx={{color: 'white', fontSize: 18}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Address
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            lineHeight: 1.4
                                                        }}>
                                                            {selectedRequest.quotation.designer.customer.address}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            {selectedRequest.quotation.designer.startTime && selectedRequest.quotation.designer.endTime && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    background: 'rgba(248, 250, 252, 0.8)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(59, 130, 246, 0.05)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}>
                                                    <Box sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <ClockCircleOutlined sx={{color: 'white', fontSize: 18}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            Working Time
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            lineHeight: 1.4
                                                        }}>
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
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Service Summary */}
                        {selectedRequest.quotation && typeof selectedRequest.quotation === 'object' && (
                            <Box sx={{flex: 1}}>
                                <Card sx={{
                                    height: '53vh',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    border: 'none',
                                    borderRadius: 4,
                                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '6px',
                                        background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 30%, #a855f7 60%, #c084fc 100%)'
                                    }}/>

                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '150px',
                                        height: '150px',
                                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                        transform: 'translate(30px, -30px)'
                                    }}/>

                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        p: 3,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(-30px, -30px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                            }}>
                                                <DollarOutlined sx={{color: 'white', fontSize: 20}}/>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    fontSize: '1.25rem'
                                                }}>
                                                    Service Summary
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                    fontWeight: 500
                                                }}>
                                                    Pricing and service details
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{p: 4}}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,
                                            mb: 3
                                        }}>
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                                border: '1px solid rgba(34, 197, 94, 0.1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
                                                }
                                            }}>
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    borderRadius: '50%',
                                                    transform: 'translate(10px, -10px)'
                                                }}/>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                                    }}>
                                                        <DollarOutlined sx={{color: 'white', fontSize: 16}}/>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            display: 'block',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            Price (VND)
                                                        </Typography>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            fontSize: '1rem'
                                                        }}>
                                                            {formatCurrency(selectedRequest.quotation.price)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                                border: '1px solid rgba(245, 158, 11, 0.1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
                                                }
                                            }}>
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    borderRadius: '50%',
                                                    transform: 'translate(10px, -10px)'
                                                }}/>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                                    }}>
                                                        <ClockCircleOutlined sx={{color: 'white', fontSize: 16}}/>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            display: 'block',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            Delivery
                                                        </Typography>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            fontSize: '1rem'
                                                        }}>
                                                            {selectedRequest.quotation.deliveryWithIn} days
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
                                                }
                                            }}>
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: '50%',
                                                    transform: 'translate(10px, -10px)'
                                                }}/>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                                    }}>
                                                        <FileTextOutlined sx={{color: 'white', fontSize: 16}}/>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            display: 'block',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            Revisions
                                                        </Typography>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 700,
                                                            color: '#1e293b',
                                                            fontSize: '1rem'
                                                        }}>
                                                            {selectedRequest.quotation.revisionTime === 9999 ? 'Unlimited' : selectedRequest.quotation.revisionTime}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {selectedRequest.quotation.note && (
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                                                border: '1px solid rgba(107, 114, 128, 0.15)',
                                                borderLeft: '4px solid #6b7280'
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 2
                                                }}>
                                                    <Box sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        mt: 0.5,
                                                        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                                                    }}>
                                                        <InfoCircleOutlined sx={{color: 'white', fontSize: 16}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 600,
                                                            color: '#374151',
                                                            mb: 1
                                                        }}>
                                                            Service Notes
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#6b7280',
                                                            lineHeight: 1.6,
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {selectedRequest.quotation.note}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Box>

                    {/* Payment Information Section */}
                    {selectedRequest.transactions && selectedRequest.transactions.length > 0 && (
                        <Card sx={{
                            mb: 4,
                            mt: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            border: 'none',
                            borderRadius: 4,
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 16px 50px rgba(0, 0, 0, 0.15)'
                            }
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '6px',
                                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 30%, #15803d 60%, #166534 100%)'
                            }}/>

                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '150px',
                                height: '150px',
                                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30px, -30px)'
                            }}/>

                            <Box sx={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                p: 3,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    transform: 'translate(-30px, -30px)'
                                }}/>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    }}>
                                        <DollarOutlined sx={{color: 'white', fontSize: 20}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'white',
                                            fontSize: '1.25rem'
                                        }}>
                                            Payment Information
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: 500
                                        }}>
                                            Payment breakdown and financial details
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <CardContent sx={{p: 4}}>
                                {/* Transactions Section */}
                                {(() => {
                                    // Filter transactions to only show design and design_return
                                    const filteredTransactions = selectedRequest.transactions.filter(transaction =>
                                        ['design', 'design_return'].includes(transaction.paymentType)
                                    );

                                    return filteredTransactions.length > 0 && (
                                        <Box sx={{mb: 4}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2
                                            }}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b'
                                                }}>
                                                    Transactions
                                                </Typography>
                                                <Chip
                                                    label={`${filteredTransactions.length} transactions`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#06b6d410',
                                                        color: '#06b6d4',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: '1fr',
                                                    md: '1fr 1fr'
                                                },
                                                gap: 2
                                            }}>
                                                {[...filteredTransactions]
                                                    .sort((a, b) => {
                                                        const aPriority = a?.paymentType === 'design' ? 0 : 1;
                                                        const bPriority = b?.paymentType === 'design' ? 0 : 1;
                                                        if (aPriority !== bPriority) return aPriority - bPriority;
                                                        return new Date(b.creationDate) - new Date(a.creationDate);
                                                    })
                                                    .map((transaction) => {
                                                        const isReceiver = transaction?.receiver?.id === selectedRequest?.school?.id;
                                                        const otherParty = isReceiver ? transaction?.sender : transaction?.receiver;
                                                        const senderParty = transaction?.sender;
                                                        const receiverParty = transaction?.receiver;
                                                        const isSuccess = transaction?.status === 'success';
                                                        const paymentTypeLabel =
                                                            transaction?.paymentType === 'design' ? 'Design Payment' :
                                                                transaction?.paymentType === 'design_return' ? 'Design Refund' :
                                                                    transaction?.paymentType || 'Payment';

                                                        return (
                                                            <Card
                                                                key={transaction.id}
                                                                elevation={0}
                                                                sx={{
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: 2,
                                                                    boxShadow: 'none',
                                                                    '&:hover': {
                                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                                        transform: 'translateY(-2px)'
                                                                    },
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <CardContent sx={{p: 3}}>
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
                                                                                width: 44,
                                                                                height: 44,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: isReceiver ? '#dcfce7' : '#fef3c7'
                                                                            }}>
                                                                                <DollarOutlined
                                                                                    sx={{color: isReceiver ? '#16a34a' : '#d97706'}}/>
                                                                            </Box>
                                                                            <Box>
                                                                                <Typography variant="subtitle1" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#1e293b'
                                                                                }}>
                                                                                    {paymentTypeLabel}
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    color: '#64748b'
                                                                                }}>
                                                                                    From {senderParty?.business || 'Unknown'}
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    color: '#64748b'
                                                                                }}>
                                                                                    To {receiverParty?.business || 'Unknown'}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>

                                                                        <Box sx={{textAlign: 'right'}}>
                                                                            <Typography variant="h6" sx={{
                                                                                fontWeight: 700,
                                                                                color: '#10b981'
                                                                            }}>
                                                                                {formatCurrency(transaction.amount)}
                                                                            </Typography>
                                                                            <Chip
                                                                                label={isSuccess ? 'Successful' : 'Failed'}
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                                                                                    color: isSuccess ? '#166534' : '#dc2626',
                                                                                    fontWeight: 600,
                                                                                    fontSize: '11px',
                                                                                    mt: 0.5
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        pt: 2,
                                                                        mt: 1,
                                                                        borderTop: '1px solid #f1f5f9'
                                                                    }}>
                                                                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                                            {transaction.itemId && transaction.itemId !== 0 && (
                                                                                <Box>
                                                                                    <Typography variant="body2" sx={{
                                                                                        color: '#64748b',
                                                                                        fontSize: '12px'
                                                                                    }}>
                                                                                        Request ID
                                                                                    </Typography>
                                                                                    <Chip
                                                                                        label={parseID(transaction.itemId, 'dr')}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            backgroundColor: '#f3e8ff',
                                                                                            color: '#7c3aed',
                                                                                            fontWeight: 600,
                                                                                            fontSize: '10px',
                                                                                            height: '20px'
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                            )}
                                                                            {transaction.serviceFee > 0 && (
                                                                                <Box>
                                                                                    <Typography variant="body2" sx={{
                                                                                        color: '#64748b',
                                                                                        fontSize: '12px'
                                                                                    }}>
                                                                                        Service Fee
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{
                                                                                        color: '#f59e0b',
                                                                                        fontWeight: 600,
                                                                                        fontSize: '13px',
                                                                                        mt: '0.5vh'
                                                                                    }}>
                                                                                        {formatCurrency(transaction.serviceFee)}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                            <Box>
                                                                                <Typography variant="body2" sx={{
                                                                                    color: '#64748b',
                                                                                    fontSize: '12px'
                                                                                }}>
                                                                                    Paid from
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    color: '#0ea5b8',
                                                                                    fontWeight: 600,
                                                                                    fontSize: '13px',
                                                                                    mt: '0.5vh'
                                                                                }}>
                                                                                    {transaction.paymentGatewayCode?.includes('w') ? 'Wallet' : 'VNPay'}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>

                                                                        <Box sx={{textAlign: 'right'}}>
                                                                            <Typography variant="body2" sx={{
                                                                                color: '#64748b',
                                                                                fontSize: '12px'
                                                                            }}>
                                                                                Payment Date
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{
                                                                                color: '#1e293b',
                                                                                fontWeight: 600,
                                                                                fontSize: '13px',
                                                                                mt: '0.5vh'
                                                                            }}>
                                                                                {formatDateTimeSecond(transaction.creationDate)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                            </Box>
                                        </Box>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}

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

                    {/* Design Results Section - Only show for imported or completed status */}
                    {(selectedRequest.status === 'imported' || selectedRequest.status === 'completed') && selectedRequest.resultDelivery && (
                        <Card
                            title={
                                <Space size="middle">
                                    <PictureOutlined style={{color: '#10b981', fontSize: '16px'}}/>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: '15px'
                                    }}>Design Results</span>
                                </Space>
                            }
                            size="small"
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 16,
                                marginTop: '24px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{
                                padding: '24px'
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                            }}>
                                {/* Handle both object and array formats of resultDelivery */}
                                {(() => {
                                    // Check if resultDelivery is an array (new format) or object (old format)
                                    const isArrayFormat = Array.isArray(selectedRequest.resultDelivery);
                                    const resultItems = isArrayFormat ? selectedRequest.resultDelivery : selectedRequest.resultDelivery.items;
                                    
                                    return (
                                        <>
                                            {/* Result Info Header - Only show for object format */}
                                            {!isArrayFormat && (
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
                                                                {selectedRequest.resultDelivery.name || 'Design Result'}
                                                            </Text>
                                                            <Text style={{
                                                                fontSize: '12px',
                                                                color: '#6b7280'
                                                            }}>
                                                                Submitted: {formatDate(selectedRequest.resultDelivery.submitDate)}
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
                                                        ID: {parseID(selectedRequest.resultDelivery.id, 'dd')}
                                                    </Text>
                                                </Box>
                                            )}

                                            {/* Design Items Results */}
                                            {resultItems && resultItems.length > 0 && (
                                                <Box sx={{border: 'none'}}>
                                                    <Text style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#374151',
                                                        marginBottom: '12px',
                                                        display: 'block',
                                                        marginTop: '5px',
                                                        marginLeft: '10px'
                                                    }}>
                                                        Design Result: ({resultItems.length} items)
                                                    </Text>
                                                    
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 2
                                                    }}>
                                                        {resultItems.map((resultItem, index) => (
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
                                                                    fontSize: '18px',
                                                                    fontWeight: 600,
                                                                    color: '#111827'
                                                                }}>
                                                                    {resultItem.designItem.type.charAt(0).toUpperCase() + resultItem.designItem.type.slice(1)} - {resultItem.designItem.category}
                                                                </Text>
                                                                <Text>|</Text>
                                                                <Text style={{
                                                                    fontSize: '18px',
                                                                    fontWeight: 600,
                                                                    color: '#111827'
                                                                }}>
                                                                    {resultItem.designItem.gender.charAt(0).toUpperCase() + resultItem.designItem.gender.slice(1)}
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
                                                            <Box sx={{flex: 1, gap: 1, display: 'flex', alignItems: 'center'}}>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#7c3aed',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Color
                                                                </Text>
                                                                <Box sx={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: '50%',
                                                                    bgcolor: resultItem.designItem.color,
                                                                    border: '1px solid #ffffff',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                    flexShrink: 0
                                                                }}/>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#374151',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {resultItem.designItem.color}
                                                                </Text>
                                                            </Box>
                                                        </Box>

                                                        {/* Fabric */}
                                                        <Box sx={{
                                                            p: 1,
                                                            background: 'rgba(16, 185, 129, 0.05)',
                                                            borderRadius: '6px',
                                                            border: '1px solid rgba(16, 185, 129, 0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Text style={{
                                                                fontSize: '11px',
                                                                color: '#10b981',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Fabric
                                                            </Text>
                                                            <Text style={{
                                                                fontSize: '11px',
                                                                color: '#374151',
                                                                fontWeight: 500
                                                            }}>
                                                                {resultItem.designItem.fabricName}
                                                            </Text>
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
                                                                    fontSize: '11px',
                                                                    color: '#f57c00',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Logo Position
                                                                </Text>
                                                                <Text style={{
                                                                    fontSize: '11px',
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
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#10b981',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Logo Size
                                                                </Text>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#374151',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {resultItem.baseLogoWidth}cm × {resultItem.baseLogoHeight}cm
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {/* Logo Attaching Technique - For shirts */}
                                                        {resultItem.designItem.type === 'shirt' && resultItem.logoAttachingTechnique && (
                                                            <Box sx={{
                                                                p: 1,
                                                                background: 'rgba(139, 69, 19, 0.05)',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(139, 69, 19, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#8b4513',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Logo Technique
                                                                </Text>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#374151',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {resultItem.logoAttachingTechnique}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {/* Logo Note - For shirts */}
                                                        {resultItem.designItem.type === 'shirt' && resultItem.logoNote && (
                                                            <Box sx={{
                                                                p: 1,
                                                                background: 'rgba(139, 69, 19, 0.05)',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(139, 69, 19, 0.1)',
                                                                gridColumn: 'span 2',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#8b4513',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Logo Note
                                                                </Text>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#374151',
                                                                    fontWeight: 500,
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    {resultItem.logoNote}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {/* Button Information - For shirts */}
                                                        {resultItem.designItem.type === 'shirt' && resultItem.buttonQty > 0 && (
                                                            <>
                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(59, 130, 246, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#3b82f6',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Button Qty
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.buttonQty}
                                                                    </Text>
                                                                </Box>

                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(59, 130, 246, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#3b82f6',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Button Type
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.buttonHoleQty} holes
                                                                    </Text>
                                                                </Box>

                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(59, 130, 246, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#3b82f6',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Button Size
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.buttonWidth}cm × {resultItem.buttonHeight}cm
                                                                    </Text>
                                                                </Box>

                                                                <Box sx={{
                                                                    p: 1,
                                                                    background: 'rgba(59, 130, 246, 0.05)',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#3b82f6',
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Button Color
                                                                    </Text>
                                                                    <Box sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        bgcolor: resultItem.buttonColor,
                                                                        border: '1px solid #ffffff',
                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                        flexShrink: 0
                                                                    }}/>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#374151',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {resultItem.buttonColor}
                                                                    </Text>
                                                                </Box>

                                                                {resultItem.buttonNote && (
                                                                    <Box sx={{
                                                                        p: 1,
                                                                        background: 'rgba(59, 130, 246, 0.05)',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid rgba(59, 130, 246, 0.1)',
                                                                        gridColumn: 'span 2',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}>
                                                                        <Text style={{
                                                                            fontSize: '11px',
                                                                            color: '#3b82f6',
                                                                            fontWeight: 600,
                                                                            textTransform: 'uppercase'
                                                                        }}>
                                                                            Button Note
                                                                        </Text>
                                                                        <Text style={{
                                                                            fontSize: '11px',
                                                                            color: '#374151',
                                                                            fontWeight: 500,
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            {resultItem.buttonNote}
                                                                        </Text>
                                                                    </Box>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Zipper Information - For pants/skirts */}
                                                        {(resultItem.designItem.type === 'pants' || resultItem.designItem.type === 'skirt') && (
                                                            <Box sx={{
                                                                p: 1,
                                                                background: 'rgba(168, 85, 247, 0.05)',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(168, 85, 247, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#a855f7',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Zipper
                                                                </Text>
                                                                <Text style={{
                                                                    fontSize: '11px',
                                                                    color: '#374151',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {resultItem.zipper ? 'Yes' : 'No'}
                                                                </Text>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {/* Design Images */}
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: 2,
                                                        mb: 2,
                                                        mt: 2
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
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                            )}

                                            {/* Design Notes - Only show for object format */}
                                            {!isArrayFormat && selectedRequest.resultDelivery.note && (
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
                                                        {selectedRequest.resultDelivery.note}
                                                    </Text>
                                                </Box>
                                            )}
                                        </>
                                    );
                                })()}
                            </Box>
                        </Card>
                    )}
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
