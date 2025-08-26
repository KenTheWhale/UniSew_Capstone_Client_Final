import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    Tooltip,
    Typography
} from '@mui/material';
import {
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    EditOutlined,
    EnvironmentOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined
} from '@ant-design/icons';
import {getSchoolProfile} from '../../../services/AccountService.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

export default function SchoolProfile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await getSchoolProfile();
            if (response && response.status === 200) {
                setProfileData(response.data.body);
            } else {
                setError('Failed to fetch profile data');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Error loading profile data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return dayjs(dateString).locale('vi').format('DD/MM/YYYY');
        } catch (error) {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null) {
            return 'N/A';
        }
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' VND';
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                py: 4
            }}>
                <Container maxWidth="lg">
                    <Paper sx={{p: 3, borderRadius: 3}}>
                        <Skeleton variant="circular" width={120} height={120} sx={{mx: 'auto', mb: 2}}/>
                        <Skeleton variant="text" width="60%" height={32} sx={{mx: 'auto', mb: 1}}/>
                        <Skeleton variant="text" width="40%" height={24} sx={{mx: 'auto'}}/>
                        <Grid container spacing={3} sx={{mt: 3}}>
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <Grid item xs={12} sm={6} key={item}>
                                    <Skeleton variant="rectangular" height={100} sx={{borderRadius: 2}}/>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}>
                <Container maxWidth="md">
                    <Alert severity="error" sx={{fontSize: '16px'}}>
                        {error}
                    </Alert>
                </Container>
            </Box>
        );
    }

    if (!profileData) {
        return null;
    }

    const {profile, wallet, email, registerDate, status} = profileData;

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            py: 4
        }}>
            <Container maxWidth="lg">
                {}
                <Box sx={{mb: 4, textAlign: 'center'}}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: '#1e293b',
                            mb: 1,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        School Profile
                    </Typography>
                    <Typography variant="h6" sx={{color: '#64748b', fontWeight: 500}}>
                        Manage your school information and account details
                    </Typography>
                </Box>

                {}
                <Box sx={{display: 'flex', gap: 4}}>
                    {}
                    <Box sx={{flex: 1}}>
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: '2px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                height: 'fit-content',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '6px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }
                            }}
                        >
                            {}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 4
                            }}>
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            mb: 1
                                        }}
                                    >
                                        School Account
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Profile information and account status
                                    </Typography>
                                </Box>
                                <Tooltip title="Edit Profile">
                                    <IconButton
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#bbdefb'
                                            }
                                        }}
                                    >
                                        <EditOutlined/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {}
                            <Box sx={{textAlign: 'center', mb: 4}}>
                                {}
                                <Box sx={{position: 'relative', display: 'inline-block', mb: 3}}>
                                    <Avatar
                                        src={profile.avatar}
                                        alt={profile.name}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            border: '4px solid #ffffff',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            mb: 2
                                        }}
                                        slotProps={{
                                            img: {
                                                referrerPolicy: 'no-referrer'
                                            }
                                        }}
                                    >
                                        <UserOutlined style={{fontSize: 48}}/>
                                    </Avatar>
                                    <Chip
                                        label={status === 'active' ? 'Active' : 'Inactive'}
                                        color={status === 'active' ? 'success' : 'default'}
                                        size="small"
                                        icon={<CheckCircleOutlined/>}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            backgroundColor: status === 'active' ? '#10b981' : '#6b7280',
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>

                                {}
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        mb: 1
                                    }}
                                >
                                    {profile.name}
                                </Typography>

                                {}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#64748b',
                                        fontWeight: 500,
                                        mb: 3
                                    }}
                                >
                                    School: {profile.businessName}
                                </Typography>
                            </Box>

                            {}
                            <Box sx={{mb: 4}}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        mb: 3
                                    }}
                                >
                                    Account Information
                                </Typography>
                                <Typography variant="body2" sx={{color: '#64748b', mb: 3}}>
                                    Personal and contact details
                                </Typography>
                            </Box>

                            <Box sx={{mb: 4}}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1.5,
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            mr: 1.5
                                        }}>
                                            <MailOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                mb: 0.25,
                                                fontSize: '11px'
                                            }}>
                                                Email Address
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                {email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1.5,
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            mr: 1.5
                                        }}>
                                            <PhoneOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                mb: 0.25,
                                                fontSize: '11px'
                                            }}>
                                                Phone Number
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                {profile.phone}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1.5,
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            mr: 1.5
                                        }}>
                                            <EnvironmentOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                mb: 0.25,
                                                fontSize: '11px'
                                            }}>
                                                Address
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                {profile.address}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1.5,
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            mr: 1.5
                                        }}>
                                            <IdcardOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                mb: 0.25,
                                                fontSize: '11px'
                                            }}>
                                                Tax Code
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                {profile.taxCode}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1.5,
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            mr: 1.5
                                        }}>
                                            <CalendarOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                mb: 0.25,
                                                fontSize: '11px'
                                            }}>
                                                Registration Date
                                            </Typography>
                                            <Typography variant="body1"
                                                        sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                {formatDate(registerDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {}
                    <Box sx={{flex: 1}}>
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: '2px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                height: 'fit-content',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '6px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3
                            }}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            mb: 2
                                        }}
                                    >
                                        Payment Information
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b', mb: 3}}>
                                        Your payment card details and transaction history
                                    </Typography>
                                </Box>
                                <Tooltip title="Update Payment Information">
                                    <IconButton
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            '&:hover': {
                                                backgroundColor: '#bbdefb'
                                            }
                                        }}
                                    >
                                        <EditOutlined/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid sx={{width: '100%'}}>
                                    <Box sx={{display: 'flex', gap: 3, width: '100%', justifyContent: 'space-between'}}>
                                        <Box sx={{flex: 1}}>
                                            <Card
                                                elevation={6}
                                                sx={{
                                                    border: '2px solid #bbf7d0',
                                                    borderRadius: 3,
                                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                                                    height: 'max-content',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    width: '100%',
                                                    boxShadow: '0 12px 24px rgba(16, 185, 129, 0.15), 0 6px 12px rgba(16, 185, 129, 0.08)'
                                                }}
                                            >
                                                <CardContent
                                                    sx={{p: 2.5, flex: 1, display: 'flex', flexDirection: 'column'}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                                                        <CreditCardOutlined
                                                            style={{color: '#10b981', fontSize: 18, marginRight: 8}}/>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 600,
                                                            color: '#1e293b',
                                                            fontSize: '16px'
                                                        }}>
                                                            Bank Information
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Box>
                                                            <Typography variant="body2" sx={{
                                                                color: '#64748b',
                                                                mb: 0.5,
                                                                fontSize: '12px'
                                                            }}>
                                                                Bank Account Number
                                                            </Typography>
                                                            <Typography variant="body1" sx={{
                                                                color: '#475569',
                                                                fontWeight: 500,
                                                                fontSize: '14px'
                                                            }}>
                                                                {wallet.bankAccountNumber !== 'N/A' ? wallet.bankAccountNumber : 'No bank account linked'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Box>

                                        <Box sx={{flex: 1}}>
                                            <Card
                                                elevation={6}
                                                sx={{
                                                    border: '2px solid #fde68a',
                                                    borderRadius: 3,
                                                    background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                                                    height: 'max-content',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    width: '100%',
                                                    boxShadow: '0 12px 24px rgba(245, 158, 11, 0.15), 0 6px 12px rgba(245, 158, 11, 0.08)'
                                                }}
                                            >
                                                <CardContent
                                                    sx={{p: 2.5, flex: 1, display: 'flex', flexDirection: 'column'}}>
                                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                                                        <BankOutlined
                                                            style={{color: '#f59e0b', fontSize: 18, marginRight: 8}}/>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 600,
                                                            color: '#1e293b',
                                                            fontSize: '16px'
                                                        }}>
                                                            Account Summary
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Box sx={{mb: 1.5}}>
                                                            <Typography variant="body2" sx={{
                                                                color: '#64748b',
                                                                mb: 0.5,
                                                                fontSize: '12px'
                                                            }}>
                                                                Balance
                                                            </Typography>
                                                            <Typography variant="h6" sx={{
                                                                color: '#166534',
                                                                fontWeight: 700,
                                                                fontSize: '14px'
                                                            }}>
                                                                {formatCurrency(wallet.balance)}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" sx={{
                                                                color: '#64748b',
                                                                mb: 0.5,
                                                                fontSize: '12px'
                                                            }}>
                                                                Pending Balance
                                                            </Typography>
                                                            <Typography variant="body1" sx={{
                                                                color: '#8b5cf6',
                                                                fontWeight: 700,
                                                                fontSize: '14px'
                                                            }}>
                                                                {formatCurrency(wallet.pendingBalance)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}