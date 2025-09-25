import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import {Badge, Descriptions, Empty, Input, Modal, Select, Table, Tag} from 'antd';
import {CheckOutlined, CreditCardOutlined, ReloadOutlined, StopOutlined} from '@ant-design/icons';
import {AccountBalance, AccountBalanceWallet, CreditScore, PictureAsPdf} from '@mui/icons-material';
import {enqueueSnackbar} from 'notistack';
import {getTransactions} from '../../services/PaymentService.jsx';
import {parseID} from "../../utils/ParseIDUtil.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {CSVLink} from "react-csv";
import {GrDocumentCsv} from "react-icons/gr";

const {Search} = Input;
const {Option} = Select;

const STATUS_COLORS = {
    success: '#52c41a',
    fail: '#ff4d4f',
    pending: '#faad14'
};

const PAYMENT_TYPE_COLORS = {
    order: '#1890ff',
    design: '#722ed1',
    wallet: '#13c2c2'
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

const EmptyState = () => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8
    }}>
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <Typography variant="body1" sx={{color: '#64748b', mt: 2}}>
                    No transactions found
                </Typography>
            }
        />
    </Box>
);

export default function AdminTransaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);


    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getTransactions();

            if (response && response.status === 200) {
                let transactionsData = response.data;

                if (transactionsData && typeof transactionsData === 'object') {
                    if (transactionsData.transactions && Array.isArray(transactionsData.transactions)) {
                        transactionsData = transactionsData.transactions;
                    } else if (Array.isArray(transactionsData)) {
                    } else {
                        const keys = Object.keys(transactionsData);
                        const arrayKey = keys.find(key => Array.isArray(transactionsData[key]));
                        if (arrayKey) {
                            transactionsData = transactionsData[arrayKey];
                        } else {
                            transactionsData = [];
                        }
                    }
                } else {
                    transactionsData = [];
                }

                setTransactions(transactionsData);
            } else {
                enqueueSnackbar('Failed to load transactions', {variant: 'error'});
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            enqueueSnackbar('Error loading transactions', {variant: 'error'});
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'fail':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success':
                return 'Success';
            case 'fail':
                return 'Failed';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    const getPaymentTypeColor = (type) => {
        switch (type) {
            case 'order':
                return 'blue';
            case 'design':
                return 'purple';
            case 'wallet':
                return 'cyan';
            default:
                return 'default';
        }
    };

    const getPaymentTypeText = (type) => {
        switch (type) {
            case 'order':
                return 'Order Payment';
            case 'design':
                return 'Design Payment';
            case 'wallet':
                return 'Wallet Deposit';
            case 'withdraw':
                return 'Withdraw';
            default:
                return type;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatCompactCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handlePaymentTypeFilter = (value) => {
        setPaymentTypeFilter(value);
    };

    const handleRefresh = () => {
        fetchTransactions();
    };

    const filteredTransactions = useMemo(() => {
        if (!Array.isArray(transactions)) {
            return [];
        }
        return transactions.filter(transaction => {
            const matchesSearch = transaction.id.toString().includes(searchText) ||
                transaction.sender?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                transaction.receiver?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                transaction.sender?.account?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                transaction.receiver?.account?.email?.toLowerCase().includes(searchText.toLowerCase());
            const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
            const matchesPaymentType = paymentTypeFilter === 'all' || transaction.paymentType === paymentTypeFilter;

            return matchesSearch && matchesStatus && matchesPaymentType;
        });
    }, [transactions, searchText, statusFilter, paymentTypeFilter]);

    const stats = useMemo(() => {
        if (!Array.isArray(transactions)) {
            return {total: 0, success: 0, failed: 0, pending: 0, totalAmount: 0, totalFees: 0};
        }
        const total = transactions.length;
        const success = transactions.filter(t => t.status === 'success').length;
        const failed = transactions.filter(t => t.status === 'fail').length;
        const pending = transactions.filter(t => t.status === 'pending').length;
        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalFees = transactions.reduce((sum, t) => sum + (t.serviceFee || 0), 0);

        return {total, success, failed, pending, totalAmount, totalFees};
    }, [transactions]);

    const paymentTypeLabel = (type) => ({
        design: 'Design',
        deposit: 'Deposit',
        order: 'Order',
        order_return: 'Refund',
        design_return: 'Refund',
        wallet: 'Top-up',
        withdraw: 'Withdraw'
    }[type] || type);

    const columns = useMemo(() => [
        {
            title: 'Item ID',
            dataIndex: 'itemId',
            key: 'itemId',
            width: 140,
            render: (val, record) => {
                if (record.paymentType === 'wallet') {
                    return (
                        <Chip
                            label="TOPUP"
                            size="small"
                            sx={{backgroundColor: '#eef2ff', color: '#3730a3', fontWeight: 600}}
                        />
                    );
                }
                if (!val || val === 0) return '—';
                const pref = (record.paymentType === 'design' || record.paymentType === 'design_return') ? 'dr' : record.paymentType === 'withdraw' ? 'wdr' : 'ord';
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
                {text: 'Withdraw', value: 'withdraw'},
            ],
            onFilter: (value, record) => record.paymentType === value,
        },
        {
            title: 'Gateway',
            dataIndex: 'paymentGatewayCode',
            key: 'paymentGatewayCode',
            width: 120,
            render: (val) => (
                <Typography variant="body2" sx={{fontWeight: 600, color: '#0ea5b8'}}>
                    {val?.includes('w') ? 'Wallet' : val?.includes('q') ? 'UniSew' : 'VNPay'}
                </Typography>
            )
        },
        {
            title: 'Sender',
            key: 'sender',
            width: 200,
            render: (_, record) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Avatar
                        src={record.sender?.avatar}
                        sx={{width: 32, height: 32}}
                        slotProps={{
                            img: {
                                referrerPolicy: 'no-referrer',
                            }
                        }}
                    >
                        {record.sender?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{fontWeight: 500, fontSize: '13px'}}>
                            {record.sender?.name}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b', fontSize: '11px'}}>
                            {record.sender?.account?.email}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            title: 'Receiver',
            key: 'receiver',
            width: 200,
            render: (_, record) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Avatar
                        src={record.receiver?.avatar}
                        sx={{width: 32, height: 32}}
                        slotProps={{
                            img: {
                                referrerPolicy: 'no-referrer',
                            }
                        }}
                    >
                        {record.receiver?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{fontWeight: 500, fontSize: '13px'}}>
                            {record.receiver?.name}
                        </Typography>
                        <Typography variant="caption" sx={{color: '#64748b', fontSize: '11px'}}>
                            {record.receiver?.account?.email}
                        </Typography>
                    </Box>
                </Box>
            )
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
                    <Typography variant="body2" sx={{fontWeight: 600, display: 'inline'}}>
                        Paid
                    </Typography>
                    <Typography variant="body2"
                                sx={{color: '#64748b', fontSize: '12px', fontWeight: 500, display: 'inline', ml: 0.5}}>
                        (Service Fee Incl.)
                    </Typography>
                </Box>
            ),
            key: 'total',
            align: 'right',
            width: 180,
            sorter: (a, b) => ((a.amount || 0) + (a.serviceFee || 0)) - ((b.amount || 0) + (b.serviceFee || 0)),
            render: (_, record) => {
                const total = (record?.amount || 0) + (record?.serviceFee || 0);
                const isFailed = record?.status === 'fail' || record?.status === 'failed';
                return (
                    <Typography variant="body2" sx={{fontWeight: 700, color: isFailed ? '#dc2626' : '#16a34a'}}>
                        {formatCurrency(total)}
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
            render: (val) => {
                const transactionDate = new Date(val);
                return (
                    <Typography variant="body2" sx={{color: '#64748b'}}>
                        {transactionDate.toLocaleString('vi-VN')}
                    </Typography>
                );
            }
        },
    ], []);

    function arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000; // ~32KB
        let binary = "";
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binary);
    }

    async function embedUnicodeFont(doc) {
        const res = await fetch("/fonts/NotoSans-Regular.ttf");
        const buf = await res.arrayBuffer();
        const base64 = arrayBufferToBase64(buf);
        doc.addFileToVFS("NotoSans-Regular.ttf", base64);
        doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
        doc.setFont("NotoSans", "normal");
    }

    async function handleDownloadPdf() {
        const doc = new jsPDF({unit: "pt", format: "a1", orientation: "landscape"});
        await embedUnicodeFont(doc);

        const margin = 30; // pt
        const pageWidth = doc.internal.pageSize.getWidth();
        const printWidth = pageWidth - margin * 2;

        const ratios = [0.0636, 0.1458, 0.1794, 0.1196, 0.0972, 0.1458, 0.0972, 0.1514];
        const colWidths = ratios.map(r => Math.floor(printWidth * r));

        doc.setFont("NotoSans", "normal");
        doc.setFontSize(14);
        doc.text("UniSew - Transactions Report", margin, 40);

        const head = [["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]];
        const body = (filteredTransactions || []).map(trs => ([
            `${parseID(trs.id, "trs")}`,
            (trs.sender && trs.sender.name) ? trs.sender.name : "-",
            (trs.receiver && trs.receiver.name) ? trs.receiver.name : "-",
            new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
            new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
            typeof getPaymentTypeText === "function" ? getPaymentTypeText(trs.paymentType) : (trs.paymentType || ""),
            typeof getStatusText === "function" ? getStatusText(trs.status) : (trs.status || ""),
            (function formatDateTime(d) {
                const date = new Date(d);
                return date.toLocaleTimeString("vi-VN", {hour12: false}) + " " + date.toLocaleDateString("vi-VN");
            })(trs.creationDate)
        ]));

        autoTable(doc, {
            startY: 60,
            head,
            body,
            margin: {left: margin, right: margin},
            tableWidth: printWidth,
            theme: "grid",
            styles: {
                font: "NotoSans",
                fontSize: 10,
                cellPadding: 6,
                lineWidth: 0.2,
                overflow: "linebreak",
                textColor: 0
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: "bold",
                lineWidth: 0.2
            },
            columnStyles: {
                0: {cellWidth: colWidths[0], halign: "left"},
                1: {cellWidth: colWidths[1], halign: "left"},
                2: {cellWidth: colWidths[2], halign: "left"},
                3: {cellWidth: colWidths[3], halign: "right"},
                4: {cellWidth: colWidths[4], halign: "right"},
                5: {cellWidth: colWidths[5], halign: "left"},
                6: {cellWidth: colWidths[6], halign: "left"},
                7: {cellWidth: colWidths[7], halign: "center"}
            },
            didDrawPage: () => {

                doc.setFontSize(14);
                doc.text("UniSew - Transactions Report", margin, 40);
            }
        });

        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
        doc.setFontSize(10);
        doc.text(`Total Transactions: ${filteredTransactions ? filteredTransactions.length : 0}`, margin, finalY + 20);

        doc.save(`transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
    }


    function formatDateTime(d) {
        const date = new Date(d);
        const time = date.toLocaleTimeString("vi-VN", {hour12: false}); // 07:00:00
        const day = date.toLocaleDateString("vi-VN");                    // 31/8/2025
        return `${time} ${day}`;
    }

    const csvHeaders = [
        {label: "ID", key: "id"},
        {label: "Sender", key: "sender"},
        {label: "Receiver", key: "receiver"},
        {label: "Amount (VND)", key: "amount"},
        {label: "Fee (VND)", key: "fee"},
        {label: "Payment Type", key: "paymentType"},
        {label: "Status", key: "status"},
        {label: "Date", key: "date"},
    ];

    function mapToCsvRows(transactions) {
        return (transactions || []).map(trs => ({
            id: `#${trs.id}`,
            sender: trs?.sender?.name || "-",
            receiver: trs?.receiver?.name || "-",
            amount: Number(trs?.amount || 0),
            fee: Number(trs?.serviceFee || 0),
            paymentType: typeof getPaymentTypeText === "function" ? getPaymentTypeText(trs.paymentType) : (trs.paymentType || ""),
            status: typeof getStatusText === "function" ? getStatusText(trs.status) : (trs.status || ""),
            date: formatDateTime(trs.creationDate),
        }));
    }

    const data = mapToCsvRows(transactions);
    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;

    return (
        <Box sx={{
            height: '100%',
            overflowY: 'auto',
            '& @keyframes pulse': {
                '0%': {opacity: 1},
                '50%': {opacity: 0.4},
                '100%': {opacity: 1}
            }
        }}>
            {}
            <Box
                sx={{
                    mb: 4,
                    position: "relative",
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(6, 182, 212, 0.08) 100%)",
                    border: "1px solid rgba(6, 182, 212, 0.1)",
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <AccountBalance style={{fontSize: 32, color: '#06b6d4', marginRight: 16}}/>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                mb: 1
                            }}
                        >
                            System Transactions Management
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                fontWeight: 500
                            }}
                        >
                            Monitor all payment transactions in the UniSew system
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Box sx={{display: "flex", gap: 2}}>
                        {}
                        <Search
                            placeholder="Search by ID, sender, receiver..."
                            allowClear
                            style={{width: 300}}
                            onSearch={handleSearch}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            placeholder="Filter by payment type"
                            style={{width: 170}}
                            value={paymentTypeFilter}
                            onChange={handlePaymentTypeFilter}
                            loading={loading}
                        >
                            <Option value="all">All Types
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.length : 0})</Option>
                            <Option value="order">Order
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.paymentType === 'order').length : 0})</Option>
                            <Option value="design">Design
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.paymentType === 'design').length : 0})</Option>
                            <Option value="wallet">Wallet
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.paymentType === 'wallet').length : 0})</Option>
                        </Select>
                        <Select
                            placeholder="Filter by status"
                            style={{width: 150}}
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            loading={loading}
                        >
                            <Option value="all">All Status
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.length : 0})</Option>
                            <Option value="success">Success
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.status === 'success').length : 0})</Option>
                            <Option value="fail">Failed
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.status === 'fail').length : 0})</Option>
                            <Option value="pending">Pending
                                ({loading ? '...' : Array.isArray(transactions) ? transactions.filter(t => t.status === 'pending').length : 0})</Option>
                        </Select>
                        <Button
                            onClick={() => {
                                setSearchText('');
                                setPaymentTypeFilter('all');
                                setStatusFilter('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Box>

                    <Box sx={{display: "flex", gap: 2, alignItems: "center"}}>
                        <Tooltip title="Refresh Data">
                            <Button
                                variant="contained"
                                startIcon={<ReloadOutlined style={{fontSize: 16}}/>}
                                onClick={handleRefresh}
                                sx={{
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                    color: 'white',
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 16px rgba(6, 182, 212, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Refresh
                            </Button>
                        </Tooltip>
                        <Tooltip title="Download PDF Report">
                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdf style={{fontSize: 16}}/>}
                                onClick={handleDownloadPdf}
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
                                    headers={csvHeaders}
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
            </Box>

            {}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 4}}>
                {loading ? (
                    Array.from({length: 6}).map((_, index) => (
                        <Card key={index} sx={{height: '100%', borderRadius: 2}}>
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <Box>
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 40,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 1,
                                                mb: 1,
                                                animation: 'pulse 1.5s ease-in-out infinite'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 16,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 1,
                                                animation: 'pulse 1.5s ease-in-out infinite'
                                            }}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 2,
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <StatCard
                            icon={<AccountBalanceWallet />}
                            value={stats.total}
                            label="Total Transactions"
                            color="#06b6d4"
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
                            value={formatCompactCurrency(stats.totalFees) + '₫'}
                            label="Total Fees"
                            color="#722ed1"
                        />
                        <StatCard
                            icon={<CreditScore />}
                            value={formatCompactCurrency(stats.totalAmount) + '₫'}
                            label="Total (Excl. Service Fee)"
                            color="#1890ff"
                        />

                    </>
                )}
            </Box>

            {}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                }}
            >
                <Box sx={{p: 3, backgroundColor: "white"}}>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#1e293b"
                            }}
                        >
                            All System Transactions
                        </Typography>
                        <Chip
                            label={`${filteredTransactions.length} of ${stats.total} transactions`}
                            sx={{
                                backgroundColor: "#06b6d410",
                                color: "#06b6d4",
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8
                        }}>
                            <CircularProgress size={40} sx={{color: '#06b6d4', mb: 2}}/>
                            <Typography variant="body1" sx={{color: '#64748b'}}>
                                Loading transactions...
                            </Typography>
                        </Box>
                    ) : filteredTransactions.length === 0 ? (
                        <EmptyState/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredTransactions}
                            rowKey="id"
                            loading={false}
                            pagination={{
                                defaultPageSize: 10,
                                pageSizeOptions: ['5', '10', '20'],
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `Showing ${range[0]}-${range[1]} of ${total} transactions`,
                                style: {marginTop: 16}
                            }}
                            scroll={{x: 'max-content'}}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </Box>
            </Paper>

            {}
            <Modal
                title="Transaction Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedTransaction && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Transaction ID" span={2}>
                            <Typography variant="body2" sx={{fontWeight: 600, color: '#1976d2'}}>
                                #{selectedTransaction.id}
                            </Typography>
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                            <Typography variant="body2" sx={{fontWeight: 600, color: '#52c41a'}}>
                                {formatCurrency(selectedTransaction.amount)}
                            </Typography>
                        </Descriptions.Item>
                        <Descriptions.Item label="Service Fee">
                            {formatCurrency(selectedTransaction.serviceFee)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Type">
                            <Tag color={getPaymentTypeColor(selectedTransaction.paymentType)}>
                                {getPaymentTypeText(selectedTransaction.paymentType)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Badge
                                status={getStatusColor(selectedTransaction.status)}
                                text={getStatusText(selectedTransaction.status)}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Sender" span={2}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Avatar
                                    src={selectedTransaction.sender?.avatar}
                                    sx={{width: 40, height: 40}}
                                    slotProps={{
                                        img: {
                                            referrerPolicy: 'no-referrer',
                                        }
                                    }}
                                >
                                    {selectedTransaction.sender?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                        {selectedTransaction.sender?.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: '#64748b'}}>
                                        {selectedTransaction.sender?.account?.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Descriptions.Item>
                        <Descriptions.Item label="Receiver" span={2}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Avatar
                                    src={selectedTransaction.receiver?.avatar}
                                    sx={{width: 40, height: 40}}
                                    slotProps={{
                                        img: {
                                            referrerPolicy: 'no-referrer',
                                        }
                                    }}
                                >
                                    {selectedTransaction.receiver?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                        {selectedTransaction.receiver?.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: '#64748b'}}>
                                        {selectedTransaction.receiver?.account?.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Descriptions.Item>
                        <Descriptions.Item label="Gateway Code">
                            {selectedTransaction.paymentGatewayCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Balance Type">
                            <Tag>{selectedTransaction.balanceType}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Creation Date" span={2}>
                            {new Date(selectedTransaction.creationDate).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Box>
    );
}