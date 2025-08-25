import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    MenuItem
} from '@mui/material';
import { DatePicker } from 'antd';
import { LineChart, PieChart } from '@mui/x-charts';
import { 
    TrendingUpOutlined, 
    PeopleOutlined, 
    SchoolOutlined, 
    DesignServicesOutlined,
    FactoryOutlined,
    BlockOutlined,
    CheckCircleOutlined
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { getAccountStats } from '../../services/AdminService.jsx';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// StatCard Component
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
    const [groupBy, setGroupBy] = useState('DAY');
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);

    // Fallback data for demo/development
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

    // Fetch account stats
    const fetchAccountStats = useCallback(async () => {
        console.log('fetchAccountStats called, loading:', loading);
        if (loading) {
            console.log('Already loading, skipping...');
            return; // Prevent multiple simultaneous calls
        }
        
        setLoading(true);
        
        // Try API first, fallback to demo data if needed
        
        try {
            const requestData = {
                from: dateRange[0].format('YYYY-MM-DD'),
                to: dateRange[1].format('YYYY-MM-DD'),
                groupBy: groupBy
            };
            
            console.log('Fetching account stats with request:', requestData);
            console.log('Base URL:', window.location.origin);
            console.log('API URL will be: http://localhost:8080/api/v1/admin/account/stats');
            
            // Call real API
            const response = await getAccountStats(requestData);
            console.log('Account stats response:', response);

            if (response && response.status === 200) {
                console.log('Raw response data:', response.data);
                // Handle different response structures
                let processedData = response.data;
                if (response.data.body) {
                    // If response has { message: "...", body: { overview: ..., timeSeries: ... } }
                    processedData = { data: response.data.body };
                } else if (response.data.data) {
                    // If response has { data: { overview: ..., timeSeries: ... } }
                    processedData = response.data;
                } else {
                    // If response is direct { overview: ..., timeSeries: ... }
                    processedData = { data: response.data };
                }
                
                console.log('Processed data structure:', processedData);
                setStatsData(processedData);
                enqueueSnackbar('Statistics loaded successfully', { variant: 'success' });
            } else {
                console.warn('API response not 200, using fallback data');
                setStatsData(getFallbackData());
                enqueueSnackbar(`API response: ${response?.status} - Using demo data`, { variant: 'warning' });
            }
        } catch (error) {
            console.error('Error fetching account stats:', error);
            console.warn('Using fallback data due to API error');
            setStatsData(getFallbackData());
            
            if (error.response?.status === 403) {
                enqueueSnackbar('Using demo data - API access restricted', { variant: 'warning' });
            } else if (error.response?.status === 401) {
                enqueueSnackbar('Authentication required - showing demo data', { variant: 'warning' });
            } else {
                enqueueSnackbar('API error - showing demo data', { variant: 'warning' });
            }
        } finally {
            setLoading(false);
        }
    }, [dateRange, groupBy, loading]);

    // Initial load - only once when component mounts
    useEffect(() => {
        console.log('useEffect triggered, hasInitialLoad:', hasInitialLoad);
        if (!hasInitialLoad) {
            console.log('Setting initial load flag and calling fetchAccountStats');
            setHasInitialLoad(true);
            fetchAccountStats();
        }
    }, []);

    // Prepare time series chart data
    // timeSeries: Chuỗi thời gian tài khoản đăng ký mới trong khoảng [from, to]
    // bucketStart: Ngày bắt đầu bucket (YYYY-MM-DD)
    // count: Số tài khoản đăng ký mới trong bucket đó
    const timeSeriesData = useMemo(() => {
        console.log('Processing timeSeries data, statsData:', statsData);
        // Handle multiple data structure possibilities
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

    // Prepare role chart data
    // overview.byRole: Phân bố tài khoản theo vai trò (toàn hệ thống, không giới hạn thời gian)
    // Ví dụ: { "ADMIN": 1, "SCHOOL": 9, "DESIGNER": 3, "GARMENT": 2 }
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

    // Prepare status chart data  
    // overview.byStatus: Phân bố tài khoản theo trạng thái (toàn hệ thống, không giới hạn thời gian)
    // Ví dụ: { "ACCOUNT_ACTIVE": 15, "ACCOUNT_INACTIVE": 0, "ACCOUNT_REQUEST_PENDING": 0, ... }
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

        // Only show statuses with count > 0
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

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange([dayjs(dates[0]), dayjs(dates[1])]);
        }
    };

    if (loading && !statsData) {
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
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
            {/* Header */}
            <Box 
                sx={{ 
                    mb: 4,
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.08) 100%)",
                    border: "1px solid rgba(220, 53, 69, 0.1)",
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
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
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
                        
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="YYYY-MM-DD"
                            allowClear={false}
                        />
                        
                        <Button
                            variant="contained"
                            onClick={() => {
                                console.log('Manual refresh clicked');
                                fetchAccountStats();
                            }}
                            disabled={loading}
                            sx={{
                                backgroundColor: '#dc3545',
                                '&:hover': { backgroundColor: '#c82333' }
                            }}
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Cards */}
            {/* overview: Tổng quan toàn hệ thống (không giới hạn thời gian) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<PeopleOutlined style={{ fontSize: 28 }} />}
                        value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.total || 0}
                        label="Total Accounts (All Time)"
                        color="#dc3545"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<CheckCircleOutlined style={{ fontSize: 28 }} />}
                        value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.byStatus?.ACCOUNT_ACTIVE || 0}
                        label="Active Accounts (All Time)"
                        color="#28a745"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<BlockOutlined style={{ fontSize: 28 }} />}
                        value={(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.inactiveCount || 0}
                        label="Inactive Accounts (All Time)"
                        color="#dc3545"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<TrendingUpOutlined style={{ fontSize: 28 }} />}
                        value={timeSeriesData.seriesData.reduce((a, b) => a + b, 0)}
                        label={`New Registrations (${dateRange[0]?.format('MM/DD')} - ${dateRange[1]?.format('MM/DD')})`}
                        color="#17a2b8"
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Time Series Chart */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            height: 400
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
                            New Account Registrations Over Time (Selected Period)
                        </Typography>
                        
                        {timeSeriesData.xAxisData.length > 0 ? (
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
                                    No data available for the selected period
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Role Distribution Chart */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            height: 400
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
                        
                        {roleChartData.length > 0 ? (
                            <PieChart
                                series={[{
                                    data: roleChartData,
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
                                    No role data available
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Status Distribution Chart */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            height: 350
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
                        
                        {statusChartData.length > 0 ? (
                            <PieChart
                                series={[{
                                    data: statusChartData,
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30 },
                                }]}
                                width={undefined}
                                height={250}
                            />
                        ) : (
                            <Box sx={{ 
                                height: 250, 
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
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                            height: 350
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
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {roleChartData.map((role) => (
                                <Box key={role.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: role.color
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {role.label}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: role.color }}>
                                        {role.value}
                                    </Typography>
                                </Box>
                            ))}
                            
                            <Box sx={{ borderTop: '1px solid #e2e8f0', pt: 2, mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                                    Total Accounts: {(statsData?.data?.overview || statsData?.body?.overview || statsData?.overview)?.total || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}