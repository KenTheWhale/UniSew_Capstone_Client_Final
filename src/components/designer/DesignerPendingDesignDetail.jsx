import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import {ColorPicker} from 'antd';
import {
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Checkroom as CheckroomIcon,
    DesignServices,
    Info as InfoIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    SportsEsports as SportsIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {createDesignQuotation} from "../../services/DesignService.jsx";
import {enqueueSnackbar} from "notistack";
import DisplayImage from "../ui/DisplayImage.jsx";

// Simplified Status chip component
const StatusChip = ({status}) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    color: '#1976d2',
                    bgColor: '#e3f2fd',
                    icon: <AssignmentIcon sx={{fontSize: 16}}/>,
                    label: 'Pending'
                };
            case 'processing':
                return {
                    color: '#9c27b0',
                    bgColor: '#f3e5f5',
                    icon: <TrendingUpIcon sx={{fontSize: 16}}/>,
                    label: 'Processing'
                };
            case 'completed':
                return {
                    color: '#2e7d32',
                    bgColor: '#e8f5e8',
                    icon: <CheckCircleIcon sx={{fontSize: 16}}/>,
                    label: 'Completed'
                };
            case 'canceled':
                return {
                    color: '#d32f2f',
                    bgColor: '#ffebee',
                    icon: <CancelIcon sx={{fontSize: 16}}/>,
                    label: 'Cancelled'
                };
            default:
                return {
                    color: '#757575',
                    bgColor: '#f5f5f5',
                    icon: <InfoIcon sx={{fontSize: 16}}/>,
                    label: status
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            sx={{
                backgroundColor: config.bgColor,
                color: config.color,
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '6px 12px',
                transition: 'all 0.3s ease',
                '& .MuiChip-icon': {
                    color: config.color,
                    transition: 'all 0.3s ease'
                },
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            }}
        />
    );
};

export default function DesignerPendingDesignDetail({visible, onCancel, request}) {
    const [regularDialogOpen, setRegularDialogOpen] = React.useState(false);
    const [physicalDialogOpen, setPhysicalDialogOpen] = React.useState(false);
    const [showQuotationForm, setShowQuotationForm] = React.useState(false);
    const [imageViewer, setImageViewer] = React.useState({ open: false, title: '', images: [], mode: 'reference' });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Quotation form state
    const [quotationData, setQuotationData] = React.useState({
        note: '',
        deliveryWithIn: '',
        revisionTime: '',
        extraRevisionPrice: '',
        price: '',
        acceptanceDeadline: ''
    });
// Function to get appropriate icon based on item type
    const getItemIcon = (itemType) => {
        const type = itemType?.toLowerCase() || '';

        if (type.includes('shirt') || type.includes('áo')) {
            return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
        } else if (type.includes('pant') || type.includes('quần')) {
            return <PiPantsFill style={{fontSize: '20px'}}/>;
        } else if (type.includes('skirt') || type.includes('váy')) {
            return <GiSkirt style={{fontSize: '20px'}}/>;
        } else if (type.includes('dress') || type.includes('đầm')) {
            return <CheckroomIcon/>;
        } else if (type.includes('jacket') || type.includes('áo khoác')) {
            return <CheckroomIcon/>;
        } else if (type.includes('sport') || type.includes('thể thao')) {
            return <SportsIcon/>;
        } else {
            return <CheckroomIcon/>;
        }
    };

    // Function to render color with picker
    const renderColorWithPicker = (colorHex, themeColor) => {
        return (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: themeColor
                }}/>
                <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>
                    Color (Hex):
                </Typography>
                <Typography variant="body2" sx={{color: '#374151'}}>
                    {colorHex}
                </Typography>
                <ColorPicker
                    value={colorHex}
                    disabled
                    size="small"
                    format="hex"
                />
            </Box>
        );
    };

    if (!request) {
        return (
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent sx={{textAlign: 'center', py: 4}}>
                    <CircularProgress size={40} sx={{color: '#7c3aed', mb: 2}}/>
                    <Typography variant="h6" sx={{color: '#1e293b', fontWeight: 700, mb: 1}}>
                        Loading Request Details...
                    </Typography>
                    <Typography variant="body2" sx={{color: '#64748b'}}>
                        Please wait while we fetch the request information
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    const handleAcceptRequest = () => {
        setIsSubmitting(true);
        const isUnlimitedRevisions = parseInt(quotationData.revisionTime) === 9999;
        if (!quotationData.price || !quotationData.deliveryWithIn || !quotationData.revisionTime || !quotationData.acceptanceDeadline || (!isUnlimitedRevisions && !quotationData.extraRevisionPrice)) {
            setShowQuotationForm(true);
            setIsSubmitting(false);
            return;
        }

        const data = {
            designRequestId: request.id,
            note: quotationData.note,
            deliveryWithIn: parseInt(quotationData.deliveryWithIn),
            revisionTime: parseInt(quotationData.revisionTime),
            extraRevisionPrice: parseFloat(quotationData.extraRevisionPrice) || 0,
            price: parseFloat(quotationData.price),
            acceptanceDeadline: quotationData.acceptanceDeadline
        }

        createDesignQuotation(data).then(res => {
            if (res && res.status === 201) {
                enqueueSnackbar(res.data.message, {variant: "success", autoHideDuration: 1000})
                setTimeout(() => {
                    onCancel()
                    // Reload the page after successful quotation creation
                    window.location.reload()
                }, 1000)
            }
        }).catch((e) => {
            enqueueSnackbar(e.response.data.message, {variant: "error", autoHideDuration: 1000})
        }).finally(() => setIsSubmitting(false))
    };

    const handleQuotationSubmit = () => {
        setIsSubmitting(true);
        const isUnlimitedRevisions = parseInt(quotationData.revisionTime) === 9999;
        const isPriceAtCap = parseFloat(quotationData.price) >= 200000000;
        if (quotationData.price && quotationData.deliveryWithIn && quotationData.revisionTime && quotationData.acceptanceDeadline && (isUnlimitedRevisions || isPriceAtCap || quotationData.extraRevisionPrice)) {
            const selectedDate = new Date(quotationData.acceptanceDeadline);
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            tomorrow.setHours(0, 0, 0, 0);

            if (selectedDate < tomorrow) {
                enqueueSnackbar('Acceptance deadline must be at least 1 day from today', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseFloat(quotationData.price) < 10000) {
                enqueueSnackbar('Price must be at least 10.000 VND', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseFloat(quotationData.price) > 200000000) {
                enqueueSnackbar('Price cannot exceed 200.000.000 VND', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseInt(quotationData.deliveryWithIn) <= 0) {
                enqueueSnackbar('Delivery time must be greater than 0', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseInt(quotationData.deliveryWithIn) >= 100) {
                enqueueSnackbar('Delivery time must be less than 100 days', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseInt(quotationData.revisionTime) <= 0) {
                enqueueSnackbar('Revision time must be greater than 0', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            if (parseInt(quotationData.revisionTime) >= 10000) {
                enqueueSnackbar('Revision time must be less than 10,000', {variant: 'error'});
                setIsSubmitting(false);
                return;
            }

            // Validate extra revision price when not unlimited
            if (!isUnlimitedRevisions && !isPriceAtCap) {
                if (parseFloat(quotationData.extraRevisionPrice) < 10000) {
                    enqueueSnackbar('Extra revision price must be at least 10.000 VND', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
                
                const combined = parseFloat(quotationData.price || '0') + parseFloat(quotationData.extraRevisionPrice || '0');
                if (combined > 200000000) {
                    enqueueSnackbar('Price + Extra revision must be ≤ 200.000.000 VND', {variant: 'error'});
                    setIsSubmitting(false);
                    return;
                }
            }

            // Force extra revision to 0 at price cap
            if (isPriceAtCap) {
                quotationData.extraRevisionPrice = '0';
            }
            handleAcceptRequest();
        }
        else {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const calculateDaysFromRequest = (dateString) => {
        const requestDate = new Date(dateString);
        const today = new Date();
        
        // Reset time to start of day for accurate calculation
        requestDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const timeDiff = today.getTime() - requestDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff;
    };
// Use existing request data
    const mergedRequestData = request;

    // Helper function to get items by category
    const getItemsByCategory = (category) => {
        return mergedRequestData.items?.filter(item => item.category === category) || [];
    };

    // Helper function to render sample images
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
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    color: 'white',
                    p: 3,
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Avatar sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            width: 48,
                            height: 48
                        }}>
                            <AssignmentIcon sx={{fontSize: 24}}/>
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>
                                Design Request Details
                            </Typography>
                            <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 500}}>
                                {parseID(mergedRequestData.id, 'dr')}
                            </Typography>
                        </Box>
                    </Box>
                    <StatusChip status={mergedRequestData.status}/>
                </Box>

                {/* Content */}
                <DialogContent sx={{p: 0, overflow: 'auto'}}>
                    <Container maxWidth={false} sx={{p: 3}}>
                        <Grid container spacing={3} sx={{display: 'flex'}}>
                            {/* Main Information */}
                            <Grid sx={{flex: 2}}>
                                {/* Request Information Card */}
                                <Card sx={{
                                    mb: 3,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-2px)',
                                        background: 'rgba(255, 255, 255, 0.95)'
                                    }
                                }}>
                                    <Box sx={{
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <StarIcon sx={{color: '#7c3aed', fontSize: 18, transition: 'all 0.3s ease'}}/>
                                        <Typography variant="h6" sx={{
                                            color: '#7c3aed',
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            Request Information
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        <Grid container spacing={2} sx={{display: 'flex'}}>
                                            <Grid sx={{flex: 1}}>
                                                <Box sx={{
                                                    p: 2,
                                                    background: 'rgba(248, 249, 250, 0.8)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(233, 236, 239, 0.5)',
                                                    textAlign: 'center',
                                                    backdropFilter: 'blur(5px)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(240, 240, 240, 0.9)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}>
                                                    <SchoolIcon sx={{
                                                        color: '#666',
                                                        fontSize: 24,
                                                        mb: 1,
                                                        transition: 'all 0.3s ease'
                                                    }}/>
                                                    <Typography variant="body2" sx={{
                                                        color: '#666',
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        School Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {mergedRequestData.school?.business || mergedRequestData.school?.name || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid sx={{flex: 1}}>
                                                <Box sx={{
                                                    p: 2,
                                                    background: 'rgba(248, 249, 250, 0.8)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(233, 236, 239, 0.5)',
                                                    textAlign: 'center',
                                                    backdropFilter: 'blur(5px)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(240, 240, 240, 0.9)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}>
                                                    <DesignServices sx={{
                                                        color: '#666',
                                                        fontSize: 24,
                                                        mb: 1,
                                                        transition: 'all 0.3s ease'
                                                    }}/>
                                                    <Typography variant="body2" sx={{
                                                        color: '#666',
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        Design Name
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {mergedRequestData.name || 'Uniform Design'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Grid container spacing={2} sx={{display: 'flex', mt: 2}}>
                                            <Grid sx={{flex: 1}}>
                                                <Box sx={{
                                                    p: 2,
                                                    background: 'rgba(248, 249, 250, 0.8)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(233, 236, 239, 0.5)',
                                                    textAlign: 'center',
                                                    backdropFilter: 'blur(5px)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(240, 240, 240, 0.9)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}>
                                                    <CalendarIcon sx={{
                                                        color: '#666',
                                                        fontSize: 24,
                                                        mb: 1,
                                                        transition: 'all 0.3s ease'
                                                    }}/>
                                                    <Typography variant="body2" sx={{
                                                        color: '#666',
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        Request Date
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {formatDate(mergedRequestData.date || mergedRequestData.creationDate)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: '#667eea',
                                                        fontWeight: 600,
                                                        display: 'block',
                                                        mt: 0.5
                                                    }}>
                                                        {(() => {
                                                            const days = calculateDaysFromRequest(mergedRequestData.date || mergedRequestData.creationDate);
                                                            if (days === 0) {
                                                                return 'Today';
                                                            } else if (days === 1) {
                                                                return '1 day ago';
                                                            } else if (days > 1) {
                                                                return `${days} days ago`;
                                                            } else {
                                                                return `${Math.abs(days)} days from now`;
                                                            }
                                                        })()}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Project Details Card */}
                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-2px)',
                                        background: 'rgba(255, 255, 255, 0.95)'
                                    }
                                }}>
                                    <Box sx={{
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <BusinessIcon
                                            sx={{color: '#7c3aed', fontSize: 18, transition: 'all 0.3s ease'}}/>
                                        <Typography variant="h6" sx={{
                                            color: '#7c3aed',
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            Request Details
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        {/* Design Name moved to Request Information; Number of Items removed */}
                                        <Grid container spacing={2}>
                                            {/* Clothing Items Details */}
                                            <Grid sx={{flex: 1}}>
                                                <Box sx={{
                                                    p: 2,
                                                    mt: 2,
                                                    background: 'rgba(248, 249, 250, 0.8)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(233, 236, 239, 0.5)',
                                                    transition: 'all 0.3s ease',
                                                    backdropFilter: 'blur(5px)',
                                                    '&:hover': {
                                                        background: 'rgba(240, 240, 240, 0.9)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}>
                                                    <Typography variant="body1" sx={{
                                                        color: '#333',
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        transition: 'all 0.3s ease',
                                                        width: '100%'
                                                    }}>
                                                        Design Items:
                                                    </Typography>

                                                    {/* Uniform Type Buttons */}
                                                    <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => setRegularDialogOpen(true)}
                                                            sx={{
                                                                flex: 1,
                                                                height: 120,
                                                                borderRadius: 3,
                                                                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                                                color: 'white',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'translateY(-3px)',
                                                                    boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)'
                                                                }
                                                            }}
                                                        >
                                                            <SchoolIcon sx={{fontSize: 32}}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                Regular Uniform
                                                            </Typography>
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            onClick={() => setPhysicalDialogOpen(true)}
                                                            sx={{
                                                                flex: 1,
                                                                height: 120,
                                                                borderRadius: 3,
                                                                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                                                color: 'white',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'translateY(-3px)',
                                                                    boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)'
                                                                }
                                                            }}
                                                        >
                                                            <PersonIcon sx={{fontSize: 32}}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                Physical Education
                                                            </Typography>
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Enhanced Sidebar */}
                            <Grid sx={{flex: 1}}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    color: '#1e293b',
                                    height: 'fit-content',
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(124, 58, 237, 0.15)'
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                        p: 2,
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '8px 8px 0 0'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            color: 'white'
                                        }}>
                                            Wanna apply this request ?
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            opacity: 0.9,
                                            textAlign: 'center',
                                            mt: 0.5,
                                            transition: 'all 0.3s ease',
                                            color: 'white'
                                        }}>
                                            Provide your quotation
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        {!showQuotationForm ? (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={<CheckCircleIcon/>}
                                                    onClick={handleAcceptRequest}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                                        color: 'white',
                                                        border: '1px solid rgba(124, 58, 237, 0.3)',
                                                        py: 1.5,
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(124, 58, 237, 0.3)',
                                                            color: 'rgba(255, 255, 255, 0.5)'
                                                        }
                                                    }}
                                                >
                                                    Create Quotation
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                                {/* Price Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Price (VND) *
                                                    </Typography>
                                                    <TextField
                                                        type="text"
                                                        value={quotationData.price ? parseFloat(quotationData.price).toLocaleString('vi-VN') : ''}
                                                        onChange={(e) => {
                                                            const numericValue = e.target.value.replace(/[^\d]/g, '');
                                                            const isMaxCap = parseFloat(numericValue) >= 200000000;
                                                            setQuotationData({
                                                                ...quotationData,
                                                                price: numericValue,
                                                                extraRevisionPrice: isMaxCap ? '0' : quotationData.extraRevisionPrice
                                                            });
                                                        }}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter price in VND (min: 10,000, max: 200,000,000)"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& input': {
                                                                    color: '#1e293b'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Delivery Time Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Delivery Time (Days) *
                                                    </Typography>
                                                    <TextField
                                                        type="number"
                                                        value={quotationData.deliveryWithIn}
                                                        onChange={(e) => setQuotationData({
                                                            ...quotationData,
                                                            deliveryWithIn: e.target.value
                                                        })}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter delivery time in days (1-99)"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& input': {
                                                                    color: '#1e293b'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Revision Time Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Revision Time *
                                                    </Typography>
                                                    <TextField
                                                        type="number"
                                                        value={quotationData.revisionTime}
                                                        onChange={(e) => {
                                                            let value = e.target.value;
                                                            if (parseInt(value) > 9999) {
                                                                value = '9999';
                                                            }
                                                            setQuotationData({
                                                                ...quotationData,
                                                                revisionTime: value,
                                                                extraRevisionPrice: parseInt(value) === 9999 ? '0' : quotationData.extraRevisionPrice
                                                            });
                                                        }}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter number of revisions (1-9999)"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& input': {
                                                                    color: '#1e293b'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Extra Revision Price Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Extra Revision Price (VND) *
                                                    </Typography>
                                                    <TextField
                                                        type="text"
                                                        value={quotationData.extraRevisionPrice ? parseFloat(quotationData.extraRevisionPrice).toLocaleString('vi-VN') : ''}
                                                        onChange={(e) => {
                                                            const numericValue = e.target.value.replace(/[^\d]/g, '');
                                                            setQuotationData({
                                                                ...quotationData,
                                                                extraRevisionPrice: numericValue
                                                            });
                                                        }}
                                                        disabled={parseInt(quotationData.revisionTime) === 9999 || parseFloat(quotationData.price) >= 200000000}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter extra revision price (min: 10,000, max: 10,000,000)"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& input': {
                                                                    color: '#1e293b'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Acceptance Deadline Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Acceptance Deadline *
                                                    </Typography>
                                                    <TextField
                                                        type="date"
                                                        value={quotationData.acceptanceDeadline}
                                                        onChange={(e) => setQuotationData({
                                                            ...quotationData,
                                                            acceptanceDeadline: e.target.value
                                                        })}
                                                        size="small"
                                                        fullWidth
                                                        slotProps={{
                                                            htmlInput: {min: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& input': {
                                                                    color: '#1e293b'
                                                                },
                                                                '& input::-webkit-calendar-picker-indicator': {
                                                                    filter: 'none',
                                                                    opacity: 0.7
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Note Input */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Note (Optional)
                                                    </Typography>
                                                    <TextField
                                                        multiline
                                                        rows={3}
                                                        value={quotationData.note}
                                                        onChange={(e) => setQuotationData({
                                                            ...quotationData,
                                                            note: e.target.value
                                                        })}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Enter additional notes for the school"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(124, 58, 237, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#7c3aed'
                                                                },
                                                                '& textarea': {
                                                                    color: '#1e293b'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Quotation Summary */}
                                                <Box sx={{
                                                    p: 2.5,
                                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(91, 33, 182, 0.03) 100%)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(124, 58, 237, 0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Decorative background */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -20,
                                                        right: -20,
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.1) 100%)',
                                                        filter: 'blur(20px)'
                                                    }}/>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 700,
                                                        mb: 2,
                                                        color: '#1e293b',
                                                        fontSize: '0.9rem',
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}>
                                                        Quotation Summary
                                                    </Typography>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1.5,
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1.5,
                                                            background: 'rgba(124, 58, 237, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(124, 58, 237, 0.1)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 600
                                                            }}>
                                                                Price:
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#7c3aed',
                                                                fontWeight: 700
                                                            }}>
                                                                {quotationData.price ? `${parseFloat(quotationData.price).toLocaleString('vi-VN')} ₫` : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1.5,
                                                            background: 'rgba(124, 58, 237, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(124, 58, 237, 0.1)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 600
                                                            }}>
                                                                Delivery Time:
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#7c3aed',
                                                                fontWeight: 700
                                                            }}>
                                                                {quotationData.deliveryWithIn ? `${quotationData.deliveryWithIn} day(s)` : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1.5,
                                                            background: 'rgba(124, 58, 237, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(124, 58, 237, 0.1)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 600
                                                            }}>
                                                                Revisions:
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#7c3aed',
                                                                fontWeight: 700
                                                            }}>
                                                                {quotationData.revisionTime ? (parseInt(quotationData.revisionTime) === 9999 ? 'Unlimited' : `${quotationData.revisionTime} time(s)`) : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1.5,
                                                            background: 'rgba(124, 58, 237, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(124, 58, 237, 0.1)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 600
                                                            }}>
                                                                Extra Revision Price:
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#7c3aed',
                                                                fontWeight: 700
                                                            }}>
                                                                {quotationData.extraRevisionPrice ? `${parseFloat(quotationData.extraRevisionPrice).toLocaleString('vi-VN')} ₫` : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1.5,
                                                            background: 'rgba(124, 58, 237, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(124, 58, 237, 0.1)'
                                                        }}>
                                                            <Typography variant="caption" sx={{
                                                                color: '#64748b',
                                                                fontWeight: 600
                                                            }}>
                                                                Acceptance Deadline:
                                                            </Typography>
                                                            <Typography variant="caption" sx={{
                                                                color: '#7c3aed',
                                                                fontWeight: 700
                                                            }}>
                                                                {quotationData.acceptanceDeadline ? formatDate(quotationData.acceptanceDeadline) : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        {quotationData.note && (
                                                            <Box sx={{
                                                                mt: 1.5,
                                                                p: 1.5,
                                                                background: 'rgba(124, 58, 237, 0.08)',
                                                                borderRadius: 1.5,
                                                                border: '1px solid rgba(124, 58, 237, 0.2)'
                                                            }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#64748b',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 600,
                                                                    display: 'block',
                                                                    mb: 0.5
                                                                }}>
                                                                    Note:
                                                                </Typography>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#1e293b',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 500,
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    {quotationData.note}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<CheckCircleIcon/>}
                                                        onClick={handleQuotationSubmit}
                                                        disabled={(() => {
                                                            const isUnlimitedRevisions = parseInt(quotationData.revisionTime) === 9999;
                                                            const isPriceAtCap = parseFloat(quotationData.price) >= 200000000;
                                                            const combined = (parseFloat(quotationData.price || '0') + parseFloat(quotationData.extraRevisionPrice || '0'));
                                                            const exceedsCap = combined > 200000000;
                                                            return isSubmitting || !quotationData.price || !quotationData.deliveryWithIn || !quotationData.revisionTime || !quotationData.acceptanceDeadline || (!isUnlimitedRevisions && !isPriceAtCap && (!quotationData.extraRevisionPrice || exceedsCap));
                                                        })()}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                                                            color: 'white',
                                                            border: '1px solid rgba(124, 58, 237, 0.3)',
                                                            py: 1.5,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
                                                            },
                                                            '&:disabled': {
                                                                background: 'rgba(124, 58, 237, 0.3)',
                                                                color: 'rgba(255, 255, 255, 0.5)'
                                                            }
                                                        }}
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        startIcon={<CancelIcon/>}
                                                        onClick={() => setShowQuotationForm(false)}
                                                        sx={{
                                                            borderColor: '#7c3aed',
                                                            color: '#7c3aed',
                                                            py: 1.5,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: '#6d28d9',
                                                                background: 'rgba(124, 58, 237, 0.05)'
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Container>
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{p: 3, justifyContent: 'flex-end', gap: 2}}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: '#6d28d9',
                                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Regular Uniform Detail Dialog */}
            <Dialog
                open={regularDialogOpen}
                onClose={() => setRegularDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            border: '1px solid rgba(124, 58, 237, 0.1)',
                            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.05)',
                            overflow: 'hidden'
                        }
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)'
                    }}/>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1}}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <SchoolIcon sx={{fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{fontWeight: 800, mb: 0.5}}>
                                Regular Uniform Details
                            </Typography>
                            <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 500}}>
                                School uniform specifications and requirements
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <DialogContent sx={{p: 0}}>
                    <Box sx={{p: 4}}>

                        {/* Regular Uniforms Section */}
                        {getItemsByCategory('regular').length > 0 && (
                            <Box sx={{mb: 4}}>
                                {/* Boy group */}
                                <Box sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'rgba(59,130,246,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
                                        <Typography variant="subtitle1" sx={{fontWeight: 700, color: '#1e293b'}}>Boy</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                                        {getItemsByCategory('regular').filter(i => i.gender === 'boy').map((item, index) => (
                                            <Card key={`reg-boy-${index}`} sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(124, 58, 237, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: '100%',
                                                minHeight: 260,
                                                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(124, 58, 237, 0.25)', borderColor: 'rgba(124, 58, 237, 0.3)' },
                                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }
                                            }}>
                                                <CardContent sx={{p: 2}}>
                                                    {/* reuse existing compact content */}
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5}}>
                                                        <Box sx={{ p: 1, borderRadius: 3, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
                                                            {getItemIcon(item.type)}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>Regular Uniform</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                        {renderColorWithPicker(item.color, '#7c3aed')}
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Fabric: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.fabricName || 'N/A'}</span></Typography>
                                                        </Box>
                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Logo Position: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.logoPosition}</span></Typography>
                                                            </Box>
                                                        )}
                                                        {item.note && (
                                                            <Box sx={{ mt: 1, p: 1.5, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748b', fontWeight: 500 }}><strong>Note:</strong> {item.note}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                        {item.type?.toLowerCase() === 'shirt' && (request?.logoImage || item.logoImageUrl) && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Logo image', images: [request?.logoImage || item.logoImageUrl], mode: 'logo' })}>
                                                                View logo image
                                                            </Button>
                                                        )}
                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Reference images', images: item.sampleImages.slice(0,4).map(img => img.url), mode: 'reference' })}>
                                                                View reference images
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Girl group */}
                                <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'rgba(236,72,153,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }} />
                                        <Typography variant="subtitle1" sx={{fontWeight: 700, color: '#1e293b'}}>Girl</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                                        {getItemsByCategory('regular').filter(i => i.gender === 'girl').map((item, index) => (
                                            <Card key={`reg-girl-${index}`} sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(124, 58, 237, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: '100%',
                                                minHeight: 260,
                                                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(124, 58, 237, 0.25)', borderColor: 'rgba(124, 58, 237, 0.3)' },
                                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }
                                            }}>
                                                <CardContent sx={{p: 2}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5}}>
                                                        <Box sx={{ p: 1, borderRadius: 3, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>{getItemIcon(item.type)}</Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Typography>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>Regular Uniform</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                        {renderColorWithPicker(item.color, '#7c3aed')}
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Fabric: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.fabricName || 'N/A'}</span></Typography>
                                                        </Box>
                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Logo Position: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.logoPosition}</span></Typography>
                                                            </Box>
                                                        )}
                                                        {item.note && (
                                                            <Box sx={{ mt: 1, p: 1.5, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748b', fontWeight: 500 }}><strong>Note:</strong> {item.note}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                        {item.type?.toLowerCase() === 'shirt' && (request?.logoImage || item.logoImageUrl) && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Logo image', images: [request?.logoImage || item.logoImageUrl], mode: 'logo' })}>
                                                                View logo image
                                                            </Button>
                                                        )}
                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Reference images', images: item.sampleImages.slice(0,4).map(img => img.url), mode: 'reference' })}>
                                                                View reference images
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}


                        {/* No Data Message */}
                        {getItemsByCategory('regular').length === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                background: 'rgba(124, 58, 237, 0.02)',
                                borderRadius: 3,
                                border: '2px dashed rgba(124, 58, 237, 0.2)'
                            }}>
                                <SchoolIcon sx={{fontSize: 48, color: '#7c3aed', mb: 2, opacity: 0.6}}/>
                                <Typography variant="h6" sx={{color: '#64748b', fontWeight: 600, mb: 1}}>
                                    No Regular Uniform Data
                                </Typography>
                                <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                    No regular uniform specifications found for this request.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderTop: '1px solid rgba(124, 58, 237, 0.08)'
                }}>
                    <Button
                        onClick={() => setRegularDialogOpen(false)}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: '#6d28d9',
                                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Physical Education Uniform Detail Dialog */}
            <Dialog
                open={physicalDialogOpen}
                onClose={() => setPhysicalDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            border: '1px solid rgba(124, 58, 237, 0.1)',
                            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.05)',
                            overflow: 'hidden'
                        }
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    color: 'white',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)'
                    }}/>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1}}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <PersonIcon sx={{fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{fontWeight: 800, mb: 0.5}}>
                                Physical Education Uniform Details
                            </Typography>
                            <Typography variant="body2" sx={{opacity: 0.9, fontWeight: 500}}>
                                Sports and athletic wear specifications
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <DialogContent sx={{p: 0}}>
                    <Box sx={{p: 4}}>

                        {/* Physical Education Uniforms Section */}
                        {getItemsByCategory('pe').length > 0 && (
                            <Box sx={{mb: 4}}>
                                {/* Boy group */}
                                <Box sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'rgba(59,130,246,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
                                        <Typography variant="subtitle1" sx={{fontWeight: 700, color: '#1e293b'}}>Boy</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                                        {getItemsByCategory('pe').filter(i => i.gender === 'boy').map((item, index) => (
                                            <Card key={`pe-boy-${index}`} sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(124, 58, 237, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: '100%',
                                                minHeight: 260,
                                                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(124, 58, 237, 0.25)', borderColor: 'rgba(124, 58, 237, 0.3)' },
                                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }
                                            }}>
                                                <CardContent sx={{p: 2}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5}}>
                                                        <Box sx={{ p: 1, borderRadius: 3, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>{getItemIcon(item.type)}</Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Typography>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>Physical Education</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                        {renderColorWithPicker(item.color, '#7c3aed')}
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Fabric: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.fabricName || 'N/A'}</span></Typography>
                                                        </Box>
                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Logo Position: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.logoPosition}</span></Typography>
                                                            </Box>
                                                        )}
                                                        {item.note && (
                                                            <Box sx={{ mt: 1, p: 1.5, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748b', fontWeight: 500 }}><strong>Note:</strong> {item.note}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                        {item.type?.toLowerCase() === 'shirt' && (request?.logoImage || item.logoImageUrl) && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Logo image', images: [request?.logoImage || item.logoImageUrl], mode: 'logo' })}>
                                                                View logo image
                                                            </Button>
                                                        )}
                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Reference images', images: item.sampleImages.slice(0,4).map(img => img.url), mode: 'reference' })}>
                                                                View reference images
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Girl group */}
                                <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, background: 'rgba(236,72,153,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }} />
                                        <Typography variant="subtitle1" sx={{fontWeight: 700, color: '#1e293b'}}>Girl</Typography>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                                        {getItemsByCategory('pe').filter(i => i.gender === 'girl').map((item, index) => (
                                            <Card key={`pe-girl-${index}`} sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(124, 58, 237, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                height: '100%',
                                                minHeight: 260,
                                                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(124, 58, 237, 0.25)', borderColor: 'rgba(124, 58, 237, 0.3)' },
                                                '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }
                                            }}>
                                                <CardContent sx={{p: 2}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5}}>
                                                        <Box sx={{ p: 1, borderRadius: 3, background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>{getItemIcon(item.type)}</Box>
                                                        <Box>
                                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Typography>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontWeight: 500}}>Physical Education</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                        {renderColorWithPicker(item.color, '#7c3aed')}
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Fabric: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.fabricName || 'N/A'}</span></Typography>
                                                        </Box>
                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}/>
                                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#374151'}}>Logo Position: <span style={{ color: '#7c3aed', fontWeight: 500 }}>{item.logoPosition}</span></Typography>
                                                            </Box>
                                                        )}
                                                        {item.note && (
                                                            <Box sx={{ mt: 1, p: 1.5, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748b', fontWeight: 500 }}><strong>Note:</strong> {item.note}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                        {item.type?.toLowerCase() === 'shirt' && (request?.logoImage || item.logoImageUrl) && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Logo image', images: [request?.logoImage || item.logoImageUrl], mode: 'logo' })}>
                                                                View logo image
                                                            </Button>
                                                        )}
                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                            <Button size="small" variant="outlined" onClick={() => setImageViewer({ open: true, title: 'Reference images', images: item.sampleImages.slice(0,4).map(img => img.url), mode: 'reference' })}>
                                                                View reference images
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}


                        {/* No Data Message */}
                        {getItemsByCategory('pe').length === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                background: 'rgba(124, 58, 237, 0.02)',
                                borderRadius: 3,
                                border: '2px dashed rgba(124, 58, 237, 0.2)'
                            }}>
                                <PersonIcon sx={{fontSize: 48, color: '#7c3aed', mb: 2, opacity: 0.6}}/>
                                <Typography variant="h6" sx={{color: '#64748b', fontWeight: 600, mb: 1}}>
                                    No Physical Education Uniform Data
                                </Typography>
                                <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                    No physical education uniform specifications found for this request.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderTop: '1px solid rgba(124, 58, 237, 0.08)'
                }}>
                    <Button
                        onClick={() => setPhysicalDialogOpen(false)}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#7c3aed',
                            color: '#7c3aed',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: '#6d28d9',
                                backgroundColor: 'rgba(124, 58, 237, 0.04)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Viewer Dialog */}
            <Dialog open={imageViewer.open} onClose={() => setImageViewer(prev => ({ ...prev, open: false }))} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{imageViewer.title}</Typography>
                    {imageViewer.mode === 'logo' ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {imageViewer.images[0] && (
                                <DisplayImage imageUrl={imageViewer.images[0]} width={260} height={260} alt={imageViewer.title} />
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                            {imageViewer.images.slice(0,4).map((url, idx) => (
                                <DisplayImage key={idx} imageUrl={url} width={160} height={160} alt={`${imageViewer.title} ${idx + 1}`} />
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}