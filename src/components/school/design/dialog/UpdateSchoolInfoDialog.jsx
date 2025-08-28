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
import {checkTaxCode} from '../../../../services/TaxService.jsx';
import {enqueueSnackbar} from 'notistack';
import {getProvinces, getDistricts, getWards} from '../../../../services/ShippingService.jsx';

export default function UpdateSchoolInfoDialog({open, onClose, onUpdate, initialData}) {
    const parseAddress = (address) => {
        if (!address || address === 'N/A') return {province: '', district: '', ward: '', street: ''};

        const parts = address.split(',').map(part => part.trim());
        if (parts.length >= 4) {
            const street = parts[0];
            const ward = parts[1];
            const district = parts[2];
            const province = parts[3];

            return {
                province: '',
                district: '',
                ward: '',
                street: street
            };
        }

        return {province: '', district: '', ward: '', street: ''};
    };

    const parsedAddress = parseAddress(initialData?.address);

    const [formData, setFormData] = useState({
        business: initialData?.business || '',
        province: parsedAddress.province,
        district: parsedAddress.district,
        ward: parsedAddress.ward,
        street: parsedAddress.street,
        taxCode: initialData?.taxCode || '',
        phone: initialData?.phone || ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [validatingTaxCode, setValidatingTaxCode] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

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

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true);
                const response = await getProvinces();
                if (response && response.data && response.data.data) {
                    const filteredProvinces = response.data.data.filter(province => {
                        const unwantedNames = [
                            'Hà Nội 02',
                            'Test - Alert - Tỉnh - 001',
                            'Ngoc test',
                            'Test'
                        ];
                        return !unwantedNames.includes(province.ProvinceName);
                    });
                    setProvinces(filteredProvinces);
                }
            } catch (error) {
                console.error('Error fetching provinces:', error);
                enqueueSnackbar('Failed to load provinces. Please try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });
            } finally {
                setLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

    const validateField = (field, value) => {
        switch (field) {
            case 'business':
                if (!value || value.trim() === '') return 'School name is required';
                if (value.trim().length < 3) return 'School name must be at least 3 characters';
                return '';
            case 'province':
                if (!value || value === '') return 'Province is required';
                return '';
            case 'district':
                if (!value || value === '') return 'District is required';
                return '';
            case 'ward':
                if (!value || value === '') return 'Ward is required';
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

        if (field === 'province') {
            setFormData(prev => ({...prev, district: "", ward: "", street: ""}));
            setErrors(prev => ({...prev, district: '', ward: '', street: ''}));
            setDistricts([]);
            setWards([]);

            if (value) {
                const fetchDistricts = async () => {
                    try {
                        const response = await getDistricts(value);
                        if (response && response.data && response.data.data) {
                            setDistricts(response.data.data);
                        }
                    } catch (error) {
                        console.error('Error fetching districts:', error);
                        enqueueSnackbar('Failed to load districts. Please try again.', {
                            variant: 'error',
                            autoHideDuration: 4000
                        });
                    }
                };
                fetchDistricts();
            }
        }

        if (field === 'district') {
            setFormData(prev => ({...prev, ward: '', street: ''}));
            setErrors(prev => ({...prev, ward: '', street: ''}));
            setWards([]);

            if (value) {
                const fetchWards = async () => {
                    try {
                        const response = await getWards(value);

                        let wardsData = null;
                        if (response && response.data) {
                            if (response.data.data) {
                                wardsData = response.data.data;
                            } else if (response.data.wards) {
                                wardsData = response.data.wards;
                            } else if (Array.isArray(response.data)) {
                                wardsData = response.data;
                            }
                        }

                        if (wardsData && Array.isArray(wardsData) && wardsData.length > 0) {
                            setWards(wardsData);
                        } else {
                            setWards([]);
                        }
                    } catch (error) {
                        console.error('Error fetching wards:', error);
                        enqueueSnackbar('Failed to load wards. Please try again.', {
                            variant: 'error',
                            autoHideDuration: 4000
                        });
                    }
                };
                fetchWards();
            }
        }

        if (field === 'ward') {
            setFormData(prev => ({...prev, street: ''}));
            setErrors(prev => ({...prev, street: ''}));
        }

        const error = validateField(field, value);
        setErrors(prev => ({...prev, [field]: error}));
    };

    const handleSubmit = async () => {
        const newErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setValidatingTaxCode(true);

        try {
            const taxCodeResponse = await checkTaxCode(formData.taxCode);

            if (!taxCodeResponse || taxCodeResponse.code !== "00") {
                setErrors(prev => ({
                    ...prev,
                    taxCode: 'Tax code is invalid or does not exist'
                }));

                enqueueSnackbar('Tax code validation failed. Please check and try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });

                setValidatingTaxCode(false);
                setLoading(false);
                return;
            }

            const selectedProvince = provinces.find(p => p.ProvinceID === formData.province);
            const selectedDistrict = districts.find(d => d.DistrictID === formData.district);
            const selectedWard = wards.find(w => {
                const wardCode = w.WardCode || w.code || w.ward_code;
                return wardCode === formData.ward;
            });

            const fullAddress = `${formData.street}, ${selectedWard?.WardName || selectedWard?.name || selectedWard?.ward_name || ''}, ${selectedDistrict?.DistrictName || ''}, ${selectedProvince?.ProvinceName || ''}`;

            const updateData = {
                business: formData.business,
                address: fullAddress,
                taxCode: formData.taxCode,
                phone: formData.phone
            };

            await onUpdate(updateData);
        } catch (error) {
            console.error('Error during validation or update:', error);

            if (validatingTaxCode) {
                setErrors(prev => ({
                    ...prev,
                    taxCode: 'Unable to validate tax code. Please check your internet connection and try again.'
                }));

                enqueueSnackbar('Unable to validate tax code. Please check your internet connection and try again.', {
                    variant: 'error',
                    autoHideDuration: 4000
                });
            }
        } finally {
            setLoading(false);
            setValidatingTaxCode(false);
        }
    };

    const isFormValid = () => {
        const requiredFields = ['business', 'province', 'district', 'ward', 'street', 'taxCode', 'phone'];

        const allFieldsHaveValue = requiredFields.every(field => {
            const value = formData[field];

            if (field === 'province' || field === 'district' || field === 'ward') {
                return value && value !== '' && value !== 'N/A';
            } else {
                return value && value.trim() !== '' && value !== 'N/A';
            }
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

                    {}
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
                                        <MenuItem disabled>Loading provinces...</MenuItem>
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
                            <FormControl fullWidth error={!!errors.district} disabled={!formData.province}>
                                <InputLabel>District</InputLabel>
                                <Select
                                    value={formData.district}
                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                    label="District"
                                    variant='outlined'>
                                    {formData.province &&
                                        districts.map((district) => (
                                            <MenuItem key={district.DistrictID} value={district.DistrictID}>
                                                {district.DistrictName}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                {errors.district && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                                        {errors.district}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.ward} disabled={!formData.district}>
                                <InputLabel>Ward</InputLabel>
                                <Select
                                    value={formData.ward}
                                    onChange={(e) => handleInputChange('ward', e.target.value)}
                                    label="Ward"
                                    variant='outlined'>
                                    {formData.district &&
                                        wards.map((ward) => {
                                            const wardCode = ward.WardCode || ward.code || ward.ward_code;
                                            const wardName = ward.WardName || ward.name || ward.ward_name;

                                            return (
                                                <MenuItem key={wardCode} value={wardCode}>
                                                    {wardName}
                                                </MenuItem>
                                            );
                                        })
                                    }
                                </Select>
                                {errors.ward && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                                        {errors.ward}
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
                                disabled={!formData.ward}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        fullWidth
                        label="Tax code"
                        value={formData.taxCode === 'N/A' ? '' : formData.taxCode}
                        onChange={(e) => handleInputChange('taxCode', e.target.value)}
                        error={!!errors.taxCode}
                        helperText={errors.taxCode || 'Tax code will be validated with government database'}
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
                    {loading ? (validatingTaxCode ? 'Validating tax code...' : 'Updating...') : 'Update information'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}