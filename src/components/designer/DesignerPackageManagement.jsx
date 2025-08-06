import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogContent,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Inventory as PackageIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import {Space, Table, Tag, Tooltip as AntTooltip} from 'antd';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {enqueueSnackbar} from 'notistack';
import {parseID} from '../../utils/ParseIDUtil.jsx';
import {createPackage, getPackages, updatePackageStatus} from "../../services/DesignService.jsx";
import {designerMaxPackage} from "../../configs/FixedVariables.jsx";

export default function DesignerPackageManagement() {
    const [packages, setPackages] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        content: '',
        price: '',
        revisionLimit: 1,
        deliveryDays: 1,
        status: 'active'
    });

    useEffect(() => {
        async function FetchPackages(){
            return await getPackages()
        }

        FetchPackages().then(res => {
            if(res && res.status === 200){
                setPackages(res.data.body?.filter(item => item.status !== 'delete'))
            }
        }).catch(() => enqueueSnackbar("Fetch fail", {variant: 'error'}))
    }, []);

    const handleOpenDialog = (packageData = null) => {
        if (packageData) {
            setEditingPackage(packageData);
            // Map API data to form data
            setFormData({
                id: packageData.id || 0,
                name: packageData.name || '',
                content: packageData.headerContent || '',
                price: packageData.fee ? packageData.fee.toLocaleString('en-US') : '',
                revisionLimit: packageData.revisionTime || 1,
                deliveryDays: packageData.deliveryDuration || 1,
                status: packageData.status || 'active'
            });
        } else {
            setEditingPackage(null);
            setFormData({
                id: 0,
                name: '',
                content: '',
                price: '',
                revisionLimit: 1,
                deliveryDays: 1,
                status: 'active'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPackage(null);
        setFormData({
            name: '',
            content: '',
            price: '',
            revisionLimit: 1,
            deliveryDays: 1,
            status: 'active'
        });
        window.location.reload()
    };

    const handleSubmit = () => {
        if (editingPackage) {
            // When editing, only status is required
            if (!formData.status) {
                enqueueSnackbar('Please select a status', {variant: 'error'});
                return;
            }
        } else {
            // When creating, all fields are required
            if (!formData.name || !formData.content || !formData.price) {
                enqueueSnackbar('Please fill in all required fields', {variant: 'error'});
                return;
            }
        }

        if (editingPackage) {
            // Update existing package
            const data = {
                packageId: parseInt(formData.id),
                status: formData.status.trim()
            }

            updatePackageStatus(data).then(res => {
                if(res && res.status === 200){
                    enqueueSnackbar(res.data.message, {variant: 'success', autoHideDuration: 1000});
                    setTimeout(() => {
                        handleCloseDialog();
                    }, 1000)
                }
            }).catch((e) => {
                enqueueSnackbar(e.response.data.message, {variant: 'error'});
            })
        } else {
            // Create new package
            const data = {
                deliveryDuration: parseInt(formData.deliveryDays),
                revisionTime: parseInt(formData.revisionLimit),
                fee: parseInt(formData.price.replaceAll(',', '')),
                headerContent: formData.content.trim(),
                name: formData.name.trim(),
                status: formData.status.trim()
            }

            createPackage(data).then(res => {
                if(res && res.status === 201){
                    enqueueSnackbar(res.data.message, {variant: 'success', autoHideDuration: 1000});
                    setTimeout(() => {
                        handleCloseDialog();
                    }, 1000)
                }
            }).catch((e) => {
                enqueueSnackbar(e.response.data.message, {variant: 'error'});
            })
        }

    };

    const handleDelete = (packageId) => {
        const data = {
            packageId: parseInt(packageId),
            status: 'delete'
        }

        updatePackageStatus(data).then(res => {
            if(res && res.status === 200){
                enqueueSnackbar(res.data.message, {variant: 'success', autoHideDuration: 1000});
                setTimeout(() => {
                    handleCloseDialog();
                }, 1000)
            }
        }).catch((e) => {
            enqueueSnackbar(e.response.data.message, {variant: 'error'});
        })
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            active: {
                color: 'success',
                icon: <CheckCircleIcon sx={{fontSize: 16}}/>,
                label: 'Active'
            },
            inactive: {
                color: 'default',
                icon: <BlockIcon sx={{fontSize: 16}}/>,
                label: 'Inactive'
            }
        };

        const config = statusConfig[status] || statusConfig.inactive;

        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                        color: 'inherit'
                    }
                }}
            />
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPrice = (value) => {
        // Remove all non-digit characters
        const numericValue = value.replace(/\D/g, '');
        
        // If empty, return empty string to allow free typing
        if (!numericValue) return '';
        
        // Convert to number
        const numValue = parseInt(numericValue) || 0;
        
        // Only validate max range during typing, allow small numbers
        if (numValue > 999000000) return '999,000,000';
        
        // Format with commas
        return numValue.toLocaleString('en-US');
    };

    const parsePrice = (value) => {
        return parseInt(value.replace(/\D/g, '')) || 0;
    };

    // Check if can create new package
    const canCreatePackage = () => {
        const totalPackages = packages.length;
        return totalPackages < designerMaxPackage;
    };

    return (
        <Container maxWidth="xl" sx={{py: 3}}>
            {/* Header Section */}
            <Box sx={{mb: 4}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}>
                            <PackageIcon sx={{fontSize: 32}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 800, color: '#1e293b', mb: 0.5}}>
                                Design Packages ({designerMaxPackage - packages.length} left)
                            </Typography>
                            <Typography variant="body1" sx={{color: '#64748b', fontWeight: 500}}>
                                Manage your design packages and configurations
                            </Typography>
                            {!canCreatePackage() && (
                                <Typography variant="body2" sx={{color: '#ef4444', fontWeight: 500, mt: 1}}>
                                    Maximum packages reached ({packages.length}/{designerMaxPackage})
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => handleOpenDialog()}
                        disabled={!canCreatePackage()}
                        sx={{
                            background: canCreatePackage() 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : '#e2e8f0',
                            color: 'white',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            boxShadow: canCreatePackage() 
                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                : 'none',
                            '&:hover': canCreatePackage() ? {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            } : {},
                            '&:disabled': {
                                background: '#e2e8f0',
                                color: '#94a3b8',
                                cursor: 'not-allowed'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Create Package
                    </Button>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{mb: 4}}>
                    <Grid sx={{flex: 1}}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)'
                            }
                        }}>
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Typography variant="h4" sx={{fontWeight: 800, mb: 1}}>
                                            {packages.length}
                                        </Typography>
                                        <Typography variant="body2" sx={{opacity: 0.9}}>
                                            Total Packages
                                        </Typography>
                                    </Box>
                                    <PackageIcon sx={{fontSize: 40, opacity: 0.8}}/>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid sx={{flex: 1}}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.3)'
                            }
                        }}>
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Typography variant="h4" sx={{fontWeight: 800, mb: 1}}>
                                            {packages.filter(pkg => pkg.status === 'active').length}
                                        </Typography>
                                        <Typography variant="body2" sx={{opacity: 0.9}}>
                                            Active Packages
                                        </Typography>
                                    </Box>
                                    <CheckCircleIcon sx={{fontSize: 40, opacity: 0.8}}/>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid sx={{flex: 1}}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(239, 68, 68, 0.3)'
                            }
                        }}>
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Typography variant="h4" sx={{fontWeight: 800, mb: 1}}>
                                            {packages.filter(pkg => pkg.status === 'inactive').length}
                                        </Typography>
                                        <Typography variant="body2" sx={{opacity: 0.9}}>
                                            Inactive Packages
                                        </Typography>
                                    </Box>
                                    <CheckCircleIcon sx={{fontSize: 40, opacity: 0.8}}/>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Packages Table */}
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <Box sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                        Package Management
                    </Typography>
                </Box>

                <Box sx={{p: 3}}>
                    <Table
                        dataSource={packages}
                        columns={[
                            {
                                title: 'ID',
                                dataIndex: 'id',
                                key: 'id',
                                render: (id) => (
                                    <Typography variant="body2" sx={{
                                        color: '#667eea',
                                        fontWeight: 600,
                                        fontFamily: 'monospace'
                                    }}>
                                        {parseID(id, 'pkg')}
                                    </Typography>
                                ),
                                sorter: (a, b) => a.id - b.id,
                                defaultSortOrder: 'descend',
                                width: '10%'
                            },
                            {
                                title: 'Package Name',
                                dataIndex: 'name',
                                key: 'name',
                                render: (text) => (
                                    <Typography variant="body2" sx={{color: '#1e293b'}}>
                                        {text}
                                    </Typography>
                                ),
                                sorter: (a, b) => a.name.localeCompare(b.name),
                                width: '30%'
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                    const statusConfig = {
                                        active: {color: 'success', text: 'Active'},
                                        inactive: {color: 'default', text: 'Inactive'}
                                    };
                                    const config = statusConfig[status] || statusConfig.inactive;
                                    return <Tag color={config.color}>{config.text}</Tag>;
                                },
                                filters: [
                                    {text: 'Active', value: 'active'},
                                    {text: 'Inactive', value: 'inactive'}
                                ],
                                onFilter: (value, record) => record.status === value,
                                width: '12%'
                            },
                            {
                                title: 'Revisions',
                                dataIndex: 'revisionTime',
                                key: 'revisionLimit',
                                render: (value) => (
                                    <Tag
                                        color={value === 9999 ? "success" : "blue"}
                                        style={{fontWeight: 600}}
                                    >
                                        {value === 9999 ? 'Unlimited' : `${value} revisions`}
                                    </Tag>
                                ),
                                sorter: (a, b) => a.revisionLimit - b.revisionLimit,
                                width: '12%'
                            },
                            {
                                title: 'Delivery',
                                dataIndex: 'deliveryDuration',
                                key: 'deliveryDays',
                                render: (value) => (
                                    <Tag color="green" style={{fontWeight: 600}}>
                                        {value} days
                                    </Tag>
                                ),
                                sorter: (a, b) => a.deliveryDays - b.deliveryDays,
                                width: '12%'
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                    <Space size="middle">

                                        <AntTooltip title="Edit Package">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(record)}
                                                sx={{
                                                    color: '#f59e0b',
                                                    '&:hover': {
                                                        background: 'rgba(245, 158, 11, 0.1)'
                                                    }
                                                }}
                                            >
                                                <EditOutlined/>
                                            </IconButton>
                                        </AntTooltip>
                                        <AntTooltip title="Delete Package">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(record.id)}
                                                sx={{
                                                    color: '#ef4444',
                                                    '&:hover': {
                                                        background: 'rgba(239, 68, 68, 0.1)'
                                                    }
                                                }}
                                            >
                                                <DeleteOutlined/>
                                            </IconButton>
                                        </AntTooltip>
                                    </Space>
                                ),
                                width: 'auto'
                            }
                        ]}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} packages`,
                            pageSizeOptions: ['5', '10', '20', '50']
                        }}
                        scroll={{x: 1200}}
                        size="middle"
                        bordered={false}
                        style={{
                            background: 'transparent'
                        }}
                        rowClassName={(record, index) =>
                            index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        }
                    />
                </Box>
            </Card>

            {/* Create/Edit Package Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: '#ffffff',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 2.5,
                    textAlign: 'left'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5}}>
                        <PackageIcon sx={{fontSize: 24}}/>
                        <Typography variant="h6" sx={{fontWeight: 700}}>
                            {editingPackage ? 'Edit Package' : 'Create Package'}
                        </Typography>
                    </Box>
                </Box>

                {/* Content */}
                <DialogContent sx={{p: 3, width: '100%'}}>

                    {/* Package Name, Content and Price */}
                    <Grid container spacing={2.5} sx={{width: '100%'}}>
                        {/* Package Name */}
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                label="Package Name"
                                placeholder="Enter package name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                disabled={editingPackage !== null}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Content */}
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                label="Content"
                                placeholder="Describe your package features"
                                multiline
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                disabled={editingPackage !== null}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Price */}
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                label="Price (VND)"
                                placeholder="Enter price (1,000 - 999,000,000)"
                                value={formData.price}
                                onChange={(e) => {
                                    const formattedValue = formatPrice(e.target.value);
                                    setFormData({...formData, price: formattedValue});
                                }}
                                onBlur={(e) => {
                                    // When user finishes typing, ensure minimum value
                                    const numericValue = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                    if (e.target.value && numericValue < 1000) {
                                        setFormData({...formData, price: '1,000'});
                                    }
                                }}
                                disabled={editingPackage !== null}
                                InputProps={{
                                    endAdornment: (
                                        <Typography variant="body2" sx={{color: '#64748b', fontWeight: 600}}>
                                            VND
                                        </Typography>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    {/* Revision Limit and Delivery Days and Status */}
                    <Grid container spacing={2.5} sx={{width: '100%', mt: 2}}>
                        {/* Settings Row */}
                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                type="number"
                                min={1}
                                max={9999}
                                label="Revision Limit"
                                placeholder="1-9999"
                                value={formData.revisionLimit}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    if (value >= 1 && value <= 9999) {
                                        setFormData({...formData, revisionLimit: value});
                                    }
                                }}
                                disabled={editingPackage !== null}
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{mr: 1, color: '#667eea'}}>
                                            <RefreshIcon sx={{fontSize: 18}}/>
                                        </Box>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid sx={{flex: 1}}>
                            <TextField
                                fullWidth
                                type="number"
                                min={1}
                                max={100}
                                label="Delivery Days"
                                placeholder="1-100 days"
                                value={formData.deliveryDays}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    if (value >= 1 && value <= 100) {
                                        setFormData({...formData, deliveryDays: value});
                                    }
                                }}
                                disabled={editingPackage !== null}
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{mr: 1, color: '#667eea'}}>
                                            <ScheduleIcon sx={{fontSize: 18}}/>
                                        </Box>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#667eea'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid sx={{flex: 1}}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}

                                    sx={{
                                        borderRadius: 1.5,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#e2e8f0'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea'
                                        }
                                    }}
                                >
                                    <MenuItem value="active">
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <CheckCircleIcon sx={{color: '#10b981', fontSize: 16}}/>
                                            Active
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="inactive">
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <BlockIcon sx={{color: '#6b7280', fontSize: 16}}/>
                                            Inactive
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Preview */}
                    <Grid container spacing={2.5} sx={{mt: 2, width: '100%'}}>
                        <Grid sx={{width: '100%'}}>
                            <Box sx={{
                                p: 2.5,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '100%'
                            }}>
                                <Grid container spacing={2} sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%'
                                }}>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 700,
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flex: 1
                                    }}>
                                        <Box sx={{
                                            width: 3,
                                            height: 16,
                                            borderRadius: 1.5,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}/>
                                        Package Preview
                                    </Typography>

                                    <Grid sx={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                {getStatusChip(formData.status)}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2}
                                      sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
                                    <Grid sx={{flex: 1}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Name
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e293b',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.name || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid sx={{flex: 2}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Content
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#1e293b',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.content || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid sx={{flex: 1}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Price
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#f59e0b',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.price ? `${formData.price} VND` : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid sx={{flex: 1}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Revisions
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: formData.revisionLimit === 9999 ? '#10b981' : '#667eea',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.revisionLimit === 9999 ? 'Unlimited' : `${formData.revisionLimit || 0} ${formData.revisionLimit > 1 ? 'revisions': 'revision'}`}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid sx={{flex: 1}}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                            <Typography variant="caption" sx={{
                                                color: '#64748b',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Delivery
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#10b981',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.deliveryDays || 0} {formData.deliveryDays > 1 ? 'days' : 'day'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* Actions */}
                <Box sx={{
                    p: 2.5,
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5
                }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: '#cbd5e1',
                            color: '#64748b',
                            borderRadius: 1.5,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: '#94a3b8',
                                backgroundColor: 'rgba(100, 116, 139, 0.04)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        size="small"
                        disabled={editingPackage ? !formData.status : (!formData.name || !formData.content || !formData.price)}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 1.5,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                            },
                            '&:disabled': {
                                background: '#e2e8f0',
                                color: '#94a3b8',
                                transform: 'none',
                                boxShadow: 'none'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {editingPackage ? 'Update' : 'Create'}
                    </Button>
                </Box>
            </Dialog>
        </Container>
    );
}