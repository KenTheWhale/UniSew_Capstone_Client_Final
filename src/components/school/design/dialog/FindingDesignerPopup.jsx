import {Button, InputNumber, Modal, Spin, Tag, Typography, Select} from 'antd';
import {
    CalendarOutlined as CalendarIcon,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    SyncOutlined,
    UserOutlined,
    UpOutlined,
    DownOutlined
} from '@ant-design/icons';
import {Box, Chip, Divider, Paper, Avatar} from '@mui/material';
import {useEffect, useState, useMemo, useCallback} from 'react';
import React from 'react';
import DesignPaymentPopup from './DesignPaymentPopup.jsx';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";
import DisplayImage from '../../../ui/DisplayImage.jsx';
import { serviceFee } from '../../../../configs/FixedVariables.jsx';

// Constants
const STATUS_CONFIG = {
    pending: { color: 'blue', icon: <FileTextOutlined/>, text: 'Finding designer' },
    processing: { color: 'purple', icon: <SyncOutlined/>, text: 'processing' },
    completed: { color: 'cyan', icon: <CheckCircleOutlined/>, text: 'completed' },
    canceled: { color: 'red', icon: <CloseCircleOutlined/>, text: 'canceled' }
};

const UNLIMITED_REVISION_CODE = 9999;
const MAX_EXTRA_REVISIONS = 10;

// Utility functions
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VND';
};

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    const config = STATUS_CONFIG[status] || { color: 'default', icon: null, text: status };
    return <Tag color={config.color}>{config.icon} {config.text}</Tag>;
}

// Memoized DesignerCard Component
const DesignerCard = React.memo(({ designer, isSelected, onSelect }) => {
    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(designer.id);
        }
    }, [onSelect, designer.id]);

    return (
        <Paper
            elevation={0}
            sx={{
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
            onClick={() => onSelect(designer.id)}
            onKeyPress={handleKeyPress}
            tabIndex={0}
            role="button"
            aria-label={`Select quotation from ${designer.designer.customer.name}`}
        >
            {/* Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', columnGap: 1.5, mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Avatar
                        sx={{ width: 44, height: 44, bgcolor: '#2e7d32', border: isSelected ? '2px solid #2e7d32' : '2px solid transparent' }}
                        src={designer?.designer?.customer?.avatar}
                        slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
                    >
                        {designer.designer.customer.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                            {designer.designer.customer.name}
                        </Typography.Title>
                        <Typography style={{ marginTop: 2, color: '#2e7d32', fontWeight: 800, fontSize: 20 }}>
                            {formatPrice(designer.price).replace(' VND','')} <span style={{fontSize: 12, fontWeight: 700}}>VND</span>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip size="small" variant="outlined" label={`⭐ ${designer.designer.rating}`} sx={{ height: 22 }} />
                            <Chip size="small" variant="outlined" icon={<ClockCircleOutlined/>} label={`Valid until ${formatDate(designer.acceptanceDeadline)}`} sx={{ height: 22 }} />
                        </Box>
                    </Box>
                </Box>
                {isSelected && (
                    <Chip size="small" color="success" label="Selected" sx={{ justifySelf: 'end', alignSelf: 'start' }} />
                )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Details */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                <Chip size="small" variant="outlined" icon={<CalendarIcon style={{ fontSize: 14 }} />} label={`${designer.deliveryWithIn} days`} sx={{ height: 26 }} />
                <Chip size="small" variant="outlined" icon={<EditOutlined style={{ fontSize: 14 }} />} label={`${designer.revisionTime === UNLIMITED_REVISION_CODE ? 'Unlimited' : designer.revisionTime} revisions`} sx={{ height: 26 }} />
                {designer.extraRevisionPrice > 0 && (
                    <Chip size="small" variant="outlined" icon={<EditOutlined style={{ fontSize: 14 }} />} label={`Extra: ${formatPrice(designer.extraRevisionPrice)}`} sx={{ height: 26, gridColumn: 'span 2' }} />
                )}
            </Box>

            {/* Contact */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                color: '#475569',
                mb: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                    <MailOutlined style={{color: '#64748b'}}/>
                    <Typography.Text style={{fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {designer.designer.customer.account.email}
                    </Typography.Text>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneOutlined style={{color: '#64748b'}}/>
                    <Typography.Text 
                        style={{fontSize: '12px', cursor: 'pointer'}} 
                        onClick={() => window.open(`https://zalo.me/${designer.designer.customer.phone}`, "_blank")}
                        title="Click to contact"
                    >
                        {designer.designer.customer.phone}
                    </Typography.Text>
                </Box>
            </Box>


            {/* Footer note (optional) */}
            {designer.note && (
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
                    <FileTextOutlined style={{ color: '#64748b', fontSize: 16, marginTop: 2 }} />
                    <Box>
                        <Typography.Text style={{ fontSize: 12, color: '#1f2937', fontWeight: 600 }}>Note</Typography.Text>
                        <Typography.Paragraph
                            style={{ margin: 0, fontSize: 12, color: '#475569' }}
                            ellipsis={{ rows: 3, tooltip: designer.note }}
                        >
                            {designer.note}
                        </Typography.Paragraph>
                    </Box>
                </Box>
            )}
        </Paper>
    );
});

DesignerCard.displayName = 'DesignerCard';

export default function FindingDesignerPopup({visible, onCancel, request}) {
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [showDesigners, setShowDesigners] = useState(false);
    const [extraRevision, setExtraRevision] = useState(0);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Applied designers data
    const [appliedDesigners, setAppliedDesigners] = useState([]);
    const [showRequestDetail, setShowRequestDetail] = useState(false);
    const [sortCriteria, setSortCriteria] = useState([]); // [{ key: 'rating'|'acceptanceDeadline'|'deliveryWithIn'|'revisionTime'|'price', order: 'asc'|'desc' }]

    // Memoized values
    const selectedDesigner = useMemo(() =>
        appliedDesigners.find(d => d.id === selectedQuotation?.designerId),
        [appliedDesigners, selectedQuotation]
    );

    const extraRevisionCost = useMemo(() =>
        extraRevision * (selectedDesigner?.extraRevisionPrice || 0),
        [extraRevision, selectedDesigner]
    );

    const isUnlimitedRevisions = useMemo(() =>
        selectedDesigner?.revisionTime === UNLIMITED_REVISION_CODE,
        [selectedDesigner]
    );

    const totalCost = useMemo(() => {
        const base = selectedDesigner?.price || 0;
        const extra = isUnlimitedRevisions ? 0 : extraRevisionCost;
        const fee = Math.round(serviceFee(base + extra));
        return Math.round(base + extra + fee);
    }, [selectedDesigner, isUnlimitedRevisions, extraRevisionCost]);
    const baseAndExtra = useMemo(() => {
        const base = selectedDesigner?.price || 0;
        const extra = isUnlimitedRevisions ? 0 : extraRevisionCost;
        return { base, extra };
    }, [selectedDesigner, isUnlimitedRevisions, extraRevisionCost]);
    const feeAmount = useMemo(() => Math.round(serviceFee(baseAndExtra.base + baseAndExtra.extra)), [baseAndExtra]);
    const exceedsCap = totalCost > 200000000;

    const boyItems = useMemo(() => (request?.items || []).filter(i => i.gender === 'boy'), [request]);
    const girlItems = useMemo(() => (request?.items || []).filter(i => i.gender === 'girl'), [request]);

    useEffect(() => {
        setSelectedQuotation(null);
        setPaymentDetails(null);
        setShowDesigners(false);
        setError(null);
        setExtraRevision(0);

        if (request && request.designQuotations) {
            setAppliedDesigners(request.designQuotations);
        }
    }, [request]);

    // Restore saved sort criteria on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('designerSortCriteria');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const sanitized = parsed.filter(c => c && typeof c.key === 'string' && (c.order === 'asc' || c.order === 'desc'));
                    if (sanitized.length) setSortCriteria(sanitized);
                }
            }
        } catch {}
    }, []);

    // Persist sort criteria changes
    useEffect(() => {
        try {
            localStorage.setItem('designerSortCriteria', JSON.stringify(sortCriteria));
        } catch {}
    }, [sortCriteria]);

    // Optimized event handlers
    const handleQuotationSelect = useCallback((designerId) => {
        const quotation = appliedDesigners.find(d => d.id === designerId);
        if (quotation) {
            setSelectedQuotation({designerId, quotationId: designerId});
            setPaymentDetails({quotation, request});
            setError(null);

            // Reset extra revision if the selected quotation has unlimited revisions
            if (quotation.revisionTime === UNLIMITED_REVISION_CODE) {
                setExtraRevision(0);
            }
        }
    }, [appliedDesigners, request]);

    const handleOpenPaymentModal = useCallback(() => {
        setIsPaymentModalVisible(true);
    }, []);

    const handleClosePaymentModal = useCallback(() => {
        setIsPaymentModalVisible(false);
    }, []);

    const handleConfirmSelection = useCallback(async () => {
        try {
            setIsProcessing(true);
            setError(null);

            if (!selectedQuotation) {
                setError('Please select a quotation first.');
                return;
            }

            const selectedDesigner = appliedDesigners.find(d => d.id === selectedQuotation.designerId);
            const isUnlimited = selectedDesigner?.revisionTime === UNLIMITED_REVISION_CODE;
            const basePrice = selectedDesigner?.price || 0;
            const extraCost = isUnlimited ? 0 : (extraRevision * (selectedDesigner?.extraRevisionPrice || 0));
            const total = Math.round(basePrice + extraCost + serviceFee(basePrice + extraCost));
            if (total > 200000000) {
                setError('Total amount cannot exceed 200,000,000 VND. Please reduce extra revisions.');
                return;
            }

            // Only store extra revision if not unlimited
            if (!isUnlimited) {
                sessionStorage.setItem('extraRevision', extraRevision.toString());
            } else {
                sessionStorage.setItem('extraRevision', '0');
            }

            handleOpenPaymentModal();
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Selection error:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedQuotation, appliedDesigners, extraRevision, handleOpenPaymentModal]);

    const handleToggleDesigners = useCallback(() => {
        setShowDesigners(prev => !prev);
    }, []);

    const handleToggleRequestDetail = useCallback(() => {
        setShowRequestDetail(prev => !prev);
    }, []);

    const handleExtraRevisionChange = useCallback((value) => {
        setExtraRevision(Math.max(0, Math.min(value, MAX_EXTRA_REVISIONS)));
    }, []);

    const DEFAULT_SORT_ORDER = {
        rating: 'desc',
        acceptanceDeadline: 'asc',
        deliveryWithIn: 'asc',
        revisionTime: 'desc',
        price: 'asc'
    };

    const handleSortChange = useCallback((values) => {
        setSortCriteria(prev => {
            const prevMap = new Map(prev.map(c => [c.key, c.order]));
            const next = values.map(key => ({ key, order: prevMap.get(key) || DEFAULT_SORT_ORDER[key] || 'asc' }));
            return next;
        });
    }, []);

    const handleToggleSortOrder = useCallback((key) => {
        setSortCriteria(prev => prev.map(c => c.key === key ? { ...c, order: c.order === 'asc' ? 'desc' : 'asc' } : c));
    }, []);

    const handleResetSort = useCallback(() => {
        setSortCriteria([]);
        try { localStorage.removeItem('designerSortCriteria'); } catch {}
    }, []);

    const getComparableValue = (d, key) => {
        switch (key) {
            case 'rating':
                return Number(d?.designer?.rating ?? 0);
            case 'acceptanceDeadline':
                return new Date(d?.acceptanceDeadline || 0).getTime() || 0;
            case 'deliveryWithIn':
                return Number(d?.deliveryWithIn ?? Number.MAX_SAFE_INTEGER);
            case 'revisionTime': {
                const val = Number(d?.revisionTime ?? 0);
                return val === UNLIMITED_REVISION_CODE ? Number.MAX_SAFE_INTEGER : val;
            }
            case 'price':
                return Number(d?.price ?? Number.MAX_SAFE_INTEGER);
            default:
                return 0;
        }
    };

    const sortedDesigners = useMemo(() => {
        if (!sortCriteria.length) return appliedDesigners;
        const copy = [...appliedDesigners];
        copy.sort((a, b) => {
            for (const c of sortCriteria) {
                const av = getComparableValue(a, c.key);
                const bv = getComparableValue(b, c.key);
                if (av === bv) continue;
                const cmp = av < bv ? -1 : 1;
                return c.order === 'asc' ? cmp : -cmp;
            }
            return 0;
        });
        return copy;
    }, [appliedDesigners, sortCriteria]);

    // Loading state
    if (!request) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4, gap: 2}}>
                    <Spin size="large" />
                    <Typography.Text style={{ color: '#64748b' }}>
                        Loading request details...
                    </Typography.Text>
                </Box>
            </Modal>
        );
    }

    const getFooterButtons = useCallback((status) => {
        switch (status) {
            case 'pending':
                return [
                    <Button
                        key="cancel"
                        onClick={onCancel}
                        style={{marginRight: 8}}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="confirmSelection"
                        type="primary"
                        onClick={handleConfirmSelection}
                        disabled={!selectedQuotation || isProcessing || exceedsCap}
                        icon={isProcessing ? <Spin size="small" /> : <CheckCircleOutlined/>}
                        style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            borderColor: '#2e7d32'
                        }}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Selection'}
                    </Button>,
                ];
            default:
                return null;
        }
    }, [onCancel, handleConfirmSelection, selectedQuotation, isProcessing, exceedsCap]);

    return (
        <Modal
            title={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <InfoCircleOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                    <Typography.Title level={4} style={{margin: 0, color: '#1e293b'}}>
                        Designer Applications
                    </Typography.Title>
                    <Chip
                        label={parseID(request.id, 'dr')}
                        size="small"
                        style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                </Box>
            }
            open={visible}
            onCancel={onCancel}
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
            footer={getFooterButtons(request.status)}
        >
            {request.status === 'pending' && (
                <Box sx={{width: '100%'}}>
                    {/* Error Display */}
                    {error && (
                        <Box sx={{
                            mb: 3,
                            p: 2,
                            backgroundColor: '#fef2f2',
                            borderRadius: 2,
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <CloseCircleOutlined style={{color: '#dc2626', fontSize: '16px'}}/>
                            <Typography.Text style={{color: '#dc2626', fontSize: '14px'}}>
                                {error}
                            </Typography.Text>
                        </Box>
                    )}

                    {/* Header Section */}
                    <Box sx={{
                        mb: 3,
                        p: 3,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                Applied Designers ({appliedDesigners.length})
                            </Typography.Title>
                            <Box style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    key="toggleRequestDetail"
                                    type={showRequestDetail ? 'default' : 'primary'}
                                    onClick={handleToggleRequestDetail}
                                    icon={<InfoCircleOutlined/>}
                                    style={{
                                        backgroundColor: showRequestDetail ? '#f1f5f9' : '#2e7d32',
                                        borderColor: showRequestDetail ? '#cbd5e1' : '#2e7d32',
                                        color: showRequestDetail ? '#475569' : 'white'
                                    }}
                                >
                                    {showRequestDetail ? 'Hide request detail' : 'Show request detail'}
                                </Button>
                                <Button
                                    type={showDesigners ? "default" : "primary"}
                                    onClick={handleToggleDesigners}
                                    icon={showDesigners ? <CloseCircleOutlined/> : <UserOutlined/>}
                                    style={{
                                        backgroundColor: showDesigners ? '#f1f5f9' : '#2e7d32',
                                        borderColor: showDesigners ? '#cbd5e1' : '#2e7d32',
                                        color: showDesigners ? '#475569' : 'white'
                                    }}
                                >
                                    {showDesigners ? 'Hide Designers' : 'View Designers'}
                                </Button>
                            </Box>
                        </Box>
                        <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                            Review and select from the designers who have applied to your request. Each designer offers
                            different quotations with varying timelines and features.
                        </Typography.Text>
                        {/* Sort controls (only show when viewing designers) */}
                        {showDesigners && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Sort by (priority left → right)"
                                    style={{ minWidth: 360 }}
                                    value={sortCriteria.map(c => c.key)}
                                    onChange={handleSortChange}
                                    options={[
                                        { label: 'Rating', value: 'rating' },
                                        { label: 'Valid until', value: 'acceptanceDeadline' },
                                        { label: 'Delivery time', value: 'deliveryWithIn' },
                                        { label: 'Revisions', value: 'revisionTime' },
                                        { label: 'Price', value: 'price' }
                                    ]}
                                />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {sortCriteria.map(c => (
                                        <Chip
                                            key={c.key}
                                            label={`${{
                                                rating: 'Rating',
                                                acceptanceDeadline: 'Valid until',
                                                deliveryWithIn: 'Delivery',
                                                revisionTime: 'Revisions',
                                                price: 'Price'
                                            }[c.key]} ${c.order === 'asc' ? '↑' : '↓'}`}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleToggleSortOrder(c.key)}
                                            sx={{ cursor: 'pointer', height: 26 }}
                                        />
                                    ))}
                                </Box>
                                <Button onClick={handleResetSort} type="default">
                                    Reset sort
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Request Detail Panel */}
                    {showRequestDetail && (
                        <Box sx={{ mb: 3, p: 3, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 2, width: '100%' }}>
                            {/* Header with Logo and Metadata */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 2, mb: 2 }}>
                                {request.logoImage && (
                                    <DisplayImage imageUrl={request.logoImage} alt="School logo" width={56} height={56} />
                                )}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                                            {request.name}
                                        </Typography.Title>
                                        <Tag color="green">{parseID(request.id, 'dr')}</Tag>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                        <Tag color="geekblue">Status: {request.status}</Tag>
                                        <Tag color={request.privacy ? 'blue' : 'default'}>{request.privacy ? 'Private' : 'Public'}</Tag>
                                        <Tag color="purple">Created: {formatDate(request.creationDate)}</Tag>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Items grouped by gender */}
                            {boyItems.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>Boy</Typography.Title>
                                    <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                        {boyItems.map((item) => (
                                            <Paper key={item.id} elevation={0} sx={{ 
                                                p: 2, 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: 280,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                {/* Header with color dot and title */}
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                                                    <Box sx={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        borderRadius: '50%', 
                                                        backgroundColor: item.color, 
                                                        border: '1px solid #e2e8f0', 
                                                        mt: '6px',
                                                        flexShrink: 0
                                                    }} />
                                                    <Typography.Title level={5} style={{ 
                                                        margin: 0, 
                                                        color: '#1e293b',
                                                        fontSize: '14px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {item.type} - {(item.category === 'pe' ? 'physical education' : item.category)}
                                                    </Typography.Title>
                                                </Box>

                                                {/* Sample Image */}
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    mb: 1.5,
                                                    minHeight: 120
                                                }}>
                                                    {(item.sampleImages && item.sampleImages.length > 0) ? (
                                                        <DisplayImage 
                                                            imageUrl={item.sampleImages[0].url} 
                                                            alt="Sample" 
                                                            width="100px" 
                                                            height="100px"
                                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                        />
                                                    ) : (
                                                        <Box sx={{
                                                            width: '100%',
                                                            height: 100,
                                                            backgroundColor: '#f8fafc',
                                                            border: '2px dashed #e2e8f0',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography.Text style={{ color: '#64748b', fontSize: '12px' }}>
                                                                No reference image
                                                            </Typography.Text>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Tags */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        <Tag color="blue" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.gender}</Tag>
                                                        <Tag color="success" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.fabricName}</Tag>
                                                        {item.logoPosition && (
                                                            <Tag color="gold" style={{ fontSize: '10px', padding: '2px 6px', alignSelf: 'flex-start' }}>
                                                                Logo: {item.logoPosition}
                                                            </Tag>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Note */}
                                                <Box sx={{ 
                                                        mt: 'auto',
                                                        p: 1,
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: 1,
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <Typography.Text style={{ 
                                                            fontSize: '10px', 
                                                            color: '#64748b',
                                                            display: 'block',
                                                            lineHeight: '1.3'
                                                        }}>
                                                            {item.note || 'N/A'}
                                                        </Typography.Text>
                                                    </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {girlItems.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>Girl</Typography.Title>
                                    <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                        {girlItems.map((item) => (
                                            <Paper key={item.id} elevation={0} sx={{ 
                                                p: 2, 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: 280,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                {/* Header with color dot and title */}
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                                                    <Box sx={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        borderRadius: '50%', 
                                                        backgroundColor: item.color, 
                                                        border: '1px solid #e2e8f0', 
                                                        mt: '6px',
                                                        flexShrink: 0
                                                    }} />
                                                    <Typography.Title level={5} style={{ 
                                                        margin: 0, 
                                                        color: '#1e293b',
                                                        fontSize: '14px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {item.type} - {(item.category === 'pe' ? 'physical education' : item.category)}
                                                    </Typography.Title>
                                                </Box>

                                                {/* Sample Image */}
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    mb: 1.5,
                                                    minHeight: 120
                                                }}>
                                                    {(item.sampleImages && item.sampleImages.length > 0) ? (
                                                        <DisplayImage 
                                                            imageUrl={item.sampleImages[0].url} 
                                                            alt="Sample" 
                                                            width="100px" 
                                                            height="100px"
                                                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                        />
                                                    ) : (
                                                        <Box sx={{
                                                            width: '100%',
                                                            height: 100,
                                                            backgroundColor: '#f8fafc',
                                                            border: '2px dashed #e2e8f0',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography.Text style={{ color: '#64748b', fontSize: '12px' }}>
                                                                No reference image
                                                            </Typography.Text>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Tags */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        <Tag color="pink" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.gender}</Tag>
                                                        <Tag color="success" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.fabricName}</Tag>
                                                        {item.logoPosition && (
                                                            <Tag color="gold" style={{ fontSize: '10px', padding: '2px 6px', alignSelf: 'flex-start' }}>
                                                                Logo: {item.logoPosition}
                                                            </Tag>
                                                        )}
                                                    </Box>
                                                    
                                                </Box>

                                                {/* Note */}
                                                <Box sx={{ 
                                                        mt: 'auto',
                                                        p: 1,
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: 1,
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <Typography.Text style={{ 
                                                            fontSize: '10px', 
                                                            color: '#64748b',
                                                            display: 'block',
                                                            lineHeight: '1.3'
                                                        }}>
                                                            {item.note || 'N/A'}
                                                        </Typography.Text>
                                                    </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Designers List */}
                    {showDesigners && (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: 3
                        }}>
                            {sortedDesigners.map((designer, index) => (
                                <Box key={index} sx={{ minWidth: 0 }}>
                                    <DesignerCard
                                        designer={designer}
                                        isSelected={selectedQuotation && selectedQuotation.designerId === designer.id}
                                        onSelect={handleQuotationSelect}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Selection Summary */}
                    {selectedQuotation && (
                        <Box sx={{
                            mt: 3,
                            p: 3,
                            backgroundColor: '#e8f5e8',
                            borderRadius: 2,
                            border: '1px solid #2e7d32'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <CheckCircleOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                                <Typography.Title level={5} style={{margin: 0, color: '#2e7d32'}}>
                                    Selected Quotation
                                </Typography.Title>
                            </Box>
                            <Typography.Text style={{color: '#1e293b', mb: 3, display: 'block'}}>
                                You have selected a quotation
                                from {appliedDesigners.find(d => d.id === selectedQuotation.designerId)?.designer.customer.name}.
                            </Typography.Text>

                                                         {/* Extra Revision Selection */}
                            {(() => {
                                if (isUnlimitedRevisions) {
                                    return (
                                        <Box sx={{ 
                                            mt: 3, 
                                            p: 3, 
                                            backgroundColor: '#f0fdf4', 
                                            borderRadius: 3,
                                            border: '1px solid #bbf7d0',
                                            textAlign: 'center'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                                                <CheckCircleOutlined style={{ color: '#16a34a', fontSize: '20px' }} />
                                                <Typography.Title level={5} style={{ margin: 0, color: '#166534' }}>
                                                    Unlimited Revisions Included
                                                </Typography.Title>
                                            </Box>
                                            <Typography.Text style={{ color: '#166534', fontSize: '14px' }}>
                                                This quotation already includes unlimited revisions. No additional revisions needed.
                                            </Typography.Text>
                                        </Box>
                                    );
                                }

                                return (
                                    <Box sx={{ 
                                        mt: 3, 
                                        backgroundColor: 'white', 
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                                    }}>
                                {/* Header */}
                                <Box sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: '#e8f5e8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <EditOutlined style={{color: '#2e7d32', fontSize: '14px'}}/>
                                        </Box>
                                        <Box>
                                            <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                                Additional Revisions
                                            </Typography.Title>
                                            <Typography.Text style={{fontSize: '12px', color: '#64748b'}}>
                                                Optional upgrade for more design iterations
                                            </Typography.Text>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Content */}
                                <Box sx={{p: 3}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                        {/* Price Info */}
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#f0f9ff',
                                            borderRadius: 2,
                                            border: '1px solid #bae6fd'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                                <Box sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#0ea5e9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography.Text
                                                        style={{color: 'white', fontSize: '10px', fontWeight: 'bold'}}>
                                                        ₫
                                                    </Typography.Text>
                                                </Box>
                                                <Typography.Text
                                                    style={{fontSize: '13px', color: '#0c4a6e', fontWeight: 600}}>
                                                    Pricing Information
                                                </Typography.Text>
                                            </Box>
                                            <Typography.Text style={{fontSize: '12px', color: '#0369a1'}}>
                                                Each additional revision
                                                costs <strong>{selectedDesigner?.extraRevisionPrice?.toLocaleString('vi-VN')} VND</strong>
                                            </Typography.Text>
                                        </Box>

                                        {/* Selection Control */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Box>
                                                <Typography.Text
                                                    style={{fontSize: '14px', color: '#475569', fontWeight: 500}}>
                                                    Number of Extra Revisions
                                                </Typography.Text>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <InputNumber
                                                    min={0}
                                                    max={MAX_EXTRA_REVISIONS}
                                                    value={extraRevision}
                                                    onChange={handleExtraRevisionChange}
                                                    style={{
                                                        width: 100,
                                                        textAlign: 'center'
                                                    }}
                                                    size="middle"
                                                />
                                                <Typography.Text style={{fontSize: '12px', color: '#64748b'}}>
                                                    revisions
                                                </Typography.Text>
                                            </Box>
                                        </Box>

                                        {/* Cost Display */}
                                        {extraRevision > 0 && (
                                            <Box sx={{
                                                backgroundColor: 'white',
                                                borderRadius: 3,
                                                border: '1px solid #e2e8f0',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                            }}>
                                                {/* Header */}
                                                <Box sx={{
                                                    p: 2,
                                                    backgroundColor: '#fef3c7',
                                                    borderBottom: '1px solid #f59e0b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#f59e0b',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Typography.Text style={{
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ₫
                                                            </Typography.Text>
                                                        </Box>
                                                        <Box>
                                                            <Typography.Text style={{
                                                                color: '#92400e',
                                                                fontWeight: 600,
                                                                fontSize: '14px'
                                                            }}>
                                                                Additional Cost Summary
                                                            </Typography.Text>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{
                                                        px: 2,
                                                        py: 1,
                                                        backgroundColor: '#f59e0b',
                                                        borderRadius: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <Typography.Text style={{
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            +{extraRevision}
                                                        </Typography.Text>
                                                    </Box>
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                        {/* Total Cost */}
                                                        <Box sx={{
                                                            p: 3,
                                                            backgroundColor: '#fef3c7',
                                                            borderRadius: 2,
                                                            border: '1px solid #f59e0b',
                                                            textAlign: 'center'
                                                        }}>
                                                            <Typography.Text style={{
                                                                color: '#92400e',
                                                                fontSize: '12px',
                                                                fontWeight: 500,
                                                                display: 'block',
                                                                mb: 1
                                                            }}>
                                                                TOTAL ADDITIONAL COST
                                                            </Typography.Text>
                                                            <Typography.Title level={3} style={{
                                                                margin: 0,
                                                                color: '#d97706',
                                                                fontWeight: 700
                                                            }}>
                                                                {extraRevisionCost.toLocaleString('vi-VN')} VND
                                                            </Typography.Title>
                                                        </Box>

                                                        {/* Summary */}
                                                        <Box sx={{
                                                            p: 2,
                                                            backgroundColor: '#f0fdf4',
                                                            borderRadius: 2,
                                                            border: '1px solid #bbf7d0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <CheckCircleOutlined style={{
                                                                    color: '#16a34a',
                                                                    fontSize: '14px'
                                                                }}/>
                                                                <Typography.Text style={{
                                                                    color: '#166534',
                                                                    fontSize: '12px',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {extraRevision} additional revision{extraRevision > 1 ? 's' : ''} selected
                                                                </Typography.Text>
                                                            </Box>
                                                            <Typography.Text style={{
                                                                color: '#059669',
                                                                fontSize: '13px',
                                                                fontWeight: 600
                                                            }}>
                                                                {selectedDesigner?.extraRevisionPrice?.toLocaleString('vi-VN')} VND each
                                                            </Typography.Text>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Payment Summary */}
                                        <Box sx={{
                                            p: 2.5,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography.Text style={{ fontWeight: 700, color: '#1e293b' }}>
                                                Payment Summary
                                            </Typography.Text>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                <Typography.Text style={{ color: '#475569' }}>Base price</Typography.Text>
                                                <Typography.Text style={{ color: '#1e293b', fontWeight: 600 }}>
                                                    {baseAndExtra.base.toLocaleString('vi-VN')} VND
                                                </Typography.Text>
                                            </Box>
                                            {!isUnlimitedRevisions && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography.Text style={{ color: '#475569' }}>Extra revisions</Typography.Text>
                                                    <Typography.Text style={{ color: '#1e293b', fontWeight: 600 }}>
                                                        {baseAndExtra.extra.toLocaleString('vi-VN')} VND
                                                    </Typography.Text>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                <Typography.Text style={{ color: '#475569' }}>
                                                    Service fee {baseAndExtra.base + baseAndExtra.extra <= 10000000 ? '(2% total)' : ''}
                                                </Typography.Text>
                                                <Typography.Text style={{ color: '#1e293b', fontWeight: 600 }}>
                                                    {feeAmount.toLocaleString('vi-VN')} VND
                                                </Typography.Text>
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography.Text style={{ color: '#1e293b', fontWeight: 700 }}>Total</Typography.Text>
                                                <Typography.Title level={4} style={{ margin: 0, color: '#16a34a' }}>
                                                    {totalCost.toLocaleString('vi-VN')} VND
                                                </Typography.Title>
                                            </Box>
                                            {exceedsCap && (
                                                <Typography.Text style={{ color: '#dc2626', fontSize: 12 }}>
                                                    Total exceeds the maximum allowed (200,000,000 VND). Please reduce extra revisions.
                                                </Typography.Text>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                                );
                            })()}
                        </Box>
                    )}
                </Box>
            )}

            <DesignPaymentPopup
                visible={isPaymentModalVisible}
                onCancel={handleClosePaymentModal}
                selectedQuotationDetails={paymentDetails}
            />
        </Modal>
    );
}