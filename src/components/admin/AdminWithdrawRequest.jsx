
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {Box, Chip, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert} from '@mui/material';
import {Table} from 'antd';
import {DollarOutlined, CheckCircleOutlined, UploadOutlined, CloseCircleOutlined} from '@ant-design/icons';
import {getAllWithdrawRequest, getAllBanks, createQR, updateWithdrawRequestStatus} from '../../services/AccountService.jsx';
import {uploadCloudinary} from '../../services/UploadImageService.jsx';
import {parseID} from '../../utils/ParseIDUtil.jsx';
import {formatDateTimeSecond} from '../../utils/TimestampUtil.jsx';
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

export default function AdminWithdrawRequest() {
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openQRDialog, setOpenQRDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [qrDataURL, setQrDataURL] = useState('');
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [banks, setBanks] = useState([]);
    const [evidenceImage, setEvidenceImage] = useState(null);
    const [evidenceImagePreview, setEvidenceImagePreview] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const fetchWithdrawRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllWithdrawRequest();
            const data = response?.data?.body || [];
            setWithdrawRequests(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load withdraw requests', e);
            setError('Failed to load withdraw requests');
            setWithdrawRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBanks = useCallback(async () => {
        try {
            const response = await getAllBanks();
            const data = response?.data?.body || response?.data?.data || response?.data || [];
            setBanks(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load banks', e);
        }
    }, []);

    useEffect(() => {
        fetchWithdrawRequests();
        fetchBanks();
    }, [fetchWithdrawRequests, fetchBanks]);

    const handleApproveRequest = async (record) => {
        setSelectedRequest(record);
        setOpenQRDialog(true);
        
        // Auto generate QR code when opening dialog
        try {
            setIsGeneratingQR(true);
            
            // Ensure banks are loaded first
            let currentBanks = banks;
            if (currentBanks.length === 0) {
                console.log('Banks not loaded yet, fetching...');
                try {
                    const response = await getAllBanks();
                    const data = response?.data?.body || response?.data?.data || response?.data || [];
                    currentBanks = Array.isArray(data) ? data : [];
                    console.log('Fetched banks:', currentBanks);
                } catch (e) {
                    console.error('Failed to load banks, using fallback', e);
                    // Fallback banks data
                    currentBanks = [
                        { code: 'TPB', name: 'Tien Phong Commercial Joint Stock Bank', bin: '970423' },
                        { code: 'VCB', name: 'Vietcombank', bin: '970436' },
                        { code: 'BID', name: 'Bank for Investment and Development of Vietnam', bin: '970418' },
                        { code: 'CTG', name: 'VietinBank', bin: '970415' },
                        { code: 'MBB', name: 'Military Commercial Joint Stock Bank', bin: '970422' },
                        { code: 'ACB', name: 'Asia Commercial Bank', bin: '970416' },
                        { code: 'VIB', name: 'Vietnam International Commercial Joint Stock Bank', bin: '970441' },
                        { code: 'TCB', name: 'Techcombank', bin: '970407' },
                        { code: 'HDB', name: 'HDBank', bin: '970437' },
                        { code: 'VPB', name: 'VPBank', bin: '970432' }
                    ];
                }
            }
            
            // Find bank info by code
            const bankCode = record.account?.code;
            console.log('Looking for bank with code:', bankCode);
            console.log('Available banks:', currentBanks);
            
            const bank = currentBanks.find(b => b.code === bankCode);
            
            if (!bank) {
                console.log('Bank not found for code:', bankCode);
                enqueueSnackbar(`Bank information not found for code: ${bankCode}`, {variant: 'error'});
                return;
            }
            
            console.log('Found bank:', bank);

            const qrData = {
                accountNo: record.account?.accountNo,
                accountName: bank.name,
                acqId: parseInt(bank.bin),
                amount: record.withdrawAmount,
                addInfo: "Withdraw from Unisew",
                format: "text",
                template: "print"
            };

            console.log('QR Data to send:', qrData);
            
            const response = await createQR(qrData);
            
            console.log('createQR API Response:', response);
            console.log('QR Data sent:', qrData);
            
            if (response && response.data) {
                console.log('Response data:', response.data);
                setQrCode(response.data.data.qrCode || '');
                setQrDataURL(response.data.data.qrDataURL || '');
                enqueueSnackbar('QR code generated successfully!', {variant: 'success'});
            } else {
                console.log('No data in response');
                enqueueSnackbar('Failed to generate QR code', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            enqueueSnackbar('Error generating QR code', {variant: 'error'});
        } finally {
            setIsGeneratingQR(false);
        }
    };

    const handleCloseQRDialog = () => {
        setOpenQRDialog(false);
        setSelectedRequest(null);
        setQrCode('');
        setQrDataURL('');
        setEvidenceImage(null);
        setEvidenceImagePreview('');
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setEvidenceImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setEvidenceImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmTransfer = async (decision = 'approve') => {
        if (decision === 'approve' && !evidenceImage) {
            enqueueSnackbar('Please upload evidence image', {variant: 'error'});
            return;
        }

        try {
            setIsConfirming(true);
            
            const data = {
                withdrawId: selectedRequest.id,
                approved: decision === 'approve',
                evidenceImage: decision === 'approve' ? null : null // Will be set below if approved
            };

            if (decision === 'approve') {
                // Upload image to Cloudinary for approved requests
                try {
                    const uploadResponse = await uploadCloudinary(evidenceImage);
                    console.log('Upload response:', uploadResponse);
                    
                    if (uploadResponse) {
                        data.evidenceImage = uploadResponse; // uploadCloudinary returns URL directly
                    } else {
                        enqueueSnackbar('Failed to upload evidence image', {variant: 'error'});
                        return;
                    }
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    enqueueSnackbar('Failed to upload evidence image', {variant: 'error'});
                    return;
                }
                
                const response = await updateWithdrawRequestStatus(data);
                
                if (response && response.data) {
                    enqueueSnackbar('Transfer confirmed successfully!', {variant: 'success'});
                    handleCloseQRDialog();
                    fetchWithdrawRequests(); // Refresh the list
                } else {
                    enqueueSnackbar('Failed to confirm transfer', {variant: 'error'});
                }
            } else {
                // For rejected requests, no evidence image needed
                const response = await updateWithdrawRequestStatus(data);
                
                if (response && response.data) {
                    enqueueSnackbar('Withdraw request rejected successfully!', {variant: 'success'});
                    handleCloseQRDialog();
                    fetchWithdrawRequests(); // Refresh the list
                } else {
                    enqueueSnackbar('Failed to reject request', {variant: 'error'});
                }
            }
        } catch (error) {
            console.error('Error processing request:', error);
            enqueueSnackbar(`Error ${decision === 'approve' ? 'confirming' : 'rejecting'} request`, {variant: 'error'});
        } finally {
            setIsConfirming(false);
        }
    };


    const columns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 250,
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
            title: 'Requested By',
            key: 'requestedBy',
            width: 200,
            render: (val, record) => {
                const account = record?.account;
                if (!account) return '—';
                
                return (
                    <Box>
                        <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b', mb: 0.5}}>
                            {account.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b'}}>
                            {account.email || 'No email'}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            title: 'Amount',
            dataIndex: 'withdrawAmount',
            key: 'withdrawAmount',
            width: 200,
            align: 'right',
            sorter: (a, b) => (a.withdrawAmount || 0) - (b.withdrawAmount || 0),
            render: (val, record) => {
                const getAmountColor = (status) => {
                    switch (status) {
                        case 'pending':
                            return '#1f2937'; // Màu đen
                        case 'approve':
                        case 'completed':
                            return '#16a34a'; // Màu xanh lá
                        case 'rejecte':
                            return '#dc2626'; // Màu đỏ
                        case 'processing':
                            return '#1e40af'; // Màu xanh dương
                        default:
                            return '#dc2626'; // Màu đỏ mặc định
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
            width: 200,
            filters: [
                {text: 'Pending', value: 'pending'},
                {text: 'Approved', value: 'approve'},
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
            width: 200,
            sorter: (a, b) => new Date(a.creationDate) - new Date(b.creationDate),
            render: (val) => (
                <Typography variant="body2" sx={{color: '#64748b'}}>
                    {formatDateTimeSecond(val)}
                </Typography>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (val, record) => {
                if (record.status === 'pending') {
                    return (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircleOutlined/>}
                            onClick={() => handleApproveRequest(record)}
                            sx={{
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
                                },
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '12px'
                            }}
                        >
                            Approve
                        </Button>
                    );
                }
                
                // For non-pending status, show disabled button with status text
                return (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleOutlined/>}
                        disabled
                        sx={{
                            background: '#e2e8f0',
                            color: '#9ca3af',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '12px',
                            cursor: 'not-allowed'
                        }}
                    >
                        {record.status === 'approved' ? 'Approved' :
                         record.status === 'rejected' ? 'Rejected' :
                         record.status === 'completed' ? 'Completed' : 'Processing'}
                    </Button>
                );
            }
        },
    ], []);

    return (
        <Box sx={{height: '100%', overflowY: 'auto'}}>
            <Box sx={{
                mb: 4,
                position: 'relative',
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(14, 116, 144, 0.08) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.1)'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <DollarOutlined style={{fontSize: 28, color: '#06b6d4', marginRight: 8}}/>
                    <Typography variant="h4" sx={{fontWeight: 700, color: '#1e293b'}}>
                        Withdraw Requests
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{color: '#64748b'}}>
                    Manage all withdraw requests from users.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                <Box sx={{p: 3, backgroundColor: 'white'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                            Withdraw Request List
                        </Typography>
                        <Chip
                            icon={<DollarOutlined/>}
                            label={`${Array.isArray(withdrawRequests) ? withdrawRequests.length : 0} Requests`}
                            sx={{backgroundColor: '#f0f9ff', color: '#0369a1', fontWeight: 600}}
                        />
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

            {/* QR Code Dialog */}
            <Dialog
                open={openQRDialog}
                onClose={handleCloseQRDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                }}>
                    Approve Withdraw Request
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    {selectedRequest && (
                        <Box>
                            <Alert severity="info" sx={{mb: 3, mt: 2}}>
                                QR code has been generated for bank transfer. Scan the QR code below to complete the transfer.
                            </Alert>

                            {isGeneratingQR ? (
                                <Box sx={{textAlign: 'center', mt: 3, py: 4}}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#06b6d4'}}>
                                        Generating QR Code...
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '200px',
                                        border: '2px dashed #06b6d4',
                                        borderRadius: 2,
                                        backgroundColor: '#f0f9ff'
                                    }}>
                                        <Typography variant="body1" sx={{color: '#64748b'}}>
                                            Please wait while we generate the QR code...
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : qrDataURL ? (
                                <Box sx={{textAlign: 'center', mt: 3}}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        p: 3,
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <img 
                                            src={qrDataURL} 
                                            alt="QR Code" 
                                            style={{ 
                                                maxWidth: '700px', 
                                                maxHeight: '700px',
                                                width: '700px',
                                                height: '700px',
                                                objectFit: 'contain'
                                            }} 
                                        />
                                    </Box>
                                    
                                    {/* Evidence Image Upload */}
                                    <Box sx={{mt: 4, p: 3, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#f8f9fa'}}>
                                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2, color: '#1e293b'}}>
                                            Upload Evidence Image
                                        </Typography>
                                        <Typography variant="body2" sx={{color: '#64748b', mb: 2}}>
                                            Please upload a screenshot or photo of the completed bank transfer as evidence.
                                        </Typography>
                                        
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="evidence-upload"
                                            type="file"
                                            onChange={handleImageChange}
                                        />
                                        <label htmlFor="evidence-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<UploadOutlined />}
                                                sx={{
                                                    borderColor: '#06b6d4',
                                                    color: '#06b6d4',
                                                    '&:hover': {
                                                        borderColor: '#0e7490',
                                                        backgroundColor: '#f0f9ff'
                                                    },
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    px: 3
                                                }}
                                            >
                                                Choose Evidence Image
                                            </Button>
                                        </label>
                                        
                                        {evidenceImagePreview && (
                                            <Box sx={{mt: 2}}>
                                                <Typography variant="body2" sx={{fontWeight: 600, mb: 1}}>
                                                    Preview:
                                                </Typography>
                                                <img 
                                                    src={evidenceImagePreview} 
                                                    alt="Evidence Preview" 
                                                    style={{ 
                                                        maxWidth: '200px', 
                                                        maxHeight: '200px',
                                                        width: 'auto',
                                                        height: 'auto',
                                                        objectFit: 'contain',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px'
                                                    }} 
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ) : null}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{p: 3, gap: 1}}>
                    <Button
                        onClick={handleCloseQRDialog}
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
                    {qrDataURL && (
                        <>
                            <Button
                                onClick={() => handleConfirmTransfer('rejected')}
                                variant="outlined"
                                disabled={isConfirming}
                                startIcon={<CloseCircleOutlined />}
                                sx={{
                                    borderColor: '#dc2626',
                                    color: '#dc2626',
                                    '&:hover': {
                                        borderColor: '#b91c1c',
                                        backgroundColor: '#fef2f2'
                                    },
                                    '&:disabled': {
                                        borderColor: '#e2e8f0',
                                        color: '#9ca3af'
                                    },
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                {isConfirming ? 'Rejecting...' : 'Reject Request'}
                            </Button>
                            <Button
                                onClick={() => handleConfirmTransfer('approve')}
                                variant="contained"
                                disabled={!evidenceImage || isConfirming}
                                startIcon={<CheckCircleOutlined />}
                                sx={{
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
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
                                {isConfirming ? 'Confirming...' : 'Approve Transfer'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}