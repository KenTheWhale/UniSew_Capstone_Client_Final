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
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    DesignServices as DesignServicesIcon
} from '@mui/icons-material';
import { parseID } from '../../../utils/ParseIDUtil';
import DisplayImage from '../../ui/DisplayImage';

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return { color: '#f57c00', bgColor: '#fff3e0' };
            case 'processing':
                return { color: '#1976d2', bgColor: '#e3f2fd' };
            case 'completed':
                return { color: '#2e7d32', bgColor: '#e8f5e8' };
            case 'cancelled':
            case 'canceled':
                return { color: '#d32f2f', bgColor: '#ffebee' };
            default:
                return { color: '#64748b', bgColor: '#f1f5f9' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <PendingIcon />;
            case 'processing':
                return <ShippingIcon />;
            case 'completed':
                return <CheckCircleIcon />;
            case 'cancelled':
            case 'canceled':
                return <CancelIcon />;
            default:
                return <PendingIcon />;
        }
    };

    const { color: statusColor, bgColor: statusBgColor } = getStatusColor(order.status);

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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    position: 'relative',
                    py: 4,
                    px: 4
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <BusinessIcon sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                                Order Details
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                {parseID(order.id, 'ord')}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            px: 2,
                            py: 1,
                            backdropFilter: 'blur(10px)',
                            '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: '1.2rem'
                            }
                        }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, backgroundColor: '#fafafa' }}>
                <Box sx={{ p: 4 }}>
                    {/* Order Summary */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                color: '#2e7d32'
                            }}>
                                <BusinessIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Order Summary
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* School Info */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                                    School Information
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    {order.school?.avatar && (
                                        <Avatar
                                            src={order.school.avatar}
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    )}
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {order.school?.business || 'Unknown School'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {order.school?.name || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                                {order.school?.phone && (
                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                        📞 {order.school.phone}
                                    </Typography>
                                )}
                                {order.school?.account?.email && (
                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                        ✉️ {order.school.account.email}
                                    </Typography>
                                )}
                                {order.school?.address && (
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        📍 {order.school.address}
                                    </Typography>
                                )}
                            </Box>

                            {/* Order Details */}
                            <Box sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                                    Order Details
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Order Date:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {formatDate(order.orderDate)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Delivery Deadline:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {formatDate(order.deadline)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Total Items:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {items.length} items
                                        </Typography>
                                    </Box>
                                    {order.school?.taxCode && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                Tax Code:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                {order.school.taxCode}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Product Details */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                color: '#2e7d32'
                            }}>
                                <DesignServicesIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Product Details
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Regular Uniforms Section */}
                            <Box sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    color: 'white',
                                    p: 4,
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                        Regular Uniforms
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Daily school uniforms
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 4 }}>
                                    {regularItems.length > 0 ? (
                                        regularItems.map((item, index) => (
                                            <Box key={index} sx={{
                                                border: '1px solid #f1f5f9',
                                                borderRadius: 3,
                                                p: 3,
                                                mb: 3,
                                                backgroundColor: '#fafbff',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#2e7d32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)'
                                                },
                                                '&:last-child': { mb: 0 }
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`${item.quantity} items`}
                                                        sx={{
                                                            backgroundColor: '#2e7d32',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            px: 2,
                                                            py: 1
                                                        }}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                    <Chip
                                                        label={item.size}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                            color: '#2e7d32',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                    <Chip
                                                        label={item.fabricName}
                                                        size="small"
                                                        sx={{ borderColor: '#cbd5e1' }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Color:</Typography>
                                                        <Box sx={{
                                                            width: 20,
                                                            height: 20,
                                                            backgroundColor: item.color,
                                                            borderRadius: 1,
                                                            border: '2px solid #e2e8f0',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }} />
                                                    </Box>
                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) && (
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                            Logo: {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* Product Images Section */}
                                                {(item.frontImageUrl || item.backImageUrl) && (
                                                    <Box sx={{
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mb: 2,
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#475569',
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#475569',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Product Images
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                            {item.frontImageUrl && (
                                                                <Box sx={{ textAlign: 'center' }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front View"
                                                                        width={120}
                                                                        height={120}
                                                                    />
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#64748b',
                                                                        fontWeight: 500,
                                                                        mt: 0.5,
                                                                        display: 'block'
                                                                    }}>
                                                                        Front View
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            {item.backImageUrl && (
                                                                <Box sx={{ textAlign: 'center' }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back View"
                                                                        width={120}
                                                                        height={120}
                                                                    />
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#64748b',
                                                                        fontWeight: 500,
                                                                        mt: 0.5,
                                                                        display: 'block'
                                                                    }}>
                                                                        Back View
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {(item.logoPosition || item.logoImageUrl) && (
                                                    <Box sx={{
                                                        backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid rgba(46, 125, 50, 0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            {item.logoImageUrl && (
                                                                <DisplayImage
                                                                    imageUrl={item.logoImageUrl}
                                                                    alt="Logo"
                                                                    width={32}
                                                                    height={32}
                                                                />
                                                            )}
                                                            <Box sx={{ flex: 1 }}>
                                                                {item.logoPosition && (
                                                                    <Typography variant="body2" sx={{
                                                                        color: '#2e7d32',
                                                                        fontWeight: 500,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        mb: item.logoImageUrl ? 0.5 : 0
                                                                    }}>
                                                                        <Box component="span" sx={{
                                                                            width: 6,
                                                                            height: 6,
                                                                            backgroundColor: '#2e7d32',
                                                                            borderRadius: '50%'
                                                                        }} />
                                                                        Position: {item.logoPosition}
                                                                    </Typography>
                                                                )}
                                                                {item.logoImageUrl && (
                                                                    <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 500 }}>
                                                                        Custom logo included
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Sample Images Section */}
                                                {item.sampleImages && item.sampleImages.length > 0 && (
                                                    <Box sx={{
                                                        backgroundColor: '#fef3c7',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid #fbbf24'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#92400e',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#92400e',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Sample Images ({item.sampleImages.length})
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {item.sampleImages.map((sample, idx) => (
                                                                <DisplayImage
                                                                    key={idx}
                                                                    imageUrl={sample.url}
                                                                    alt={`Sample ${idx + 1}`}
                                                                    width={60}
                                                                    height={60}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Design Note Section */}
                                                {item.note && item.note.trim() !== '' && (
                                                    <Box sx={{
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid #86efac'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#166534',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#166534',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Design Note
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#15803d',
                                                            fontSize: '0.875rem',
                                                            lineHeight: 1.5
                                                        }}>
                                                            {item.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))
                                    ) : (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: 'text.secondary'
                                        }}>
                                            <Typography variant="h6" sx={{ mb: 1, opacity: 0.6 }}>
                                                No Data
                                            </Typography>
                                            <Typography variant="body2">
                                                No regular uniforms in this order
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            {/* Physical Education Section */}
                            <Box sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                    color: 'white',
                                    p: 4,
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                        Physical Education
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Sports & PE uniforms
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 4 }}>
                                    {peItems.length > 0 ? (
                                        peItems.map((item, index) => (
                                            <Box key={index} sx={{
                                                border: '1px solid #f1f5f9',
                                                borderRadius: 3,
                                                p: 4,
                                                mb: 3,
                                                backgroundColor: '#f0fdf4',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#ff9800',
                                                    backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                                    transform: 'translateX(4px)',
                                                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.1)'
                                                },
                                                '&:last-child': { mb: 0 }
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`${item.quantity} items`}
                                                        sx={{
                                                            backgroundColor: '#ff9800',
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                    <Chip
                                                        label={item.size}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                            color: '#ff9800',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                    <Chip
                                                        label={item.fabricName}
                                                        size="small"
                                                        sx={{ borderColor: '#a7f3d0' }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Color:</Typography>
                                                        <Box sx={{
                                                            width: 20,
                                                            height: 20,
                                                            backgroundColor: item.color,
                                                            borderRadius: 1,
                                                            border: '2px solid #e2e8f0',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }} />
                                                    </Box>
                                                    {(item.baseLogoWidth > 0 || item.baseLogoHeight > 0) && (
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                            Logo: {item.baseLogoWidth}×{item.baseLogoHeight}cm
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* Product Images Section */}
                                                {(item.frontImageUrl || item.backImageUrl) && (
                                                    <Box sx={{
                                                        backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mb: 2,
                                                        border: '1px solid rgba(255, 152, 0, 0.2)'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#ff9800',
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#ff9800',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Product Images
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                            {item.frontImageUrl && (
                                                                <Box sx={{ textAlign: 'center' }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front View"
                                                                        width={120}
                                                                        height={120}
                                                                    />
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#64748b',
                                                                        fontWeight: 500,
                                                                        mt: 0.5,
                                                                        display: 'block'
                                                                    }}>
                                                                        Front View
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            {item.backImageUrl && (
                                                                <Box sx={{ textAlign: 'center' }}>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back View"
                                                                        width={120}
                                                                        height={120}
                                                                    />
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#64748b',
                                                                        fontWeight: 500,
                                                                        mt: 0.5,
                                                                        display: 'block'
                                                                    }}>
                                                                        Back View
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {(item.logoPosition || item.logoImageUrl) && (
                                                    <Box sx={{
                                                        backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid rgba(255, 152, 0, 0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            {item.logoImageUrl && (
                                                                <DisplayImage
                                                                    imageUrl={item.logoImageUrl}
                                                                    alt="Logo"
                                                                    width={32}
                                                                    height={32}
                                                                />
                                                            )}
                                                            <Box sx={{ flex: 1 }}>
                                                                {item.logoPosition && (
                                                                    <Typography variant="body2" sx={{
                                                                        color: '#ff9800',
                                                                        fontWeight: 500,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        mb: item.logoImageUrl ? 0.5 : 0
                                                                    }}>
                                                                        <Box component="span" sx={{
                                                                            width: 6,
                                                                            height: 6,
                                                                            backgroundColor: '#ff9800',
                                                                            borderRadius: '50%'
                                                                        }} />
                                                                        Position: {item.logoPosition}
                                                                    </Typography>
                                                                )}
                                                                {item.logoImageUrl && (
                                                                    <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 500 }}>
                                                                        Custom logo included
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Sample Images Section */}
                                                {item.sampleImages && item.sampleImages.length > 0 && (
                                                    <Box sx={{
                                                        backgroundColor: '#fef3c7',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid #fbbf24'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#92400e',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#92400e',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Sample Images ({item.sampleImages.length})
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {item.sampleImages.map((sample, idx) => (
                                                                <DisplayImage
                                                                    key={idx}
                                                                    imageUrl={sample.url}
                                                                    alt={`Sample ${idx + 1}`}
                                                                    width={60}
                                                                    height={60}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Design Note Section */}
                                                {item.note && item.note.trim() !== '' && (
                                                    <Box sx={{
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 2,
                                                        p: 2,
                                                        mt: 2,
                                                        border: '1px solid #86efac'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#166534',
                                                            fontWeight: 600,
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}>
                                                            <Box component="span" sx={{
                                                                width: 6,
                                                                height: 6,
                                                                backgroundColor: '#166534',
                                                                borderRadius: '50%'
                                                            }} />
                                                            Design Note
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            color: '#15803d',
                                                            fontSize: '0.875rem',
                                                            lineHeight: 1.5
                                                        }}>
                                                            {item.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))
                                    ) : (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 4,
                                            color: 'text.secondary'
                                        }}>
                                            <Typography variant="h6" sx={{ mb: 1, opacity: 0.6 }}>
                                                No Data
                                            </Typography>
                                            <Typography variant="body2">
                                                No PE uniforms in this order
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Additional Information */}
                    {(order.note || order.serviceFee > 0) && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                                Additional Information
                            </Typography>
                            <Grid container spacing={3}>
                                {order.note && (
                                    <Grid item xs={12} md={order.serviceFee > 0 ? 8 : 12}>
                                        <Box sx={{
                                            backgroundColor: '#fffbeb',
                                            borderRadius: 3,
                                            p: 3,
                                            border: '1px solid #fed7aa'
                                        }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
                                                Order Notes
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#451a03', lineHeight: 1.6 }}>
                                                {order.note}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                {order.serviceFee > 0 && (
                                    <Grid item xs={12} md={order.note ? 4 : 12}>
                                        <Box sx={{
                                            backgroundColor: '#f0f9ff',
                                            borderRadius: 3,
                                            p: 3,
                                            border: '1px solid #bae6fd',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0369a1', mb: 1 }}>
                                                Service Fee
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0c4a6e' }}>
                                                {formatCurrency(order.serviceFee)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 4, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Order ID: {order.id}
                </Typography>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)',
                        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                            boxShadow: '0 6px 20px rgba(46, 125, 50, 0.6)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
} 