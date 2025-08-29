import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {Business, LocationOn, Phone, Receipt} from '@mui/icons-material';
import {getProvinces, getDistricts} from '../../../../services/ShippingService.jsx';

export default function UpdateSchoolInfoDialog({open, onClose, onUpdate, initialData}) {
    const [formData, setFormData] = useState({
        business: initialData?.business || '',
        province: '',
        district: '',
        street: '',
        taxCode: initialData?.taxCode || '',
        phone: initialData?.phone || ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const response = await getProvinces();
                if (response && response.status === 200) {
                    setProvinces(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching provinces:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (formData.province) {
            const fetchDistricts = async () => {
                setLoadingDistricts(true);
                try {
                    const response = await getDistricts(formData.province);
                    if (response && response.status === 200) {
                        setDistricts(response.data.data || []);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                } finally {
                    setLoadingDistricts(false);
                }
            };

            fetchDistricts();
        } else {
            setDistricts([]);
        }
    }, [formData.province]);

    useEffect(() => {
        if (open) {
            const validateAllFields = () => {
                const newErrors = {};
                Object.keys(formData).forEach(field => {
                    const error = validateField(field, formData[field]);
                    if (error) newErrors[field] = error;
                });
                setErrors(newErrors);
            };

            validateAllFields();
        }
    }, [open, initialData]);

    const validateField = (field, value) => {
        switch (field) {
            case 'business':
                if (!value || value.trim() === '') return 'School name is required';
                if (value.trim().length < 3) return 'School name must be at least 3 characters';
                return '';
            case 'province':
                if (!value || value.trim() === '') return 'Province is required';
                return '';
            case 'district':
                if (!value || value.trim() === '') return 'District is required';
                return '';
            case 'street':
                if (!value || value.trim() === '') return 'Street address is required';
                if (value.trim().length < 1) return 'Street address must be at least 1 characters';
                return '';
            case 'taxCode':
                if (!value || value.trim() === '') return 'Tax code is required';
                if (!/^[0-9]{10,13}$/.test(value.trim())) return 'Tax code must be 10-13 digits';
                return '';
            case 'phone':
                if (!value || value.trim() === '') return 'Phone number is required';
                if (!/^[0-9]{10}$/.test(value.trim())) return 'Phone number must be 10 digits';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        // Reset district when province changes
        if (field === 'province') {
            setFormData(prev => ({...prev, district: "", street: ""}));
            setErrors(prev => ({...prev, district: '', street: ''}));
        }

        // Reset street when district changes
        if (field === 'district') {
            setFormData(prev => ({...prev, street: ''}));
            setErrors(prev => ({...prev, street: ''}));
        }

        const error = validateField(field, value);
        setErrors(prev => ({...prev, [field]: error}));
    };

    const handleSubmit = async () => {
        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const selectedProvince = provinces.find(p => p.ProvinceID === formData.province);
        const selectedDistrict = districts.find(d => d.DistrictID === formData.district);

        const fullAddress = `${formData.street}, ${selectedDistrict?.DistrictName}, ${selectedProvince?.ProvinceName}`;

        const updateData = {
            business: formData.business,
            address: fullAddress,
            taxCode: formData.taxCode,
            phone: formData.phone
        };

        setLoading(true);
        try {
            await onUpdate(updateData);
        } catch (error) {
            console.error('Error updating school info:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        const requiredFields = ['business', 'province', 'district', 'street', 'taxCode', 'phone'];

        const allFieldsHaveValue = requiredFields.every(field => {
            const value = formData[field];
            return value && value.trim() !== '' && value !== 'N/A';
        });

        const hasNoErrors = Object.keys(errors).length === 0 ||
            Object.keys(errors).every(field => !errors[field]);

        return allFieldsHaveValue && hasNoErrors;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
            }}>
                <Typography variant="h6" sx={{fontWeight: 600, color: '#1e293b'}}>
                    Update school information
                </Typography>
                <Typography variant="body2" sx={{color: '#64748b', mt: 1}}>
                    Please update all school information to continue using the system
                </Typography>
            </DialogTitle>

            <DialogContent sx={{pt: 3}}>
                <Alert severity="info" sx={{mb: 3}}>
                    To ensure accuracy and security, please update all school information.
                </Alert>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <TextField
                        fullWidth
                        label="School name"
                        value={formData.business === 'N/A' ? '' : formData.business}
                        onChange={(e) => handleInputChange('business', e.target.value)}
                        error={!!errors.business}
                        helperText={errors.business}
                        slotProps={{
                            input: {
                                startAdornment: <Business sx={{mr: 1, color: 'text.secondary'}}/>
                            }
                        }}
                        placeholder="Enter school name"
                    />

                    {/* Address Section */}
                    <Typography variant="subtitle2" sx={{fontWeight: 600, color: '#1e293b', mt: 1}}>
                        Address Information
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.province}>
                                <InputLabel>Province</InputLabel>
                                <Select
                                    value={formData.province}
                                    onChange={(e) => handleInputChange('province', e.target.value)}
                                    label="Province"
                                    variant='outlined'
                                    disabled={loadingProvinces}>
                                    {loadingProvinces ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} sx={{mr: 1}} />
                                            Loading provinces...
                                        </MenuItem>
                                    ) : (
                                        provinces.map((province) => (
                                            <MenuItem key={province.ProvinceID} value={province.ProvinceID}>
                                                {province.ProvinceName}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {errors.province && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                                        {errors.province}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.district} disabled={!formData.province || loadingDistricts}>
                                <InputLabel>District</InputLabel>
                                <Select
                                    value={formData.district}
                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                    label="District"
                                    variant='outlined'>
                                    {loadingDistricts ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} sx={{mr: 1}} />
                                            Loading districts...
                                        </MenuItem>
                                    ) : (
                                        districts.map((district) => (
                                            <MenuItem key={district.DistrictID} value={district.DistrictID}>
                                                {district.DistrictName}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {errors.district && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                                        {errors.district}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street address"
                                value={formData.street}
                                onChange={(e) => handleInputChange('street', e.target.value)}
                                error={!!errors.street}
                                helperText={errors.street || 'Enter detailed street address'}
                                slotProps={{
                                    input: {
                                        startAdornment: <LocationOn sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                                placeholder="Enter street address (e.g., 123 Nguyen Hue Street)"
                                disabled={!formData.district}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        label="Tax code"
                        value={formData.taxCode === 'N/A' ? '' : formData.taxCode}
                        onChange={(e) => handleInputChange('taxCode', e.target.value)}
                        error={!!errors.taxCode}
                        helperText={errors.taxCode}
                        slotProps={{
                            input: {
                                startAdornment: <Receipt sx={{mr: 1, color: 'text.secondary'}}/>
                            }
                        }}
                        placeholder="Enter tax code (10-13 digits)"
                    />

                    <TextField
                        fullWidth
                        label="Phone number"
                        value={formData.phone === 'N/A' ? '' : formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        slotProps={{
                            input: {
                                startAdornment: <Phone sx={{mr: 1, color: 'text.secondary'}}/>
                            }
                        }}
                        placeholder="Enter phone number (10 digits)"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{p: 3, pt: 1}}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: '#64748b',
                        '&:hover': {backgroundColor: '#f1f5f9'}
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || loading}
                    variant="contained"
                    sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {backgroundColor: '#1565c0'},
                        '&:disabled': {backgroundColor: '#e0e0e0'}
                    }}
                    startIcon={loading ? <CircularProgress size={16}/> : null}
                >
                    {loading ? 'Updating...' : 'Update information'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 
