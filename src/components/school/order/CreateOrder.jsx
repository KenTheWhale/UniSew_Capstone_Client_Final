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
    CheckCircle as CheckCircleIcon,
    DesignServices as DesignServicesIcon,
    Info as InfoIcon,
    InfoOutlined as InfoOutlinedIcon,
    Palette as PaletteIcon,
    RestartAlt as RestartAltIcon,
    TableChart as TableChartIcon
} from '@mui/icons-material';
import {Card, Col, DatePicker, Row, Space, Typography as AntTypography} from 'antd';
import 'antd/dist/reset.css';
import {getSchoolDesign} from '../../../services/DesignService.jsx';
import {getSizes} from '../../../services/OrderService.jsx';
import DisplayImage from '../../ui/DisplayImage.jsx';
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import dayjs from 'dayjs';

const {Text, Title} = AntTypography;

export default function CreateOrder() {
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

    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [showSizeSpecsDialog, setShowSizeSpecsDialog] = useState(false);
    const [selectedSizeSpecs, setSelectedSizeSpecs] = useState(null);
    const [selectedUniform, setSelectedUniform] = useState(null);

    // Fetch school designs from API
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

    // Fetch sizes from API
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
        setDeadline(null); // Reset deadline when changing design
        setSelectedSizes({}); // Reset selected sizes
        setSelectedUniformSizes({}); // Reset selected uniform sizes
        setSelectedUniformSizeQuantities({}); // Reset selected uniform size quantities

        // Automatically load the selected design details
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
    };


    const handleSizeChange = (designItemId, size) => {
        setSelectedSizes(prev => ({
            ...prev,
            [designItemId]: size
        }));
    };

    const handleUniformSizeChange = (uniformKey, size) => {
        setSelectedUniformSizes(prev => ({
            ...prev,
            [uniformKey]: size
        }));
    };

    const handleUniformSizeQuantityChange = (uniformKey, size, quantity) => {
        setSelectedUniformSizeQuantities(prev => ({
            ...prev,
            [`${uniformKey}_${size}`]: quantity
        }));
    };

    const handleAddSizeToUniform = (uniformKey, size) => {
        setSelectedUniformSizeQuantities(prev => ({
            ...prev,
            [`${uniformKey}_${size}`]: 1
        }));
    };

    const handleRemoveSizeFromUniform = (uniformKey, size) => {
        setSelectedUniformSizeQuantities(prev => {
            const newState = {...prev};
            delete newState[`${uniformKey}_${size}`];
            return newState;
        });
    };

    // Group design items by uniform (shirt + pants/skirt)
    const groupItemsByUniform = (designItems) => {
        const uniforms = {};

        designItems.forEach(item => {
            const gender = item.designItem.gender;
            const type = item.designItem.type;

            if (type === 'shirt') {
                // Create uniform key for shirt
                const uniformKey = `${gender}_shirt`;
                if (!uniforms[uniformKey]) {
                    uniforms[uniformKey] = {
                        gender: gender,
                        shirt: item,
                        pants: null,
                        skirt: null
                    };
                } else {
                    uniforms[uniformKey].shirt = item;
                }
            } else if (type === 'pants') {
                // Find matching shirt for pants
                const uniformKey = `${gender}_shirt`;
                if (uniforms[uniformKey]) {
                    uniforms[uniformKey].pants = item;
                } else {
                    // Pants without shirt
                    const pantsKey = `${gender}_pants_only`;
                    uniforms[pantsKey] = {
                        gender: gender,
                        shirt: null,
                        pants: item,
                        skirt: null
                    };
                }
            } else if (type === 'skirt') {
                // Find matching shirt for skirt
                const uniformKey = `${gender}_shirt`;
                if (uniforms[uniformKey]) {
                    uniforms[uniformKey].skirt = item;
                } else {
                    // Skirt without shirt
                    const skirtKey = `${gender}_skirt_only`;
                    uniforms[skirtKey] = {
                        gender: gender,
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

    const handleOpenSizeSpecs = () => {
        setShowSizeSpecsDialog(true);
    };

    const handleCloseSizeSpecs = () => {
        setShowSizeSpecsDialog(false);
        setSelectedSizeSpecs(null);
    };

    const handleOpenSizeSpecsForItem = (designItem) => {
        setSelectedSizeSpecs({
            type: designItem.designItem.type,
            gender: designItem.designItem.gender === 'boy' ? 'male' : 'female'
        });
        setShowSizeSpecsDialog(true);
    };

    const getItemTypeIcon = (type) => {
        switch (type) {
            case 'shirt':
                return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
            case 'pants':
                return <PiPantsFill style={{fontSize: '20px'}}/>;
            case 'skirt':
                return <GiSkirt style={{fontSize: '20px'}}/>;
            default:
                return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
        }
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

    // Filter sizes by type and gender
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
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <Box sx={{textAlign: 'center'}}>
                    <CircularProgress size={60} sx={{color: '#1976d2', mb: 2}}/>
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: 4
        }}>
            <Container maxWidth="xl">
                {schoolDesigns.length === 0 ? (
                    <MuiCard sx={{
                        maxWidth: 600,
                        mx: 'auto',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <CardContent sx={{py: 4}}>
                            <DesignServicesIcon sx={{fontSize: 60, color: '#ccc', mb: 2}}/>
                            <Typography variant="h5" sx={{mb: 2, color: '#666'}}>
                                No Designs Available
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Please complete a design request first before creating an order.
                            </Typography>
                        </CardContent>
                    </MuiCard>
                ) : (
                    <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                        {/* Selection Section */}
                        <MuiCard sx={{
                            mb: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            borderRadius: 3
                        }}>
                            <CardContent sx={{p: 4}}>
                                <Box sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
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
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <Typography variant="body1" sx={{fontWeight: 500}}>
                                                            {design.delivery?.designRequest?.name || 'Unnamed Design'}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Deadline Section */}
                                {selectedDesignId && (
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                                        border: '1px solid #e1f5fe'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <CalendarIcon sx={{color: '#1976d2'}}/>
                                            <Typography variant="h6" sx={{fontWeight: 600, color: '#1a237e'}}>
                                                Step 2: Set Delivery Deadline
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                            <Typography variant="body1" sx={{fontWeight: 500, minWidth: '120px'}}>
                                                Expected Delivery:
                                            </Typography>
                                            <DatePicker
                                                value={deadline}
                                                onChange={handleDeadlineChange}
                                                placeholder="Select your preferred delivery date"
                                                format="DD/MM/YYYY"
                                                style={{
                                                    width: 280,
                                                    height: '48px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                disabledDate={(current) => {
                                                    return current && current < dayjs().startOf('day');
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </MuiCard>

                        {/* Design Details Section */}
                        {selectedDesignId && selectedDesign && (
                            <MuiCard sx={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                borderRadius: 3
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Box sx={{
                                        p: 3,
                                        mb: 4,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        color: 'white'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <CheckCircleIcon sx={{color: 'white', fontSize: 28}}/>
                                            <Typography variant="h4" sx={{fontWeight: 700, color: 'white'}}>
                                                Design Overview
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{mt: 1, opacity: 0.9}}>
                                            Review your selected design details and specifications
                                        </Typography>
                                    </Box>

                                    {/* Design Summary */}
                                    <Box sx={{
                                        p: 3,
                                        mb: 4,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                        border: '1px solid #ffd89b'
                                    }}>
                                        <Row gutter={[24, 16]} align="middle">
                                            <Col span={12}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        color: '#8b4513'
                                                    }}>
                                                        <DesignServicesIcon/>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 600, color: '#8b4513'}}>
                                                            {selectedDesign.delivery?.designRequest?.name}
                                                        </Typography>
                                                        <Typography variant="body2"
                                                                    sx={{color: '#8b4513', opacity: 0.8}}>
                                                            Design
                                                            Completed: {formatDate(selectedDesign.delivery?.submitDate)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Col>
                                        </Row>
                                    </Box>


                                    {/* Main Content - Logo and Items */}
                                    <Row gutter={[24, 24]}>
                                        {/* Logo Image */}
                                        <Col span={24}>
                                            {selectedDesign.delivery?.designRequest?.logoImage && (
                                                <Card
                                                    title={
                                                        <Space>
                                                            <PaletteIcon style={{color: '#1976d2'}}/>
                                                            <span style={{
                                                                fontWeight: 600,
                                                                fontSize: '16px'
                                                            }}>Logo Image</span>
                                                        </Space>
                                                    }
                                                    style={{
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 12,
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                                        marginBottom: '24px'
                                                    }}
                                                >
                                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                                        <DisplayImage
                                                            imageUrl={selectedDesign.delivery.designRequest.logoImage}
                                                            alt="Logo Design"
                                                            width="180px"
                                                            height="180px"
                                                        />
                                                    </Box>
                                                </Card>
                                            )}
                                        </Col>

                                        {/* Uniforms Section */}
                                        <Col span={24}>
                                            <Card
                                                title={
                                                    <Space>
                                                        <DesignServicesIcon style={{color: '#1976d2'}}/>
                                                        <span style={{
                                                            fontWeight: 600,
                                                            fontSize: '16px'
                                                        }}>Uniform Selection</span>
                                                    </Space>
                                                }
                                                style={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 12,
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                                }}
                                            >
                                                <Box sx={{padding: '12px'}}>
                                                    {(() => {
                                                        const uniforms = groupItemsByUniform(selectedDesign.delivery?.designItems || []);
                                                        return Object.entries(uniforms).map(([uniformKey, uniform]) => {
                                                            const genderLabel = uniform.gender === 'boy' ? 'Boys' : 'Girls';
                                                            const genderForSizes = uniform.gender === 'boy' ? 'male' : 'female';
                                                            const availableSizes = getAvailableSizes('shirt', genderForSizes); // Use shirt sizes for uniform

                                                            return (
                                                                <Box
                                                                    key={uniformKey}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        p: 3,
                                                                        mb: 2,
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#ffffff',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                                                                            transform: 'translateY(-2px)'
                                                                        }
                                                                    }}
                                                                >
                                                                    {/* Left side - Uniform info */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        gap: 3,
                                                                        width: '100%'
                                                                    }}>
                                                                        {/* Uniform Type Header */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            gap: 1
                                                                        }}>
                                                                            <Typography variant="h6" sx={{
                                                                                fontSize: '18px',
                                                                                fontWeight: 700,
                                                                                color: '#1e293b',
                                                                                textTransform: 'capitalize'
                                                                            }}>
                                                                                {genderLabel} Uniform
                                                                            </Typography>

                                                                            <IconButton
                                                                            onClick={() => handleItemClick(uniform)}
                                                                            size="small"
                                                                            sx={{
                                                                                color: '#6b7280',
                                                                                backgroundColor: 'rgba(107, 114, 128, 0.05)',
                                                                                border: '1px solid rgba(107, 114, 128, 0.1)',
                                                                                '&:hover': {
                                                                                    color: '#1976d2',
                                                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                                                    borderColor: 'rgba(25, 118, 210, 0.2)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <InfoOutlinedIcon sx={{fontSize: '18px'}}/>
                                                                        </IconButton>
                                                                        </Box>

                                                                        {/* View Size Specifications Button - Moved to same row */}
                                                                        <Button
                                                                            variant="outlined"
                                                                            startIcon={<TableChartIcon />}
                                                                            onClick={() => handleOpenSizeSpecsForItem(uniform.shirt || uniform.pants || uniform.skirt)}
                                                                            sx={{
                                                                                px: 2.5,
                                                                                py: 1.5,
                                                                                borderRadius: 2,
                                                                                borderColor: '#1976d2',
                                                                                color: '#1976d2',
                                                                                fontWeight: 600,
                                                                                fontSize: '13px',
                                                                                textTransform: 'none',
                                                                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                                                                                whiteSpace: 'nowrap',
                                                                                '&:hover': {
                                                                                    backgroundColor: '#1976d2',
                                                                                    color: '#ffffff',
                                                                                    borderColor: '#1976d2',
                                                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                                                                    transform: 'translateY(-1px)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            View Size Specifications
                                                                        </Button>
                                                                    </Box>

                                                                    {/* Right side - Uniform size selection */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 3,
                                                                        width: '100%'
                                                                    }}>
                                                                        <Typography variant="body1" sx={{
                                                                            fontSize: '14px',
                                                                            fontWeight: 600,
                                                                            color: '#1976d2',
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            Uniform Sizes & Quantities:
                                                                        </Typography>
                                                                        {/* All Sizes Grid */}
                                                                        <Box sx={{ 
                                                                            p: 3, 
                                                                            borderRadius: 3, 
                                                                            backgroundColor: '#f8fafc',
                                                                            border: '1px solid #e2e8f0',
                                                                            width: '100%'
                                                                        }}>
                                                                            {/* Order Summary - Moved to top */}
                                                                            {Object.keys(selectedUniformSizeQuantities)
                                                                                .filter(key => key.startsWith(uniformKey))
                                                                                .length > 0 && (
                                                                                <Box sx={{
                                                                                    mb: 4,
                                                                                    p: 3,
                                                                                    borderRadius: 3,
                                                                                    backgroundColor: '#e8f5e8',
                                                                                    border: '2px solid #4caf50',
                                                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                                                                                }}>
                                                                                    <Typography variant="h6" sx={{
                                                                                        fontSize: '16px',
                                                                                        fontWeight: 700,
                                                                                        color: '#2e7d32',
                                                                                        mb: 2,
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: 1
                                                                                    }}>
                                                                                        <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                                                                                        Order Summary
                                                                                    </Typography>
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        flexWrap: 'wrap',
                                                                                        gap: 2
                                                                                    }}>
                                                                                        {Object.keys(selectedUniformSizeQuantities)
                                                                                            .filter(key => key.startsWith(uniformKey))
                                                                                            .map(key => {
                                                                                                const size = key.split('_')[2];
                                                                                                const quantity = selectedUniformSizeQuantities[key];
                                                                                                return (
                                                                                                    <Chip
                                                                                                        key={key}
                                                                                                        label={`Size ${size}: ${quantity}`}
                                                                                                        size="medium"
                                                                                                        sx={{
                                                                                                            fontSize: '13px',
                                                                                                            height: '32px',
                                                                                                            backgroundColor: '#ffffff',
                                                                                                            border: '2px solid #4caf50',
                                                                                                            color: '#2e7d32',
                                                                                                            fontWeight: 700,
                                                                                                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
                                                                                                        }}
                                                                                                    />
                                                                                                );
                                                                                            })}
                                                                                        <Chip
                                                                                            label={`Total: ${Object.keys(selectedUniformSizeQuantities)
                                                                                                .filter(key => key.startsWith(uniformKey))
                                                                                                .reduce((sum, key) => sum + selectedUniformSizeQuantities[key], 0)}`}
                                                                                            size="medium"
                                                                                            sx={{
                                                                                                fontSize: '13px',
                                                                                                height: '32px',
                                                                                                backgroundColor: '#4caf50',
                                                                                                color: '#ffffff',
                                                                                                fontWeight: 800,
                                                                                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
                                                                                            }}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            )}

                                                                            <Typography variant="body2" sx={{ 
                                                                                fontSize: '18px', 
                                                                                fontWeight: 600, 
                                                                                color: '#64748b',
                                                                                mb: 3,
                                                                                px: 1
                                                                            }}>
                                                                                Select quantities for each size:
                                                                            </Typography>
                                                                            
                                                                            <Box sx={{ 
                                                                                display: 'flex', 
                                                                                flexWrap: 'wrap',
                                                                                gap: 2,
                                                                                width: '100%'
                                                                            }}>
                                                                                {availableSizes.map((size, index) => {
                                                                                    const quantityKey = `${uniformKey}_${size.size}`;
                                                                                    const currentQuantity = selectedUniformSizeQuantities[quantityKey] || 0;
                                                                                    
                                                                                    return (
                                                                                        <Box key={index} sx={{ 
                                                                                            display: 'flex', 
                                                                                            flexDirection: 'column',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'space-between',
                                                                                            width: '49%',
                                                                                            p: 2.5,
                                                                                            borderRadius: 3,
                                                                                            backgroundColor: currentQuantity > 0 ? '#e0f2fe' : '#ffffff',
                                                                                            border: currentQuantity > 0 ? '2px solid #0288d1' : '1px solid #e2e8f0',
                                                                                            transition: 'all 0.3s ease',
                                                                                            boxShadow: currentQuantity > 0 ? '0 4px 12px rgba(2, 136, 209, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                                                            position: 'relative',
                                                                                            overflow: 'hidden',
                                                                                            '&:hover': {
                                                                                                borderColor: '#0288d1',
                                                                                                backgroundColor: currentQuantity > 0 ? '#e0f2fe' : '#f0f9ff',
                                                                                                transform: 'translateY(-2px)',
                                                                                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                                                                                            },
                                                                                            '&::before': currentQuantity > 0 ? {
                                                                                                content: '""',
                                                                                                position: 'absolute',
                                                                                                top: 0,
                                                                                                left: 0,
                                                                                                right: 0,
                                                                                                height: '3px',
                                                                                                backgroundColor: '#0288d1'
                                                                                            } : {}
                                                                                        }}>
                                                                                            {/* Size Label with Reset Button */}
                                                                                            <Box sx={{ 
                                                                                                display: 'flex', 
                                                                                                alignItems: 'center', 
                                                                                                justifyContent: 'space-between',
                                                                                                width: '100%',
                                                                                                mb: 2
                                                                                            }}>
                                                                                                <Typography variant="h6" sx={{ 
                                                                                                    fontSize: '18px', 
                                                                                                    fontWeight: 800, 
                                                                                                    color: currentQuantity > 0 ? '#0288d1' : '#374151',
                                                                                                    textAlign: 'left',
                                                                                                    letterSpacing: '0.5px',
                                                                                                    flex: 1
                                                                                                }}>
                                                                                                    Size {size.size}
                                                                                                </Typography>
                                                                                                
                                                                                                {/* Reset Button */}
                                                                                                {currentQuantity > 0 && (
                                                                                                    <IconButton
                                                                                                        onClick={() => handleRemoveSizeFromUniform(uniformKey, size.size)}
                                                                                                        size="small"
                                                                                                        sx={{
                                                                                                            p: 0.5,
                                                                                                            color: '#dc3545',
                                                                                                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                                                                            border: '1px solid rgba(220, 53, 69, 0.2)',
                                                                                                            borderRadius: 1,
                                                                                                            '&:hover': {
                                                                                                                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                                                                                                                borderColor: 'rgba(220, 53, 69, 0.4)',
                                                                                                                transform: 'scale(1.1)'
                                                                                                            }
                                                                                                        }}
                                                                                                        title="Reset quantity"
                                                                                                    >
                                                                                                        <RestartAltIcon sx={{ fontSize: 16 }} />
                                                                                                    </IconButton>
                                                                                                )}
                                                                                            </Box>
                                                                                            
                                                                                            {/* Quantity Input Section */}
                                                                                            <Box sx={{ 
                                                                                                display: 'flex', 
                                                                                                flexDirection: 'column',
                                                                                                alignItems: 'center',
                                                                                                width: '100%',
                                                                                                gap: 1.5
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
                                                                                                        width: '100%',
                                                                                                        '& .MuiOutlinedInput-root': {
                                                                                                            fontSize: '16px',
                                                                                                            height: '48px',
                                                                                                            backgroundColor: '#ffffff',
                                                                                                            borderRadius: 2.5,
                                                                                                            fontWeight: 700,
                                                                                                            border: '2px solid',
                                                                                                            borderColor: currentQuantity > 0 ? '#0288d1' : '#e2e8f0',
                                                                                                            '&:hover': {
                                                                                                                backgroundColor: '#f8fafc',
                                                                                                                borderColor: '#0288d1'
                                                                                                            },
                                                                                                            '&.Mui-focused': {
                                                                                                                backgroundColor: '#ffffff',
                                                                                                                borderColor: '#0288d1',
                                                                                                                boxShadow: '0 0 0 3px rgba(2, 136, 209, 0.1)'
                                                                                                            }
                                                                                                        }
                                                                                                    }}
                                                                                                    inputProps={{ 
                                                                                                        min: 0, 
                                                                                                        style: { 
                                                                                                            fontSize: '16px',
                                                                                                            textAlign: 'center',
                                                                                                            fontWeight: 700,
                                                                                                            color: currentQuantity > 0 ? '#0288d1' : '#374151'
                                                                                                        } 
                                                                                                    }}
                                                                                                />
                                                                                                
                                                                                                {/* Quantity Indicator */}
                                                                                                {currentQuantity > 0 && (
                                                                                                    <Box sx={{ 
                                                                                                        display: 'flex',
                                                                                                        alignItems: 'center',
                                                                                                        justifyContent: 'center',
                                                                                                        width: '100%',
                                                                                                        p: 1,
                                                                                                        borderRadius: 2,
                                                                                                        backgroundColor: 'rgba(2, 136, 209, 0.1)',
                                                                                                        border: '1px solid rgba(2, 136, 209, 0.2)',
                                                                                                        position: 'relative'
                                                                                                    }}>
                                                                                                        <Typography variant="body2" sx={{ 
                                                                                                            fontSize: '12px', 
                                                                                                            color: '#0288d1',
                                                                                                            fontWeight: 700,
                                                                                                            textAlign: 'center',
                                                                                                            textTransform: 'uppercase',
                                                                                                            letterSpacing: '0.5px'
                                                                                                        }}>
                                                                                                            {currentQuantity} {currentQuantity === 1 ? 'item' : 'items'}
                                                                                                        </Typography>
                                                                                                        <Box sx={{
                                                                                                            position: 'absolute',
                                                                                                            right: 8,
                                                                                                            top: '50%',
                                                                                                            transform: 'translateY(-50%)',
                                                                                                            width: 8,
                                                                                                            height: 8,
                                                                                                            borderRadius: '50%',
                                                                                                            backgroundColor: '#4caf50',
                                                                                                            border: '2px solid #ffffff'
                                                                                                        }} />
                                                                                                    </Box>
                                                                                                )}
                                                                                            </Box>
                                                                                        </Box>
                                                                                    );
                                                                                })}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        });
                                                    })()}
                                                </Box>
                                            </Card>
                                        </Col>
                                    </Row>
                                </CardContent>
                            </MuiCard>
                        )}
                    </Box>
                )}
            </Container>

            {/* Item Detail Dialog */}
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                            {/* Uniform Header */}
                            <Box sx={{
                                p: 4,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                border: '2px solid #ffd89b',
                                boxShadow: '0 8px 32px rgba(255, 214, 155, 0.3)'
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
                                            color: '#8b4513',
                                            mb: 1
                                        }}>
                                            {selectedUniform.gender === 'boy' ? 'Boys' : 'Girls'} Uniform
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

                            {/* Shirt Details */}
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
                                        {/* Specifications Section - Full Width */}
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

                                        {/* Design Images Section - Row with flex 1 */}
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

                            {/* Pants Details */}
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
                                        {/* Specifications Section - Full Width */}
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

                                        {/* Design Images Section - Row with flex 1 */}
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

                            {/* Skirt Details */}
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
                                        {/* Specifications Section - Full Width */}
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

                                        {/* Design Images Section - Row with flex 1 */}
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

            {/* Size Specifications Dialog */}
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <TableChartIcon style={{color: 'white', fontSize: '18px'}}/>
                    <span style={{fontWeight: 600, fontSize: '16px'}}>
                        Size Specifications - {selectedSizeSpecs?.gender === 'male' ? 'Boys' : 'Girls'} {selectedSizeSpecs?.type?.charAt(0).toUpperCase() + selectedSizeSpecs?.type?.slice(1)}
                    </span>
                </DialogTitle>

                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    {selectedSizeSpecs && (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <Card
                                title={
                                    <Space>
                                        <DesignServicesIcon style={{color: '#1976d2'}}/>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '16px'
                                        }}>{selectedSizeSpecs.gender === 'male' ? 'Boys' : 'Girls'} {selectedSizeSpecs.type.charAt(0).toUpperCase() + selectedSizeSpecs.type.slice(1)} Sizes</span>
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
                                                {selectedSizeSpecs.gender === 'female' && (
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
                                                {selectedSizeSpecs.gender === 'female' && (
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
                                            {sizes.filter(size =>
                                                size.gender === selectedSizeSpecs.gender &&
                                                size.type === selectedSizeSpecs.type
                                            ).map((size) => {
                                                // Find corresponding sizes for other types
                                                const shirtSize = sizes.find(s =>
                                                    s.gender === selectedSizeSpecs.gender &&
                                                    s.type === 'shirt' &&
                                                    s.size === size.size
                                                );
                                                const pantsSize = sizes.find(s =>
                                                    s.gender === selectedSizeSpecs.gender &&
                                                    s.type === 'pants' &&
                                                    s.size === size.size
                                                );
                                                const skirtSize = selectedSizeSpecs.gender === 'female' ? sizes.find(s =>
                                                    s.gender === selectedSizeSpecs.gender &&
                                                    s.type === 'skirt' &&
                                                    s.size === size.size
                                                ) : null;

                                                return (
                                                    <tr key={`${size.type}-${size.size}-${size.gender}`} style={{
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
                                                        }}>{size.size}</td>
                                                        <td style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            fontSize: '13px',
                                                            color: '#374151',
                                                            borderLeft: '1px solid #e2e8f0'
                                                        }}>
                                                            {shirtSize ? `${shirtSize.minHeight}-${shirtSize.maxHeight}` : '-'}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            fontSize: '13px',
                                                            color: '#374151'
                                                        }}>
                                                            {shirtSize ? `${shirtSize.minWeight}-${shirtSize.maxWeight}` : '-'}
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
                                                        {selectedSizeSpecs.gender === 'female' && (
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
                                            })}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Box>
                            </Card>
                        </Box>
                    )}
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