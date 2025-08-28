import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Button,
    ButtonGroup,
    CircularProgress,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Skeleton
} from '@mui/material';
import { DatePicker } from 'antd';
import { LineChart, PieChart, BarChart } from '@mui/x-charts';
import {
    TrendingUpOutlined,
    PeopleOutlined,
    SchoolOutlined,
    DesignServicesOutlined,
    FactoryOutlined,
    BlockOutlined,
    CheckCircleOutlined,
    AccountBalanceWalletOutlined,
    AttachMoneyOutlined,
    ReceiptOutlined
} from '@mui/icons-material';
import { getAccountStats, getTransactionsStats } from '../../services/AdminService.jsx';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};

const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number || 0);
};

const StatCard = ({ icon, value, label, color, change, changeType }) => (
    <Card
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
            border: `1px solid ${color}20`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${color}25`
            }
        }}
    >
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: color,
                            mb: 0.5
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748b',
                            fontWeight: 500,
                            mb: 1
                        }}
                    >
                        {label}
                    </Typography>
                    {change && (
                        <Chip
                            label={`${changeType === 'increase' ? '+' : ''}${change}%`}
                            size="small"
                            sx={{
                                backgroundColor: changeType === 'increase' ? '#22c55e20' : '#ef444420',
                                color: changeType === 'increase' ? '#22c55e' : '#ef4444',
                                fontWeight: 600
                            }}
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: `${color}10`,
                        color: color
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export default function AdminDashboard() {
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [transactionData, setTransactionData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [groupBy, setGroupBy] = useState('DAY');
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [chartWidth, setChartWidth] = useState(800);
    const chartContainerRef = useRef(null);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);

    const getFallbackData = () => ({
        data: {
            overview: {
                total: 150,
                byRole: {
                    ADMIN: 5,
                    SCHOOL: 85,
                    DESIGNER: 40,
                    GARMENT_FACTORY: 20
                },
                byStatus: {
                    ACCOUNT_ACTIVE: 135,
                    ACCOUNT_INACTIVE: 15
                },
                inactiveCount: 15
            },
            timeSeries: Array.from({ length: 30 }, (_, i) => ({
                bucket: dateRange[0].add(i, 'day').format('YYYY-MM-DD'),
                count: Math.floor(Math.random() * 10)
            }))
        }
    });

    const fetchAccountStats = useCallback(async () => {
        console.log('fetchAccountStats called, loading:', loading);
        if (loading) {
            console.log('Already loading, skipping...');
            return;
        }

        setLoading(true);


        try {
            const requestData = {
                from: dateRange[0].format('YYYY-MM-DD'),
                to: dateRange[1].format('YYYY-MM-DD'),
                groupBy: groupBy
            };

            console.log('Fetching account stats with request:', requestData);
            console.log('Base URL:', window.location.origin);
            console.log('API URL will be: http://localhost:8080/api/v1/admin/account/stats');

            const response = await getAccountStats(requestData);
            console.log('Account stats response:', response);

            if (response && response.status === 200) {
                console.log('Raw response data:', response.data);
                let processedData = response.data;
                if (response.data.body) {
                    processedData = { data: response.data.body };
                } else if (response.data.data) {
                    processedData = response.data;
                } else {
                    processedData = { data: response.data };
                }

                console.log('Processed data structure:', processedData);
                setStatsData(processedData);
            } else {
                console.warn('API response not 200, using fallback data');
                setStatsData(getFallbackData());
            }
        } catch (error) {
            console.error('Error fetching account stats:', error);
            console.warn('Using fallback data due to API error');
            setStatsData(getFallbackData());

            if (error.response?.status === 403) {
            } else if (error.response?.status === 401) {
            } else {
            }
        } finally {
            setLoading(false);
        }
    }, [dateRange, groupBy, loading]);

    const fetchTransactionStats = useCallback(async () => {
        console.log('fetchTransactionStats called, loading:', loading);
        if (loading) {
            console.log('Already loading, skipping...');
            return;
        }

        setLoading(true);

        try {
            const requestData = {
                from: dateRange[0].format('YYYY-MM-DD'),
                to: dateRange[1].format('YYYY-MM-DD')
            };

            console.log('Fetching transaction stats with request:', requestData);

            const response = await getTransactionsStats(requestData);
            console.log('Transaction stats response:', response);

            if (response && response.status === 200) {
                console.log('Raw transaction response data:', response.data);

                let processedData = response.data;
                if (response.data.body) {
                    processedData = { data: response.data.body };
                } else if (response.data.data) {
                    processedData = response.data;
                } else {
                    processedData = { data: response.data };
                }

                console.log('Processed transaction data structure:', processedData);
                setTransactionData(processedData);
            } else {
                console.warn('Transaction API response not 200, using fallback data');
                const fallbackData = {
                    data: {
                        overview: {
                            totalCount: 16,
                            totalAmount: 504261111,
                            totalServiceFee: 889622,
                            byStatus: {
                                TRANSACTION_SUCCESS: 15,
                                TRANSACTION_FAIL: 1
                            },
                            byPaymentType: {
                                DESIGN: 12,
                                ORDER: 4
                            }
                        },
                        dailyRevenue: [],
                        monthlyRevenue: [],
                        yearlyRevenue: []
                    }
                };
                setTransactionData(fallbackData);
            }
        } catch (error) {
            console.error('Error fetching transaction stats:', error);
            console.warn('Using fallback transaction data due to API error');

            const fallbackData = {
                data: {
                    overview: {
                        totalCount: 16,
                        totalAmount: 504261111,
                        totalServiceFee: 889622,
                        byStatus: {
                            TRANSACTION_SUCCESS: 15,
                            TRANSACTION_FAIL: 1
                        },
                        byPaymentType: {
                            DESIGN: 12,
                            ORDER: 4
                        }
                    },
                    dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
                        date: dateRange[0].add(i, 'day').format('YYYY-MM-DD'),
                        revenue: Math.floor(Math.random() * 1000000),
                        completedCount: Math.floor(Math.random() * 10),
                        txCount: Math.floor(Math.random() * 15)
                    })),
                    monthlyRevenue: [
                        { yearMonth: dateRange[0].format('YYYY-MM'), revenue: 2500000, completedCount: 45, txCount: 60 },
                        { yearMonth: dateRange[1].format('YYYY-MM'), revenue: 3200000, completedCount: 38, txCount: 52 }
                    ],
                    yearlyRevenue: [
                        { year: parseInt(dateRange[0].format('YYYY')), revenue: 15000000, completedCount: 200, txCount: 280 }
                    ]
                }
            };
            setTransactionData(fallbackData);

            if (error.response?.status === 403) {
            } else if (error.response?.status === 401) {
            } else {
            }
        } finally {
            setLoading(false);
        }
    }, [dateRange, loading]);

    useEffect(() => {
        console.log('useEffect triggered, hasInitialLoad:', hasInitialLoad);
        if (!hasInitialLoad) {
            console.log('Setting initial load flag and calling fetchAccountStats');
            setHasInitialLoad(true);
            fetchAccountStats();
            fetchTransactionStats();
        }
    }, []);

    useEffect(() => {
        const calculateChartWidth = () => {
            if (chartContainerRef.current) {
                const containerWidth = chartContainerRef.current.offsetWidth;
                const calculatedWidth = Math.max(containerWidth - 48, 400);
                setChartWidth(calculatedWidth);
            }
        };

        calculateChartWidth();

        const handleResize = () => {
            calculateChartWidth();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [statsData]);

    const timeSeriesData = useMemo(() => {
        console.log('Processing timeSeries data, statsData:', statsData);
        const timeSeries = statsData?.data?.timeSeries ||
                          statsData?.body?.timeSeries ||
                          statsData?.timeSeries;

        console.log('Found timeSeries:', timeSeries);
        if (!timeSeries || !Array.isArray(timeSeries)) {
            console.log('No valid timeSeries data found');
            return { xAxisData: [], seriesData: [] };
        }

        const xAxisData = timeSeries.map(item => {
            const date = dayjs(item.bucketStart || item.bucket);
            switch (groupBy) {
                case 'DAY':
                    return date.format('MM/DD');
                case 'WEEK':
                    return `W${date.week()}`;
                case 'MONTH':
                    return date.format('MMM YYYY');
                default:
                    return date.format('MM/DD');
            }
        });

        const seriesData = timeSeries.map(item => item.count);

        console.log('Processed chart data:', { xAxisData, seriesData });
        return { xAxisData, seriesData };
    }, [statsData, groupBy]);

    const roleChartData = useMemo(() => {
        console.log('Processing role data, statsData:', statsData);
        const overview = statsData?.data?.overview ||
                        statsData?.body?.overview ||
                        statsData?.overview;

        console.log('Found overview:', overview);
        if (!overview?.byRole) {
            console.log('No byRole data found');
            return [];
        }

        const roleColors = {
            ADMIN: '#dc3545',
            SCHOOL: '#28a745',
            DESIGNER: '#6f42c1',
            GARMENT: '#fd7e14'
        };

        const roleLabels = {
            ADMIN: 'Admin',
            SCHOOL: 'School',
            DESIGNER: 'Designer',
            GARMENT: 'Garment Factory'
        };

        const result = Object.entries(overview.byRole).map(([role, count]) => ({
            id: role,
            value: count,
            label: roleLabels[role] || role,
            color: roleColors[role] || '#6c757d'
        }));

        console.log('Processed role chart data:', result);
        return result;
    }, [statsData]);

    const statusChartData = useMemo(() => {
        console.log('Processing status data, statsData:', statsData);
        const overview = statsData?.data?.overview ||
                        statsData?.body?.overview ||
                        statsData?.overview;

        console.log('Found overview for status:', overview);
        if (!overview?.byStatus) {
            console.log('No byStatus data found');
            return [];
        }

        const statusColors = {
            ACCOUNT_ACTIVE: '#28a745',
            ACCOUNT_INACTIVE: '#dc3545',
            ACCOUNT_REQUEST_PENDING: '#ffc107',
            ACCOUNT_REQUEST_PENDING_VERIFIED: '#17a2b8',
            ACCOUNT_REQUEST_COMPLETED: '#6c757d'
        };

        const statusLabels = {
            ACCOUNT_ACTIVE: 'Active',
            ACCOUNT_INACTIVE: 'Inactive',
            ACCOUNT_REQUEST_PENDING: 'Pending',
            ACCOUNT_REQUEST_PENDING_VERIFIED: 'Pending Verified',
            ACCOUNT_REQUEST_COMPLETED: 'Request Completed'
        };

        const result = Object.entries(overview.byStatus)
            .filter(([status, count]) => count > 0)
            .map(([status, count]) => ({
                id: status,
                value: count,
                label: statusLabels[status] || status,
                color: statusColors[status] || '#6c757d'
            }));

        console.log('Processed status chart data:', result);
        return result;
    }, [statsData]);

    const dailyRevenueData = useMemo(() => {
        console.log('Processing dailyRevenue data, transactionData:', transactionData);
        const dailyRevenue = transactionData?.data?.dailyRevenue ||
                           transactionData?.body?.dailyRevenue ||
                           transactionData?.dailyRevenue;

        console.log('Found dailyRevenue:', dailyRevenue);
        if (!dailyRevenue || !Array.isArray(dailyRevenue)) {
            console.log('No valid dailyRevenue data found');
            return { xAxisData: [], seriesData: [] };
        }

        const xAxisData = dailyRevenue.map(item => dayjs(item.date).format('MM/DD'));
        const seriesData = dailyRevenue.map(item => item.revenue);

        console.log('Processed daily revenue chart data:', { xAxisData, seriesData });
        return { xAxisData, seriesData };
    }, [transactionData]);

    const monthlyRevenueData = useMemo(() => {
        console.log('Processing monthlyRevenue data, transactionData:', transactionData);
        const monthlyRevenue = transactionData?.data?.monthlyRevenue ||
                             transactionData?.body?.monthlyRevenue ||
                             transactionData?.monthlyRevenue;

        console.log('Found monthlyRevenue:', monthlyRevenue);
        if (!monthlyRevenue || !Array.isArray(monthlyRevenue)) {
            console.log('No valid monthlyRevenue data found');
            return { xAxisData: [], seriesData: [] };
        }

        const xAxisData = monthlyRevenue.map(item => item.yearMonth);
        const seriesData = monthlyRevenue.map(item => item.revenue);

        console.log('Processed monthly revenue chart data:', { xAxisData, seriesData });
        return { xAxisData, seriesData };
    }, [transactionData]);

    const transactionStatusData = useMemo(() => {
        console.log('Processing transaction status data, transactionData:', transactionData);
        const overview = transactionData?.data?.overview ||
                        transactionData?.body?.overview ||
                        transactionData?.overview;

        console.log('Found transaction overview:', overview);
        if (!overview?.byStatus) {
            console.log('No byStatus data found');
            return [];
        }

        const statusColors = {
            TRANSACTION_SUCCESS: '#28a745',
            TRANSACTION_FAIL: '#dc3545',
            TRANSACTION_PENDING: '#ffc107',
            TRANSACTION_CANCELLED: '#6c757d'
        };

        const statusLabels = {
            TRANSACTION_SUCCESS: 'Success',
            TRANSACTION_FAIL: 'Failed',
            TRANSACTION_PENDING: 'Pending',
            TRANSACTION_CANCELLED: 'Cancelled'
        };

        const result = Object.entries(overview.byStatus)
            .filter(([status, count]) => count > 0)
            .map(([status, count]) => ({
                id: status,
                value: count,
                label: statusLabels[status] || status,
                color: statusColors[status] || '#6c757d'
            }));

        console.log('Processed transaction status chart data:', result);
        return result;
    }, [transactionData]);

    const paymentTypeData = useMemo(() => {
        console.log('Processing payment type data, transactionData:', transactionData);
        const overview = transactionData?.data?.overview ||
                        transactionData?.body?.overview ||
                        transactionData?.overview;

        console.log('Found payment type overview:', overview);
        if (!overview?.byPaymentType) {
            console.log('No byPaymentType data found');
            return [];
        }

        const typeColors = {
            DESIGN: '#6f42c1',
            ORDER: '#fd7e14'
        };

        const typeLabels = {
            DESIGN: 'Design Payment',
            ORDER: 'Order Payment'
        };

        const result = Object.entries(overview.byPaymentType)
            .filter(([type, count]) => count > 0)
            .map(([type, count]) => ({
                id: type,
                value: count,
                label: typeLabels[type] || type,
                color: typeColors[type] || '#6c757d'
            }));

        console.log('Processed payment type chart data:', result);
        return result;
    }, [transactionData]);

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange([dayjs(dates[0]), dayjs(dates[1])]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleRefresh = () => {
        console.log('Manual refresh clicked for tab:', activeTab);
        if (activeTab === 0) {
            fetchAccountStats();
        } else {
            fetchTransactionStats();
        }
    };

    if (loading && !statsData && !transactionData) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <CircularProgress size={50} sx={{ color: '#dc3545', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#64748b' }}>
                    Loading dashboard...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
            {}
            <Box
                sx={{
                    mb: 4,
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.08) 100%)",
                    border: "1px solid rgba(220, 53, 69, 0.1)",
                    width: '100%'
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "#1e293b",
                                mb: 1
                            }}
                        >
                            Admin Dashboard
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                fontWeight: 500
                            }}
                        >
                            System overview and account statistics
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#dc3545',
                        },
                        '& .MuiTab-root': {
                            color: '#64748b',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&.Mui-selected': {
                                color: '#dc3545',
                            },
                        },
                    }}
                >
                    <Tab label="Account Statistics" />
                    <Tab label="Transaction & Revenue" />
                </Tabs>
            </Box>

            {}
            {activeTab === 0 && (
                <>
                    {}
                    {}
                    <Box sx={{ display: 'flex', gap: 3, width: '100%', mb: 4 }}>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<PeopleOutlined style={{ fontSize: 28 }} />}
                                    value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.total || 0}
                                    label="Total Accounts (All Time)"
                                    color="#dc3545"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<CheckCircleOutlined style={{ fontSize: 28 }} />}
                                    value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.byStatus?.ACCOUNT_ACTIVE || 0}
                                    label="Active Accounts (All Time)"
                                    color="#28a745"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<BlockOutlined style={{ fontSize: 28 }} />}
                                    value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.inactiveCount || 0}
                                    label="Inactive Accounts (All Time)"
                                    color="#dc3545"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<TrendingUpOutlined style={{ fontSize: 28 }} />}
                                    value={timeSeriesData.seriesData.reduce((a, b) => a + b, 0)}
                                    label={`New Registrations (${dateRange[0]?.format('MM/DD')} - ${dateRange[1]?.format('MM/DD')})`}
                                    color="#17a2b8"
                                />
                            )}
                        </Box>
                    </Box>

                    {}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                        {}
                        <Box sx={{ width: '100%' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    border: "1px solid #e2e8f0",
                                    height: 450,
                                    width: '100%',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b"
                                        }}
                                    >
                                        New Account Registrations Over Time
                                    </Typography>

                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#64748b',
                                                minWidth: 'auto'
                                            }}
                                        >
                                            Configure View:
                                        </Typography>

                                        <FormControl
                                            size="small"
                                            sx={{
                                                minWidth: 100,
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    borderRadius: 1.5,
                                                    '& fieldset': {
                                                        borderColor: '#e2e8f0',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#dc3545',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#dc3545',
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#64748b',
                                                    fontSize: '0.875rem',
                                                    '&.Mui-focused': {
                                                        color: '#dc3545',
                                                    }
                                                }
                                            }}
                                        >
                                            <InputLabel>Group By</InputLabel>
                                            <Select
                                                value={groupBy}
                                                label="Group By"
                                                onChange={(e) => setGroupBy(e.target.value)}
                                            >
                                                <MenuItem value="DAY">Day</MenuItem>
                                                <MenuItem value="WEEK">Week</MenuItem>
                                                <MenuItem value="MONTH">Month</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Box sx={{
                                            '& .ant-picker': {
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    borderColor: '#dc3545',
                                                },
                                                '&.ant-picker-focused': {
                                                    borderColor: '#dc3545',
                                                    boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.1)',
                                                }
                                            },
                                            '& .ant-picker-input > input': {
                                                fontSize: '0.875rem',
                                                color: '#1e293b',
                                            },
                                            '& .ant-picker-separator': {
                                                color: '#64748b',
                                            }
                                        }}>
                                            <RangePicker
                                                value={dateRange}
                                                onChange={handleDateRangeChange}
                                                format="YYYY-MM-DD"
                                                allowClear={false}
                                                size="small"
                                                placeholder={['Start Date', 'End Date']}
                                            />
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => fetchAccountStats()}
                                            disabled={loading}
                                            sx={{
                                                borderColor: '#dc3545',
                                                color: '#dc3545',
                                                '&:hover': {
                                                    borderColor: '#c82333',
                                                    backgroundColor: '#dc354508'
                                                }
                                            }}
                                        >
                                            {loading ? 'Loading...' : 'Refresh Data'}
                                        </Button>
                                    </Box>
                                </Box>

                                <Box ref={chartContainerRef} sx={{ width: '100%', height: 350 }}>
                                    {loading ? (
                                        <Box sx={{ width: '100%', height: 350 }}>
                                            <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 1 }} />
                                        </Box>
                                    ) : timeSeriesData.xAxisData.length > 0 ? (
                                        <LineChart
                                            xAxis={[{
                                                scaleType: 'point',
                                                data: timeSeriesData.xAxisData
                                            }]}
                                            series={[{
                                                data: timeSeriesData.seriesData,
                                                color: '#dc3545',
                                                curve: 'linear'
                                            }]}
                                            width={chartWidth}
                                            height={350}
                                            margin={{ left: 60, right: 60, top: 20, bottom: 60 }}
                                            sx={{
                                                '& .MuiChartsAxis-root': {
                                                    '& .MuiChartsAxis-tickLabel': {
                                                        fontSize: '0.75rem',
                                                        fill: '#64748b'
                                                    }
                                                },
                                                '& .MuiChartsAxis-bottom': {
                                                    '& .MuiChartsAxis-tickLabel': {
                                                        transform: 'translateY(8px)'
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 350,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No data available for the selected period
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Box>

                        {}
                        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                            {}
                            <Box sx={{ flex: 1 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 450
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        All Accounts by Role (System Overview)
                                    </Typography>

                                    {loading ? (
                                        <Skeleton variant="circular" width={300} height={300} sx={{ mx: 'auto' }} />
                                    ) : roleChartData.length > 0 ? (
                                        <PieChart
                                            series={[{
                                                data: roleChartData,
                                                highlightScope: { faded: 'global', highlighted: 'item' },
                                                faded: { innerRadius: 30, additionalRadius: -30 },
                                            }]}
                                            width={undefined}
                                            height={350}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 350,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No role data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {}
                            <Box sx={{ flex: 1 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 450
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        All Accounts by Status (System Overview)
                                    </Typography>

                                    {loading ? (
                                        <Skeleton variant="circular" width={300} height={300} sx={{ mx: 'auto' }} />
                                    ) : statusChartData.length > 0 ? (
                                        <PieChart
                                            series={[{
                                                data: statusChartData,
                                                highlightScope: { faded: 'global', highlighted: 'item' },
                                                faded: { innerRadius: 30, additionalRadius: -30 },
                                            }]}
                                            width={undefined}
                                            height={350}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 350,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No status data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {}
                            <Box sx={{ flex: 1 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 450
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        Account Breakdown
                                    </Typography>

                                    {loading ? (
                                        <Grid container spacing={2}>
                                            {[1, 2, 3, 4].map((item) => (
                                                <Grid item xs={6} key={item}>
                                                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {roleChartData.map((role) => (
                                                <Grid item xs={6} key={role.id}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        background: `${role.color}08`,
                                                        border: `1px solid ${role.color}20`,
                                                        textAlign: 'center',
                                                        height: '120px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Box
                                                            sx={{
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: '50%',
                                                                backgroundColor: role.color,
                                                                mx: 'auto',
                                                                mb: 1
                                                            }}
                                                        />
                                                        <Typography variant="h5" sx={{ fontWeight: 700, color: role.color, mb: 0.5 }}>
                                                            {role.value}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>
                                                            {role.label}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}

                                    <Box sx={{
                                        borderTop: '1px solid #e2e8f0',
                                        pt: 2,
                                        mt: 3,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                            Total Accounts: {(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.total || 0}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}

            {}
            {activeTab === 1 && (
                <>
                    {}
                    <Box sx={{ display: 'flex', gap: 3, width: '100%', mb: 4 }}>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<ReceiptOutlined style={{ fontSize: 28 }} />}
                                    value={formatNumber((transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.totalCount || 0)}
                                    label="Total Transactions"
                                    color="#17a2b8"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<AttachMoneyOutlined style={{ fontSize: 28 }} />}
                                    value={formatVND((transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.totalAmount || 0)}
                                    label="Total Transaction Amount"
                                    color="#28a745"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<AccountBalanceWalletOutlined style={{ fontSize: 28 }} />}
                                    value={formatVND((transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.totalServiceFee || 0)}
                                    label="Platform Revenue (Service Fee)"
                                    color="#dc3545"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                            ) : (
                                <StatCard
                                    icon={<CheckCircleOutlined style={{ fontSize: 28 }} />}
                                    value={`${Math.round(((transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.byStatus?.TRANSACTION_SUCCESS || 0) / Math.max((transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.totalCount || 1, 1) * 100)}%`}
                                    label="Success Rate"
                                    color="#6f42c1"
                                />
                            )}
                        </Box>
                    </Box>

                    {}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                        {}
                        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                            {}
                            <Box sx={{ flex: 2, minWidth: 0 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 500,
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: "#1e293b"
                                            }}
                                        >
                                            Daily Revenue Trend
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            gap: 2,
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#64748b',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                Analysis Period:
                                            </Typography>

                                            <Box sx={{
                                                '& .ant-picker': {
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: 'white',
                                                    '&:hover': {
                                                        borderColor: '#dc3545',
                                                    },
                                                    '&.ant-picker-focused': {
                                                        borderColor: '#dc3545',
                                                        boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.1)',
                                                    }
                                                },
                                                '& .ant-picker-input > input': {
                                                    fontSize: '0.875rem',
                                                    color: '#1e293b',
                                                },
                                                '& .ant-picker-separator': {
                                                    color: '#64748b',
                                                }
                                            }}>
                                                <RangePicker
                                                    value={dateRange}
                                                    onChange={handleDateRangeChange}
                                                    format="YYYY-MM-DD"
                                                    allowClear={false}
                                                    size="small"
                                                    placeholder={['Start Date', 'End Date']}
                                                />
                                            </Box>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => fetchTransactionStats()}
                                                disabled={loading}
                                                sx={{
                                                    borderColor: '#28a745',
                                                    color: '#28a745',
                                                    '&:hover': {
                                                        borderColor: '#1e7e34',
                                                        backgroundColor: '#28a74508'
                                                    }
                                                }}
                                            >
                                                {loading ? 'Loading...' : 'Refresh Data'}
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Box sx={{ width: '100%', height: 400 }}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 1 }} />
                                        ) : dailyRevenueData.xAxisData.length > 0 ? (
                                            <LineChart
                                                xAxis={[{
                                                    scaleType: 'point',
                                                    data: dailyRevenueData.xAxisData
                                                }]}
                                                series={[{
                                                    data: dailyRevenueData.seriesData,
                                                    color: '#28a745',
                                                    curve: 'linear',
                                                    label: 'Revenue (VND)'
                                                }]}
                                                width={undefined}
                                                height={400}
                                                margin={{ left: 80, right: 60, top: 20, bottom: 60 }}
                                                sx={{
                                                    '& .MuiChartsAxis-root': {
                                                        '& .MuiChartsAxis-tickLabel': {
                                                            fontSize: '0.75rem',
                                                            fill: '#64748b'
                                                        }
                                                    },
                                                    '& .MuiChartsAxis-bottom': {
                                                        '& .MuiChartsAxis-tickLabel': {
                                                            transform: 'translateY(8px)'
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                height: 400,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                    No revenue data available for the selected period
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>

                            {}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 500,
                                        width: '100%',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        Monthly Revenue
                                    </Typography>

                                    {loading ? (
                                        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 1 }} />
                                    ) : monthlyRevenueData.xAxisData.length > 0 ? (
                                        <BarChart
                                            xAxis={[{
                                                scaleType: 'band',
                                                data: monthlyRevenueData.xAxisData
                                            }]}
                                            series={[{
                                                data: monthlyRevenueData.seriesData,
                                                color: '#6f42c1',
                                                label: 'Monthly Revenue'
                                            }]}
                                            width={undefined}
                                            height={400}
                                            margin={{ left: 80, right: 20, top: 20, bottom: 60 }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 400,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No monthly data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        </Box>

                        {}
                        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                            {}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 400,
                                        width: '100%'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        Transaction Status
                                    </Typography>

                                    {loading ? (
                                        <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
                                    ) : transactionStatusData.length > 0 ? (
                                        <PieChart
                                            series={[{
                                                data: transactionStatusData,
                                                highlightScope: { faded: 'global', highlighted: 'item' },
                                                faded: { innerRadius: 30, additionalRadius: -30 },
                                            }]}
                                            width={undefined}
                                            height={300}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No status data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        height: 400,
                                        width: '100%'
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                            mb: 3
                                        }}
                                    >
                                        Payment Type
                                    </Typography>

                                    {loading ? (
                                        <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
                                    ) : paymentTypeData.length > 0 ? (
                                        <PieChart
                                            series={[{
                                                data: paymentTypeData,
                                                highlightScope: { faded: 'global', highlighted: 'item' },
                                                faded: { innerRadius: 30, additionalRadius: -30 },
                                            }]}
                                            width={undefined}
                                            height={300}
                                        />
                                    ) : (
                                        <Box sx={{
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                                No payment type data available
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        </Box>

                        {}
                        <Box sx={{ width: '100%' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    border: "1px solid #e2e8f0",
                                    height: 'auto'
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#1e293b",
                                        mb: 3
                                    }}
                                >
                                    Transaction Summary
                                </Typography>

                                <Grid container spacing={3} sx={{ width: '100%', mx: 0 }}>
                                    {}
                                    <Grid item xs={12} sm={6} md={3}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #28a74508 0%, #28a74512 100%)',
                                                border: '1px solid #28a74520',
                                                textAlign: 'center',
                                                height: '140px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(40, 167, 69, 0.15)'
                                                }
                                            }}>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#28a745', mb: 1 }}>
                                                    {(transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.byStatus?.TRANSACTION_SUCCESS || 0}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                                    Successful Transactions
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>

                                    {}
                                    <Grid item xs={12} sm={6} md={3}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #dc354508 0%, #dc354512 100%)',
                                                border: '1px solid #dc354520',
                                                textAlign: 'center',
                                                height: '140px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(220, 53, 69, 0.15)'
                                                }
                                            }}>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc3545', mb: 1 }}>
                                                    {(transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.byStatus?.TRANSACTION_FAIL || 0}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                                    Failed Transactions
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>

                                    {}
                                    <Grid item xs={12} sm={6} md={3}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #6f42c108 0%, #6f42c112 100%)',
                                                border: '1px solid #6f42c120',
                                                textAlign: 'center',
                                                height: '140px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(111, 66, 193, 0.15)'
                                                }
                                            }}>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#6f42c1', mb: 1 }}>
                                                    {(transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.byPaymentType?.DESIGN || 0}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                                    Design Payments
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>

                                    {}
                                    <Grid item xs={12} sm={6} md={3}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #fd7e1408 0%, #fd7e1412 100%)',
                                                border: '1px solid #fd7e1420',
                                                textAlign: 'center',
                                                height: '140px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(253, 126, 20, 0.15)'
                                                }
                                            }}>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#fd7e14', mb: 1 }}>
                                                    {(transactionData?.data?.overview || transactionData?.body?.overview || transactionData?.overview)?.byPaymentType?.ORDER || 0}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>
                                                    Order Payments
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}