import React, {useState, useEffect, useMemo} from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Typography,
    Avatar
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    DesignServices as DesignServicesIcon,
    Info as InfoIcon,
    StickyNote2 as NoteIcon,
    TableChart as TableChartIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import {Button, Tag, Modal, Typography as AntTypography, Select, Divider} from 'antd';
import {CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined, InfoCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined} from '@ant-design/icons';
import {parseID} from '../../../../utils/ParseIDUtil.jsx';
import DisplayImage from '../../../ui/DisplayImage.jsx';
import {viewQuotation} from '../../../../services/OrderService.jsx';
import OrderPaymentPopup from './OrderPaymentPopup.jsx';

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

export default function OrderDetailPopup({open, onClose, order}) {
    const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
    const [selectedItemImages, setSelectedItemImages] = useState(null);
    const [showQuantityDetailsDialog, setShowQuantityDetailsDialog] = useState(false);
    const [selectedQuantityDetails, setSelectedQuantityDetails] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [showAppliedGarment, setShowAppliedGarment] = useState(false);

    const [quotations, setQuotations] = useState([]);
    const [loadingQuotations, setLoadingQuotations] = useState(false);
    const [quotationsError, setQuotationsError] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [sortCriteria, setSortCriteria] = useState([]);
    const [sortOrder, setSortOrder] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    if (!order) return null;

    useEffect(() => {
        if (open && order?.id) {
            fetchQuotations();
        }
    }, [open, order?.id]);

    const fetchQuotations = async () => {
        try {
            setLoadingQuotations(true);
            setQuotationsError('');

            const response = await viewQuotation(order.id);

            if (response && response.status === 200) {
                setQuotations(response.data.body || []);
                console.log('Quotations loaded:', response.data.body);
            } else {
                setQuotationsError('Failed to load quotations');
                console.error('Failed to load quotations:', response);
            }
        } catch (error) {
            console.error('Error fetching quotations:', error);
            setQuotationsError('An error occurred while loading quotations');
        } finally {
            setLoadingQuotations(false);
        }
    };

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

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + ' VND';
    };

    const calculateServiceFee = (price) => {
        if (price > 10000000) {
            return 200000;
        } else {
            return Math.round(price * 0.02);
        }
    };

    const handleQuotationClick = (quotation) => {
        setSelectedQuotation(quotation);
    };

    const handleSortChange = (values) => {
        setSortCriteria(values);
        const newOrder = { ...sortOrder };
        values.forEach(key => {
            if (!newOrder[key]) {
                newOrder[key] = 'asc';
            }
        });
        setSortOrder(newOrder);
    };

    const handleToggleSortOrder = (key) => {
        setSortOrder(prev => ({
            ...prev,
            [key]: prev[key] === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleResetSort = () => {
        setSortCriteria([]);
        setSortOrder({});
    };

    const getComparableValue = (quotation, key) => {
        switch (key) {
            case 'price':
                return quotation.price || 0;
            case 'validUntil':
                return new Date(quotation.acceptanceDeadline || 0).getTime();
            case 'rating':
                return quotation.garment?.rating || 0;
            case 'estDelivery':
                return new Date(quotation.earlyDeliveryDate || 0).getTime();
            default:
                return 0;
        }
    };

    const sortedQuotations = useMemo(() => {
        if (!sortCriteria.length) return quotations;

        const sorted = [...quotations].sort((a, b) => {
            for (const key of sortCriteria) {
                const aVal = getComparableValue(a, key);
                const bVal = getComparableValue(b, key);

                if (aVal !== bVal) {
                    const order = sortOrder[key] === 'desc' ? -1 : 1;
                    return aVal < bVal ? -order : order;
                }
            }
            return 0;
        });

        return sorted;
    }, [quotations, sortCriteria, sortOrder]);

    const sortSizes = (sizes) => {
        const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
        return sizes.sort((a, b) => {
            const indexA = sizeOrder.indexOf(a.toUpperCase());
            const indexB = sizeOrder.indexOf(b.toUpperCase());
            return indexA - indexB;
        });
    };

    const groupItemsByCategory = (orderDetails) => {
        if (!orderDetails || orderDetails.length === 0) return [];

        const categoryGroups = {};

        orderDetails.forEach((item) => {
            const category = item.deliveryItem?.designItem?.category || 'regular';
            const gender = item.deliveryItem?.designItem?.gender || 'unknown';
            const type = item.deliveryItem?.designItem?.type || 'item';

            if (!categoryGroups[category]) {
                categoryGroups[category] = {};
            }

            if (!categoryGroups[category][gender]) {
                categoryGroups[category][gender] = [];
            }

            let existingGroup = categoryGroups[category][gender].find(group =>
                group.type === type
            );

            if (!existingGroup) {
                existingGroup = {
                    category,
                    gender,
                    type,
                    sizes: [],
                    quantities: {},
                    items: [],
                    totalQuantity: 0,
                    color: item.deliveryItem?.designItem?.color,
                    logoPosition: item.deliveryItem?.designItem?.logoPosition,
                    baseLogoHeight: item.deliveryItem?.baseLogoHeight,
                    baseLogoWidth: item.deliveryItem?.baseLogoWidth,
                    frontImageUrl: item.deliveryItem?.frontImageUrl,
                    backImageUrl: item.deliveryItem?.backImageUrl,
                    logoImageUrl: item.deliveryItem?.designItem?.logoImageUrl
                };
                categoryGroups[category][gender].push(existingGroup);
            }

            const size = item.size || 'M';
            const quantity = item.quantity || 0;

            if (!existingGroup.sizes.includes(size)) {
                existingGroup.sizes.push(size);
            }

            existingGroup.quantities[size] = quantity;
            existingGroup.items.push(item);
            existingGroup.totalQuantity += quantity;
        });

        const result = [];
        Object.entries(categoryGroups).forEach(([category, genderGroups]) => {
            const totalCategoryRows = Object.values(genderGroups).reduce((sum, groups) =>
                sum + groups.length, 0
            );

            Object.entries(genderGroups).forEach(([gender, groups]) => {
                groups.forEach((group, index) => {
                    const isFirstInCategory = Object.keys(genderGroups).indexOf(gender) === 0 && index === 0;
                    const isFirstInGender = index === 0;

                    result.push({
                        ...group,
                        isFirstInCategory,
                        categoryRowSpan: totalCategoryRows,
                        isFirstInGender,
                        genderRowSpan: groups.length
                    });
                });
            });
        });

        return result;
    };

    const items = groupItemsByCategory(order.orderDetails || []);

    const handleViewImages = (groupedItem) => {
        setSelectedItemImages(groupedItem);
        setImagesDialogOpen(true);
    };

    const handleCloseImagesDialog = () => {
        setImagesDialogOpen(false);
        setSelectedItemImages(null);
    };

    const handleOpenQuantityDetails = (groupedItem) => {
        setSelectedQuantityDetails(groupedItem);
        setShowQuantityDetailsDialog(true);
    };

    const handleCloseQuantityDetails = () => {
        setShowQuantityDetailsDialog(false);
        setSelectedQuantityDetails(null);
    };

    const totalQuantity = (order.orderDetails || []).reduce((sum, detail) => sum + detail.quantity, 0);
    const totalUniforms = Math.ceil(totalQuantity / 2);

    return (
        <>
            <Modal
                title={
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <InfoCircleOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                        <AntTypography.Title level={4} style={{margin: 0, color: '#1e293b'}}>
                            Order Applications
                        </AntTypography.Title>
                        <Chip
                            label={parseID(order.id, 'ord')}
                            size="small"
                            sx={{
                                backgroundColor: '#2e7d32',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '12px',
                                height: '24px'
                            }}
                        />
                    </Box>
                }
                open={open}
                onCancel={onClose}
                centered
                width={1280}
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
                footer={null}
            >
                    {}
                    <Box sx={{
                        mb: 3,
                        p: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                            <Typography variant="h6" sx={{margin: 0, color: '#1e293b', fontWeight: 600}}>
                                Applied Garment Factories ({quotations.length})
                            </Typography>
                            <Box style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    key="toggleOrderDetail"
                                    type={showOrderDetail ? 'default' : 'primary'}
                                    onClick={() => setShowOrderDetail(!showOrderDetail)}
                                    icon={<InfoCircleOutlined/>}
                                    style={{
                                        backgroundColor: showOrderDetail ? '#f1f5f9' : '#2e7d32',
                                        borderColor: showOrderDetail ? '#cbd5e1' : '#2e7d32',
                                        color: showOrderDetail ? '#475569' : 'white'
                                    }}
                                >
                                    {showOrderDetail ? 'Hide Order Detail' : 'Show Order Detail'}
                                </Button>
                                <Button
                                    type={showAppliedGarment ? "default" : "primary"}
                                    onClick={() => setShowAppliedGarment(!showAppliedGarment)}
                                    icon={showAppliedGarment ? <CloseCircleOutlined/> : <UserOutlined/>}
                                    style={{
                                        backgroundColor: showAppliedGarment ? '#f1f5f9' : '#2e7d32',
                                        borderColor: showAppliedGarment ? '#cbd5e1' : '#2e7d32',
                                        color: showAppliedGarment ? '#475569' : 'white'
                                    }}
                                >
                                    {showAppliedGarment ? 'Hide Applied Garment' : 'View Garment Factories'}
                                </Button>
                            </Box>
                        </Box>
                        <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px'}}>
                            Review and manage your order details and applied garment factories. Each factory offers different quotations with varying timelines and features.
                        </Typography>
                    </Box>

                    {}
                    {showAppliedGarment && (
                        <Box sx={{
                            mb: 3,
                            p: 3,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            width: '100%'
                        }}>
                            <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px', mb: 3}}>
                                Review and select from the garment factories that have applied to your order. Each factory offers different quotations with varying timelines and features.
                            </Typography>

                            {}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Sort by (priority left → right)"
                                    style={{ minWidth: 360 }}
                                    value={sortCriteria}
                                    onChange={handleSortChange}
                                    options={[
                                        { label: 'Price', value: 'price' },
                                        { label: 'Valid until', value: 'validUntil' },
                                        { label: 'Rating', value: 'rating' },
                                        { label: 'Est. Delivery', value: 'estDelivery' }
                                    ]}
                                />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {sortCriteria.map(key => (
                                        <Chip
                                            key={key}
                                            label={`${{
                                                price: 'Price',
                                                validUntil: 'Valid until',
                                                rating: 'Rating',
                                                estDelivery: 'Est. Delivery'
                                            }[key]} ${sortOrder[key] === 'asc' ? '↑' : '↓'}`}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleToggleSortOrder(key)}
                                            sx={{
                                                cursor: 'pointer',
                                                height: 26,
                                                backgroundColor: sortOrder[key] === 'asc' ? '#f0f9ff' : '#fef3c7',
                                                borderColor: sortOrder[key] === 'asc' ? '#0ea5e9' : '#f59e0b',
                                                color: sortOrder[key] === 'asc' ? '#0369a1' : '#92400e'
                                            }}
                                        />
                                    ))}
                                </Box>
                                {sortCriteria.length > 0 && (
                                    <Button onClick={handleResetSort} type="default" size="small">
                                        Reset sort
                                    </Button>
                                )}
                            </Box>

                            {}
                            {loadingQuotations && (
                                <Box sx={{
                                    p: 6,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '2px dashed #cbd5e1',
                                    textAlign: 'center'
                                }}>
                                    <DesignServicesIcon sx={{fontSize: 64, mb: 3, opacity: 0.5, color: '#64748b'}}/>
                                    <Typography variant="h5" sx={{mb: 2, color: '#475569', fontWeight: 600}}>
                                        Loading Quotations...
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#64748b', maxWidth: '400px', mx: 'auto'}}>
                                        Please wait while we fetch the latest quotations from garment factories.
                                    </Typography>
                                </Box>
                            )}

                            {}
                            {quotationsError && !loadingQuotations && (
                                <Box sx={{
                                    p: 6,
                                    backgroundColor: '#fef2f2',
                                    borderRadius: 2,
                                    border: '2px dashed #fecaca',
                                    textAlign: 'center'
                                }}>
                                    <CloseCircleOutlined style={{fontSize: 64, marginBottom: 24, opacity: 0.5, color: '#dc2626'}}/>
                                    <Typography variant="h5" sx={{mb: 2, color: '#dc2626', fontWeight: 600}}>
                                        Error Loading Quotations
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#dc2626', maxWidth: '400px', mx: 'auto'}}>
                                        {quotationsError}
                                    </Typography>
                                </Box>
                            )}

                            {}
                            {!loadingQuotations && !quotationsError && quotations.length === 0 && (
                                <Box sx={{
                                    p: 6,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '2px dashed #cbd5e1',
                                    textAlign: 'center'
                                }}>
                                    <DesignServicesIcon sx={{fontSize: 64, mb: 3, opacity: 0.5, color: '#64748b'}}/>
                                    <Typography variant="h5" sx={{mb: 2, color: '#475569', fontWeight: 600}}>
                                        No Applied Garment Factories
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#64748b', maxWidth: '400px', mx: 'auto'}}>
                                        No garment factories have applied to this order yet. Check back later for updates or consider adjusting your order requirements.
                                    </Typography>
                                </Box>
                            )}

                            {}
                            {!loadingQuotations && !quotationsError && sortedQuotations.length > 0 && (
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                    gap: 3
                                }}>
                                    {sortedQuotations.map((quotation, index) => (
                                        <Box key={quotation.id} sx={{
                                            p: 2.5,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
                                            transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
                                            cursor: 'pointer',
                                            minHeight: 240,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                borderColor: '#e2e8f0',
                                                boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
                                                transform: 'translateY(-3px) scale(1.01)'
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-60%',
                                                width: '60%',
                                                height: '100%',
                                                background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent)',
                                                transform: 'skewX(-20deg) translateX(-120%)',
                                                transition: 'transform 1s ease',
                                                pointerEvents: 'none',
                                                willChange: 'transform'
                                            },
                                            '&:hover::after': {
                                                transform: 'skewX(-20deg) translateX(420%)'
                                            }
                                        }}
                                        onClick={() => handleQuotationClick(quotation)}
                                        >
                                            {}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        bgcolor: '#2e7d32',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                    }}
                                                    src={quotation.garment?.customer?.avatar}
                                                    slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
                                                >
                                                    {quotation.garment?.customer?.name?.charAt(0) || 'G'}
                                                </Avatar>
                                                                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="h6" sx={{
                                                            margin: 0,
                                                            color: '#1e293b',
                                                            fontWeight: 600,
                                                            fontSize: '16px'
                                                        }}>
                                                            {quotation.garment?.customer?.business || 'Unknown Factory'}
                                                        </Typography>
                                                        <Typography variant="h4" sx={{
                                                            margin: '4px 0 0 0',
                                                            color: '#2e7d32',
                                                            fontWeight: 800,
                                                            fontSize: '20px'
                                                        }}>
                                                            {quotation.price.toLocaleString('vi-VN')} <span style={{fontSize: 12, fontWeight: 700}}>VND</span>
                                                        </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                        <Chip size="small" variant="outlined" label={`�?${quotation.garment?.rating || 0}`} sx={{ height: 22 }} />
                                                        <Chip size="small" variant="outlined" icon={<TimeIcon/>} label={`Valid until ${formatDate(quotation.acceptanceDeadline)}`} sx={{ height: 22 }} />
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            {}
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 1 }}>
                                                <Chip size="medium" variant="outlined" icon={<CalendarIcon style={{ fontSize: 14 }} />} label={`Est. Delivery: ${formatDate(quotation.earlyDeliveryDate)}`} sx={{ height: 26 }} />
                                            </Box>

                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                mb: 1
                                            }}>
                                                {}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    p: 1,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8fafc',
                                                    color: '#475569'
                                                }}>
                                                    <UserOutlined style={{color: '#64748b'}}/>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '12px',
                                                        color: '#475569',
                                                        fontWeight: 500
                                                    }}>
                                                        Contact: {quotation.garment?.customer?.name || 'N/A'}
                                                    </Typography>
                                                </Box>

                                                {}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    p: 1,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 2,
                                                    backgroundColor: '#f8fafc',
                                                    color: '#475569'
                                                }}>
                                                    <PhoneOutlined style={{color: '#64748b'}}/>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        color: '#475569',
                                                        fontWeight: 500
                                                    }}>
                                                        {quotation.garment?.customer?.phone || 'N/A'}
                                                    </Typography>
                                                </Box>

                                                {}
                                                {quotation.garment?.customer?.address && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 1,
                                                        p: 1,
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 2,
                                                        backgroundColor: '#f8fafc',
                                                        color: '#475569'
                                                    }}>
                                                        <LocationIcon sx={{
                                                            color: '#64748b',
                                                            fontSize: '16px',
                                                            flexShrink: 0,
                                                            mt: '2px'
                                                        }}/>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '12px',
                                                            color: '#475569',
                                                            lineHeight: 1.4,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {quotation.garment?.customer?.address}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {}
                                                {quotation.garment?.customer?.account?.email && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1,
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 2,
                                                        backgroundColor: '#f8fafc',
                                                        color: '#475569'
                                                    }}>
                                                        <MailOutlined style={{color: '#64748b', fontSize: '14px'}}/>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '12px',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            color: '#475569'
                                                        }}>
                                                            {quotation.garment?.customer?.account?.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {}
                                            {quotation.note && (
                                                <Box sx={{
                                                    mt: 1,
                                                    p: 1.5,
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1
                                                }}>
                                                    <NoteIcon style={{ color: '#64748b', fontSize: 16, marginTop: 2 }} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontSize: 12, color: '#1f2937', fontWeight: 600 }}>Note</Typography>
                                                        <Typography variant="body2" sx={{
                                                            margin: 0,
                                                            fontSize: 12,
                                                            color: '#475569',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {quotation.note}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {}
                            {selectedQuotation && (
                                <Box sx={{
                                    mt: 3,
                                    p: 3,
                                    backgroundColor: '#e8f5e8',
                                    borderRadius: 2,
                                    border: '1px solid #2e7d32'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        <MoneyIcon sx={{color: '#2e7d32', fontSize: '20px'}}/>
                                        <Typography variant="h6" sx={{
                                            margin: 0,
                                            color: '#2e7d32',
                                            fontWeight: 600,
                                            fontSize: '16px'
                                        }}>
                                            Selected Quotation Summary
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{
                                        color: '#1e293b',
                                        mb: 3,
                                        fontSize: '14px'
                                    }}>
                                        You have selected a quotation from{' '}
                                        <span style={{fontWeight: 700, color: '#2e7d32'}}>
                                            {selectedQuotation.garment?.customer?.business || 'Unknown Factory'}
                                        </span>.
                                        {order.status === 'pending' && (
                                            <span style={{color: '#d97706', fontWeight: 600}}>
                                                {' '}A deposit of 50% is required to proceed with this order.
                                            </span>
                                        )}
                                    </Typography>

                                    {}
                                    <Box sx={{
                                        p: 2.5,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            color: '#1e293b',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            mb: 2
                                        }}>
                                            Payment Summary
                                        </Typography>

                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#475569',
                                                    fontSize: '12px'
                                                }}>
                                                    Base price
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b',
                                                    fontWeight: 600,
                                                    fontSize: '12px'
                                                }}>
                                                    {selectedQuotation.price.toLocaleString('vi-VN')} VND
                                                </Typography>
                                            </Box>

                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#475569',
                                                    fontSize: '12px'
                                                }}>
                                                    Service fee {selectedQuotation.price <= 10000000 ? '(2% total)' : ''}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b',
                                                    fontWeight: 600,
                                                    fontSize: '12px'
                                                }}>
                                                    {calculateServiceFee(selectedQuotation.price).toLocaleString('vi-VN')} VND
                                                </Typography>
                                            </Box>

                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1,
                                                backgroundColor: '#f0f9ff',
                                                borderRadius: 1,
                                                border: '1px solid #0ea5e9'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#0369a1',
                                                    fontWeight: 700,
                                                    fontSize: '12px'
                                                }}>
                                                    Total Amount
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#0369a1',
                                                    fontWeight: 700,
                                                    fontSize: '12px'
                                                }}>
                                                    {(selectedQuotation.price + calculateServiceFee(selectedQuotation.price)).toLocaleString('vi-VN')} VND
                                                </Typography>
                                            </Box>

                                            {}
                                            {order.status === 'pending' && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    backgroundColor: '#fef3c7',
                                                    borderRadius: 1.5,
                                                    border: '1px solid #f59e0b'
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{
                                                            color: '#92400e',
                                                            fontWeight: 700,
                                                            fontSize: '12px'
                                                        }}>
                                                            Deposit Required
                                                        </Typography>
                                                        <Typography variant="caption" sx={{
                                                            color: '#d97706',
                                                            fontSize: '10px'
                                                        }}>
                                                            50% of total amount
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#d97706',
                                                        fontWeight: 700,
                                                        fontSize: '12px'
                                                    }}>
                                                        {Math.round((selectedQuotation.price + calculateServiceFee(selectedQuotation.price)) * 0.5).toLocaleString('vi-VN')} VND
                                                    </Typography>
                                                </Box>
                                            )}

                                            {}
                                            <Divider sx={{ my: 1 }} />

                                            {}
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b',
                                                    fontWeight: 700,
                                                    fontSize: '12px'
                                                }}>
                                                    {order.status === 'pending' ? 'Final Payment' : 'Total'}
                                                </Typography>
                                                <Typography variant="h6" sx={{
                                                    color: '#16a34a',
                                                    fontWeight: 700,
                                                    fontSize: '16px',
                                                    margin: 0
                                                }}>
                                                    {order.status === 'pending'
                                                        ? Math.round((selectedQuotation.price + calculateServiceFee(selectedQuotation.price)) * 0.5).toLocaleString('vi-VN') + ' VND'
                                                        : (selectedQuotation.price + calculateServiceFee(selectedQuotation.price)).toLocaleString('vi-VN') + ' VND'
                                                    }
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {}
                                    <Box sx={{
                                        mt: 3,
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<CheckCircleOutlined />}
                                            style={{
                                                backgroundColor: '#2e7d32',
                                                borderColor: '#2e7d32',
                                                color: 'white',
                                                height: '48px',
                                                padding: '0 32px',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
                                            }}
                                            onClick={() => {
                                                setShowPaymentModal(true);
                                            }}
                                        >
                                            Confirm Selection
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {}
                    {showOrderDetail && (
                        <Box sx={{
                            mb: 3,
                            p: 3,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            width: '100%'
                        }}>
                            {}
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <InfoIcon style={{color: '#2e7d32', fontSize: '20px'}}/>
                                    Order Information
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px', mb: 3}}>
                                Detailed information about your order including dates, quantities, and product specifications.
                            </Typography>

                                {}
                                <Card
                                    size="small"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                                        border: '1px solid rgba(46, 125, 50, 0.1)',
                                        borderRadius: 8
                                    }}
                                >
                                    <Box
                                        sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Box>
                                                <Typography variant="h6"
                                                            sx={{fontWeight: 700, color: '#1e293b', mb: 0.5, fontSize: '16px'}}>
                                                    {order.selectedDesign?.designRequest?.name || 'Order'}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                    Created: {formatDate(order.orderDate)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{
                                            textAlign: 'right',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            justifyContent: 'flex-start'
                                        }}>
                                            {statusTag(order.status)}
                                        </Box>
                                    </Box>
                                </Card>

                                {}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 2,
                                    marginTop: '16px',
                                    alignItems: 'stretch'
                                }}>
                                    {}
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
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                height: '100%'
                                            }}
                                        >
                                            <Box sx={{
                                                p: 2,
                                                borderBottom: '1px solid #e2e8f0',
                                                backgroundColor: '#f8fafc'
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <MoneyIcon style={{color: '#2e7d32', fontSize: '16px'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Order Summary</span>
                                                </Box>
                                            </Box>
                                            <CardContent sx={{p: 3}}>
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
                                                        }}/>
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
                                                        }}/>
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
                                                        }}/>
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

                                                {}
                                                {order.note && (
                                                    <Box sx={{
                                                        mt: 3,
                                                        p: 2,
                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                        borderRadius: 3,
                                                        border: '1px solid rgba(245, 158, 11, 0.15)',
                                                    }}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                                            <Box sx={{
                                                                p: 0.5,
                                                                borderRadius: 2,
                                                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <NoteIcon sx={{color: '#d97706', fontSize: 16}}/>
                                                            </Box>
                                                            <Typography variant="subtitle2" sx={{
                                                                fontWeight: 600,
                                                                color: '#92400e',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                Order Notes
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{
                                                            color: '#451a03',
                                                            lineHeight: 1.6,
                                                            fontSize: '0.85rem',
                                                            ml: 5
                                                        }}>
                                                            {order.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>

                                {}
                                <Box sx={{mt: 10}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <DesignServicesIcon style={{color: '#2e7d32', fontSize: '20px'}}/>
                                            Product Details
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '14px', mb: 3}}>
                                        Comprehensive breakdown of all items in your order with specifications, quantities, and design details.
                                    </Typography>
                                    <Card
                                        size="small"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8
                                        }}
                                    >
                                        <Box sx={{p: 3}}>
                                            {items.length === 0 ? (
                                                <Box sx={{
                                                    textAlign: 'center',
                                                    py: 6,
                                                    color: '#64748b'
                                                }}>
                                                    <DesignServicesIcon sx={{fontSize: 48, mb: 2, opacity: 0.5}}/>
                                                    <Typography variant="h6" sx={{mb: 1}}>
                                                        No Items Found
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        This order doesn't contain any items yet.
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    {}
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        width: '100%'
                                                    }}>
                                                        {}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Category
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Gender
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Type
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Size
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Quantity
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Color
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Logo Position
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexDirection: 'column'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Logo Size
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#1976d2',
                                                                fontSize: '11px',
                                                                fontWeight: 500
                                                            }}>
                                                                (height × width)
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            p: 2,
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '14px'
                                                            }}>
                                                                Images
                                                            </Typography>
                                                        </Box>

                                                        {}
                                                        {(() => {
                                                            const groupedItems = groupItemsByCategory(order.orderDetails || []);
                                                            const rows = [];

                                                            groupedItems.forEach((groupedItem, index) => {
                                                                rows.push(
                                                                    <React.Fragment
                                                                        key={`${groupedItem.category}-${groupedItem.gender}-${groupedItem.type}-${index}`}>
                                                                        {}
                                                                        {groupedItem.isFirstInCategory && (
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRight: '1px solid #000000',
                                                                                borderBottom: '1px solid #000000',
                                                                                backgroundColor: '#f8fafc',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gridRow: `span ${groupedItem.categoryRowSpan}`,
                                                                                minHeight: `${60 * groupedItem.categoryRowSpan}px`
                                                                            }}>
                                                                                <Chip
                                                                                    label={groupedItem.category === 'pe' ? 'PE' : 'Regular'}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        backgroundColor: groupedItem.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                                                                        color: groupedItem.category === 'pe' ? '#065f46' : '#1e40af',
                                                                                        fontWeight: 600,
                                                                                        fontSize: '11px',
                                                                                        height: 20
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        )}

                                                                        {}
                                                                        {groupedItem.isFirstInGender && (
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRight: '1px solid #000000',
                                                                                borderBottom: '1px solid #000000',
                                                                                backgroundColor: '#f8fafc',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gridRow: `span ${groupedItem.genderRowSpan}`,
                                                                                minHeight: `${60 * groupedItem.genderRowSpan}px`
                                                                            }}>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#374151',
                                                                                    fontSize: '13px',
                                                                                    textTransform: 'capitalize'
                                                                                }}>
                                                                                    {groupedItem.gender === 'boy' ? 'Boy' :
                                                                                        groupedItem.gender === 'girl' ? 'Girl' :
                                                                                            groupedItem.gender || 'Unknown'}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Typography variant="body2" sx={{
                                                                                fontWeight: 600,
                                                                                color: '#374151',
                                                                                fontSize: '13px',
                                                                                textTransform: 'capitalize'
                                                                            }}>
                                                                                {groupedItem.type || 'Item'}
                                                                            </Typography>
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Typography variant="body2" sx={{
                                                                                fontWeight: 600,
                                                                                color: '#3f51b5',
                                                                                fontSize: '13px'
                                                                            }}>
                                                                                {sortSizes([...groupedItem.sizes]).join(', ')}
                                                                            </Typography>
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Button
                                                                                type="default"
                                                                                size="small"
                                                                                onClick={() => handleOpenQuantityDetails(groupedItem)}
                                                                                icon={<InfoCircleOutlined/>}
                                                                                style={{
                                                                                    fontSize: '11px',
                                                                                    height: '28px',
                                                                                    padding: '4px 12px',
                                                                                    borderColor: '#1976d2',
                                                                                    color: '#1976d2',
                                                                                    backgroundColor: 'transparent'
                                                                                }}
                                                                            >
                                                                                View
                                                                            </Button>
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: 1
                                                                        }}>
                                                                            <Box sx={{
                                                                                width: 26,
                                                                                height: 16,
                                                                                backgroundColor: groupedItem.color || '#000',
                                                                                borderRadius: 0.5,
                                                                                border: '1px solid #e5e7eb'
                                                                            }}/>
                                                                            <Typography variant="caption" sx={{
                                                                                color: '#64748b',
                                                                                fontSize: '12px'
                                                                            }}>
                                                                                {groupedItem.color || '#000'}
                                                                            </Typography>
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            {(() => {
                                                                                const logoPosition = groupedItem.logoPosition;
                                                                                const logoHeight = groupedItem.baseLogoHeight || 0;
                                                                                const logoWidth = groupedItem.baseLogoWidth || 0;

                                                                                if (logoPosition && logoHeight > 0 && logoWidth > 0) {
                                                                                    return (
                                                                                        <Typography variant="body2" sx={{
                                                                                            fontWeight: 500,
                                                                                            color: '#1e293b',
                                                                                            fontSize: '12px'
                                                                                        }}>
                                                                                            {logoPosition}
                                                                                        </Typography>
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        <Typography variant="caption" sx={{
                                                                                            color: '#9ca3af',
                                                                                            fontSize: '11px',
                                                                                            fontStyle: 'italic'
                                                                                        }}>
                                                                                            No Logo
                                                                                        </Typography>
                                                                                    );
                                                                                }
                                                                            })()}
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRight: '1px solid #000000',
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            {(() => {
                                                                                const logoHeight = groupedItem.baseLogoHeight || 0;
                                                                                const logoWidth = groupedItem.baseLogoWidth || 0;

                                                                                if (logoHeight > 0 && logoWidth > 0) {
                                                                                    return (
                                                                                        <Typography variant="body2" sx={{
                                                                                            fontWeight: 600,
                                                                                            color: '#1976d2',
                                                                                            fontSize: '13px',
                                                                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                                                            padding: '4px 8px',
                                                                                            borderRadius: '4px',
                                                                                            border: '1px solid rgba(25, 118, 210, 0.2)'
                                                                                        }}>
                                                                                            {logoHeight} × {logoWidth} cm
                                                                                        </Typography>
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        <Typography variant="caption" sx={{
                                                                                            color: '#9ca3af',
                                                                                            fontSize: '11px',
                                                                                            fontStyle: 'italic'
                                                                                        }}>
                                                                                            No Logo
                                                                                        </Typography>
                                                                                    );
                                                                                }
                                                                            })()}
                                                                        </Box>

                                                                        {}
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderBottom: '1px solid #000000',
                                                                            backgroundColor: '#f8fafc',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            <Button
                                                                                type="default"
                                                                                size="small"
                                                                                onClick={() => handleViewImages(groupedItem)}
                                                                                icon={<InfoCircleOutlined/>}
                                                                                style={{
                                                                                    fontSize: '11px',
                                                                                    height: '28px',
                                                                                    padding: '4px 12px',
                                                                                    borderColor: '#3f51b5',
                                                                                    color: '#3f51b5',
                                                                                    backgroundColor: 'transparent'
                                                                                }}
                                                                            >
                                                                                View Images
                                                                            </Button>
                                                                        </Box>
                                                                    </React.Fragment>
                                                                );
                                                            });

                                                            return rows;
                                                        })()}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Card>
                                </Box>
                            </Box>
                        )
                    }
            </Modal>

            {}
            <Modal
                title={
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <InfoIcon style={{color: 'white', fontSize: 18}}/>
                        </Box>
                        <AntTypography.Title level={5} style={{margin: 0, color: 'white', fontWeight: 700}}>
                            Item Images
                        </AntTypography.Title>
                    </Box>
                }
                open={imagesDialogOpen}
                onCancel={handleCloseImagesDialog}
                centered
                width={700}
                styles={{
                    header: {
                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                        borderRadius: '12px 12px 0 0',
                        padding: '16px 20px'
                    },
                    body: {
                        padding: '20px',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }
                }}
                footer={null}
            >
                    {selectedItemImages && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                            {}
                            {selectedItemImages.type === 'shirt' && (
                                <Box sx={{
                                    p: 2.5,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(63, 81, 181, 0.1)'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 1.5, color: '#3f51b5', fontSize: '16px'}}>
                                        Logo Image
                                    </Typography>
                                    {selectedItemImages.logoImageUrl ? (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: 200,
                                            border: '2px dashed rgba(63, 81, 181, 0.3)',
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(63, 81, 181, 0.05)'
                                        }}>
                                            <DisplayImage
                                                imageUrl={selectedItemImages.logoImageUrl}
                                                alt="Logo"
                                                width="100%"
                                                height={200}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: 200,
                                            border: '2px dashed #d1d5db',
                                            borderRadius: 2,
                                            backgroundColor: '#f9fafb'
                                        }}>
                                            <Typography variant="body2" sx={{color: '#9ca3af', fontStyle: 'italic', fontSize: '14px'}}>
                                                No Logo Image Available
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {}
                            <Box sx={{
                                p: 2.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                border: '1px solid rgba(63, 81, 181, 0.1)'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 1.5, color: '#3f51b5', fontSize: '16px'}}>
                                    Design Images
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                    {}
                                    <Box sx={{flex: 1, minWidth: 200}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: '#10b981', fontSize: '13px'}}>
                                            Front Design
                                        </Typography>
                                        {selectedItemImages.frontImageUrl ? (
                                            <Box sx={{
                                                border: '2px dashed rgba(16, 185, 129, 0.3)',
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 150
                                            }}>
                                                <DisplayImage
                                                    imageUrl={selectedItemImages.frontImageUrl}
                                                    alt="Front Design"
                                                    width={200}
                                                    height={150}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                border: '2px dashed #d1d5db',
                                                borderRadius: 2,
                                                backgroundColor: '#f9fafb',
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 150
                                            }}>
                                                <Typography variant="body2"
                                                            sx={{color: '#9ca3af', fontStyle: 'italic', fontSize: '12px'}}>
                                                    No Front Design
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {}
                                    <Box sx={{flex: 1, minWidth: 200}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: '#8b5cf6', fontSize: '13px'}}>
                                            Back Design
                                        </Typography>
                                        {selectedItemImages.backImageUrl ? (
                                            <Box sx={{
                                                border: '2px dashed rgba(139, 92, 246, 0.3)',
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 150
                                            }}>
                                                <DisplayImage
                                                    imageUrl={selectedItemImages.backImageUrl}
                                                    alt="Back Design"
                                                    width={200}
                                                    height={150}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                border: '2px dashed #d1d5db',
                                                borderRadius: 2,
                                                backgroundColor: '#f9fafb',
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 150
                                            }}>
                                                <Typography variant="body2"
                                                            sx={{color: '#9ca3af', fontStyle: 'italic', fontSize: '12px'}}>
                                                    No Back Design
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
            </Modal>

            {}
            <Modal
                title={
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <InfoIcon style={{color: 'white', fontSize: 20}}/>
                        </Box>
                        <AntTypography.Title level={5} style={{margin: 0, color: 'white', fontWeight: 700}}>
                            Quantity Details
                        </AntTypography.Title>
                    </Box>
                }
                open={showQuantityDetailsDialog}
                onCancel={handleCloseQuantityDetails}
                centered
                width={500}
                styles={{
                    header: {
                        background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                        borderRadius: '12px 12px 0 0'
                    },
                    body: {
                        padding: '20px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }
                }}
                footer={null}
            >
                    {selectedQuantityDetails && (
                        <Box>
                            {}
                            <Box sx={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid #cbd5e1',
                                borderRadius: 2,
                                mb: 3,
                                p: 2.5
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 2}}>
                                    <Chip
                                        label={selectedQuantityDetails.category === 'pe' ? 'PE' : 'Regular'}
                                        size="small"
                                        sx={{
                                            backgroundColor: selectedQuantityDetails.category === 'pe' ? '#dcfce7' : '#dbeafe',
                                            color: selectedQuantityDetails.category === 'pe' ? '#065f46' : '#1e40af',
                                            fontWeight: 600,
                                            height: '24px'
                                        }}
                                    />
                                    <Chip
                                        label={selectedQuantityDetails.gender === 'boy' ? 'Boy' : 'Girl'}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#fef3c7',
                                            color: '#92400e',
                                            fontWeight: 600,
                                            height: '24px'
                                        }}
                                    />
                                    <Chip
                                        label={selectedQuantityDetails.type}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#e0e7ff',
                                            color: '#3730a3',
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                            height: '24px'
                                        }}
                                    />
                                </Box>

                                <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b', fontSize: '16px'}}>
                                    Total Quantity: {selectedQuantityDetails.totalQuantity}
                                </Typography>
                            </Box>

                            {}
                            <Box sx={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <TableChartIcon sx={{color: 'white', fontSize: 18}}/>
                                    <Typography variant="h6" sx={{color: 'white', fontWeight: 600, fontSize: '14px'}}>
                                        Size Breakdown
                                    </Typography>
                                </Box>

                                <Box sx={{p: 0}}>
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        borderBottom: '2px solid #e2e8f0'
                                    }}>
                                        <Box sx={{
                                            p: 1.5,
                                            backgroundColor: '#f8fafc',
                                            borderRight: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 700, color: '#1e293b', fontSize: '13px'}}>
                                                Size
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 1.5,
                                            backgroundColor: '#f8fafc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 700, color: '#1e293b', fontSize: '13px'}}>
                                                Quantity
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {sortSizes([...selectedQuantityDetails.sizes]).map((size) => (
                                        <Box key={size} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            borderBottom: '1px solid #e2e8f0',
                                            '&:last-child': {
                                                borderBottom: 'none'
                                            }
                                        }}>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRight: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 600,
                                                    color: '#3f51b5',
                                                    fontSize: '14px'
                                                }}>
                                                    {size}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#ffffff'
                                            }}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 700,
                                                    color: '#1976d2',
                                                    fontSize: '16px'
                                                }}>
                                                    {selectedQuantityDetails.quantities[size]}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
            </Modal>

            {}
            <OrderPaymentPopup
                visible={showPaymentModal}
                onCancel={() => setShowPaymentModal(false)}
                selectedQuotationDetails={{
                    quotation: selectedQuotation,
                    order: order
                }}
            />
        </>
    );
}