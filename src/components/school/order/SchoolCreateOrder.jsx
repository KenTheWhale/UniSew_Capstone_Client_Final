import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card as MuiCard,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    DesignServices as DesignServicesIcon,
    Info as InfoIcon,
    InfoOutlined as InfoOutlinedIcon,
    Palette as PaletteIcon,
    TableChart as TableChartIcon
} from '@mui/icons-material';
import {Card, Col, DatePicker, Row, Space, Typography as AntTypography} from 'antd';
import 'antd/dist/reset.css';
import {getSchoolDesign} from '../../../services/DesignService.jsx';
import {createOrder, getSizes} from '../../../services/OrderService.jsx';
import DisplayImage from '../../ui/DisplayImage.jsx';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import dayjs from 'dayjs';
import {enqueueSnackbar} from "notistack";

const {Text, Title} = AntTypography;

export default function SchoolCreateOrder() {
    const [schoolDesigns, setSchoolDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDesignId, setSelectedDesignId] = useState('');
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState({});
    const [selectedUniformSizes, setSelectedUniformSizes] = useState({});
    const [selectedUniformSizeQuantities, setSelectedUniformSizeQuantities] = useState({});

    const [showItemDialog, setShowItemDialog] = useState(false);
    const [showSizeSpecsDialog, setShowSizeSpecsDialog] = useState(false);
    const [selectedSizeSpecs, setSelectedSizeSpecs] = useState(null);
    const [selectedUniform, setSelectedUniform] = useState(null);
    const [orderNote, setOrderNote] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const fetchSchoolDesigns = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getSchoolDesign();
            if (response && response.status === 200) {
                console.log("School designs: ", response.data.body);
                setSchoolDesigns(response.data.body || []);
            } else {
                setError('Failed to fetch school designs');
            }
        } catch (err) {
            console.error("Error fetching school designs:", err);
            setError('An error occurred while fetching school designs');
        } finally {
            setLoading(false);
        }
    };

    const fetchSizes = async () => {
        try {
            const response = await getSizes();
            if (response && response.status === 200) {
                console.log("Sizes: ", response.data.body);
                setSizes(response.data.body || []);
            }
        } catch (err) {
            console.error("Error fetching sizes:", err);
        }
    };

    useEffect(() => {
        fetchSchoolDesigns();
        fetchSizes();
    }, []);

    const handleDesignSelect = (event) => {
        const designId = event.target.value;
        setSelectedDesignId(designId);
        setDeadline(null);
        setSelectedSizes({});
        setSelectedUniformSizes({});
        setSelectedUniformSizeQuantities({});
        setOrderNote('');
        setValidationErrors({});

        if (designId) {
            const design = schoolDesigns.find(d => d.id === designId);
            if (design) {
                setSelectedDesign(design);
            }
        } else {
            setSelectedDesign(null);
        }
    };

    const handleDeadlineChange = (date) => {
        setDeadline(date);
        if (date && validationErrors.deadline) {
            setValidationErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.deadline;
                return newErrors;
            });
        }
    };

    const handleOrderNoteChange = (event) => {
        setOrderNote(event.target.value);
    };

    const getTotalQuantity = () => {
        return Object.values(selectedUniformSizeQuantities).reduce((sum, quantity) => sum + quantity, 0);
    };

    const canCreateOrder = () => {
        const uniforms = groupItemsByUniform(selectedDesign?.delivery?.deliveryItems || []);
        const uniformKeys = Object.keys(uniforms);

        const allUniformsHaveItems = uniformKeys.every(uniformKey => {
            const uniformQuantities = Object.entries(selectedUniformSizeQuantities)
                .filter(([key]) => key.startsWith(uniformKey))
                .map(([, quantity]) => quantity);
            const uniformTotal = uniformQuantities.reduce((sum, qty) => sum + qty, 0);
            return uniformTotal > 0;
        });

        const totalQuantity = getTotalQuantity();

        return allUniformsHaveItems && totalQuantity >= 50;
    };

    const validateOrder = () => {
        const errors = {};

        if (!deadline) {
            errors.deadline = 'Please select a delivery deadline';
        }

        const totalQuantity = getTotalQuantity();
        if (totalQuantity < 1) {
            errors.quantity = 'Please select at least 1 item to order';
        }

        const uniforms = groupItemsByUniform(selectedDesign?.delivery?.designItems || []);
        const uniformKeys = Object.keys(uniforms);

        uniformKeys.forEach(uniformKey => {
            const uniform = uniforms[uniformKey];
            const uniformQuantities = Object.entries(selectedUniformSizeQuantities)
                .filter(([key]) => key.startsWith(uniformKey))
                .map(([, quantity]) => quantity);

            const uniformTotal = uniformQuantities.reduce((sum, qty) => sum + qty, 0);

            if (uniformTotal < 1) {
                const gender = uniform.gender === 'boy' ? 'Boys' : 'Girls';
                const category = uniform.category === 'regular' ? 'Regular' : 'Physical Education';
                const type = uniform.shirt ? 'Shirt' : (uniform.pants ? 'Pants' : 'Skirt');
                errors[`uniform_${uniformKey}`] = `Please select at least 1 ${gender} ${category} ${type}`;
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const formatOrderDetails = () => {
        const orderDetails = [];
        const uniforms = groupItemsByUniform(selectedDesign.delivery?.deliveryItems || []);

        Object.entries(selectedUniformSizeQuantities).forEach(([key, quantity]) => {
            if (quantity > 0) {
                const parts = key.split('_');
                const sizeLabel = parts[parts.length - 1];
                const uniformKey = parts.slice(0, -1).join('_');

                const uniform = uniforms[uniformKey];

                if (uniform) {
                    const findEnumName = (type, gender) => {
                        const sizeData = sizes.find(s =>
                            s.type === type &&
                            s.gender === gender &&
                            s.size === sizeLabel
                        );
                        return sizeData ? sizeData.enumName : sizeLabel;
                    };

                    const gender = uniform.gender === 'boy' ? 'male' : 'female';

                    if (uniform.shirt) {
                        const shirtSize = findEnumName('shirt', gender);
                        orderDetails.push({
                            deliveryItemId: uniform.shirt.id,
                            size: shirtSize,
                            quantity: quantity
                        });
                    }
                    if (uniform.pants) {
                        const pantsSize = findEnumName('pants', gender);
                        orderDetails.push({
                            deliveryItemId: uniform.pants.id,
                            size: pantsSize,
                            quantity: quantity
                        });
                    }
                    if (uniform.skirt) {
                        const skirtSize = findEnumName('skirt', gender);
                        orderDetails.push({
                            deliveryItemId: uniform.skirt.id,
                            size: skirtSize,
                            quantity: quantity
                        });
                    }
                }
            }
        });

        return orderDetails;
    };

    const handleCreateOrder = async () => {
        if (!validateOrder()) {
            return;
        }

        try {
            setIsCreatingOrder(true);

            const orderData = {
                deliveryId: selectedDesign.delivery.id,
                deadline: deadline.format('YYYY-MM-DD'),
                note: orderNote || '',
                orderDetails: formatOrderDetails()
            };

            const response = await createOrder(orderData);

            if (response && response.status === 201) {
                enqueueSnackbar('Order created successfully!', {variant: 'success'});

                setSelectedDesignId('');
                setSelectedDesign(null);
                setDeadline(null);
                setOrderNote('');
                setSelectedUniformSizeQuantities({});
                setValidationErrors({});

                window.location.href = '/school/order';
            } else {
                enqueueSnackbar('Failed to create order. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error creating order:', error);
            enqueueSnackbar('An error occurred while creating the order. Please try again.', {variant: 'error'});
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleUniformSizeQuantityChange = (uniformKey, size, quantity) => {
        setSelectedUniformSizeQuantities(prev => ({
            ...prev,
            [`${uniformKey}_${size}`]: quantity
        }));

        if (quantity > 0 && validationErrors.quantity) {
            setValidationErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.quantity;
                return newErrors;
            });
        }

        if (quantity > 0) {
            setValidationErrors(prev => {
                const newErrors = {...prev};
                const uniformQuantities = Object.entries(selectedUniformSizeQuantities)
                    .filter(([key]) => key.startsWith(uniformKey))
                    .map(([, qty]) => qty);
                const uniformTotal = uniformQuantities.reduce((sum, qty) => sum + qty, 0) + quantity;

                if (uniformTotal >= 1) {
                    delete newErrors[`uniform_${uniformKey}`];
                }
                return newErrors;
            });
        }
    };

    const handleRemoveSizeFromUniform = (uniformKey, size) => {
        setSelectedUniformSizeQuantities(prev => {
            const newState = {...prev};
            delete newState[`${uniformKey}_${size}`];
            return newState;
        });

        setValidationErrors(prev => {
            const newErrors = {...prev};
            const uniformQuantities = Object.entries(selectedUniformSizeQuantities)
                .filter(([key]) => key.startsWith(uniformKey))
                .map(([, qty]) => qty);
            const uniformTotal = uniformQuantities.reduce((sum, qty) => sum + qty, 0);

            if (uniformTotal < 1) {
                const uniforms = groupItemsByUniform(selectedDesign?.delivery?.designItems || []);
                const uniform = uniforms[uniformKey];
                if (uniform) {
                    const gender = uniform.gender === 'boy' ? 'Boys' : 'Girls';
                    const category = uniform.category === 'regular' ? 'Regular' : 'Physical Education';
                    const type = uniform.shirt ? 'Shirt' : (uniform.pants ? 'Pants' : 'Skirt');
                    newErrors[`uniform_${uniformKey}`] = `Please select at least 1 ${gender} ${category} ${type}`;
                }
            }
            return newErrors;
        });
    };

    const groupItemsByUniform = (designItems) => {
        const uniforms = {};

        designItems.forEach(item => {
            const gender = item.designItem.gender;
            const type = item.designItem.type;
            const category = item.designItem.category;

            if (type === 'shirt') {
                const uniformKey = `${gender}_${category}_shirt`;
                if (!uniforms[uniformKey]) {
                    uniforms[uniformKey] = {
                        gender: gender,
                        category: category,
                        shirt: item,
                        pants: null,
                        skirt: null
                    };
                } else {
                    uniforms[uniformKey].shirt = item;
                }
            } else if (type === 'pants') {
                const uniformKey = `${gender}_${category}_shirt`;
                if (uniforms[uniformKey]) {
                    uniforms[uniformKey].pants = item;
                } else {
                    const pantsKey = `${gender}_${category}_pants_only`;
                    uniforms[pantsKey] = {
                        gender: gender,
                        category: category,
                        shirt: null,
                        pants: item,
                        skirt: null
                    };
                }
            } else if (type === 'skirt') {
                const uniformKey = `${gender}_${category}_shirt`;
                if (uniforms[uniformKey]) {
                    uniforms[uniformKey].skirt = item;
                } else {
                    const skirtKey = `${gender}_${category}_skirt_only`;
                    uniforms[skirtKey] = {
                        gender: gender,
                        category: category,
                        shirt: null,
                        pants: null,
                        skirt: item
                    };
                }
            }
        });

        return uniforms;
    };

    const handleItemClick = (uniform) => {
        setSelectedUniform(uniform);
        setShowItemDialog(true);
    };

    const handleCloseItemDialog = () => {
        setShowItemDialog(false);
        setSelectedUniform(null);
    };

    const handleCloseSizeSpecs = () => {
        setShowSizeSpecsDialog(false);
        setSelectedSizeSpecs(null);
    };

    const handleOpenSizeSpecsForItem = (designItem) => {
        setSelectedSizeSpecs({
            type: designItem.designItem.category,
            gender: designItem.designItem.gender === 'boy' ? 'male' : 'female'
        });
        setShowSizeSpecsDialog(true);
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'regular':
                return 'primary';
            case 'pe':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getAvailableSizes = (itemType, gender) => {
        return sizes.filter(size =>
            size.type === itemType &&
            size.gender === gender
        );
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)'
            }}>
                <Box sx={{textAlign: 'center'}}>
                    <CircularProgress size={60} sx={{color: '#2e7d32', mb: 2}}/>
                    <Typography variant="h6" color="text.secondary">
                        Loading designs...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{py: 4}}>
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{
            height: 'max-content',
            flex: 1,
            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
            py: 4
        }}>
            <Container maxWidth="xl">
                {schoolDesigns.length === 0 ? (
                    <MuiCard sx={{
                        maxWidth: 600,
                        mx: 'auto',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
                        border: '2px solid #2e7d32'
                    }}>
                        <CardContent sx={{py: 4}}>
                            <DesignServicesIcon sx={{fontSize: 60, color: '#2e7d32', mb: 2}}/>
                            <Typography variant="h5" sx={{mb: 2, color: '#2e7d32', fontWeight: 600}}>
                                No Designs Available
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Please complete a design request first before creating an order.
                            </Typography>
                        </CardContent>
                    </MuiCard>
                ) : (
                    <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                        {}
                        <MuiCard sx={{
                            mb: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
                            borderRadius: 3,
                            border: '2px solid #2e7d32'
                        }}>
                            <CardContent sx={{p: 4}}>
                                <Box sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                    color: 'white'
                                }}>
                                    <Typography variant="h5" sx={{fontWeight: 600, color: 'white', mb: 2}}>
                                        Step 1: Select Your Design
                                    </Typography>
                                    <Typography variant="body2" sx={{opacity: 0.9, mb: 3}}>
                                        Choose from your completed designs to create an order
                                    </Typography>

                                    <Typography variant="body1" sx={{color: 'white', mb: 2, fontWeight: 500}}>
                                        Choose a Design:
                                    </Typography>
                                    <FormControl sx={{minWidth: 350}}>
                                        <Select
                                            id="design-select"
                                            value={selectedDesignId}
                                            onChange={handleDesignSelect}
                                            size="large"
                                            displayEmpty
                                            sx={{
                                                color: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                backdropFilter: 'blur(10px)',
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                                    borderWidth: '2px',
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.7)',
                                                        borderWidth: '2px',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: 'rgba(255, 255, 255, 0.9)',
                                                        borderWidth: '2px',
                                                    },
                                                    '& .MuiSelect-icon': {
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        fontSize: '24px',
                                                    },
                                                },
                                                '& .MuiMenuItem-root': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    color: '#333',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(46, 125, 50, 0.2)',
                                                        },
                                                    },
                                                },
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>Select a design</em>
                                            </MenuItem>
                                            {schoolDesigns.map((design) => (
                                                <MenuItem key={design.id} value={design.id}>
                                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                                        {design.delivery?.designRequest?.name || 'Unnamed Design'}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {}
                                {selectedDesignId && selectedDesign && (
                                    <Box sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.15) 100%)',
                                        border: '1px solid #1976d2'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                            {selectedDesign?.delivery?.designRequest?.logoImage && (
                                                <Box sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    border: '2px solid #1976d2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#ffffff',
                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                                                }}>
                                                    <img
                                                        src={selectedDesign.delivery.designRequest.logoImage}
                                                        alt="School Logo"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="h5" sx={{
                                                    fontWeight: 700,
                                                    color: '#1976d2',
                                                    mb: 1
                                                }}>
                                                    {selectedDesign.delivery?.designRequest?.name || 'Unnamed Design'}
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    color: '#374151',
                                                    fontWeight: 500,
                                                    mb: 0.5
                                                }}>
                                                    {selectedDesign.delivery?.designRequest?.school?.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#64748b',
                                                    fontSize: '13px'
                                                }}>
                                                    {selectedDesign.delivery?.designRequest?.school?.address}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                {}
                                {selectedDesignId && (
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%)',
                                        border: '1px solid #2e7d32'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <CalendarIcon sx={{color: '#2e7d32'}}/>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#2e7d32'}}>
                                                Step 2: Set Delivery Deadline
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            <Typography variant="body1" sx={{fontWeight: 500, color: '#374151'}}>
                                                Expected Delivery:
                                            </Typography>
                                            <DatePicker
                                                value={deadline}
                                                onChange={handleDeadlineChange}
                                                placeholder="Select delivery date (minimum 1 month from today)"
                                                format="DD/MM/YYYY"
                                                style={{
                                                    width: 280,
                                                    height: '48px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                disabledDate={(current) => {
                                                    const minDate = dayjs().add(30, 'day').startOf('day');
                                                    return current && current < minDate;
                                                }}
                                                status={validationErrors.deadline ? 'error' : ''}
                                                defaultPickerValue={dayjs().add(30, 'day')}
                                            />
                                            {validationErrors.deadline && (
                                                <Typography variant="body2" sx={{
                                                    color: '#d32f2f',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    mt: 0.5
                                                }}>
                                                    {validationErrors.deadline}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{
                                                color: '#64748b',
                                                fontSize: '13px',
                                                fontStyle: 'italic'
                                            }}>
                                                * Minimum delivery time is 1 month from today
                                                ({dayjs().add(30, 'day').format('DD/MM/YYYY')})
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#f57c00',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                mt: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                border: '1px solid rgba(255, 152, 0, 0.3)'
                                            }}>
                                                ⚠️ We recommend setting a delivery deadline of 2 months or more to
                                                maximize your chances of getting your order accepted.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {}
                                {selectedDesignId && (
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)',
                                        border: '1px solid #ff9800',
                                        mt: 3
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <InfoIcon sx={{color: '#ff9800'}}/>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#f57c00'}}>
                                                Step 3: Additional Notes (Optional)
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            <Typography variant="body1" sx={{fontWeight: 500, color: '#e65100'}}>
                                                Order Notes:
                                            </Typography>
                                            <TextField
                                                multiline
                                                rows={4}
                                                value={orderNote}
                                                onChange={handleOrderNoteChange}
                                                placeholder="Enter any additional notes or special requirements for your order..."
                                                variant="outlined"
                                                sx={{
                                                    width: '100%',
                                                    '& .MuiOutlinedInput-root': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        borderRadius: 2,
                                                        '&:hover fieldset': {
                                                            borderColor: '#ff9800',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#ff9800',
                                                            borderWidth: '2px',
                                                        },
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '14px',
                                                        color: '#424242',
                                                    },
                                                    '& .MuiInputBase-input::placeholder': {
                                                        color: '#9e9e9e',
                                                        opacity: 1,
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" sx={{
                                                color: '#8d6e63',
                                                fontSize: '12px',
                                                fontStyle: 'italic'
                                            }}>
                                                * This field is optional. You can include special delivery instructions,
                                                size modifications, or any other requirements.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </MuiCard>


                        {selectedDesignId && selectedDesign && (
                            <MuiCard sx={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
                                borderRadius: 3,
                                border: '2px solid #2e7d32',
                                mt: 4
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Box sx={{
                                        p: 3,
                                        mb: 4,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        color: 'white'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <TableChartIcon sx={{color: 'white', fontSize: 28}}/>
                                                <Typography variant="h4" sx={{fontWeight: 700, color: 'white'}}>
                                                    Uniform Selection
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                startIcon={<TableChartIcon/>}
                                                onClick={() => handleOpenSizeSpecsForItem(selectedDesign.delivery?.deliveryItems?.[0])}
                                                sx={{
                                                    px: 2.5,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    textTransform: 'none',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    whiteSpace: 'nowrap',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                        color: 'white',
                                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                View Size Specifications
                                            </Button>
                                        </Box>
                                        <Typography variant="body1" sx={{mt: 1, opacity: 0.9}}>
                                            Select quantities using spreadsheet-like interface
                                        </Typography>
                                    </Box>

                                    {(() => {
                                        const uniforms = groupItemsByUniform(selectedDesign.delivery?.deliveryItems || []);
                                        if (Object.keys(uniforms).length === 0) {
                                            return (
                                                <Box sx={{
                                                    p: 4,
                                                    textAlign: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <Typography variant="h6" sx={{mb: 2}}>
                                                        No uniform items found
                                                    </Typography>
                                                    <Typography variant="body2" sx={{mb: 2}}>
                                                        Please check if the selected design has delivery items.
                                                    </Typography>
                                                </Box>
                                            );
                                        }

                                        const allSizes = getAvailableSizes('shirt', 'male');

                                        return (
                                            <Box sx={{
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                {}
                                                <Box sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: `120px 100px repeat(${allSizes.length}, 1fr) 100px`,
                                                    gridTemplateRows: `auto repeat(${Object.keys(uniforms).length}, 60px)`,
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden'
                                                }}>
                                                    {}
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Type
                                                        </Typography>
                                                    </Box>


                                                    <Box sx={{
                                                        p: 2,
                                                        borderRight: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Gender
                                                        </Typography>
                                                    </Box>


                                                    {allSizes.map((size, index) => (
                                                        <Box key={`header-${index}`} sx={{
                                                            p: 2,
                                                            borderRight: index < allSizes.length - 1 ? '1px solid #000000' : 'none',
                                                            borderBottom: '1px solid #000000',
                                                            backgroundColor: '#e3f2fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}>
                                                            <Typography variant="subtitle2" sx={{
                                                                fontWeight: 700,
                                                                color: '#1976d2',
                                                                fontSize: '13px'
                                                            }}>
                                                                {size.size}
                                                            </Typography>
                                                        </Box>
                                                    ))}

                                                    {}
                                                    <Box sx={{
                                                        p: 2,
                                                        borderLeft: '1px solid #000000',
                                                        borderBottom: '1px solid #000000',
                                                        backgroundColor: '#e3f2fd',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative'
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 700,
                                                            color: '#1976d2',
                                                            fontSize: '14px'
                                                        }}>
                                                            Total
                                                        </Typography>
                                                    </Box>

                                                    {}
                                                    {Object.entries(uniforms).map(([uniformKey, uniform], uniformIndex) => {
                                                        const genderForSizes = uniform.gender === 'boy' ? 'male' : 'female';
                                                        const isFirstOfType = uniformIndex === 0 ||
                                                            uniforms[Object.keys(uniforms)[uniformIndex - 1]]?.category !== uniform.category;
                                                        const isLastOfType = uniformIndex === Object.keys(uniforms).length - 1 ||
                                                            uniforms[Object.keys(uniforms)[uniformIndex + 1]]?.category !== uniform.category;

                                                        const sameTypeCount = Object.values(uniforms).filter(u => u.category === uniform.category).length;

                                                        return (
                                                            <React.Fragment key={uniformKey}>
                                                                {}
                                                                {isFirstOfType && (
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        borderRight: '1px solid #000000',
                                                                        borderBottom: '1px solid #000000',
                                                                        backgroundColor: '#f8fafc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        minHeight: `${60 * sameTypeCount}px`,
                                                                        gridRow: `span ${sameTypeCount}`
                                                                    }}>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#374151',
                                                                            fontSize: '13px',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            {uniform.category === 'regular' ? 'Regular' : 'PE'}
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                {}
                                                                <Box sx={{
                                                                    p: 2,
                                                                    borderRight: '1px solid #000000',
                                                                    borderBottom: '1px solid #000000',
                                                                    backgroundColor: '#f8fafc',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 1,
                                                                    minHeight: '60px'
                                                                }}>
                                                                    <Typography variant="body2" sx={{
                                                                        fontWeight: 600,
                                                                        color: '#374151',
                                                                        fontSize: '13px',
                                                                        textAlign: 'center',
                                                                        textTransform: 'capitalize'
                                                                    }}>
                                                                        {uniform.gender}
                                                                    </Typography>
                                                                    <IconButton
                                                                        onClick={() => handleItemClick(uniform)}
                                                                        size="small"
                                                                        sx={{
                                                                            color: '#6b7280',
                                                                            backgroundColor: 'rgba(107, 114, 128, 0.05)',
                                                                            border: '1px solid rgba(107, 114, 128, 0.1)',
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            '&:hover': {
                                                                                color: '#1976d2',
                                                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                                                borderColor: 'rgba(25, 118, 210, 0.2)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <InfoOutlinedIcon sx={{fontSize: '14px'}}/>
                                                                    </IconButton>
                                                                </Box>

                                                                {}
                                                                {allSizes.map((size, index) => {
                                                                    const quantityKey = `${uniformKey}_${size.size}`;
                                                                    const currentQuantity = selectedUniformSizeQuantities[quantityKey] || 0;

                                                                    return (
                                                                        <Box key={`data-${uniformKey}-${index}`} sx={{
                                                                            p: 2,
                                                                            borderRight: index < allSizes.length - 1 ? '1px solid #000000' : 'none',
                                                                            borderBottom: '1px solid #000000',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            minHeight: '60px',
                                                                            position: 'relative',
                                                                            transition: 'all 0.2s ease'
                                                                        }}>
                                                                            <TextField
                                                                                type="number"
                                                                                size="small"
                                                                                value={currentQuantity}
                                                                                onChange={(e) => {
                                                                                    const newQuantity = parseInt(e.target.value) || 0;
                                                                                    if (newQuantity > 0) {
                                                                                        handleUniformSizeQuantityChange(uniformKey, size.size, newQuantity);
                                                                                    } else {
                                                                                        handleRemoveSizeFromUniform(uniformKey, size.size);
                                                                                    }
                                                                                }}
                                                                                placeholder="0"
                                                                                sx={{
                                                                                    width: '80px',
                                                                                    '& .MuiOutlinedInput-root': {
                                                                                        fontSize: '14px',
                                                                                        height: '40px',
                                                                                        borderRadius: 1.5,
                                                                                        fontWeight: 600,
                                                                                        border: '1px solid #e2e8f0'
                                                                                    }
                                                                                }}
                                                                                inputProps={{
                                                                                    min: 0,
                                                                                    style: {
                                                                                        fontSize: '14px',
                                                                                        textAlign: 'center',
                                                                                        fontWeight: 600,
                                                                                        color: '#374151'
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    );
                                                                })}

                                                                {}
                                                                <Box sx={{
                                                                    p: 2,
                                                                    borderLeft: '1px solid #000000',
                                                                    borderBottom: '1px solid #000000',
                                                                    backgroundColor: '#f8fafc',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    minHeight: '60px'
                                                                }}>
                                                                    <Typography variant="h6" sx={{
                                                                        fontWeight: 700,
                                                                        color: '#1976d2',
                                                                        fontSize: '16px'
                                                                    }}>
                                                                        {Object.keys(selectedUniformSizeQuantities)
                                                                            .filter(key => key.startsWith(uniformKey))
                                                                            .reduce((sum, key) => sum + selectedUniformSizeQuantities[key], 0)}
                                                                    </Typography>
                                                                </Box>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        );
                                    })()}

                                    {/* Order Summary */}
                                    <Box sx={{
                                        mt: 4,
                                        p: 3,
                                        borderRadius: 3,
                                        background: getTotalQuantity() >= 50 
                                            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.15) 100%)'
                                            : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 83, 80, 0.15) 100%)',
                                        border: getTotalQuantity() >= 50 
                                            ? '1px solid #4caf50' 
                                            : '1px solid #f44336'
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600,
                                            color: getTotalQuantity() >= 50 ? '#2e7d32' : '#d32f2f',
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            {getTotalQuantity() >= 50 ? '✅' : '⚠️'} Order Summary
                                        </Typography>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                                            <Typography variant="body1" sx={{
                                                color: '#374151',
                                                fontWeight: 500
                                            }}>
                                                Total Uniforms Selected:
                                            </Typography>
                                            <Typography variant="h5" sx={{
                                                color: getTotalQuantity() >= 50 ? '#2e7d32' : '#d32f2f',
                                                fontWeight: 700
                                            }}>
                                                {getTotalQuantity()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                            <Typography variant="body1" sx={{
                                                color: '#374151',
                                                fontWeight: 500
                                            }}>
                                                Minimum Required:
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#64748b',
                                                fontWeight: 600
                                            }}>
                                                50 uniforms
                                            </Typography>
                                        </Box>
                                        
                                        {getTotalQuantity() < 50 && (
                                            <Typography variant="body2" sx={{
                                                color: '#d32f2f',
                                                fontWeight: 500,
                                                fontSize: '14px',
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                border: '1px solid rgba(244, 67, 54, 0.2)'
                                            }}>
                                                You need to select {50 - getTotalQuantity()} more uniforms to meet the minimum order requirement.
                                            </Typography>
                                        )}
                                        
                                        {getTotalQuantity() >= 50 && (
                                            <Typography variant="body2" sx={{
                                                color: '#2e7d32',
                                                fontWeight: 500,
                                                fontSize: '14px',
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                border: '1px solid rgba(76, 175, 80, 0.2)'
                                            }}>
                                                Great! Your order meets the minimum requirement. You can proceed to create the order.
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </MuiCard>
                        )}

                        {}
                        {selectedDesignId && selectedDesign && Object.keys(validationErrors).some(key => key.startsWith('uniform_')) && (
                            <Box sx={{mt: 3}}>
                                <MuiCard sx={{
                                    background: 'rgba(255, 235, 238, 0.9)',
                                    border: '1px solid #f44336',
                                    borderRadius: 2
                                }}>
                                    <CardContent sx={{p: 2}}>
                                        <Typography variant="h6" sx={{
                                            color: '#d32f2f',
                                            fontWeight: 600,
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            Required Fields Missing
                                        </Typography>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            {Object.entries(validationErrors)
                                                .filter(([key]) => key.startsWith('uniform_'))
                                                .map(([key, error]) => (
                                                    <Typography key={key} variant="body2" sx={{
                                                        color: '#d32f2f',
                                                        fontSize: '14px',
                                                        fontWeight: 500
                                                    }}>
                                                        {error}
                                                    </Typography>
                                                ))}
                                        </Box>
                                    </CardContent>
                                </MuiCard>
                            </Box>
                        )}

                        {}
                        {selectedDesignId && selectedDesign && (
                            <Box sx={{mt: 4, textAlign: 'right'}}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleCreateOrder}
                                    disabled={!deadline || !canCreateOrder() || isCreatingOrder}
                                    sx={{
                                        px: 6,
                                        py: 2,
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1b5e20, #388e3c)',
                                            boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                                            transform: 'translateY(-1px)'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#bdbdbd',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    {isCreatingOrder ? (
                                        <>
                                            <CircularProgress size={20} sx={{mr: 1, color: 'white'}}/>
                                            Creating Order...
                                        </>
                                    ) : (
                                        `Create Order (${getTotalQuantity()} uniforms)`
                                    )}
                                </Button>

                            </Box>
                        )}
                    </Box>
                )}
            </Container>

            {}
            <Dialog
                open={showItemDialog}
                onClose={handleCloseItemDialog}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '85vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                    color: 'white'
                }}>
                    <DesignServicesIcon style={{color: 'white', fontSize: '24px'}}/>
                    <span style={{fontWeight: 700, fontSize: '20px'}}>
                        Uniform Details
                    </span>
                </DialogTitle>

                <DialogContent sx={{padding: '24px', overflowY: 'auto', background: '#f8fafc'}}>
                    {selectedUniform && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            {}
                            <Box sx={{
                                p: 4,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.15) 100%)',
                                border: '2px solid #ff9800',
                                boxShadow: '0 8px 32px rgba(255, 152, 0, 0.2)'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.3)',
                                        color: '#8b4513',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <DesignServicesIcon sx={{fontSize: 32}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{
                                            fontWeight: 700,
                                            color: '#e65100',
                                            mb: 1
                                        }}>
                                            {selectedUniform.gender === 'boy' ? 'Boys' : 'Girls'} {selectedUniform.category === 'regular' ? 'Regular' : 'Physical Education'} Uniform
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                                            {selectedUniform.shirt && (
                                                <Chip
                                                    label={`Shirt (${selectedUniform.shirt.designItem.category})`}
                                                    color={getCategoryColor(selectedUniform.shirt.designItem.category)}
                                                    size="medium"
                                                    sx={{
                                                        height: '32px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            )}
                                            {selectedUniform.pants && (
                                                <Chip
                                                    label={`Pants (${selectedUniform.pants.designItem.category})`}
                                                    color={getCategoryColor(selectedUniform.pants.designItem.category)}
                                                    size="medium"
                                                    sx={{
                                                        height: '32px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            )}
                                            {selectedUniform.skirt && (
                                                <Chip
                                                    label={`Skirt (${selectedUniform.skirt.designItem.category})`}
                                                    color={getCategoryColor(selectedUniform.skirt.designItem.category)}
                                                    size="medium"
                                                    sx={{
                                                        height: '32px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {}
                            {selectedUniform.shirt && (
                                <Card
                                    title={
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                                color: '#1976d2'
                                            }}>
                                                <PiShirtFoldedFill style={{fontSize: '20px'}}/>
                                            </Box>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '18px',
                                                color: '#1976d2'
                                            }}>Shirt Details</span>
                                        </Box>
                                    }
                                    style={{
                                        border: 'none',
                                        borderRadius: 16,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{p: 0}}>
                                        {}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                            border: '1px solid #e2e8f0',
                                            mb: 3
                                        }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <InfoIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                Specifications
                                            </Typography>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Color:
                                                    </Typography>
                                                    <Box sx={{
                                                        backgroundColor: selectedUniform.shirt.designItem.color,
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        color: selectedUniform.shirt.designItem.color === '#FFFFFF' ? '#000' : '#fff',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        border: selectedUniform.shirt.designItem.color === '#FFFFFF' ? '1px solid #e2e8f0' : 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {selectedUniform.shirt.designItem.color}
                                                    </Box>
                                                </Box>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Fabric:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        fontWeight: 500
                                                    }}>
                                                        {selectedUniform.shirt.designItem.fabricName}
                                                    </Typography>
                                                </Box>
                                                {selectedUniform.shirt.designItem.logoPosition && (
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px'
                                                        }}>
                                                            Logo Position:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500
                                                        }}>
                                                            {selectedUniform.shirt.designItem.logoPosition}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedUniform.shirt.designItem.note && (
                                                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px',
                                                            mt: 0.5
                                                        }}>
                                                            Note:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {selectedUniform.shirt.designItem.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {}
                                        <Row gutter={[24, 0]}>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Front Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.shirt.frontImageUrl}
                                                            alt="Shirt Front Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Back Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.shirt.backImageUrl}
                                                            alt="Shirt Back Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                        </Row>
                                    </Box>
                                </Card>
                            )}

                            {}
                            {selectedUniform.pants && (
                                <Card
                                    title={
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                                color: '#7b1fa2'
                                            }}>
                                                <PiPantsFill style={{fontSize: '20px'}}/>
                                            </Box>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '18px',
                                                color: '#7b1fa2'
                                            }}>Pants Details</span>
                                        </Box>
                                    }
                                    style={{
                                        border: 'none',
                                        borderRadius: 16,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{p: 0}}>
                                        {}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                            border: '1px solid #e2e8f0',
                                            mb: 3
                                        }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <InfoIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                Specifications
                                            </Typography>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Color:
                                                    </Typography>
                                                    <Box sx={{
                                                        backgroundColor: selectedUniform.pants.designItem.color,
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        color: selectedUniform.pants.designItem.color === '#FFFFFF' ? '#000' : '#fff',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        border: selectedUniform.pants.designItem.color === '#FFFFFF' ? '1px solid #e2e8f0' : 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {selectedUniform.pants.designItem.color}
                                                    </Box>
                                                </Box>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Fabric:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        fontWeight: 500
                                                    }}>
                                                        {selectedUniform.pants.designItem.fabricName}
                                                    </Typography>
                                                </Box>
                                                {selectedUniform.pants.designItem.logoPosition && (
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px'
                                                        }}>
                                                            Logo Position:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500
                                                        }}>
                                                            {selectedUniform.pants.designItem.logoPosition}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedUniform.pants.designItem.note && (
                                                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px',
                                                            mt: 0.5
                                                        }}>
                                                            Note:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {selectedUniform.pants.designItem.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {}
                                        <Row gutter={[24, 0]}>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Front Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.pants.frontImageUrl}
                                                            alt="Pants Front Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Back Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.pants.backImageUrl}
                                                            alt="Pants Back Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                        </Row>
                                    </Box>
                                </Card>
                            )}

                            {}
                            {selectedUniform.skirt && (
                                <Card
                                    title={
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                                                color: '#f57c00'
                                            }}>
                                                <GiSkirt style={{fontSize: '20px'}}/>
                                            </Box>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '18px',
                                                color: '#f57c00'
                                            }}>Skirt Details</span>
                                        </Box>
                                    }
                                    style={{
                                        border: 'none',
                                        borderRadius: 16,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{p: 0}}>
                                        {}
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                            border: '1px solid #e2e8f0',
                                            mb: 3
                                        }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <InfoIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                Specifications
                                            </Typography>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Color:
                                                    </Typography>
                                                    <Box sx={{
                                                        backgroundColor: selectedUniform.skirt.designItem.color,
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        color: selectedUniform.skirt.designItem.color === '#FFFFFF' ? '#000' : '#fff',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        border: selectedUniform.skirt.designItem.color === '#FFFFFF' ? '1px solid #e2e8f0' : 'none',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {selectedUniform.skirt.designItem.color}
                                                    </Box>
                                                </Box>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#64748b',
                                                        fontWeight: 600,
                                                        minWidth: '100px'
                                                    }}>
                                                        Fabric:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        fontWeight: 500
                                                    }}>
                                                        {selectedUniform.skirt.designItem.fabricName}
                                                    </Typography>
                                                </Box>
                                                {selectedUniform.skirt.designItem.logoPosition && (
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px'
                                                        }}>
                                                            Logo Position:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500
                                                        }}>
                                                            {selectedUniform.skirt.designItem.logoPosition}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedUniform.skirt.designItem.note && (
                                                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                            minWidth: '100px',
                                                            mt: 0.5
                                                        }}>
                                                            Note:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontSize: '14px',
                                                            color: '#1e293b',
                                                            fontWeight: 500,
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {selectedUniform.skirt.designItem.note}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {}
                                        <Row gutter={[24, 0]}>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Front Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.skirt.frontImageUrl}
                                                            alt="Skirt Front Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        mb: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <PaletteIcon sx={{fontSize: 20, color: '#64748b'}}/>
                                                        Back Design
                                                    </Typography>
                                                    <Box sx={{
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <DisplayImage
                                                            imageUrl={selectedUniform.skirt.backImageUrl}
                                                            alt="Skirt Back Design"
                                                            width="100%"
                                                            height="250px"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Col>
                                        </Row>
                                    </Box>
                                </Card>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 2, borderTop: '1px solid #e0e0e0'}}>
                    <Button onClick={handleCloseItemDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog
                open={showSizeSpecsDialog}
                onClose={handleCloseSizeSpecs}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '85vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                    color: 'white'
                }}>
                    <TableChartIcon style={{color: 'white', fontSize: '18px'}}/>
                    <span style={{fontWeight: 600, fontSize: '16px'}}>
                        Size Specifications - {selectedSizeSpecs?.gender === 'male' ? 'Boy' : 'Girl'}
                    </span>
                </DialogTitle>

                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {}
                        <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%)',
                            border: '1px solid #2e7d32'
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                color: '#2e7d32',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <TableChartIcon sx={{fontSize: 20}}/>
                                Select Specifications to View
                            </Typography>

                            <Box sx={{display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'flex-end'}}>
                                {}
                                <Box sx={{minWidth: 200}}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 600,
                                        color: '#374151',
                                        mb: 1
                                    }}>
                                        Gender:
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedSizeSpecs?.gender || 'male'}
                                            onChange={(e) => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                gender: e.target.value
                                            }))}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                }
                                            }}
                                        >
                                            <MenuItem value="male">Boy</MenuItem>
                                            <MenuItem value="female">Girl</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {}
                                <Box sx={{minWidth: 200}}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 600,
                                        color: '#374151',
                                        mb: 1
                                    }}>
                                        Uniform Type:
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        minHeight: '40px',
                                        alignItems: 'center'
                                    }}>
                                        <Button
                                            variant={selectedSizeSpecs?.type === 'regular' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                type: 'regular'
                                            }))}
                                            sx={{
                                                minWidth: '120px',
                                                height: '36px',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                backgroundColor: selectedSizeSpecs?.type === 'regular' ? '#2e7d32' : 'transparent',
                                                color: selectedSizeSpecs?.type === 'regular' ? '#ffffff' : '#2e7d32',
                                                borderColor: '#2e7d32',
                                                borderWidth: '2px',
                                                '&:hover': {
                                                    backgroundColor: selectedSizeSpecs?.type === 'regular' ? '#1b5e20' : 'rgba(46, 125, 50, 0.08)',
                                                    borderColor: '#2e7d32',
                                                    borderWidth: '2px'
                                                },
                                                '&:focus': {
                                                    boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.2)'
                                                }
                                            }}
                                        >
                                            Regular
                                        </Button>
                                        <Button
                                            variant={selectedSizeSpecs?.type === 'pe' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setSelectedSizeSpecs(prev => ({
                                                ...prev,
                                                type: 'pe'
                                            }))}
                                            sx={{
                                                minWidth: '140px',
                                                height: '36px',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                backgroundColor: selectedSizeSpecs?.type === 'pe' ? '#2e7d32' : 'transparent',
                                                color: selectedSizeSpecs?.type === 'pe' ? '#ffffff' : '#2e7d32',
                                                borderColor: '#2e7d32',
                                                borderWidth: '2px',
                                                '&:hover': {
                                                    backgroundColor: selectedSizeSpecs?.type === 'pe' ? '#1b5e20' : 'rgba(46, 125, 50, 0.08)',
                                                    borderColor: '#2e7d32',
                                                    borderWidth: '2px'
                                                },
                                                '&:focus': {
                                                    boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.2)'
                                                }
                                            }}
                                        >
                                            Physical Education
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {}
                        {selectedSizeSpecs && (
                            <Card
                                title={
                                    <Space>
                                        <DesignServicesIcon style={{color: '#2e7d32'}}/>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '16px'
                                        }}>{selectedSizeSpecs.gender === 'male' ? 'Boy' : 'Girl'} {selectedSizeSpecs.type === 'regular' ? 'Regular' : 'Physical Education'} Sizes</span>
                                    </Space>
                                }
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <Box sx={{padding: '16px'}}>
                                    <Box sx={{overflowX: 'auto'}}>
                                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                            <thead>
                                            <tr style={{backgroundColor: '#f8fafc'}}>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    color: '#1e293b'
                                                }}>Size
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    color: '#1e293b',
                                                    borderLeft: '1px solid #e2e8f0'
                                                }} colSpan="2">Shirt
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    color: '#1e293b',
                                                    borderLeft: '1px solid #e2e8f0'
                                                }} colSpan="2">Pants
                                                </th>
                                                {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #e2e8f0',
                                                        fontWeight: 600,
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        borderLeft: '1px solid #e2e8f0'
                                                    }} colSpan="2">Skirt</th>
                                                )}
                                            </tr>
                                            <tr style={{backgroundColor: '#f1f5f9'}}>
                                                <th style={{
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}></th>
                                                <th style={{
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    color: '#64748b',
                                                    borderLeft: '1px solid #e2e8f0'
                                                }}>Height (cm)
                                                </th>
                                                <th style={{
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}>Weight (kg)
                                                </th>
                                                <th style={{
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}>Height (cm)
                                                </th>
                                                <th style={{
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    fontWeight: 500,
                                                    fontSize: '12px',
                                                    color: '#64748b'
                                                }}>Weight (kg)
                                                </th>
                                                {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                    <>
                                                        <th style={{
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            borderBottom: '1px solid #e2e8f0',
                                                            fontWeight: 500,
                                                            fontSize: '12px',
                                                            color: '#64748b',
                                                            borderLeft: '1px solid #e2e8f0'
                                                        }}>Height (cm)
                                                        </th>
                                                        <th style={{
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            borderBottom: '1px solid #e2e8f0',
                                                            fontWeight: 500,
                                                            fontSize: '12px',
                                                            color: '#64748b'
                                                        }}>Weight (kg)
                                                        </th>
                                                    </>
                                                )}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(() => {
                                                const shirtSizes = sizes.filter(size =>
                                                    size.gender === selectedSizeSpecs.gender &&
                                                    size.type === 'shirt'
                                                );

                                                console.log('Shirt sizes:', shirtSizes);

                                                if (shirtSizes.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' ? 7 : 5}
                                                                style={{
                                                                    padding: '20px',
                                                                    textAlign: 'center',
                                                                    color: '#666',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                No size data available
                                                                for {selectedSizeSpecs.gender === 'male' ? 'Boy' : 'Girl'} {selectedSizeSpecs.type === 'regular' ? 'Regular' : 'Physical Education'}
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return shirtSizes.map((shirtSize) => {
                                                    const pantsSize = sizes.find(s =>
                                                        s.gender === selectedSizeSpecs.gender &&
                                                        s.type === 'pants' &&
                                                        s.size === shirtSize.size
                                                    );

                                                    const skirtSize = selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' ? sizes.find(s =>
                                                        s.gender === selectedSizeSpecs.gender &&
                                                        s.type === 'skirt' &&
                                                        s.size === shirtSize.size
                                                    ) : null;

                                                    return (
                                                        <tr key={`${shirtSize.type}-${shirtSize.size}-${shirtSize.gender}`}
                                                            style={{
                                                                borderBottom: '1px solid #f1f5f9',
                                                                backgroundColor: '#ffffff'
                                                            }}>
                                                            <td style={{
                                                                padding: '12px',
                                                                fontWeight: 600,
                                                                textAlign: 'center',
                                                                fontSize: '14px',
                                                                color: '#1e293b',
                                                                backgroundColor: '#f8fafc'
                                                            }}>{shirtSize.size}</td>
                                                            <td style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#374151',
                                                                borderLeft: '1px solid #e2e8f0'
                                                            }}>
                                                                {`${shirtSize.minHeight}-${shirtSize.maxHeight}`}
                                                            </td>
                                                            <td style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#374151'
                                                            }}>
                                                                {`${shirtSize.minWeight}-${shirtSize.maxWeight}`}
                                                            </td>
                                                            <td style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#374151',
                                                                borderLeft: '1px solid #e2e8f0'
                                                            }}>
                                                                {pantsSize ? `${pantsSize.minHeight}-${pantsSize.maxHeight}` : '-'}
                                                            </td>
                                                            <td style={{
                                                                padding: '12px',
                                                                textAlign: 'center',
                                                                fontSize: '13px',
                                                                color: '#374151'
                                                            }}>
                                                                {pantsSize ? `${pantsSize.minWeight}-${pantsSize.maxWeight}` : '-'}
                                                            </td>
                                                            {selectedSizeSpecs.gender === 'female' && selectedSizeSpecs.type === 'regular' && (
                                                                <>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'center',
                                                                        fontSize: '13px',
                                                                        color: '#374151',
                                                                        borderLeft: '1px solid #e2e8f0'
                                                                    }}>
                                                                        {skirtSize ? `${skirtSize.minHeight}-${skirtSize.maxHeight}` : '-'}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '12px',
                                                                        textAlign: 'center',
                                                                        fontSize: '13px',
                                                                        color: '#374151'
                                                                    }}>
                                                                        {skirtSize ? `${skirtSize.minWeight}-${skirtSize.maxWeight}` : '-'}
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Box>
                            </Card>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{p: 2, borderTop: '1px solid #e0e0e0'}}>
                    <Button onClick={handleCloseSizeSpecs}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}