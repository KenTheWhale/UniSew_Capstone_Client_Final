import React, { useState, useEffect } from 'react';
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
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Popover,
    CircularProgress
} from '@mui/material';
import {
    Save,
    Settings,
    Notifications,
    Business,
    Info,
    Add,
    Edit,
    Delete,
    Upload,
    Palette,
    Refresh
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { getAllConfig, updateConfig } from '../../services/SystemService';
import { uploadCloudinary } from '../../services/UploadImageService';

export default function PlatformSetting() {
    const [settings, setSettings] = useState({
        // Business Settings
        currency: 'VND',
        taxRate: 5,
        serviceFeeRate: 5,
        minTransactionAmount: 10000,
        maxTransactionAmount: 200000000,
        
        // Media Settings
        maxImageSize: 10,
        maxVideoSize: 50,
        maxReferenceImages: 4,
        maxReportImages: 4,
        maxReportVideos: 1,
        maxFeedbackImages: 4,
        maxFeedbackVideos: 1,
        maxDesignerThumbnails: 8,
        maxGarmentThumbnails: 4,
        
        // Order Settings
        minUniformQuantity: 50,
        maxAssignedMilestones: 5,
        
        // Report Settings
        maxAppealDays: 7,
        maxDisbursementDays: 7,
        
        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
    });

    const [reportSeverityLevels, setReportSeverityLevels] = useState([]);
    const [acceptedImageFormats, setAcceptedImageFormats] = useState([]);
    const [acceptedVideoFormats, setAcceptedVideoFormats] = useState([]);
    const [logoPositions, setLogoPositions] = useState([]);
    const [illustrationImage, setIllustrationImage] = useState(null);
    const [illustrationFile, setIllustrationFile] = useState(null); // Store the actual file for upload
    const [uploadingImage, setUploadingImage] = useState(false);
    const [fabrics, setFabrics] = useState([]);

    const [loading, setLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);
    const [fabricDialogOpen, setFabricDialogOpen] = useState(false);
    const [editingFabric, setEditingFabric] = useState(null);
    const [designTabValue, setDesignTabValue] = useState(0);
    const [mainTabValue, setMainTabValue] = useState(0);
    const [severityDialogOpen, setSeverityDialogOpen] = useState(false);
    const [editingSeverity, setEditingSeverity] = useState(null);
    const [reportTabValue, setReportTabValue] = useState(0);
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);
    const [editingFormat, setEditingFormat] = useState(null);
    const [formatType, setFormatType] = useState('image');
    const [mediaTabValue, setMediaTabValue] = useState(0);
    
    // Pagination states
    const [fabricPage, setFabricPage] = useState(1);
    const [fabricPageSize] = useState(5); // Show 5 fabrics per page
    
    // Search and filter states for fabrics
    const [fabricSearchTerm, setFabricSearchTerm] = useState('');
    const [fabricTypeFilter, setFabricTypeFilter] = useState('all');
    const [fabricCategoryFilter, setFabricCategoryFilter] = useState('all');

    // Constants for options
    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
    ];

    const clothingTypeOptions = [
        { value: 'shirt', label: 'Shirt' },
        { value: 'pants', label: 'Pants' },
        { value: 'skirts', label: 'Skirts' }
    ];

    const categoryOptions = [
        { value: 'regular', label: 'Regular' },
        { value: 'physical_education', label: 'Physical Education' }
    ];

    // API call to get all config
    const fetchAllConfig = async () => {
        setApiLoading(true);
        try {
            const response = await getAllConfig();
            const data = response?.data || response;
            
            if (data?.body) {
                // Update settings from API
                setSettings(prev => ({
                    ...prev,
                    // Business Settings
                    taxRate: Math.round(data.body.business.taxRate * 100),
                    serviceFeeRate: Math.round(data.body.business.serviceRate * 100),
                    minTransactionAmount: data.body.business.minPay,
                    maxTransactionAmount: data.body.business.maxPay,
                    
                    // Media Settings
                    maxImageSize: data.body.media.maxImgSize,
                    maxVideoSize: data.body.media.maxVideoSize,
                    maxReferenceImages: data.body.media.maxDesignRefImg,
                    maxReportImages: data.body.media.maxReportImg,
                    maxReportVideos: data.body.media.maxReportVideo,
                    maxFeedbackImages: data.body.media.maxFeedbackImg,
                    maxFeedbackVideos: data.body.media.maxFeedbackVideo,
                    maxDesignerThumbnails: data.body.media.maxDesignerThumbnail,
                    maxGarmentThumbnails: data.body.media.maxGarmentThumbnail,
                    
                    // Order Settings
                    minUniformQuantity: data.body.order.minUniformQty,
                    maxAssignedMilestones: data.body.order.maxAssignedMilestone,
                    
                    // Report Settings
                    maxAppealDays: data.body.report.maxAppealDay,
                    maxDisbursementDays: data.body.report.maxDisbursementDay
                }));

                // Update logo positions
                if (data.body.design.positions) {
                    setLogoPositions(data.body.design.positions.map((pos, index) => ({
                        id: index + 1,
                        name: pos.p,
                        description: `Logo positioned at ${pos.p.toLowerCase()}`,
                        isActive: true
                    })));
                }

                // Update illustration image
                if (data.body.design.illustrationImage) {
                    setIllustrationImage(data.body.design.illustrationImage);
                }

                // Update report severity levels
                if (data.body.report.severityLevels) {
                    setReportSeverityLevels(data.body.report.severityLevels.map((level, index) => ({
                        id: index + 1,
                        name: level.name,
                        description: `${level.name} level issue`,
                        compensationPercentage: Math.round(parseFloat(level.compensation) * 100),
                        color: getSeverityColor(level.name),
                        isActive: true
                    })));
                }

                // Update accepted image formats
                if (data.body.media.imgFormat) {
                    setAcceptedImageFormats(data.body.media.imgFormat.map((format, index) => ({
                        id: index + 1,
                        format: format.format.replace('.', ''),
                        description: `${format.format.toUpperCase()} Image`,
                        isActive: true
                    })));
                }

                // Update accepted video formats
                if (data.body.media.videoFormat) {
                    setAcceptedVideoFormats(data.body.media.videoFormat.map((format, index) => ({
                        id: index + 1,
                        format: format.format.replace('.', ''),
                        description: `${format.format.toUpperCase()} Video`,
                        isActive: true
                    })));
                }

                // Convert fabric structure from API format to UI format
                if (data.body.fabrics) {
                    const convertedFabrics = [];
                    let fabricId = 1;

                    // Process regular fabrics
                    if (data.body.fabrics.regular) {
                        Object.entries(data.body.fabrics.regular).forEach(([clothingType, fabricList]) => {
                            fabricList.forEach(fabric => {
                                                                    convertedFabrics.push({
                                        id: fabricId++,
                                        name: fabric.name,
                                        description: fabric.description,
                                        gender: ['male', 'female'],
                                        clothingType: [clothingType],
                                        category: ['regular'],
                                        isActive: true
                                    });
                            });
                        });
                    }

                    // Process physical education fabrics
                    if (data.body.fabrics.physical) {
                        Object.entries(data.body.fabrics.physical).forEach(([clothingType, fabricList]) => {
                            fabricList.forEach(fabric => {
                                                                    convertedFabrics.push({
                                        id: fabricId++,
                                        name: fabric.name,
                                        description: fabric.description,
                                        gender: ['male', 'female'],
                                        clothingType: [clothingType],
                                        category: ['physical_education'],
                                        isActive: true
                                    });
                            });
                        });
                    }

                    setFabrics(convertedFabrics);
                }
            }
        } catch (error) {
            console.error('Error fetching config:', error);
            enqueueSnackbar('Failed to load configuration. Please try again.', { 
                variant: 'error',
                autoHideDuration: 3000
            });
        } finally {
            setApiLoading(false);
            setLoading(false);
        }
    };

    // Helper function to get color for severity levels
    const getSeverityColor = (severityName) => {
        const colorMap = {
            'Minor': '#28a745',
            'Moderate': '#ffc107',
            'Major': '#fd7e14',
            'Critical': '#dc3545'
        };
        return colorMap[severityName] || '#6c757d';
    };

    // Load config on component mount
    useEffect(() => {
        fetchAllConfig();
    }, []);

    // Refresh config function
    const handleRefreshConfig = () => {
        fetchAllConfig();
        setHasChanges(false);
    };

    // Filter and sort fabrics
    const getFilteredAndSortedFabrics = () => {
        let filtered = [...fabrics];
        
        // Search by name
        if (fabricSearchTerm) {
            filtered = filtered.filter(fabric => 
                fabric.name.toLowerCase().includes(fabricSearchTerm.toLowerCase())
            );
        }
        
        // Filter by type
        if (fabricTypeFilter !== 'all') {
            filtered = filtered.filter(fabric => {
                // Handle special case for shirt/skirt filtering
                if (fabricTypeFilter === 'shirt') {
                    return fabric.clothingType.some(type => 
                        type === 'shirt' || type === 'shirts'
                    );
                }
                if (fabricTypeFilter === 'skirt') {
                    return fabric.clothingType.some(type => 
                        type === 'skirt' || type === 'skirts'
                    );
                }
                // Default filtering for other types
                return fabric.clothingType.includes(fabricTypeFilter);
            });
        }
        
        // Filter by category
        if (fabricCategoryFilter !== 'all') {
            filtered = filtered.filter(fabric => 
                fabric.category.includes(fabricCategoryFilter)
            );
        }
        
        // Sort by ID
        filtered.sort((a, b) => a.id - b.id);
        
        return filtered;
    };

    // Reset filters
    const handleResetFilters = () => {
        setFabricSearchTerm('');
        setFabricTypeFilter('all');
        setFabricCategoryFilter('all');
        setFabricPage(1);
    };

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

    const handleLogoPositionChange = (id, field, value) => {
        setLogoPositions(prev => prev.map(pos => 
            pos.id === id ? { ...pos, [field]: value } : pos
        ));
        setHasChanges(true);
    };

    const handleIllustrationUpload = (file) => {
        if (file) {
            // Store the file for later upload
            setIllustrationFile(file);
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setIllustrationImage(e.target.result);
                setHasChanges(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload illustration image to Cloudinary using UploadImageService
    const uploadIllustrationToCloudinary = async (file) => {
        if (!file) return null;
        
        setUploadingImage(true);
        try {
            const cloudinaryUrl = await uploadCloudinary(file);
            
            if (cloudinaryUrl) {
                return cloudinaryUrl;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            enqueueSnackbar('Failed to upload image to Cloudinary. Please try again.', { 
                variant: 'error',
                autoHideDuration: 3000
            });
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEditPosition = (position) => {
        setEditingPosition(position);
        setEditDialogOpen(true);
    };

    const handleSavePosition = () => {
        if (editingPosition) {
            setLogoPositions(prev => prev.map(pos => 
                pos.id === editingPosition.id ? editingPosition : pos
            ));
            setHasChanges(true);
        }
        setEditDialogOpen(false);
        setEditingPosition(null);
    };

    const handleDeletePosition = (id) => {
        setLogoPositions(prev => prev.filter(pos => pos.id !== id));
        setHasChanges(true);
    };

    const handleFabricChange = (id, field, value) => {
        setFabrics(prev => prev.map(fabric => 
            fabric.id === id ? { ...fabric, [field]: value } : fabric
        ));
        setHasChanges(true);
    };

    const handleEditFabric = (fabric) => {
        setEditingFabric(fabric);
        setFabricDialogOpen(true);
    };

    const handleSaveFabric = () => {
        if (editingFabric) {
            if (editingFabric.id > Math.max(...fabrics.map(f => f.id))) {
                // This is a new fabric, add it to the list
                setFabrics(prev => [...prev, editingFabric]);
                // Reset to first page to show the new fabric
                setFabricPage(1);
            } else {
                // This is an existing fabric, update it
                setFabrics(prev => prev.map(fabric => 
                    fabric.id === editingFabric.id ? editingFabric : fabric
                ));
            }
            setHasChanges(true);
        }
        setFabricDialogOpen(false);
        setEditingFabric(null);
    };

    const handleAddFabric = () => {
        const newFabric = {
            id: Math.max(...fabrics.map(f => f.id)) + 1,
            name: '',
            description: '',
            gender: [],
            clothingType: [],
                                                    category: [],
            isActive: true
        };
        setEditingFabric(newFabric);
        setFabricDialogOpen(true);
        // Reset to first page when adding new fabric
        setFabricPage(1);
    };

    const handleDeleteFabric = (id) => {
        setFabrics(prev => prev.filter(fabric => fabric.id !== id));
        setHasChanges(true);
    };

    const handleDesignTabChange = (event, newValue) => {
        setDesignTabValue(newValue);
    };

    const handleMainTabChange = (event, newValue) => {
        setMainTabValue(newValue);
    };

    const handleReportTabChange = (event, newValue) => {
        setReportTabValue(newValue);
    };

    const handleMediaTabChange = (event, newValue) => {
        setMediaTabValue(newValue);
    };

    const handleSeverityChange = (id, field, value) => {
        setReportSeverityLevels(prev => prev.map(level => 
            level.id === id ? { ...level, [field]: value } : level
        ));
        setHasChanges(true);
    };

    const handleEditSeverity = (severity) => {
        setEditingSeverity(severity);
        setSeverityDialogOpen(true);
    };

    const handleSaveSeverity = () => {
        if (editingSeverity) {
            setReportSeverityLevels(prev => prev.map(level => 
                level.id === editingSeverity.id ? editingSeverity : level
            ));
            setHasChanges(true);
        }
        setSeverityDialogOpen(false);
        setEditingSeverity(null);
    };

    const handleAddSeverity = () => {
        const newSeverity = {
            id: Math.max(...reportSeverityLevels.map(s => s.id)) + 1,
            name: '',
            description: '',
            compensationPercentage: 0,
            color: '#6c757d',
            isActive: true
        };
        setEditingSeverity(newSeverity);
        setSeverityDialogOpen(true);
    };

    const handleDeleteSeverity = (id) => {
        setReportSeverityLevels(prev => prev.filter(level => level.id !== id));
        setHasChanges(true);
    };

    const handleColorPickerOpen = (event) => {
        setColorPickerAnchor(event.currentTarget);
        setColorPickerOpen(true);
    };

    const handleColorPickerClose = () => {
        setColorPickerOpen(false);
        setColorPickerAnchor(null);
    };

    const handleColorChange = (color) => {
        if (editingSeverity) {
            setEditingSeverity({...editingSeverity, color: color});
        }
        handleColorPickerClose();
    };

    const handleFormatChange = (id, field, value, type) => {
        if (type === 'image') {
            setAcceptedImageFormats(prev => prev.map(format => 
                format.id === id ? { ...format, [field]: value } : format
            ));
        } else {
            setAcceptedVideoFormats(prev => prev.map(format => 
                format.id === id ? { ...format, [field]: value } : format
            ));
        }
        setHasChanges(true);
    };

    const handleEditFormat = (format, type) => {
        setEditingFormat(format);
        setFormatType(type);
        setFormatDialogOpen(true);
    };

    const handleSaveFormat = () => {
        if (editingFormat) {
            if (formatType === 'image') {
                setAcceptedImageFormats(prev => prev.map(format => 
                    format.id === editingFormat.id ? editingFormat : format
                ));
            } else {
                setAcceptedVideoFormats(prev => prev.map(format => 
                    format.id === editingFormat.id ? editingFormat : format
                ));
            }
            setHasChanges(true);
        }
        setFormatDialogOpen(false);
        setEditingFormat(null);
        setFormatType('image');
    };

    const handleAddFormat = (type) => {
        const newFormat = {
            id: Math.max(...(type === 'image' ? acceptedImageFormats.map(f => f.id) : acceptedVideoFormats.map(f => f.id))) + 1,
            format: '',
            description: '',
            isActive: true
        };
        setEditingFormat(newFormat);
        setFormatType(type);
        setFormatDialogOpen(true);
    };

    const handleDeleteFormat = (id, type) => {
        if (type === 'image') {
            setAcceptedImageFormats(prev => prev.filter(format => format.id !== id));
        } else {
            setAcceptedVideoFormats(prev => prev.filter(format => format.id !== id));
        }
        setHasChanges(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Prepare data according to the required format
            const updateData = {
                fabricDataList: fabrics.map(fabric => ({
                    name: fabric.name,
                    description: fabric.description,
                    type: fabric.clothingType.map(type => {
                        if (type === 'skirts') return 'skirt';
                        if (type === 'shirts') return 'shirt';
                        return type;
                    }).join(', '),
                    category: fabric.category.map(cat => cat === 'physical_education' ? 'physical' : cat).join(', ')
                })),
                businessData: {
                    taxRate: settings.taxRate / 100, // Convert back to decimal
                    serviceRate: settings.serviceFeeRate / 100,
                    minPay: settings.minTransactionAmount,
                    maxPay: settings.maxTransactionAmount
                },
                mediaData: {
                    maxImgSize: settings.maxImageSize,
                    maxVideoSize: settings.maxVideoSize,
                    maxDesignRefImg: settings.maxReferenceImages,
                    maxFeedbackImg: settings.maxFeedbackImages,
                    maxFeedbackVideo: settings.maxFeedbackVideos,
                    maxReportImg: settings.maxReportImages,
                    maxReportVideo: settings.maxReportVideos,
                    maxGarmentThumbnail: settings.maxGarmentThumbnails,
                    imageFormats: acceptedImageFormats.map(format => ({
                        format: format.format
                    })),
                    videoFormats: acceptedVideoFormats.map(format => ({
                        format: format.format
                    }))
                },
                designData: {
                    illustrationImage: '', // Will be updated after Cloudinary upload
                    positions: logoPositions.map(position => ({
                        position: position.name
                    }))
                },
                orderData: {
                    minUniformQty: settings.minUniformQuantity,
                    maxAssignedMilestone: settings.maxAssignedMilestones
                },
                reportData: {
                    maxAppealDay: settings.maxAppealDays,
                    maxDisbursementDay: settings.maxDisbursementDays,
                    levels: reportSeverityLevels.map(level => ({
                        name: level.name,
                        compensation: (level.compensationPercentage / 100).toString() // Convert to decimal string
                    }))
                }
            };

            // Upload illustration image to Cloudinary if there's a new file
            let finalIllustrationUrl = illustrationImage;
            if (illustrationFile) {
                console.log('Uploading illustration image to Cloudinary...');
                const cloudinaryUrl = await uploadIllustrationToCloudinary(illustrationFile);
                if (cloudinaryUrl) {
                    finalIllustrationUrl = cloudinaryUrl;
                    updateData.designData.illustrationImage = cloudinaryUrl;
                    console.log('Illustration uploaded successfully:', cloudinaryUrl);
                } else {
                    throw new Error('Failed to upload illustration image');
                }
            } else if (illustrationImage && !illustrationImage.startsWith('data:')) {
                // If it's already a URL (from API), use it directly
                updateData.designData.illustrationImage = illustrationImage;
            }

            // Log the data to console for preview
            console.log('=== PLATFORM SETTINGS DATA TO BE SENT ===');
            console.log('Full Data Object:', updateData);
            console.log('=== BREAKDOWN BY SECTION ===');
            console.log('Fabric Data:', updateData.fabricDataList);
            console.log('Business Data:', updateData.businessData);
            console.log('Media Data:', updateData.mediaData);
            console.log('Design Data:', updateData.designData);
            console.log('Order Data:', updateData.orderData);
            console.log('Report Data:', updateData.reportData);
            console.log('=== END LOG ===');

            // Call API to update configuration
            console.log('Calling updateConfig API...');
            const response = await updateConfig(updateData);
            
            if (response && response.data) {
                console.log('API Response:', response.data);
                            enqueueSnackbar('Platform settings updated successfully!', { 
                variant: 'success',
                autoHideDuration: 3000
            });
            } else {
                throw new Error('Failed to get valid response from API');
            }
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving settings:', error);
            
            // Show more detailed error message
            let errorMessage = 'Failed to save settings. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = `API Error: ${error.response.data.message}`;
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            
            enqueueSnackbar(errorMessage, { 
                variant: 'error',
                autoHideDuration: 5000
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

    // Show loading state while fetching config
    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ color: '#dc3545', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#dc3545' }}>
                        Loading Platform Configuration...
                    </Typography>
                </Box>
            </Box>
        );
    }

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
                    {/* Main Settings Section with Tabs */}
                    <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Settings sx={{ fontSize: 32, color: '#dc3545', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc3545' }}>
                                        Platform Configuration
                                    </Typography>
                                </Box>
                                {apiLoading && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} sx={{ color: '#dc3545' }} />
                                        <Typography variant="body2" sx={{ color: '#dc3545' }}>
                                            Refreshing...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            {/* Main Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                <Tabs 
                                    value={mainTabValue} 
                                    onChange={handleMainTabChange}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: '#666',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '1rem'
                                        },
                                        '& .Mui-selected': {
                                            color: '#dc3545 !important'
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#dc3545'
                                        }
                                    }}
                                >
                                    <Tab label="Business Settings" />
                                    <Tab label="Media Settings" />
                                    <Tab label="Design Settings" />
                                    <Tab label="Order Settings" />
                                    <Tab label="Report Settings" />
                                </Tabs>
                            </Box>

                            {/* Business Settings Tab */}
                            {mainTabValue === 0 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#dc3545' }}>
                                        Business Configuration
                                    </Typography>
                                    <Grid container spacing={3}>
                                                                    <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Tax Rate (%)"
                                    type="number"
                                    value={settings.taxRate}
                                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0.1)}
                                    variant="outlined"
                                    size="medium"
                                    inputProps={{
                                        step: 0.1,
                                        min: 0.1,
                                        max: 100
                                    }}
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="%" size="small" /></InputAdornment>
                                        }
                                    }}
                                    helperText="Enter decimal values (e.g., 0.1 for 0.1%). Must be greater than 0."
                                />
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Service Fee Rate (%)"
                                    type="number"
                                    value={settings.serviceFeeRate}
                                    onChange={(e) => handleSettingChange('serviceFeeRate', parseFloat(e.target.value) || 0.1)}
                                    variant="outlined"
                                    size="medium"
                                    inputProps={{
                                        step: 0.1,
                                        min: 0.1,
                                        max: 100
                                    }}
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position="end"><Chip label="%" size="small" /></InputAdornment>
                                        }
                                    }}
                                    helperText="Enter decimal values (e.g., 0.1 for 0.1%). Must be greater than 0."
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
                                </Box>
                            )}

                            {/* Media Settings Tab */}
                            {mainTabValue === 1 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#dc3545' }}>
                                        Media Configuration
                                    </Typography>
                                    
                                    {/* File Size Limits */}
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        File Size Limits
                                    </Typography>
                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Image Size"
                                                type="number"
                                                value={settings.maxImageSize}
                                                onChange={(e) => handleSettingChange('maxImageSize', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="MB" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Video Size"
                                                type="number"
                                                value={settings.maxVideoSize}
                                                onChange={(e) => handleSettingChange('maxVideoSize', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="MB" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Reference Images"
                                                type="number"
                                                value={settings.maxReferenceImages}
                                                onChange={(e) => handleSettingChange('maxReferenceImages', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max reference images for each design request"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Report Images"
                                                type="number"
                                                value={settings.maxReportImages}
                                                onChange={(e) => handleSettingChange('maxReportImages', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max images that can be added to a report"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Report Videos"
                                                type="number"
                                                value={settings.maxReportVideos}
                                                onChange={(e) => handleSettingChange('maxReportVideos', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max videos that can be added to a report"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="videos" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Feedback Images"
                                                type="number"
                                                value={settings.maxFeedbackImages}
                                                onChange={(e) => handleSettingChange('maxFeedbackImages', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max images that can be added to feedback"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Max Feedback Videos"
                                                type="number"
                                                value={settings.maxFeedbackVideos}
                                                onChange={(e) => handleSettingChange('maxFeedbackVideos', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max videos that can be added to feedback"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="videos" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Thumbnail Limits */}
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        Thumbnail Limits
                                    </Typography>
                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Max Designer Thumbnails"
                                                type="number"
                                                value={settings.maxDesignerThumbnails}
                                                onChange={(e) => handleSettingChange('maxDesignerThumbnails', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max thumbnail images for designer carousel"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Max Garment Thumbnails"
                                                type="number"
                                                value={settings.maxGarmentThumbnails}
                                                onChange={(e) => handleSettingChange('maxGarmentThumbnails', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Max thumbnail images for garment carousel"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="images" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Media Sub-tabs */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs 
                                            value={mediaTabValue} 
                                            onChange={handleMediaTabChange}
                                            sx={{
                                                '& .MuiTab-root': {
                                                    color: '#666',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem'
                                                },
                                                '& .Mui-selected': {
                                                    color: '#dc3545 !important'
                                                },
                                                '& .MuiTabs-indicator': {
                                                    backgroundColor: '#dc3545'
                                                }
                                            }}
                                        >
                                            <Tab label="Image Formats" />
                                            <Tab label="Video Formats" />
                                        </Tabs>
                                    </Box>

                                    {/* Image Formats Sub-tab */}
                                    {mediaTabValue === 0 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    Accepted Image Formats Configuration
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={() => handleAddFormat('image')}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                                        }
                                                    }}
                                                >
                                                    Add Format
                                                </Button>
                                            </Box>
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 2,
                                                justifyContent: 'flex-start'
                                            }}>
                                                {acceptedImageFormats.map((format) => (
                                                    <Box key={format.id} sx={{ 
                                                        flex: '0 0 calc(20% - 16px)',
                                                        minWidth: '120px',
                                                        border: '1px solid #e0e0e0', 
                                                        borderRadius: 1, 
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: 1
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left' }}>
                                                            {format.format}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleEditFormat(format, 'image')}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleDeleteFormat(format.id, 'image')}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Video Formats Sub-tab */}
                                    {mediaTabValue === 1 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    Accepted Video Formats Configuration
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={() => handleAddFormat('video')}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                                        }
                                                    }}
                                                >
                                                    Add Format
                                                </Button>
                                            </Box>
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 2,
                                                justifyContent: 'flex-start'
                                            }}>
                                                {acceptedVideoFormats.map((format) => (
                                                    <Box key={format.id} sx={{ 
                                                        flex: '0 0 calc(20% - 16px)',
                                                        minWidth: '120px',
                                                        border: '1px solid #e0e0e0', 
                                                        borderRadius: 1, 
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: 1
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'left' }}>
                                                            {format.format}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleEditFormat(format, 'video')}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleDeleteFormat(format.id, 'video')}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Design Settings Tab */}
                            {mainTabValue === 2 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#dc3545' }}>
                                        Design Configuration
                                    </Typography>
                                    
                                    {/* Design Sub-tabs */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs 
                                            value={designTabValue} 
                                            onChange={handleDesignTabChange}
                                            sx={{
                                                '& .MuiTab-root': {
                                                    color: '#666',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem'
                                                },
                                                '& .Mui-selected': {
                                                    color: '#dc3545 !important'
                                                },
                                                '& .MuiTabs-indicator': {
                                                    backgroundColor: '#dc3545'
                                                }
                                            }}
                                        >
                                            <Tab label="Logo Positions" />
                                            <Tab label="Fabric Types" />
                                        </Tabs>
                                    </Box>

                                    {/* Logo Positions Sub-tab */}
                                    {designTabValue === 0 && (
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                                Logo Position Configuration
                                            </Typography>
                                            
                                            {/* Illustration Image Upload */}
                                            <Box sx={{ mb: 3, p: 2, border: '2px dashed #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
                                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                                    Illustration Image
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                                    Upload an image showing all logo positions for reference
                                                </Typography>
                                                
                                                {illustrationImage && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <img 
                                                            src={illustrationImage} 
                                                            alt="Logo positions illustration"
                                                            style={{ 
                                                                maxWidth: '100%', 
                                                                maxHeight: '300px', 
                                                                objectFit: 'contain',
                                                                borderRadius: 8,
                                                                border: '1px solid #e0e0e0'
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id="upload-illustration"
                                                    type="file"
                                                    onChange={(e) => {
                                                        handleIllustrationUpload(e.target.files[0]);
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <label htmlFor="upload-illustration">
                                                    <Button
                                                        component="span"
                                                        variant="outlined"
                                                        startIcon={uploadingImage ? <CircularProgress size={20} /> : <Upload />}
                                                        disabled={uploadingImage}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        {uploadingImage ? 'Uploading...' : (illustrationImage ? 'Change Image' : 'Upload Image')}
                                                    </Button>
                                                </label>
                                                
                                                {illustrationImage && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => {
                                                            setIllustrationImage(null);
                                                            setHasChanges(true);
                                                        }}
                                                    >
                                                        Remove Image
                                                    </Button>
                                                )}
                                            </Box>
                                            
                                            {/* Logo Positions List */}
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                                Available Positions
                                            </Typography>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 2,
                                                justifyContent: 'flex-start'
                                            }}>
                                                {logoPositions.map((position) => (
                                                    <Box key={position.id} sx={{ 
                                                        flex: '0 0 calc(20% - 16px)',
                                                        minWidth: '120px',
                                                        border: '1px solid #e0e0e0', 
                                                        borderRadius: 1, 
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: 1
                                                    }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                            {position.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleEditPosition(position)}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleDeletePosition(position.id)}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Fabric Types Sub-tab */}
                                    {designTabValue === 1 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    Fabric Types Configuration
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={handleAddFabric}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                                        }
                                                    }}
                                                >
                                                    Add Fabric
                                                </Button>
                                            </Box>
                                            
                                            {/* Search and Filter Controls */}
                                            <Box sx={{ mb: 3 }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    {/* Search by Name */}
                                                    <Grid item xs={12} md={4}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            placeholder="Search by fabric name..."
                                                            value={fabricSearchTerm}
                                                            onChange={(e) => {
                                                                setFabricSearchTerm(e.target.value);
                                                                setFabricPage(1);
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Info sx={{ fontSize: 20, color: 'text.secondary' }} />
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    {/* Filter by Type */}
                                                    <Grid item xs={12} md={2}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Type</InputLabel>
                                                            <Select
                                                                value={fabricTypeFilter}
                                                                onChange={(e) => {
                                                                    setFabricTypeFilter(e.target.value);
                                                                    setFabricPage(1);
                                                                }}
                                                                label="Type"
                                                            >
                                                                <MenuItem value="all">All Types</MenuItem>
                                                                {clothingTypeOptions.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    
                                                    {/* Filter by Category */}
                                                    <Grid item xs={12} md={2}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Category</InputLabel>
                                                            <Select
                                                                value={fabricCategoryFilter}
                                                                onChange={(e) => {
                                                                    setFabricCategoryFilter(e.target.value);
                                                                    setFabricPage(1);
                                                                }}
                                                                label="Category"
                                                            >
                                                                <MenuItem value="all">All Categories</MenuItem>
                                                                {categoryOptions.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    
                                                    {/* Reset Filters */}
                                                    <Grid item xs={12} md={2}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={handleResetFilters}
                                                            sx={{ height: 40 }}
                                                        >
                                                            Reset Filters
                                                        </Button>
                                                    </Grid>
                                                    
                                                    {/* Results Count */}
                                                    <Grid item xs={12} md={2}>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                                                            {getFilteredAndSortedFabrics().length} fabrics found
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            
                                            {/* Fabric List with Pagination */}
                                            <Box>
                                                {getFilteredAndSortedFabrics().length === 0 ? (
                                                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                                        <Typography variant="body1">
                                                            {fabrics.length === 0 
                                                                ? 'No fabrics available. Click "Add Fabric" to create the first one.'
                                                                : 'No fabrics match your search criteria. Try adjusting your filters.'
                                                            }
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <>
                                                                                                    <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 2,
                                                justifyContent: 'flex-start'
                                            }}>
                                                {getFilteredAndSortedFabrics()
                                                    .slice((fabricPage - 1) * fabricPageSize, fabricPage * fabricPageSize)
                                                    .map((fabric) => (
                                                    <Box key={fabric.id} sx={{ 
                                                        flex: '0 0 calc(25% - 16px)',
                                                        minWidth: '200px',
                                                        border: '1px solid #e0e0e0', 
                                                        borderRadius: 1, 
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                {fabric.name}
                                                            </Typography>
                                                            <Chip 
                                                                label={fabric.isActive ? 'Active' : 'Inactive'} 
                                                                size="small" 
                                                                color={fabric.isActive ? 'success' : 'default'}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {fabric.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            <Chip 
                                                                label={`Type: ${fabric.clothingType.join(', ')}`} 
                                                                size="small" 
                                                                variant="outlined"
                                                            />
                                                            <Chip 
                                                                label={`Category: ${fabric.category.join(', ')}`} 
                                                                size="small" 
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                                        
                                                        {/* Pagination Controls */}
                                                        {getFilteredAndSortedFabrics().length > fabricPageSize && (
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => setFabricPage(prev => Math.max(1, prev - 1))}
                                                                    disabled={fabricPage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                
                                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                    Page {fabricPage} of {Math.ceil(getFilteredAndSortedFabrics().length / fabricPageSize)}
                                                                </Typography>
                                                                
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => setFabricPage(prev => Math.min(Math.ceil(getFilteredAndSortedFabrics().length / fabricPageSize), prev + 1))}
                                                                    disabled={fabricPage >= Math.ceil(getFilteredAndSortedFabrics().length / fabricPageSize)}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Order Settings Tab */}
                            {mainTabValue === 3 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#dc3545' }}>
                                        Order Configuration
                                    </Typography>
                                    
                                    {/* Order Limits */}
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        Order Requirements
                                    </Typography>
                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Minimum Uniform Quantity"
                                                type="number"
                                                value={settings.minUniformQuantity}
                                                onChange={(e) => handleSettingChange('minUniformQuantity', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Minimum quantity required to create an order"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="pieces" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Max Assigned Milestones"
                                                type="number"
                                                value={settings.maxAssignedMilestones}
                                                onChange={(e) => handleSettingChange('maxAssignedMilestones', parseInt(e.target.value) || 1)}
                                                variant="outlined"
                                                size="medium"
                                                inputProps={{
                                                    min: 1
                                                }}
                                                helperText="Maximum milestones that can be assigned to an order"
                                                slotProps={{
                                                    input: {
                                                        endAdornment: <InputAdornment position="end"><Chip label="milestones" size="small" /></InputAdornment>
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    
                                    {/* Order Process Description */}
                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#dc3545' }}>
                                            Order Creation Process
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                            Schools must order a minimum of {settings.minUniformQuantity} uniform pieces to create an order. 
                                            Each order can have up to {settings.maxAssignedMilestones} milestones for tracking progress and payments.
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label="Design Selection" 
                                                size="small" 
                                                variant="outlined"
                                                color="primary"
                                            />
                                            <Chip 
                                                label="Quantity Check" 
                                                size="small" 
                                                variant="outlined"
                                                color="warning"
                                            />
                                            <Chip 
                                                label={`Min ${settings.minUniformQuantity} Pieces`} 
                                                size="small" 
                                                variant="outlined"
                                                color="info"
                                            />
                                            <Chip 
                                                label="Order Creation" 
                                                size="small" 
                                                variant="outlined"
                                                color="success"
                                            />
                                            <Chip 
                                                label={`Max ${settings.maxAssignedMilestones} Milestones`} 
                                                size="small" 
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* Report Settings Tab */}
                            {mainTabValue === 4 && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#dc3545' }}>
                                        Report Configuration
                                    </Typography>
                                    
                                    {/* Report Sub-tabs */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs 
                                            value={reportTabValue} 
                                            onChange={handleReportTabChange}
                                            sx={{
                                                '& .MuiTab-root': {
                                                    color: '#666',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem'
                                                },
                                                '& .Mui-selected': {
                                                    color: '#dc3545 !important'
                                                },
                                                '& .MuiTabs-indicator': {
                                                    backgroundColor: '#dc3545'
                                                }
                                            }}
                                        >
                                            <Tab label="Appeal Timeline" />
                                            <Tab label="Disbursement Timeline" />
                                            <Tab label="Severity Levels" />
                                        </Tabs>
                                    </Box>

                                    {/* Appeal Timeline Sub-tab */}
                                    {reportTabValue === 0 && (
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                                Appeal Timeline Configuration
                                            </Typography>
                                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                                <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Max Appeal Days"
                                                        type="number"
                                                        value={settings.maxAppealDays}
                                                        onChange={(e) => handleSettingChange('maxAppealDays', parseInt(e.target.value) || 1)}
                                                        variant="outlined"
                                                        size="medium"
                                                        inputProps={{
                                                            min: 1
                                                        }}
                                                        helperText="Maximum days users can appeal admin's report decision"
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: <InputAdornment position="end"><Chip label="days" size="small" /></InputAdornment>
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            
                                            {/* Process Description */}
                                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#dc3545' }}>
                                                    Report Appeal Process
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                                    When a user submits a report, admin will review and make a decision. 
                                                    Users have {settings.maxAppealDays} days to appeal the decision if they disagree with the outcome.
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        label="Report Submission" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                    <Chip 
                                                        label="Admin Review" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="warning"
                                                    />
                                                    <Chip 
                                                        label="Decision Made" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="info"
                                                    />
                                                    <Chip 
                                                        label={`${settings.maxAppealDays} Days Appeal Window`} 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="success"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Disbursement Timeline Sub-tab */}
                                    {reportTabValue === 1 && (
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                                Disbursement Timeline Configuration
                                            </Typography>
                                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                                <Grid item xs={12} md={6} sx={{ flex: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Max Disbursement Days"
                                                        type="number"
                                                        value={settings.maxDisbursementDays}
                                                        onChange={(e) => handleSettingChange('maxDisbursementDays', parseInt(e.target.value) || 1)}
                                                        variant="outlined"
                                                        size="medium"
                                                        inputProps={{
                                                            min: 1
                                                        }}
                                                        helperText="Maximum days to process disbursement after report resolution"
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: <InputAdornment position="end"><Chip label="days" size="small" /></InputAdornment>
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            
                                            {/* Process Description */}
                                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#dc3545' }}>
                                                    Disbursement Process
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                                    After a report is resolved and compensation is approved, the disbursement process begins. 
                                                    Funds will be processed within {settings.maxDisbursementDays} days to ensure timely payment to users.
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        label="Report Resolution" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                    <Chip 
                                                        label="Compensation Approval" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="warning"
                                                    />
                                                    <Chip 
                                                        label="Payment Processing" 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="info"
                                                    />
                                                    <Chip 
                                                        label={`${settings.maxDisbursementDays} Days Disbursement`} 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="success"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Severity Levels Sub-tab */}
                                    {reportTabValue === 2 && (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    Report Severity Levels Configuration
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Add />}
                                                    onClick={handleAddSeverity}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)'
                                                        }
                                                    }}
                                                >
                                                    Add Level
                                                </Button>
                                            </Box>
                                            
                                            <List>
                                                {reportSeverityLevels.map((level) => (
                                                    <ListItem key={level.id} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Box 
                                                                                sx={{ 
                                                                                    width: 16, 
                                                                                    height: 16, 
                                                                                    borderRadius: '50%', 
                                                                                    backgroundColor: level.color,
                                                                                    mr: 1
                                                                                }} 
                                                                            />
                                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                                {level.name}
                                                                            </Typography>
                                                                            <Chip 
                                                                                label={level.isActive ? 'Active' : 'Inactive'} 
                                                                                size="small" 
                                                                                color={level.isActive ? 'success' : 'default'}
                                                                            />
                                                                            <Chip 
                                                                                label={`${level.compensationPercentage}% Compensation`} 
                                                                                size="small" 
                                                                                variant="outlined"
                                                                                color="primary"
                                                                            />
                                                                        </Box>
                                                                    }
                                                                    secondary={level.description}
                                                                />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleEditSeverity(level)}
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={() => handleDeleteSeverity(level.id)}
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Position Dialog */}
                    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Edit Logo Position</DialogTitle>
                        <DialogContent>
                            {editingPosition && (
                                <Box sx={{ pt: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Position Name"
                                        value={editingPosition.name}
                                        onChange={(e) => setEditingPosition({...editingPosition, name: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={editingPosition.description}
                                        onChange={(e) => setEditingPosition({...editingPosition, description: e.target.value})}
                                        multiline
                                        rows={2}
                                        sx={{ mb: 2 }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={editingPosition.isActive}
                                                onChange={(e) => setEditingPosition({...editingPosition, isActive: e.target.checked})}
                                            />
                                        }
                                        label="Active"
                                    />
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSavePosition} variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>



                    {/* Fabric Edit Dialog */}
                    <Dialog open={fabricDialogOpen} onClose={() => setFabricDialogOpen(false)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            {editingFabric && editingFabric.id > Math.max(...fabrics.map(f => f.id)) ? 'Add New Fabric' : 'Edit Fabric'}
                        </DialogTitle>
                        <DialogContent>
                            {editingFabric && (
                                <Box sx={{ pt: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Fabric Name"
                                        value={editingFabric.name}
                                        onChange={(e) => setEditingFabric({...editingFabric, name: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={editingFabric.description}
                                        onChange={(e) => setEditingFabric({...editingFabric, description: e.target.value})}
                                        multiline
                                        rows={3}
                                        sx={{ mb: 2 }}
                                    />
                                    
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="gender-label">Gender</InputLabel>
                                        <Select
                                            labelId="gender-label"
                                            label="Gender"
                                            multiple
                                            value={editingFabric.gender}
                                            onChange={(e) => setEditingFabric({...editingFabric, gender: e.target.value})}
                                            renderValue={(selected) => selected.map(value => 
                                                genderOptions.find(option => option.value === value)?.label
                                            ).join(', ')}
                                        >
                                            {genderOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="clothing-type-label">Clothing Type</InputLabel>
                                        <Select
                                            labelId="clothing-type-label"
                                            label="Clothing Type"
                                            multiple
                                            value={editingFabric.clothingType}
                                            onChange={(e) => setEditingFabric({...editingFabric, clothingType: e.target.value})}
                                            renderValue={(selected) => selected.map(value => 
                                                clothingTypeOptions.find(option => option.value === value)?.label
                                            ).join(', ')}
                                        >
                                            {clothingTypeOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="category-label">Category</InputLabel>
                                        <Select
                                            labelId="category-label"
                                            label="Category"
                                            multiple
                                            value={editingFabric.category}
                                            onChange={(e) => setEditingFabric({...editingFabric, category: e.target.value})}
                                            renderValue={(selected) => selected.map(value => 
                                                categoryOptions.find(option => option.value === value)?.label
                                            ).join(', ')}
                                        >
                                            {categoryOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={editingFabric.isActive}
                                                onChange={(e) => setEditingFabric({...editingFabric, isActive: e.target.checked})}
                                            />
                                        }
                                        label="Active"
                                    />
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setFabricDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveFabric} variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Severity Level Edit Dialog */}
                    <Dialog open={severityDialogOpen} onClose={() => setSeverityDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {editingSeverity && editingSeverity.id > Math.max(...reportSeverityLevels.map(s => s.id)) ? 'Add New Severity Level' : 'Edit Severity Level'}
                        </DialogTitle>
                        <DialogContent>
                            {editingSeverity && (
                                <Box sx={{ pt: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Severity Name"
                                        value={editingSeverity.name}
                                        onChange={(e) => setEditingSeverity({...editingSeverity, name: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={editingSeverity.description}
                                        onChange={(e) => setEditingSeverity({...editingSeverity, description: e.target.value})}
                                        multiline
                                        rows={2}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Compensation Percentage"
                                        type="number"
                                        value={editingSeverity.compensationPercentage}
                                        onChange={(e) => setEditingSeverity({...editingSeverity, compensationPercentage: parseInt(e.target.value) || 1})}
                                        sx={{ mb: 2 }}
                                        inputProps={{
                                            min: 1,
                                            max: 100
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position="end"><Chip label="%" size="small" /></InputAdornment>
                                            }
                                        }}
                                    />
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                            Color
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: 1, 
                                                    backgroundColor: editingSeverity.color,
                                                    border: '2px solid #e0e0e0',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        border: '2px solid #dc3545'
                                                    }
                                                }}
                                                onClick={handleColorPickerOpen}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Hex Color"
                                                value={editingSeverity.color}
                                                onChange={(e) => setEditingSeverity({...editingSeverity, color: e.target.value})}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={editingSeverity.isActive}
                                                onChange={(e) => setEditingSeverity({...editingSeverity, isActive: e.target.checked})}
                                            />
                                        }
                                        label="Active"
                                    />
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSeverityDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveSeverity} variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Color Picker Popover */}
                    <Popover
                        open={colorPickerOpen}
                        anchorEl={colorPickerAnchor}
                        onClose={handleColorPickerClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <Box sx={{ p: 2, width: 280 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Choose Color
                            </Typography>
                            <Grid container spacing={1}>
                                {[
                                    '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#17a2b8', 
                                    '#6f42c1', '#e83e8c', '#6c757d', '#343a40', '#007bff',
                                    '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14',
                                    '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d'
                                ].map((color) => (
                                    <Grid item key={color}>
                                        <Box 
                                            sx={{ 
                                                width: 30, 
                                                height: 30, 
                                                borderRadius: 1, 
                                                backgroundColor: color,
                                                border: '2px solid #e0e0e0',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    border: '2px solid #333',
                                                    transform: 'scale(1.1)'
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => handleColorChange(color)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Click on a color to select it
                                </Typography>
                            </Box>
                        </Box>
                    </Popover>

                    {/* Format Edit Dialog */}
                    <Dialog open={formatDialogOpen} onClose={() => setFormatDialogOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {editingFormat && editingFormat.id > Math.max(...(formatType === 'image' ? acceptedImageFormats.map(f => f.id) : acceptedVideoFormats.map(f => f.id))) ? 
                                `Add New ${formatType === 'image' ? 'Image' : 'Video'} Format` : 
                                `Edit ${formatType === 'image' ? 'Image' : 'Video'} Format`
                            }
                        </DialogTitle>
                        <DialogContent>
                            {editingFormat && (
                                <Box sx={{ pt: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Format Extension"
                                        value={editingFormat.format}
                                        onChange={(e) => setEditingFormat({...editingFormat, format: e.target.value})}
                                        sx={{ mb: 2 }}
                                        helperText={`Enter format without dot (e.g., ${formatType === 'image' ? 'jpg, png' : 'mp4, avi'})`}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={editingFormat.description}
                                        onChange={(e) => setEditingFormat({...editingFormat, description: e.target.value})}
                                        multiline
                                        rows={2}
                                        sx={{ mb: 2 }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={editingFormat.isActive}
                                                onChange={(e) => setEditingFormat({...editingFormat, isActive: e.target.checked})}
                                            />
                                        }
                                        label="Active"
                                    />
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setFormatDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveFormat} variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>

                                        {/* Action Buttons */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                </Grid>
            </Grid>
        </Box>
    );
} 