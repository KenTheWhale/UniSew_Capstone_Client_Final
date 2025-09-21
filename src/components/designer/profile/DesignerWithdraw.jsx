import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {Box, Chip, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert} from '@mui/material';
import {Table} from 'antd';
import {DollarOutlined, PlusOutlined} from '@ant-design/icons';
import {getWithdrawRequests, createWithdrawRequest} from '../../../services/AccountService.jsx';
import {parseID} from '../../../utils/ParseIDUtil.jsx';
import {formatDateTimeSecond} from '../../../utils/TimestampUtil.jsx';
import {useSnackbar} from 'notistack';

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' VND';
}

const statusLabel = (status) => ({
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    completed: 'Completed'
}[status] || status);

const statusColor = (status) => ({
    pending: { bg: '#fef3c7', color: '#92400e' },
    approved: { bg: '#dcfce7', color: '#166534' },
    rejected: { bg: '#fee2e2', color: '#dc2626' },
    processing: { bg: '#dbeafe', color: '#1e40af' },
    completed: { bg: '#dcfce7', color: '#166534' }
}[status] || { bg: '#f3f4f6', color: '#374151' });

export default function DesignerWithdraw() {
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const fetchWithdrawRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getWithdrawRequests();
            const data = response?.data?.body || response?.data?.data || response?.data || [];
            setWithdrawRequests(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load withdraw requests', e);
            setError('Failed to load withdraw requests');
            setWithdrawRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWithdrawRequests();
    }, [fetchWithdrawRequests]);

    const handleCreateWithdraw = () => {
        setOpenDialog(true);
        setWithdrawAmount('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setWithdrawAmount('');
    };

    const formatNumberInput = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (e) => {
        const formatted = formatNumberInput(e.target.value);
        setWithdrawAmount(formatted);
    };

    const getNumericValue = (value) => {
        return parseInt(value.replace(/\./g, '')) || 0;
    };

    const handleSubmitWithdraw = async () => {
        const numericAmount = getNumericValue(withdrawAmount);
        if (!withdrawAmount || numericAmount <= 0) {
            enqueueSnackbar('Please enter a valid amount', {variant: 'error'});
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await createWithdrawRequest({
                withdrawAmount: numericAmount
            });

            if (response && response.status === 200) {
                enqueueSnackbar('Withdraw request created successfully!', {variant: 'success'});
                handleCloseDialog();
                fetchWithdrawRequests();
            } else {
                enqueueSnackbar('Failed to create withdraw request', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error creating withdraw request:', error);
            enqueueSnackbar('Error creating withdraw request', {variant: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 50,
            render: (val) => {
                if (!val || val === 0) return '—';
                return (
                    <Chip
                        label={parseID(val, 'wdr')}
                        size="small"
                        sx={{backgroundColor: '#eef2ff', color: '#3730a3', fontWeight: 600}}
                    />
                );
            }
        },
        {
            title: 'Amount',
            dataIndex: 'withdrawAmount',
            key: 'withdrawAmount',
            align: 'right',
            sorter: (a, b) => (a.withdrawAmount || 0) - (b.withdrawAmount || 0),
            render: (val, record) => {
                const getAmountColor = (status) => {
                    switch (status) {
                        case 'pending':
                            return '#1f2937';
                        case 'approved':
                        case 'completed':
                            return '#16a34a';
                        case 'rejected':
                            return '#dc2626';
                        case 'processing':
                            return '#1e40af';
                        default:
                            return '#dc2626';
                    }
                };

                return (
                    <Typography variant="body2" sx={{fontWeight: 700, color: getAmountColor(record.status)}}>
                        {formatCurrency(val || 0)}
                    </Typography>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                {text: 'Pending', value: 'pending'},
                {text: 'Approved', value: 'approved'},
                {text: 'Rejected', value: 'rejected'},
                {text: 'Processing', value: 'processing'},
                {text: 'Completed', value: 'completed'},
            ],
            onFilter: (value, record) => record.status === value,
            render: (val) => {
                const colors = statusColor(val);
                return (
                    <Chip
                        label={statusLabel(val)}
                        size="small"
                        sx={{
                            backgroundColor: colors.bg,
                            color: colors.color,
                            fontWeight: 600,
                            fontSize: '11px'
                        }}
                    />
                );
            }
        },
        {
            title: 'Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (val) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDateTimeSecond(val)}
                </Typography>
            )
        },
    ], []);

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
            <Box sx={{
                mb: 4,
                position: 'relative',
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <DollarOutlined style={{fontSize: 28, color: '#2e7d32', marginRight: 8}}/>
                    <Typography variant="h4" sx={{fontWeight: 700, color: '#1e293b'}}>
                        Withdraw Requests
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{color: '#64748b'}}>
                    Review your withdraw request history.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                <Box sx={{p: 3, backgroundColor: 'white'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                            Withdraw Request List
                        </Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Chip
                                icon={<DollarOutlined/>}
                                label={`${Array.isArray(withdrawRequests) ? withdrawRequests.length : 0} Requests`}
                                sx={{backgroundColor: '#f0f9ff', color: '#0369a1', fontWeight: 600}}
                            />
                            <Button
                                variant="contained"
                                startIcon={<PlusOutlined/>}
                                onClick={handleCreateWithdraw}
                                sx={{
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                                    },
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Create Withdraw Request
                            </Button>
                        </Box>
                    </Box>

                    <Table
                        columns={columns}
                        dataSource={withdrawRequests}
                        rowKey={(r) => r.id}
                        loading={loading}
                        pagination={{
                            defaultPageSize: 10,
                            pageSizeOptions: ['10', '20', '50'],
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} requests`,
                            style: {marginTop: 16}
                        }}
                        scroll={{x: 'max-content'}}
                        style={{backgroundColor: 'white', borderRadius: '8px'}}
                    />
                </Box>
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                }}>
                    Create Withdraw Request
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    <Alert severity="info" sx={{mb: 3, mt: 2}}>
                        Enter the amount you want to withdraw from your account. The request will be reviewed by our team.
                    </Alert>
                    <TextField
                        fullWidth
                        label="Withdraw Amount (VND)"
                        value={withdrawAmount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount in VND (e.g., 1.000.000)"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                    borderColor: '#2e7d32',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2e7d32',
                                },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#2e7d32',
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <Typography sx={{mr: 1, color: '#64748b', fontWeight: 600}}>
                                    VND
                                </Typography>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{p: 3, gap: 1}}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitWithdraw}
                        variant="contained"
                        disabled={isSubmitting || !withdrawAmount || getNumericValue(withdrawAmount) <= 0}
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                            },
                            '&:disabled': {
                                background: '#e2e8f0',
                                color: '#9ca3af'
                            },
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
