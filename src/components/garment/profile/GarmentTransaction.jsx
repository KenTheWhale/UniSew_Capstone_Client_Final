import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Button, Card, CardContent, Chip, Paper, Tooltip, Typography} from '@mui/material';
import {Table} from 'antd';
import {CheckOutlined, DollarOutlined, StopOutlined} from '@ant-design/icons';
import {AccountBalanceWallet, CreditScore, PictureAsPdf} from '@mui/icons-material';
import {GrDocumentCsv} from "react-icons/gr";
import {getTransactionsForOne} from '../../../services/PaymentService.jsx';
import {parseID} from '../../../utils/ParseIDUtil.jsx';
import {formatDateTimeSecond} from '../../../utils/TimestampUtil.jsx';
import {CSVLink} from "react-csv";
import {
    filename,
    garmentCsvData,
    garmentCsvHeaders,
    garmentPDFBody,
    garmentPDFHeader,
    handleDownloadPdf,
    mapToCsvRows
} from "../../ui/DownloadFile.jsx";

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' VND';
}

const formatCompactCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

const StatCard = React.memo(({icon, value, label, color, bgColor}) => (
    <Card
        sx={{
            height: '100%',
            background: bgColor || `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
            border: `1px solid ${color}20`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${color}25`
            },
            minWidth: 0,
        }}
    >
        <CardContent sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Box sx={{minWidth: 0, flex: 1, mr: 1}}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: color,
                            mb: 0.5,
                            fontSize: {xs: '0.9rem', sm: '1.1rem'},
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={value}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: {xs: '0.75rem', sm: '0.875rem'},
                            lineHeight: 1.2
                        }}
                    >
                        {label}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: `${color}10`,
                        color: color,
                        flexShrink: 0
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
));

const paymentTypeLabel = (type) => ({
    design: 'Design',
    deposit: 'Deposit',
    order: 'Order',
    order_return: 'Refund',
    design_return: 'Refund',
    wallet: 'Top-up'
}[type] || type);

export default function GarmentTransaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTransactionsForOne();
            const data = response?.data?.body || response?.data?.data || response?.data || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (e) {
            setTransactions([]);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const stats = useMemo(() => {
        if (!Array.isArray(transactions)) {
            return {total: 0, success: 0, failed: 0, pending: 0, totalAmount: 0, totalFees: 0};
        }
        const total = transactions.length;
        const success = transactions.filter(t => t.status === 'success').length;
        const failed = transactions.filter(t => t.status === 'fail' || t.status === 'failed').length;
        const pending = transactions.filter(t => t.status === 'pending').length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalFees = transactions.reduce((sum, t) => sum + (t.serviceFee || 0), 0);

        return {total, success, failed, pending, totalAmount, totalFees};
    }, [transactions]);

    function formatDateTime(d) {
        const date = new Date(d);
        const time = date.toLocaleTimeString("vi-VN", {hour12: false}); // 07:00:00
        const day = date.toLocaleDateString("vi-VN");                    // 31/8/2025
        return `${time} ${day}`;
    }

    const data = mapToCsvRows(transactions, garmentCsvData);

    const columns = useMemo(() => [
        {
            title: 'Item ID',
            dataIndex: 'itemId',
            key: 'itemId',
            width: 140,
            render: (val, record) => {
                if (!val || val === 0) return '—';
                const pref = (record.paymentType === 'design' || record.paymentType === 'design_return') ? 'dr' : 'ord';
                return (
                    <Chip label={parseID(val, pref)} size="small" sx={{backgroundColor: '#eef2ff', color: '#3730a3', fontWeight: 600}}/>
                );
            }
        },
        {
            title: 'Type',
            dataIndex: 'paymentType',
            key: 'paymentType',
            width: 160,
            render: (val) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#1e293b'}}>
                    {paymentTypeLabel(val)}
                </Typography>
            ),
            filters: [
                {text: 'Design', value: 'design'},
                {text: 'Deposit', value: 'deposit'},
                {text: 'Order', value: 'order'},
                {text: 'Order Refund', value: 'order_return'},
                {text: 'Design Refund', value: 'design_return'},
                {text: 'Top-up', value: 'wallet'},
            ],
            onFilter: (value, record) => record.paymentType === value,
        },
        {
            title: 'Payment Method',
            dataIndex: 'paymentGatewayCode',
            key: 'paymentGatewayCode',
            width: 140,
            render: (val) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#0ea5b8'}}>
                    {val?.includes('w') ? 'Wallet' : 'VNPay'}
                </Typography>
            )
        },
        {
            title: 'From/To',
            dataIndex: 'receiver',
            key: 'receiver',
            width: 220,
            render: (val, record) => {
                const isReceiver = record?.receiver?.account?.role === 'garment';
                const otherParty = isReceiver ? record?.sender : record?.receiver;
                const prefix = isReceiver ? 'Received from' : 'Sent to';
                return (
                    <Typography variant="body2" sx={{fontWeight: 600, color: '#5096de'}}>
                        {`${prefix} ${otherParty?.business || 'Unknown'}`}
                    </Typography>
                );
            }
        },
        {
            title: (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'inline' }}>
                        Paid
                    </Typography>
                </Box>
            ),
            key: 'total',
            align: 'right',
            width: 180,
            sorter: (a, b) => ((a.amount || 0) + (a.serviceFee || 0)) - ((b.amount || 0) + (b.serviceFee || 0)),
            render: (_, record) => {
                const isReceiver = record?.receiver?.account?.role === 'garment';
                const total = (record?.amount || 0);
                return (
                    <Typography variant="body2" sx={{fontWeight: 700, color: isReceiver ? '#16a34a' : '#dc2626'}}>
                        {isReceiver ? '+' : '-'}{formatCurrency(total)}
                    </Typography>
                );
            }
        },
        {
            title: 'New balance',
            key: 'newBalance',
            align: 'right',
            width: 180,
            sorter: (a, b) => ((a?.remain && (a.receiver?.account?.role === 'garment' ? a.remain.receiver : a.remain.sender)) || 0) - ((b?.remain && (b.receiver?.account?.role === 'garment' ? b.remain.receiver : b.remain.sender)) || 0),
            render: (_, record) => {
                const isReceiver = record?.receiver?.account?.role === 'garment';
                const newBalance = isReceiver ? record?.remain?.receiver : record?.remain?.sender;
                if (newBalance === undefined || newBalance === null || newBalance === -1) return '-';
                return (
                    <Typography variant="body2" sx={{fontWeight: 700, color: '#111827'}}>
                        {formatCurrency(newBalance)}
                    </Typography>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            filters: [
                {text: 'Successful', value: 'success'},
                {text: 'Failed', value: 'failed'},
            ],
            onFilter: (value, record) => record.status === value,
            render: (val) => (
                <Chip
                    label={val === 'success' ? 'Successful' : 'Failed'}
                    size="small"
                    sx={{
                        backgroundColor: val === 'success' ? '#dcfce7' : '#fee2e2',
                        color: val === 'success' ? '#166534' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '11px'
                    }}
                />
            )
        },
        {
            title: 'Date',
            dataIndex: 'creationDate',
            key: 'creationDate',
            width: 180,
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
                background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(48, 63, 159, 0.08) 100%)',
                border: '1px solid rgba(63, 81, 181, 0.1)'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <DollarOutlined style={{fontSize: 28, color: '#3f51b5', marginRight: 8}}/>
                        <Typography variant="h4" sx={{fontWeight: 700, color: '#1e293b'}}>
                            My Transactions
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                        <Tooltip title="Download PDF Report">
                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdf style={{fontSize: 16}}/>}
                                onClick={() => handleDownloadPdf(transactions, garmentPDFHeader, garmentPDFBody(transactions))}
                                sx={{
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: 'white',
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                PDF
                            </Button>
                        </Tooltip>
                        <Tooltip title="Download CSV Report">
                            <Button
                                variant="contained"
                                startIcon={<GrDocumentCsv style={{fontSize: 16}}/>}
                                sx={{
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                    color: 'white',
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CSVLink
                                    data={data}
                                    headers={garmentCsvHeaders}
                                    filename={filename}
                                    separator=","
                                    uFEFF={true}
                                    target="_blank"
                                    style={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    CSV
                                </CSVLink>
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
                <Typography variant="body1" sx={{color: '#64748b'}}>
                    Review your transaction history.
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 4}}>
                <StatCard
                    icon={<AccountBalanceWallet />}
                    value={stats.total}
                    label="Total Transactions"
                    color="#3f51b5"
                />
                <StatCard
                    icon={<CheckOutlined style={{fontSize: 24}}/>}
                    value={stats.success}
                    label="Successful Transactions"
                    color="#52c41a"
                />
                <StatCard
                    icon={<StopOutlined style={{fontSize: 24}}/>}
                    value={stats.failed}
                    label="Failed Transactions"
                    color="#ff4d4f"
                />
                <StatCard
                    icon={<CreditScore />}
                    value={formatCompactCurrency(stats.totalAmount) + '₫'}
                    label="Total Amount"
                    color="#1890ff"
                />
            </Box>

            <Paper elevation={0} sx={{borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                <Box sx={{p: 3, backgroundColor: 'white'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, color: '#1e293b'}}>
                            Transaction List
                        </Typography>
                        <Chip
                            icon={<DollarOutlined/>}
                            label={`${Array.isArray(transactions) ? transactions.length : 0} Transactions`}
                            sx={{backgroundColor: '#e8eaf6', color: '#3f51b5', fontWeight: 600}}
                        />
                    </Box>

                    <Table
                        columns={columns}
                        dataSource={transactions}
                        rowKey={(r) => r.id}
                        loading={loading}
                        pagination={{
                            defaultPageSize: 10,
                            pageSizeOptions: ['10', '20', '50'],
                            showSizeChanger: true,
                            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} transactions`,
                            style: {marginTop: 16}
                        }}
                        scroll={{x: 'max-content'}}
                        style={{backgroundColor: 'white', borderRadius: '8px'}}
                    />
                </Box>
            </Paper>
        </Box>
    );
}