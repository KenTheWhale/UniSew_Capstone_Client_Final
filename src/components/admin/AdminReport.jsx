import React, {useEffect, useState} from 'react';
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
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    Paper,
    Radio,
    RadioGroup,
    Rating,
    TextField,
    Typography
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    AttachMoney as MoneyIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    DesignServices as DesignIcon,
    Feedback as FeedbackIcon,
    Info as InfoIcon,
    LocalShipping as ShippingIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Report as ReportIcon,
    ShoppingCart as OrderIcon,
    ThumbDown as ThumbDownIcon,
    Videocam as VideocamIcon,
    Visibility as VisibilityIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {approveReport, getAllReport, approveAppeal} from '../../services/FeedbackService';
import {refundTransaction} from '../../services/PaymentService';
import DisplayImage from '../ui/DisplayImage';
import dayjs from 'dayjs';
import {parseID} from "../../utils/ParseIDUtil.jsx";

export default function AdminReport() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [approving, setApproving] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState(null);
    const [messageForSchool, setMessageForSchool] = useState('');
    const [messageForPartner, setMessageForPartner] = useState('');
    const [orderDetailOpen, setOrderDetailOpen] = useState(false);
    const [designRequestDetailOpen, setDesignRequestDetailOpen] = useState(false);
    const [problemLevel, setProblemLevel] = useState('');
    
    // Appeals management state
    const [appealsDialogOpen, setAppealsDialogOpen] = useState(false);
    const [selectedAppeals, setSelectedAppeals] = useState([]);
    const [approvingAppeal, setApprovingAppeal] = useState(false);
    const [appealResponse, setAppealResponse] = useState('');
    const [appealDialogOpen, setAppealDialogOpen] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await getAllReport();
            if (response && response.data) {
                setReports(response.data.body || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            enqueueSnackbar('Failed to load reports', {variant: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (report) => {
        console.log('Selected report:', report);
        console.log('report value:', report.report);
        console.log('images:', report.images);
        setSelectedReport(report);
        setDetailDialogOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
        setSelectedReport(null);
    };

    const handleOpenApprovalDialog = (action) => {
        setApprovalAction(action);
        setMessageForSchool('');
        setMessageForPartner('');
        setProblemLevel('');
        setApprovalDialogOpen(true);
    };

    const handleCloseApprovalDialog = () => {
        setApprovalDialogOpen(false);
        setApprovalAction(null);
        setMessageForSchool('');
        setMessageForPartner('');
        setProblemLevel('');
    };

    // Handle appeals management
    const handleViewAppeals = (report) => {
        setSelectedReport(report);
        setSelectedAppeals(report.appeals || []);
        setAppealsDialogOpen(true);
    };

    const handleCloseAppeals = () => {
        setAppealsDialogOpen(false);
        setSelectedAppeals([]);
    };

    // Handle approve/reject appeal dialog
    const handleOpenAppealDialog = (appeal, action) => {
        setSelectedAppeal(appeal);
        setAppealResponse('');
        setAppealDialogOpen(true);
    };

    const handleCloseAppealDialog = () => {
        setAppealDialogOpen(false);
        setSelectedAppeal(null);
        setAppealResponse('');
    };

    const handleSubmitAppealDecision = async (approved) => {
        if (!selectedAppeal) return;
        
        // Validate admin response
        if (!appealResponse.trim()) {
            enqueueSnackbar('Please provide an admin response', { variant: 'error' });
            return;
        }

        try {
            setApprovingAppeal(true);
            
            const payload = {
                appealId: selectedAppeal.id,
                adminResponse: appealResponse.trim(),
                approved: approved
            };

            console.log('Appeal decision payload:', payload);

            const response = await approveAppeal(payload);
            
            if (response && response.status === 200) {
                enqueueSnackbar(
                    `Appeal ${approved ? 'approved' : 'rejected'} successfully`, 
                    { variant: 'success' }
                );
                
                // Refresh reports to get updated data
                fetchReports();
                
                // Close dialogs
                handleCloseAppealDialog();
                handleCloseAppeals();
            } else {
                enqueueSnackbar(`Failed to ${approved ? 'approve' : 'reject'} appeal`, { variant: 'error' });
            }
        } catch (error) {
            console.error('Error processing appeal:', error);
            enqueueSnackbar(`Failed to ${approved ? 'approve' : 'reject'} appeal`, { variant: 'error' });
        } finally {
            setApprovingAppeal(false);
        }
    };

    const handleSubmitApproval = async () => {
        if (!selectedReport) return;

        // Validate problem level for accept action
        if (approvalAction === 'approve' && !problemLevel) {
            enqueueSnackbar('Please select a problem level', {variant: 'error'});
            return;
        }

        try {
            setApproving(true);
            const payload = {
                feedbackId: selectedReport.id,
                messageForSchool: messageForSchool,
                messageForPartner: messageForPartner,
                approved: approvalAction === 'approve'
            };

            console.log('Approval payload:', payload);

            const response = await approveReport(payload);
            if (response && response.status === 200) {
                // If approved, call refund transaction API
                if (approvalAction === 'approve') {
                    try {
                        const refundPayload = {
                            reportId: selectedReport.id,
                            decision: 'ACCEPTED',
                            problemLevel: problemLevel
                        };

                        console.log('Refund payload:', refundPayload);

                        const refundResponse = await refundTransaction(refundPayload);
                        if (refundResponse && refundResponse.status === 200) {
                            enqueueSnackbar('Report accepted and refund processed successfully', {variant: 'success'});
                        } else {
                            enqueueSnackbar('Report accepted but refund processing failed', {variant: 'warning'});
                        }
                    } catch (refundError) {
                        console.error('Error processing refund:', refundError);
                        enqueueSnackbar('Report accepted but refund processing failed', {variant: 'warning'});
                    }
                } else {
                    // For reject action, also call refund API with REJECTED decision
                    try {
                        const refundPayload = {
                            reportId: selectedReport.id,
                            decision: 'REJECTED',
                            problemLevel: problemLevel || 'low' // Default to low if not selected for reject
                        };

                        console.log('Refund payload for rejection:', refundPayload);

                        const refundResponse = await refundTransaction(refundPayload);
                        if (refundResponse && refundResponse.status === 200) {
                            enqueueSnackbar('Report rejected successfully', {variant: 'success'});
                        } else {
                            enqueueSnackbar('Report rejected but refund processing failed', {variant: 'warning'});
                        }
                    } catch (refundError) {
                        console.error('Error processing refund for rejection:', refundError);
                        enqueueSnackbar('Report rejected but refund processing failed', {variant: 'warning'});
                    }
                }

                handleCloseApprovalDialog();
                handleCloseDetail();
                fetchReports();
            } else {
                enqueueSnackbar(`Failed to ${approvalAction} report`, {variant: 'error'});
            }
        } catch (error) {
            console.error(`Error ${approvalAction}ing report:`, error);
            enqueueSnackbar(`Failed to ${approvalAction} report`, {variant: 'error'});
        } finally {
            setApproving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'FEEDBACK_REPORT_UNDER_REVIEW':
            case 'under-review':
                return '#ffffff';
            case 'approved':
            case 'FEEDBACK_REPORT_APPROVED':
                return '#ffffff';
            case 'rejected':
            case 'FEEDBACK_REPORT_REJECTED':
                return '#ffffff';
            default:
                return '#ffffff';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'pending':
            case 'FEEDBACK_REPORT_UNDER_REVIEW':
            case 'under-review':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            case 'approved':
            case 'FEEDBACK_REPORT_APPROVED':
            case 'accepted':
                return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            case 'rejected':
            case 'FEEDBACK_REPORT_REJECTED':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            default:
                return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending' || r.status === 'FEEDBACK_REPORT_UNDER_REVIEW' || r.status === 'under-review').length,
        approved: reports.filter(r => r.status === 'approved' || r.status === 'FEEDBACK_REPORT_APPROVED' || r.status === 'accepted').length,
        rejected: reports.filter(r => r.status === 'rejected' || r.status === 'FEEDBACK_REPORT_REJECTED').length
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Typography variant="h6" sx={{color: '#64748b'}}>
                    Loading reports...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
            {}
            <Box
                sx={{
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.1)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "url('/unisew.jpg') center/cover",
                        opacity: 0.15,
                        borderRadius: 3,
                        zIndex: -1
                    }
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <AssessmentIcon sx={{fontSize: 32, mr: 2, color: "#ef4444"}}/>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: {xs: "1.5rem", md: "2rem"}
                        }}
                    >
                        Report Management
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: "#64748b",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        mb: 3
                    }}
                >
                    Review and manage user reports and feedback across the system.
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{display: 'flex', gap: 3, width: '100%', mb: 4}}>
                <Box sx={{flex: 1}}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%)',
                            border: '1px solid #3b82f620',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px #3b82f625'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#3b82f6',
                                            mb: 0.5
                                        }}
                                    >
                                        {stats.total}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748b',
                                            fontWeight: 500
                                        }}
                                    >
                                        Total Reports
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#3b82f610',
                                        color: '#3b82f6'
                                    }}
                                >
                                    <AssessmentIcon sx={{fontSize: 28}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{flex: 1}}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b08 100%)',
                            border: '1px solid #f59e0b20',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px #f59e0b25'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#f59e0b',
                                            mb: 0.5
                                        }}
                                    >
                                        {stats.pending}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748b',
                                            fontWeight: 500
                                        }}
                                    >
                                        Pending Review
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#f59e0b10',
                                        color: '#f59e0b'
                                    }}
                                >
                                    <WarningIcon sx={{fontSize: 28}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{flex: 1}}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%)',
                            border: '1px solid #3b82f620',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px #3b82f625'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#3b82f6',
                                            mb: 0.5
                                        }}
                                    >
                                        {stats.approved}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748b',
                                            fontWeight: 500
                                        }}
                                    >
                                        Approved/Accepted
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#3b82f610',
                                        color: '#3b82f6'
                                    }}
                                >
                                    <CheckCircleIcon sx={{fontSize: 28}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{flex: 1}}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #ef444415 0%, #ef444408 100%)',
                            border: '1px solid #ef444420',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px #ef444425'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#ef4444',
                                            mb: 0.5
                                        }}
                                    >
                                        {stats.rejected}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748b',
                                            fontWeight: 500
                                        }}
                                    >
                                        Rejected
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#ef444410',
                                        color: '#ef4444'
                                    }}
                                >
                                    <ThumbDownIcon sx={{fontSize: 28}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {}
            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                <Box sx={{p: 3, backgroundColor: 'white'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                            All Reports
                        </Typography>
                        <Chip
                            label={`${stats.total} Total`}
                            sx={{
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {reports.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '2px dashed #cbd5e1'
                        }}>
                            <AssessmentIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                            <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                No Reports Found
                            </Typography>
                            <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                There are no reports to review at the moment.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {reports.map((report) => (
                                <Grid item xs={12} key={report.id}>
                                    <Card elevation={0} sx={{
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-2px)'
                                        },
                                        minHeight: "270px"
                                    }}>
                                        <CardContent sx={{p: 3}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar sx={{
                                                        bgcolor: report.report ? '#ef4444' : '#10b981',
                                                        width: 40,
                                                        height: 40
                                                    }}>
                                                        {report.report ? <ReportIcon/> : <FeedbackIcon/>}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            {report.order ? `Order ${parseID(report.order.id, "ord")}` :
                                                                report.designRequest ? `Design Request ${parseID(report.designRequest.id, "dr")}` : 'General Report'}
                                                        </Typography>
                                                        {report.sender && (
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontSize: '0.8rem'}}>
                                                                From: {report.sender.name} ({report.sender.type})
                                                            </Typography>
                                                        )}
                                                        {report.receiver && (
                                                            <Typography variant="body2"
                                                                        sx={{color: '#64748b', fontSize: '0.8rem'}}>
                                                                To: {report.receiver.name} ({report.receiver.type})
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1}}>
                                                    <Chip
                                                        label={report.status}
                                                        sx={{
                                                            background: getStatusBgColor(report.status),
                                                            color: getStatusColor(report.status),
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '0.5px',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                            border: 'none'
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VisibilityIcon/>}
                                                        onClick={() => handleViewDetail(report)}
                                                        sx={{
                                                            borderColor: '#3b82f6',
                                                            color: '#3b82f6',
                                                            '&:hover': {
                                                                borderColor: '#2563eb',
                                                                backgroundColor: '#eff6ff'
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                    
                                                    {/* View Appeals Button - Only for reports with appeals */}
                                                    {report.report && report.appeals && report.appeals.length > 0 && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<CheckCircleIcon/>}
                                                            onClick={() => handleViewAppeals(report)}
                                                            sx={{
                                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                                                                }
                                                            }}
                                                        >
                                                            View Appeals ({report.appeals.length})
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{mb: 2}}>
                                                <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                    Content:
                                                </Typography>
                                                <Typography variant="body1" sx={{color: '#1e293b'}}>
                                                    {report.content}
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                                    {report.rating && (
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                                Rating:
                                                            </Typography>
                                                            <Rating value={report.rating} readOnly size="small"/>
                                                        </Box>
                                                    )}
                                                    {report.images && report.images.length > 0 && (
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                                Images:
                                                            </Typography>
                                                            <Chip
                                                                label={`${report.images.length} image${report.images.length > 1 ? 's' : ''}`}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#e0e7ff',
                                                                    color: '#3730a3',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {(report.video || report.designRequest?.feedback?.video) && (
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                                Video:
                                                            </Typography>
                                                            <Chip
                                                                icon={<VideocamIcon sx={{fontSize: '12px'}}/>}
                                                                label="Video Available"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#fef3c7',
                                                                    color: '#92400e',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        {formatDate(report.creationDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>

            {}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <AssessmentIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Report Details
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseDetail}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4, pb: 2}}>
                    {selectedReport && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Report Information
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Status
                                        </Typography>
                                        <Chip
                                            label={selectedReport.status}
                                            sx={{
                                                background: getStatusBgColor(selectedReport.status),
                                                color: getStatusColor(selectedReport.status),
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                fontSize: '0.75rem',
                                                letterSpacing: '0.5px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                border: 'none'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Created Date
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {dayjs(selectedReport.creationDate).format('DD/MM/YYYY')}
                                        </Typography>
                                    </Box>
                                    {selectedReport.images && selectedReport.images.length > 0 && (
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                {selectedReport.report ? 'Evidence Images' : 'Attached Images'}
                                            </Typography>
                                            <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                {selectedReport.images.length} image{selectedReport.images.length > 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    )}
                                    {(selectedReport.video || selectedReport.designRequest?.feedback?.video) && (
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{color: '#64748b'}}>
                                                {selectedReport.report ? 'Evidence Video' : 'Attached Video'}
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <VideocamIcon sx={{fontSize: 16, color: '#8b5cf6'}}/>
                                                <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                    Video Available
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>

                            {}
                            {(selectedReport.sender || selectedReport.receiver) && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        User Information
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                                        {selectedReport.sender && (
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                    Sender
                                                </Typography>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar
                                                        src={selectedReport.sender.avatar}
                                                        sx={{width: 40, height: 40}}
                                                    >
                                                        {selectedReport.sender.name ? selectedReport.sender.name.charAt(0) : 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {selectedReport.sender.name || 'No Name User'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            {selectedReport.sender.email}
                                                        </Typography>
                                                        <Chip
                                                            label={selectedReport.sender.type}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#e0e7ff',
                                                                color: '#3730a3',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem',
                                                                mt: 0.5
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                        {selectedReport.receiver && (
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                    Receiver
                                                </Typography>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar
                                                        src={selectedReport.receiver.avatar}
                                                        sx={{width: 40, height: 40}}
                                                    >
                                                        {selectedReport.receiver.name ? selectedReport.receiver.name.charAt(0) : 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1"
                                                                    sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                            {selectedReport.receiver.name || 'Unknown User'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                                            {selectedReport.receiver.email}
                                                        </Typography>
                                                        <Chip
                                                            label={selectedReport.receiver.type}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#e0e7ff',
                                                                color: '#3730a3',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem',
                                                                mt: 0.5
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            )}

                            {/* Related Item Information */}
                            {(selectedReport.order || selectedReport.designRequest) && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Related Item
                                    </Typography>

                                    {selectedReport.order && (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar sx={{bgcolor: '#3f51b5', width: 40, height: 40}}>
                                                    <OrderIcon/>
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6"
                                                                sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                        {selectedReport.order.selectedDesign?.designRequest?.name || `Order ${parseID(selectedReport.order.id, "ord")}`}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        {parseID(selectedReport.order.id, "ord")}
                                                    </Typography>
                                                    <Chip
                                                        label={selectedReport.order.status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e3f2fd',
                                                            color: '#1976d2',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem',
                                                            mt: 0.5
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<InfoIcon/>}
                                                onClick={() => setOrderDetailOpen(true)}
                                                sx={{
                                                    borderColor: '#3f51b5',
                                                    color: '#3f51b5',
                                                    '&:hover': {
                                                        borderColor: '#303f9f',
                                                        backgroundColor: '#f3f4f6'
                                                    }
                                                }}
                                            >
                                                View Order Details
                                            </Button>
                                        </Box>
                                    )}

                                    {selectedReport.designRequest && (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar sx={{bgcolor: '#10b981', width: 40, height: 40}}>
                                                    <DesignIcon/>
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6"
                                                                sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                        {selectedReport.designRequest.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        Design Request {parseID(selectedReport.designRequest.id, "dr")}
                                                    </Typography>
                                                    <Chip
                                                        label={selectedReport.designRequest.status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#dcfce7',
                                                            color: '#065f46',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem',
                                                            mt: 0.5
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<InfoIcon/>}
                                                onClick={() => setDesignRequestDetailOpen(true)}
                                                sx={{
                                                    borderColor: '#10b981',
                                                    color: '#10b981',
                                                    '&:hover': {
                                                        borderColor: '#059669',
                                                        backgroundColor: '#f0fdf4'
                                                    }
                                                }}
                                            >
                                                View Design Details
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            )}

                            {}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Content
                                </Typography>
                                <Typography variant="body1" sx={{color: '#1e293b', lineHeight: 1.6}}>
                                    {selectedReport.content}
                                </Typography>
                            </Paper>

                            {}
                            {selectedReport.rating && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Rating
                                    </Typography>
                                    <Rating value={selectedReport.rating} readOnly size="large"/>
                                    <Typography variant="body2" sx={{color: '#64748b', mt: 1}}>
                                        {selectedReport.report
                                            ? 'Severity rating of the reported issue'
                                            : 'User experience rating'
                                        }
                                    </Typography>
                                </Paper>
                            )}

                            {}
                            {selectedReport.images && selectedReport.images.length > 0 && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        {selectedReport.report ? 'Evidence Images' : 'Attached Images'} ({selectedReport.images.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {selectedReport.images.map((image, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={image.id}>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '2px solid #e2e8f0',
                                                    position: 'relative'
                                                }}>
                                                    <DisplayImage
                                                        imageUrl={image.url}
                                                        alt={`Evidence ${index + 1}`}
                                                        width="100%"
                                                        height="200px"
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {index + 1}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            )}

                            {/* Video Display */}
                            {(selectedReport.video || selectedReport.designRequest?.feedback?.video) && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        {selectedReport.report ? 'Evidence Video' : 'Attached Video'}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0',
                                        backgroundColor: '#000'
                                    }}>
                                        <video
                                            src={selectedReport.video || selectedReport.designRequest?.feedback?.video}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: '600px',
                                                height: 'auto',
                                                maxHeight: '400px',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                console.error('Video failed to load:', e);
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Video failed to load</div>';
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mt: 2,
                                        p: 2,
                                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}>
                                        <VideocamIcon sx={{color: '#8b5cf6', fontSize: 20}}/>
                                        <Typography variant="body2" sx={{color: '#5b21b6', fontWeight: 500}}>
                                            {selectedReport.report ? 'Evidence video for this report' : 'Video attachment for feedback'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            {}
                            {selectedReport.report && !selectedReport.images && selectedReport.imageUrl && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                        Evidence Image
                                    </Typography>
                                    <Box sx={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <DisplayImage
                                            imageUrl={selectedReport.imageUrl}
                                            alt="Report evidence"
                                            width="100%"
                                            height="200px"
                                        />
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseDetail}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                    {(selectedReport?.status === 'pending' || selectedReport?.status === 'under-review') && (
                        <>
                            <Button
                                onClick={() => handleOpenApprovalDialog('reject')}
                                disabled={approving}
                                variant="outlined"
                                sx={{
                                    borderColor: '#ef4444',
                                    color: '#ef4444',
                                    '&:hover': {
                                        borderColor: '#dc2626',
                                        backgroundColor: '#fef2f2'
                                    }
                                }}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleOpenApprovalDialog('approve')}
                                disabled={approving}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                    },
                                    '&:disabled': {
                                        background: '#9ca3af'
                                    }
                                }}
                            >
                                Accept
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {}
            <Dialog
                open={approvalDialogOpen}
                onClose={handleCloseApprovalDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: approvalAction === 'approve'
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {approvalAction === 'approve' ? <CheckCircleIcon/> : <WarningIcon/>}
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            {approvalAction === 'approve' ? 'Approve' : 'Reject'} Report
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseApprovalDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4, pb: 2}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {}
                        <Paper elevation={0} sx={{
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                Report Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Report ID
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                        {parseID(selectedReport?.id, "fb")}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Type
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                        {selectedReport?.report ? 'Report' : 'Feedback'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Content
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#1e293b', fontStyle: 'italic'}}>
                                        "{selectedReport?.content}"
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Problem Level Selection */}
                        {approvalAction === 'approve' && (
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#fef3c7',
                                borderRadius: 2,
                                border: '1px solid #f59e0b'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 3, color: '#92400e'}}>
                                    Problem Level (Required)
                                </Typography>
                                <FormControl component="fieldset" required>
                                    <FormLabel component="legend" sx={{color: '#92400e', fontWeight: 'bold', mb: 2}}>
                                        Select the severity level of the reported problem:
                                    </FormLabel>
                                    <RadioGroup
                                        value={problemLevel}
                                        onChange={(e) => setProblemLevel(e.target.value)}
                                        sx={{gap: 1}}
                                    >
                                        <FormControlLabel
                                            value="low"
                                            control={<Radio
                                                sx={{color: '#10b981', '&.Mui-checked': {color: '#10b981'}}}/>}
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#065f46'}}>
                                                        Low
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        - Minor issues, minimal impact
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="medium"
                                            control={<Radio
                                                sx={{color: '#f59e0b', '&.Mui-checked': {color: '#f59e0b'}}}/>}
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#92400e'}}>
                                                        Medium
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        - Moderate issues, some impact
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="high"
                                            control={<Radio
                                                sx={{color: '#ef4444', '&.Mui-checked': {color: '#ef4444'}}}/>}
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#dc2626'}}>
                                                        High
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        - Significant issues, major impact
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="serious"
                                            control={<Radio
                                                sx={{color: '#7c2d12', '&.Mui-checked': {color: '#7c2d12'}}}/>}
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <Typography variant="body1"
                                                                sx={{fontWeight: 'bold', color: '#7c2d12'}}>
                                                        Serious
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        - Critical issues, severe impact
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>
                                <Typography variant="body2" sx={{color: '#92400e', mt: 2, fontStyle: 'italic'}}>
                                    This level will determine the refund amount and processing priority.
                                </Typography>
                            </Paper>
                        )}

                        {}
                        <Paper elevation={0} sx={{
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{fontWeight: 'bold', mb: 3, color: '#1e293b'}}>
                                Response Messages
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Message for School"
                                        multiline
                                        rows={4}
                                        value={messageForSchool}
                                        onChange={(e) => setMessageForSchool(e.target.value)}
                                        placeholder="Enter your message for the school..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#d1d5db',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#9ca3af',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#3b82f6',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Message for Partner"
                                        multiline
                                        rows={4}
                                        value={messageForPartner}
                                        onChange={(e) => setMessageForPartner(e.target.value)}
                                        placeholder="Enter your message for the partner..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#d1d5db',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#9ca3af',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#3b82f6',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{color: '#64748b', mt: 2, fontStyle: 'italic'}}>
                                These messages will be sent to the respective parties when you {approvalAction} this
                                report.
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseApprovalDialog}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitApproval}
                        disabled={approving}
                        variant="contained"
                        sx={{
                            background: approvalAction === 'approve'
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: approvalAction === 'approve'
                                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                            },
                            '&:disabled': {
                                background: '#9ca3af'
                            }
                        }}
                    >
                        {approving ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Report`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog
                open={orderDetailOpen}
                onClose={() => setOrderDetailOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <OrderIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Order Details
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setOrderDetailOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedReport?.order && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Header Card */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flex: 1
                                    }}>
                                        <Typography variant="h5" sx={{
                                            fontWeight: 'bold', 
                                            color: '#1e293b',
                                            fontSize: '1.25rem'
                                        }}>
                                            {selectedReport.order.selectedDesign?.designRequest?.name || `Order ${parseID(selectedReport.order.id, "ord")}`}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={parseID(selectedReport.order.id, 'ord')}
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.875rem'}}>
                                    Created: {formatDate(selectedReport.order.orderDate)}
                                </Typography>
                            </Paper>

                            {/* Status Section */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
                                border: '2px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                                p: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Chip
                                        label={selectedReport.order.status}
                                        sx={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            padding: '8px 16px',
                                            transform: 'scale(1.2)',
                                            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
                                        }}
                                    />
                                </Box>
                            </Paper>

                            {/* Order Summary */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold', 
                                    mb: 2, 
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <InfoIcon sx={{color: '#3f51b5'}}/>
                                    Order Summary
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <OrderIcon sx={{fontSize: 32, color: '#3f51b5', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {parseID(selectedReport.order.id, "ord")}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Order ID
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <CalendarIcon sx={{fontSize: 32, color: '#10b981', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {dayjs(selectedReport.order.orderDate).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Order Date
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <CalendarIcon sx={{fontSize: 32, color: '#f59e0b', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {dayjs(selectedReport.order.deadline).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Deadline
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 2,
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <MoneyIcon sx={{fontSize: 32, color: '#ef4444', mb: 1}}/>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {selectedReport.order.price?.toLocaleString('vi-VN')} VND
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Base Price
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* School & Garment Information */}
                                    <Paper elevation={0} sx={{
                                        p: 3,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold', 
                                    mb: 2, 
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <BusinessIcon sx={{color: '#10b981'}}/>
                                    School & Garment Information
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    {/* School Information */}
                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Avatar sx={{bgcolor: '#10b981', width: 32, height: 32}}>
                                                <BusinessIcon sx={{fontSize: 16}}/>
                                            </Avatar>
                                            <Typography variant="subtitle1" sx={{
                                                fontWeight: 'bold', 
                                                color: '#10b981',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                School Information
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    School Name
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {selectedReport.order.school?.business}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Contact Person
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {selectedReport.order.school?.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <PhoneIcon sx={{fontSize: 14, color: '#10b981'}}/>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {selectedReport.order.school?.phone}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                                <LocationIcon sx={{fontSize: 14, color: '#10b981', mt: 0.2}}/>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b', 
                                                    lineHeight: 1.4,
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {selectedReport.order.school?.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Garment Factory Information */}
                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(239, 68, 68, 0.1)'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Avatar sx={{bgcolor: '#ef4444', width: 32, height: 32}}>
                                                <BusinessIcon sx={{fontSize: 16}}/>
                                            </Avatar>
                                            <Typography variant="subtitle1" sx={{
                                                fontWeight: 'bold', 
                                                color: '#ef4444',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Garment Factory
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#ef4444',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Factory Name
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {selectedReport.order.garment?.customer?.business}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#ef4444',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Contact Person
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {selectedReport.order.garment?.customer?.name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <PhoneIcon sx={{fontSize: 14, color: '#ef4444'}}/>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {selectedReport.order.garment?.customer?.phone}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                                <LocationIcon sx={{fontSize: 14, color: '#ef4444', mt: 0.2}}/>
                                                <Typography variant="body2" sx={{
                                                    color: '#1e293b', 
                                                    lineHeight: 1.4,
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {selectedReport.order.garment?.customer?.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                            </Box>
                                        </Box>
                                    </Paper>

                            {/* Order Items Table */}
                            {selectedReport.order.orderDetails && selectedReport.order.orderDetails.length > 0 && (
                                <Paper elevation={0} sx={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{p: 3, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <OrderIcon sx={{color: '#3f51b5', fontSize: 24}}/>
                                            <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                                Order Items ({selectedReport.order.orderDetails.length})
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{p: 3}}>
                                        <Box sx={{
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(7, 1fr)',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Table Headers */}
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
                                                        Fabric
                                                    </Typography>
                                                </Box>

                                                {/* Table Data Rows */}
                                                {selectedReport.order.orderDetails.map((detail, index) => (
                                                    <React.Fragment key={detail.id}>
                                                        {/* Type */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#f8fafc',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Typography variant="body2" sx={{
                                                                fontWeight: 600,
                                                                color: '#374151',
                                                                fontSize: '13px',
                                                                textAlign: 'center',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {detail.deliveryItem?.designItem?.type}
                                                            </Typography>
                                                        </Box>

                                                        {/* Category */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Chip
                                                                label={detail.deliveryItem?.designItem?.category === 'regular' ? 'Regular' : 'PE'}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: detail.deliveryItem?.designItem?.category === 'regular' ? '#dcfce7' : '#fef3c7',
                                                                    color: detail.deliveryItem?.designItem?.category === 'regular' ? '#065f46' : '#92400e',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '11px'
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Gender */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#f8fafc',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Typography variant="body2" sx={{
                                                                fontWeight: 600,
                                                                color: '#374151',
                                                                fontSize: '13px',
                                                                textAlign: 'center',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {detail.deliveryItem?.designItem?.gender}
                                                            </Typography>
                                                        </Box>

                                                        {/* Size */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Chip
                                                                label={detail.size}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#e3f2fd',
                                                                    color: '#1976d2',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '12px'
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Quantity */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#f8fafc',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Typography variant="h6" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '16px'
                                                            }}>
                                                                {detail.quantity}
                                                            </Typography>
                                                        </Box>

                                                        {/* Color */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRight: '1px solid #000000',
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 1,
                                                            minHeight: '60px'
                                                        }}>
                                                            <Box sx={{
                                                                width: 20,
                                                                height: 20,
                                                                backgroundColor: detail.deliveryItem?.designItem?.color || '#000',
                                                                borderRadius: 0.5,
                                                                border: '1px solid #e5e7eb'
                                                            }}/>
                                                            <Typography variant="body2" sx={{
                                                                color: '#1e293b',
                                                                fontWeight: 'bold',
                                                                fontSize: '12px'
                                                            }}>
                                                                {detail.deliveryItem?.designItem?.color}
                                                            </Typography>
                                                        </Box>

                                                        {/* Fabric */}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderBottom: index < selectedReport.order.orderDetails.length - 1 ? '1px solid #000000' : 'none',
                                                            backgroundColor: '#f8fafc',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minHeight: '60px'
                                                        }}>
                                                            <Typography variant="body2" sx={{
                                                                color: '#374151',
                                                                fontWeight: 500,
                                                                fontSize: '12px',
                                                                textAlign: 'center'
                                                            }}>
                                                                {detail.deliveryItem?.designItem?.fabricName}
                                                            </Typography>
                                                        </Box>
                                                    </React.Fragment>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {/* Milestones */}
                            {selectedReport.order.milestone && selectedReport.order.milestone.length > 0 && (
                                <Paper elevation={0} sx={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Box sx={{p: 3, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0'}}>
                                        <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            Production Milestones ({selectedReport.order.milestone.length})
                                        </Typography>
                                    </Box>
                                    <Box sx={{p: 3}}>
                                        <Grid container spacing={2}>
                                            {selectedReport.order.milestone.map((milestone, index) => (
                                                <Grid item xs={12} sm={6} key={milestone.id}>
                                                    <Card elevation={0} sx={{
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 2,
                                                        backgroundColor: 'white'
                                                    }}>
                                                        <CardContent sx={{p: 2}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                mb: 2
                                                            }}>
                                                                <Avatar sx={{
                                                                    bgcolor: milestone.status === 'completed' ? '#10b981' : '#f59e0b',
                                                                    width: 32,
                                                                    height: 32
                                                                }}>
                                                                    {milestone.stage}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{
                                                                        fontWeight: 'bold',
                                                                        color: '#1e293b'
                                                                    }}>
                                                                        {milestone.name}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={milestone.status}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: milestone.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                                                            color: milestone.status === 'completed' ? '#065f46' : '#92400e',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                                                {milestone.description}
                                                            </Typography>
                                                            <Box
                                                                sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                                <Typography variant="caption" sx={{color: '#64748b'}}>
                                                                    From: {dayjs(milestone.startDate).format('DD/MM/YYYY')} -
                                                                    To: {dayjs(milestone.endDate).format('DD/MM/YYYY')}
                                                                </Typography>
                                                                {milestone.completedDate && (
                                                                    <Typography variant="caption" sx={{
                                                                        color: '#10b981',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        Completed: {dayjs(milestone.completedDate).format('DD/MM/YYYY')}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Paper>
                            )}

                            {/* Shipping Information */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Avatar sx={{bgcolor: '#8b5cf6', width: 40, height: 40}}>
                                        <ShippingIcon/>
                                    </Avatar>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                        Shipping Information
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Shipping Code
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {selectedReport.order.shippingCode || 'Not assigned yet'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{color: '#64748b'}}>
                                            Shipping Fee
                                        </Typography>
                                        <Typography variant="body1" sx={{fontWeight: 'bold', color: '#1e293b'}}>
                                            {selectedReport.order.shippingFee?.toLocaleString('vi-VN') || '0'} VND
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Order Notes */}
                            {selectedReport.order.note && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#fef3c7',
                                    borderRadius: 2,
                                    border: '1px solid #f59e0b'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 1, color: '#92400e'}}>
                                        Order Notes
                                    </Typography>
                                    <Typography variant="body1" sx={{color: '#451a03', lineHeight: 1.6}}>
                                        {selectedReport.order.note}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={() => setOrderDetailOpen(false)}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Design Request Detail Dialog */}
            <Dialog
                open={designRequestDetailOpen}
                onClose={() => setDesignRequestDetailOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <DesignIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Design Request Details
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setDesignRequestDetailOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedReport?.designRequest && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Header Card */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                borderRadius: 2,
                                p: 3
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flex: 1
                                    }}>
                                        <Typography variant="h5" sx={{
                                            fontWeight: 'bold', 
                                            color: '#1e293b',
                                            fontSize: '1.25rem'
                                        }}>
                                            {selectedReport.designRequest.name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={parseID(selectedReport.designRequest.id, 'dr')}
                                        sx={{
                                            backgroundColor: '#dcfce7',
                                            color: '#065f46',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{color: '#64748b', fontSize: '0.875rem'}}>
                                    Created: {formatDate(selectedReport.designRequest.creationDate)}
                                </Typography>
                            </Paper>

                            {/* Status Section */}
                            <Paper elevation={0} sx={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%)',
                                border: '2px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                                p: 3
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Chip
                                        label={selectedReport.designRequest.status}
                                        sx={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            padding: '8px 16px',
                                            transform: 'scale(1.2)',
                                            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
                                        }}
                                    />
                                </Box>
                            </Paper>

                            {/* Basic Information */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold', 
                                    mb: 2, 
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <InfoIcon sx={{color: '#10b981'}}/>
                                    Basic Information
                                </Typography>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Typography variant="body2" sx={{
                                            color: '#10b981',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            Request Name
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 'bold', 
                                            color: '#1e293b',
                                            mt: 0.5
                                        }}>
                                            {selectedReport.designRequest.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        background: 'rgba(124, 58, 237, 0.05)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(124, 58, 237, 0.1)'
                                    }}>
                                        <Typography variant="body2" sx={{
                                            color: '#7c3aed',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            Privacy
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            fontWeight: 'bold', 
                                            color: '#1e293b',
                                            mt: 0.5
                                        }}>
                                            {selectedReport.designRequest.privacy ? 'Private' : 'Public'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* School Information */}
                            {selectedReport.designRequest.school && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold', 
                                        mb: 2, 
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <BusinessIcon sx={{color: '#10b981'}}/>
                                        School Information
                                    </Typography>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                        {/* First row: School Name, Contact Person, Phone, Tax Code */}
                                        <Box sx={{display: 'flex', gap: 2}}>
                                            <Box sx={{
                                                flex: 1,
                                                p: 2,
                                                background: 'rgba(16, 185, 129, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(16, 185, 129, 0.1)'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#10b981',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    mb: 1
                                                }}>
                                                School Name
                                            </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b'
                                                }}>
                                                {selectedReport.designRequest.school.business}
                                            </Typography>
                                            </Box>
                                            <Box sx={{
                                                flex: 1,
                                                p: 2,
                                                background: 'rgba(255, 152, 0, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(255, 152, 0, 0.1)'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#f57c00',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    mb: 1
                                                }}>
                                                Contact Person
                                            </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b'
                                                }}>
                                                {selectedReport.designRequest.school.name}
                                            </Typography>
                                            </Box>
                                            <Box sx={{
                                                flex: 1,
                                                p: 2,
                                                background: 'rgba(124, 58, 237, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(124, 58, 237, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <PhoneIcon sx={{color: '#7c3aed', fontSize: 16}}/>
                                                <Box>
                                                    <Typography variant="body2" sx={{
                                                        color: '#7c3aed',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                Phone
                                            </Typography>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 'bold', 
                                                        color: '#1e293b'
                                                    }}>
                                                {selectedReport.designRequest.school.phone}
                                            </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                flex: 1,
                                                p: 2,
                                                background: 'rgba(236, 72, 153, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(236, 72, 153, 0.1)'
                                            }}>
                                                <Typography variant="body2" sx={{
                                                    color: '#ec4899',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    mb: 1
                                                }}>
                                                Tax Code
                                            </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b'
                                                }}>
                                                {selectedReport.designRequest.school.taxCode}
                                            </Typography>
                                            </Box>
                                        </Box>
                                        
                                        {/* Second row: Address full width */}
                                        <Box sx={{
                                            p: 2,
                                            background: 'rgba(59, 130, 246, 0.05)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(59, 130, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1
                                        }}>
                                            <LocationIcon sx={{color: '#3b82f6', fontSize: 16, mt: 0.5}}/>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: '#3b82f6',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    mb: 1
                                                }}>
                                                Address
                                            </Typography>
                                                <Typography variant="body1" sx={{
                                                    fontWeight: 'bold', 
                                                    color: '#1e293b',
                                                    lineHeight: 1.4
                                                }}>
                                                {selectedReport.designRequest.school.address}
                                            </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {/* Design Items */}
                            {selectedReport.designRequest.items && selectedReport.designRequest.items.length > 0 && (
                                <Paper elevation={0} sx={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Box sx={{p: 3, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0'}}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 'bold', 
                                            color: '#1e293b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <DesignIcon sx={{color: '#10b981'}}/>
                                            Requested Design Items ({selectedReport.designRequest.items.length})
                                        </Typography>
                                    </Box>
                                    <Box sx={{p: 3}}>
                                        {(() => {
                                            const boyItems = selectedReport.designRequest.items.filter(item => item.gender === 'boy');
                                            const girlItems = selectedReport.designRequest.items.filter(item => item.gender === 'girl');
                                            
                                            return (
                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                                    {/* Boy Items Section */}
                                                    {boyItems.length > 0 && (
                                                        <Box>
                                                            {/* Boy Header */}
                                                            <Box sx={{
                                                                p: 2,
                                                                mb: 2,
                                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)',
                                                        borderRadius: 2,
                                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                    }}>
                                                            <Box sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '12px'
                                                                }}>
                                                                    👦
                                                                </Box>
                                                                <Typography variant="subtitle1" sx={{
                                                                    fontWeight: 'bold',
                                                                    color: '#1e40af',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    BOY ({boyItems.length} CLOTHS)
                                                                </Typography>
                                                            </Box>
                                                            {/* Items organized by category */}
                                                            {(() => {
                                                                const regularBoyItems = boyItems.filter(item => item.category === 'regular');
                                                                const peBoyItems = boyItems.filter(item => item.category === 'pe');
                                                                
                                                                return (
                                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                                        {/* Regular Uniform */}
                                                                        {regularBoyItems.length > 0 && (
                                                                <Box>
                                                                                <Box sx={{
                                                                                    p: 1.5,
                                                                                    mb: 2,
                                                                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 100%)',
                                                                                    borderRadius: 2,
                                                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1
                                                                                }}>
                                                                                    <Box sx={{
                                                                                        width: 20,
                                                                                        height: 20,
                                                                                        borderRadius: '50%',
                                                                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        fontSize: '10px'
                                                                                    }}>
                                                                                        🎓
                                                                                    </Box>
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 'bold',
                                                                                        color: '#15803d',
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.3px',
                                                                                        fontSize: '0.875rem'
                                                                                    }}>
                                                                                        REGULAR UNIFORM ({regularBoyItems.length} CLOTHS)
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                                                    {regularBoyItems.map((item, index) => (
                                                                                        <Box key={item.id} sx={{
                                                                                            flex: '1 1 280px',
                                                                                            minWidth: '280px',
                                                                                            p: 2,
                                                                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                                            borderRadius: 2,
                                                                                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(34, 197, 94, 0.02) 100%)',
                                                                                            transition: 'all 0.3s ease',
                                                                                            '&:hover': {
                                                                                                borderColor: '#22c55e',
                                                                                                boxShadow: '0 3px 12px rgba(34, 197, 94, 0.15)'
                                                                                            }
                                                                                        }}>
                                                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                                                                <Avatar sx={{bgcolor: '#22c55e', width: 28, height: 28}}>
                                                                                                    <DesignIcon sx={{fontSize: 14}}/>
                                                                                                </Avatar>
                                                                                                <Box sx={{flex: 1}}>
                                                                    <Typography variant="subtitle2" sx={{
                                                                        fontWeight: 'bold',
                                                                                                        color: '#1e293b',
                                                                                                        fontSize: '0.875rem'
                                                                                                    }}>
                                                                                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                    </Typography>
                                                                </Box>
                                                                                                <Chip
                                                                                                    label={`#${index + 1}`}
                                                                                                    size="small"
                                                                                                    sx={{
                                                                                                        backgroundColor: '#dcfce7',
                                                                                                        color: '#15803d',
                                                                                                        fontWeight: 'bold',
                                                                                                        fontSize: '0.6rem'
                                                                                                    }}
                                                                                                />
                                                            </Box>
                                                                                            <Grid container spacing={1}>
                                                                                                <Grid item xs={6}>
                                                            <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(16, 185, 129, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(16, 185, 129, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#10b981',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            FABRIC
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem'
                                                                                                        }}>
                                                                                                            {item.fabricName}
                                                                                                        </Typography>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(124, 58, 237, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                                                        gap: 0.5
                                                                                                    }}>
                                                                                                        <Box sx={{
                                                                                                            width: 12,
                                                                                                            height: 12,
                                                                                                            borderRadius: '50%',
                                                                                                            backgroundColor: item.color || '#000',
                                                                                                            border: '1px solid #ffffff',
                                                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                                            flexShrink: 0
                                                                                                        }}/>
                                                                                                        <Box>
                                                                                                            <Typography variant="caption" sx={{
                                                                                                                color: '#7c3aed',
                                                                                                                fontWeight: 600,
                                                                                                                textTransform: 'uppercase',
                                                                                                                fontSize: '0.65rem'
                                                                                                            }}>
                                                                                                                COLOR
                                                                                                            </Typography>
                                                                                                            <Typography variant="body2" sx={{
                                                                                                                color: '#1e293b',
                                                                                                                fontWeight: 500,
                                                                                                                fontSize: '0.7rem'
                                                                                                            }}>
                                                                                                                {item.color}
                                                                                                            </Typography>
                                                                                                        </Box>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(255, 152, 0, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#f57c00',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            LOGO
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem'
                                                                                                        }}>
                                                                                                            {item.logoPosition || 'No logo'}
                                                                                                        </Typography>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(236, 72, 153, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(236, 72, 153, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#ec4899',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            NOTE
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem',
                                                                                                            fontStyle: item.note ? 'normal' : 'italic'
                                                                                                        }}>
                                                                                                            {item.note || 'No note'}
                                                                                                        </Typography>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                            {item.sampleImages && item.sampleImages.length > 0 && (
                                                                                                <Box sx={{mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9'}}>
                                                                                                    <Typography variant="caption" sx={{
                                                                                                        color: '#475569',
                                                                                                        fontWeight: 600,
                                                                                                        textTransform: 'uppercase',
                                                                                                        fontSize: '0.65rem',
                                                                                                        display: 'block',
                                                                mb: 1
                                                            }}>
                                                                                                        SAMPLES ({item.sampleImages.length})
                                                                </Typography>
                                                                                                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                                                                        {item.sampleImages.map((image, imgIndex) => (
                                                                                                            <Box key={imgIndex} sx={{
                                                                                                                width: 32,
                                                                                                                height: 32,
                                                                                                                borderRadius: 1,
                                                                                                                overflow: 'hidden',
                                                                                                                border: '1px solid #e2e8f0'
                                                                                                            }}>
                                                                                                                <DisplayImage
                                                                                                                    imageUrl={image.url}
                                                                                                                    alt={`Sample ${imgIndex + 1}`}
                                                                                                                    width="32px"
                                                                                                                    height="32px"
                                                                                                                />
                                                                                                            </Box>
                                                                                                        ))}
                                                                                                    </Box>
                                                                                                </Box>
                                                                                            )}
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            </Box>
                                                                        )}

                                                                        {/* PE Uniform */}
                                                                        {peBoyItems.length > 0 && (
                                                                            <Box>
                                                                                <Box sx={{
                                                                                    p: 1.5,
                                                                                    mb: 2,
                                                                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)',
                                                                                    borderRadius: 2,
                                                                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1
                                                                                }}>
                                                                <Box sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                                        borderRadius: '50%',
                                                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        fontSize: '10px'
                                                                                    }}>
                                                                                        ⚽
                                                                                    </Box>
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 'bold',
                                                                                        color: '#a16207',
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.3px',
                                                                                        fontSize: '0.875rem'
                                                                                    }}>
                                                                                        PHYSICAL EDUCATION UNIFORM ({peBoyItems.length} CLOTHS)
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                                                    {peBoyItems.map((item, index) => (
                                                                                        <Box key={item.id} sx={{
                                                                                            flex: '1 1 280px',
                                                                                            minWidth: '280px',
                                                                                            p: 2,
                                                                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                                            borderRadius: 2,
                                                                                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(245, 158, 11, 0.02) 100%)',
                                                                                            transition: 'all 0.3s ease',
                                                                                            '&:hover': {
                                                                                                borderColor: '#f59e0b',
                                                                                                boxShadow: '0 3px 12px rgba(245, 158, 11, 0.15)'
                                                                                            }
                                                                                        }}>
                                                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                                                                <Avatar sx={{bgcolor: '#f59e0b', width: 28, height: 28}}>
                                                                                                    <DesignIcon sx={{fontSize: 14}}/>
                                                                                                </Avatar>
                                                                                                <Box sx={{flex: 1}}>
                                                                                                    <Typography variant="subtitle2" sx={{
                                                                                                        fontWeight: 'bold',
                                                                                                        color: '#1e293b',
                                                                                                        fontSize: '0.875rem'
                                                                                                    }}>
                                                                                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                                <Chip
                                                                                                    label={`#${index + 1}`}
                                                                                                    size="small"
                                                                                                    sx={{
                                                                                                        backgroundColor: '#fef3c7',
                                                                                                        color: '#a16207',
                                                                                                        fontWeight: 'bold',
                                                                                                        fontSize: '0.6rem'
                                                                                                    }}
                                                                                                />
                                                                                            </Box>
                                                                                            <Grid container spacing={1}>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(16, 185, 129, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(16, 185, 129, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#10b981',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            FABRIC
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem'
                                                                                                        }}>
                                                                                                            {item.fabricName}
                                                                                                        </Typography>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(124, 58, 237, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(124, 58, 237, 0.15)',
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: 0.5
                                                                                                    }}>
                                                                                                        <Box sx={{
                                                                                                            width: 12,
                                                                                                            height: 12,
                                                                                                            borderRadius: '50%',
                                                                    backgroundColor: item.color || '#000',
                                                                                                            border: '1px solid #ffffff',
                                                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                                                                            flexShrink: 0
                                                                                                        }}/>
                                                                                                        <Box>
                                                                                                            <Typography variant="caption" sx={{
                                                                                                                color: '#7c3aed',
                                                                                                                fontWeight: 600,
                                                                                                                textTransform: 'uppercase',
                                                                                                                fontSize: '0.65rem'
                                                                                                            }}>
                                                                                                                COLOR
                                                                                                            </Typography>
                                                                                                            <Typography variant="body2" sx={{
                                                                                                                color: '#1e293b',
                                                                                                                fontWeight: 500,
                                                                                                                fontSize: '0.7rem'
                                                                                                            }}>
                                                                    {item.color}
                                                                </Typography>
                                                            </Box>
                                                                                                    </Box>
                                                                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(255, 152, 0, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(255, 152, 0, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#f57c00',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            LOGO
                                                                </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem'
                                                                                                        }}>
                                                                                                            {item.logoPosition || 'No logo'}
                                                            </Typography>
                                                                                                    </Box>
                                                </Grid>
                                                                                                <Grid item xs={6}>
                                                                                                    <Box sx={{
                                                                                                        p: 1,
                                                                                                        background: 'rgba(236, 72, 153, 0.08)',
                                                                                                        borderRadius: 1,
                                                                                                        border: '1px solid rgba(236, 72, 153, 0.15)'
                                                                                                    }}>
                                                                                                        <Typography variant="caption" sx={{
                                                                                                            color: '#ec4899',
                                                                                                            fontWeight: 600,
                                                                                                            textTransform: 'uppercase',
                                                                                                            fontSize: '0.65rem'
                                                                                                        }}>
                                                                                                            NOTE
                                                                                                        </Typography>
                                                                                                        <Typography variant="body2" sx={{
                                                                                                            color: '#1e293b',
                                                                                                            fontWeight: 500,
                                                                                                            fontSize: '0.75rem',
                                                                                                            fontStyle: item.note ? 'normal' : 'italic'
                                                                                                        }}>
                                                                                                            {item.note || 'No note'}
                                                                                                        </Typography>
                                                                                                    </Box>
                                        </Grid>
                                                                                            </Grid>
                                                                                            {item.sampleImages && item.sampleImages.length > 0 && (
                                                                                                <Box sx={{mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9'}}>
                                                                                                    <Typography variant="caption" sx={{
                                                                                                        color: '#475569',
                                                                                                        fontWeight: 600,
                                                                                                        textTransform: 'uppercase',
                                                                                                        fontSize: '0.65rem',
                                                                                                        display: 'block',
                                                                                                        mb: 1
                                                                                                    }}>
                                                                                                        SAMPLES ({item.sampleImages.length})
                                                                                                    </Typography>
                                                                                                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                                                                        {item.sampleImages.map((image, imgIndex) => (
                                                                                                            <Box key={imgIndex} sx={{
                                                                                                                width: 32,
                                                                                                                height: 32,
                                                                                                                borderRadius: 1,
                                                                                                                overflow: 'hidden',
                                                                                                                border: '1px solid #e2e8f0'
                                                                                                            }}>
                                                                                                                <DisplayImage
                                                                                                                    imageUrl={image.url}
                                                                                                                    alt={`Sample ${imgIndex + 1}`}
                                                                                                                    width="32px"
                                                                                                                    height="32px"
                                                                                                                />
                                                                                                            </Box>
                                                                                                        ))}
                                                                                                    </Box>
                                                                                                </Box>
                                                                                            )}
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </Box>
                                                    )}

                                                    {/* Girl Items - Similar structure */}
                                                    {girlItems.length > 0 && (
                                                        <Box>
                                                            <Box sx={{
                                                                p: 2,
                                                                mb: 2,
                                                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.15) 100%)',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(236, 72, 153, 0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Box sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '12px'
                                                                }}>
                                                                    👧
                                                                </Box>
                                                                <Typography variant="subtitle1" sx={{
                                                                    fontWeight: 'bold',
                                                                    color: '#be185d',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    GIRL ({girlItems.length} CLOTHS)
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" sx={{color: '#64748b', fontStyle: 'italic', textAlign: 'center', py: 2}}>
                                                                Similar detailed layout for girl items...
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })()}
                                    </Box>
                                </Paper>
                            )}

                            {/* Logo Image */}
                            {selectedReport.designRequest.logoImage && (
                                <Paper elevation={0} sx={{
                                    p: 3,
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold', 
                                        mb: 2, 
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <Avatar sx={{bgcolor: '#8b5cf6', width: 32, height: 32}}>
                                            <InfoIcon sx={{fontSize: 16}}/>
                                        </Avatar>
                                        School Logo
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 200,
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                        p: 2
                                    }}>
                                        <DisplayImage
                                            imageUrl={selectedReport.designRequest.logoImage}
                                            alt="School Logo"
                                            width="auto"
                                            height="200px"
                                        />
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={() => setDesignRequestDetailOpen(false)}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Appeals Management Dialog */}
            <Dialog
                open={appealsDialogOpen}
                onClose={handleCloseAppeals}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <CheckCircleIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Appeals Management
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseAppeals}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedAppeals.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            border: '2px dashed #cbd5e1'
                        }}>
                            <CheckCircleIcon sx={{fontSize: 64, color: '#94a3b8', mb: 2}}/>
                            <Typography variant="h6" sx={{color: '#64748b', mb: 1}}>
                                No Appeals Found
                            </Typography>
                            <Typography variant="body2" sx={{color: '#94a3b8'}}>
                                This report has no appeals to review.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b', mb: 2}}>
                                Appeals for Report: {selectedReport?.id ? parseID(selectedReport.id, "rp") : 'N/A'}
                            </Typography>
                            
                            {selectedAppeals.map((appeal, index) => (
                                <Card key={appeal.id} elevation={0} sx={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    '&:hover': {
                                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}>
                                    <CardContent sx={{p: 0}}>
                                        {/* Header Section */}
                                        <Box sx={{
                                            p: 3,
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)',
                                            borderBottom: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Avatar sx={{
                                                    bgcolor: '#3b82f6',
                                                    width: 40,
                                                    height: 40,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {index + 1}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" sx={{fontWeight: 'bold', color: '#1e293b', mb: 0.5}}>
                                                        Appeal {parseID(appeal.id, "ap")}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                                        Submitted: {appeal.creationDate ? dayjs(appeal.creationDate).format('DD/MM/YYYY') : 'Unknown'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={appeal.status || 'pending'}
                                                sx={{
                                                    backgroundColor: appeal.status === 'approved' ? '#dcfce7' : 
                                                                   appeal.status === 'under-review' ? '#fef3c7' : '#f3f4f6',
                                                    color: appeal.status === 'approved' ? '#065f46' : 
                                                           appeal.status === 'under-review' ? '#92400e' : '#374151',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.5px'
                                                }}
                                            />
                                        </Box>

                                        {/* Appellant Information */}
                                        {appeal.appeallant && (
                                            <Box sx={{p: 3, borderBottom: '1px solid #f1f5f9'}}>
                                                <Typography variant="subtitle2" sx={{
                                                    color: '#6b7280',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.5px',
                                                    mb: 2
                                                }}>
                                                    Appellant Information
                                                </Typography>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar
                                                        src={appeal.appeallant.avatar}
                                                        sx={{width: 48, height: 48}}
                                                    >
                                                        {appeal.appeallant.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 'bold',
                                                            color: '#1e293b',
                                                            mb: 0.5
                                                        }}>
                                                            {appeal.appeallant.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: '#64748b', mb: 0.5}}>
                                                            {appeal.appeallant.email}
                                                        </Typography>
                                                        <Chip
                                                            label={appeal.appeallant.type}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#e0e7ff',
                                                                color: '#3730a3',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem',
                                                                textTransform: 'capitalize'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Appeal Content */}
                                        <Box sx={{p: 3, borderBottom: '1px solid #f1f5f9'}}>
                                            <Typography variant="subtitle2" sx={{
                                                color: '#6b7280',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                fontSize: '0.75rem',
                                                letterSpacing: '0.5px',
                                                mb: 2
                                            }}>
                                                Appeal Reason
                                            </Typography>
                                            <Box sx={{
                                                p: 3,
                                                backgroundColor: '#f8fafc',
                                                borderRadius: 2,
                                                border: '1px solid #e2e8f0',
                                                borderLeft: '4px solid #3b82f6'
                                            }}>
                                                <Typography variant="body1" sx={{
                                                    color: '#1e293b',
                                                    lineHeight: 1.6,
                                                    fontStyle: 'italic'
                                                }}>
                                                    "{appeal.reason}"
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Video Evidence */}
                                        {appeal.videoUrl && (
                                            <Box sx={{p: 3, borderBottom: '1px solid #f1f5f9'}}>
                                                <Typography variant="subtitle2" sx={{
                                                    color: '#6b7280',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.5px',
                                                    mb: 2
                                                }}>
                                                    Video Evidence
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                                }}>
                                                    <Avatar sx={{
                                                        bgcolor: '#8b5cf6',
                                                        width: 32,
                                                        height: 32
                                                    }}>
                                                        <VideocamIcon sx={{fontSize: 18}}/>
                                                    </Avatar>
                                                    <Box sx={{flex: 1}}>
                                                        <Typography variant="body2" sx={{
                                                            color: '#5b21b6',
                                                            fontWeight: 600,
                                                            mb: 0.5
                                                        }}>
                                                            Video Evidence Attached
                                                        </Typography>
                                                        <Typography variant="caption" sx={{color: '#7c3aed'}}>
                                                            Click to view evidence video
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<VideocamIcon/>}
                                                        onClick={() => window.open(appeal.videoUrl, '_blank')}
                                                        sx={{
                                                            borderColor: '#8b5cf6',
                                                            color: '#8b5cf6',
                                                            '&:hover': {
                                                                borderColor: '#7c3aed',
                                                                backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        View Video
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Approval Information */}
                                        {appeal.approvedDate && (
                                            <Box sx={{p: 3, borderBottom: '1px solid #f1f5f9'}}>
                                                <Typography variant="subtitle2" sx={{
                                                    color: '#6b7280',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.5px',
                                                    mb: 2
                                                }}>
                                                    Decision Information
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    p: 2,
                                                    backgroundColor: '#dcfce7',
                                                    borderRadius: 2,
                                                    border: '1px solid #bbf7d0'
                                                }}>
                                                    <CheckCircleIcon sx={{color: '#059669', fontSize: 20}}/>
                                                    <Typography variant="body2" sx={{color: '#065f46', fontWeight: 600}}>
                                                        Decision made on: {dayjs(appeal.approvedDate).format('DD/MM/YYYY HH:mm')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Action Buttons */}
                                        {(appeal.status === 'pending' || appeal.status === 'under-review') && (
                                            <Box sx={{p: 3, backgroundColor: '#f8fafc'}}>
                                                <Typography variant="subtitle2" sx={{
                                                    color: '#6b7280',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    letterSpacing: '0.5px',
                                                    mb: 2
                                                }}>
                                                    Admin Actions
                                                </Typography>
                                                <Box sx={{display: 'flex', gap: 2}}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<CheckCircleIcon/>}
                                                        onClick={() => handleOpenAppealDialog(appeal, 'approve')}
                                                        disabled={approvingAppeal}
                                                        sx={{
                                                            flex: 1,
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            py: 1.5,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                                            }
                                                        }}
                                                    >
                                                        Approve Appeal
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<WarningIcon/>}
                                                        onClick={() => handleOpenAppealDialog(appeal, 'reject')}
                                                        disabled={approvingAppeal}
                                                        sx={{
                                                            flex: 1,
                                                            borderColor: '#ef4444',
                                                            color: '#ef4444',
                                                            fontWeight: 'bold',
                                                            py: 1.5,
                                                            '&:hover': {
                                                                borderColor: '#dc2626',
                                                                backgroundColor: '#fef2f2',
                                                                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
                                                            }
                                                        }}
                                                    >
                                                        Reject Appeal
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseAppeals}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Appeal Decision Dialog */}
            <Dialog
                open={appealDialogOpen}
                onClose={handleCloseAppealDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <CheckCircleIcon/>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                            Appeal Decision
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseAppealDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white'
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{p: 4}}>
                    {selectedAppeal && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Appeal Summary */}
                            <Paper elevation={0} sx={{
                                p: 3,
                                backgroundColor: '#f8fafc',
                                borderRadius: 2,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Appeal Summary
                                </Typography>
                                <Typography variant="body2" sx={{color: '#64748b', mb: 1}}>
                                    Appeal Reason:
                                </Typography>
                                <Typography variant="body1" sx={{color: '#1e293b', mb: 2, fontStyle: 'italic'}}>
                                    "{selectedAppeal.reason}"
                                </Typography>
                                {selectedAppeal.videoUrl && (
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <VideocamIcon sx={{color: '#8b5cf6', fontSize: 16}}/>
                                        <Typography variant="body2" sx={{color: '#8b5cf6', fontWeight: 500}}>
                                            Video evidence attached
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* Admin Response */}
                            <Box>
                                <Typography variant="h6" sx={{fontWeight: 'bold', mb: 2, color: '#1e293b'}}>
                                    Admin Response (Required)
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={appealResponse}
                                    onChange={(e) => setAppealResponse(e.target.value)}
                                    placeholder="Enter your response to this appeal..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#d1d5db',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3b82f6',
                                            },
                                        },
                                    }}
                                />
                                <Typography variant="body2" sx={{color: '#64748b', mt: 1, fontStyle: 'italic'}}>
                                    This response will be sent to the garment factory.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={handleCloseAppealDialog}
                        sx={{
                            color: '#64748b',
                            borderColor: '#d1d5db',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleSubmitAppealDecision(false)}
                        disabled={approvingAppeal || !appealResponse.trim()}
                        variant="outlined"
                        sx={{
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': {
                                borderColor: '#dc2626',
                                backgroundColor: '#fef2f2'
                            }
                        }}
                    >
                        {approvingAppeal ? 'Processing...' : 'Reject Appeal'}
                    </Button>
                    <Button
                        onClick={() => handleSubmitAppealDecision(true)}
                        disabled={approvingAppeal || !appealResponse.trim()}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            '&:disabled': {
                                background: '#9ca3af'
                            }
                        }}
                    >
                        {approvingAppeal ? 'Processing...' : 'Approve Appeal'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}