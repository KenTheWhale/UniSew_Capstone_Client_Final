import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import {
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Home as HomeIcon,
    HourglassEmpty as HourglassIcon,
    Notifications as NotificationsIcon,
    PersonAdd as PersonAddIcon,
    Schedule as ScheduleIcon,
    VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {createPartnerRequest} from "../../services/AuthService.jsx";
import {enqueueSnackbar} from "notistack";

export default function EmailConfirmation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const data = params.get('p');

        if (!data) {
            setStatus('error');
            setMessage('Invalid confirmation link');
            setErrorDetails('The confirmation link is missing or invalid. Please check your email and try again.');
            setLoading(false);
            return;
        }

        createPartnerRequest({
            encryptedData: data
        })
            .then(res => {
                if (res && res.status === 201) {
                    setStatus('success');
                    setMessage(res.data.message || 'Email confirmed successfully!');
                    enqueueSnackbar(res.data.message || 'Email confirmed successfully!', {variant: 'success'});
                } else {
                    setStatus('error');
                    setMessage('Confirmation failed');
                    setErrorDetails('Unable to confirm your email. Please try again or contact support.');
                    enqueueSnackbar('Confirmation failed', {variant: 'error'});
                }
            })
            .catch(e => {
                setStatus('error');
                setMessage('Confirmation failed');
                setErrorDetails(e.response?.data?.message || 'An error occurred during confirmation. Please try again.');
                enqueueSnackbar(e.response?.data?.message || 'Confirmation failed', {variant: 'error'});
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleGoHome = () => {
        navigate('/home');
    };

    const handleRetry = () => {
        window.location.reload();
    };
    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <Container maxWidth="sm">
                    <Paper elevation={12} sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Box sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}>
                            <CircularProgress size={60} sx={{color: 'white'}}/>
                        </Box>
                        <Typography variant="h4" sx={{fontWeight: 800, mb: 2, color: '#2c3e50'}}>
                            Confirming Your Email
                        </Typography>
                        <Typography variant="body1" sx={{color: '#7f8c8d', mb: 3, fontSize: '1.1rem'}}>
                            Please wait while we verify your email address...
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            borderRadius: 3,
                            p: 2,
                            border: '1px solid #2196f3'
                        }}>
                            <HourglassIcon sx={{color: '#1976d2', animation: 'pulse 2s infinite'}}/>
                            <Typography variant="body2" sx={{color: '#1976d2', fontWeight: 600}}>
                                Processing your request
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
        }}>
            <Container maxWidth="md">
                <Paper elevation={12} sx={{
                    p: 5,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                }}>
                    {status === 'success' ? (
                        <Box sx={{textAlign: 'center'}}>
                            <Box sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
                            }}>
                                <CheckCircleIcon sx={{fontSize: 60, color: 'white'}}/>
                            </Box>
                            <Typography variant="h3" sx={{fontWeight: 800, mb: 2, color: '#2e7d32'}}>
                                Email Confirmed Successfully!
                            </Typography>
                            <Typography variant="h6" sx={{mb: 4, color: '#388e3c', fontWeight: 500}}>
                                {message}
                            </Typography>

                            <Card sx={{
                                mb: 4,
                                background: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
                                border: '2px solid #8bc34a',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)'
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                                        }}>
                                            <PersonAddIcon sx={{fontSize: 30, color: 'white'}}/>
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{fontWeight: 700, color: '#2e7d32'}}>
                                                Designer Account Registration
                                            </Typography>
                                            <Typography variant="body1" sx={{color: '#388e3c', fontWeight: 500}}>
                                                Your application is now under review
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{my: 3, borderColor: '#8bc34a'}}/>

                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                        borderRadius: 3,
                                        p: 3,
                                        border: '1px solid #4caf50'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <VerifiedUserIcon sx={{color: '#2e7d32', mr: 1}}/>
                                            <Typography variant="h6" sx={{fontWeight: 700, color: '#2e7d32'}}>
                                                Next Steps:
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                    <ScheduleIcon sx={{color: '#1976d2', mr: 1}}/>
                                                    <Typography variant="body2"
                                                                sx={{color: '#1565c0', fontWeight: 500}}>
                                                        Review Process
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{color: '#388e3c', pl: 3}}>
                                                    Our admin team will review your application within 2-3 business days
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                    <NotificationsIcon sx={{color: '#f57c00', mr: 1}}/>
                                                    <Typography variant="body2"
                                                                sx={{color: '#e65100', fontWeight: 500}}>
                                                        Email Notification
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{color: '#388e3c', pl: 3}}>
                                                    You'll receive an email once your account is approved
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                    <BusinessIcon sx={{color: '#9c27b0', mr: 1}}/>
                                                    <Typography variant="body2"
                                                                sx={{color: '#7b1fa2', fontWeight: 500}}>
                                                        Access Portal
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{color: '#388e3c', pl: 3}}>
                                                    Once approved, you can access the designer portal and start
                                                    receiving projects
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<HomeIcon/>}
                                onClick={handleGoHome}
                                sx={{
                                    borderRadius: 3,
                                    px: 5,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                    boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Go to Home
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{textAlign: 'center'}}>
                            <Box sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)'
                            }}>
                                <ErrorIcon sx={{fontSize: 60, color: 'white'}}/>
                            </Box>
                            <Typography variant="h3" sx={{fontWeight: 800, mb: 2, color: '#d32f2f'}}>
                                Confirmation Failed
                            </Typography>
                            <Typography variant="h6" sx={{mb: 4, color: '#666', fontWeight: 500}}>
                                {message}
                            </Typography>

                            <Alert severity="error" sx={{
                                mb: 4,
                                textAlign: 'left',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                border: '1px solid #f44336'
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: '#c62828'}}>
                                    What went wrong?
                                </Typography>
                                <Typography variant="body1" sx={{color: '#b71c1c'}}>
                                    {errorDetails}
                                </Typography>
                            </Alert>

                            <Grid container spacing={3} justifyContent="center">
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={handleRetry}
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 2,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            borderColor: '#f44336',
                                            color: '#f44336',
                                            '&:hover': {
                                                borderColor: '#d32f2f',
                                                backgroundColor: '#ffebee'
                                            }
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<HomeIcon/>}
                                        onClick={handleGoHome}
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 2,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Go to Home
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}