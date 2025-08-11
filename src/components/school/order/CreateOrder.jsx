import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card as MuiCard,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CalendarToday as CalendarIcon, Info as InfoIcon } from '@mui/icons-material';
import { DatePicker } from 'antd';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import { getSchoolDesign } from '../../../services/DesignService.jsx';
import { getSizes, createOrder } from '../../../services/OrderService.jsx';

export default function CreateOrder() {
  const [schoolDesigns, setSchoolDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [deadline, setDeadline] = useState(null); // dayjs value
  const [sizes, setSizes] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Fetch school designs from API
  const fetchSchoolDesigns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSchoolDesign();
      if (response && response.status === 200) {
        setSchoolDesigns(response.data.body || []);
      } else {
        setError('Failed to fetch school designs');
      }
    } catch (err) {
      console.error('Error fetching school designs:', err);
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
        setSizes(response.data.body || []);
      }
    } catch (err) {
      console.error('Error fetching sizes:', err);
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
    setOrderNote('');
    setValidationErrors({});

    const found = schoolDesigns.find((d) => d.id === designId);
    setSelectedDesign(found || null);
  };

  const handleDeadlineChange = (value) => {
    setDeadline(value);
    if (value && validationErrors.deadline) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.deadline;
        return next;
      });
    }
  };

  // Validate order data
  const validateOrder = () => {
    const errors = {};
    if (!deadline) {
      errors.deadline = 'Please select a delivery deadline';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Build orderDetails (minimal placeholder to keep API shape valid)
  const buildOrderDetails = () => {
    // If design has deliveryItems, create a minimal order detail with quantity 1 and default size (first available size)
    if (!selectedDesign?.delivery?.designItems?.length) return [];
    const firstDeliveryItem = selectedDesign.delivery.designItems[0];

    // Try map to enumName if possible, else fallback to 'S'
    const defaultSizeLabel = 'S';
    const gender = firstDeliveryItem?.designItem?.gender === 'boy' ? 'male' : 'female';
    const type = firstDeliveryItem?.designItem?.type || 'shirt';
    const matchedSize = sizes.find(
      (s) => s.gender === gender && s.type === type && s.size === defaultSizeLabel
    );

    return [
      {
        deliveryItemId: firstDeliveryItem?.id || 0,
        size: matchedSize?.enumName || defaultSizeLabel,
        quantity: 1,
      },
    ];
  };

  const handleCreateOrder = async () => {
    if (!validateOrder()) return;
    if (!selectedDesign) {
      enqueueSnackbar('Please select a design', { variant: 'warning' });
      return;
    }

    try {
      setIsCreatingOrder(true);

      const orderData = {
        deliveryId: selectedDesign.delivery.id,
        deadline: deadline.format('YYYY-MM-DD'),
        note: orderNote || '',
        orderDetails: buildOrderDetails(),
      };

      const response = await createOrder(orderData);
      if (response && (response.status === 200 || response.status === 201)) {
        enqueueSnackbar('Order created successfully!', { variant: 'success' });
        // Reset form
        setSelectedDesignId('');
        setSelectedDesign(null);
        setDeadline(null);
        setOrderNote('');
        setValidationErrors({});
      } else {
        enqueueSnackbar('Failed to create order. Please try again.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      enqueueSnackbar('An error occurred while creating the order. Please try again.', {
        variant: 'error',
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#1976d2', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading designs...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const minDate = dayjs().add(14, 'day').startOf('day');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {schoolDesigns.length === 0 ? (
        <MuiCard sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 1, color: '#666', fontWeight: 600 }}>
              No Designs Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please complete a design request first before creating an order.
            </Typography>
          </CardContent>
        </MuiCard>
      ) : (
        <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Step 1: Select Design */}
          <MuiCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Step 1: Select Your Design
              </Typography>
              <FormControl sx={{ minWidth: 350 }}>
                <Select id="design-select" value={selectedDesignId} onChange={handleDesignSelect} displayEmpty>
                  <MenuItem value="" disabled>
                    <em>Select a design</em>
                  </MenuItem>
                  {schoolDesigns.map((design) => (
                    <MenuItem key={design.id} value={design.id}>
                      {design?.delivery?.designRequest?.name || 'Unnamed Design'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </MuiCard>

          {/* Step 2: Deadline */}
          {selectedDesignId && (
            <MuiCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Step 2: Set Delivery Deadline
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <CalendarIcon sx={{ color: '#1976d2' }} />
                  <DatePicker
                    value={deadline}
                    onChange={handleDeadlineChange}
                    placeholder="Select delivery date (minimum 2 weeks from today)"
                    format="DD/MM/YYYY"
                    style={{ width: 280, height: 46 }}
                    disabledDate={(current) => current && current < minDate}
                    status={validationErrors.deadline ? 'error' : ''}
                  />
                </Box>
                {validationErrors.deadline && (
                  <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                    {validationErrors.deadline}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', mt: 1 }}>
                  * Minimum delivery time is 2 weeks from today ({minDate.format('DD/MM/YYYY')})
                </Typography>
              </CardContent>
            </MuiCard>
          )}

          {/* Step 3: Note */}
          {selectedDesignId && (
            <MuiCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <InfoIcon sx={{ color: '#f57c00' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Step 3: Additional Notes (Optional)
                  </Typography>
                </Box>
                <TextField
                  multiline
                  rows={4}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Enter any additional notes or special requirements for your order..."
                  fullWidth
                />
              </CardContent>
            </MuiCard>
          )}

          {/* Create Order Button */}
          {selectedDesignId && (
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateOrder}
                disabled={!deadline || isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Creating Order...
                  </>
                ) : (
                  'Create Order'
                )}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}