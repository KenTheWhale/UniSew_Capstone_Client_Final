import React, {useEffect, useState} from 'react';
import {Alert, Box, Button, CircularProgress, Container, Grid, Paper, Typography} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Home as HomeIcon,
    HourglassEmpty as HourglassIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {createPartnerRequest, updatePartnerStoreID} from "../../services/AuthService.jsx";
import {createStore} from "../../services/ShippingService.jsx";
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
            .then(async (res) => {
                if (res && res.status === 201) {
                    try {
                        // Extract data from response (excluding pid)
                        const {districtId, wardCode, address, name, phone} = res.data.body;

                        // Call createStore API
                        const storeResponse = await createStore(districtId, wardCode, address, name, phone);

                        if (storeResponse && storeResponse.data.code === 200) {
                            const shopId = storeResponse.data.data.shop_id;
                            const pid = res.data.body.pid;

                            // Call updatePartnerStoreID API
                            const updateResponse = await updatePartnerStoreID(shopId, pid);

                            if (updateResponse && updateResponse.status === 200) {
                                setStatus('success');
                                setMessage('Account created successfully!');
                                enqueueSnackbar('Account created successfully!', {variant: 'success'});
                            } else {
                                setStatus('error');
                                setMessage('Failed to update partner store ID');
                                setErrorDetails('Store created but failed to link with partner account. Please contact support.');
                                enqueueSnackbar('Failed to update partner store ID', {variant: 'error'});
                            }
                        } else {
                            setStatus('error');
                            setMessage('Failed to create store');
                            setErrorDetails('Partner account created but failed to create store. Please contact support.');
                            enqueueSnackbar('Failed to create store', {variant: 'error'});
                        }
                    } catch (error) {
                        console.error('Error in store creation process:', error);
                        setStatus('error');
                        setMessage('Store creation failed');
                        setErrorDetails('Partner account created but store creation failed. Please contact support.');
                        enqueueSnackbar('Store creation failed', {variant: 'error'});
                    }
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
                                Your account has been created successfully!
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
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
                                Go to Login
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