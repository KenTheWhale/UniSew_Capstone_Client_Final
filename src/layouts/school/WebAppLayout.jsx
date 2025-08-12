import React, {useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Collapse,
    Container,
    Divider,
    Fab,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Typography
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Fade from '@mui/material/Fade';
import {Outlet} from "react-router-dom";
import FactoryIcon from '@mui/icons-material/Factory';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import {signout} from "../../services/AccountService.jsx";
import {enqueueSnackbar} from "notistack";
import Bell from "../../components/ui/Bell.jsx";

function TopBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleRegisterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRegister = (role) => {
        if (role === 'designer') {
            setAnchorEl(null);
            window.location.href = '/register/designer'
        } else {
            setAnchorEl(null);
            window.location.href = '/register/garment'
        }
    }

    return (
        <Box sx={{
            width: '100%',
            bgcolor: '#1976d2',
            color: 'white',
            fontSize: 14,
            py: 1,
            // Remove px here, move to Container
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' // Center the Container horizontally
        }}>
            <Container maxWidth={false} sx={{
                px: {xs: 2, md: 8},
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <EmailIcon sx={{fontSize: 16, color: 'rgba(255,255,255,0.9)'}}/>
                        <Typography sx={{color: 'rgba(255,255,255,0.9)'}}>unisewsu2025@gmail.com</Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <PhoneIcon sx={{fontSize: 16, color: 'rgba(255,255,255,0.9)'}}/>
                        <Typography
                            onClick={() => window.open("https://zalo.me/0939674767", "_blank")}
                            sx={{color: 'rgba(255,255,255,0.9)', '&:hover': {cursor: 'pointer'}}}>
                            0939-674-767
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            fontSize: 12,
                            px: 2,
                            '&:hover': {borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)'}
                        }}
                        onClick={handleRegisterClick}
                    >
                        Đăng Ký Trở Thành Đối Tác
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                        transformOrigin={{vertical: 'top', horizontal: 'left'}}
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                boxShadow: '0 6px 24px rgba(25, 118, 210, 0.15)',
                                minWidth: 200,
                                mt: 1,
                                p: 0.5,
                                bgcolor: 'white',
                            }
                        }}
                    >
                        <MenuItem
                            onClick={handleClose}
                            sx={{
                                fontSize: 17,
                                fontWeight: 500,
                                color: '#1976d2',
                                borderRadius: 1,
                                gap: 1.5,
                                '&:hover': {
                                    bgcolor: 'rgba(25,118,210,0.08)',
                                    color: '#1565c0',
                                },
                                transition: 'background 0.2s, color 0.2s',
                            }}
                        >
                            <FactoryIcon sx={{color: '#1976d2', mr: 1}}/> Xưởng May
                        </MenuItem>
                        <MenuItem
                            onClick={() => handleRegister('designer')}
                            sx={{
                                fontSize: 17,
                                fontWeight: 500,
                                color: '#1976d2',
                                borderRadius: 1,
                                gap: 1.5,
                                '&:hover': {
                                    bgcolor: 'rgba(25,118,210,0.08)',
                                    color: '#1565c0',
                                },
                                transition: 'background 0.2s, color 0.2s',
                            }}
                        >
                            <DesignServicesIcon sx={{color: '#1976d2', mr: 1}}/> Nhà Thiết Kế
                        </MenuItem>
                    </Menu>
                </Box>
            </Container>
        </Box>
    );
}

function MainHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleUserMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const response = await signout()
        if (response && response.status === 200) {
            localStorage.clear();
            enqueueSnackbar(response.data.message, {variant: 'success', autoHideDuration: 1000})
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000)
        }
    };

    // Button text and action logic
    const isSignedIn = typeof window !== 'undefined' && localStorage.getItem('user');
    const buttonText = isSignedIn ? 'Khám Phá UniSew' : 'Đăng Nhập';

    const handleButtonClick = (event) => {
        if (!isSignedIn) {
            window.location.href = '/login';
        } else {
            handleUserMenuClick(event);
        }
    };
    return (
        <AppBar position="sticky" elevation={0}
                sx={{bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000}}>
            <Container maxWidth={false} sx={{px: {xs: 2, md: 8}}}>
                <Box sx={{
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box component="img"
                             src="/logo.png"
                             alt="UniSew"
                             sx={{
                                 height: 50,
                                 width: 50,
                                 borderRadius: '50%',
                                 p: 1,
                                 boxShadow: '0 4px 12px rgba(25,118,210,0.3)'
                             }}
                        />
                        <Typography variant="h5" sx={{fontWeight: 800, color: '#1976d2', letterSpacing: 1}}>
                            UniSew
                        </Typography>
                    </Box>
                    {/* Desktop Navigation */}
                    <Box sx={{display: {xs: 'none', md: 'flex'}, gap: 1}}>
                        <Button
                            color="inherit"
                            sx={{
                                fontWeight: 600,
                                color: '#333',
                                fontSize: 16,
                                px: 2,
                                '&:hover': {color: '#1976d2', bgcolor: 'rgba(25,118,210,0.1)'}
                            }}
                            onClick={() => window.location.href = '/home'}
                        >
                            Trang Chủ
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                fontWeight: 600,
                                color: '#333',
                                fontSize: 16,
                                px: 2,
                                '&:hover': {color: '#1976d2', bgcolor: 'rgba(25,118,210,0.1)'}
                            }}
                            onClick={() => window.location.href = '/tutorial'}
                        >
                            Quy Trình Hoạt Động
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                fontWeight: 600,
                                color: '#333',
                                fontSize: 16,
                                px: 2,
                                '&:hover': {color: '#1976d2', bgcolor: 'rgba(25,118,210,0.1)'}
                            }}
                            onClick={() => window.location.href = '/about'}
                        >
                            Về Chúng Tôi
                        </Button>
                        <Button
                            color="inherit"
                            sx={{
                                fontWeight: 600,
                                color: '#333',
                                fontSize: 16,
                                px: 2,
                                '&:hover': {color: '#1976d2', bgcolor: 'rgba(25,118,210,0.1)'}
                            }}
                            onClick={() => window.location.href = '/contact'}
                        >
                            Liên Hệ
                        </Button>
                    </Box>
                    {/* User Menu Button */}
                    <Box sx={{position: 'relative'}}>
                        {isSignedIn ? <Bell/> : null}
                        <Button
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                marginLeft: '1vw',
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontSize: 16,
                                boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                                textTransform: 'none',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                                    boxShadow: '0 6px 16px rgba(25,118,210,0.4)'
                                }
                            }}
                            onClick={handleButtonClick}
                        >
                            {buttonText}
                        </Button>

                        {/* User Menu Dropdown */}
                        {isSignedIn && (
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleUserMenuClose}
                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                transformOrigin={{vertical: 'top', horizontal: 'right'}}

                                disableScrollLock={true}
                                slotProps={{
                                    paper: {
                                        style: {
                                            maxHeight: '80vh',
                                            overflow: 'visible'
                                        },
                                        sx: {
                                            borderRadius: 2,
                                            boxShadow: '0 6px 24px rgba(25, 118, 210, 0.15)',
                                            minWidth: 200,
                                            mt: 1,
                                            p: 0.5,
                                            bgcolor: 'white'
                                        }
                                    }
                                }}
                                sx={{
                                    '& .MuiPopover-paper': {
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        border: '1px solid rgba(0,0,0,0.12)'
                                    }
                                }}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleUserMenuClose();
                                        if (localStorage.getItem('user')) {
                                            const user = JSON.parse(localStorage.getItem('user'))
                                            if (user.role === 'school') {
                                                window.location.href = '/school/design';
                                            } else if (user.role === 'designer') {
                                                window.location.href = '/designer/requests';
                                            }
                                        }

                                    }}
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: 500,
                                        color: '#1976d2',
                                        borderRadius: 1,
                                        gap: 1.5,
                                        '&:hover': {
                                            bgcolor: 'rgba(25,118,210,0.08)',
                                            color: '#1565c0',
                                        },
                                        transition: 'background 0.2s, color 0.2s',
                                    }}
                                >
                                    <DashboardIcon sx={{color: '#1976d2', mr: 1}}/> Bảng Điều Khiển
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        handleUserMenuClose();
                                        handleLogout();
                                    }}
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: 500,
                                        color: '#dc3545',
                                        borderRadius: 1,
                                        gap: 1.5,
                                        '&:hover': {
                                            bgcolor: 'rgba(220,53,69,0.08)',
                                            color: '#c82333',
                                        },
                                        transition: 'background 0.2s, color 0.2s',
                                    }}
                                >
                                    <LogoutIcon sx={{color: '#dc3545', mr: 1}}/> Đăng Xuất
                                </MenuItem>
                            </Menu>
                        )}
                    </Box>
                    {/* Mobile Menu Icon */}
                    <IconButton
                        color="inherit"
                        sx={{display: {md: 'none'}, color: '#1976d2'}}
                        onClick={handleMobileMenuToggle}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Box>
                {/* Mobile Menu */}
                <Collapse in={mobileMenuOpen}>
                    <Box sx={{
                        bgcolor: 'white',
                        borderTop: '1px solid #e0e0e0',
                        py: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <List>
                            <ListItem onClick={() => window.location.href = '/home'}>
                                <ListItemText primary="Trang Chủ" sx={{color: '#1976d2', fontWeight: 600}}/>
                            </ListItem>
                            <ListItem onClick={() => window.location.href = '/tutorial'}>
                                <ListItemText primary="Quy Trình Hoạt Động" sx={{color: '#333', fontWeight: 600}}/>
                            </ListItem>
                            <ListItem onClick={() => window.location.href = '/about'}>
                                <ListItemText primary="Về Chúng Tôi" sx={{color: '#333', fontWeight: 600}}/>
                            </ListItem>
                            <ListItem onClick={() => window.location.href = '/contact'}>
                                <ListItemText primary="Liên Hệ" sx={{color: '#333', fontWeight: 600}}/>
                            </ListItem>
                            {isSignedIn && (
                                <>
                                    <Divider sx={{my: 1}}/>
                                    <ListItem onClick={() => window.location.href = '/school/design'}>
                                        <ListItemText primary="Bảng Điều Khiển" sx={{color: '#1976d2', fontWeight: 600}}/>
                                    </ListItem>
                                    <ListItem onClick={handleLogout}>
                                        <ListItemText primary="Đăng Xuất" sx={{color: '#dc3545', fontWeight: 600}}/>
                                    </ListItem>
                                </>
                            )}
                        </List>
                    </Box>
                </Collapse>
            </Container>
        </AppBar>
    );
}

function Footer() {
    return (
        <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            pt: 8,
            pb: 3,
        }}>
            <Container maxWidth={false} sx={{px: {xs: 2, md: 8}}}>
                <Grid container spacing={4} alignItems="flex-start" justifyContent="space-between">
                    {/* Location */}
                    <Grid>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: 'white'}}>
                            ĐỊA CHỈ
                        </Typography>
                        <Box sx={{borderRadius: 2, overflow: 'hidden', boxShadow: 2, mb: 1}}>
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3586.9567563749106!2d106.80730807457573!3d10.841132857997817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e1!3m2!1sen!2s!4v1753587320335!5m2!1sen!2s"
                                width="100%"
                                height="140"
                                style={{border: 0}}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </Box>
                    </Grid>

                    {/* Contact Us */}
                    <Grid>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: 'white'}}>
                            LIÊN HỆ CHÚNG TÔI
                        </Typography>
                        <Typography variant="body2" sx={{mb: 1, color: 'rgba(255,255,255,0.9)'}}>
                            Hòm thư 4455, 3844 Đường Point,<br/>Quận 1, TP. Hồ Chí Minh, Việt Nam
                        </Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                            <PhoneIcon sx={{fontSize: 18, color: 'rgba(255,255,255,0.8)'}}/>
                            <Typography variant="body2">+1 (2) 345 6789</Typography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                            <PhoneIcon sx={{fontSize: 18, color: 'rgba(255,255,255,0.8)'}}/>
                            <Typography variant="body2">+1 (2) 345 6789</Typography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                            <EmailIcon sx={{fontSize: 18, color: 'rgba(255,255,255,0.8)'}}/>
                            <Typography variant="body2">rockybd1995@gmail.com</Typography>
                        </Box>
                        <Box sx={{display: 'flex', gap: 1, mt: 1}}>
                            <IconButton color="inherit" size="small" sx={{
                                bgcolor: '#1976d2',
                                '&:hover': {bgcolor: '#1565c0'}
                            }}><TwitterIcon/></IconButton>
                            <IconButton color="inherit" size="small" sx={{
                                bgcolor: '#1976d2',
                                '&:hover': {bgcolor: '#1565c0'}
                            }}><FacebookIcon/></IconButton>
                            <IconButton color="inherit" size="small" sx={{
                                bgcolor: '#1976d2',
                                '&:hover': {bgcolor: '#1565c0'}
                            }}><InstagramIcon/></IconButton>
                            <IconButton color="inherit" size="small" sx={{
                                bgcolor: '#1976d2',
                                '&:hover': {bgcolor: '#1565c0'}
                            }}><MenuIcon/></IconButton>
                        </Box>
                    </Grid>

                    {/* Opening Hours */}
                    <Grid>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: 'white'}}>
                            CHÍNH SÁCH CỦA CHÚNG TÔI
                        </Typography>
                        <Box sx={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: 15,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}>
                            <div><a href="/policy/privacy" style={{color: 'inherit', textDecoration: 'none'}}>Chính Sách Bảo Mật</a></div>
                            <div><a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Điều Khoản Dịch Vụ</a>
                            </div>
                            <div><a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Chính Sách Hoàn Trả</a></div>
                            <div><a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Thông Tin Vận Chuyển</a>
                            </div>
                            <div><a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Câu Hỏi Thường Gặp</a></div>
                        </Box>
                    </Grid>

                    {/* Payment Acceptance */}
                    <Grid>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 2, color: 'white'}}>
                            PHƯƠNG THỨC THANH TOÁN
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                            <Box component="img"
                                 src="/vnpay.png"
                                 alt="VNPay"
                                 sx={{
                                     height: 'auto',
                                     width: '100%',
                                     backgroundColor: 'white',
                                     borderRadius: 1,
                                     p: 0.5,
                                     boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                 }}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Divider sx={{my: 4, borderColor: 'rgba(255,255,255,0.2)'}}/>
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    alignItems: {xs: 'center', md: 'flex-end'},
                    justifyContent: 'space-between',
                    gap: 2
                }}>
                    <Typography variant="body2" align="center" sx={{color: 'rgba(255,255,255,0.7)'}}>
                        © {new Date().getFullYear()} UniSew. Tất cả quyền được bảo lưu. | Được thiết kế với ❤️ cho giáo dục
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

function ScrollTopButton() {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    return (
        <Fade in={visible}>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    zIndex: 1300,
                }}
            >
                <Fab color="primary" size="medium" onClick={handleClick} aria-label="scroll back to top">
                    <KeyboardArrowUpIcon/>
                </Fab>
            </Box>
        </Fade>
    );
}

export default function WebAppLayout() {
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>
            <TopBar/>
            <MainHeader/>
            <Box component="main" sx={{flex: 1, width: '100vw', minHeight: '60vh', bgcolor: '#f8fafc'}}>
                <Outlet/>
            </Box>
            <Footer/>
            <ScrollTopButton/>
        </Box>
    );
}