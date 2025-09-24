import React, { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  AppstoreOutlined as InventoryIcon,
  ShoppingOutlined as ShoppingCartIcon,
  SettingOutlined as SettingIcon
} from '@ant-design/icons';
import { getSizes } from '../../services/OrderService';
import { getGarmentFabric, updateGarmentFabric, deleteGarmentFabric } from '../../services/SystemService';
import { FABRIC_PRICE_MIN, FABRIC_PRICE_MAX, FABRIC_PRICE_STEP } from '../../configs/FixedVariables';

// Helper function to determine fabric types from boolean flags (returns array)
const getFabricTypesFromFlags = (fabric) => {
  const types = [];
  if (fabric.forShirt) types.push('shirt');
  if (fabric.forPants) types.push('pants');
  if (fabric.forSkirt) types.push('skirt');
  return types.length > 0 ? types : ['unknown'];
};

// Helper function to determine fabric categories from boolean flags (returns array)
const getFabricCategoriesFromFlags = (fabric) => {
  const categories = [];
  if (fabric.forRegular) categories.push('regular');
  if (fabric.forPE) categories.push('physical');
  return categories.length > 0 ? categories : ['unknown'];
};

// Helper function to get primary fabric type (for backward compatibility)
const getFabricTypeFromFlags = (fabric) => {
  if (fabric.forShirt) return 'shirt';
  if (fabric.forPants) return 'pants';
  if (fabric.forSkirt) return 'skirt';
  return 'unknown';
};

// Helper function to get primary fabric category (for backward compatibility)
const getFabricCategoryFromFlags = (fabric) => {
  if (fabric.forRegular) return 'regular';
  if (fabric.forPE) return 'physical';
  return 'unknown';
};

const FabricManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State quản lý dữ liệu
  const [sizes, setSizes] = useState([]);
  const [systemFabrics, setSystemFabrics] = useState({ nonPrice: [], hasPrice: [] });
  const [garmentFabrics, setGarmentFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State UI
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  // State form thêm vải
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [fabricPrices, setFabricPrices] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Starting to load data...');
      
      const [sizesResponse, fabricsResponse] = await Promise.all([
        getSizes(),
        getGarmentFabric()
      ]);
      
      console.log('Sizes response:', sizesResponse);
      console.log('Fabrics response:', fabricsResponse);
      
      if (sizesResponse?.data?.body) {
        console.log('Setting sizes:', sizesResponse.data.body);
        setSizes(sizesResponse.data.body);
      }
      
      if (fabricsResponse?.data?.body) {
        console.log('API response body:', fabricsResponse.data.body);
        console.log('Setting system fabrics...');
        setSystemFabrics(fabricsResponse.data.body);
      } else {
        console.log('No fabrics response body found');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', width: '300px', mb: 2 }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '500px' }} />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '200px' }} />
        </Box>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                  <Skeleton variant="text" sx={{ mb: 2 }} />
                  <Skeleton variant="text" sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={40} height={24} />
                  </Box>
                  <Skeleton variant="rounded" height={36} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          position: "relative",
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(63, 81, 181, 0.08) 100%)",
          border: "1px solid rgba(63, 81, 181, 0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/unisew.jpg') center/cover",
            opacity: 0.15,
            borderRadius: 3,
            zIndex: -1
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <InventoryIcon style={{ fontSize: 32, marginRight: 16, color: "#3f51b5" }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              fontSize: { xs: "1.5rem", md: "2rem" }
            }}
          >
            Fabric Management
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "#64748b",
            fontSize: "1rem",
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Manage fabric types and pricing for each size. You can add fabrics from the system and set custom prices for each size.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<InfoCircleOutlined />}
            onClick={() => setInfoDialogOpen(true)}
            sx={{ 
              fontSize: "0.875rem",
              px: 2,
              py: 1,
              borderColor: "#3f51b5",
              color: "#3f51b5",
              '&:hover': {
                backgroundColor: "rgba(63, 81, 181, 0.1)",
                borderColor: "#3f51b5"
              }
            }}
          >
            User Guide
          </Button>
        </Box>
      </Box>

      {/* My Fabrics Tab */}
      <MyFabricsTab 
        garmentFabrics={systemFabrics.hasPrice || []}
        sizes={sizes}
        onEditFabric={(fabric) => {
          setSelectedFabric(fabric);
          setFabricPrices(fabric.prices);
          setEditMode(true);
          setOpenAddDialog(true);
        }}
        onDeleteFabric={async (fabricId) => {
          try {
            console.log('Deleting fabric with ID:', fabricId);
            
            // Call delete API
            const response = await deleteGarmentFabric(fabricId);
            console.log('Delete API response:', response);
            
            if (response?.data) {
              enqueueSnackbar('Fabric deleted successfully!', { 
                variant: 'success',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
              });
              // Reload data to get updated fabric list
              loadData();
            } else {
              enqueueSnackbar('Failed to delete fabric', { 
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
              });
            }
          } catch (error) {
            console.error('Error deleting fabric:', error);
            enqueueSnackbar('Error deleting fabric', { 
              variant: 'error',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' }
            });
          }
        }}
        onAddFabric={() => setOpenAddDialog(true)}
      />

      {/* Dialog chọn vải */}
      <FabricSelectionDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setSelectedFabric(null);
          setFabricPrices({});
          setEditMode(false);
        }}
        systemFabrics={systemFabrics}
        garmentFabrics={garmentFabrics}
        sizes={sizes}
        onAddFabric={(newFabric) => {
          if (newFabric === null) {
            // Reload data from API
            loadData();
            showSnackbar('Fabric added successfully!');
          } else if (editMode) {
            setGarmentFabrics(prev => prev.map(f => 
              f.id === newFabric.id ? newFabric : f
            ));
            showSnackbar('Fabric updated successfully!');
          } else {
            setGarmentFabrics(prev => [...prev, newFabric]);
            showSnackbar('Fabric added successfully!');
          }
          setOpenAddDialog(false);
          setSelectedFabric(null);
          setFabricPrices({});
          setEditMode(false);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog hướng dẫn */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Guide</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              "System Fabrics" Tab
            </Typography>
            <Typography variant="body2" paragraph>
              • View all available fabric types in the system
            </Typography>
            <Typography variant="body2" paragraph>
              • Use filters to find fabrics by category (Regular/Physical) and type (Shirt/Pants/Skirt)
            </Typography>
            <Typography variant="body2" paragraph>
              • Click "Add to Store" to add fabrics to your fabric list
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              "My Fabrics" Tab
            </Typography>
            <Typography variant="body2" paragraph>
              • View and manage fabrics you've added to your store
            </Typography>
            <Typography variant="body2" paragraph>
              • Edit fabric prices for each size by clicking the edit icon
            </Typography>
            <Typography variant="body2" paragraph>
              • Remove unnecessary fabrics by clicking the delete icon
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Price Input
            </Typography>
            <Typography variant="body2" paragraph>
              • Required to enter prices for all sizes compatible with the fabric type
            </Typography>
            <Typography variant="body2" paragraph>
              • Shirt fabrics have separate sizes for male and female
            </Typography>
            <Typography variant="body2" paragraph>
              • Pants and skirt fabrics also have gender-specific sizes
            </Typography>
            <Typography variant="body2" paragraph>
              • Prices are displayed in Vietnamese currency format
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="medium" onClick={() => setInfoDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


// Component hiển thị vải của garment
const MyFabricsTab = ({ garmentFabrics, sizes, onEditFabric, onDeleteFabric, onAddFabric }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState(null);

  const filteredFabrics = garmentFabrics.filter(fabric => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase());
    const fabricTypes = getFabricTypesFromFlags(fabric);
    const matchesType = filterType === 'all' || fabricTypes.includes(filterType);
    return matchesSearch && matchesType;
  });

  const getFabricTypeColor = (type) => {
    switch (type) {
      case 'shirt': return 'primary';
      case 'pants': return 'secondary';
      case 'skirt': return 'warning';
      default: return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <Box>
      {/* My Fabrics Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: 3, backgroundColor: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShoppingCartIcon style={{ fontSize: 24, color: "#3f51b5" }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1e293b"
                }}
              >
                My Fabrics
              </Typography>
              <Chip
                label={`${filteredFabrics.length} fabrics`}
                sx={{
                  backgroundColor: "#3f51b515",
                  color: "#3f51b5",
                  fontWeight: 600
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={onAddFabric}
              size="medium"
              sx={{
                backgroundColor: "#3f51b5",
                '&:hover': {
                  backgroundColor: "#2c3e8a"
                }
              }}
            >
              Add Fabric
            </Button>
          </Box>

          {/* Search Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search fabrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined style={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="shirt">Shirt</MenuItem>
                    <MenuItem value="pants">Pants</MenuItem>
                    <MenuItem value="skirt">Skirt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Fabrics Table */}
          {filteredFabrics.length > 0 ? (
            <TableContainer 
              component={Paper}
              sx={{
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                overflow: "hidden"
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Fabric Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Category</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#1e293b" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
            <TableBody>
              {filteredFabrics.map((fabric) => (
                <React.Fragment key={fabric.id}>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {fabric.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fabric.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getFabricTypesFromFlags(fabric).map((type) => (
                          <Chip
                            key={type}
                            label={type === 'shirt' ? 'Shirt' : type === 'pants' ? 'Pants' : type === 'skirt' ? 'Skirt' : 'Unknown'}
                            size="small"
                            color={type === 'shirt' ? 'primary' : type === 'pants' ? 'secondary' : type === 'skirt' ? 'warning' : 'default'}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getFabricCategoriesFromFlags(fabric).map((category) => (
                          <Chip
                            key={category}
                            label={category === 'regular' ? 'Regular' : category === 'physical' ? 'Physical' : 'Unknown'}
                            size="small"
                            color={category === 'regular' ? 'default' : category === 'physical' ? 'success' : 'error'}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => onEditFabric(fabric)}
                      >
                        <EditOutlined />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => {
                          setFabricToDelete(fabric);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 1, backgroundColor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', minWidth: '80px' }}>
                          Price by Size:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                          {fabric.sizes && fabric.sizes
                              .filter((size => size.enumName.includes('FEMALE_')))
                            .sort((a, b) => {
                              const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
                              return sizeOrder.indexOf(a.name) - sizeOrder.indexOf(b.name) ;
                            })
                            .map((size) => (
                            <Box
                              key={size.enumName}
                              sx={{
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '16px',
                                padding: '4px 8px',
                                minWidth: '60px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                {size.name}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem' }}>
                                {formatPrice(size.price)} VND
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
            </TableContainer>
          ) : (
            <Box 
              textAlign="center" 
              py={8}
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #e2e8f0"
              }}
            >
              <InventoryIcon style={{ fontSize: 64, color: "#cbd5e1", marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                No fabrics in your store yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add fabrics from the system to get started
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: "#fef2f2", 
          color: "#dc2626",
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteOutlined />
          Confirm Delete Fabric
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete fabric <strong>"{fabricToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone and will remove all pricing information for this fabric.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            size="medium" 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained"
            size="medium"
            startIcon={<DeleteOutlined />}
            onClick={async () => {
              await onDeleteFabric(fabricToDelete.id);
              setDeleteDialogOpen(false);
              setFabricToDelete(null);
            }}
            sx={{
              backgroundColor: "#dc2626",
              '&:hover': {
                backgroundColor: "#b91c1c"
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


// Component dialog chọn vải với 2 cột
const FabricSelectionDialog = ({ 
  open, 
  onClose, 
  systemFabrics, 
  garmentFabrics, 
  sizes, 
  onAddFabric 
}) => {
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [fabricPrices, setFabricPrices] = useState({});
  const [errors, setErrors] = useState({});
  
  // System Fabrics filters
  const [systemSearchTerm, setSystemSearchTerm] = useState('');
  const [systemFilterCategory, setSystemFilterCategory] = useState('all');
  const [systemFilterType, setSystemFilterType] = useState('all');
  
  // My Fabrics filters
  const [mySearchTerm, setMySearchTerm] = useState('');
  const [myFilterCategory, setMyFilterCategory] = useState('all');
  const [myFilterType, setMyFilterType] = useState('all');
  
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);

  const getAllSystemFabrics = () => {
    const allFabrics = [];
    
    // Non-price fabrics (System Fabrics column)
    if (systemFabrics.nonPrice && Array.isArray(systemFabrics.nonPrice)) {
      systemFabrics.nonPrice.forEach(fabric => {
        allFabrics.push({
          ...fabric,
          type: getFabricTypeFromFlags(fabric), // For backward compatibility
          category: getFabricCategoryFromFlags(fabric), // For backward compatibility
          types: getFabricTypesFromFlags(fabric), // Array of all types
          categories: getFabricCategoriesFromFlags(fabric), // Array of all categories
          // Keep original flags for future reference
          originalFlags: {
            forShirt: fabric.forShirt,
            forPants: fabric.forPants,
            forSkirt: fabric.forSkirt,
            forRegular: fabric.forRegular,
            forPE: fabric.forPE
          }
        });
      });
    }

    return allFabrics;
  };

  const filteredSystemFabrics = getAllSystemFabrics().filter(fabric => {
    const matchesSearch = fabric.name.toLowerCase().includes(systemSearchTerm.toLowerCase()) ||
                         fabric.description.toLowerCase().includes(systemSearchTerm.toLowerCase());
    const fabricCategories = getFabricCategoriesFromFlags(fabric);
    const fabricTypes = getFabricTypesFromFlags(fabric);
    const matchesCategory = systemFilterCategory === 'all' || fabricCategories.includes(systemFilterCategory);
    const matchesType = systemFilterType === 'all' || fabricTypes.includes(systemFilterType);
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddFabric = (fabric) => {
    setSelectedFabric(fabric);
    
    const fabricType = getFabricTypeFromFlags(fabric);
    
    // Khởi tạo giá cho các size phù hợp với loại vải
    const relevantSizes = sizes.filter(size => size.type === fabricType);
    const initialPrices = {};
    relevantSizes.forEach(size => {
      initialPrices[size.enumName] = '';
    });
    setFabricPrices(initialPrices);
    setPriceDialogOpen(true);
  };

  const handlePriceChange = (sizeEnum, value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d]/g, '');
    setFabricPrices(prev => ({
      ...prev,
      [sizeEnum]: numericValue
    }));
  };

  const formatDisplayPrice = (price) => {
    if (!price || price === '') return '';
    const numericPrice = parseInt(price);
    if (isNaN(numericPrice)) return '';
    return numericPrice.toLocaleString('vi-VN');
  };

  const validateForm = () => {
    return Object.keys(fieldErrors).length === 0;
  };

  const showSnackbar = (message, severity = 'success') => {
    // This will be handled by the parent component
    console.log(`${severity.toUpperCase()}: ${message}`);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const fabricType = getFabricTypeFromFlags(selectedFabric);
      
      // Get all unique sizes (grouped by size name only)
      const filteredSizes = sizes.filter(size => size.type === fabricType);
      const sizesToShow = filteredSizes.length > 0 ? filteredSizes : sizes;
      
      const groupedSizes = sizesToShow.reduce((acc, size) => {
        if (!acc[size.size]) {
          acc[size.size] = size;
        }
        return acc;
      }, {});
      
      const relevantSizes = Object.values(groupedSizes);

      // Prepare data for API - only include unique size names with valid prices
      const sizePrices = relevantSizes
        .filter(size => fabricPrices[size.enumName] && fabricPrices[size.enumName] !== '')
        .map(size => ({
          sizeEnumName: size.enumName,
          price: parseInt(fabricPrices[size.enumName])
        }));

      if (sizePrices.length === 0) {
        showSnackbar('Please enter at least one valid price', 'error');
        return;
      }

      const apiData = {
        fabrics: [
          {
            fabricId: selectedFabric.id,
            sizePrices
          }
        ]
      };

      console.log('Sending data to API:', apiData);

      // Call API
      const response = await updateGarmentFabric(apiData);
      console.log('API response:', response);

      if (response?.data) {
        // Show success message
        showSnackbar('Fabric added to store successfully!', 'success');
        
        // Close dialog and reset state
        setPriceDialogOpen(false);
        setSelectedFabric(null);
        setFabricPrices({});
        setErrors({});
        
        // Call parent's onAddFabric to trigger reload
        onAddFabric(null);
      } else {
        showSnackbar('Failed to add fabric to store', 'error');
      }
    } catch (error) {
      console.error('Error adding fabric to store:', error);
      showSnackbar('Error adding fabric to store', 'error');
    }
  };

  const handleClosePriceDialog = () => {
    setPriceDialogOpen(false);
    setSelectedFabric(null);
    setFabricPrices({});
    setErrors({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Memoized validation state
  const validationState = useMemo(() => {
    if (!selectedFabric) return { isValid: false, message: 'Select a Fabric' };
    
    const fabricType = getFabricTypeFromFlags(selectedFabric);
    
    // Get all unique sizes (grouped by size name)
    const filteredSizes = sizes.filter(size => size.type === fabricType);
    const sizesToShow = filteredSizes.length > 0 ? filteredSizes : sizes;
    
    const groupedSizes = sizesToShow.reduce((acc, size) => {
      if (!acc[size.size]) {
        acc[size.size] = size;
      }
      return acc;
    }, {});
    
    const relevantSizes = Object.values(groupedSizes);
    const missingPrices = relevantSizes.filter(size => !fabricPrices[size.enumName] || fabricPrices[size.enumName] === '');
    
    if (missingPrices.length > 0) {
      return { isValid: false, message: 'Complete All Prices' };
    }
    
    // Check if all prices are valid
    for (const size of relevantSizes) {
      const price = fabricPrices[size.enumName];
      const numericPrice = parseInt(price);
      if (price && price !== '') {
        if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice < FABRIC_PRICE_MIN || numericPrice > FABRIC_PRICE_MAX) {
          return { isValid: false, message: 'Fix Invalid Prices' };
        }
      }
    }
    
    return { isValid: true, message: 'Add to Store' };
  }, [selectedFabric, fabricPrices, sizes]);

  // Memoized errors for individual fields
  const fieldErrors = useMemo(() => {
    const newErrors = {};
    if (!selectedFabric) return newErrors;
    
    const fabricType = getFabricTypeFromFlags(selectedFabric);
    
    // Get all unique sizes (grouped by size name)
    const filteredSizes = sizes.filter(size => size.type === fabricType);
    const sizesToShow = filteredSizes.length > 0 ? filteredSizes : sizes;
    
    const groupedSizes = sizesToShow.reduce((acc, size) => {
      if (!acc[size.size]) {
        acc[size.size] = size;
      }
      return acc;
    }, {});
    
    const relevantSizes = Object.values(groupedSizes);
    
    relevantSizes.forEach(size => {
      const price = fabricPrices[size.enumName];
      const numericPrice = parseInt(price);
      
      // Only validate if user has started typing (price is not empty)
      if (price && price !== '') {
        if (isNaN(numericPrice) || numericPrice <= 0) {
          newErrors[size.enumName] = 'Please enter a valid price';
        } else if (numericPrice < FABRIC_PRICE_MIN) {
          newErrors[size.enumName] = `Minimum price is ${FABRIC_PRICE_MIN.toLocaleString('vi-VN')}`;
        } else if (numericPrice > FABRIC_PRICE_MAX) {
          newErrors[size.enumName] = `Maximum price is ${FABRIC_PRICE_MAX.toLocaleString('vi-VN')}`;
        }
      }
    });
    
    return newErrors;
  }, [selectedFabric, fabricPrices, sizes]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: "#f8fafc", 
        borderBottom: "1px solid #e2e8f0",
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingIcon style={{ fontSize: 24, color: "#3f51b5" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Add Fabric to Store
          </Typography>
        </Box>
        <Button 
          onClick={onClose} 
          size="small"
          sx={{ 
            color: "#64748b",
            '&:hover': {
              backgroundColor: "rgba(100, 116, 139, 0.1)"
            }
          }}
        >
          Close
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '70vh', mt: 1 }}>
          {/* Cột trái: System Fabrics */}
          <Box sx={{ flex: 1, p: 3, borderRight: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom>
              System Fabrics
            </Typography>
            
            {/* Bộ lọc */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search fabrics..."
                value={systemSearchTerm}
                onChange={(e) => setSystemSearchTerm(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={systemFilterCategory}
                    onChange={(e) => setSystemFilterCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="physical">Physical</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={systemFilterType}
                    onChange={(e) => setSystemFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="shirt">Shirt</MenuItem>
                    <MenuItem value="pants">Pants</MenuItem>
                    <MenuItem value="skirt">Skirt</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Bảng System Fabrics */}
            <TableContainer component={Paper} sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSystemFabrics.map((fabric) => (
                    <TableRow key={`${fabric.category}-${fabric.type}-${fabric.id}`} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {fabric.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fabric.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {getFabricTypesFromFlags(fabric).map((type) => (
                            <Chip
                              key={type}
                              label={type === 'shirt' ? 'Shirt' : type === 'pants' ? 'Pants' : type === 'skirt' ? 'Skirt' : 'Unknown'}
                              size="small"
                              color={type === 'shirt' ? 'primary' : type === 'pants' ? 'secondary' : type === 'skirt' ? 'warning' : 'default'}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {getFabricCategoriesFromFlags(fabric).map((category) => (
                            <Chip
                              key={category}
                              label={category === 'regular' ? 'Regular' : category === 'physical' ? 'Physical' : 'Unknown'}
                              size="small"
                              color={category === 'regular' ? 'default' : category === 'physical' ? 'success' : 'error'}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlusOutlined />}
                          onClick={() => handleAddFabric(fabric)}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Cột phải: My Fabrics */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Fabrics
            </Typography>
            
            {/* Bộ lọc cho My Fabrics */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search my fabrics..."
                value={mySearchTerm}
                onChange={(e) => setMySearchTerm(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={myFilterCategory}
                    onChange={(e) => setMyFilterCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="physical">Physical</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={myFilterType}
                    onChange={(e) => setMyFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="shirt">Shirt</MenuItem>
                    <MenuItem value="pants">Pants</MenuItem>
                    <MenuItem value="skirt">Skirt</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // Get fabrics from hasPrice array (My Fabrics)
                    const myFabrics = systemFabrics.hasPrice && Array.isArray(systemFabrics.hasPrice) 
                      ? systemFabrics.hasPrice.map(fabric => ({
                          ...fabric,
                          type: getFabricTypeFromFlags(fabric), // For backward compatibility
                          category: getFabricCategoryFromFlags(fabric), // For backward compatibility
                          types: getFabricTypesFromFlags(fabric), // Array of all types
                          categories: getFabricCategoriesFromFlags(fabric), // Array of all categories
                          prices: fabric.sizes ? fabric.sizes.reduce((acc, size) => {
                            acc[size.enumName] = size.price;
                            return acc;
                          }, {}) : {},
                          // Keep original flags for future reference
                          originalFlags: {
                            forShirt: fabric.forShirt,
                            forPants: fabric.forPants,
                            forSkirt: fabric.forSkirt,
                            forRegular: fabric.forRegular,
                            forPE: fabric.forPE
                          }
                        }))
                      : [];
                    
                    return myFabrics
                      .filter(fabric => {
                        const matchesSearch = fabric.name.toLowerCase().includes(mySearchTerm.toLowerCase()) ||
                                             fabric.description.toLowerCase().includes(mySearchTerm.toLowerCase());
                        const fabricCategories = getFabricCategoriesFromFlags(fabric);
                        const fabricTypes = getFabricTypesFromFlags(fabric);
                        const matchesCategory = myFilterCategory === 'all' || fabricCategories.includes(myFilterCategory);
                        const matchesType = myFilterType === 'all' || fabricTypes.includes(myFilterType);
                        return matchesSearch && matchesCategory && matchesType;
                      })
                      .map((fabric) => (
                    <React.Fragment key={fabric.id}>
                      <TableRow hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {fabric.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fabric.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {getFabricTypesFromFlags(fabric).map((type) => (
                              <Chip
                                key={type}
                                label={type === 'shirt' ? 'Shirt' : type === 'pants' ? 'Pants' : type === 'skirt' ? 'Skirt' : 'Unknown'}
                                size="small"
                                color={type === 'shirt' ? 'primary' : type === 'pants' ? 'secondary' : type === 'skirt' ? 'warning' : 'default'}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {getFabricCategoriesFromFlags(fabric).map((category) => (
                              <Chip
                                key={category}
                                label={category === 'regular' ? 'Regular' : category === 'physical' ? 'Physical' : 'Unknown'}
                                size="small"
                                color={category === 'regular' ? 'default' : category === 'physical' ? 'success' : 'error'}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} sx={{ py: 1, backgroundColor: '#f8fafc' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', minWidth: '80px' }}>
                              Prices:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                              {fabric.sizes && fabric.sizes
                                .sort((a, b) => {
                                  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
                                  return sizeOrder.indexOf(a.name) - sizeOrder.indexOf(b.name);
                                })
                                .map((size) => (
                                <Box
                                  key={size.enumName}
                                  sx={{
                                    backgroundColor: '#f0f9ff',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '12px',
                                    padding: '3px 6px',
                                    minWidth: '50px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1px'
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                                    {size.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                    {formatPrice(size.price)} VND
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                      ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>

      {/* Dialog nhập giá fabric */}
      <Dialog
        open={priceDialogOpen}
        onClose={handleClosePriceDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: "#f0f9ff", 
          borderBottom: "1px solid #e2e8f0",
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon style={{ fontSize: 24, color: "#0ea5e9" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Set Prices for: {selectedFabric?.name}
            </Typography>
          </Box>
          <Button 
            onClick={handleClosePriceDialog} 
            size="small"
            sx={{ 
              color: "#64748b",
              '&:hover': {
                backgroundColor: "rgba(100, 116, 139, 0.1)"
              }
            }}
          >
            Close
          </Button>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedFabric?.description}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#dc2626' }}>
              ⚠️ Enter prices for ALL sizes (Required)
            </Typography>
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: 400, 
                overflow: 'auto',
                borderRadius: 2,
                border: "1px solid #e2e8f0"
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Height Range (cm)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Weight Range (kg)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Price (VND)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const fabricType = getFabricTypeFromFlags(selectedFabric || {});
                    
                    const filteredSizes = sizes.filter(size => size.type === fabricType);
                    const sizesToShow = filteredSizes.length > 0 ? filteredSizes : sizes;
                    
                    // Group sizes by size name only
                    const groupedSizes = sizesToShow.reduce((acc, size) => {
                      if (!acc[size.size]) {
                        acc[size.size] = size;
                      }
                      return acc;
                    }, {});
                    
                    return Object.values(groupedSizes).map((size) => (
                      <TableRow key={size.enumName}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {size.size}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {size.minHeight} - {size.maxHeight} cm
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {size.minWeight} - {size.maxWeight} kg
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            value={formatDisplayPrice(fabricPrices[size.enumName])}
                            onChange={(e) => handlePriceChange(size.enumName, e.target.value)}
                            error={!!fieldErrors[size.enumName]}
                            helperText={fieldErrors[size.enumName] || (fabricPrices[size.enumName] ? `Range: ${FABRIC_PRICE_MIN.toLocaleString('vi-VN')} - ${FABRIC_PRICE_MAX.toLocaleString('vi-VN')}` : `Required: ${FABRIC_PRICE_MIN.toLocaleString('vi-VN')} - ${FABRIC_PRICE_MAX.toLocaleString('vi-VN')}`)}
                            size="small"
                            placeholder="Enter price..."
                            InputProps={{
                              endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-error': {
                                  '& fieldset': {
                                    borderColor: '#dc2626',
                                    borderWidth: 2,
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#dc2626',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#dc2626',
                                  },
                                },
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          gap: 1
        }}>
          <Button 
            onClick={handleClosePriceDialog}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!validationState.isValid}
            startIcon={<PlusOutlined />}
            sx={{
              backgroundColor: "#3f51b5",
              '&:hover': {
                backgroundColor: "#2c3e8a"
              },
              '&:disabled': {
                backgroundColor: "#cbd5e1",
                color: "#94a3b8"
              }
            }}
          >
            {validationState.message}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FabricManagement;
