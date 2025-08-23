import React, {useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {
    AppBar, Avatar, Box, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar, Typography, Dialog, DialogTitle, DialogContent,
    TextField, IconButton, InputAdornment, DialogActions, Chip, Badge, Popover
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
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";
import {useChatRoomsByEmail} from "../../components/designer/useChatRoomsByEmail";
import {getCookie} from "../../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";

const drawerWidth = 280;

export default function DesignerDashboardLayout() {
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState("requests");
    const [openHistory, setOpenHistory] = useState(false);
    const [search, setSearch] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);

    const userObj = useMemo(() => {
        try {
            return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        } catch {
            return null;
        }
    }, []);

    const cookie = getCookie("access")

    const decode = jwtDecode(cookie)
    console.log("decode", decode)
    const accountId = decode.id;

    const rooms = useChatRoomsByEmail(accountId);

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
            if (localStorage.length > 0){
                localStorage.clear();
            }
            if(sessionStorage.length > 0){
                sessionStorage.clear()
            }
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

    const filteredRooms = rooms.filter((r) => {
        const key = (r.lastMessage || "") + (r.requestId || "") + (r.id || "");
        console.log("r", r)
        return key.toLowerCase().includes(search.toLowerCase());
    });

    const navigate = useNavigate();

    const goToRequest = (requestId) => {
        if (!requestId) return;
        navigate(`/designer/applied/requests?openId=${encodeURIComponent(requestId)}`);
        setOpenHistory(false);
    };

    // Render Header Function
    const renderHeader = () => (
        <AppBar
            position="fixed"
            sx={{
                width: "100%",
                background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                color: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
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
                        DESIGNER PANEL
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
                                <DesignServices sx={{fontSize: 16, color: '#7c3aed'}}/>
                            }
                        >
                            <Avatar
                                sx={{width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)"}}
                                src={userObj?.customer?.avatar}
                                slotProps={{
                                    img: {
                                        referrerPolicy: 'no-referrer',
                                    }
                                }}
                            >
                                <AccountCircle/>
                            </Avatar>
                        </Badge>
                        <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#FFFFFF'}}>
                            {userObj?.customer?.name || "Designer"}
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
                        <Box sx={{p: 2}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 1,
                                mb: 1,
                                background: 'rgba(124, 58, 237, 0.05)'
                            }}>
                                <Avatar
                                    sx={{width: 40, height: 40, bgcolor: "rgba(124, 58, 237, 0.2)"}}
                                    src={userObj?.customer?.avatar}
                                    slotProps={{
                                        img: {
                                            referrerPolicy: 'no-referrer',
                                        }
                                    }}
                                >
                                    <AccountCircle/>
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" sx={{fontWeight: 600, color: 'text.primary'}}>
                                        {userObj?.customer?.name || userObj?.email || "Designer"}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                        Designer
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

    return (
        <Box sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <CssBaseline/>
            {renderHeader()}

            {/* Main */}
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
                        background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                        color: "white",
                        textAlign: "center"
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                            Designer Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{opacity: 0.9}}>
                            Manage Your Design Projects
                        </Typography>
                    </Box>

                    {/* Navigation */}
                    <Box sx={{p: 2}}>
                        {/* Design Projects */}
                        <Typography variant="overline" sx={{
                            px: 2,
                            pb: 1,
                            color: "#6c757d",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            letterSpacing: "1px"
                        }}>
                            DESIGN PROJECTS
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
                                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                                            color: "#FFFFFF",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => navigate("/designer/requests")}
                                >
                                    <ListItemIcon sx={{color: "inherit"}}>
                                        <DesignServices/>
                                    </ListItemIcon>
                                    <ListItemText primary="Requested Designs"/>
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
                                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                                            color: "#FFFFFF",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => navigate("/designer/applied/requests")}
                                >
                                    <ListItemIcon sx={{color: "inherit"}}>
                                        <Assignment/>
                                    </ListItemIcon>
                                    <ListItemText primary="Applied Designs"/>
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider sx={{my: 3, borderColor: "#e9ecef"}}/>

                        {/* Communication */}
                        <Typography variant="overline" sx={{
                            px: 2,
                            pb: 1,
                            color: "#6c757d",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            letterSpacing: "1px"
                        }}>
                            COMMUNICATION
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
                                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                                            color: "#FFFFFF",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => setOpenHistory(true)}
                                >
                                    <ListItemIcon sx={{color: "inherit"}}>
                                        <Chat/>
                                    </ListItemIcon>
                                    <ListItemText primary="Message History"/>
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
                                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                                            color: "#FFFFFF",
                                            transform: "translateY(-1px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => navigate("/designer/profile")}
                                >
                                    <ListItemIcon sx={{color: "inherit"}}>
                                        <AccountCircle/>
                                    </ListItemIcon>
                                    <ListItemText primary="Profile Setting"/>
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
                        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Chat/>
                    Message History
                    <Box sx={{ml: 'auto', fontSize: '0.875rem', fontWeight: 400}}>
                        {filteredRooms.length} conversations
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{p: 0}}>
                    {/* Search Section */}
                    <Box sx={{p: 3, borderBottom: '1px solid', borderColor: 'divider'}}>
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
                                        borderColor: '#7c3aed',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#7c3aed',
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{color: 'text.secondary'}}/>
                                    </InputAdornment>
                                ),
                                endAdornment: search && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setSearch('')}
                                            sx={{color: 'text.secondary'}}
                                        >
                                            <Clear/>
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Results Section */}
                    <Box sx={{maxHeight: '60vh', overflow: 'auto'}}>
                        {filteredRooms.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                color: 'text.secondary'
                            }}>
                                <Chat sx={{fontSize: 48, color: 'text.disabled', mb: 2}}/>
                                <Typography variant="h6" sx={{mb: 1, fontWeight: 500}}>
                                    No conversations found
                                </Typography>
                                <Typography variant="body2">
                                    {search ? 'Try adjusting your search terms' : 'Start a conversation to see it here'}
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{p: 0}}>
                                {filteredRooms.map((r, index) => (
                                    <ListItem
                                        key={r.id}
                                        disablePadding
                                        sx={{
                                            borderBottom: index < filteredRooms.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                bgcolor: 'rgba(124, 58, 237, 0.04)'
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
                                                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
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
                                            <Box sx={{flex: 1, minWidth: 0}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
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
                                                        sx={{fontSize: '0.7rem', height: 20}}
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
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 1}}>
                                                    <Typography variant="caption" sx={{color: 'text.disabled'}}>
                                                        <AccessTime
                                                            sx={{fontSize: 12, mr: 0.5, verticalAlign: 'middle'}}/>
                                                        {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Recently'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{color: 'text.disabled'}}>
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
                                                    color: '#7c3aed',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(124, 58, 237, 0.1)'
                                                    }
                                                }}
                                            >
                                                <ArrowForward/>
                                            </IconButton>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </DialogContent>

                {/* Footer Actions */}
                <DialogActions sx={{p: 2, borderTop: '1px solid', borderColor: 'divider'}}>
                    <Button onClick={() => setOpenHistory(false)} color="inherit">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
