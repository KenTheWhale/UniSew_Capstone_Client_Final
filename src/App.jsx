import './styles/App.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import WebAppLayout from "./layouts/ui/WebAppLayout.jsx";
import Homepage from "./components/auth/Homepage.jsx";
import About from "./components/auth/About.jsx";
import Login from "./components/auth/Login.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import SchoolDesign from "./components/school/design/SchoolDesign.jsx";
import SchoolDashboardLayout from "./layouts/school/SchoolDashboardLayout.jsx";
import Contact from "./components/auth/Contact.jsx";
import {SnackbarProvider} from 'notistack';
import SchoolChat from "./components/school/design/SchoolChat.jsx";
import {createTheme, CssBaseline, Slide, ThemeProvider} from '@mui/material';
import SchoolCreateDesign from './components/school/design/SchoolCreateDesign.jsx';
import PaymentResult from "./components/school/PaymentResult.jsx";
import DesignerPendingDesign from "./components/designer/DesignerPendingDesign.jsx";
import DesignerDashboardLayout from "./layouts/designer/DesignerDashboardLayout.jsx";
import PrivacyPolicy from "./components/auth/PrivacyPolicy.jsx";
import HowItWork from "./components/auth/HowItWork.jsx";
import DesignerRegister from "./components/auth/DesignerRegister.jsx";
import EmailConfirmation from "./components/auth/EmailConfirmation.jsx";
import ProtectedRoute from "./configs/ProtectedRoute.jsx";
import DesignerChat from "./components/designer/DesignerChat.jsx";
import AppliedRequestList from "./components/designer/AppliedRequestList.jsx";
import AppliedRequestDetail from "./components/designer/AppliedRequestDetail.jsx";
import SchoolProfile from "./components/school/profile/SchoolProfile.jsx";
import DesignerProfile from "./components/designer/profile/DesignerProfile.jsx";
import SchoolOrderManagement from "./components/school/order/SchoolOrderManagement.jsx";
import SchoolCreateOrder from "./components/school/order/SchoolCreateOrder.jsx";
import OrderTrackingStatus from "./components/school/order/OrderTrackingStatus.jsx";
import GarmentDashboardLayout from "./layouts/garment/GarmentDashboardLayout.jsx";
import GarmentOrderDetail from "./components/garment/dialog/GarmentOrderDetail.jsx";
import UniSewFAQ from "./components/auth/UniSewFAQ.jsx";
import TermOfServices from "./components/auth/TermOfServices.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminAccount from "./components/admin/AdminAccount.jsx";
import AdminTransaction from "./components/admin/AdminTransaction.jsx";
import AdminDashboardLayout from "./layouts/admin/AdminDashboardLayout.jsx";
import MilestoneManagement from "./components/garment/MilestoneManagement.jsx";
import GarmentPendingOrders from "./components/garment/GarmentPendingOrders.jsx";
import AdminReport from "./components/admin/AdminReport.jsx";

const theme = createTheme({
  typography: {
    fontFamily: '"Open Sans", serif',
    h1: {
      fontFamily: '"Open Sans", serif',
    },
    h2: {
      fontFamily: '"Open Sans", serif',
    },
    h3: {
      fontFamily: '"Open Sans", serif',
    },
    h4: {
      fontFamily: '"Open Sans", serif',
    },
    h5: {
      fontFamily: '"Open Sans", serif',
    },
    h6: {
      fontFamily: '"Open Sans", serif',
    },
    body1: {
      fontFamily: '"Open Sans", serif',
    },
    body2: {
      fontFamily: '"Open Sans", serif',
    },
    button: {
      fontFamily: '"Open Sans", serif',
    },
    caption: {
      fontFamily: '"Open Sans", serif',
    },
    overline: {
      fontFamily: '"Open Sans", serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Open Sans", serif',
        },
      },
    },
  },
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <WebAppLayout />,
        children: [
            {
                index: true,
                element: <Navigate to={'/home'} />
            },
            {
                path: 'home',
                element: <Homepage />
            },
            {
                path: 'register/designer',
                element: <DesignerRegister />
            },
            {
                path: 'email/confirmation',
                element: <EmailConfirmation />
            },
            {
                path: 'about',
                element: <About />
            },
            {
                path: 'contact',
                element: <Contact />
            },
            {
                path: 'tutorial',
                element: <HowItWork />
            },
            {
                path: 'policy/privacy',
                element: <PrivacyPolicy />
            },
            {
                path: 'tos',
                element: <TermOfServices/>
            },
            {
                path: 'faq',
                element: <UniSewFAQ />
            },
            {
                path: 'login',
                element: <Login />
            }
        ]
    },
    {
        path: '/school',
        element: (
            <ProtectedRoute allowRoles={['school']}>
                <SchoolDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/school/design'} />
            },
            {
                path: 'design',
                element: <SchoolDesign />
            },
            {
                path: 'chat',
                element: <SchoolChat />
            },
            {
                path: 'request/create',
                element: <SchoolCreateDesign />
            },
            {
                path: 'payment/result',
                element: <PaymentResult />  
            },
            {
                path: 'profile',
                element: <SchoolProfile/>
            },
            {
                path: 'order',
                element: <SchoolOrderManagement/>
            },
            {
                path: 'order/create',
                element: <SchoolCreateOrder/>
            },
            {
                path: 'order/status',
                element: <OrderTrackingStatus/>
            }
        ]
    },
    {
        path: 'admin',
        element: (
            <ProtectedRoute allowRoles={['admin']}>
                <AdminDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/admin/dashboard'} />
            },
            {
                path: 'dashboard',
                element: <AdminDashboard/>
            },
            {
                path: 'accounts',
                element: <AdminAccount/>
            },
            {
                path: 'transactions',
                element: <AdminTransaction/>
            },
            {
                path: 'reports',
                element: <AdminReport/>
            }
        ]
    },
    {
        path: 'designer',
        element: <DesignerDashboardLayout />,
        children: [
            {
                index: true,
                element: <Navigate to={'/designer/requests'} />
            },
            {
                path: 'requests',
                element: <DesignerPendingDesign />
            },
            {
                path: 'chat',
                element: <DesignerChat/>
            },
            {
                path: 'applied/requests',
                element: <AppliedRequestList/>
            },
            {
                path: 'applied/detail',
                element: <AppliedRequestDetail/>
            },
            {
                path: 'profile',
                element: <DesignerProfile/>
            }
        ]
    },
    {
        path: 'garment',
        element: <GarmentDashboardLayout />,
        children: [
            {
                index: true,
                element: <Navigate to={'/garment/pending/order'} />
            },
            {
                path: 'order/detail',
                element: <GarmentOrderDetail />
            },
            {
                path: 'pending/order',
                element: <GarmentPendingOrders />
            },
            {
                path: 'milestone',
                element: <MilestoneManagement />
            }
        ]
    }
])

function App() {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID

    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Slide}
            preventDuplicate={true}
        >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GoogleOAuthProvider clientId={clientID}>
                    <RouterProvider router={router} />
                </GoogleOAuthProvider>
            </ThemeProvider>
        </SnackbarProvider>
    )
}

export default App
