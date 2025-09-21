import React, {useEffect, useState} from 'react';
import {AppBar, Avatar, Badge, Box, CssBaseline, Divider, Popover, Toolbar, Typography} from "@mui/material";
import {Outlet} from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import {AccountCircle, DesignServices, History, School, Settings} from '@mui/icons-material';
import {useSnackbar} from "notistack";
import {signout, updateSchoolInfo} from "../../services/AccountService.jsx";
import UpdateSchoolInfoDialog from "../../components/school/design/dialog/UpdateSchoolInfoDialog.jsx";
import {Tag} from "antd";

function Navbar({school, enqueueSnackbar}) {
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
                    "&::-webkit-scrollbar": {display: "none"},
                },
            }}
        >
            {}
            <Box sx={{
                p: 3,
                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                color: "white",
                textAlign: "center"
            }}>
                <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>
                    School Dashboard
                </Typography>
                <Typography variant="body2" sx={{opacity: 0.9}}>
                    Manage Your School Uniform
                </Typography>
            </Box>

            {}
            <Box sx={{p: 2}}>
                {}
                <Typography variant="overline" sx={{
                    px: 2,
                    pb: 1,
                    color: "#6c757d",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "1px"
                }}>
                    DESIGN MANAGEMENT
                </Typography>
                <Box sx={{mb: 3}}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => window.location.href = "/school/design"}
                    >
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <DesignServices sx={{color: "inherit", fontSize: 20}}/>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                My Designs
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{my: 3, borderColor: "#e9ecef"}}/>

                {}
                <Typography variant="overline" sx={{
                    px: 2,
                    pb: 1,
                    color: "#6c757d",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "1px"
                }}>
                    ORDER MANAGEMENT
                </Typography>
                <Box sx={{mb: 3}}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => window.location.href = "/school/order"}
                    >
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <History sx={{color: "inherit", fontSize: 20}}/>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                My Orders
                            </Typography>
                        </Box>
                    </Box>

                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                    {}
                </Box>

                <Divider sx={{my: 3, borderColor: "#e9ecef"}}/>

                {}
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
                <Box sx={{mb: 3}}>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => window.location.href = "/school/transaction"}
                    >
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <History sx={{color: "inherit", fontSize: 20}}/>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                My Transactions
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => window.location.href = "/school/withdraw"}
                    >
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <History sx={{color: "inherit", fontSize: 20}}/>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                Withdraw
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            color: "#495057",
                            p: 2,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                                color: "#FFFFFF",
                                transform: "translateY(-1px)",
                            },
                        }}
                        onClick={() => window.location.href = "/school/profile"}
                    >
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Settings sx={{color: "inherit", fontSize: 20}}/>
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                Profile Setting
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
            <Box sx={{flex: 1}}>
                <Outlet/>
            </Box>
        </Box>
    );
}

export default function SchoolDashboardLayout() {
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [schoolData, setSchoolData] = useState(null);
    const [isChecking, setIsChecking] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const {enqueueSnackbar} = useSnackbar();

    const schoolString = localStorage.getItem('user')
    if (!schoolString) {
        window.location.href = '/login'
    }

    const user = JSON.parse(schoolString)

    const handleSignOut = async () => {
        const response = await signout()
        if (response) {
            if (localStorage.length > 0) {
                localStorage.clear();
            }
            if (sessionStorage.length > 0) {
                sessionStorage.clear()
            }
            enqueueSnackbar("Sign out successful!", {variant: "success"});
            setTimeout(() => {
                window.location.href = "/home";
            }, 1000);
        }
    };

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    useEffect(() => {
        const checkSchoolInfo = () => {
            const customer = user?.customer;
            if (!customer) {
                setIsChecking(false);
                return;
            }

            const requiredFields = ['business', 'address', 'taxCode', 'phone'];
            const missingFields = requiredFields.filter(field => {
                const value = customer[field];
                return !value || value === 'N/A' || value.trim() === '';
            });

            if (missingFields.length > 0) {
                setSchoolData(customer);
                setShowUpdateDialog(true);
            }

            setIsChecking(false);
        };

        const timer = setTimeout(() => {
            checkSchoolInfo();
        }, 500);

        return () => clearTimeout(timer);
    }, [user]);

    const handleUpdateSchoolInfo = async (formData) => {
        try {
            const response = await updateSchoolInfo(formData);
            if (response && response.status === 200) {
                const updatedUser = {
                    ...user,
                    customer: {
                        ...user.customer,
                        ...formData
                    }
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                enqueueSnackbar("Update school information successfully!", {variant: "success"});
                setShowUpdateDialog(false);

                window.location.href = '/school/design';
            } else {
                enqueueSnackbar("Error updating school information!", {variant: "error"});
            }
        } catch (error) {
            console.error('Error updating school info:', error);
            enqueueSnackbar("Error updating school information!", {variant: "error"});
        }
    };

    const handleCloseDialog = () => {
        window.location.href = '/home';
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#fafafa',
            overflow: 'hidden'
        }}>
            <CssBaseline/>

            {}
            <AppBar
                position="static"
                sx={{
                    background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 20px rgba(46, 125, 50, 0.3)",
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
                            <Typography onClick={() => window.location.href = "/home"} variant="h5" fontWeight="800"
                                        sx={{cursor: "pointer", color: "#FFFFFF"}}>
                                UNISEW
                            </Typography>
                        </Box>

                        <Tag
                            color="success"
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
                            SCHOOL PANEL
                        </Tag>
                    </Box>

                    <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
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
                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                badgeContent={
                                    <School sx={{fontSize: 16, color: '#2e7d32'}}/>
                                }
                            >
                                <Avatar
                                    sx={{width: 32, height: 32, bgcolor: "rgba(255, 255, 255, 0.2)"}}
                                    src={user.customer.avatar}
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
                                {user.customer.name}
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
                                    background: 'rgba(46, 125, 50, 0.05)'
                                }}>
                                    <Avatar sx={{width: 40, height: 40, bgcolor: "rgba(46, 125, 50, 0.2)"}}
                                            src={user.customer.avatar}
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
                                            {user.customer.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                            School Administrator
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
                                        handlePopoverClose();
                                        handleSignOut();
                                    }}
                                >
                                    <LogoutIcon sx={{fontSize: 20, color: '#dc3545'}}/>
                                    <Typography variant="body2" sx={{fontWeight: 500}}>
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
                    <Navbar school={user} enqueueSnackbar={enqueueSnackbar}/>
                </Box>
                <Box sx={{flexGrow: 1}}>
                    <Content/>
                </Box>
            </Box>

            <UpdateSchoolInfoDialog
                open={showUpdateDialog}
                onClose={handleCloseDialog}
                onUpdate={handleUpdateSchoolInfo}
                initialData={schoolData}
            />
        </Box>
    )
}