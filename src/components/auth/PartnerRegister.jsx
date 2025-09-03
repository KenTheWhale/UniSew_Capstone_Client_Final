import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import {InlineLoading} from '../ui/LoadingSpinner.jsx';
import {
    AccessTime as AccessTimeIcon,
    AccountBalance as AccountBalanceIcon,
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    PersonAdd as PersonAddIcon,
    Phone as PhoneIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import {encryptPartnerData, validatePartnerInfo, validatePartnerTaxCode} from "../../services/AuthService.jsx";
import {emailType, sendEmail} from '../../services/EmailService.jsx';
import {getBanks, getDistricts, getProvinces, getWards} from "../../services/ShippingService.jsx";
import {getTaxInfo} from "../../services/TaxService.jsx";
import {uploadCloudinary} from "../../services/UploadImageService.jsx";
import {enqueueSnackbar} from "notistack";

// Vietnam provinces and cities data
const steps = ['Personal information', 'Address', 'Partner Type', 'Business information', 'Basic information & Banking'];

export default function PartnerRegister() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        partnerType: '',
        taxCode: '',
        name: '',
        businessName: '',
        avatar: '',
        startTime: '',
        endTime: '',
        bank: '',
        bankAccountNumber: '',
        cardOwner: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Available districts and wards based on selected province and district
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [validatingTaxCode, setValidatingTaxCode] = useState(false);
    const [taxCodeValid, setTaxCodeValid] = useState(null);
    const [taxCodeRegistered, setTaxCodeRegistered] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);


    // Fetch provinces and banks on component mount
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

        const fetchBanks = () => {
            setLoadingBanks(true);
            getBanks()
                .then(response => {
                    if (response && response.status === 200) {
                        setBanks(response.data.data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching banks:', error);
                })
                .finally(() => {
                    setLoadingBanks(false);
                });
        };

        fetchProvinces();
        fetchBanks();
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

    const validateEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        // Phone number format for Vietnam: 10-11 digits, starting with 0
        const phoneRegex = /^0[0-9]{9,10}$/;
        return phoneRegex.test(phone);
    };

    const removeVietnameseAccents = (str) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
            .replace(/[Đ]/g, 'D'); // Replace Đ with D
    };

    const validateTaxCode = (taxCode) => {
        const taxCodeRegex = /^[0-9]{10,13}$/;
        return taxCodeRegex.test(taxCode);
    };


    const validateTaxCodeWithAPI = async (taxCode) => {
        if (!taxCode || taxCode.length < 10 || taxCode.length > 13) {
            return false;
        }

        setValidatingTaxCode(true);
        try {
            // First, validate tax code with tax authority
            const taxResponse = await getTaxInfo(taxCode);
            if (taxResponse) {
                const isValid = taxResponse.code === "00";
                console.log("Tax valid")
                setTaxCodeValid(isValid);

                if (isValid) {
                    // If tax code is valid, check if it's already registered
                    try {
                        const partnerResponse = await validatePartnerTaxCode(taxCode);
                        if (partnerResponse && partnerResponse.status === 200) {
                            if (partnerResponse.data.body.existed) {
                                setTaxCodeRegistered(true);
                                return false; // Tax code already registered
                            } else {
                                setTaxCodeRegistered(false);
                                return true; // Tax code valid and not registered
                            }
                        } else {
                            setTaxCodeRegistered(null);
                            return false;
                        }
                    } catch (partnerError) {
                        console.error('Error validating partner tax code:', partnerError);
                        setTaxCodeRegistered(null);
                        return false;
                    }
                } else {
                    setTaxCodeValid(false);
                    return false;
                }
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

    const validateField = (field, value) => {
        switch (field) {
            case 'email':
                if (!value) return 'Please enter your email address';
                if (!validateEmailFormat(value)) return 'Please enter a valid email address';
                return '';
            case 'phone':
                if (!value) return 'Please enter your phone number';
                if (!validatePhone(value)) return 'Please enter a valid 10-digit phone number';
                return '';
            case 'province':
                if (!value) return 'Please select a province/city';
                return '';
            case 'district':
                if (!value) return 'Please select a district/county';
                return '';
            case 'ward':
                if (!value) return 'Please select a ward/commune';
                return '';
            case 'street':
                if (!value) return 'Please enter house number and street name';
                if (value.length < 1) return 'Street name must have at least 1 character';
                return '';
            case 'partnerType':
                if (!value) return 'Please select your role';
                return '';
            case 'taxCode':
                if (!value) return 'Tax code is required';
                if (!validateTaxCode(value)) return 'Tax code is not valid (10-13 digits)';
                if (taxCodeValid === null) return 'Please click "Check Tax Code" to validate';
                if (taxCodeValid === false) return 'Tax code is not valid according to tax authority';
                if (taxCodeRegistered === true) return 'Tax code is already registered by another partner';
                if (taxCodeRegistered === null) return 'Please click "Check Tax Code" to validate';
                return '';
            case 'name':
                if (!value) return 'Please enter representative name';
                if (value.length < 2) return 'Name must have at least 2 characters';
                return '';
            case 'businessName':
                if (!value) return 'Please enter business/organization name';
                if (value.length < 2) return 'Business name must have at least 2 characters';
                return '';
            case 'avatar':
                if (!value) return 'Please upload a representative photo';
                return '';
            case 'startTime':
                if (!value) return 'Please select start time';
                return '';
            case 'endTime':
                if (!value) return 'Please select end time';
                if (value && formData.startTime && value <= formData.startTime) {
                    return 'End time must be after start time';
                }
                return '';
            case 'bank':
                if (!value) return 'Please select a bank';
                return '';
            case 'bankAccountNumber':
                if (!value) return 'Please enter bank account number';
                if (value.length < 6) return 'Account number must have at least 6 characters';
                if (value.length > 15) return 'Account number must not exceed 15 characters';
                return '';
            case 'cardOwner':
                if (!value) return 'Please enter account owner name';
                if (value.length < 2) return 'Owner name must have at least 2 characters';
                if (!/^[A-Z\s]+$/.test(value)) return 'Owner name must be uppercase letters only (no accents, no numbers)';
                return '';
            default:
                return '';
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({...prev, avatar: 'Please select an image file'}));
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({...prev, avatar: 'Image size must be less than 10MB'}));
            return;
        }

        setUploadingImage(true);
        setErrors(prev => ({...prev, avatar: ''}));

        try {
            const imageUrl = await uploadCloudinary(file);
            if (imageUrl) {
                setFormData(prev => ({...prev, avatar: imageUrl}));
            } else {
                setErrors(prev => ({...prev, avatar: 'Failed to upload image. Please try again.'}));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors(prev => ({...prev, avatar: 'Failed to upload image. Please try again.'}));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        // Clear district and ward when province changes
        if (field === 'province') {
            setFormData(prev => ({...prev, district: '', ward: ''}));
            setDistricts([]);
            setWards([]);

            // Fetch districts for selected province
            if (value) {
                fetchDistricts(value);
            }
        }

        // Clear ward when district changes
        if (field === 'district') {
            setFormData(prev => ({...prev, ward: ''}));
            setWards([]);

            // Fetch wards for selected district
            if (value) {
                fetchWards(value);
            }
        }


        // Auto-validate tax code when user types
        if (field === 'taxCode') {
            // Clear validation state when user types
            setTaxCodeValid(null);
            setTaxCodeRegistered(null);
            // Clear any previous errors
            setErrors(prev => ({...prev, taxCode: ''}));
        }

        // Auto-validate email, phone, bankAccountNumber, and cardOwner when user types
        if (field === 'email' || field === 'phone' || field === 'bankAccountNumber' || field === 'cardOwner') {
            // Validate field and set error if any
            const error = validateField(field, value);
            setErrors(prev => ({...prev, [field]: error}));
        }

        // Re-validate endTime when startTime changes
        if (field === 'startTime') {
            if (formData.endTime) {
                const endTimeError = validateField('endTime', formData.endTime);
                setErrors(prev => ({...prev, endTime: endTimeError}));

                // If endTime is now invalid (before new startTime), reset it
                if (endTimeError) {
                    setFormData(prev => ({...prev, endTime: ''}));
                    setErrors(prev => ({...prev, endTime: ''}));
                }
            }
        }
    };

    const isStepValid = (step) => {
        if (step === 0) {
            const isValid = formData.email && formData.phone && validateEmailFormat(formData.email) && validatePhone(formData.phone);
            console.log('isStepValid(0):', isValid);
            console.log('formData.email:', formData.email);
            console.log('formData.phone:', formData.phone);
            console.log('validateEmailFormat(formData.email):', validateEmailFormat(formData.email));
            console.log('validatePhone(formData.phone):', validatePhone(formData.phone));
            return isValid;
        }

        switch (step) {
            case 0:
                return formData.email && formData.phone && validateEmailFormat(formData.email) && validatePhone(formData.phone);
            case 1:
                return formData.province && formData.district && formData.ward && formData.street;
            case 2:
                return !errors.partnerType && formData.partnerType;
            case 3:
                return !errors.taxCode && formData.taxCode && taxCodeValid === true && taxCodeRegistered === false;
            case 4:
                return formData.name && formData.businessName && formData.avatar &&
                    formData.startTime && formData.endTime && formData.bank &&
                    formData.bankAccountNumber && formData.cardOwner;
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Validate email and phone format before proceeding
            if (formData.email && formData.phone && validateEmailFormat(formData.email) && validatePhone(formData.phone)) {
                try {
                    const response = await validatePartnerInfo(formData.email, formData.phone);
                    if (response && response.status === 200) {
                        if (response.data.body.existed) {
                            enqueueSnackbar('This email or phone is already used', {variant: 'error'});
                        } else {
                            setActiveStep(prev => prev + 1);
                        }
                    }
                } catch (error) {
                    console.error('Error validating email:', error);
                    enqueueSnackbar('Error validating email. Please try again.', {variant: 'error'});
                }
            } else {
                // Email or phone format không hợp lệ
                if (!formData.email || !validateEmailFormat(formData.email)) {
                    enqueueSnackbar('Please enter a valid email address', {variant: 'error'});
                } else if (!formData.phone || !validatePhone(formData.phone)) {
                    enqueueSnackbar('Please enter a valid phone number (10-11 digits starting with 0)', {variant: 'error'});
                }
            }
        } else if (isStepValid(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        // Validate all fields
        const newErrors = {};
        // Special handling for tax code validation
        if (formData.taxCode) {
            if (!validateTaxCode(formData.taxCode)) {
                newErrors.taxCode = 'Tax code is not valid (10-13 digits)';
            } else if (taxCodeValid === null || taxCodeRegistered === null) {
                // Validate tax code with API during submit
                const isValid = await validateTaxCodeWithAPI(formData.taxCode);
                if (!isValid) {
                    if (taxCodeRegistered === true) {
                        newErrors.taxCode = 'Tax code is already registered by another partner';
                    } else {
                        newErrors.taxCode = 'Tax code is not valid according to tax authority';
                    }
                }
            } else if (taxCodeValid === false) {
                newErrors.taxCode = 'Tax code is not valid according to tax authority';
            } else if (taxCodeRegistered === true) {
                newErrors.taxCode = 'Tax code is already registered by another partner';
            }
        }

        // Validate other fields
        Object.keys(formData).forEach(field => {
            if (field !== 'taxCode') { // Skip tax code as we handled it above
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setError('');

        const selectedProvince = provinces.find(province => province.ProvinceID === formData.province)
        const selectedDistrict = districts.find(district => district.DistrictID === formData.district)
        const selectedWard = wards.find(ward => ward.WardCode === formData.ward)

        const encryptData = {
            accountData: {
                email: formData.email,
                role: formData.partnerType === 'designer' ? 'DESIGNER' : 'GARMENT',
            },
            customerData: {
                address: formData.street,
                ward: selectedWard.WardName,
                district: selectedDistrict.DistrictName,
                province: selectedProvince.ProvinceName,
                taxCode: formData.taxCode,
                name: formData.name,
                businessName: formData.businessName,
                phone: formData.phone,
                avatar: formData.avatar
            },
            partnerData: {
                startTime: formData.startTime,
                endTime: formData.endTime
            },
            walletData: {
                bank: formData.bank,
                bankAccountNumber: formData.bankAccountNumber,
                cardOwner: formData.cardOwner
            },
            storeData: {
                districtId: parseInt(formData.district),
                wardCode: parseInt(formData.ward),
                address: formData.street,
                name: formData.businessName,
                phone: formData.phone
            }
        }

        console.log("Encrypt data: ", encryptData)

        encryptPartnerData(encryptData)
            .then(res => {
                if (res && res.status === 200) {

                    const url = import.meta.env.VITE_SERVER_FE

                    const emailParam = {
                        title: 'Email Confirmation for Partner Register',
                        verifiedLink: `${url}/email/confirmation?p=` + res.data.body.encryptData,
                        receiver: formData.email
                    }

                    sendEmail(emailType.confirmation, emailParam).then(() => {
                        setSuccess(true)
                        setLoading(false)
                    }).catch((error) => {
                        console.error('Error sending email:', error);
                        setError("Failed to send confirmation email. Please try again.");
                        setLoading(false);
                    })

                }
            })
            .catch(() => setError("Something wrong. Please try again"))

    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                👤 Tell us about yourself
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Enter your contact details
                            </Typography>
                        </Box>

                        {/* Personal Information Form */}
                        <Box sx={{display: 'flex', gap: 3, width: '100%'}}>
                            <Box sx={{flex: 1}}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email || 'Enter your email address'}
                                    placeholder="your.email@example.com"
                                    slotProps={{
                                        input: {
                                            startAdornment: <EmailIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                        }
                                    }}
                                />
                            </Box>
                            <Box sx={{flex: 1}}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    error={!!errors.phone}
                                    helperText={errors.phone || 'Enter 10-11 digit phone number starting with 0'}
                                    placeholder="0987654321"
                                    slotProps={{
                                        input: {
                                            startAdornment: <PhoneIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                📍 Address
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Enter your location details
                            </Typography>
                        </Box>

                        {/* Address Form */}
                        <Box sx={{width: '100%'}}>
                            {/* Province - Always visible */}
                            <Box sx={{mb: 3}}>
                                <FormControl fullWidth error={!!errors.province}>
                                    <InputLabel>Province/City</InputLabel>
                                    <Select
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                        label="Province/City"
                                        variant='outlined'
                                        disabled={loadingProvinces}
                                        inputProps={{
                                            input: {
                                                startAdornment: <LocationIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                            }
                                        }}>
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
                                        <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                            {errors.province}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>

                            {/* District - Only visible when province is selected */}
                            {formData.province && (
                                <Box sx={{mb: 3}}>
                                    <FormControl fullWidth error={!!errors.district}>
                                        <InputLabel>District/County</InputLabel>
                                        <Select
                                            value={formData.district}
                                            onChange={(e) => handleInputChange('district', e.target.value)}
                                            label="District/County"
                                            variant='outlined'
                                            disabled={loadingDistricts}
                                            inputProps={{
                                                input: {
                                                    startAdornment: <LocationIcon
                                                        sx={{mr: 1, color: 'text.secondary'}}/>
                                                }
                                            }}>
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
                                            <Typography variant="caption" color="error"
                                                        sx={{mt: 0.5, display: 'block'}}>
                                                {errors.district}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Box>
                            )}

                            {/* Ward - Only visible when district is selected */}
                            {formData.district && (
                                <Box sx={{mb: 3}}>
                                    <FormControl fullWidth error={!!errors.ward}>
                                        <InputLabel>Ward/Commune</InputLabel>
                                        <Select
                                            value={formData.ward}
                                            onChange={(e) => handleInputChange('ward', e.target.value)}
                                            label="Ward/Commune"
                                            variant='outlined'
                                            disabled={loadingWards}
                                            slotProps={{
                                                input: {
                                                    startAdornment: <LocationIcon
                                                        sx={{mr: 1, color: 'text.secondary'}}/>
                                                }
                                            }}>
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
                                            <Typography variant="caption" color="error"
                                                        sx={{mt: 0.5, display: 'block'}}>
                                                {errors.ward}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Box>
                            )}

                            {/* Street - Only visible when ward is selected */}
                            {formData.ward && (
                                <Box sx={{mb: 3}}>
                                    <TextField
                                        fullWidth
                                        label="House Number & Street Name"
                                        value={formData.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        error={!!errors.street}
                                        helperText={errors.street || 'Enter your house number and street name'}
                                        placeholder="123, Nguyen Van Linh Street"
                                        slotProps={{
                                            input: {
                                                startAdornment: <LocationIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Help Text */}
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'primary.200'
                        }}>
                            <Typography variant="body2" sx={{color: 'text.secondary', textAlign: 'center'}}>
                                💡 Please provide accurate address information
                            </Typography>
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{width: '100%'}}>
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                🎯 Partner Type
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Choose your role
                            </Typography>
                        </Box>
                        <FormControl fullWidth error={!!errors.partnerType}>
                            <InputLabel>Your Role</InputLabel>
                            <Select
                                value={formData.partnerType}
                                onChange={(e) => handleInputChange('partnerType', e.target.value)}
                                label="Your Role"
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        startAdornment: <PersonAddIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                            >
                                <MenuItem value="designer">
                                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                            🎨 Designer
                                        </Typography>
                                        <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                            Create beautiful and creative uniform designs
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="garment">
                                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                            🏭 Garment Factory
                                        </Typography>
                                        <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                            Produce and sew high-quality uniforms
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                            {errors.partnerType && (
                                <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                    {errors.partnerType}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{width: '100%'}}>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                🏢 Business Information
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Enter your tax code
                            </Typography>
                        </Box>

                        {/* Tax Code Form */}
                        <Box sx={{width: '100%'}}>
                            <TextField
                                fullWidth
                                label="Tax Code"
                                value={formData.taxCode}
                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                error={!!errors.taxCode}
                                helperText={
                                    errors.taxCode ||
                                    (validatingTaxCode ? 'Validating tax code...' :
                                        taxCodeValid === true && taxCodeRegistered === false ? '✅ Tax code is valid and available' :
                                            taxCodeValid === true && taxCodeRegistered === true ? '❌ Tax code is already registered by another partner' :
                                                taxCodeValid === false ? '❌ Tax code is not valid' :
                                                    'Enter business tax code (10-13 digits)')
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: <BusinessIcon sx={{mr: 1, color: 'text.secondary'}}/>
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
                            />

                            {/* Check Tax Code Button */}
                            <Box sx={{mt: 2, display: 'flex', justifyContent: 'center'}}>
                                <Button
                                    variant="outlined"
                                    onClick={async () => {
                                        if (formData.taxCode && validateTaxCode(formData.taxCode)) {
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
                                    startIcon={validatingTaxCode ? <InlineLoading size={16}/> : <BusinessIcon/>}
                                    sx={{minWidth: 150}}
                                >
                                    {validatingTaxCode ? 'Checking...' : 'Check Tax Code'}
                                </Button>
                            </Box>

                            {/* Validation Status */}
                            {validatingTaxCode && (
                                <Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 1}}>
                                    <CircularProgress size={16}/>
                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                        Validating with tax authority...
                                    </Typography>
                                </Box>
                            )}

                            {taxCodeValid === true && taxCodeRegistered === false && (
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
                                        ✅ <strong>Verified:</strong> This tax code is valid and available for
                                        registration.
                                    </Typography>
                                </Box>
                            )}

                            {taxCodeValid === true && taxCodeRegistered === true && (
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
                                        ❌ <strong>Already Registered:</strong> This tax code is already registered by
                                        another partner.
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
                                    <Typography variant="caption" sx={{color: 'error.600', mt: 0.5, display: 'block'}}>
                                        Please check your tax code and try again.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        {/* Header */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                👤 Basic Information
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Enter your representative details and working hours
                            </Typography>
                        </Box>

                        {/* Representative Information */}
                        <Box sx={{width: '100%', mb: 3}}>
                            <Box sx={{display: 'flex', gap: 3}}>
                                <Box sx={{flex: 1}}>
                                    <TextField
                                        fullWidth
                                        label="👤 Representative Name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name || 'Enter the name of the person representing the business'}
                                        placeholder="Nguyen Van A"
                                    />
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <TextField
                                        fullWidth
                                        label="🏢 Business/Organization Name"
                                        value={formData.businessName}
                                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                                        error={!!errors.businessName}
                                        helperText={errors.businessName || 'Enter your business or organization name'}
                                        placeholder="ABC Company Ltd."
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Avatar Upload */}
                        <Box sx={{width: '100%', mb: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Avatar
                                    src={formData.avatar}
                                    sx={{width: 80, height: 80, border: '2px dashed', borderColor: 'primary.main'}}
                                />
                                <Box sx={{flex: 1}}>
                                    <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
                                        📸 Representative Photo
                                    </Typography>
                                    <input
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        id="avatar-upload"
                                        type="file"
                                        onChange={handleImageUpload}
                                    />
                                    <label htmlFor="avatar-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<PhotoCameraIcon/>}
                                            disabled={uploadingImage}
                                            sx={{mr: 1}}
                                        >
                                            {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                                        </Button>
                                    </label>
                                    {errors.avatar && (
                                        <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                            {errors.avatar}
                                        </Typography>
                                    )}
                                    {formData.avatar && (
                                        <Typography variant="caption" sx={{color: 'success.main', display: 'block'}}>
                                            ✅ Photo uploaded successfully
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Working Hours */}
                        <Box sx={{width: '100%', mb: 3}}>
                            <Box sx={{display: 'flex', gap: 3}}>
                                <Box sx={{flex: 1}}>
                                    <TextField
                                        fullWidth
                                        label="🕐 Start Time"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        error={!!errors.startTime}
                                        helperText={errors.startTime || 'Select your daily start time'}
                                        inputProps={{
                                            step: 900 // 15 minutes intervals
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: <AccessTimeIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                            }
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <TextField
                                        fullWidth
                                        label="🕐 End Time"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        error={!!errors.endTime}
                                        helperText={errors.endTime || 'Select your daily end time'}
                                        inputProps={{
                                            min: formData.startTime || undefined,
                                            step: 900 // 15 minutes intervals
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: <AccessTimeIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                            }
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        disabled={!formData.startTime}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Banking Information */}
                        <Box sx={{width: '100%', mt: 4}}>
                            <Box sx={{mb: 3}}>
                                <Typography variant="h6" sx={{mb: 1, color: 'text.primary', fontWeight: 600}}>
                                    💳 Banking Information
                                </Typography>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    Enter your banking details for payment processing
                                </Typography>
                            </Box>
                            <Box sx={{mb: 3}}>
                                <FormControl fullWidth error={!!errors.bank} disabled={loadingBanks}>
                                    <InputLabel>🏦 Bank</InputLabel>
                                    <Select
                                        value={formData.bank}
                                        onChange={(e) => handleInputChange('bank', e.target.value)}
                                        label="🏦 Bank"
                                        variant='outlined'
                                        slotProps={{
                                            input: {
                                                startAdornment: <AccountBalanceIcon
                                                    sx={{mr: 1, color: 'text.secondary'}}/>
                                            }
                                        }}
                                    >
                                        {loadingBanks ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{mr: 1}}/>
                                                Loading banks...
                                            </MenuItem>
                                        ) : (
                                            banks.map((bank) => (
                                                <MenuItem key={bank.code} value={bank.code}>
                                                    {bank.code} - {bank.shortName}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                    {errors.bank && (
                                        <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                            {errors.bank}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                            <Box sx={{mb: 3}}>
                                <TextField
                                    fullWidth
                                    label="💳 Bank Account Number"
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                                    error={!!errors.bankAccountNumber}
                                    helperText={errors.bankAccountNumber || 'Enter 6-15 characters (numbers and/or letters)'}
                                    placeholder="123456789"
                                />
                            </Box>
                            <Box sx={{mb: 3}}>
                                <TextField
                                    fullWidth
                                    label="👤 Account Owner Name"
                                    value={formData.cardOwner}
                                    onChange={(e) => handleInputChange('cardOwner', removeVietnameseAccents(e.target.value.toUpperCase()))}
                                    error={!!errors.cardOwner}
                                    helperText={errors.cardOwner || 'Enter uppercase letters only (no accents, no numbers)'}
                                    placeholder="NGUYEN VAN A"
                                />
                            </Box>
                        </Box>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    if (success) {
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
                    <Paper elevation={8} sx={{p: 4, textAlign: 'center', borderRadius: 3}}>
                        <CheckCircleIcon sx={{fontSize: 80, color: 'success.main', mb: 2}}/>
                        <Typography variant="h4" sx={{fontWeight: 700, mb: 2, color: 'success.main'}}>
                            Please check your email for confirmation!
                        </Typography>
                        <Typography variant="body1" sx={{mb: 3, color: 'text.secondary'}}>
                            Thank you for choosing UniSew as your partner!
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{borderRadius: 2}}
                        >
                            Go to Login
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                <Paper elevation={8} sx={{p: 4, borderRadius: 3}}>
                    {/* Header */}
                    <Box sx={{textAlign: 'center', mb: 6, mt: 2}}>
                        <PersonAddIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
                        <Typography variant="h3" sx={{fontWeight: 700, mb: 2, color: 'text.primary'}}>
                            Partner Registration
                        </Typography>
                        <Typography variant="body1" sx={{color: 'text.secondary', maxWidth: 800, mx: 'auto'}}>
                            Register to become a partner
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{mb: 3}}>
                            {error}
                        </Alert>
                    )}

                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{mb: 4}}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel
                                    sx={{
                                        flexDirection: 'column', // Đặt icon và text theo chiều dọc
                                        '& .MuiStepLabel-label': {
                                            marginTop: '8px', // Khoảng cách giữa icon và text
                                            textAlign: 'center' // Căn giữa text
                                        },
                                        '& .MuiStepLabel-iconContainer': {
                                            marginBottom: '8px' // Đảm bảo icon có khoảng cách với text
                                        }
                                    }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Form Content */}
                    <Box sx={{mb: 4}}>
                        {getStepContent(activeStep)}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{borderRadius: 2}}
                        >
                            Back
                        </Button>

                        <Box>
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading || !isStepValid(activeStep)}
                                    startIcon={loading ? <InlineLoading size={20}/> : <PersonAddIcon/>}
                                    sx={{borderRadius: 2, px: 4}}
                                >
                                    {loading ? 'Sending...' :
                                        formData.partnerType === 'designer' ? 'Create designer account' :
                                            formData.partnerType === 'garment' ? 'Create garment factory account' :
                                                'Create account'
                                    }
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={!isStepValid(activeStep)}
                                    sx={{borderRadius: 2}}
                                >
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}