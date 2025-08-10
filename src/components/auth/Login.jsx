import {Box, Button, Link, Paper, Typography} from "@mui/material";
import {useGoogleLogin} from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google';
import {signin} from '../../services/AuthService.jsx'
import {enqueueSnackbar} from "notistack";
import axios from "axios";
import {getCookie} from "../../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";

export default function Login() {
    async function HandleLogin(userInfo) {
        const loginResponse = await signin(userInfo.data.email, userInfo.data.name, userInfo.data.picture);
        if (loginResponse && loginResponse.status === 200) {
            localStorage.setItem('user', JSON.stringify(loginResponse.data.body));
            const access = getCookie('access');
            const role = jwtDecode(access)?.role
            enqueueSnackbar(loginResponse.data.message, {variant: 'success', autoHideDuration: 1000});
            setTimeout(() => {
                switch (role) {
                    case 'admin':
                        window.location.href = '/login';
                        break;
                    case 'school':
                        window.location.href = '/home';
                        break;
                    case 'designer':
                        window.location.href = '/designer/requests';
                        break;
                    default:
                        window.location.href = '/garment/dashboard';
                        break;
                }
            }, 1000)

        }
    }

    async function HandleSuccess(token) {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                }
            }
        );

        if (userInfo) {
            HandleLogin(userInfo)
        }
    }

    function HandleError(error) {
        console.log("Login Error:", error);
        enqueueSnackbar("Login failed", {variant: "error"});
    }

    const login = useGoogleLogin({
        flow: 'implicit',
        scope: 'openid email profile',
        onSuccess: HandleSuccess,
        onError: HandleError,
    });

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e0f7fa", // Light blue background
                background: "linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)", // Subtle gradient
                py: 4,
            }}
        >
            <Paper
                elevation={10} // Stronger shadow for depth
                sx={{
                    p: {xs: 4, sm: 6, md: 8}, // Responsive padding
                    borderRadius: 3, // Slightly more rounded corners
                    textAlign: "center",
                    maxWidth: 500, // Increased max width for a more substantial card
                    width: "100%",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.15)", // Refined shadow
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -50,
                        left: -50,
                        width: 150,
                        height: 150,
                        background: "rgba(25, 118, 210, 0.1)",
                        borderRadius: "50%",
                        transform: "rotate(30deg)",
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -50,
                        right: -50,
                        width: 120,
                        height: 120,
                        background: "rgba(66, 165, 245, 0.1)",
                        borderRadius: "50%",
                        transform: "rotate(-45deg)",
                    },
                }}
            >
                {/* Logo */}
                <Box sx={{mb: 4}}>
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="UniSew Logo"
                        sx={{
                            height: 70,
                            width: 70,
                            borderRadius: "50%", // Keep it circular for a friendly feel
                            boxShadow: "0 4px 15px rgba(25,118,210,0.3)", // Subtle shadow for the logo
                        }}
                    />
                    <Typography variant="h4" sx={{mt: 2, fontWeight: 700, color: "#1976d2"}}>
                        UniSew
                    </Typography>
                </Box>

                <Typography variant="h5" sx={{mb: 1, fontWeight: 600, color: "#333"}}>
                    Welcome Back!
                </Typography>
                <Typography variant="body1" sx={{mb: 4, color: "#666"}}>
                    Sign in to your account with Google.
                </Typography>

                {/* Google Login Button */}
                <Box sx={{mb: 4}}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<GoogleIcon/>}
                        onClick={() => login()} // Call the login function from the hook
                        sx={{
                            background: 'linear-gradient(90deg, #d32f2f 0%, #ef5350 100%)', // Red gradient
                            color: 'white',
                            fontWeight: 700,
                            px: 4, // Decreased horizontal padding
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 3,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            textTransform: "none",
                            width: "80%", // Adjusted width to be 80%
                            "&:hover": {
                                background: 'linear-gradient(90deg, #c62828 0%, #d32f2f 100%)', // Darker red on hover
                                boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                            },
                        }}
                    >
                        Sign in with Google
                    </Button>
                </Box>

                <Typography variant="body2" sx={{color: "#888", mb: 2}}>
                    By signing in, you agree to our
                    <Link href="#" color="primary" sx={{ml: 0.5, textDecoration: 'none'}}>
                        Terms of Service
                    </Link>
                    <span> and </span>
                    <Link href={'/policy/privacy'} color="primary" sx={{ml: 0.5, textDecoration: 'none'}}>
                        Privacy Policy
                    </Link>.
                </Typography>
            </Paper>
        </Box>
    );
}