import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    Grid,
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
import {
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    PersonAdd as PersonAddIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';
import {encryptPartnerData} from "../../services/AuthService.jsx";
import emailjs from '@emailjs/browser';
import {vietnamProvinces} from "../../configs/FixedVariables.jsx";

// Vietnam provinces and cities data


const steps = ['Personal information', 'Address', 'Business information'];

export default function DesignerRegister() {
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
        street: '',
        taxCode: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Available districts based on selected province
    const availableDistricts = vietnamProvinces.find(p => p.id === formData.province)?.districts || [];

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const validateTaxCode = (taxCode) => {
        const taxCodeRegex = /^[0-9]{10,13}$/;
        return taxCodeRegex.test(taxCode);
    };

    const validateField = (field, value) => {
        switch (field) {
            case 'email':
                if (!value) return 'Email is required';
                if (!validateEmail(value)) return 'Email is not valid';
                return '';
            case 'phone':
                if (!value) return 'Phone is required';
                if (!validatePhone(value)) return 'Phone is not valid';
                return '';
            case 'province':
                if (!value) return 'Province is required';
                return '';
            case 'district':
                if (!value) return 'District is required';
                return '';
            case 'street':
                if (!value) return 'Street is required';
                if (value.length < 1) return 'Street must be at least 1 characters';
                return '';
            case 'taxCode':
                if (!value) return 'Tax code is required';
                if (!validateTaxCode(value)) return 'Tax code is not valid (10-13 digits)';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        // Clear district when province changes
        if (field === 'province') {
            setFormData(prev => ({...prev, district: ''}));
        }

        // Validate field
        const error = validateField(field, value);
        setErrors(prev => ({...prev, [field]: error}));
    };

    const isStepValid = (step) => {
        switch (step) {
            case 0:
                return !errors.email && !errors.phone && formData.email && formData.phone;
            case 1:
                return !errors.province && !errors.district && !errors.street &&
                    formData.province && formData.district && formData.street;
            case 2:
                return !errors.taxCode && formData.taxCode;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (isStepValid(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
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

        setLoading(true);
        setError('');

        const selectedProvince = vietnamProvinces.find(province => province.id === formData.province)
        const selectedDistrict = selectedProvince.districts.find(district => district.id === formData.district)

        const encryptData = {
            email: formData.email,
            role: "DESIGNER",
            address: formData.street + ', ' + selectedDistrict.name + ', ' + selectedProvince.name,
            taxCode: formData.taxCode,
            phone: formData.phone
        }

        encryptPartnerData(encryptData)
            .then(res => {
                if (res && res.status === 200) {
                    console.log("Response: ", res.data.body.encryptData)

                    const emailParam = {
                        title: 'Email Confirmation for Designer Register',
                        verifiedLink: 'http://localhost:5173/email/confirmation?p=' + res.data.body.encryptData,
                        receiver: formData.email
                    }

                    emailjs.send('service_ipof5uq', 'template_ergky7m', emailParam, {
                        publicKey: 'lw0xwIjxBp7P1BjuS'
                    }).then(() => {
                        setSuccess(true)
                        setLoading(false)
                    })

                }
            })
            .catch(() => setError("Something wrong. Please try again"))

    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3} sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                slotProps={{
                                    input: {
                                        startAdornment: <EmailIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                            />
                        </Grid>
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                error={!!errors.phone}
                                helperText={errors.phone || 'Example: 09123456788'}
                                slotProps={{
                                    input: {
                                        startAdornment: <PhoneIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3} sx={{display: 'flex', alignItems: 'flex-start'}}>
                        <Grid sx={{flex: 1}}>
                            <FormControl fullWidth error={!!errors.province}>
                                <InputLabel>Province/City</InputLabel>
                                <Select
                                    value={formData.province}
                                    onChange={(e) => handleInputChange('province', e.target.value)}
                                    label="Province/City"
                                    variant='outlined'>
                                    {vietnamProvinces.map((province) => (
                                        <MenuItem key={province.id} value={province.id}>
                                            {province.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.province && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                        {errors.province}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid sx={{flex: 1}}>
                            <FormControl fullWidth error={!!errors.district} disabled={!formData.province}>
                                <InputLabel>District/County</InputLabel>
                                <Select
                                    value={formData.district}
                                    onChange={(e) => handleInputChange('district', e.target.value)}
                                    label="District/County"
                                    variant='outlined'>
                                    {availableDistricts.map((district) => (
                                        <MenuItem key={district.id} value={district.id}>
                                            {district.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.district && (
                                    <Typography variant="caption" color="error" sx={{mt: 0.5, display: 'block'}}>
                                        {errors.district}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid sx={{flex: 2}}>
                            <TextField
                                fullWidth
                                label="Street"
                                value={formData.street}
                                onChange={(e) => handleInputChange('street', e.target.value)}
                                error={!!errors.street}
                                helperText={errors.street || 'Example: 123 Nguyen Hue'}
                                slotProps={{
                                    input: {
                                        startAdornment: <LocationIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                                disabled={!formData.district}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid sx={{width: '100%'}}>
                            <TextField
                                fullWidth
                                label="Tax Code"
                                value={formData.taxCode}
                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                error={!!errors.taxCode}
                                helperText={errors.taxCode || 'Enter business tax code (10-13 digits)'}
                                slotProps={{
                                    input: {
                                        startAdornment: <BusinessIcon sx={{mr: 1, color: 'text.secondary'}}/>
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
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
                            Request sent!
                        </Typography>
                        <Typography variant="body1" sx={{mb: 3, color: 'text.secondary'}}>
                            We have received your designer account registration request.
                            We will contact you as soon as possible.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                                setSuccess(false);
                                setActiveStep(0);
                                setFormData({
                                    email: '',
                                    phone: '',
                                    province: '',
                                    district: '',
                                    street: '',
                                    taxCode: ''
                                });
                                setErrors({});
                            }}
                            sx={{borderRadius: 2}}
                        >
                            Send another request
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
            <Container maxWidth="md">
                <Paper elevation={8} sx={{p: 4, borderRadius: 3}}>
                    {/* Header */}
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <PersonAddIcon sx={{fontSize: 60, color: 'primary.main', mb: 2}}/>
                        <Typography variant="h3" sx={{fontWeight: 700, mb: 2, color: 'text.primary'}}>
                            Designer Registration
                        </Typography>
                        <Typography variant="body1" sx={{color: 'text.secondary', maxWidth: 600, mx: 'auto'}}>
                            Register to become a professional designer and receive design projects from schools
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
                                <StepLabel>{label}</StepLabel>
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
                                    startIcon={loading ? <CircularProgress size={20}/> : <PersonAddIcon/>}
                                    sx={{borderRadius: 2, px: 4}}
                                >
                                    {loading ? 'Sending...' : 'Send request'}
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