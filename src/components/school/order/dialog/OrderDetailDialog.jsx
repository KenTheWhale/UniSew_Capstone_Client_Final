import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Chip,
    Grid,
    Paper,
    Divider,
    Avatar,
    IconButton,
    Card,
    CardContent,
    Stack,
    Container
} from '@mui/material';
import {
    Close as CloseIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    DesignServices as DesignServicesIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Info as InfoIcon,
    AttachMoney as MoneyIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { parseID } from '../../../../utils/ParseIDUtil.jsx';
import DisplayImage from '../../../ui/DisplayImage.jsx';

// Status tag function from RequestDetailPopup
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

export default function OrderDetailDialog({ open, onClose, order }) {
    if (!order) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Transform order details to items with individual pricing
    const transformOrderItems = (orderDetails) => {
        return orderDetails.map(detail => {
            const itemPrice = 150000; // Default price per item
            return {
                name: `${detail.deliveryItem.designItem.gender === 'boy' ? 'Male' : 'Female'} ${detail.deliveryItem.designItem.type.charAt(0).toUpperCase() + detail.deliveryItem.designItem.type.slice(1)}`,
                quantity: detail.quantity,
                price: itemPrice,
                size: detail.size,
                category: detail.deliveryItem.designItem.category,
                fabricName: detail.deliveryItem.designItem.fabricName,
                color: detail.deliveryItem.designItem.color,
                frontImageUrl: detail.deliveryItem.frontImageUrl,
                backImageUrl: detail.deliveryItem.backImageUrl,
                logoPosition: detail.deliveryItem.designItem.logoPosition,
                logoImageUrl: detail.deliveryItem.designItem.logoImageUrl,
                baseLogoWidth: detail.deliveryItem.baseLogoWidth,
                baseLogoHeight: detail.deliveryItem.baseLogoHeight,
                sampleImages: detail.deliveryItem.designItem.sampleImages || [],
                note: detail.deliveryItem.designItem.note || ''
            };
        });
    };

    const items = transformOrderItems(order.orderDetails || []);
    const regularItems = items.filter(item => item.category === 'regular');
    const peItems = items.filter(item => item.category === 'physical education' || item.category === 'pe');

    // Calculate total uniforms: sum all quantities and divide by 2 (1 uniform = shirt + pants/skirt)
    const totalQuantity = (order.orderDetails || []).reduce((sum, detail) => sum + detail.quantity, 0);
    const totalUniforms = Math.ceil(totalQuantity / 2);

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
                borderBottom: '1px solid #f0f0f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                color: 'white'
            }}>
                <InfoIcon style={{color: 'white', fontSize: '18px'}}/>
                <span style={{fontWeight: 600, fontSize: '16px'}}>
                    Order Details: {parseID(order.id, 'ord')}
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
                        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5, fontSize: '16px' }}>
                                        {order.selectedDesign?.designRequest?.name || 'Order'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '12px' }}>
                                        Created: {formatDate(order.orderDate)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontSize: '12px', color: '#64748b', mb: 0.5 }}>
                                    Order Detail
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8' }}>
                                    Basic Information
                                </Typography>
                            </Box>
                            
                            <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                                {statusTag(order.status)}
                            </Box>
                        </Box>
                    </Card>

                    {/* Order Information */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        marginTop: '16px',
                        alignItems: 'stretch'
                    }}>
                        {/* Order Summary Card */}
                        <Box sx={{flex: 1}}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                color: '#1e293b', 
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <InfoIcon style={{color: '#2e7d32', fontSize: '20px'}}/>
                                Order Information
                            </Typography>
                            <Card
                                title={
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <MoneyIcon style={{color: '#2e7d32', fontSize: '16px'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>Order Summary</span>
                                    </Box>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    height: '100%'
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <Box sx={{
                                            flex: 1,
                                            p: 1.5,
                                            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
                                            borderRadius: 6,
                                            border: '1px solid rgba(46, 125, 50, 0.2)',
                                            textAlign: 'center'
                                        }}>
                                            <CalendarIcon sx={{ 
                                                fontSize: 20, 
                                                color: '#2e7d32', 
                                                mb: 0.5,
                                                display: 'block',
                                                mx: 'auto'
                                            }} />
                                            <Typography variant="caption" sx={{
                                                fontSize: '10px',
                                                color: '#2e7d32',
                                                fontWeight: 600,
                                                display: 'block'
                                            }}>
                                                ORDER DATE
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                margin: '4px 0 0 0',
                                                color: '#2e7d32',
                                                fontWeight: 700,
                                                fontSize: '14px'
                                            }}>
                                                {formatDate(order.orderDate)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            flex: 1,
                                            p: 1.5,
                                            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.15) 100%)',
                                            borderRadius: 6,
                                            border: '1px solid rgba(255, 152, 0, 0.2)',
                                            textAlign: 'center'
                                        }}>
                                            <TimeIcon sx={{ 
                                                fontSize: 20, 
                                                color: '#f57c00', 
                                                mb: 0.5,
                                                display: 'block',
                                                mx: 'auto'
                                            }} />
                                            <Typography variant="caption" sx={{
                                                fontSize: '10px',
                                                color: '#f57c00',
                                                fontWeight: 600,
                                                display: 'block'
                                            }}>
                                                DEADLINE
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                margin: '4px 0 0 0',
                                                color: '#f57c00',
                                                fontWeight: 700,
                                                fontSize: '14px'
                                            }}>
                                                {formatDate(order.deadline)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            flex: 1,
                                            p: 1.5,
                                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.15) 100%)',
                                            borderRadius: 6,
                                            border: '1px solid rgba(124, 58, 237, 0.2)',
                                            textAlign: 'center'
                                        }}>
                                            <DesignServicesIcon sx={{ 
                                                fontSize: 20, 
                                                color: '#7c3aed', 
                                                mb: 0.5,
                                                display: 'block',
                                                mx: 'auto'
                                            }} />
                                            <Typography variant="caption" sx={{
                                                fontSize: '10px',
                                                color: '#7c3aed',
                                                fontWeight: 600,
                                                display: 'block'
                                            }}>
                                                TOTAL UNIFORMS
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                margin: '4px 0 0 0',
                                                color: '#7c3aed',
                                                fontWeight: 700,
                                                fontSize: '14px'
                                            }}>
                                                {totalUniforms} uniforms
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>

                    {/* Product Details Section */}
                    <Card
                        title={
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <DesignServicesIcon style={{color: '#2e7d32', fontSize: '16px'}}/>
                                <span style={{fontWeight: 600, fontSize: '14px'}}>
                                    Product Details ({items.length} items)
                                </span>
                            </Box>
                        }
                        size="small"
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
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
                            {/* Regular Uniforms Section */}
                            {regularItems.length > 0 && (
                                <Box sx={{flex: 1}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1,
                                        p: 1,
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 100%)',
                                        borderRadius: 6,
                                        border: '1px solid rgba(34, 197, 94, 0.2)'
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
                                        <Typography variant="body2" sx={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#15803d',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Regular Uniforms ({regularItems.length} items)
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        gap: 1,
                                        alignItems: 'stretch'
                                    }}>
                                        {regularItems.map((item, index) => (
                                            <Box
                                                key={index}
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
                                                        <DesignServicesIcon sx={{fontSize: 16}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '12px',
                                                            color: '#1e293b',
                                                            display: 'block',
                                                            fontWeight: 600
                                                        }}>
                                                            {item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${item.quantity} items`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#22c55e',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '9px',
                                                            height: '20px'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Compact Details Grid */}
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 1,
                                                    mb: 1
                                                }}>
                                                    {/* Size */}
                                                    <Box sx={{
                                                        p: 1,
                                                        background: 'rgba(46, 125, 50, 0.08)',
                                                        borderRadius: 4,
                                                        border: '1px solid rgba(46, 125, 50, 0.15)'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '9px',
                                                            color: '#2e7d32',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            mb: 0.5,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Size
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '10px',
                                                            color: '#1e293b',
                                                            fontWeight: 500
                                                        }}>
                                                            {item.size}
                                                        </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#7c3aed',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Color
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.color}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Logo Size */}
                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) ? (
                                                        <Box sx={{
                                                            p: 1,
                                                            background: 'rgba(255, 152, 0, 0.08)',
                                                            borderRadius: 4,
                                                            border: '1px solid rgba(255, 152, 0, 0.15)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#f57c00',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Logo Size
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                            </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: 'rgba(255, 152, 0, 0.5)',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                No Logo
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Logo Position */}
                                                    {item.logoPosition ? (
                                                        <Box sx={{
                                                            p: 1,
                                                            background: 'rgba(236, 72, 153, 0.08)',
                                                            borderRadius: 4,
                                                            border: '1px solid rgba(236, 72, 153, 0.15)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#ec4899',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Logo Position
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.logoPosition}
                                                            </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: 'rgba(236, 72, 153, 0.5)',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                No Logo
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Product Images */}
                                                {(item.frontImageUrl || item.backImageUrl) && (
                                                    <Box sx={{
                                                        pt: 1,
                                                        borderTop: '1px solid #f1f5f9',
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '9px',
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            display: 'block',
                                                            color: '#475569',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Product Images
                                                        </Typography>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            {item.frontImageUrl && (
                                                                <Box sx={{
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
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front View"
                                                                        width="36px"
                                                                        height="36px"
                                                                    />
                                                                </Box>
                                                            )}
                                                            {item.backImageUrl && (
                                                                <Box sx={{
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
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back View"
                                                                        width="36px"
                                                                        height="36px"
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Physical Education Section */}
                            {peItems.length > 0 && (
                                <Box sx={{flex: 1}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1,
                                        p: 1,
                                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
                                        borderRadius: 6,
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            ⚽
                                        </Box>
                                        <Typography variant="body2" sx={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#a16207',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Physical Education ({peItems.length} items)
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        gap: 1,
                                        alignItems: 'stretch'
                                    }}>
                                        {peItems.map((item, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    flex: 1,
                                                    p: 1.5,
                                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                                    borderRadius: 8,
                                                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
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
                                                        <DesignServicesIcon sx={{fontSize: 16}}/>
                                                    </Box>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '12px',
                                                            color: '#1e293b',
                                                            display: 'block',
                                                            fontWeight: 600
                                                        }}>
                                                            {item.name}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${item.quantity} items`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#f59e0b',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '9px',
                                                            height: '20px'
                                                        }}
                                                    />
                                                </Box>

                                                {/* Compact Details Grid */}
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 1,
                                                    mb: 1
                                                }}>
                                                    {/* Size */}
                                                    <Box sx={{
                                                        p: 1,
                                                        background: 'rgba(46, 125, 50, 0.08)',
                                                        borderRadius: 4,
                                                        border: '1px solid rgba(46, 125, 50, 0.15)'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '9px',
                                                            color: '#2e7d32',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            mb: 0.5,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Size
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '10px',
                                                            color: '#1e293b',
                                                            fontWeight: 500
                                                        }}>
                                                            {item.size}
                                                        </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#7c3aed',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Color
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.color}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Logo Size */}
                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) ? (
                                                        <Box sx={{
                                                            p: 1,
                                                            background: 'rgba(255, 152, 0, 0.08)',
                                                            borderRadius: 4,
                                                            border: '1px solid rgba(255, 152, 0, 0.15)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#f57c00',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Logo Size
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                            </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: 'rgba(255, 152, 0, 0.5)',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                No Logo
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Logo Position */}
                                                    {item.logoPosition ? (
                                                        <Box sx={{
                                                            p: 1,
                                                            background: 'rgba(236, 72, 153, 0.08)',
                                                            borderRadius: 4,
                                                            border: '1px solid rgba(236, 72, 153, 0.15)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: '#ec4899',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 0.5,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Logo Position
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                fontSize: '10px',
                                                                color: '#1e293b',
                                                                fontWeight: 500
                                                            }}>
                                                                {item.logoPosition}
                                                            </Typography>
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
                                                            <Typography variant="caption" sx={{
                                                                fontSize: '9px',
                                                                color: 'rgba(236, 72, 153, 0.5)',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                No Logo
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Product Images */}
                                                {(item.frontImageUrl || item.backImageUrl) && (
                                                    <Box sx={{
                                                        pt: 1,
                                                        borderTop: '1px solid #f1f5f9',
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '9px',
                                                            fontWeight: 600,
                                                            mb: 0.5,
                                                            display: 'block',
                                                            color: '#475569',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Product Images
                                                        </Typography>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            {item.frontImageUrl && (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    height: '36px',
                                                                    width: '36px',
                                                                    border: '1px solid #e2e8f0',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        borderColor: '#f59e0b',
                                                                        transform: 'scale(1.05)'
                                                                    }
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front View"
                                                                        width="36px"
                                                                        height="36px"
                                                                    />
                                                                </Box>
                                                            )}
                                                            {item.backImageUrl && (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    height: '36px',
                                                                    width: '36px',
                                                                    border: '1px solid #e2e8f0',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        borderColor: '#f59e0b',
                                                                        transform: 'scale(1.05)'
                                                                    }
                                                                }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back View"
                                                                        width="36px"
                                                                        height="36px"
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Card>

                    {/* Additional Information */}
                    {order.note && (
                        <Card
                            title={
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <InfoIcon style={{color: '#2e7d32', fontSize: '16px'}}/>
                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Additional Information</span>
                                </Box>
                            }
                            size="small"
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)'
                            }}
                        >
                            <Box sx={{
                                p: 1.5,
                                bgcolor: 'rgba(255, 193, 7, 0.1)',
                                borderRadius: 6,
                                border: '1px solid rgba(255, 193, 7, 0.2)'
                            }}>
                                <Typography variant="body2" sx={{
                                    color: '#92400e',
                                    fontSize: '12px',
                                    lineHeight: 1.6,
                                    fontWeight: 500
                                }}>
                                    <strong>Order Notes:</strong> {order.note}
                                </Typography>
                            </Box>
                        </Card>
                    )}

                </Box>
            </DialogContent>

            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button 
                    onClick={onClose}
                    sx={{
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        '&:hover': {
                            backgroundColor: '#f1f5f9',
                            borderColor: '#cbd5e1'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
} 