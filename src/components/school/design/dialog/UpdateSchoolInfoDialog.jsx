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
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {Business, LocationOn, Phone, Receipt} from '@mui/icons-material';
import {getDistricts, getProvinces, getWards} from '../../../../services/ShippingService.jsx';
import {getTaxInfo} from '../../../../services/TaxService.jsx';
import {checkSchoolInitData} from '../../../../services/AccountService.jsx';
import {useSnackbar} from 'notistack';

export default function UpdateSchoolInfoDialog({open, onClose, onUpdate, initialData}) {
    const {enqueueSnackbar} = useSnackbar();

    // Parse address from initialData if available
    const parseAddress = (address) => {
        if (!address || address === 'N/A') return {province: '', district: '', ward: '', street: ''};

        // Try to parse address format: "street, ward, district, province"
        const parts = address.split(',').map(part => part.trim());
        if (parts.length >= 4) {
            const street = parts[0];
            const ward = parts[1];
            const district = parts[2];
            const province = parts[3];

            return {
                province: province,
                district: district,
                ward: ward,
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

    // Available provinces, districts and wards based on selected province and district
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [validatingTaxCode, setValidatingTaxCode] = useState(false);
    const [taxCodeValid, setTaxCodeValid] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = () => {
            setLoadingProvinces(true);
            getProvinces()
                .then(response => {
                    if (response && response.status === 200) {
                        // Filter out unwanted provinces
                        const filteredProvinces = response.data.data.filter(province => {
                            const unwantedNames = [
                                'Hà Nội 02',
                                'Test - Alert - Tỉnh - 001',
                                'Ngoc test',
                                'Test'
                            ];
                            return !unwantedNames.some(name =>
                                province.ProvinceName.includes(name)
                            );
                        });
                        setProvinces(filteredProvinces);
                    }
                })
                .catch(error => {
                    console.error('Error fetching provinces:', error);
                })
                .finally(() => {
                    setLoadingProvinces(false);
                });
        };

        fetchProvinces();
    }, []);

    // Fetch districts for a province
    const fetchDistricts = (provinceId) => {
        setLoadingDistricts(true);
        getDistricts(provinceId)
            .then(response => {
                if (response && response.status === 200) {
                    setDistricts(response.data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching districts:', error);
            })
            .finally(() => {
                setLoadingDistricts(false);
            });
    };

    // Fetch wards for a district
    const fetchWards = (districtId) => {
        setLoadingWards(true);
        getWards(districtId)
            .then(response => {
                if (response && response.status === 200) {
                    setWards(response.data.data);
                }
            })
            .catch(error => {
                console.error('Error fetching wards:', error);
            })
            .finally(() => {
                setLoadingWards(false);
            });
    };

    // Validate tax code with API
    const validateTaxCodeWithAPI = async (taxCode) => {
        if (!taxCode || taxCode.length < 10 || taxCode.length > 13) {
            return false;
        }

        setValidatingTaxCode(true);
        try {
            const response = await getTaxInfo(taxCode);
            if (response) {
                const isValid = response.code === "00";
                setTaxCodeValid(isValid);
                return isValid;
            }
            setTaxCodeValid(false);
            return false;
        } catch (error) {
            console.error('Error validating tax code:', error);
            setTaxCodeValid(false);
            return false;
        } finally {
            setValidatingTaxCode(false);
        }
    };

    useEffect(() => {
        if (open) {
            // Only reset to step 1 when dialog first opens, not on every re-render
            setCurrentStep(1);
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
    }, [open]); // Remove initialData dependency to prevent resetting step

    // Separate useEffect for initialData changes that doesn't affect step
    useEffect(() => {
        if (open && initialData) {
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
    }, [initialData]); // Only depend on initialData

    const validateField = (field, value) => {
        switch (field) {
            case 'business':
                if (!value || (typeof value === 'string' && value.trim() === '')) return 'School name is required';
                if (typeof value === 'string' && value.trim().length < 3) return 'School name must be at least 3 characters';
                return '';
            case 'province':
                if (!value) return 'Province is required';
                return '';
            case 'district':
                if (!value) return 'District is required';
                return '';
            case 'ward':
                if (!value) return 'Ward is required';
                return '';
            case 'street':
                if (!value || (typeof value === 'string' && value.trim() === '')) return 'Street address is required';
                if (typeof value === 'string' && value.trim().length < 1) return 'Street address must be at least 1 characters';
                return '';
            case 'taxCode':
                if (!value || (typeof value === 'string' && value.trim() === '')) return 'Tax code is required';
                if (typeof value === 'string' && !/^[0-9]{10,13}$/.test(value.trim())) return 'Tax code must be 10-13 digits';
                if (taxCodeValid === false) return 'Tax code is not valid according to tax authority';
                return '';
            case 'phone':
                if (!value || (typeof value === 'string' && value.trim() === '')) return 'Phone number is required';
                if (typeof value === 'string' && !/^[0-9]{10}$/.test(value.trim())) return 'Phone number must be 10 digits';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        // Reset district, ward and street when province changes
        if (field === 'province') {
            setFormData(prev => ({...prev, district: "", ward: "", street: ""}));
            setDistricts([]);
            setWards([]);
            setErrors(prev => ({...prev, district: '', ward: '', street: ''}));

            // Clear tax code and phone when address changes
            setFormData(prev => ({...prev, taxCode: '', phone: ''}));
            setErrors(prev => ({...prev, taxCode: '', phone: ''}));
            setTaxCodeValid(null);

            // Reset server flags
            setIsTaxCodeFromServer(false);
            setIsPhoneFromServer(false);

            // Fetch districts for selected province
            if (value) {
                fetchDistricts(value);
            }
        }

        // Reset ward and street when district changes
        if (field === 'district') {
            setFormData(prev => ({...prev, ward: '', street: ''}));
            setWards([]);
            setErrors(prev => ({...prev, ward: '', street: ''}));

            // Clear tax code and phone when address changes
            setFormData(prev => ({...prev, taxCode: '', phone: ''}));
            setErrors(prev => ({...prev, taxCode: '', phone: ''}));
            setTaxCodeValid(null);

            // Reset server flags
            setIsTaxCodeFromServer(false);
            setIsPhoneFromServer(false);

            // Fetch wards for selected district
            if (value) {
                fetchWards(value);
            }
        }

        // Reset street when ward changes
        if (field === 'ward') {
            setFormData(prev => ({...prev, street: ''}));
            setErrors(prev => ({...prev, street: ''}));

            // Clear tax code and phone when address changes
            setFormData(prev => ({...prev, taxCode: '', phone: ''}));
            setErrors(prev => ({...prev, taxCode: '', phone: ''}));
            setTaxCodeValid(null);

            // Reset server flags
            setIsTaxCodeFromServer(false);
            setIsPhoneFromServer(false);
        }

        // Auto-validate tax code when user types
        if (field === 'taxCode') {
            // Clear validation state when user types
            setTaxCodeValid(null);
            // Clear any previous errors
            setErrors(prev => ({...prev, taxCode: ''}));
        }

        // Clear tax code and phone when school name changes
        // This is because existing tax code/phone might not be valid for new school name
        if (field === 'business') {
            setFormData(prev => ({
                ...prev,
                taxCode: '',
                phone: ''
            }));

            setErrors(prev => ({
                ...prev,
                taxCode: '',
                phone: ''
            }));

            setTaxCodeValid(null);

            // Reset server flags
            setIsTaxCodeFromServer(false);
            setIsPhoneFromServer(false);
        }

        const error = validateField(field, value);
        setErrors(prev => ({...prev, [field]: error}));
    };

    const handleSubmit = async () => {
        // Validate all fields
        const newErrors = {};

        // Use the state flags to check if fields are from server
        // These are set when we receive data from server in step 1

        // Special handling for tax code validation - only if not from server
        if (formData.taxCode && !isTaxCodeFromServer) {
            if (!/^[0-9]{10,13}$/.test(formData.taxCode)) {
                newErrors.taxCode = 'Tax code is not valid (10-13 digits)';
            } else if (taxCodeValid === null) {
                // Validate tax code with API during submit
                const isValid = await validateTaxCodeWithAPI(formData.taxCode);
                if (!isValid) {
                    newErrors.taxCode = 'Tax code is not valid according to tax authority';
                }
            } else if (taxCodeValid === false) {
                newErrors.taxCode = 'Tax code is not valid according to tax authority';
            }
        }

        // Validate other fields
        Object.keys(formData).forEach(field => {
            if (field === 'taxCode' && isTaxCodeFromServer) {
                // Skip tax code validation if it's from server
                return;
            }
            if (field === 'phone' && isPhoneFromServer) {
                // Skip phone validation if it's from server
                return;
            }

            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare address string for final submission
        const selectedProvince = provinces.find(p => p.ProvinceID === formData.province);
        const selectedDistrict = districts.find(d => d.DistrictID === formData.district);
        const selectedWard = wards.find(w => w.WardCode === formData.ward);

        const fullAddress = `${formData.street}, ${selectedWard?.WardName}, ${selectedDistrict?.DistrictName}, ${selectedProvince?.ProvinceName}`;

        // Call API to check school data for step 2 before updating
        setLoading(true);
        try {
            const checkResponse = await checkSchoolInitData(
                formData.business,
                fullAddress,
                formData.taxCode,
                formData.phone,
                2 // step 2
            );

            // Handle Step 2 response scenarios
            if (checkResponse && checkResponse.status === 200) {
                // Success - proceed with update
                const updateData = {
                    business: formData.business,
                    address: fullAddress,
                    taxCode: formData.taxCode,
                    phone: formData.phone
                };

                await onUpdate(updateData);
            } else {
                // Status 400 - show error message from API
                const errorMessage = checkResponse?.data?.message || 'School data validation failed. Please check your information.';
                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                    autoHideDuration: 5000
                });

                // Set specific errors based on the API response
                // The API will return specific error messages for each field
                setErrors({
                    business: 'Please check school name',
                    taxCode: 'Please check tax code',
                    phone: 'Please check phone number'
                });
            }
        } catch (error) {
            console.error('Error updating school info:', error);

            // Extract error message from API response if available
            const errorMessage = error?.response?.data?.message || 'Error updating school data. Please try again.';

            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 4000
            });

            // If there's an error updating the data, show a generic error
            setErrors({
                business: 'Error updating school data. Please try again.',
                taxCode: 'Error updating tax code. Please try again.',
                phone: 'Error updating phone number. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = () => {
        const step1Fields = ['business', 'province', 'district', 'ward', 'street'];

        const allFieldsHaveValue = step1Fields.every(field => {
            const value = formData[field];
            if (field === 'province' || field === 'district' || field === 'ward') {
                return value && value !== '';
            } else {
                return value && (typeof value === 'string' ? value.trim() !== '' : true) && value !== 'N/A';
            }
        });

        const hasNoErrors = step1Fields.every(field => !errors[field]);

        return allFieldsHaveValue && hasNoErrors;
    };

    const isStep2Valid = () => {
        const step2Fields = ['taxCode', 'phone'];

        const allFieldsHaveValue = step2Fields.every(field => {
            const value = formData[field];
            return value && (typeof value === 'string' ? value.trim() !== '' : true) && value !== 'N/A';
        });

        const hasNoErrors = step2Fields.every(field => !errors[field]);

        // If both fields are from server, they are considered valid
        if (isTaxCodeFromServer && isPhoneFromServer) {
            return true;
        }

        return allFieldsHaveValue && hasNoErrors;
    };

    // Check if tax code and phone are from existing school (read-only)
    // We need to track if these values came from server vs user input
    const [isTaxCodeFromServer, setIsTaxCodeFromServer] = useState(false);
    const [isPhoneFromServer, setIsPhoneFromServer] = useState(false);

    const isFromExistingSchool = () => {
        return isTaxCodeFromServer || isPhoneFromServer;
    };

    const isFormValid = () => {
        return isStep1Valid() && isStep2Valid();
    };

    const handleNextStep = async () => {
        if (!isStep1Valid()) {
            return;
        }

        setLoading(true);
        try {
            // Prepare address string in format: street, ward, district, province
            const selectedProvince = provinces.find(p => p.ProvinceID === formData.province);
            const selectedDistrict = districts.find(d => d.DistrictID === formData.district);
            const selectedWard = wards.find(w => w.WardCode === formData.ward);

            const addressString = `${formData.street}, ${selectedWard?.WardName}, ${selectedDistrict?.DistrictName}, ${selectedProvince?.ProvinceName}`;

            // Call API to check school data for step 1
            const checkResponse = await checkSchoolInitData(
                formData.business,
                addressString,
                '',
                '',
                1
            );

            // Handle Step 1 response scenarios
            if (checkResponse && checkResponse.status === 200) {
                const responseData = checkResponse.data;

                if (responseData.body === null) {
                    // Response 1: School name and address don't exist
                    // Continue to step 2
                    setCurrentStep(2);
                } else if (responseData.body) {
                    // Response 2: School name exists but address doesn't exist
                    // Server returns existing tax code and phone

                    // Update form with existing tax code and phone from server
                    setFormData(prev => ({
                        ...prev,
                        taxCode: responseData.body.taxCode || '',
                        phone: responseData.body.phone || ''
                    }));

                    // Mark these fields as coming from server
                    setIsTaxCodeFromServer(true);
                    setIsPhoneFromServer(true);

                    // Continue to step 2
                    setCurrentStep(2);
                }
            } else {
                // Status 400 or other errors
                const errorMessage = checkResponse?.data?.message || 'Error checking school data';
                enqueueSnackbar(errorMessage, {
                    variant: 'error',
                    autoHideDuration: 5000
                });

                setErrors({
                    business: 'Error checking school data',
                    province: 'Error checking address data',
                    district: 'Error checking address data',
                    ward: 'Error checking address data',
                    street: 'Error checking address data'
                });
            }
        } catch (error) {
            console.error('Error checking school data:', error);

            // Extract error message from API response if available
            const errorMessage = error?.response?.data?.message || 'Error checking school data. Please try again.';

            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 4000
            });

            setErrors({
                business: 'Error checking school data',
                province: 'Error checking address data',
                district: 'Error checking address data',
                ward: 'Error checking address data',
                street: 'Error checking address data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousStep = () => {
        // Clear tax code and phone when going back to step 1
        // This allows user to enter new values if they change school name
        setFormData(prev => ({
            ...prev,
            taxCode: '',
            phone: ''
        }));

        // Clear any errors related to tax code and phone
        setErrors(prev => ({
            ...prev,
            taxCode: '',
            phone: ''
        }));

        // Reset tax code validation state
        setTaxCodeValid(null);

        // Reset server flags
        setIsTaxCodeFromServer(false);
        setIsPhoneFromServer(false);

        setCurrentStep(1);
    };

    const handleClose = () => {
        setCurrentStep(1);
        onClose();
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
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        minWidth: '800px'
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

                {/* Step Indicator */}
                <Box sx={{display: 'flex', alignItems: 'center', width: '100%', mt: 2, px: 10}}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: currentStep >= 1 ? '#1976d2' : '#9e9e9e',
                        flex: 1
                    }}>
                        <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: currentStep >= 1 ? '#1976d2' : '#e0e0e0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            1
                        </Box>
                        <Typography variant="body2" sx={{fontWeight: currentStep >= 1 ? 600 : 400}}>
                            School Info & Address
                        </Typography>
                    </Box>

                    <Box sx={{
                        flex: 1,
                        height: 2,
                        backgroundColor: currentStep >= 2 ? '#1976d2' : '#e0e0e0',
                        mx: 2
                    }}/>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: currentStep >= 2 ? '#1976d2' : '#9e9e9e',
                        flex: 1,
                        justifyContent: 'flex-end'
                    }}>
                        <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: currentStep >= 2 ? '#1976d2' : '#e0e0e0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600
                        }}>
                            2
                        </Box>
                        <Typography variant="body2" sx={{fontWeight: currentStep >= 2 ? 600 : 400}}>
                            Tax & Contact
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{pt: 3}}>
                <Alert severity="info" sx={{mb: 3}}>
                    To ensure accuracy and security, please update all school information.
                </Alert>

                {/* Step 1: School Info & Address */}
                {currentStep === 1 && (
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

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <FormControl sx={{flex: 1}} error={!!errors.province}>
                                    <InputLabel>Province</InputLabel>
                                    <Select
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                        label="Province"
                                        variant='outlined'
                                        disabled={loadingProvinces}>
                                        {loadingProvinces ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{mr: 1}}/>
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

                                <FormControl sx={{flex: 1}} error={!!errors.district}
                                             disabled={!formData.province || loadingDistricts}>
                                    <InputLabel>District</InputLabel>
                                    <Select
                                        value={formData.district}
                                        onChange={(e) => handleInputChange('district', e.target.value)}
                                        label="District"
                                        variant='outlined'>
                                        {loadingDistricts ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{mr: 1}}/>
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

                                <FormControl sx={{flex: 1}} error={!!errors.ward}
                                             disabled={!formData.district || loadingWards}>
                                    <InputLabel>Ward</InputLabel>
                                    <Select
                                        value={formData.ward}
                                        onChange={(e) => handleInputChange('ward', e.target.value)}
                                        label="Ward"
                                        variant='outlined'>
                                        {loadingWards ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{mr: 1}}/>
                                                Loading wards...
                                            </MenuItem>
                                        ) : (
                                            wards.map((ward) => (
                                                <MenuItem key={ward.WardCode} value={ward.WardCode}>
                                                    {ward.WardName}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                    {errors.ward && (
                                        <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                                            {errors.ward}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>

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
                                sx={{flex: 2}}
                            />
                        </Box>
                    </Box>
                )}

                {/* Step 2: Tax & Contact */}
                {currentStep === 2 && (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {/* Info alert when data is from existing school */}
                        {isFromExistingSchool() && (
                            <Alert severity="info" sx={{mb: 2}}>
                                <Typography variant="body2">
                                    Tax code and phone number have been filled from existing school data. These fields
                                    are read-only.
                                </Typography>
                            </Alert>
                        )}
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start'}}>
                            <TextField
                                sx={{flex: 1}}
                                label="Tax code"
                                value={formData.taxCode === 'N/A' ? '' : formData.taxCode}
                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                error={!!errors.taxCode}
                                helperText={
                                    errors.taxCode ||
                                    (isTaxCodeFromServer ?
                                        '✅ Tax code from existing school (verified by server)' :
                                        validatingTaxCode ? 'Validating tax code...' :
                                            taxCodeValid === true ? '✅ Tax code is valid' :
                                                taxCodeValid === false ? '❌ Tax code is not valid' :
                                                    'Enter business tax code (10-13 digits)')
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: <Receipt sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                                InputProps={{
                                    endAdornment: validatingTaxCode ? (
                                        <CircularProgress size={20} sx={{mr: 1}}/>
                                    ) : taxCodeValid === true ? (
                                        <Box sx={{color: 'success.main', mr: 1}}>✅</Box>
                                    ) : taxCodeValid === false ? (
                                        <Box sx={{color: 'error.main', mr: 1}}>❌</Box>
                                    ) : null
                                }}
                                placeholder="Enter tax code (10-13 digits)"
                                disabled={isTaxCodeFromServer}
                            />

                            {/* Check Tax Code Button - Only show when tax code is not from existing school */}
                            {!isTaxCodeFromServer && (
                                <Button
                                    variant="outlined"
                                    onClick={async () => {
                                        if (formData.taxCode && /^[0-9]{10,13}$/.test(formData.taxCode)) {
                                            const isValid = await validateTaxCodeWithAPI(formData.taxCode);
                                            if (isValid) {
                                                setErrors(prev => ({...prev, taxCode: ''}));
                                            } else {
                                                setErrors(prev => ({
                                                    ...prev,
                                                    taxCode: 'Tax code is not valid according to tax authority'
                                                }));
                                            }
                                        } else {
                                            setErrors(prev => ({
                                                ...prev,
                                                taxCode: 'Please enter a valid tax code (10-13 digits)'
                                            }));
                                        }
                                    }}
                                    disabled={!formData.taxCode || validatingTaxCode}
                                    startIcon={validatingTaxCode ? <CircularProgress size={16}/> : <Receipt/>}
                                    sx={{
                                        width: 200,
                                        height: 56,
                                        flexShrink: 0
                                    }}
                                >
                                    {validatingTaxCode ? 'Checking...' : 'Check Tax Code'}
                                </Button>
                            )}
                        </Box>

                        {/* Validation Status - Only show when tax code is not from existing school */}
                        {!isTaxCodeFromServer && (
                            <>
                                {validatingTaxCode && (
                                    <Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 1}}>
                                        <CircularProgress size={16}/>
                                        <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                            Validating with tax authority...
                                        </Typography>
                                    </Box>
                                )}

                                {taxCodeValid === true && (
                                    <Box sx={{
                                        mt: 1,
                                        p: 1.5,
                                        bgcolor: 'success.50',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'success.200'
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: 'success.700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            ✅ <strong>Verified:</strong> This tax code is valid and registered with the
                                            tax authority.
                                        </Typography>
                                    </Box>
                                )}

                                {taxCodeValid === false && (
                                    <Box sx={{
                                        mt: 1,
                                        p: 1.5,
                                        bgcolor: 'error.50',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'error.200'
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: 'error.700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            ❌ <strong>Invalid:</strong> This tax code is not valid according to the tax
                                            authority.
                                        </Typography>
                                        <Typography variant="caption"
                                                    sx={{color: 'error.600', mt: 0.5, display: 'block'}}>
                                            Please check your tax code and try again.
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Phone number"
                            value={formData.phone === 'N/A' ? '' : formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            helperText={
                                errors.phone ||
                                (isPhoneFromServer ? 'Phone from existing school (read-only)' : 'Enter phone number (10 digits)')
                            }
                            slotProps={{
                                input: {
                                    startAdornment: <Phone sx={{mr: 1, color: 'text.secondary'}}/>
                                }
                            }}
                            placeholder="Enter phone number (10 digits)"
                            disabled={isPhoneFromServer}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{p: 3, pt: 1}}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    sx={{
                        color: '#64748b',
                        '&:hover': {backgroundColor: '#f1f5f9'}
                    }}
                >
                    Cancel
                </Button>

                {currentStep === 1 && (
                    <Button
                        onClick={handleNextStep}
                        disabled={!isStep1Valid() || loading}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1976d2',
                            '&:hover': {backgroundColor: '#1565c0'},
                            '&:disabled': {backgroundColor: '#e0e0e0'}
                        }}
                        startIcon={loading ? <CircularProgress size={16}/> : null}
                    >
                        {loading ? 'Checking...' : 'Next'}
                    </Button>
                )}

                {currentStep === 2 && (
                    <>
                        <Button
                            onClick={handlePreviousStep}
                            disabled={loading}
                            sx={{
                                color: '#64748b',
                                borderColor: '#64748b',
                                '&:hover': {backgroundColor: '#f1f5f9'}
                            }}
                            variant="outlined"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!isStep2Valid() || loading}
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
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
} 
