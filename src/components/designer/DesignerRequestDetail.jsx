import React, {useEffect, useState} from 'react';
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
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    School as SchoolIcon,
    SportsEsports as SportsIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import {parseID} from "../../utils/ParseIDUtil.jsx";
import {designerFindingWithin} from "../../configs/FixedVariables.jsx";
import {createRequestReceipt, getPackages, getRequestReceipt} from "../../services/DesignService.jsx";
import {enqueueSnackbar} from "notistack";

// Simplified Status chip component
const StatusChip = ({status}) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'created':
                return {
                    color: '#1976d2',
                    bgColor: '#e3f2fd',
                    icon: <AssignmentIcon sx={{fontSize: 16}}/>,
                    label: 'Created'
                };
            case 'paid':
                return {
                    color: '#2e7d32',
                    bgColor: '#e8f5e8',
                    icon: <CheckCircleIcon sx={{fontSize: 16}}/>,
                    label: 'Paid'
                };
            case 'unpaid':
                return {
                    color: '#f57c00',
                    bgColor: '#fff3e0',
                    icon: <CancelIcon sx={{fontSize: 16}}/>,
                    label: 'Unpaid'
                };
            case 'progressing':
                return {
                    color: '#9c27b0',
                    bgColor: '#f3e5f5',
                    icon: <TrendingUpIcon sx={{fontSize: 16}}/>,
                    label: 'In Progress'
                };
            case 'completed':
                return {
                    color: '#2e7d32',
                    bgColor: '#e8f5e8',
                    icon: <CheckCircleIcon sx={{fontSize: 16}}/>,
                    label: 'Completed'
                };
            case 'rejected':
                return {
                    color: '#d32f2f',
                    bgColor: '#ffebee',
                    icon: <CancelIcon sx={{fontSize: 16}}/>,
                    label: 'Rejected'
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

export default function DesignerRequestDetail({visible, onCancel, request}) {
    const [regularDialogOpen, setRegularDialogOpen] = React.useState(false);
    const [physicalDialogOpen, setPhysicalDialogOpen] = React.useState(false);
    const [selectedPackages, setSelectedPackages] = React.useState([]);
    const [validityPeriod, setValidityPeriod] = React.useState('');
    const [showPackageForm, setShowPackageForm] = React.useState(false);

    // Design packages data
    const [designPackages, setDesignPackages] = useState([])
    
    // Real request data
    const [realRequestData, setRealRequestData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [requestReceipts, setRequestReceipts] = useState([])

    useEffect(() => {
        async function FetchPackages() {
            return await getPackages()
        }

        FetchPackages().then(res => {
            if (res && res.status === 200) {
                setDesignPackages(res.data.body?.filter(item => item.status !== 'delete'))
            }
        }).catch(() => enqueueSnackbar("Fetch fail", {variant: 'error'}))
    }, []);

    // Fetch request receipts when component mounts
    useEffect(() => {
        if (visible && request?.id) {
            setLoading(true)
            getRequestReceipt({ designRequestId: request.id })
                .then(res => {
                    if (res && res.status === 200) {
                        setRequestReceipts(res.data.body || [])
                    }
                })
                .catch(err => {
                    console.error('Error fetching request receipts:', err)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [visible, request?.id])

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
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
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

        if (!request || loading) {
        return (
            <Dialog 
                open={visible} 
                onClose={onCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent sx={{textAlign: 'center', py: 4}}>
                    <CircularProgress size={40} sx={{color: '#667eea', mb: 2}}/>
                    <Typography variant="h6" sx={{color: '#2c3e50', fontWeight: 700, mb: 1}}>
                        Loading Request Details...
                    </Typography>
                    <Typography variant="body2" sx={{color: '#7f8c8d'}}>
                        Please wait while we fetch the request information
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    const handleAcceptRequest = () => {
        if (!selectedPackages.length || !validityPeriod) {
            setShowPackageForm(true);
            return;
        }

        const data = {
            designRequestId: request.id,
            packageId: selectedPackages,
            acceptanceDeadline: validityPeriod
        }

        createRequestReceipt(data).then(res => {
            if(res && res.status === 200){
                enqueueSnackbar(res.data.message, {variant: "success", autoHideDuration: 1000})
                setTimeout(() => {
                    onCancel()
                }, 1000)
            }
        }).catch((e) => {
            enqueueSnackbar(e.response.data.message, {variant: "error", autoHideDuration: 1000})
        })
    };

    const handlePackageSubmit = () => {
        if (selectedPackages.length && validityPeriod) {
            const selectedDate = new Date(validityPeriod);
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            tomorrow.setHours(0, 0, 0, 0);

            if (selectedDate < tomorrow) {
                enqueueSnackbar('Validity period must be at least 1 day from today', {variant: 'error'});
                return;
            }

            handleAcceptRequest();
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

    const calculateAvailableUntil = (creationDate) => {
        const startDate = new Date(creationDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + designerFindingWithin);
        return formatDate(endDate);
    };

    const formatValidityDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Use existing request data
    const mergedRequestData = request;

    const selectedPackagesData = designPackages.filter(pkg => selectedPackages.includes(pkg.id));

    return (
        <>
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: '#667eea',
                    color: 'white',
                    p: 3,
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Avatar sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
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
                                        background: '#bbdefb',
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <StarIcon sx={{color: '#1565c0', fontSize: 18, transition: 'all 0.3s ease'}}/>
                                        <Typography variant="h6" sx={{
                                            color: '#1565c0',
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
                                                        {mergedRequestData.school || 'N/A'}
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
                                                    <ScheduleIcon sx={{
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
                                                        Available Until
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {calculateAvailableUntil(mergedRequestData.creationDate)}
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
                                        background: '#e1bee7',
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderBottom: '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <BusinessIcon
                                            sx={{color: '#7b1fa2', fontSize: 18, transition: 'all 0.3s ease'}}/>
                                        <Typography variant="h6" sx={{
                                            color: '#7b1fa2',
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            Request Details
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        <Grid container spacing={2}>
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
                                                    <PersonIcon sx={{
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
                                                        Number of Items
                                                    </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        {mergedRequestData.listItemDesign.length || '0'} items
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            {/* Clothing Items Details */}
                                            {mergedRequestData.listItemDesign && mergedRequestData.listItemDesign.length > 0 && (
                                                <Grid sx={{flex: 1}}>
                                                    <Box sx={{
                                                        p: 2,
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
                                                            Clothing Items:
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
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 1,
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-3px)',
                                                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
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
                                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 1,
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-3px)',
                                                                        boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4)'
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
                                            )}
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
                                    border: '1px solid rgba(102, 126, 234, 0.15)'
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                            Request to receive design
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            opacity: 0.9,
                                            textAlign: 'center',
                                            mt: 0.5,
                                            transition: 'all 0.3s ease',
                                            color: 'white'
                                        }}>
                                            Select packages to offer to the school
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        {!showPackageForm ? (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={<CheckCircleIcon/>}
                                                    onClick={handleAcceptRequest}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                                        py: 1.5,
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    Start Offering
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                                {/* Package Selection */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        color: '#1e293b',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        Select Packages to Offer
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1.5,
                                                        maxHeight: 200,
                                                        overflowY: 'auto',
                                                        pr: 1
                                                    }}>
                                                        {designPackages.map((pkg) => (
                                                            <Box
                                                                key={pkg.id}
                                                                onClick={() => {
                                                                    if (selectedPackages.includes(pkg.id)) {
                                                                        setSelectedPackages(selectedPackages.filter(id => id !== pkg.id));
                                                                    } else {
                                                                        setSelectedPackages([...selectedPackages, pkg.id]);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    background: selectedPackages.includes(pkg.id)
                                                                        ? 'rgba(102, 126, 234, 0.1)'
                                                                        : 'rgba(248, 249, 250, 0.8)',
                                                                    border: selectedPackages.includes(pkg.id)
                                                                        ? '2px solid rgba(102, 126, 234, 0.6)'
                                                                        : '1px solid rgba(233, 236, 239, 0.5)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        background: selectedPackages.includes(pkg.id)
                                                                            ? 'rgba(102, 126, 234, 0.15)'
                                                                            : 'rgba(240, 240, 240, 0.9)',
                                                                        transform: 'translateY(-1px)',
                                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                                                                    }
                                                                }}
                                                            >
                                                                {selectedPackages.includes(pkg.id) && (
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        top: -5,
                                                                        right: -5,
                                                                        width: 20,
                                                                        height: 20,
                                                                        borderRadius: '50%',
                                                                        background: '#667eea',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: '2px solid #667eea',
                                                                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                                                    }}>
                                                                        <CheckCircleIcon sx={{
                                                                            fontSize: 12,
                                                                            color: 'white'
                                                                        }}/>
                                                                    </Box>
                                                                )}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'flex-start',
                                                                    mb: 1
                                                                }}>
                                                                    <Typography variant="body2" sx={{
                                                                        fontWeight: 700,
                                                                        color: '#1e293b',
                                                                        fontSize: '0.9rem'
                                                                    }}>
                                                                        {pkg.name}
                                                                    </Typography>
                                                                    <Box sx={{
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        background: 'rgba(102, 126, 234, 0.1)',
                                                                        border: '1px solid rgba(102, 126, 234, 0.2)'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#667eea',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}>
                                                                            {pkg.fee?.toLocaleString('vi-VN')} ₫
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    gap: 2,
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5
                                                                    }}>
                                                                        <ScheduleIcon sx={{
                                                                            fontSize: 14,
                                                                            color: '#64748b'
                                                                        }}/>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#64748b',
                                                                            fontSize: '0.75rem'
                                                                        }}>
                                                                            {pkg.deliveryDuration} day(s)
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5
                                                                    }}>
                                                                        <RefreshIcon sx={{
                                                                            fontSize: 14,
                                                                            color: '#64748b'
                                                                        }}/>
                                                                        <Typography variant="caption" sx={{
                                                                            color: '#64748b',
                                                                            fontSize: '0.75rem'
                                                                        }}>
                                                                            {pkg.revisionTime} revision(s)
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {pkg.headerContent && (
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#94a3b8',
                                                                        fontSize: '0.7rem',
                                                                        mt: 1,
                                                                        display: 'block',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        {pkg.headerContent}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                {/* Validity Period */}
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        color: '#1e293b'
                                                    }}>
                                                        Offer Valid Until
                                                    </Typography>
                                                    <TextField
                                                        type="date"
                                                        value={validityPeriod}
                                                        onChange={(e) => setValidityPeriod(e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                        inputProps={{
                                                            min: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                background: 'rgba(255, 255, 255, 0.9)',
                                                                color: '#1e293b',
                                                                '& fieldset': {
                                                                    borderColor: 'rgba(102, 126, 234, 0.3)'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(102, 126, 234, 0.5)'
                                                                },
                                                                '&:focus fieldset': {
                                                                    borderColor: '#667eea'
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

                                                {/* Offered Packages Info */}
                                                {selectedPackagesData.length > 0 && (
                                                    <Box sx={{
                                                        p: 2.5,
                                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(102, 126, 234, 0.15)',
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
                                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
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
                                                            Offered Packages ({selectedPackagesData.length})
                                                        </Typography>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 1.5,
                                                            position: 'relative',
                                                            zIndex: 1
                                                        }}>
                                                            {selectedPackagesData.map((pkg, index) => (
                                                                <Box key={index} sx={{
                                                                    p: 2.5,
                                                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                                    borderRadius: 2,
                                                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.08)',
                                                                    transition: 'all 0.3s ease',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    '&::before': {
                                                                        content: '""',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        height: '3px',
                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                                    }
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'flex-start',
                                                                        mb: 1.5
                                                                    }}>
                                                                        <Box sx={{flex: 1}}>
                                                                            <Typography variant="body2" sx={{
                                                                                fontWeight: 700,
                                                                                color: '#1e293b',
                                                                                fontSize: '0.9rem',
                                                                                mb: 0.5
                                                                            }}>
                                                                                {pkg.name}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{
                                                                            px: 2,
                                                                            borderRadius: 1.5,
                                                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                                                            minWidth: 'fit-content'
                                                                        }}>
                                                                            <Typography variant="caption" sx={{
                                                                                color: '#667eea',
                                                                                fontWeight: 700,
                                                                                fontSize: '0.8rem'
                                                                            }}>
                                                                                {pkg.fee?.toLocaleString('vi-VN')} ₫
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        gap: 2,
                                                                        alignItems: 'center',
                                                                        flexWrap: 'wrap'
                                                                    }}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.5,
                                                                            p: 1,
                                                                            background: 'rgba(102, 126, 234, 0.05)',
                                                                            borderRadius: 1,
                                                                            border: '1px solid rgba(102, 126, 234, 0.1)'
                                                                        }}>
                                                                            <ScheduleIcon sx={{
                                                                                fontSize: 14,
                                                                                color: '#667eea'
                                                                            }}/>
                                                                            <Typography variant="caption" sx={{
                                                                                color: '#64748b',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {pkg.deliveryDuration} day(s)
                                                                            </Typography>
                                                                        </Box>

                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.5,
                                                                            p: 1,
                                                                            background: 'rgba(102, 126, 234, 0.05)',
                                                                            borderRadius: 1,
                                                                            border: '1px solid rgba(102, 126, 234, 0.1)'
                                                                        }}>
                                                                            <RefreshIcon sx={{
                                                                                fontSize: 14,
                                                                                color: '#667eea'
                                                                            }}/>
                                                                            <Typography variant="caption" sx={{
                                                                                color: '#64748b',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 600
                                                                            }}>
                                                                                {pkg.revisionTime === 9999 ? 'Unlimited revisions' : `${pkg.revisionTime} revision(s)`}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>

                                                        {validityPeriod && (
                                                            <Box sx={{
                                                                mt: 1.5,
                                                                p: 1.5,
                                                                background: 'rgba(102, 126, 234, 0.08)',
                                                                borderRadius: 1.5,
                                                                border: '1px solid rgba(102, 126, 234, 0.2)'
                                                            }}>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#64748b',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 600,
                                                                    display: 'block',
                                                                    mb: 0.5
                                                                }}>
                                                                    Offer Valid Until:
                                                                </Typography>
                                                                <Typography variant="caption" sx={{
                                                                    color: '#1e293b',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {formatValidityDate(validityPeriod)}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}

                                                {/* Action Buttons */}
                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<CheckCircleIcon/>}
                                                        onClick={handlePackageSubmit}
                                                        disabled={!selectedPackages.length || !validityPeriod}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                                            py: 1.5,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                                                            },
                                                            '&:disabled': {
                                                                background: 'rgba(102, 126, 234, 0.3)',
                                                                color: 'rgba(255, 255, 255, 0.5)'
                                                            }
                                                        }}
                                                    >
                                                        Send Offer to School
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        startIcon={<CancelIcon/>}
                                                        onClick={() => setShowPackageForm(false)}
                                                        sx={{
                                                            borderColor: '#667eea',
                                                            color: '#667eea',
                                                            py: 1.5,
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            borderRadius: 2,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: '#5a6fd8',
                                                                background: 'rgba(102, 126, 234, 0.05)'
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
                        
                        {/* Request Receipts Section */}
                        {requestReceipts.length > 0 && (
                            <Box sx={{mt: 3}}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.15)',
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        p: 2,
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px 8px 0 0'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            color: 'white'
                                        }}>
                                            Request Receipts ({requestReceipts.length})
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}>
                                            {requestReceipts.map((receipt, index) => (
                                                <Box key={index} sx={{
                                                    p: 2,
                                                    background: 'rgba(102, 126, 234, 0.05)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                                }}>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 1
                                                    }}>
                                                        Receipt ID: {parseID(receipt.id, 'rr')}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{
                                                        color: '#64748b',
                                                        display: 'block'
                                                    }}>
                                                        Status: {receipt.status}
                                                    </Typography>
                                                    {receipt.createdAt && (
                                                        <Typography variant="caption" sx={{
                                                            color: '#64748b',
                                                            display: 'block'
                                                        }}>
                                                            Created: {formatDate(receipt.createdAt)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Container>
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{p: 3, justifyContent: 'flex-end', gap: 2}}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: '#5a6fd8',
                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
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
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.05)',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

                        {/* Boy Uniforms Section */}
                        {mergedRequestData.listItemDesign?.filter(item => item.itemCategory === 'REGULAR' && item.gender === 'BOY').length > 0 && (
                            <Box sx={{mb: 4}}>
                                <Grid container spacing={3}>
                                    {mergedRequestData.listItemDesign?.filter(item => item.itemCategory === 'REGULAR' && item.gender === 'BOY').map((item, index) => (
                                        <Grid key={index} sx={{flex: 1}}>
                                            <Card sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(102, 126, 234, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.25)',
                                                    borderColor: 'rgba(102, 126, 234, 0.3)'
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                }
                                            }}>
                                                <CardContent sx={{p: 4}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 3}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                        }}>
                                                            {getItemIcon(item.itemType)}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6"
                                                                        sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {item.itemType}
                                                            </Typography>
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontWeight: 500}}>
                                                                Boy
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                        {renderColorWithPicker(item.color, '#667eea')}

                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#667eea'
                                                            }}/>
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 600, color: '#374151'}}>
                                                                Fabric: <span style={{
                                                                color: '#667eea',
                                                                fontWeight: 500
                                                            }}>{item.fabric?.fabricName || 'N/A'}</span>
                                                            </Typography>
                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                                <Box sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    background: '#667eea'
                                                                }}/>
                                                                <Typography variant="body2"
                                                                            sx={{fontWeight: 600, color: '#374151'}}>
                                                                    Logo Position: <span style={{
                                                                    color: '#667eea',
                                                                    fontWeight: 500
                                                                }}>{item.logoPosition}</span>
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.05)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.1)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontStyle: 'italic',
                                                                    color: '#64748b',
                                                                    fontWeight: 500
                                                                }}>
                                                                    <strong>Note:</strong> {item.note}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                                                                                {/* Logo Image Section */}
                                                        {mergedRequestData.logoImage && item.itemType === 'SHIRT' && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.08)',
                                                                textAlign: 'left'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 1
                                                                }}>
                                                                    Logo Design
                                        </Typography>
                                                                <Box sx={{
                                                                    width: 'max-content',
                                                                    height: 'max-content',
                                                                    borderRadius: 1.5,
                                                                    overflow: 'hidden',
                                                                    background: '#f8fafc',
                                                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                    }
                                                                }}>
                                                                    <img
                                                                        src={mergedRequestData.logoImage}
                                                                        alt="Logo Design"
                                                                        style={{
                                                                            maxWidth: 100,
                                                                            maxHeight: 100,
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <Box sx={{
                                                                        display: 'none',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        color: '#94a3b8'
                                                                    }}>
                                                                        <Typography variant="body2">
                                                                            Logo Preview
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {/* Referenced Images Section */}
                                                        {item.images && item.images.length > 0 && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.08)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 2
                                                                }}>
                                                                    Referenced Images ({item.images.length})
                                                                </Typography>
                                                                <Grid container spacing={1}>
                                                                    {item.images.slice(0, 4).map((image, imgIndex) => (
                                                                        <Grid key={imgIndex} sx={{flex: 1}}>
                                                                            <Box sx={{
                                                                                width: 'max-content',
                                                                                height: 'max-content',
                                                                                borderRadius: 1.5,
                                                                                overflow: 'hidden',
                                                                                background: '#f8fafc',
                                                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'scale(1.05)',
                                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                                }
                                                                            }}>
                                                                                <img
                                                                                    src={image.url}
                                                                                    alt={`Reference ${imgIndex + 1}`}
                                                                                    style={{
                                                                                        width: 100,
                                                                                        height: 100,
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.nextSibling.style.display = 'flex';
                                                                                    }}
                                                                                />
                                                                                <Box sx={{
                                                                                    display: 'none',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    color: '#94a3b8'
                                                                                }}>
                                                                                    <Typography variant="caption">
                                                                                        Image {imgIndex + 1}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Girl Uniforms Section */}
                        {request.listItemDesign?.filter(item => item.itemCategory === 'REGULAR' && item.gender === 'GIRL').length > 0 && (
                            <Box sx={{mb: 4}}>
                                <Grid container spacing={3}>
                                    {request.listItemDesign?.filter(item => item.itemCategory === 'REGULAR' && item.gender === 'GIRL').map((item, index) => (
                                        <Grid key={index} sx={{flex: 1}}>
                                            <Card sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(102, 126, 234, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.25)',
                                                    borderColor: 'rgba(102, 126, 234, 0.3)'
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                }
                                            }}>
                                                <CardContent sx={{p: 4}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 3}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                        }}>
                                                            {getItemIcon(item.itemType)}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6"
                                                                        sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {item.itemType}
                                                            </Typography>
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontWeight: 500}}>
                                                                Girl
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1.5,
                                                        flex: 1
                                                    }}>
                                                        {renderColorWithPicker(item.color, '#667eea')}

                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#667eea'
                                                            }}/>
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 600, color: '#374151'}}>
                                                                Fabric: <span style={{
                                                                color: '#667eea',
                                                                fontWeight: 500
                                                            }}>{item.fabric?.fabricName || 'N/A'}</span>
                                                            </Typography>
                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                                <Box sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    background: '#667eea'
                                                                }}/>
                                                                <Typography variant="body2"
                                                                            sx={{fontWeight: 600, color: '#374151'}}>
                                                                    Logo Position: <span style={{
                                                                    color: '#667eea',
                                                                    fontWeight: 500
                                                                }}>{item.logoPosition}</span>
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.05)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.1)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontStyle: 'italic',
                                                                    color: '#64748b',
                                                                    fontWeight: 500
                                                                }}>
                                                                    <strong>Note:</strong> {item.note}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Logo Image Section */}
                                                        {request.logoImage && item.itemType === 'SHIRT' && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.08)',
                                                                textAlign: 'left',
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 1
                                                                }}>
                                                                    Logo Design
                                                                </Typography>
                                                                <Box sx={{
                                                                    width: 'max-content',
                                                                    height: 'max-content',
                                                                    borderRadius: 1.5,
                                                                    overflow: 'hidden',
                                                                    background: '#f8fafc',
                                                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                    }
                                                                }}>
                                                                    <img
                                                                        src={request.logoImage}
                                                                        alt="Logo Design"
                                                                        style={{
                                                                            maxWidth: 100,
                                                                            maxHeight: 100,
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <Box sx={{
                                                                        display: 'none',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        color: '#94a3b8'
                                                                    }}>
                                                                        <Typography variant="body2">
                                                                            Logo Preview
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {/* Referenced Images Section */}
                                                        {item.images && item.images.length > 0 && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(102, 126, 234, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(102, 126, 234, 0.08)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 2
                                                                }}>
                                                                    Referenced Images ({item.images.length})
                                                                </Typography>
                                                                <Grid container spacing={1}>
                                                                    {item.images.slice(0, 4).map((image, imgIndex) => (
                                                                        <Grid key={imgIndex} sx={{flex: 1}}>
                                                                            <Box sx={{
                                                                                width: 'max-content',
                                                                                height: 'max-content',
                                                                                borderRadius: 1.5,
                                                                                overflow: 'hidden',
                                                                                background: '#f8fafc',
                                                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'scale(1.05)',
                                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                                }
                                                                            }}>
                                                                                <img
                                                                                    src={image.url}
                                                                                    alt={`Reference ${imgIndex + 1}`}
                                                                                    style={{
                                                                                        width: 100,
                                                                                        height: 100,
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.nextSibling.style.display = 'flex';
                                                                                    }}
                                                                                />
                                                                                <Box sx={{
                                                                                    display: 'none',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    color: '#94a3b8'
                                                                                }}>
                                                                                    <Typography variant="caption">
                                                                                        Image {imgIndex + 1}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* No Data Message */}
                        {(!request.listItemDesign?.filter(item => item.itemCategory === 'REGULAR').length ||
                            request.listItemDesign?.filter(item => item.itemCategory === 'REGULAR').length === 0) && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                background: 'rgba(102, 126, 234, 0.02)',
                                borderRadius: 3,
                                border: '2px dashed rgba(102, 126, 234, 0.2)'
                            }}>
                                <SchoolIcon sx={{fontSize: 48, color: '#667eea', mb: 2, opacity: 0.6}}/>
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
                    borderTop: '1px solid rgba(102, 126, 234, 0.08)'
                }}>
                    <Button
                        onClick={() => setRegularDialogOpen(false)}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: '#5a6fd8',
                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
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
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(5, 150, 105, 0.1)',
                        boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(5, 150, 105, 0.05)',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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

                        {/* Boy Physical Education Uniforms Section */}
                        {request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL' && item.gender === 'BOY').length > 0 && (
                            <Box sx={{mb: 4}}>
                                <Grid container spacing={3}>
                                    {request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL' && item.gender === 'BOY').map((item, index) => (
                                        <Grid key={index} sx={{flex: 1}}>
                                            <Card sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(5, 150, 105, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(5, 150, 105, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: '0 12px 40px rgba(5, 150, 105, 0.25)',
                                                    borderColor: 'rgba(5, 150, 105, 0.3)'
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                                }
                                            }}>
                                                <CardContent sx={{p: 4}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 3}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                                        }}>
                                                            {getItemIcon(item.itemType)}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6"
                                                                        sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {item.itemType}
                                                            </Typography>
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontWeight: 500}}>
                                                                Boy
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                        {renderColorWithPicker(item.color, '#059669')}

                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#059669'
                                                            }}/>
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 600, color: '#374151'}}>
                                                                Fabric: <span style={{
                                                                color: '#059669',
                                                                fontWeight: 500
                                                            }}>{item.fabric?.fabricName || 'N/A'}</span>
                                                            </Typography>
                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                                <Box sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    background: '#059669'
                                                                }}/>
                                                                <Typography variant="body2"
                                                                            sx={{fontWeight: 600, color: '#374151'}}>
                                                                    Logo Position: <span style={{
                                                                    color: '#059669',
                                                                    fontWeight: 500
                                                                }}>{item.logoPosition}</span>
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.05)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.1)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontStyle: 'italic',
                                                                    color: '#64748b',
                                                                    fontWeight: 500
                                                                }}>
                                                                    <strong>Note:</strong> {item.note}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Logo Image Section */}
                                                        {request.logoImage && item.itemType === 'SHIRT' && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.08)',
                                                                textAlign: 'left'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 1
                                                                }}>
                                                                    Logo Design
                                                                </Typography>
                                                                <Box sx={{
                                                                    width: 'max-content',
                                                                    height: 'max-content',
                                                                    borderRadius: 1.5,
                                                                    overflow: 'hidden',
                                                                    background: '#f8fafc',
                                                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                    }
                                                                }}>
                                                                    <img
                                                                        src={request.logoImage}
                                                                        alt="Logo Design"
                                                                        style={{
                                                                            maxWidth: 100,
                                                                            maxHeight: 100,
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <Box sx={{
                                                                        display: 'none',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        color: '#94a3b8'
                                                                    }}>
                                                                        <Typography variant="body2">
                                                                            Logo Preview
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {/* Referenced Images Section */}
                                                        {item.images && item.images.length > 0 && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.08)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 2
                                                                }}>
                                                                    Referenced Images ({item.images.length})
                                                                </Typography>
                                                                <Grid container spacing={1}>
                                                                    {item.images.slice(0, 4).map((image, imgIndex) => (
                                                                        <Grid key={imgIndex} sx={{flex: 1}}>
                                                                            <Box sx={{
                                                                                width: 'max-content',
                                                                                height: 'max-content',
                                                                                borderRadius: 1.5,
                                                                                overflow: 'hidden',
                                                                                background: '#f8fafc',
                                                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'scale(1.05)',
                                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                                }
                                                                            }}>
                                                                                <img
                                                                                    src={image.url}
                                                                                    alt={`Reference ${imgIndex + 1}`}
                                                                                    style={{
                                                                                        width: 100,
                                                                                        height: 100,
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.nextSibling.style.display = 'flex';
                                                                                    }}
                                                                                />
                                                                                <Box sx={{
                                                                                    display: 'none',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    color: '#94a3b8'
                                                                                }}>
                                                                                    <Typography variant="caption">
                                                                                        Image {imgIndex + 1}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Girl Physical Education Uniforms Section */}
                        {request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL' && item.gender === 'GIRL').length > 0 && (
                            <Box sx={{mb: 4}}>
                                <Grid container spacing={3}>
                                    {request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL' && item.gender === 'GIRL').map((item, index) => (
                                        <Grid key={index} sx={{flex: 1}}>
                                            <Card sx={{
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '2px solid rgba(5, 150, 105, 0.15)',
                                                borderRadius: 4,
                                                boxShadow: '0 8px 32px rgba(5, 150, 105, 0.12)',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: '0 12px 40px rgba(5, 150, 105, 0.25)',
                                                    borderColor: 'rgba(5, 150, 105, 0.3)'
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '4px',
                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                                }
                                            }}>
                                                <CardContent sx={{p: 4}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 3}}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                                        }}>
                                                            {getItemIcon(item.itemType)}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="h6"
                                                                        sx={{fontWeight: 700, color: '#1e293b'}}>
                                                                {item.itemType}
                                                            </Typography>
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontWeight: 500}}>
                                                                Girl
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                        {renderColorWithPicker(item.color, '#059669')}

                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: '#059669'
                                                            }}/>
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 600, color: '#374151'}}>
                                                                Fabric: <span style={{
                                                                color: '#059669',
                                                                fontWeight: 500
                                                            }}>{item.fabric?.fabricName || 'N/A'}</span>
                                                            </Typography>
                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                                <Box sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    background: '#059669'
                                                                }}/>
                                                                <Typography variant="body2"
                                                                            sx={{fontWeight: 600, color: '#374151'}}>
                                                                    Logo Position: <span style={{
                                                                    color: '#059669',
                                                                    fontWeight: 500
                                                                }}>{item.logoPosition}</span>
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.05)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.1)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontStyle: 'italic',
                                                                    color: '#64748b',
                                                                    fontWeight: 500
                                                                }}>
                                                                    <strong>Note:</strong> {item.note}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Logo Image Section */}
                                                        {request.logoImage && item.itemType === 'SHIRT' && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.08)',
                                                                textAlign: 'left'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 1
                                                                }}>
                                                                    Logo Design
                                                                </Typography>
                                                                <Box sx={{
                                                                    width: 'max-content',
                                                                    height: 'max-content',
                                                                    borderRadius: 1.5,
                                                                    overflow: 'hidden',
                                                                    background: '#f8fafc',
                                                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)',
                                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                    }
                                                                }}>
                                                                    <img
                                                                        src={request.logoImage}
                                                                        alt="Logo Design"
                                                                        style={{
                                                                            maxWidth: 100,
                                                                            maxHeight: 100,
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                    <Box sx={{
                                                                        display: 'none',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        color: '#94a3b8'
                                                                    }}>
                                                                        <Typography variant="body2">
                                                                            Logo Preview
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {/* Referenced Images Section */}
                                                        {item.images && item.images.length > 0 && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                background: 'rgba(5, 150, 105, 0.03)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(5, 150, 105, 0.08)'
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    color: '#64748b',
                                                                    fontWeight: 600,
                                                                    mb: 2
                                                                }}>
                                                                    Referenced Images ({item.images.length})
                                                                </Typography>
                                                                <Grid container spacing={1}>
                                                                    {item.images.slice(0, 4).map((image, imgIndex) => (
                                                                        <Grid key={imgIndex} sx={{flex: 1}}>
                                                                            <Box sx={{
                                                                                width: 'max-content',
                                                                                height: 'max-content',
                                                                                borderRadius: 1.5,
                                                                                overflow: 'hidden',
                                                                                background: '#f8fafc',
                                                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'scale(1.05)',
                                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                                                                }
                                                                            }}>
                                                                                <img
                                                                                    src={image.url}
                                                                                    alt={`Reference ${imgIndex + 1}`}
                                                                                    style={{
                                                                                        width: 100,
                                                                                        height: 100,
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.nextSibling.style.display = 'flex';
                                                                                    }}
                                                                                />
                                                                                <Box sx={{
                                                                                    display: 'none',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    color: '#94a3b8'
                                                                                }}>
                                                                                    <Typography variant="caption">
                                                                                        Image {imgIndex + 1}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* No Data Message */}
                        {(!request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL').length ||
                            request.listItemDesign?.filter(item => item.itemCategory === 'PHYSICAL').length === 0) && (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                background: 'rgba(5, 150, 105, 0.02)',
                                borderRadius: 3,
                                border: '2px dashed rgba(5, 150, 105, 0.2)'
                            }}>
                                <PersonIcon sx={{fontSize: 48, color: '#059669', mb: 2, opacity: 0.6}}/>
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
                    borderTop: '1px solid rgba(5, 150, 105, 0.08)'
                }}>
                    <Button
                        onClick={() => setPhysicalDialogOpen(false)}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#059669',
                            color: '#059669',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: '#047857',
                                backgroundColor: 'rgba(5, 150, 105, 0.04)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}