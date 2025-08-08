import React, {useState, useEffect} from 'react';
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
    DesignServices,
    Logout,
    People,
    TableChart,
    Timeline,
    Visibility,
    Inventory
} from '@mui/icons-material';
import {Tag} from 'antd';
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";

const drawerWidth = 280;

export default function DesignerDashboardLayout() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState('requests');

    // Determine active menu based on current URL
    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.includes('/designer/requests') || pathname.includes('/designer/dashboard')) {
            setActiveMenu('requests');
        } else if (pathname.includes('/designer/packages')) {
            setActiveMenu('packages');
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
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
                            color="processing"
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
                            {JSON.parse(localStorage.getItem("user"))?.role?.toUpperCase() || 'DESIGNER'}
                        </Tag>
                    </Box>


                    {/* Right Section - User Info */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        {/* Notifications */}
                        {/* <Badge badgeContent={3} color="error">
              <IconButton sx={{ color: 'white' }}>
                <Notifications />
              </IconButton>
            </Badge> */}

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
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                            Designer Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.9}}>
                            Manage your design projects
                        </Typography>
                    </Box>

                    {/* Navigation Menu */}
                    <Box sx={{p: 2}}>
                        {/* Designs Section */}
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
                            DESIGNS
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    background: activeMenu === 'requests'
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    color: activeMenu === 'requests' ? 'white' : '#495057',
                                    boxShadow: activeMenu === 'requests'
                                        ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    '&:hover': {
                                        background: activeMenu === 'requests'
                                            ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                                            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                        color: activeMenu === 'requests' ? 'white' : '#1976d2',
                                        transform: 'translateY(-1px)',
                                        boxShadow: activeMenu === 'requests'
                                            ? '0 6px 16px rgba(102, 126, 234, 0.4)'
                                            : '0 4px 12px rgba(25, 118, 210, 0.2)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                                onClick={() => window.location.href = '/designer/requests'}
                                >
                                    <ListItemIcon sx={{color: activeMenu === 'requests' ? 'white' : 'inherit'}}>
                                        <DesignServices/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Requested Designs"
                                        sx={{fontWeight: 600}}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{my: 3, borderColor: '#e9ecef'}}/>

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
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: '#495057',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                        color: '#1976d2',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <ListItemIcon sx={{color: 'inherit'}}>
                                        <Visibility/>
                                    </ListItemIcon>
                                    <ListItemText primary="Statistics"/>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: '#495057',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                        color: '#2e7d32',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <ListItemIcon sx={{color: 'inherit'}}>
                                        <TableChart/>
                                    </ListItemIcon>
                                    <ListItemText primary="Data"/>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: '#495057',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                                        color: '#f57c00',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <ListItemIcon sx={{color: 'inherit'}}>
                                        <Timeline/>
                                    </ListItemIcon>
                                    <ListItemText primary="Chart"/>
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{my: 3, borderColor: '#e9ecef'}}/>

                        {/* Management Section */}
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
                            MANAGEMENT
                        </Typography>
                        <List sx={{mb: 3}}>
                            <ListItem disablePadding>
                                <ListItemButton sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: '#495057',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                                        color: '#c2185b',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <ListItemIcon sx={{color: 'inherit'}}>
                                        <People/>
                                    </ListItemIcon>
                                    <ListItemText primary="Users"/>
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
