import {Button, InputNumber, Modal, Spin, Tag, Typography} from 'antd';
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
    UserOutlined
} from '@ant-design/icons';
import {Box, Chip, Divider, Paper} from '@mui/material';
import {useEffect, useState, useMemo, useCallback} from 'react';
import React from 'react';
import DesignPaymentPopup from './DesignPaymentPopup';
import {parseID} from "../../../utils/ParseIDUtil.jsx";

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
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#2e7d32',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)'
                }
            }}
        >
            {/* Designer Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: '#2e7d32',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px'
                    }}>
                        {designer.designer.customer.name.charAt(0)}
                    </Box>
                    <Box>
                        <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                            {designer.designer.customer.name}
                        </Typography.Title>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 0.5}}>
                            <Typography.Text type="secondary" style={{fontSize: '12px'}}>
                                ⭐ {designer.designer.rating}
                            </Typography.Text>
                        </Box>
                    </Box>
                </Box>
                <Chip
                    label={`Valid Until: ${formatDate(designer.acceptanceDeadline)}`}
                    size="small"
                    icon={<ClockCircleOutlined/>}
                    style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderColor: '#f59e0b'
                    }}
                />
            </Box>

            {/* Designer Contact Info */}
            <Box sx={{display: 'flex', gap: 3, mb: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <MailOutlined style={{color: '#64748b'}}/>
                    <Typography.Text type="secondary" style={{fontSize: '13px'}}>
                        {designer.designer.customer.account.email}
                    </Typography.Text>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <PhoneOutlined style={{color: '#64748b'}}/>
                    <Typography.Text type="secondary" style={{fontSize: '13px'}}>
                        {designer.designer.customer.phone}
                    </Typography.Text>
                </Box>
            </Box>

            <Divider style={{margin: '16px 0'}}/>

            {/* Quotation Details */}
            <Box>
                <Typography.Title level={6} style={{margin: '0 0 16px 0', color: '#475569'}}>
                    Quotation Details
                </Typography.Title>
                <Paper
                    elevation={isSelected ? 4 : 1}
                    sx={{
                        border: isSelected ? '2px solid #2e7d32' : '1px solid #e2e8f0',
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#e8f5e8' : '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#2e7d32',
                            backgroundColor: isSelected ? '#e8f5e8' : '#f8fafc',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(46, 125, 50, 0.15)',
                        },
                    }}
                    onClick={() => onSelect(designer.id)}
                    onKeyPress={handleKeyPress}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select quotation from ${designer.designer.customer.name}`}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2
                    }}>
                        {isSelected && (
                            <CheckCircleOutlined style={{color: '#2e7d32', fontSize: '20px'}}/>
                        )}
                    </Box>

                    <Typography.Title level={4} style={{margin: '8px 0', color: '#1e293b'}}>
                        {formatPrice(designer.price)}
                    </Typography.Title>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <CalendarIcon style={{color: '#64748b', fontSize: '14px'}}/>
                            <Typography.Text style={{fontSize: '13px', color: '#475569'}}>
                                <strong>{designer.deliveryWithIn} days</strong> design time
                            </Typography.Text>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <EditOutlined style={{color: '#64748b', fontSize: '14px'}}/>
                            <Typography.Text style={{fontSize: '13px', color: '#475569'}}>
                                Up to <strong>{designer.revisionTime === UNLIMITED_REVISION_CODE ? 'Unlimited' : designer.revisionTime}</strong> revisions
                            </Typography.Text>
                        </Box>
                        {designer.extraRevisionPrice > 0 && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <EditOutlined style={{color: '#64748b', fontSize: '14px'}}/>
                                <Typography.Text style={{fontSize: '13px', color: '#475569'}}>
                                    Extra revision: <strong>{formatPrice(designer.extraRevisionPrice)}</strong>
                                </Typography.Text>
                            </Box>
                        )}
                        {designer.note && (
                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                <FileTextOutlined style={{
                                    color: '#64748b',
                                    fontSize: '14px',
                                    marginTop: '2px'
                                }}/>
                                <Typography.Text style={{
                                    fontSize: '13px',
                                    color: '#475569',
                                    fontStyle: 'italic'
                                }}>
                                    {designer.note}
                                </Typography.Text>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
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

    const handleExtraRevisionChange = useCallback((value) => {
        setExtraRevision(Math.max(0, Math.min(value, MAX_EXTRA_REVISIONS)));
    }, []);

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
                        disabled={!selectedQuotation || isProcessing}
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
    }, [onCancel, handleConfirmSelection, selectedQuotation, isProcessing]);

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
            width={1000}
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
                        <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                            Review and select from the designers who have applied to your request. Each designer offers
                            different quotations with varying timelines and features.
                        </Typography.Text>
                    </Box>

                    {/* Designers List */}
                    {showDesigners && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {appliedDesigners.map((designer, index) => (
                                <DesignerCard
                                    key={index}
                                    designer={designer}
                                    isSelected={selectedQuotation && selectedQuotation.designerId === designer.id}
                                    onSelect={handleQuotationSelect}
                                />
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

                                        {/* Benefits */}
                                        {extraRevision > 0 && (
                                            <Box sx={{
                                                p: 2,
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: 2,
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <CheckCircleOutlined style={{color: '#16a34a', fontSize: '14px'}}/>
                                                    <Typography.Text style={{fontSize: '12px', color: '#166534'}}>
                                                        <strong>Benefits:</strong> More design iterations, better final
                                                        result, faster approval process
                                                    </Typography.Text>
                                                </Box>
                                            </Box>
                                        )}
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