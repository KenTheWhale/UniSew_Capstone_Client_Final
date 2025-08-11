import React, {useEffect, useState} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from '@mui/material';
import {
    AccountCircle, 
    Assignment, 
    LocalShipping, 
    Logout, 
    Inventory,
    Assessment,
    Settings
} from '@mui/icons-material';
import {Tag} from 'antd';
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";

const drawerWidth = 280;

export default function GarmentDashboardLayout() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState('orders');

    // Determine active menu based on current URL
    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.includes('/garment/orders')) {
            setActiveMenu('orders');
        } else if (pathname.includes('/garment/production')) {
            setActiveMenu('production');
        } else if (pathname.includes('/garment/inventory')) {
            setActiveMenu('inventory');
        } else if (pathname.includes('/garment/reports')) {
            setActiveMenu('reports');
        } else if (pathname.includes('/garment/settings')) {
            setActiveMenu('settings');
        } else {
            // If current route doesn't match any navbar items, set no active menu
            setActiveMenu('');
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        const response = await signout()
        if (response && response.status === 200) {
            localStorage.clear()
            enqueueSnackbar(response.data.message, {variant: "success", autoHideDuration: 1000})
            setTimeout(() => {
                window.location.href = '/home'
            }, 1000)
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <CssBaseline/>

            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 20px rgba(5, 150, 105, 0.3)',
                    zIndex: 1200
                }}
            >
                <Toolbar sx={{justifyContent: 'space-between', py: 1}}>
                    {/* Logo Section */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            px: 2,
                            py: 1
                        }}>
                            <img src="/logo.png" alt="UniSew Logo" style={{height: '32px'}}/>
                            <Typography variant="h5" fontWeight="800" sx={{color: '#FFFFFF'}}>
                                UNISEW
                            </Typography>
                        </Box>

                        {/* Center Section - Role Tag */}
                        <Tag
                            color="success"
                            style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: '#FFFFFF'
                            }}
                        >
                            {JSON.parse(localStorage.getItem("user"))?.role?.toUpperCase() || 'GARMENT'}
                        </Tag>
                    </Box>

                    {/* Right Section - User Info */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {/* User Profile */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 3,
                            px: 2,
                            py: 1,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-1px)'
                            }
                        }}>
                            <Avatar sx={{width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)'}}>
                                <AccountCircle/>
                            </Avatar>
                            <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#FFFFFF'}}>
                                {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).customer.name : "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main content area */}
            <Box sx={{display: 'flex', flexDirection: 'row', flexGrow: 1, mt: '8vh', overflowY: 'hidden'}}>
                {/* Sidebar */}
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            position: 'static',
                            background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
                            borderRight: '1px solid #e9ecef',
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        },
                    }}
                    variant="permanent"
                    anchor="left"
                >
                    {/* Sidebar Header */}
                    <Box sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                            Garment Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.9}}>
                            Manage production & orders
                        </Typography>
                    </Box>

                    {/* Navigation Menu */}
                    <Box sx={{p: 2}}>
                        {/* Orders Section */}
                        <Typography
                            variant="overline"
                            sx={{
                                px: 2,
                                pb: 1,
                                color: '#6c757d',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}
                        >
                            ORDERS
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === 'orders'
                                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                            : 'transparent',
                                        color: activeMenu === 'orders' ? 'white' : '#495057',
                                        boxShadow: activeMenu === 'orders'
                                            ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            : 'none',
                                        '&:hover': {
                                            background: activeMenu === 'orders'
                                                ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                                                : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                            color: activeMenu === 'orders' ? 'white' : '#059669',
                                            transform: 'translateY(-1px)',
                                            boxShadow: activeMenu === 'orders'
                                                ? '0 6px 16px rgba(5, 150, 105, 0.4)'
                                                : '0 4px 12px rgba(5, 150, 105, 0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.location.href = '/garment/orders'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'orders' ? 'white' : 'inherit'}}>
                                        <Assignment/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Order Management"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        {/* Production Section */}
                        <Typography
                            variant="overline"
                            sx={{
                                px: 2,
                                pb: 1,
                                color: '#6c757d',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}
                        >
                            PRODUCTION
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === 'production'
                                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                            : 'transparent',
                                        color: activeMenu === 'production' ? 'white' : '#495057',
                                        boxShadow: activeMenu === 'production'
                                            ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            : 'none',
                                        '&:hover': {
                                            background: activeMenu === 'production'
                                                ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                                                : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                            color: activeMenu === 'production' ? 'white' : '#059669',
                                            transform: 'translateY(-1px)',
                                            boxShadow: activeMenu === 'production'
                                                ? '0 6px 16px rgba(5, 150, 105, 0.4)'
                                                : '0 4px 12px rgba(5, 150, 105, 0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.location.href = '/garment/production'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'production' ? 'white' : 'inherit'}}>
                                        <LocalShipping/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Production Line"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === 'inventory'
                                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                            : 'transparent',
                                        color: activeMenu === 'inventory' ? 'white' : '#495057',
                                        boxShadow: activeMenu === 'inventory'
                                            ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            : 'none',
                                        '&:hover': {
                                            background: activeMenu === 'inventory'
                                                ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                                                : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                            color: activeMenu === 'inventory' ? 'white' : '#059669',
                                            transform: 'translateY(-1px)',
                                            boxShadow: activeMenu === 'inventory'
                                                ? '0 6px 16px rgba(5, 150, 105, 0.4)'
                                                : '0 4px 12px rgba(5, 150, 105, 0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.location.href = '/garment/inventory'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'inventory' ? 'white' : 'inherit'}}>
                                        <Inventory/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Inventory Management"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        {/* Analytics Section */}
                        <Typography
                            variant="overline"
                            sx={{
                                px: 2,
                                pb: 1,
                                color: '#6c757d',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}
                        >
                            ANALYTICS
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === 'reports'
                                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                            : 'transparent',
                                        color: activeMenu === 'reports' ? 'white' : '#495057',
                                        boxShadow: activeMenu === 'reports'
                                            ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            : 'none',
                                        '&:hover': {
                                            background: activeMenu === 'reports'
                                                ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                                                : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                            color: activeMenu === 'reports' ? 'white' : '#059669',
                                            transform: 'translateY(-1px)',
                                            boxShadow: activeMenu === 'reports'
                                                ? '0 6px 16px rgba(5, 150, 105, 0.4)'
                                                : '0 4px 12px rgba(5, 150, 105, 0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.location.href = '/garment/reports'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'reports' ? 'white' : 'inherit'}}>
                                        <Assessment/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Reports & Analytics"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{my: 3, borderColor: '#e9ecef'}}/>

                        {/* Account Management Section */}
                        <Typography
                            variant="overline"
                            sx={{
                                px: 2,
                                pb: 1,
                                color: '#6c757d',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}
                        >
                            ACCOUNT MANAGEMENT
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton 
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === 'settings'
                                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                            : 'transparent',
                                        color: activeMenu === 'settings' ? 'white' : '#495057',
                                        boxShadow: activeMenu === 'settings'
                                            ? '0 4px 12px rgba(5, 150, 105, 0.3)'
                                            : 'none',
                                        '&:hover': {
                                            background: activeMenu === 'settings'
                                                ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                                                : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                            color: activeMenu === 'settings' ? 'white' : '#059669',
                                            transform: 'translateY(-1px)',
                                            boxShadow: activeMenu === 'settings'
                                                ? '0 6px 16px rgba(5, 150, 105, 0.4)'
                                                : '0 4px 12px rgba(5, 150, 105, 0.2)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.location.href = '/garment/settings'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'settings' ? 'white' : 'inherit'}}>
                                        <Settings/>
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Settings"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        {/* Logout Section */}
                        <Divider sx={{my: 3, borderColor: '#e9ecef'}}/>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        color: '#dc3545',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                                            color: '#c62828',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={handleLogout}
                                >
                                    <ListItemIcon sx={{color: 'inherit'}}>
                                        <Logout/>
                                    </ListItemIcon>
                                    <ListItemText primary="Logout"/>
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        p: 4,
                        overflowY: 'auto',
                        minHeight: 'calc(100vh - 8vh)'
                    }}
                >
                    <Outlet/>
                </Box>
            </Box>
        </Box>
    );
}
