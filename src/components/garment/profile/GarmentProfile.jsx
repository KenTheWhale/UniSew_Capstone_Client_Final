import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    StarOutlined,
    UserOutlined, WalletOutlined
} from '@ant-design/icons';
import {getPartnerProfile, updatePartnerProfile} from '../../../services/AccountService.jsx';
import {getBanks} from '../../../services/ShippingService.jsx';
import {getTransactionsForOne} from '../../../services/PaymentService.jsx';
import {uploadCloudinary} from '../../../services/UploadImageService.jsx';
import {enqueueSnackbar} from 'notistack';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

export default function GarmentProfile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bankInfo, setBankInfo] = useState(null);
    const [banksData, setBanksData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        businessName: '',
        ownerName: '',
        bank: '',
        bankAccountNumber: '',
        startTime: '',
        endTime: ''
    });
    const [editFormErrors, setEditFormErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Image upload constants
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    useEffect(() => {
        fetchProfileData();
        fetchBanksData();
        fetchTransactions();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await getPartnerProfile();
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

    const fetchBanksData = async () => {
        try {
            const response = await getBanks();
            if (response && response.status === 200) {
                setBanksData(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching banks data:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setTransactionsLoading(true);
            const response = await getTransactionsForOne();
            console.log('Transactions API response:', response); // Debug log
            if (response && response.status === 200) {
                // Handle different possible response structures
                const transactionData = response.data?.body || response.data?.data || response.data || [];
                console.log('Transaction data:', transactionData); // Debug log
                
                // Ensure we have an array
                if (Array.isArray(transactionData)) {
                    setTransactions(transactionData);
                } else {
                    console.warn('Transaction data is not an array:', transactionData);
                    setTransactions([]);
                }
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setTransactions([]);
        } finally {
            setTransactionsLoading(false);
        }
    };

    useEffect(() => {
        if (profileData && banksData.length > 0) {
            const bank = banksData.find(b => b.code === profileData.wallet.bank);
            setBankInfo(bank);
        }
    }, [profileData, banksData]);

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

    const getPaymentTypeLabel = (type) => {
        const typeMap = {
            'design': 'Design Payment',
            'deposit': 'Order Deposit',
            'order': 'Order Payment',
            'order_return': 'Order Refund',
            'wallet': 'Wallet Top-up'
        };
        return typeMap[type] || type;
    };

    const getPaymentTypeColor = (type) => {
        const colorMap = {
            'design': '#9333ea',
            'deposit': '#0ea5e9',
            'order': '#10b981',
            'order_return': '#f59e0b',
            'wallet': '#64748b'
        };
        return colorMap[type] || '#64748b';
    };

    const getTransactionIcon = (type, isReceiver) => {
        if (type === 'order_return') return <ArrowUpOutlined />;
        if (isReceiver) return <ArrowDownOutlined />;
        return <ArrowUpOutlined />;
    };

    const isCurrentUserReceiver = (transaction) => {
        return transaction.receiver && transaction.receiver.account && 
               transaction.receiver.account.role === 'garment';
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file extension
        const ext = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            enqueueSnackbar('Only JPG, JPEG, PNG, GIF, WEBP files are allowed for avatar.', {
                variant: 'error',
                autoHideDuration: 4000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
            return;
        }

        // Validate file size
        if (file.size > MAX_AVATAR_SIZE) {
            enqueueSnackbar('Avatar file must be less than 5MB.', {
                variant: 'error',
                autoHideDuration: 4000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
            return;
        }

        try {
            setAvatarUploading(true);
            
            // Upload to cloudinary
            const uploadedUrl = await uploadCloudinary(file);
            
            if (!uploadedUrl) {
                enqueueSnackbar('Failed to upload avatar. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
                return;
            }

            // Update profile with new avatar
            const requestData = {
                wallet: {
                    ownerName: profileData.wallet.ownerName || '',
                    bank: profileData.wallet.bank || '',
                    bankAccountNumber: profileData.wallet.bankAccountNumber || ''
                },
                customer: {
                    name: profileData.profile.name || '',
                    businessName: profileData.profile.businessName || '',
                    avatarUrl: uploadedUrl
                },
                partner: {
                    startTime: profileData.profile.partner?.startTime || '',
                    endTime: profileData.profile.partner?.endTime || ''
                }
            };

            const response = await updatePartnerProfile(requestData);
            
            if (response && response.status === 200) {
                // Refresh profile data
                await fetchProfileData();
                
                enqueueSnackbar('Avatar updated successfully!', {
                    variant: 'success',
                    autoHideDuration: 3000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            } else {
                enqueueSnackbar('Failed to update avatar. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            }
        } catch (err) {
            console.error('Error updating avatar:', err);
            enqueueSnackbar('An error occurred while updating avatar. Please try again.', {
                variant: 'error',
                autoHideDuration: 4000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
        } finally {
            setAvatarUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleEditDialogOpen = () => {
        if (profileData && profileData.profile) {
            setEditFormData({
                name: profileData.profile.name || '',
                businessName: profileData.profile.businessName || '',
                ownerName: profileData.wallet.ownerName || '',
                bank: profileData.wallet.bank || '',
                bankAccountNumber: profileData.wallet.bankAccountNumber || '',
                startTime: profileData.profile.partner?.startTime || '',
                endTime: profileData.profile.partner?.endTime || ''
            });
        }
        setEditDialogOpen(true);
        setEditFormErrors({});
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditFormErrors({});
    };

    const handleEditFormChange = (field) => (event) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Clear error for this field
        if (editFormErrors[field]) {
            setEditFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateEditForm = () => {
        const errors = {};
        
        if (!editFormData.name.trim()) {
            errors.name = 'Name is required';
        }
        
        if (!editFormData.businessName.trim()) {
            errors.businessName = 'Business name is required';
        }
        
        if (!editFormData.ownerName.trim()) {
            errors.ownerName = 'Owner name is required';
        }
        
        if (!editFormData.bank.trim()) {
            errors.bank = 'Bank is required';
        }
        
        if (!editFormData.bankAccountNumber.trim()) {
            errors.bankAccountNumber = 'Bank account number is required';
        }
        
        if (!editFormData.startTime.trim()) {
            errors.startTime = 'Start time is required';
        }
        
        if (!editFormData.endTime.trim()) {
            errors.endTime = 'End time is required';
        }
        
        // Validate time logic
        if (editFormData.startTime && editFormData.endTime) {
            const startTime = new Date(`1970-01-01T${editFormData.startTime}:00`);
            const endTime = new Date(`1970-01-01T${editFormData.endTime}:00`);
            
            if (startTime >= endTime) {
                errors.endTime = 'End time must be after start time';
            }
        }
        
        setEditFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditFormSubmit = async () => {
        if (!validateEditForm()) {
            enqueueSnackbar('Please fix the errors in the form before submitting.', {
                variant: 'warning',
                autoHideDuration: 3000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
            return;
        }

        try {
            setEditLoading(true);
            const requestData = {
                wallet: {
                    ownerName: editFormData.ownerName,
                    bank: editFormData.bank,
                    bankAccountNumber: editFormData.bankAccountNumber
                },
                customer: {
                    name: editFormData.name,
                    businessName: editFormData.businessName,
                    avatarUrl: profileData.profile.avatar || ''
                },
                partner: {
                    startTime: editFormData.startTime,
                    endTime: editFormData.endTime
                }
            };

            const response = await updatePartnerProfile(requestData);
            
            if (response && response.status === 200) {
                // Refresh profile data
                await fetchProfileData();
                setEditDialogOpen(false);
                
                // Success notification
                enqueueSnackbar('Profile updated successfully!', {
                    variant: 'success',
                    autoHideDuration: 3000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            } else {
                console.error('Failed to update profile');
                enqueueSnackbar('Failed to update profile. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            enqueueSnackbar('An error occurred while updating profile. Please try again.', {
                variant: 'error',
                autoHideDuration: 4000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
        } finally {
            setEditLoading(false);
        }
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
            <Container maxWidth="xl">
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
                        Garment Profile
                    </Typography>
                    <Typography variant="h6" sx={{color: '#64748b', fontWeight: 500}}>
                        Manage your garment information and account details
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
                                        Garment Account
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Profile information and account status
                                    </Typography>
                                </Box>
                                <Tooltip title="Edit Profile">
                                    <IconButton
                                        onClick={handleEditDialogOpen}
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
                                <Box sx={{position: 'relative', display: 'inline-block', mb: 3}}>
                                    <input
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        style={{display: 'none'}}
                                        id="avatar-upload-input-garment"
                                        type="file"
                                        onChange={handleAvatarUpload}
                                    />
                                    <label htmlFor="avatar-upload-input-garment">
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            cursor: 'pointer',
                                            '&:hover .avatar-overlay': {
                                                opacity: 1
                                            }
                                        }}>
                                            <Avatar
                                                src={profile.avatar}
                                                alt={profile.name}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    border: '4px solid #ffffff',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                                    mb: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                                    }
                                                }}
                                                slotProps={{
                                                    img: {
                                                        referrerPolicy: 'no-referrer'
                                                    }
                                                }}
                                            >
                                                <UserOutlined style={{fontSize: 48}}/>
                                            </Avatar>
                                            <Box
                                                className="avatar-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    flexDirection: 'column',
                                                    gap: 1
                                                }}
                                            >
                                                {avatarUploading ? (
                                                    <>
                                                        <Box sx={{
                                                            width: 20,
                                                            height: 20,
                                                            border: '2px solid #ffffff',
                                                            borderTop: '2px solid transparent',
                                                            borderRadius: '50%',
                                                            animation: 'spin 1s linear infinite',
                                                            '@keyframes spin': {
                                                                '0%': { transform: 'rotate(0deg)' },
                                                                '100%': { transform: 'rotate(360deg)' }
                                                            }
                                                        }} />
                                                        <Typography variant="caption" sx={{color: 'white'}}>
                                                            Uploading...
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        📷
                                                        <Typography variant="caption" sx={{color: 'white'}}>
                                                            Change Avatar
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </label>
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
                                        mb: 1,
                                        fontSize: '18px'
                                    }}
                                >
                                    Studio: {profile.businessName}
                                </Typography>

                                {}
                                {profile.partner && (
                                    <Box sx={{mb: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
                                            <Typography variant="caption" sx={{color: '#64748b', fontSize: '18px'}}>
                                                Rating:
                                            </Typography>
                                            <StarOutlined style={{color: '#f59e0b', fontSize: 18}}/>
                                            <Typography variant="body1" sx={{color: '#1e293b', fontWeight: 600}}>
                                                {profile.partner.rating}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
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

                                    {}
                                    {profile.partner && (
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
                                                <ClockCircleOutlined style={{color: '#1976d2', fontSize: 14}}/>
                                            </Box>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="body2" sx={{
                                                    color: '#64748b',
                                                    fontWeight: 500,
                                                    mb: 0.25,
                                                    fontSize: '11px'
                                                }}>
                                                    Working Hours
                                                </Typography>
                                                <Typography variant="body1"
                                                            sx={{color: '#1e293b', fontWeight: 600, fontSize: '13px'}}>
                                                    {profile.partner.startTime} - {profile.partner.endTime}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
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
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" sx={{
                                                                color: '#64748b',
                                                                mb: 0.5,
                                                                fontSize: '12px'
                                                            }}>
                                                                Bank Name
                                                            </Typography>
                                                            <Typography variant="body1" sx={{
                                                                color: '#475569',
                                                                fontWeight: 600,
                                                                fontSize: '14px'
                                                            }}>
                                                                {bankInfo ? `${bankInfo.name} ${bankInfo.shortName} ` : 'Bank information not available'}
                                                            </Typography>
                                                        </Box>
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

                        {/* Transaction History Section */}
                        <Paper
                            elevation={8}
                            sx={{
                                p: 4,
                                mt: 4,
                                height: '62vh',
                                borderRadius: 4,
                                border: '2px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                position: 'relative',
                                overflow: 'hidden',
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
                                            mb: 1
                                        }}
                                    >
                                        Transaction History
                                    </Typography>
                                    <Typography variant="body2" sx={{color: '#64748b'}}>
                                        Your recent payment transactions and financial activities
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<DollarOutlined />}
                                    label={`${Array.isArray(transactions) ? transactions.length : 0} Transactions`}
                                    sx={{
                                        backgroundColor: '#f0f9ff',
                                        color: '#0369a1',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>

                            {transactionsLoading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[1, 2, 3].map((item) => (
                                        <Skeleton 
                                            key={item} 
                                            variant="rectangular" 
                                            height={120} 
                                            sx={{ borderRadius: 2 }} 
                                        />
                                    ))}
                                </Box>
                            ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    color: '#64748b'
                                }}>
                                    <DollarOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        No Transactions Found
                                    </Typography>
                                    <Typography variant="body2">
                                        You haven't made any transactions yet
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '600px', overflowY: 'auto' }}>
                                    {Array.isArray(transactions) && transactions.map((transaction) => {
                                        const isReceiver = isCurrentUserReceiver(transaction);
                                        const otherParty = isReceiver ? transaction.sender : transaction.receiver;
                                        
                                        return (
                                            <Card
                                                key={transaction.id}
                                                elevation={3}
                                                sx={{
                                                    border: '1px solid #f1f5f9',
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <CardContent sx={{ p: 4, minHeight: 'max-content' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: '50%',
                                                                backgroundColor: isReceiver ? '#dcfce7' : '#fef3c7'
                                                            }}>
                                                                {getTransactionIcon(transaction.paymentType, isReceiver)}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="h6" sx={{ 
                                                                    fontWeight: 600, 
                                                                    color: '#1e293b',
                                                                    fontSize: '17px'
                                                                }}>
                                                                    {getPaymentTypeLabel(transaction.paymentType)}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ 
                                                                    color: '#64748b',
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {isReceiver ? 'Received from' : 'Sent to'} {otherParty?.business || 'Unknown'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="h6" sx={{
                                                                fontWeight: 700,
                                                                color: isReceiver ? '#10b981' : '#ef4444',
                                                                fontSize: '17px'
                                                            }}>
                                                                {isReceiver ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                            </Typography>
                                                            <Chip
                                                                label={transaction.status}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: transaction.status === 'success' ? '#dcfce7' : '#fee2e2',
                                                                    color: transaction.status === 'success' ? '#166534' : '#dc2626',
                                                                    fontWeight: 600,
                                                                    fontSize: '11px'
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Container>

            {/* Edit Profile Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={handleEditDialogClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                        margin: 2
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    textAlign: 'center'
                }}>
                    Edit Garment Profile
                </DialogTitle>
                <DialogContent sx={{ 
                    pt: 3, 
                    pb: 2,
                    minHeight: '500px',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '3px',
                    },
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3,
                        py: 1
                    }}>
                        {/* Personal Information Section */}
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                            Personal Information
                        </Typography>
                        
                        <TextField
                            label="Name"
                            value={editFormData.name}
                            onChange={handleEditFormChange('name')}
                            error={!!editFormErrors.name}
                            helperText={editFormErrors.name}
                            fullWidth
                            variant="outlined"
                        />
                        
                        <TextField
                            label="Business Name"
                            value={editFormData.businessName}
                            onChange={handleEditFormChange('businessName')}
                            error={!!editFormErrors.businessName}
                            helperText={editFormErrors.businessName}
                            fullWidth
                            variant="outlined"
                        />

                        {/* Working Hours Section */}
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1, mt: 2 }}>
                            Working Hours
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Time"
                                type="time"
                                value={editFormData.startTime}
                                onChange={handleEditFormChange('startTime')}
                                error={!!editFormErrors.startTime}
                                helperText={editFormErrors.startTime}
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                            />
                            
                            <TextField
                                label="End Time"
                                type="time"
                                value={editFormData.endTime}
                                onChange={handleEditFormChange('endTime')}
                                error={!!editFormErrors.endTime}
                                helperText={editFormErrors.endTime}
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                            />
                        </Box>

                        {/* Wallet Information Section */}
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1, mt: 2 }}>
                            Wallet Information
                        </Typography>
                        
                        <TextField
                            label="Owner Name"
                            value={editFormData.ownerName}
                            onChange={handleEditFormChange('ownerName')}
                            error={!!editFormErrors.ownerName}
                            helperText={editFormErrors.ownerName}
                            fullWidth
                            variant="outlined"
                        />
                        
                        <FormControl fullWidth variant="outlined" error={!!editFormErrors.bank}>
                            <InputLabel>Bank</InputLabel>
                            <Select
                                value={editFormData.bank}
                                onChange={handleEditFormChange('bank')}
                                label="Bank"
                            >
                                {banksData.map((bank) => (
                                    <MenuItem key={bank.code} value={bank.code}>
                                        {bank.name} ({bank.shortName})
                                    </MenuItem>
                                ))}
                            </Select>
                            {editFormErrors.bank && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                    {editFormErrors.bank}
                                </Typography>
                            )}
                        </FormControl>
                        
                        <TextField
                            label="Bank Account Number"
                            value={editFormData.bankAccountNumber}
                            onChange={handleEditFormChange('bankAccountNumber')}
                            error={!!editFormErrors.bankAccountNumber}
                            helperText={editFormErrors.bankAccountNumber}
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3, 
                    gap: 2,
                    borderTop: '1px solid #e2e8f0',
                    justifyContent: 'center'
                }}>
                    <Button 
                        onClick={handleEditDialogClose}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderColor: '#64748b',
                            color: '#64748b',
                            minWidth: '120px',
                            '&:hover': {
                                borderColor: '#475569',
                                backgroundColor: '#f8fafc'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEditFormSubmit}
                        variant="contained"
                        size="large"
                        disabled={editLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            minWidth: '140px',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                            '&:disabled': {
                                background: '#e2e8f0',
                                color: '#94a3b8'
                            }
                        }}
                    >
                        {editLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}