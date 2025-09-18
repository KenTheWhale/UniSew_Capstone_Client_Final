
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {Box, Chip, Paper, Typography} from '@mui/material';
import {Table} from 'antd';
import {DollarOutlined} from '@ant-design/icons';
import {getTransactionsForOne} from '../../../services/PaymentService.jsx';
import {parseID} from '../../../utils/ParseIDUtil.jsx';
import {formatDateTimeSecond} from '../../../utils/TimestampUtil.jsx';

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' VND';
}

const paymentTypeLabel = (type) => ({
    design: 'Design',
    deposit: 'Deposit',
    order: 'Order',
    order_return: 'Refund',
    design_return: 'Refund',
    wallet: 'Top-up'
}[type] || type);

export default function SchoolTransaction() {
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
            console.error('Failed to load transactions', e);
            setError('Failed to load transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

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
                    <Chip
                        label={parseID(val, pref)}
                        size="small"
                        sx={{backgroundColor: '#eef2ff', color: '#3730a3', fontWeight: 600}}
                    />
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
            width: 120,
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
            width: 200,
            render: (val, record) => {
                const isReceiver = record?.receiver?.account?.role === 'school';
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
            title: 'Service Fee',
            dataIndex: 'serviceFee',
            key: 'serviceFee',
            align: 'right',
            width: 140,
            render: (val) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#f59e0b'}}>
                    {formatCurrency(val || 0)}
                </Typography>
            )
        },
         {
             title: (
                 <Box>
                     <Typography variant="body2" sx={{ fontWeight: 600, display: 'inline' }}>
                         Paid
                     </Typography>
                     <Typography variant="body2" sx={{ color: '#64748b', fontSize: '12px', fontWeight: 500, display: 'inline', ml: 0.5 }}>
                         (Service Fee Incl.)
                     </Typography>
                 </Box>
             ),
             key: 'total',
             align: 'right',
             width: 180,
             sorter: (a, b) => ((a.amount || 0) + (a.serviceFee || 0)) - ((b.amount || 0) + (b.serviceFee || 0)),
             render: (_, record) => {
                 const isReceiver = record?.receiver?.account?.role === 'school';
                 const total = (record?.amount || 0) + (record?.serviceFee || 0);
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
            sorter: (a, b) => ((a?.remain && (a.receiver?.account?.role === 'school' ? a.remain.receiver : a.remain.sender)) || 0) - ((b?.remain && (b.receiver?.account?.role === 'school' ? b.remain.receiver : b.remain.sender)) || 0),
            render: (_, record) => {
                const isReceiver = record?.receiver?.account?.role === 'school';
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
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
                border: '1px solid rgba(46, 125, 50, 0.1)'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <DollarOutlined style={{fontSize: 28, color: '#2e7d32', marginRight: 8}}/>
                    <Typography variant="h4" sx={{fontWeight: 700, color: '#1e293b'}}>
                        My Transactions
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{color: '#64748b'}}>
                    Review your transaction history.
                </Typography>
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
                            sx={{backgroundColor: '#f0f9ff', color: '#0369a1', fontWeight: 600}}
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