import React, {useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {
    AppBar, Avatar, Box, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar, Typography, Badge, Chip, Popover
} from "@mui/material";
import {
    AccountCircle,
    Dashboard,
    People,
    Receipt,
    Settings,
    Logout,
    AdminPanelSettings,
    Assessment,
    Business,
    School,
    DesignServices
} from "@mui/icons-material";
import {Tag} from "antd";
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";

const drawerWidth = 280;

export default function AdminDashboardLayout() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [anchorEl, setAnchorEl] = useState(null);

    const userObj = useMemo(() => {
        try {
            return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        setActiveMenu("");
    }, [location.pathname]);

    const handleLogout = async () => {
        const response = await signout();
        if (response && response.status === 200) {
            localStorage.clear();
            enqueueSnackbar(response.data.message, {variant: "success", autoHideDuration: 1000});
            setTimeout(() => (window.location.href = "/home"), 1000);
        }
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const navigate = useNavigate();

    const menuItems = [];

    // Render Header Function
    const renderHeader = () => (
        <AppBar
            position="fixed"
            sx={{
                width: "100%",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                color: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                zIndex: 1200,
            }}
        >
            <Toolbar sx={{justifyContent: "space-between", py: 1}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
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
                        <Typography variant="h5" fontWeight="800" sx={{color: "#FFFFFF"}}>
                            UNISEW
                        </Typography>
                    </Box>

                    <Tag
                        color="processing"
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
                        ADMIN PANEL
                    </Tag>
                </Box>

                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
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
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            badgeContent={
                                <AdminPanelSettings sx={{fontSize: 16, color: '#1976d2'}}/>
                            }
                        >
                            <Avatar sx={{width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)"}}>
                                <AccountCircle/>
                            </Avatar>
                        </Badge>
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
                        <Box sx={{p: 2}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 1,
                                mb: 1,
                                background: 'rgba(102, 126, 234, 0.05)'
                            }}>
                                <Avatar sx={{width: 40, height: 40, bgcolor: "rgba(102, 126, 234, 0.2)"}}>
                                    <AccountCircle/>
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" sx={{fontWeight: 600, color: 'text.primary'}}>
                                        {userObj?.customer?.name || userObj?.email || "Admin"}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                        Administrator
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{my: 1}}/>

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
                                    handleLogout();
                                    handlePopoverClose();
                                }}
                            >
                                <Logout sx={{fontSize: 20, color: '#dc3545'}}/>
                                <Typography variant="body2" sx={{fontWeight: 500}}>
                                    Logout
                                </Typography>
                            </Box>
                        </Box>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );

    // Render Content Function
    const renderContent = () => (
        <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1, mt: "8vh", overflowY: "hidden"}}>
            {/* Sidebar */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        position: "static",
                        background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
                        borderRight: "1px solid #e9ecef",
                        overflowX: "hidden",
                        overflowY: "auto",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {display: "none"},
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                {/* Sidebar Header */}
                <Box sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    color: "white",
                    textAlign: "center"
                }}>
                    <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{opacity: 0.9}}>
                        Manage UniSew System
                    </Typography>
                </Box>

                {/* Navigation */}
                <Box sx={{p: 2}}>
                    {/* System Overview */}
                    <Typography variant="overline" sx={{
                        px: 2,
                        pb: 1,
                        color: "#6c757d",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        letterSpacing: "1px"
                    }}>
                        DASHBOARD FEATURES
                    </Typography>
                    <List sx={{mb: 3}}>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: "#495057",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                        color: "#FFFFFF",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                                onClick={() => navigate("/admin/dashboard")}
                            >
                                <ListItemIcon sx={{color: "inherit"}}>
                                    <Assessment/>
                                </ListItemIcon>
                                <ListItemText primary="Statistics Report"/>
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: "#495057",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                        color: "#FFFFFF",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                                onClick={() => navigate("/admin/transactions")}
                            >
                                <ListItemIcon sx={{color: "inherit"}}>
                                    <Receipt/>
                                </ListItemIcon>
                                <ListItemText primary="Transactions"/>
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: "#495057",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                        color: "#FFFFFF",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                                onClick={() => navigate("/admin/reports")}
                            >
                                <ListItemIcon sx={{color: "inherit"}}>
                                    <Assessment/>
                                </ListItemIcon>
                                <ListItemText primary="Reports & Feedback"/>
                            </ListItemButton>
                        </ListItem>
                    </List>

                    <Divider sx={{my: 3, borderColor: "#e9ecef"}}/>

                    {/* Account Management */}
                    <Typography variant="overline" sx={{
                        px: 2,
                        pb: 1,
                        color: "#6c757d",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        letterSpacing: "1px"
                    }}>
                        ACCOUNT MANAGEMENT
                    </Typography>
                    <List sx={{mb: 3}}>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: "#495057",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                        color: "#FFFFFF",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                                onClick={() => navigate("/admin/accounts")}
                            >
                                <ListItemIcon sx={{color: "inherit"}}>
                                    <People/>
                                </ListItemIcon>
                                <ListItemText primary="System Accounts"/>
                            </ListItemButton>
                        </ListItem>

                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.5,
                                    color: "#495057",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                        color: "#FFFFFF",
                                        transform: "translateY(-1px)",
                                    },
                                    transition: "all 0.3s ease",
                                }}
                                onClick={() => navigate("/admin/requests")}
                            >
                                <ListItemIcon sx={{color: "inherit"}}>
                                    <AccountCircle/>
                                </ListItemIcon>
                                <ListItemText primary="Account Requests"/>
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
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    p: 4,
                    overflowY: "auto",
                    minHeight: "calc(100vh - 8vh)",
                }}
            >
                <Outlet/>
            </Box>
        </Box>
    );

    return (
        <Box sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <CssBaseline/>
            {renderHeader()}
            {renderContent()}
        </Box>
    );
}