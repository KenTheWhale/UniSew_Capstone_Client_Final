import React, {useState, useEffect} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Popover,
    Typography
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    DesignServices as DesignServicesIcon,
    Email as EmailIcon,
    Groups as GroupsIcon,
    Info as InfoIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    LocationOn as LocationIcon,
    Pending as PendingIcon,
    Phone as PhoneIcon,
    School as SchoolIcon,
    TrendingUp as TrendingUpIcon,
    Videocam as VideocamIcon
} from '@mui/icons-material';
import {parseID} from '../../../utils/ParseIDUtil';
import {formatDate} from '../../../utils/TimestampUtil';
import OrderDetailTable from '../../ui/OrderDetailTable';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const statusTag = (status) => {
    let color;
    switch (status) {
        case 'pending':
            color = 'warning';
            break;
        case 'processing':
            color = 'info';
            break;
        case 'delivering':
            color = 'primary';
            break;
        case 'completed':
            color = 'success';
            break;
        case 'cancelled':
            color = 'error';
            break;
        default:
            color = 'default';
            break;
    }
    return <Chip label={status} color={color} variant="outlined"/>;
};

export default function OrderAdminDetailPopup({open, onClose, selectedOrder}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [hoveredMilestone, setHoveredMilestone] = useState(null);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    if (!selectedOrder) return null;

    // Get milestones for progress tracking
    const getMilestones = () => {
        if (!selectedOrder?.milestone || selectedOrder.milestone.length === 0) {
            return [{
                title: 'Waiting for Milestones',
                description: 'Waiting for garment factory to assign production milestones',
                isCompleted: false,
                isActive: false,
                isNotStarted: true,
                startDate: null,
                endDate: null,
                completedDate: null,
                stage: 1,
                isWaiting: true
            }];
        }

        const startSewingPhase = {
            title: 'Start Sewing',
            description: 'Production begins with cutting and sewing',
            isCompleted: true,
            isActive: false,
            startDate: selectedOrder.orderDate,
            endDate: null,
            completedDate: selectedOrder.orderDate,
            stage: 1
        };

        const apiMilestones = selectedOrder.milestone.map((milestone, index) => {
            const status = milestone.status || 'assigned';
            const isCompleted = status === 'completed';
            const isActive = status === 'processing';
            const isNotStarted = status === 'pending' || status === 'assigned';

            return {
                title: milestone.name || `Stage ${milestone.stage}`,
                description: milestone.description || `Production stage ${milestone.stage}`,
                isCompleted: isCompleted,
                isActive: isActive,
                isNotStarted: isNotStarted,
                startDate: milestone.startDate,
                endDate: milestone.endDate,
                completedDate: milestone.completedDate,
                stage: milestone.stage || (index + 2),
                videoUrl: milestone.videoUrl || null
            };
        });

        // Check if all API phases are completed and order is processing
        const allApiPhasesCompleted = apiMilestones.length > 0 && apiMilestones.every(phase => phase.isCompleted);
        
        // Add fixed phases at the end
        const deliveringPhase = {
            title: 'Delivering',
            description: 'Order is being shipped to delivery address',
            isCompleted: selectedOrder.status === 'completed',
            isActive: selectedOrder.status === 'delivering',
            isNotStarted: selectedOrder.status !== 'delivering' && selectedOrder.status !== 'completed',
            isPaymentRequired: selectedOrder.status === 'processing' && allApiPhasesCompleted,
            startDate: null,
            endDate: null,
            completedDate: selectedOrder.status === 'completed' ? selectedOrder.completedDate : null,
            stage: apiMilestones.length + 2
        };

        const completedPhase = {
            title: 'Completed',
            description: 'Order has been delivered successfully',
            isCompleted: selectedOrder.status === 'completed',
            isActive: false,
            isNotStarted: selectedOrder.status !== 'completed',
            startDate: null,
            endDate: null,
            completedDate: selectedOrder.status === 'completed' ? selectedOrder.completedDate : null,
            stage: apiMilestones.length + 3
        };

        return [startSewingPhase, ...apiMilestones, deliveringPhase, completedPhase];
    };

    const milestones = getMilestones();

    const handleMilestoneHover = (event, milestone) => {
        // Clear any existing timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        
        setAnchorEl(event.currentTarget);
        setHoveredMilestone(milestone);
    };

    const handleMilestoneLeave = () => {
        // Add delay before hiding popover
        const timeout = setTimeout(() => {
            setAnchorEl(null);
            setHoveredMilestone(null);
        }, 100);
        setHoverTimeout(timeout);
    };

    const handlePopoverMouseEnter = () => {
        // Clear timeout when mouse enters popover
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
    };

    const handlePopoverMouseLeave = () => {
        // Add delay before hiding popover
        const timeout = setTimeout(() => {
            setAnchorEl(null);
            setHoveredMilestone(null);
        }, 100);
        setHoverTimeout(timeout);
    };

    const handleOpenVideoDialog = (milestone) => {
        setSelectedVideo(milestone);
        setVideoDialogOpen(true);
        setAnchorEl(null); // Close hover popover
        setHoveredMilestone(null);
    };

    const handleCloseVideoDialog = () => {
        setVideoDialogOpen(false);
        setSelectedVideo(null);
    };

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
                        maxHeight: '90vh',
                        overflowY: 'auto'
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
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    width: '100%'
                }}/>
                
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            position: 'relative'
                        }}>
                            <InventoryIcon style={{
                                color: 'white',
                                fontSize: '24px'
                            }}/>
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
                                Order Details
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
                                    ID: {parseID(selectedOrder.id, 'ord')}
                                </Typography>
                                <Box sx={{transform: 'scale(1.1)'}}>
                                    {statusTag(selectedOrder.status)}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    
                    <IconButton
                        onClick={onClose}
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            '&:hover': {
                                background: '#f3f4f6',
                                borderColor: '#d1d5db',
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        <CloseIcon style={{
                            color: '#6b7280',
                            fontSize: '20px'
                        }}/>
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{p: 3}}>
                {/* Order Header Card */}
                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: 'none',
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #2e7d32 0%, #388e3c 30%, #4caf50 60%, #66bb6a 100%)'
                    }}/>

                    <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: {xs: 'wrap', md: 'nowrap'},
                            gap: 3
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                flex: 1
                            }}>
                                <Box sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)'
                                }}>
                                    <InventoryIcon sx={{color: 'white', fontSize: 32}}/>
                                </Box>

                                <Box sx={{flex: 1}}>
                                    <Typography variant="caption" sx={{
                                        color: '#64748b',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontSize: '0.75rem',
                                        mb: 1,
                                        display: 'block'
                                    }}>
                                        Order
                                    </Typography>
                                    <Typography variant="h4" sx={{
                                        fontWeight: 800,
                                        color: '#1e293b',
                                        fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2rem'},
                                        lineHeight: 1.2,
                                        fontFamily: 'monospace',
                                        letterSpacing: '1px'
                                    }}>
                                        {parseID(selectedOrder.id, 'ord')}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        mt: 0.5,
                                        fontSize: '0.875rem'
                                    }}>
                                        {selectedOrder.selectedDesign?.name || 'Order Details'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 1
                            }}>
                                <Box sx={{transform: 'scale(1.1)'}}>
                                    {statusTag(selectedOrder.status)}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Order Progress Section */}
                <Card sx={{
                    mb: 4,
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
                        background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 30%, #8b5cf6 60%, #7c3aed 100%)'
                    }}/>

                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(-30px, -30px)'
                    }}/>

                    <Box sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(30px, -30px)'
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                                <TrendingUpIcon sx={{color: 'white', fontSize: 24}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    Order Progress
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Track your order milestones
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4, position: 'relative', zIndex: 1}}>
                        {milestones.length === 1 && milestones[0].isWaiting ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 4,
                                textAlign: 'center'
                            }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <PendingIcon sx={{color: 'white', fontSize: 36}}/>
                                </Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 600,
                                    color: '#92400e',
                                    mb: 1
                                }}>
                                    Waiting for Garment Factory to Assign Milestones
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#64748b',
                                    maxWidth: 300,
                                    lineHeight: 1.6
                                }}>
                                    Waiting for production milestones to be assigned.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: 200,
                                    position: 'relative',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': {
                                        height: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                        }
                                    }
                                }}>
                                    {milestones.map((milestone, index) => (
                                        <React.Fragment key={index}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: 120,
                                                minHeight: 180,
                                                position: 'relative'
                                            }}>
                                                <Box sx={{position: 'relative'}}>
                                                    <Box
                                                        onMouseEnter={(e) => handleMilestoneHover(e, milestone)}
                                                        onMouseLeave={handleMilestoneLeave}
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                    borderRadius: '50%',
                                                    background: milestone.isCompleted
                                                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                                        : milestone.isActive
                                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                            : milestone.isPaymentRequired
                                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                                        : milestone.isNotStarted
                                                                            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                                                                : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                            cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: milestone.isCompleted
                                                        ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                                                        : milestone.isActive
                                                            ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                            : milestone.isPaymentRequired
                                                                ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                                                                        : milestone.isNotStarted
                                                                            ? '0 4px 12px rgba(148, 163, 184, 0.3)'
                                                                : '0 4px 12px rgba(148, 163, 184, 0.3)',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                boxShadow: milestone.isCompleted
                                                                    ? '0 8px 25px rgba(34, 197, 94, 0.4)'
                                                                    : milestone.isActive
                                                                        ? '0 8px 25px rgba(59, 130, 246, 0.4)'
                                                                        : milestone.isPaymentRequired
                                                                            ? '0 8px 25px rgba(239, 68, 68, 0.4)'
                                                                            : milestone.isNotStarted
                                                                                ? '0 8px 25px rgba(148, 163, 184, 0.4)'
                                                                                : '0 8px 25px rgba(148, 163, 184, 0.4)'
                                                            }
                                                        }}
                                                    >
                                                    {milestone.isCompleted ? (
                                                            <CheckCircleIcon sx={{color: 'white', fontSize: 28}}/>
                                                    ) : milestone.isActive ? (
                                                            <DesignServicesIcon sx={{color: 'white', fontSize: 28}}/>
                                                    ) : milestone.isPaymentRequired ? (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                        ) : milestone.isNotStarted ? (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                    ) : (
                                                            <PendingIcon sx={{color: 'white', fontSize: 28}}/>
                                                    )}
                                                    </Box>

                                                    {/* Exclamation mark icon for Required Payment */}
                                                    {milestone.isPaymentRequired && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            right: -8,
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                                            border: '2px solid white',
                                                            zIndex: 1
                                                        }}>
                                                            <Typography sx={{
                                                                color: 'white',
                                                                fontSize: '14px',
                                                                fontWeight: 700,
                                                                lineHeight: 1
                                                            }}>
                                                                !
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Video icon for milestones with video */}
                                                    {milestone.videoUrl && milestone.isCompleted && (
                                                        <Box
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenVideoDialog(milestone);
                                                            }}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                                                                border: '2px solid white',
                                                                cursor: 'pointer',
                                                                zIndex: 2,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)',
                                                                    boxShadow: '0 6px 16px rgba(139, 92, 246, 0.6)'
                                                                }
                                                            }}
                                                        >
                                                            <VideocamIcon sx={{
                                                                color: 'white',
                                                                fontSize: '12px'
                                                            }}/>
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600,
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem',
                                                    mt: 2,
                                                    textAlign: 'center',
                                                    maxWidth: 100,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {milestone.title}
                                                </Typography>

                                                <Typography variant="caption" sx={{
                                                    color: '#64748b',
                                                    fontSize: '0.75rem',
                                                    mt: 1
                                                }}>
                                                    Step {index + 1}
                                                </Typography>
                                            </Box>

                                            {index < milestones.length - 1 && (
                                                <Box sx={{
                                                    flex: 1,
                                                    height: 2,
                                                    background: milestone.isCompleted
                                                        ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                                        : milestone.isPaymentRequired
                                                            ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                                                            : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)',
                                                    borderRadius: 1,
                                                    mx: 2,
                                                    minWidth: 40
                                                }}/>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mt: 2
                                }}>
                                    <Typography variant="body2" sx={{
                                        color: '#64748b',
                                        fontWeight: 500
                                    }}>
                                        Progress:
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        color: '#3b82f6',
                                        fontWeight: 700
                                    }}>
                                        {milestones.filter(m => m.isCompleted).length} / {milestones.length}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* School Information */}
                <Card sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)'
                    }
                }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            transform: 'translate(30px, -30px)'
                        }}/>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                            }}>
                                <SchoolIcon sx={{color: 'white', fontSize: 24}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    School Information
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Educational institution details
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            mb: 3
                        }}>
                            <Avatar 
                                src={selectedOrder.school?.avatar} 
                                sx={{ 
                                    width: 64, 
                                    height: 64,
                                    border: '3px solid #8b5cf6'
                                }}
                            >
                                {selectedOrder.school?.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{flex: 1}}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: '1.25rem',
                                    mb: 0.5
                                }}>
                                    {selectedOrder.school?.name}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#8b5cf6',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {selectedOrder.school?.business}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            {selectedOrder.school?.address && (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'rgba(139, 92, 246, 0.05)',
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
                                        <LocationIcon sx={{color: 'white', fontSize: 18}}/>
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
                                            {selectedOrder.school?.address}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {selectedOrder.school?.phone && (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'rgba(139, 92, 246, 0.05)',
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
                                        <PhoneIcon sx={{color: 'white', fontSize: 18}}/>
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
                                            {selectedOrder.school?.phone}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {selectedOrder.school?.account?.email && (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'rgba(139, 92, 246, 0.05)',
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
                                        <EmailIcon sx={{color: 'white', fontSize: 18}}/>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="caption" sx={{
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontSize: '0.75rem'
                                        }}>
                                            Email
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#1e293b',
                                            fontWeight: 500,
                                            lineHeight: 1.4
                                        }}>
                                            {selectedOrder.school?.account?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Garment Factory Information */}
                {selectedOrder.garment && (
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)'
                        }
                    }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30px, -30px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    <GroupsIcon sx={{color: 'white', fontSize: 24}}/>
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        fontSize: '1.25rem'
                                    }}>
                                        Garment Factory
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: 500
                                    }}>
                                        Manufacturing partner details
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <CardContent sx={{p: 4}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                mb: 3
                            }}>
                                <Avatar 
                                    src={selectedOrder.garment.customer?.avatar} 
                                    sx={{ 
                                        width: 64, 
                                        height: 64,
                                        border: '3px solid #10b981'
                                    }}
                                >
                                    {selectedOrder.garment.customer?.business?.charAt(0)}
                                </Avatar>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        fontSize: '1.25rem',
                                        mb: 0.5
                                    }}>
                                        {selectedOrder.garment.customer?.business}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#10b981',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}>
                                        {selectedOrder.garment.customer?.name}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {selectedOrder.garment.customer?.address && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'rgba(248, 250, 252, 0.8)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(16, 185, 129, 0.05)',
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
                                            <LocationIcon sx={{color: 'white', fontSize: 18}}/>
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
                                                {selectedOrder.garment.customer?.address}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedOrder.garment.customer?.phone && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'rgba(248, 250, 252, 0.8)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(16, 185, 129, 0.05)',
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
                                            <PhoneIcon sx={{color: 'white', fontSize: 18}}/>
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
                                                {selectedOrder.garment.customer?.phone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedOrder.garment.customer?.account?.email && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'rgba(248, 250, 252, 0.8)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'rgba(16, 185, 129, 0.05)',
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
                                            <EmailIcon sx={{color: 'white', fontSize: 18}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                fontSize: '0.75rem'
                                            }}>
                                                Email
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e293b',
                                                fontWeight: 500,
                                                lineHeight: 1.4
                                            }}>
                                                {selectedOrder.garment.customer?.account?.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Order Information */}
                <Card sx={{
                    mb: 4,
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
                                <InfoIcon sx={{color: 'white', fontSize: 20}}/>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '1.25rem'
                                }}>
                                    Order Information
                        </Typography>
                                <Typography variant="body2" sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 500
                                }}>
                                    Order details and timeline
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <CardContent sx={{p: 4}}>
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#1e293b',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <CalendarIcon sx={{fontSize: 20, color: '#3b82f6'}}/>
                                Order Basic Information
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(10px, -10px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            }}>
                                                <CalendarIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                    Order Date
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {formatDate(selectedOrder.orderDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        flex: 1,
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                                        border: '1px solid rgba(239, 68, 68, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: '50%',
                                            transform: 'translate(10px, -10px)'
                                        }}/>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                            }}>
                                                <CalendarIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                    Deadline
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 700,
                                                    color: '#1e293b',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {formatDate(selectedOrder.deadline)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(10px, -10px)'
                                    }}/>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <LocationIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                Delivery Address
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '0.9rem'
                                            }}>
                                                {selectedOrder?.deliveryAddress || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                                    border: '1px solid rgba(168, 85, 247, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)'
                                    }
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(10px, -10px)'
                                    }}/>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                                        }}>
                                            <SchoolIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                Total Uniforms
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '0.9rem'
                                            }}>
                                                {selectedOrder?.orderDetails?.reduce((total, detail) => total + (detail.quantity || 0), 0) || 0}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Payment summary moved here for delivering/completed */}
                                {(selectedOrder.status === 'delivering' || selectedOrder.status === 'completed') && (
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)'},
                                        gap: 3
                                    }}>
                                        {/* Base Price */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(59, 130, 246, 0.1)',
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
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                        Base Price
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency(selectedOrder.price)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Service Fee */}
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
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                        Service Fee
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                    {formatCurrency(selectedOrder.serviceFee || 0)}
                                </Typography>
                            </Box>
                                            </Box>
                                        </Box>

                                        {/* Shipping Fee */}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                            border: '1px solid rgba(16, 185, 129, 0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                                            }
                                        }}>
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '40px',
                                                height: '40px',
                                                background: 'rgba(16, 185, 129, 0.1)',
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
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                }}>
                                                    <LocalShippingIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                        Shipping Fee
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#1e293b',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency(selectedOrder.shippingFee || 0)}
                                </Typography>
                            </Box>
                        </Box>
                                        </Box>

                                        {/* Total Price (Paid) */}
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
                                                    <MoneyIcon sx={{color: 'white', fontSize: 16}}/>
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
                                                        Total Price (Paid)
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#8b5cf6',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {formatCurrency((selectedOrder.price || 0) + (selectedOrder.serviceFee || 0) + (selectedOrder.shippingFee || 0))}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {selectedOrder.note && (
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
                                        <InfoIcon sx={{color: 'white', fontSize: 16}}/>
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            mb: 1
                                        }}>
                                            Order Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#6b7280',
                                            lineHeight: 1.6,
                                            fontStyle: 'italic'
                                        }}>
                                            {selectedOrder.note}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Information */}
                <Card sx={{
                    mb: 4,
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
                                <MoneyIcon sx={{color: 'white', fontSize: 20}}/>
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
                        {selectedOrder.transactions && selectedOrder.transactions.length > 0 && (() => {
                            // Filter transactions to only show deposit, order, and order_return
                            const filteredTransactions = selectedOrder.transactions.filter(transaction => 
                                ['deposit', 'order', 'order_return'].includes(transaction.paymentType)
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
                                                const aPriority = a?.paymentType === 'deposit' ? 0 : 1;
                                                const bPriority = b?.paymentType === 'deposit' ? 0 : 1;
                                                if (aPriority !== bPriority) return aPriority - bPriority;
                                                return new Date(b.creationDate) - new Date(a.creationDate);
                                            })
                                        .map((transaction) => {
                                            const isReceiver = transaction?.receiver?.id === selectedOrder?.school?.id;
                                            const otherParty = isReceiver ? transaction?.sender : transaction?.receiver;
                                            const isSuccess = transaction?.status === 'success';
                                            const paymentTypeLabel =
                                                transaction?.paymentType === 'design' ? 'Design Payment' :
                                                transaction?.paymentType === 'design_return' ? 'Design Refund' :
                                                transaction?.paymentType === 'order' ? 'Order Payment' :
                                                transaction?.paymentType === 'order_return' ? 'Order Refund' :
                                                transaction?.paymentType === 'deposit' ? 'Deposit' : (transaction?.paymentType || 'Payment');

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
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 44,
                                                                    height: 44,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: isReceiver ? '#dcfce7' : '#fef3c7'
                                                                }}>
                                                                    <MoneyIcon sx={{color: isReceiver ? '#16a34a' : '#d97706'}}/>
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
                                                                        {isReceiver ? 'Received from' : 'Sent to'} {otherParty?.business || 'Unknown'}
                                    </Typography>
                                </Box>
                                                            </Box>

                                                            <Box sx={{textAlign: 'right'}}>
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 700,
                                                                    color: isReceiver ? '#10b981' : '#ef4444'
                                                                }}>
                                                                    {isReceiver ? '+' : '-'}{formatCurrency(transaction.amount)}
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
                                                                {(() => {
                                                                    const newBalance = isReceiver ? transaction?.remain?.receiver : transaction?.remain?.sender;
                                                                    if (newBalance === undefined || newBalance === null || newBalance === -1) return null;
                                                                    const isPending = !transaction.paymentGatewayCode.includes('w');
                                                                    return (
                                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                                                                            <Chip
                                                                                size="small"
                                                                                label={`${isPending ? 'Pending' : 'Balance'}: ${formatCurrency(newBalance)}`}
                                                                                sx={{
                                                                                    height: 22,
                                                                                    fontSize: '11px',
                                                                                    fontWeight: 600,
                                                                                    color: '#111827',
                                                                                    backgroundColor: '#f3f4f6',
                                                                                    border: '1px solid #e5e7eb'
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    );
                                                                })()}
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
                                                                        <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                                            {transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ? 'Request ID' : 'Order ID'}
                                    </Typography>
                                                                        <Chip
                                                                            label={transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ?
                                                                                parseID(transaction.itemId, 'dr') : 
                                                                                parseID(transaction.itemId, 'ord')}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: transaction.paymentType === 'design' || transaction.paymentType === 'design_return' ? '#f3e8ff' : '#e0f2fe',
                                                                                color: transaction.paymentType === 'design' ? '#7c3aed' : '#0369a1',
                                                                                fontWeight: 600,
                                                                                fontSize: '10px',
                                                                                height: '20px'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                )}
                                                                {transaction.serviceFee > 0 && (
                                                                    <Box>
                                                                        <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
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
                                                                    <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
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
                                                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '12px'}}>
                                                                    Date
                                    </Typography>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#1e293b',
                                                                    fontWeight: 600,
                                                                    fontSize: '13px',
                                                                    mt: '0.5vh'
                                                                }}>
                                                                    {formatDate(transaction.creationDate)}
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

                {/* Selected Design Section */}
                {selectedOrder.selectedDesign && (
                    <Card sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)'
                        }
                    }}>
                        <Box sx={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30px, -30px)'
                            }}/>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                }}>
                                    <DesignServicesIcon sx={{color: 'white', fontSize: 24}}/>
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: 'white',
                                        fontSize: {xs: '1.25rem', sm: '1.5rem'}
                                    }}>
                                        Selected Design
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: 500
                                    }}>
                                        Approved design for your order
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <CardContent sx={{p: 4}}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'},
                                gap: 3,
                                mb: 4
                            }}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                    border: '1px solid rgba(139, 92, 246, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(20px, -20px)'
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
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <DesignServicesIcon sx={{color: 'white', fontSize: 20}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Design Name
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '1.1rem'
                                            }}>
                                                {selectedOrder.selectedDesign.designRequest?.name || selectedOrder.selectedDesign.name || 'Design Request'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(20px, -20px)'
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
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            <CalendarIcon sx={{color: 'white', fontSize: 20}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Submit Date
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#1e293b',
                                                fontSize: '1.1rem'
                                            }}>
                                                {formatDate(selectedOrder.selectedDesign.submitDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '60px',
                                        height: '60px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '50%',
                                        transform: 'translate(20px, -20px)'
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
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block'
                                            }}>
                                                Status
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#10b981',
                                                fontSize: '1.1rem'
                                            }}>
                                                Completed
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {selectedOrder.selectedDesign.note && (
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                                    border: '1px solid rgba(245, 158, 11, 0.15)',
                                    borderLeft: '4px solid #f59e0b',
                                    mb: 3
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2
                                    }}>
                                        <Box sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            mt: 0.5,
                                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <InfoIcon sx={{color: 'white', fontSize: 18}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="subtitle1" sx={{
                                                fontWeight: 600,
                                                color: '#92400e',
                                                fontSize: '1rem',
                                                mb: 1
                                            }}>
                                                Design Notes
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#451a03',
                                                lineHeight: 1.6,
                                                fontSize: '0.9rem'
                                            }}>
                                                {selectedOrder.selectedDesign.note}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            <Box>
                                <OrderDetailTable order={selectedOrder}/>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>
            
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>

            {/* Milestone Hover Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                    setHoveredMilestone(null);
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                disableRestoreFocus
                disableAutoFocus
                disableEnforceFocus
                sx={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                    '& .MuiPopover-paper': {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        maxWidth: 300,
                        overflow: 'visible',
                        pointerEvents: 'auto',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid white',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }
                    }
                }}
            >
                <Box
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                    sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        position: 'relative'
                    }}
                >
                    {hoveredMilestone && (
                        <>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 2
                            }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: hoveredMilestone.isCompleted
                                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                        : hoveredMilestone.isActive
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                            : hoveredMilestone.isPaymentRequired
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                }}>
                                    {hoveredMilestone.isCompleted ? (
                                        <CheckCircleIcon sx={{color: 'white', fontSize: 20}}/>
                                    ) : hoveredMilestone.isActive ? (
                                        <DesignServicesIcon sx={{color: 'white', fontSize: 20}}/>
                                    ) : (
                                        <PendingIcon sx={{color: 'white', fontSize: 20}}/>
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        fontSize: '1rem',
                                        mb: 0.5
                                    }}>
                                        {hoveredMilestone.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: '#64748b',
                                        fontSize: '0.875rem'
                                    }}>
                                        {hoveredMilestone.description}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5
                            }}>
                                {hoveredMilestone.startDate && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <CalendarIcon sx={{color: '#3b82f6', fontSize: 16}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                display: 'block'
                                            }}>
                                                Start Date
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e293b',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                {new Date(hoveredMilestone.startDate).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {hoveredMilestone.completedDate && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: 'rgba(34, 197, 94, 0.05)',
                                        border: '1px solid rgba(34, 197, 94, 0.1)'
                                    }}>
                                        <CheckCircleIcon sx={{color: '#22c55e', fontSize: 16}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                display: 'block'
                                            }}>
                                                Completed Date
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e293b',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                {new Date(hoveredMilestone.completedDate).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {hoveredMilestone.isPaymentRequired && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.1)'
                                    }}>
                                        <PendingIcon sx={{color: '#ef4444', fontSize: 16}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                display: 'block'
                                            }}>
                                                Status
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#ef4444',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                Payment Required
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {hoveredMilestone.videoUrl && hoveredMilestone.isCompleted && (
                                    <Box 
                                        onClick={() => handleOpenVideoDialog(hoveredMilestone)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 2,
                                            background: 'rgba(139, 92, 246, 0.05)',
                                            border: '1px solid rgba(139, 92, 246, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                                            }
                                        }}
                                    >
                                        <VideocamIcon sx={{color: '#8b5cf6', fontSize: 16}}/>
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                display: 'block'
                                            }}>
                                                Video Available
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#8b5cf6',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                Click to view progress video
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Popover>

            {/* Video Dialog */}
            <Dialog
                open={videoDialogOpen}
                onClose={handleCloseVideoDialog}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
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
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 50%, #a855f7 100%)',
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
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                position: 'relative'
                            }}>
                                <VideocamIcon style={{
                                    color: 'white',
                                    fontSize: '24px'
                                }}/>
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
                                    Progress Video
                                </Typography>
                                <Typography style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: 500
                                }}>
                                    {selectedVideo?.title || 'Milestone Progress Video'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <IconButton
                            onClick={handleCloseVideoDialog}
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                '&:hover': {
                                    background: '#f3f4f6',
                                    borderColor: '#d1d5db',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            <CloseIcon style={{
                                color: '#6b7280',
                                fontSize: '20px'
                            }}/>
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{p: 3}}>
                    {selectedVideo?.videoUrl ? (
                        <Box sx={{
                            width: '100%',
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            background: '#000'
                        }}>
                            <video
                                controls
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '70vh',
                                    display: 'block'
                                }}
                                preload="metadata"
                            >
                                <source src={selectedVideo.videoUrl} type="video/mp4" />
                                <source src={selectedVideo.videoUrl} type="video/webm" />
                                <source src={selectedVideo.videoUrl} type="video/ogg" />
                                Your browser does not support the video tag.
                            </video>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8,
                            textAlign: 'center'
                        }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                            }}>
                                <VideocamIcon sx={{color: 'white', fontSize: 36}}/>
                            </Box>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#92400e',
                                mb: 1
                            }}>
                                Video Not Available
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#64748b',
                                maxWidth: 300,
                                lineHeight: 1.6
                            }}>
                                The video for this milestone is not available at the moment.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    <Button onClick={handleCloseVideoDialog}>
                    Close
                </Button>
            </DialogActions>
            </Dialog>
        </Dialog>
    );
}
