import React, {useEffect, useState} from 'react';
import {Avatar, Box, Button, Divider, ListItem, ListItemIcon, ListItemText, Paper, Typography} from "@mui/material";
import {Outlet} from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import {
    AccountCircle,
    DesignServices,
    History,
    PendingActions,
    RequestQuote,
    Settings,
    ShoppingCart
} from '@mui/icons-material';
import {useSnackbar} from "notistack";
import {signout, updateSchoolInfo} from "../../services/AccountService.jsx";
import UpdateSchoolInfoDialog from "../../components/school/popup/UpdateSchoolInfoDialog.jsx";

function Navbar({school, enqueueSnackbar}) {

    const handleSignOut = async () => {
        localStorage.clear();
        const response = await signout()
        if(response){
            enqueueSnackbar("Sign out successful!", {variant: "success"});
            setTimeout(() => {
                window.location.href = "/home";
            }, 1000);
        }
    };

    const menuSections = [
        {
            title: "My Design",
            icon: <DesignServices/>,
            items: [
                {
                    title: "Design Management",
                    icon: <History/>,
                    path: "/school/design"
                },
                {
                    title: "Pending Requests",
                    icon: <PendingActions/>,
                    path: "/school/pending/request"
                }
            ]
        },
        {
            title: "My Order",
            icon: <ShoppingCart/>,
            items: [
                {
                    title: "Order History",
                    icon: <History/>,
                    path: "/school/order"
                },
                {
                    title: "Quotation Order",
                    icon: <RequestQuote/>,
                    path: "/school/order/quotation"
                }
            ]
        },
        {
            title: "My Account",
            icon: <AccountCircle/>,
            items: [
                {
                    title: "Profile Setting",
                    icon: <Settings/>,
                    path: "/school/profile"
                }
            ]
        }
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                backgroundColor: "white",
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
                borderRight: "2px solid #f0f4f8",
                borderRadius: 0,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
        >

            {/* Navigation Menu */}
            <Box sx={{flexGrow: 1, py: 2}}>
                {menuSections.map((section, sectionIndex) => (
                    <Box key={sectionIndex} sx={{mb: 1}}>
                        {/* Section Header */}
                        <ListItem
                            sx={{
                                px: 3,
                                py: 2,
                                backgroundColor: '#f8fafc',
                                borderLeft: '4px solid #1976d2',
                                mb: 1
                            }}
                        >
                            <ListItemIcon sx={{minWidth: 40}}>
                                {React.cloneElement(section.icon, {
                                    sx: {
                                        color: '#1976d2',
                                        fontSize: 24
                                    }
                                })}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {section.title}
                                    </Typography>
                                }
                            />
                        </ListItem>

                        {/* Section Items */}
                        {section.items.map((item, itemIndex) => (
                            <ListItem
                                key={itemIndex}
                                button={'true'}
                                sx={{
                                    pr: 3,
                                    py: 1.5,
                                    mx: 2,
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        bgcolor: '#e3f2fd',
                                        transform: 'translateX(2px)',
                                        cursor: 'pointer'
                                    }
                                }}
                                onClick={() => {
                                    window.location.href = item.path;
                                }}
                            >
                                <ListItemIcon sx={{minWidth: 36}}>
                                    {React.cloneElement(item.icon, {
                                        sx: {
                                            color: '#64748b',
                                            fontSize: 20
                                        }
                                    })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            sx={{
                                                fontSize: '0.875rem',
                                                color: '#475569',
                                                fontWeight: 500
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </Box>
                ))}
            </Box>

            <Divider sx={{mx: 2, mb: 2}}/>

            {/* User Account Section */}
            <Box
                sx={{
                    p: 3,
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0'
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                    <Avatar
                        alt="User Avatar"
                        src={school.customer.avatar}
                        slotProps={{
                            img: {
                                referrerPolicy: 'no-referrer',
                            }
                        }}
                        sx={{
                            width: 48,
                            height: 48,
                            border: '2px solid #e2e8f0'
                        }}
                    />
                    <Box sx={{flexGrow: 1}}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                color: '#1e293b',
                                lineHeight: 1.2,
                                mb: 0.5
                            }}
                        >
                            {school.customer.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#64748b',
                                fontSize: '0.75rem',
                                display: 'block',
                                lineHeight: 1.2
                            }}
                        >
                            School Administrator
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#94a3b8',
                                fontSize: '0.7rem'
                            }}
                        >
                            {school.email}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<LogoutIcon sx={{fontSize: 16}}/>}
                    sx={{
                        mt: 2,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        py: 1,
                        '&:hover': {
                            bgcolor: '#fee2e2',
                            borderColor: '#f87171',
                            color: '#dc2626'
                        }
                    }}
                    onClick={handleSignOut}
                >
                    Sign Out
                </Button>
            </Box>
        </Paper>
    )
}

function Content() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                height: 'max-content',
                overflowY: 'hidden',
                overflowX: 'hidden',
                backgroundColor: '#fafafa'
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default function WebAppDashboard() {
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [schoolData, setSchoolData] = useState(null);
    const [isChecking, setIsChecking] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const schoolString = localStorage.getItem('user')
    if (!schoolString) {
        window.location.href = '/login'
    }

    const user = JSON.parse(schoolString)


    // Kiểm tra thông tin trường học
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
                
                enqueueSnackbar("Update school information successfully!", { variant: "success" });
                setShowUpdateDialog(false);

                window.location.href = '/school/design';
            } else {
                enqueueSnackbar("Error updating school information!", { variant: "error" });
            }
        } catch (error) {
            console.error('Error updating school info:', error);
            enqueueSnackbar("Error updating school information!", { variant: "error" });
        }
    };

    const handleCloseDialog = () => {
        window.location.href = '/home';
    };

    return (
        <Box sx={{display: 'flex', height: 'max-content', backgroundColor: '#fafafa', overflow: 'hidden'}}>
            <Box sx={{width: 280, flexShrink: 0}}>
                <Navbar school={user} enqueueSnackbar={enqueueSnackbar}/>
            </Box>
            <Box sx={{flexGrow: 1}}>
                <Content/>
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