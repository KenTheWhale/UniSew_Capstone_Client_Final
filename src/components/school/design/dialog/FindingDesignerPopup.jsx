import {Button, Carousel, InputNumber, Modal, Select, Spin, Tag, Typography} from 'antd';
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
import {
    Avatar,
    Badge,
    Box,
    Chip,
    Divider,
    IconButton,
    Paper,
    Rating,
    Tooltip,
    Typography as MuiTypography
} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import DesignPaymentPopup from './DesignPaymentPopup.jsx';
import {parseID} from "../../../../utils/ParseIDUtil.jsx";
import DisplayImage from '../../../ui/DisplayImage.jsx';
import {getPartnerProfileForQuotation} from '../../../../services/AccountService.jsx';
import {getConfigByKey, configKey} from '../../../../services/SystemService.jsx';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import WorkIcon from '@mui/icons-material/Work';
import TaxIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const STATUS_CONFIG = {
    pending: {color: 'blue', icon: <FileTextOutlined/>, text: 'Finding designer'},
    processing: {color: 'purple', icon: <SyncOutlined/>, text: 'processing'},
    completed: {color: 'cyan', icon: <CheckCircleOutlined/>, text: 'completed'},
    canceled: {color: 'red', icon: <CloseCircleOutlined/>, text: 'canceled'}
};

const UNLIMITED_REVISION_CODE = 9999;
const MAX_EXTRA_REVISIONS = 10;

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

export function statusTag(status) {
    const config = STATUS_CONFIG[status] || {color: 'default', icon: null, text: status};
    return <Tag color={config.color}>{config.icon} {config.text}</Tag>;
}

const DesignerCard = React.memo(({designer, isSelected, onSelect, onViewProfile}) => {
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
                border: isSelected ? '2px solid #2e7d32' : '1px solid #e2e8f0',
                borderRadius: 3,
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    borderColor: isSelected ? '#2e7d32' : '#1976d2',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                },
                '& .profile-btn': {
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2
                },
                '& .selected-badge': {
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2
                }
            }}
            onClick={() => onSelect(designer.id)}
            onKeyPress={handleKeyPress}
            tabIndex={0}
            role="button"
            aria-label={`Select quotation from ${designer.designer.customer.name}`}
        >
            {/* Header Section */}
            <Box sx={{mb: 2.5}}>
                {/* Action Buttons */}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                    <Tooltip title="View Profile">
                        <IconButton
                            className="profile-btn"
                            onClick={e => {
                                e.stopPropagation();
                                onViewProfile(designer.designer);
                            }}
                            size="small"
                            sx={{
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                '&:hover': {
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    borderColor: '#1976d2'
                                }
                            }}
                        >
                            <PersonSearchIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Designer Info & Price */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: '#2e7d32',
                            border: isSelected ? '3px solid #2e7d32' : '2px solid #e2e8f0',
                            fontSize: '20px',
                            fontWeight: 600
                        }}
                        src={designer?.designer?.customer?.avatar}
                        slotProps={{img: {referrerPolicy: 'no-referrer'}}}
                    >
                        {designer.designer.customer.name.charAt(0)}
                    </Avatar>
                    <Box sx={{flex: 1, minWidth: 0}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5}}>
                            <Typography.Title
                                level={5}
                                style={{
                                    margin: 0,
                                    color: '#1e293b',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    lineHeight: 1.3
                                }}
                            >
                                {designer.designer.customer.name}
                            </Typography.Title>
                            {isSelected && (
                                <Chip
                                    label="Selected"
                                    color="success"
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 10,
                                        height: 20,
                                        px: 1,
                                        borderRadius: 1.5,
                                        bgcolor: '#e8f5e8',
                                        color: '#2e7d32',
                                        border: '1px solid #2e7d32'
                                    }}
                                />
                            )}
                        </Box>
                        <Typography
                            style={{
                                marginTop: 1,
                                color: '#2e7d32',
                                fontWeight: 700,
                                fontSize: '18px',
                                lineHeight: 1.2
                            }}
                        >
                            {formatPrice(designer.price).replace(' VND', '')} <span
                            style={{fontSize: 11, fontWeight: 600}}>VND</span>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Rating & Validity */}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5}}>
                <Chip
                    size="small"
                    variant="outlined"
                    label={`⭐ ${designer.designer.rating}`}
                    sx={{
                        height: 24,
                        bgcolor: '#fef3c7',
                        borderColor: '#f59e0b',
                        color: '#92400e',
                        fontWeight: 600,
                        fontSize: '12px'
                    }}
                />
                <Chip
                    size="small"
                    variant="outlined"
                    icon={<ClockCircleOutlined style={{fontSize: 12}}/>}
                    label={`Valid until ${formatDate(designer.acceptanceDeadline)}`}
                    sx={{
                        height: 24,
                        bgcolor: '#f0f9ff',
                        borderColor: '#0ea5e9',
                        color: '#0c4a6e',
                        fontWeight: 500,
                        fontSize: '11px'
                    }}
                />
            </Box>

            {/* Service Details Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                mb: 2.5,
                p: 2,
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1.5,
                    border: '1px solid #e2e8f0'
                }}>
                    <CalendarIcon style={{fontSize: 16, color: '#0ea5e9', marginBottom: 4}}/>
                    <Typography.Text style={{fontSize: '11px', color: '#64748b', fontWeight: 500, mb: 0.5}}>
                        Delivery
                    </Typography.Text>
                    <Typography.Text style={{fontSize: '13px', color: '#1e293b', fontWeight: 600}}>
                        {designer.deliveryWithIn} days
                    </Typography.Text>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 1.5,
                    border: '1px solid #e2e8f0'
                }}>
                    <EditOutlined style={{fontSize: 16, color: '#8b5cf6', marginBottom: 4}}/>
                    <Typography.Text style={{fontSize: '11px', color: '#64748b', fontWeight: 500, mb: 0.5}}>
                        Revisions
                    </Typography.Text>
                    <Typography.Text style={{fontSize: '13px', color: '#1e293b', fontWeight: 600}}>
                        {designer.revisionTime === UNLIMITED_REVISION_CODE ? 'Unlimited' : designer.revisionTime}
                    </Typography.Text>
                </Box>

                {designer.extraRevisionPrice > 0 && (
                    <Box sx={{
                        gridColumn: 'span 2',
                        p: 1.5,
                        bgcolor: '#fef3c7',
                        borderRadius: 1.5,
                        border: '1px solid #f59e0b',
                        textAlign: 'center'
                    }}>
                        <Typography.Text style={{fontSize: '11px', color: '#92400e', fontWeight: 600}}>
                            Extra Revisions: {formatPrice(designer.extraRevisionPrice)}
                        </Typography.Text>
                    </Box>
                )}
            </Box>

            {/* Contact Information */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 2,
                backgroundColor: '#f1f5f9',
                borderRadius: 2,
                border: '1px solid #cbd5e1',
                mb: 2
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <MailOutlined style={{color: '#64748b', fontSize: 14}}/>
                    <Typography.Text
                        style={{
                            fontSize: '12px',
                            color: '#475569',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {designer.designer.customer.account.email}
                    </Typography.Text>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <PhoneOutlined style={{color: '#64748b', fontSize: 14}}/>
                    <Typography.Text
                        style={{
                            fontSize: '12px',
                            color: '#475569',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                        onClick={() => window.open(`https://zalo.me/${designer.designer.customer.phone}`, "_blank")}
                        title="Click to contact on Zalo"
                    >
                        {designer.designer.customer.phone}
                    </Typography.Text>
                </Box>
            </Box>

            {/* Note Section */}
            {designer.note && (
                <Box sx={{
                    mt: 'auto',
                    p: 2,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    borderLeft: '4px solid #1976d2'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1}}>
                        <FileTextOutlined style={{color: '#1976d2', fontSize: 14, marginTop: 1}}/>
                        <Typography.Text style={{fontSize: '11px', color: '#1e293b', fontWeight: 600}}>
                            Designer Note
                        </Typography.Text>
                    </Box>
                    <Typography.Paragraph
                        style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#475569',
                            lineHeight: 1.4
                        }}
                        ellipsis={{rows: 2, tooltip: designer.note}}
                    >
                        {designer.note}
                    </Typography.Paragraph>
                </Box>
            )}
        </Paper>
    );
});

DesignerCard.displayName = 'DesignerCard';

// Updated DesignerProfileModal
const DesignerProfileModal = ({open, onClose, designer}) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!designer || !open) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await getPartnerProfileForQuotation(designer.id);
                
                if (response?.status === 200 && response.data?.body) {
                    setProfileData(response.data.body);
                } else {
                    setError('Failed to load profile data');
                }
            } catch (error) {
                console.error('Error fetching partner profile:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [designer, open]);

    if (!designer) return null;

    const customer = profileData?.customer || designer.customer || {};
    const account = customer.account || {};
    const feedbacks = profileData?.feedbacks?.filter(feedback => !feedback.report) || [];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={800}
            title={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <PersonSearchIcon style={{color: '#1976d2', fontSize: 28}}/>
                    <MuiTypography variant="h6" sx={{fontWeight: 700, color: '#1e293b', m: 0}}>
                        Designer Profile
                    </MuiTypography>
                </Box>
            }
            styles={{
                body: {
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: '24px'
                }
            }}
        >
            {loading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4}}>
                    <Spin size="large" />
                </Box>
            ) : error ? (
                <Box sx={{textAlign: 'center', py: 4}}>
                    <MuiTypography color="error">{error}</MuiTypography>
                </Box>
            ) : (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    {/* Header Section */}
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2}}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            badgeContent={
                                account.status === 'active' ? (
                                    <CheckCircleIcon sx={{color: '#16a34a', fontSize: 28, bgcolor: 'white', borderRadius: '50%'}}/>
                                ) : (
                                    <BlockIcon sx={{color: '#dc2626', fontSize: 28, bgcolor: 'white', borderRadius: '50%'}}/>
                                )
                            }
                        >
                            <Avatar
                                src={customer.avatar}
                                alt={customer.name}
                                sx={{width: 96, height: 96, mb: 2, border: '3px solid #1976d2'}}
                            >
                                {customer.name?.charAt(0)}
                            </Avatar>
                        </Badge>
                        <MuiTypography variant="h5" sx={{fontWeight: 700, color: '#1976d2', mb: 1, textAlign: 'center'}}>
                            {customer.name}
                        </MuiTypography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                            <Rating 
                                value={profileData?.rating || 0} 
                                precision={0.1} 
                                readOnly 
                                size="small"
                                icon={<StarIcon fontSize="inherit"/>}
                            />
                            <MuiTypography variant="body2" sx={{color: '#f59e0b', fontWeight: 600}}>
                                {profileData?.rating?.toFixed(1) || 0}
                            </MuiTypography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Chip
                                label={account.status === 'active' ? 'Active' : 'Inactive'}
                                color={account.status === 'active' ? 'success' : 'error'}
                                size="small"
                                sx={{fontWeight: 600}}
                            />
                            <Chip label={account.role} color="primary" size="small"/>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Basic Information */}
                    <Box>
                        <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                            Basic Information
                        </MuiTypography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <EmailIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                    {account.email}
                                </MuiTypography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <PhoneIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                    {customer.phone}
                                </MuiTypography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <HomeIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                    {customer.address}
                                </MuiTypography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <BusinessIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                    {customer.business}
                                </MuiTypography>
                            </Box>
                            {customer.taxCode && (
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <TaxIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                    <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                        Tax Code: {customer.taxCode}
                                    </MuiTypography>
                                </Box>
                            )}
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <AssignmentIndIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                    Registered: {account.registerDate}
                                </MuiTypography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Working Hours */}
                    {profileData?.startTime && profileData?.endTime && (
                        <>
                            <Divider />
                            <Box>
                                <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                    Working Hours
                                </MuiTypography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <WorkIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                    <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                        {profileData.startTime} - {profileData.endTime}
                                    </MuiTypography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Deposit Percentage for Garment */}
                    {account.role === 'garment' && profileData?.depositPercentage !== undefined && (
                        <>
                            <Divider />
                            <Box>
                                <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                    Payment Terms
                                </MuiTypography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                        Deposit Required: {profileData.depositPercentage}%
                                    </MuiTypography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Shipping UID for Garment */}
                    {account.role === 'garment' && profileData?.shippingUID && (
                        <>
                            <Divider />
                            <Box>
                                <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                    Shipping Information
                                </MuiTypography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <LocalShippingIcon sx={{color: '#1976d2', fontSize: 20}}/>
                                    <MuiTypography variant="body2" sx={{color: '#1e293b', fontWeight: 500}}>
                                        Shipping UID: {profileData.shippingUID}
                                    </MuiTypography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {/* Thumbnails */}
                    {profileData?.thumbnails && profileData.thumbnails.length > 0 && (
                        <>
                            <Divider />
                            <Box>
                                <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                    Portfolio
                                </MuiTypography>
                                <Carousel autoplay dots={true} infinite={true}>
                                    {profileData.thumbnails.map((thumbnail, index) => (
                                        <Box key={index} sx={{textAlign: 'center', p: 2}}>
                                            <DisplayImage
                                                imageUrl={thumbnail}
                                                alt={`Portfolio ${index + 1}`}
                                                width="100%"
                                                height="200px"
                                                style={{objectFit: 'cover', borderRadius: '8px'}}
                                            />
                                        </Box>
                                    ))}
                                </Carousel>
                            </Box>
                        </>
                    )}

                    {/* Feedbacks */}
                    {feedbacks.length > 0 && (
                        <>
                            <Divider />
                            <Box>
                                <MuiTypography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                    Customer Feedbacks ({feedbacks.length})
                                </MuiTypography>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    {feedbacks.slice(0, 3).map((feedback, index) => (
                                        <Paper key={feedback.id} elevation={0} sx={{
                                            p: 2,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2
                                        }}>
                                            {/* Feedback Header */}
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                                <Avatar
                                                    src={feedback.sender.avatar}
                                                    alt={feedback.sender.name}
                                                    sx={{width: 32, height: 32}}
                                                >
                                                    {feedback.sender.name.charAt(0)}
                                                </Avatar>
                                                <Box sx={{flex: 1}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap'}}>
                                                        <MuiTypography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                                                            {feedback.sender.name}
                                                        </MuiTypography>
                                                        <MuiTypography variant="body2" sx={{color: '#64748b', fontWeight: 400}}>
                                                            from
                                                        </MuiTypography>
                                                        <MuiTypography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>
                                                            {feedback.sender.business}
                                                        </MuiTypography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                        <Rating 
                                                            value={feedback.rating} 
                                                            readOnly 
                                                            size="small"
                                                            icon={<StarIcon fontSize="inherit"/>}
                                                        />
                                                        <MuiTypography variant="caption" sx={{color: '#64748b'}}>
                                                            {feedback.creationDate}
                                                        </MuiTypography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Feedback Content */}
                                            <MuiTypography variant="body2" sx={{mb: 2, color: '#1e293b'}}>
                                                {feedback.content}
                                            </MuiTypography>

                                            {/* Media (Images and Video) */}
                                            {(feedback.images?.length > 0 || feedback.video) && (
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                                    {feedback.images?.map((image, imgIndex) => (
                                                        <DisplayImage
                                                            key={imgIndex}
                                                            imageUrl={image}
                                                            alt={`Feedback image ${imgIndex + 1}`}
                                                            width="80px"
                                                            height="80px"
                                                            style={{objectFit: 'cover', borderRadius: '4px'}}
                                                        />
                                                    ))}
                                                    {feedback.video && (
                                                        <Box sx={{
                                                            position: 'relative',
                                                            width: '80px',
                                                            height: '80px',
                                                            backgroundColor: '#f1f5f9',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            border: '1px solid #e2e8f0'
                                                        }} onClick={() => window.open(feedback.video, '_blank')}>
                                                            <PlayArrowIcon sx={{color: '#1976d2', fontSize: 32}} />
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                    {feedbacks.length > 3 && (
                                        <MuiTypography variant="body2" sx={{textAlign: 'center', color: '#64748b'}}>
                                            ... and {feedbacks.length - 3} more feedback{feedbacks.length - 3 > 1 ? 's' : ''}
                                        </MuiTypography>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </Modal>
    );
};

export default function FindingDesignerPopup({visible, onCancel, request}) {
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [showDesigners, setShowDesigners] = useState(false);
    const [extraRevision, setExtraRevision] = useState(0);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [appliedDesigners, setAppliedDesigners] = useState([]);
    const [showRequestDetail, setShowRequestDetail] = useState(false);
    const [sortCriteria, setSortCriteria] = useState([]);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileDesigner, setProfileDesigner] = useState(null);
    const [selectedImages, setSelectedImages] = useState(null);
    const [imageDialogVisible, setImageDialogVisible] = useState(false);
    const [businessConfig, setBusinessConfig] = useState(null);

    // Fetch business configuration on component mount
    useEffect(() => {
        const fetchBusinessConfig = async () => {
            try {
                const response = await getConfigByKey(configKey.business);
                if (response?.status === 200 && response.data?.body?.business) {
                    setBusinessConfig(response.data.body.business);
                }
            } catch (error) {
                console.error('Error fetching business config:', error);
            }
        };

        fetchBusinessConfig();
    }, []);

    // Service fee calculation using API config
    const calculateServiceFee = useCallback((amount) => {
        if (!businessConfig?.serviceRate) return 0;
        return Math.round(amount * businessConfig.serviceRate);
    }, [businessConfig]);

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
        const fee = calculateServiceFee(base + extra);
        return Math.round(base + extra + fee);
    }, [selectedDesigner, isUnlimitedRevisions, extraRevisionCost, calculateServiceFee]);
    
    const baseAndExtra = useMemo(() => {
        const base = selectedDesigner?.price || 0;
        const extra = isUnlimitedRevisions ? 0 : extraRevisionCost;
        return {base, extra};
    }, [selectedDesigner, isUnlimitedRevisions, extraRevisionCost]);
    
    const feeAmount = useMemo(() => calculateServiceFee(baseAndExtra.base + baseAndExtra.extra), [baseAndExtra, calculateServiceFee]);
    const exceedsCap = totalCost > (businessConfig?.maxPay || 200000000);

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
        } catch {
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('designerSortCriteria', JSON.stringify(sortCriteria));
        } catch {
        }
    }, [sortCriteria]);

    const handleQuotationSelect = useCallback((designerId) => {
        const quotation = appliedDesigners.find(d => d.id === designerId);
        if (quotation) {
            setSelectedQuotation({designerId, quotationId: designerId});
            setPaymentDetails({quotation, request});
            setError(null);

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
            const total = Math.round(basePrice + extraCost + calculateServiceFee(basePrice + extraCost));
            if (total > (businessConfig?.maxPay || 200000000)) {
                setError(`Total amount cannot exceed ${(businessConfig?.maxPay || 200000000).toLocaleString('vi-VN')} VND. Please reduce extra revisions.`);
                return;
            }

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
    }, [selectedQuotation, appliedDesigners, extraRevision, handleOpenPaymentModal, businessConfig]);

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
            const next = values.map(key => ({key, order: prevMap.get(key) || DEFAULT_SORT_ORDER[key] || 'asc'}));
            return next;
        });
    }, []);

    const handleToggleSortOrder = useCallback((key) => {
        setSortCriteria(prev => prev.map(c => c.key === key ? {...c, order: c.order === 'asc' ? 'desc' : 'asc'} : c));
    }, []);

    const handleResetSort = useCallback(() => {
        setSortCriteria([]);
        try {
            localStorage.removeItem('designerSortCriteria');
        } catch {
        }
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

    if (!request) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                    gap: 2
                }}>
                    <Spin size="large"/>
                    <Typography.Text style={{color: '#64748b'}}>
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
                        icon={isProcessing ? <Spin size="small"/> : <CheckCircleOutlined/>}
                        style={{
                            backgroundColor: !selectedQuotation || isProcessing || exceedsCap ? '#d1d5db' : '#2e7d32',
                            color: 'white',
                            borderColor: !selectedQuotation || isProcessing || exceedsCap ? '#d1d5db' : '#2e7d32',
                            cursor: !selectedQuotation || isProcessing || exceedsCap ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Selection'}
                    </Button>,
                ];
            default:
                return null;
        }
    }, [onCancel, handleConfirmSelection, selectedQuotation, isProcessing, exceedsCap, businessConfig]);

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
                            <Box style={{display: 'flex', gap: 8}}>
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
                        {showDesigners && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap'}}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Sort by (priority left → right)"
                                    style={{minWidth: 360}}
                                    value={sortCriteria.map(c => c.key)}
                                    onChange={handleSortChange}
                                    options={[
                                        {label: 'Rating', value: 'rating'},
                                        {label: 'Valid until', value: 'acceptanceDeadline'},
                                        {label: 'Delivery time', value: 'deliveryWithIn'},
                                        {label: 'Revisions', value: 'revisionTime'},
                                        {label: 'Price', value: 'price'}
                                    ]}
                                />
                                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
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
                                            sx={{cursor: 'pointer', height: 26}}
                                        />
                                    ))}
                                </Box>
                                <Button onClick={handleResetSort} type="default">
                                    Reset sort
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {showRequestDetail && (
                        <Box sx={{
                            mb: 3,
                            p: 3,
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            width: '100%'
                        }}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                alignItems: 'center',
                                gap: 2,
                                mb: 2
                            }}>
                                {request.logoImage && (
                                    <DisplayImage imageUrl={request.logoImage} alt="School logo" width={56}
                                                  height={56}/>
                                )}
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
                                        <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                            {request.name}
                                        </Typography.Title>
                                        <Tag color="green">{parseID(request.id, 'dr')}</Tag>
                                        <Tag color="geekblue">Status: {request.status}</Tag>
                                        <Tag
                                            color={request.privacy ? 'blue' : 'default'}>{request.privacy ? 'Private' : 'Public'}</Tag>
                                        <Tag color="purple">Created: {formatDate(request.creationDate)}</Tag>
                                    </Box>
                                </Box>
                            </Box>

                            {boyItems.length > 0 && (
                                <Box sx={{mb: 2}}>
                                    <Typography.Title level={5}
                                                      style={{margin: 0, color: '#1e293b'}}>Boy</Typography.Title>
                                    <Box sx={{mt: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2}}>
                                        {boyItems.map((item) => (
                                            <Paper key={item.id} elevation={0} sx={{
                                                p: 2,
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: "max-content",
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5}}>
                                                    <Box sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: item.color,
                                                        border: '1px solid #e2e8f0',
                                                        mt: '6px',
                                                        flexShrink: 0
                                                    }}/>
                                                    <Typography.Title level={5} style={{
                                                        margin: 0,
                                                        color: '#1e293b',
                                                        fontSize: '14px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {item.type} - {(item.category === 'pe' ? 'physical education' : item.category)}
                                                    </Typography.Title>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    mb: 1.5,
                                                    minHeight: 120
                                                }}>
                                                    {(item.sampleImages && item.sampleImages.length > 0) ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                            <DisplayImage
                                                                imageUrl={item.sampleImages[0].url}
                                                                alt="Sample"
                                                                width="100px"
                                                                height="100px"
                                                                style={{objectFit: 'cover', borderRadius: '8px'}}
                                                            />
                                                            <Button 
                                                                size="small" 
                                                                type="primary"
                                                                onClick={() => {
                                                                    setSelectedImages(item.sampleImages);
                                                                    setImageDialogVisible(true);
                                                                }}
                                                                style={{ fontSize: '10px', height: '24px' }}
                                                            >
                                                                View Reference Images ({item.sampleImages.length})
                                                            </Button>
                                                        </Box>
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
                                                            <Typography.Text
                                                                style={{color: '#64748b', fontSize: '12px'}}>
                                                                No reference image
                                                            </Typography.Text>
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: 0.5, 
                                                    mb: 1,
                                                    p: 1,
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: 1,
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <Tag color="success" style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        backgroundColor: '#f5f5f5',
                                                        border: '1px solid #d9d9d9'
                                                    }}>Fabric: {item.fabricName}</Tag>
                                                    <Tag color="gold" style={{
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            backgroundColor: '#f5f5f5',
                                                            border: '1px solid #d9d9d9'
                                                        }}>
                                                            Logo: {item.logoPosition || 'N/A'}
                                                        </Tag>
                                                    <Tag color="default" style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        backgroundColor: '#f5f5f5',
                                                        border: '1px solid #d9d9d9'
                                                    }}>
                                                        Note: {item.note || 'N/A'}
                                                    </Tag>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {girlItems.length > 0 && (
                                <Box sx={{mb: 2}}>
                                    <Typography.Title level={5}
                                                      style={{margin: 0, color: '#1e293b'}}>Girl</Typography.Title>
                                    <Box sx={{mt: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2}}>
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
                                                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5}}>
                                                    <Box sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: item.color,
                                                        border: '1px solid #e2e8f0',
                                                        mt: '6px',
                                                        flexShrink: 0
                                                    }}/>
                                                    <Typography.Title level={5} style={{
                                                        margin: 0,
                                                        color: '#1e293b',
                                                        fontSize: '14px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {item.type} - {(item.category === 'pe' ? 'physical education' : item.category)}
                                                    </Typography.Title>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    mb: 1.5,
                                                    minHeight: 120
                                                }}>
                                                    {(item.sampleImages && item.sampleImages.length > 0) ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                            <DisplayImage
                                                                imageUrl={item.sampleImages[0].url}
                                                                alt="Sample"
                                                                width="100px"
                                                                height="100px"
                                                                style={{objectFit: 'cover', borderRadius: '8px'}}
                                                            />
                                                            <Button 
                                                                size="small" 
                                                                type="primary"
                                                                onClick={() => {
                                                                    setSelectedImages(item.sampleImages);
                                                                    setImageDialogVisible(true);
                                                                }}
                                                                style={{ fontSize: '10px', height: '24px' }}
                                                            >
                                                                View Reference Images ({item.sampleImages.length})
                                                            </Button>
                                                        </Box>
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
                                                            <Typography.Text
                                                                style={{color: '#64748b', fontSize: '12px'}}>
                                                                No reference image
                                                            </Typography.Text>
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1}}>
                                                    <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                                        <Tag color="pink" style={{
                                                            fontSize: '10px',
                                                            padding: '2px 6px'
                                                        }}>{item.gender}</Tag>
                                                        <Tag color="success" style={{
                                                            fontSize: '10px',
                                                            padding: '2px 6px'
                                                        }}>{item.fabricName}</Tag>
                                                        {item.logoPosition && (
                                                            <Tag color="gold" style={{
                                                                fontSize: '10px',
                                                                padding: '2px 6px',
                                                                alignSelf: 'flex-start'
                                                            }}>
                                                                Logo: {item.logoPosition}
                                                            </Tag>
                                                        )}
                                                    </Box>

                                                </Box>

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

                    {showDesigners && (
                        <>
                            {sortedDesigners.length > 0 ? (
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                    gap: 3
                                }}>
                                    {sortedDesigners.map((designer, index) => (
                                        <Box key={index} sx={{minWidth: 0}}>
                                            <DesignerCard
                                                designer={designer}
                                                isSelected={selectedQuotation && selectedQuotation.designerId === designer.id}
                                                onSelect={handleQuotationSelect}
                                                onViewProfile={designerObj => {
                                                    setProfileDesigner(designerObj);
                                                    setProfileModalOpen(true);
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{
                                    p: 6,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '2px dashed #cbd5e1',
                                    textAlign: 'center'
                                }}>
                                    <UserOutlined
                                        style={{fontSize: 64, marginBottom: 24, opacity: 0.5, color: '#64748b'}}/>
                                    <Typography.Title level={4}
                                                      style={{margin: '0 0 16px 0', color: '#475569', fontWeight: 600}}>
                                        No Applied Designers
                                    </Typography.Title>
                                    <Typography.Text style={{
                                        color: '#64748b',
                                        maxWidth: '400px',
                                        margin: '0 auto',
                                        display: 'block'
                                    }}>
                                        No designers have applied to this request yet. Check back later for updates or
                                        consider adjusting your request requirements.
                                    </Typography.Text>
                                </Box>
                            )}
                        </>
                    )}

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
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 2,
                                                mb: 2
                                            }}>
                                                <CheckCircleOutlined style={{color: '#16a34a', fontSize: '20px'}}/>
                                                <Typography.Title level={5} style={{margin: 0, color: '#166534'}}>
                                                    Unlimited Revisions Included
                                                </Typography.Title>
                                            </Box>
                                            <Typography.Text style={{color: '#166534', fontSize: '14px'}}>
                                                This quotation already includes unlimited revisions. No additional
                                                revisions needed.
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

                                        <Box sx={{p: 3}}>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
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
                                                                style={{
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                ₫
                                                            </Typography.Text>
                                                        </Box>
                                                        <Typography.Text
                                                            style={{
                                                                fontSize: '13px',
                                                                color: '#0c4a6e',
                                                                fontWeight: 600
                                                            }}>
                                                            Pricing Information
                                                        </Typography.Text>
                                                    </Box>
                                                    <Typography.Text style={{fontSize: '12px', color: '#0369a1'}}>
                                                        Each additional revision
                                                        costs <strong>{selectedDesigner?.extraRevisionPrice?.toLocaleString('vi-VN')} VND</strong>
                                                    </Typography.Text>
                                                </Box>

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
                                                            style={{
                                                                fontSize: '14px',
                                                                color: '#475569',
                                                                fontWeight: 500
                                                            }}>
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

                                                {extraRevision > 0 && (
                                                    <Box sx={{
                                                        backgroundColor: 'white',
                                                        borderRadius: 3,
                                                        border: '1px solid #e2e8f0',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                                    }}>
                                                        <Box sx={{
                                                            p: 2,
                                                            backgroundColor: '#fef3c7',
                                                            borderBottom: '1px solid #f59e0b',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
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

                                                        <Box sx={{p: 3}}>
                                                            <Box
                                                                sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
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

                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f0fdf4',
                                                                    borderRadius: 2,
                                                                    border: '1px solid #bbf7d0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 2
                                                                    }}>
                                                                        <CheckCircleOutlined style={{
                                                                            color: '#16a34a',
                                                                            fontSize: '14px'
                                                                        }}/>
                                                                        <Typography.Text style={{
                                                                            color: '#166534',
                                                                            fontSize: '12px',
                                                                            fontWeight: 500
                                                                        }}>
                                                                            {extraRevision} additional
                                                                            revision{extraRevision > 1 ? 's' : ''} selected
                                                                        </Typography.Text>
                                                                    </Box>
                                                                    <Typography.Text style={{
                                                                        color: '#059669',
                                                                        fontSize: '13px',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {selectedDesigner?.extraRevisionPrice?.toLocaleString('vi-VN')} VND
                                                                        each
                                                                    </Typography.Text>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Box sx={{
                                                    p: 2.5,
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: 2,
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <Typography.Text style={{fontWeight: 700, color: '#1e293b'}}>
                                                        Payment Summary
                                                    </Typography.Text>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                                        <Typography.Text style={{color: '#475569'}}>Base
                                                            price</Typography.Text>
                                                        <Typography.Text style={{color: '#1e293b', fontWeight: 600}}>
                                                            {baseAndExtra.base.toLocaleString('vi-VN')} VND
                                                        </Typography.Text>
                                                    </Box>
                                                    {!isUnlimitedRevisions && (
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            mt: 0.5
                                                        }}>
                                                            <Typography.Text style={{color: '#475569'}}>Extra
                                                                revisions</Typography.Text>
                                                            <Typography.Text
                                                                style={{color: '#1e293b', fontWeight: 600}}>
                                                                {baseAndExtra.extra.toLocaleString('vi-VN')} VND
                                                            </Typography.Text>
                                                        </Box>
                                                    )}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        mt: 0.5
                                                    }}>
                                                        <Typography.Text style={{color: '#475569'}}>
                                                            Service fee {businessConfig?.serviceRate ? `(${(businessConfig.serviceRate * 100).toFixed(0)}% total)` : ''}
                                                        </Typography.Text>
                                                        <Typography.Text style={{color: '#1e293b', fontWeight: 600}}>
                                                            {feeAmount.toLocaleString('vi-VN')} VND
                                                        </Typography.Text>
                                                    </Box>
                                                    <Divider sx={{my: 1}}/>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Typography.Text style={{
                                                            color: '#1e293b',
                                                            fontWeight: 700
                                                        }}>Total</Typography.Text>
                                                        <Typography.Title level={4}
                                                                          style={{margin: 0, color: '#16a34a'}}>
                                                            {totalCost.toLocaleString('vi-VN')} VND
                                                        </Typography.Title>
                                                    </Box>
                                                    {exceedsCap && (
                                                        <Typography.Text style={{color: '#dc2626', fontSize: 12}}>
                                                            Total exceeds the maximum allowed (200,000,000 VND). Please
                                                            reduce extra revisions.
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
            <DesignerProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)}
                                  designer={profileDesigner}/>
            
            {/* Image Dialog */}
            <Modal
                title="Sample Images"
                open={imageDialogVisible}
                onCancel={() => setImageDialogVisible(false)}
                footer={null}
                width={800}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    {selectedImages?.map((image, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <DisplayImage
                                imageUrl={image.url}
                                alt={`Sample ${index + 1}`}
                                width="200px"
                                height="200px"
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <Typography.Text style={{ 
                                display: 'block', 
                                marginTop: '8px', 
                                fontSize: '12px',
                                color: '#64748b'
                            }}>
                                Image {index + 1}
                            </Typography.Text>
                        </Box>
                    ))}
                </Box>
            </Modal>
        </Modal>
    );
}