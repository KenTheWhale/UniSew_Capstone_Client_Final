import React, { useEffect, useMemo, useState } from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {
    AppBar, Avatar, Box, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar, Typography, Dialog, DialogTitle, DialogContent,
    TextField, IconButton, InputAdornment, DialogActions, Chip
} from "@mui/material";
import {
    AccountCircle,
    Assignment,
    DesignServices,
    Logout,
    Chat,
    Search,
    AccessTime,
    ArrowForward, Clear
} from "@mui/icons-material";
import {Button, Tag} from "antd";
import { signout } from "../../services/AccountService.jsx";
import { enqueueSnackbar } from "notistack";
import { useChatRoomsByEmail } from "../../components/designer/useChatRoomsByEmail";

const drawerWidth = 280;

export default function DesignerDashboardLayout() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState("requests");
    const [openHistory, setOpenHistory] = useState(false);
    const [search, setSearch] = useState("");

    const userObj = useMemo(() => {
        try {
            return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        } catch {
            return null;
        }
    }, []);
    const designerEmail = userObj?.customer?.email || userObj?.email || "";

    const rooms = useChatRoomsByEmail(designerEmail);

    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.includes("/designer/requests")) {
            setActiveMenu("requests");
        } else if (pathname.includes("/designer/applied/requests")) {
            setActiveMenu("applied");
        } else {
            setActiveMenu("");
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        const response = await signout();
        if (response && response.status === 200) {
            localStorage.clear();
            enqueueSnackbar(response.data.message, { variant: "success", autoHideDuration: 1000 });
            setTimeout(() => (window.location.href = "/home"), 1000);
        }
    };

    const filteredRooms = rooms.filter((r) => {
        const key = (r.lastMessage || "") + (r.requestId || "") + (r.id || "");
        return key.toLowerCase().includes(search.toLowerCase());
    });

    const navigate = useNavigate();

    const goToRequest = (requestId) => {
        if (!requestId) return;
        navigate(`/designer/applied/requests?openId=${encodeURIComponent(requestId)}`);
        setOpenHistory(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <CssBaseline />

            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    width: "100%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                    zIndex: 1200,
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
                            <img src="/logo.png" alt="UniSew Logo" style={{ height: "32px" }} />
                            <Typography variant="h5" fontWeight="800" sx={{ color: "#FFFFFF" }}>
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
                            {userObj?.role?.toUpperCase() || "DESIGNER"}
                        </Tag>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)" }}>
                                <AccountCircle />
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                                {userObj?.customer?.name || "N/A"}
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main */}
            <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1, mt: "8vh", overflowY: "hidden" }}>
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
                            "&::-webkit-scrollbar": { display: "none" },
                        },
                    }}
                    variant="permanent"
                    anchor="left"
                >
                    {/* Sidebar Header */}
                    <Box sx={{ p: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Designer Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Manage your design projects
                        </Typography>
                    </Box>

                    {/* Navigation */}
                    <Box sx={{ p: 2 }}>
                        <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                            DESIGNS
                        </Typography>
                        <List sx={{ mb: 3 }}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === "requests" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                                        color: activeMenu === "requests" ? "white" : "#495057",
                                        boxShadow: activeMenu === "requests" ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none",
                                        "&:hover": {
                                            background:
                                                activeMenu === "requests"
                                                    ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
                                                    : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                            color: activeMenu === "requests" ? "white" : "#1976d2",
                                            transform: "translateY(-1px)",
                                            boxShadow:
                                                activeMenu === "requests"
                                                    ? "0 6px 16px rgba(102, 126, 234, 0.4)"
                                                    : "0 4px 12px rgba(25, 118, 210, 0.2)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => (window.location.href = "/designer/requests")}
                                >
                                    <ListItemIcon sx={{ color: activeMenu === "requests" ? "white" : "inherit" }}>
                                        <DesignServices />
                                    </ListItemIcon>
                                    <ListItemText primary="Requested Designs" sx={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        background: activeMenu === "applied" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                                        color: activeMenu === "applied" ? "white" : "#495057",
                                        boxShadow: activeMenu === "applied" ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none",
                                        "&:hover": {
                                            background:
                                                activeMenu === "applied"
                                                    ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
                                                    : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                            color: activeMenu === "applied" ? "white" : "#1976d2",
                                            transform: "translateY(-1px)",
                                            boxShadow:
                                                activeMenu === "applied"
                                                    ? "0 6px 16px rgba(102, 126, 234, 0.4)"
                                                    : "0 4px 12px rgba(25, 118, 210, 0.2)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => (window.location.href = "/designer/applied/requests")}
                                >
                                    <ListItemIcon sx={{ color: activeMenu === "applied" ? "white" : "inherit" }}>
                                        <Assignment />
                                    </ListItemIcon>
                                    <ListItemText primary="Applied Designs" sx={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>

                            {/* NEW: Message History */}
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        color: "#495057",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                            color: "#1976d2",
                                            transform: "translateY(-1px)",
                                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => setOpenHistory(true)}
                                >
                                    <ListItemIcon>
                                        <Chat />
                                    </ListItemIcon>
                                    <ListItemText primary="Message History" />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />

                        {/* Account */}
                        <Typography variant="overline" sx={{ px: 2, pb: 1, color: "#6c757d", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px" }}>
                            ACCOUNT MANAGEMENT
                        </Typography>
                        <List sx={{ mb: 3 }}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        color: "#495057",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                            color: "#1976d2",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => (window.location.href = "/designer/profile")}
                                >
                                    <ListItemIcon sx={{ color: "inherit" }}>
                                        <AccountCircle />
                                    </ListItemIcon>
                                    <ListItemText primary="Profile Setting" />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{ my: 3, borderColor: "#e9ecef" }} />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        color: "#dc3545",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                                            color: "#c62828",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={handleLogout}
                                >
                                    <ListItemIcon sx={{ color: "inherit" }}>
                                        <Logout />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
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
                    <Outlet />
                </Box>
            </Box>

            {/* Dialog: Message History */}
            <Dialog
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Chat />
                    Message History
                    <Box sx={{ ml: 'auto', fontSize: '0.875rem', fontWeight: 400 }}>
                        {filteredRooms.length} conversations
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    {/* Search Section */}
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            placeholder="🔍 Search by request ID or message content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: '#667eea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: search && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setSearch('')}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Results Section */}
                    <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                        {filteredRooms.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                color: 'text.secondary'
                            }}>
                                <Chat sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                    No conversations found
                                </Typography>
                                <Typography variant="body2">
                                    {search ? 'Try adjusting your search terms' : 'Start a conversation to see it here'}
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {filteredRooms.map((r, index) => (
                                    <ListItem
                                        key={r.id}
                                        disablePadding
                                        sx={{
                                            borderBottom: index < filteredRooms.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                bgcolor: 'rgba(102, 126, 234, 0.04)'
                                            }
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => goToRequest(r.requestId)}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 2
                                            }}
                                        >
                                            {/* Avatar/Icon */}
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.875rem',
                                                flexShrink: 0
                                            }}>
                                                #{r.requestId?.toString().slice(-2) || 'NA'}
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        Request #{r.requestId || "N/A"}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label="Active"
                                                        color="success"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                </Box>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    {r.lastMessage ? r.lastMessage : "No messages yet"}
                                                </Typography>

                                                {/* Metadata */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                        <AccessTime sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                                        {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Recently'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                        {r.messageCount || 0} messages
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Action Button */}
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    goToRequest(r.requestId);
                                                }}
                                                sx={{
                                                    color: '#667eea',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(102, 126, 234, 0.1)'
                                                    }
                                                }}
                                            >
                                                <ArrowForward />
                                            </IconButton>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </DialogContent>

                {/* Footer Actions */}
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpenHistory(false)} color="inherit">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
