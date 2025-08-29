import React, {useEffect, useState, useMemo} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    CssBaseline,
    Divider,
    Toolbar,
    Typography,
    Popover,
    Badge
} from '@mui/material';
import {
    AccountCircle,
    Assignment,
    LocalShipping,
    Logout,
    Flag,
    Assessment,
    Settings,
    Factory,
    Feedback
} from '@mui/icons-material';
import {Tag} from 'antd';
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";
import Bell from "../../components/ui/Bell.jsx";

function Navbar({userObj, activeMenu, navigate}) {
    return (
        <Box
            sx={{
                width: 280,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 280,
                    boxSizing: "border-box",
                    position: "static",
                    background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
                    borderRight: "1px solid #e9ecef",
                    overflowX: "hidden",
                    overflowY: "auto",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                },
            }}
        >
            {}
            <Box sx={{ p: 3, background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)", color: "white", textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Garment Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manage Production & Orders
                </Typography>
            </Box>

            {}
            <Box sx={{ p: 2 }}>
                {}
                <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                    Order Management
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: activeMenu === 'pending' ? "#FFFFFF" : "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: activeMenu === 'pending' ? "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)" : "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => navigate('/garment/pending/order')}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Assignment sx={{ color: "inherit", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Pending Orders
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />

                {}
                <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                    PRODUCTION
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: activeMenu === 'milestone' ? "#FFFFFF" : "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: activeMenu === 'milestone' ? "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)" : "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => navigate('/garment/milestone')}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Flag sx={{ color: "inherit", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Milestone Management
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />

                {}
                <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                    CUSTOMER FEEDBACK
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: activeMenu === 'feedbacks' ? "#FFFFFF" : "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: activeMenu === 'feedbacks' ? "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)" : "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => navigate('/garment/feedbacks')}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Feedback sx={{ color: "inherit", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Feedback & Reports
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />

                {}
                <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                    ANALYTICS
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: activeMenu === 'reports' ? "#FFFFFF" : "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: activeMenu === 'reports' ? "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)" : "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => navigate('/garment/reports')}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Assessment sx={{ color: "inherit", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Reports & Analytics
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />

                {}
                <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                    ACCOUNT MANAGEMENT
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: activeMenu === 'settings' ? "#FFFFFF" : "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: activeMenu === 'settings' ? "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)" : "transparent",
                            "&:hover": {
                                background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => navigate('/garment/settings')}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Settings sx={{ color: "inherit", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Settings
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Content() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                p: 4
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default function GarmentDashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('orders');
    const [anchorEl, setAnchorEl] = useState(null);

    const userObj = useMemo(() => {
        try {
            return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.includes('/garment/pending/order')) {
            setActiveMenu('pending');
        } else if (pathname.includes('/garment/orders')) {
            setActiveMenu('orders');
        } else if (pathname.includes('/garment/production')) {
            setActiveMenu('production');
        } else if (pathname.includes('/garment/milestone')) {
            setActiveMenu('milestone');
        } else if (pathname.includes('/garment/feedbacks')) {
            setActiveMenu('feedbacks');
        } else if (pathname.includes('/garment/reports')) {
            setActiveMenu('reports');
        } else if (pathname.includes('/garment/settings')) {
            setActiveMenu('settings');
        } else {
            setActiveMenu('');
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        const response = await signout()
        if (response && response.status === 200) {
            if (localStorage.length > 0){
                localStorage.clear();
            }
            if(sessionStorage.length > 0){
                sessionStorage.clear()
            }
            enqueueSnackbar(response.data.message, {variant: "success", autoHideDuration: 1000})
            setTimeout(() => {
                window.location.href = '/home'
            }, 1000)
        }
    }

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa', overflow: 'hidden'}}>
            <CssBaseline />

            {}
            <AppBar
                position="static"
                sx={{
                    background: "linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 20px rgba(63, 81, 181, 0.3)",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                background: "rgba(255, 255, 255, 0.1)",
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                            }}
                        >
                            <Typography onClick={() => window.location.href = "/home"} variant="h5" fontWeight="800" sx={{ cursor:"pointer", color: "#FFFFFF" }}>
                                UNISEW
                            </Typography>
                        </Box>

                        <Tag
                            color="primary"
                            style={{
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                background: "rgba(255, 255, 255, 0.2)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                color: "#FFFFFF",
                            }}
                        >
                            GARMENT FACTORY
                        </Tag>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/*<Bell />*/}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                background: "rgba(255, 255, 255, 0.1)",
                                borderRadius: 3,
                                px: 2,
                                py: 1,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "rgba(255, 255, 255, 0.2)",
                                    transform: "translateY(-1px)",
                                },
                            }}
                            onClick={handleProfileClick}
                        >
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    <Factory sx={{ fontSize: 16, color: '#3f51b5' }} />
                                }
                            >
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)" }}
                                    src={userObj?.customer?.avatar}
                                    slotProps={{
                                        img: {
                                            referrerPolicy: 'no-referrer',
                                        }
                                    }}
                                >
                                    <AccountCircle />
                                </Avatar>
                            </Badge>
                            <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#FFFFFF'}}>
                                {userObj?.customer?.name || "Garment Factory"}
                            </Typography>
                        </Box>

                        <Popover
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handlePopoverClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    minWidth: 200,
                                }
                            }}
                        >
                            <Box sx={{ p: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 1,
                                    background: 'rgba(63, 81, 181, 0.05)'
                                }}>
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: "rgba(63, 81, 181, 0.2)" }}
                                            src={userObj?.customer?.avatar}
                                            slotProps={{
                                                img: {
                                                    referrerPolicy: 'no-referrer',
                                                }
                                            }}
                                    >
                                        <AccountCircle />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {userObj?.customer?.name || userObj?.email || "Garment Factory"}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Garment Factory
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        color: '#dc3545',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: 'rgba(220, 53, 69, 0.1)',
                                        }
                                    }}
                                    onClick={() => {
                                        handlePopoverClose();
                                        handleLogout();
                                    }}
                                >
                                    <Logout sx={{ fontSize: 20, color: '#dc3545' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Logout
                                    </Typography>
                                </Box>
                            </Box>
                        </Popover>
                    </Box>
                </Toolbar>
            </AppBar>

            {}
            <Box sx={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                <Box sx={{width: 280, flexShrink: 0}}>
                    <Navbar userObj={userObj} activeMenu={activeMenu} navigate={navigate}/>
                </Box>
                <Box sx={{flexGrow: 1}}>
                    <Content/>
                </Box>
            </Box>
        </Box>
    );
}
