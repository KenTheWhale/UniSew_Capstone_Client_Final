import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    InputAdornment
} from '@mui/material';
import {
    Save,
    Settings,
    Notifications,
    Business,
    Info
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

export default function PlatformSetting() {
    const [settings, setSettings] = useState({
        // Business Settings
        currency: 'VND',
        taxRate: 10,
        serviceFeeRate: 3,
        minTransactionAmount: 50000,
        maxTransactionAmount: 10000000,
        
        // Media Settings
        maxImageSize: 10,
        maxVideoSize: 100,
        maxReferenceImages: 5, // Thêm cấu hình số lượng tối đa reference images
        
        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
    });

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Format number to Vietnamese format (e.g., 100.000)
    const formatVietnameseNumber = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Parse Vietnamese formatted number back to integer
    const parseVietnameseNumber = (value) => {
        if (!value) return 0;
        return parseInt(value.replace(/\./g, '')) || 0;
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const handleVietnameseNumberChange = (key, value) => {
        const numericValue = parseVietnameseNumber(value);
        handleSettingChange(key, numericValue);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            enqueueSnackbar('Platform settings saved successfully!', { 
                variant: 'success',
                autoHideDuration: 3000
            });
            setHasChanges(false);
        } catch (error) {
            enqueueSnackbar('Failed to save settings. Please try again.', { 
                variant: 'error',
                autoHideDuration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const SettingSection = ({ title, icon, children }) => (
        <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, color: '#dc3545' }}>
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {children}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Settings sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Platform Settings
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Configure system-wide settings and platform behavior
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid sx={{flex: 1}}>
                    {/* Business Settings */}
                    <SettingSection title="Business Settings" icon={<Business />}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Tax Rate (%)"
                                    type="number"
                                    value={settings.taxRate}
                                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="%" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Service Fee Rate (%)"
                                    type="number"
                                    value={settings.serviceFeeRate}
                                    onChange={(e) => handleSettingChange('serviceFeeRate', parseFloat(e.target.value))}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="%" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Minimum Transaction Amount"
                                    type="text"
                                    value={formatVietnameseNumber(settings.minTransactionAmount)}
                                    onChange={(e) => handleVietnameseNumberChange('minTransactionAmount', e.target.value)}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="VND" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Maximum Transaction Amount"
                                    type="text"
                                    value={formatVietnameseNumber(settings.maxTransactionAmount)}
                                    onChange={(e) => handleVietnameseNumberChange('maxTransactionAmount', e.target.value)}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="VND" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </SettingSection>

                    {/* Media Settings */}
                    <SettingSection title="Media Settings" icon={<Settings />}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Max Image Size"
                                    type="number"
                                    value={settings.maxImageSize}
                                    onChange={(e) => handleSettingChange('maxImageSize', parseInt(e.target.value))}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="MB" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Max Video Size"
                                    type="number"
                                    value={settings.maxVideoSize}
                                    onChange={(e) => handleSettingChange('maxVideoSize', parseInt(e.target.value))}
                                    variant="outlined"
                                    size="medium"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="MB" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Max Reference Images"
                                    type="number"
                                    value={settings.maxReferenceImages}
                                    onChange={(e) => handleSettingChange('maxReferenceImages', parseInt(e.target.value))}
                                    variant="outlined"
                                    size="medium"
                                    helperText="Max reference images for each design request"
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </SettingSection>

                    {/* Action Buttons */}
                    <Card sx={{ mt: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                {hasChanges && (
                                    <Alert severity="info" sx={{ flex: 1 }}>
                                        <Typography variant="body2">
                                            You have unsaved changes. Click "Save Changes" to apply your modifications.
                                        </Typography>
                                    </Alert>
                                )}
                                
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={handleSave}
                                    disabled={loading || !hasChanges}
                                    sx={{
                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                        }
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 