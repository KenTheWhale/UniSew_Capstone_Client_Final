import './styles/App.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import { lazy, Suspense } from "react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {SnackbarProvider} from 'notistack';
import {createTheme, CssBaseline, Slide, ThemeProvider} from '@mui/material';
import DesignerFeedback from "./components/designer/DesignerFeedback.jsx";
import GarmentFeedback from "./components/garment/GarmentFeedback.jsx";

const WebAppLayout = lazy(() => import("./layouts/ui/WebAppLayout.jsx"));
const Homepage = lazy(() => import("./components/auth/Homepage.jsx"));
const Login = lazy(() => import("./components/auth/Login.jsx"));
const ProtectedRoute = lazy(() => import("./configs/ProtectedRoute.jsx"));

const About = lazy(() => import("./components/auth/About.jsx"));
const SchoolDesign = lazy(() => import("./components/school/design/SchoolDesign.jsx"));
const SchoolDashboardLayout = lazy(() => import("./layouts/school/SchoolDashboardLayout.jsx"));
const Contact = lazy(() => import("./components/auth/Contact.jsx"));
const SchoolChat = lazy(() => import("./components/school/design/SchoolChat.jsx"));
const SchoolCreateDesign = lazy(() => import('./components/school/design/SchoolCreateDesign.jsx'));
const PaymentResult = lazy(() => import("./components/school/PaymentResult.jsx"));
const DesignerPendingDesign = lazy(() => import("./components/designer/DesignerPendingDesign.jsx"));
const DesignerDashboardLayout = lazy(() => import("./layouts/designer/DesignerDashboardLayout.jsx"));
const PrivacyPolicy = lazy(() => import("./components/auth/PrivacyPolicy.jsx"));
const HowItWork = lazy(() => import("./components/auth/HowItWork.jsx"));
const PartnerRegister = lazy(() => import("./components/auth/PartnerRegister.jsx"));
const EmailConfirmation = lazy(() => import("./components/auth/EmailConfirmation.jsx"));
const DesignerChat = lazy(() => import("./components/designer/DesignerChat.jsx"));
const AppliedRequestList = lazy(() => import("./components/designer/AppliedRequestList.jsx"));
const AppliedRequestDetail = lazy(() => import("./components/designer/AppliedRequestDetail.jsx"));
const SchoolProfile = lazy(() => import("./components/school/profile/SchoolProfile.jsx"));
const DesignerProfile = lazy(() => import("./components/designer/profile/DesignerProfile.jsx"));
const SchoolOrderManagement = lazy(() => import("./components/school/order/SchoolOrderManagement.jsx"));
const SchoolCreateOrder = lazy(() => import("./components/school/order/SchoolCreateOrder.jsx"));
const OrderTrackingStatus = lazy(() => import("./components/school/order/OrderTrackingStatus.jsx"));
const GarmentDashboardLayout = lazy(() => import("./layouts/garment/GarmentDashboardLayout.jsx"));
const GarmentOrderDetail = lazy(() => import("./components/garment/dialog/GarmentOrderDetail.jsx"));
const UniSewFAQ = lazy(() => import("./components/auth/UniSewFAQ.jsx"));
const TermOfServices = lazy(() => import("./components/auth/TermOfServices.jsx"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard.jsx"));
const AdminAccount = lazy(() => import("./components/admin/AdminAccount.jsx"));
const AdminTransaction = lazy(() => import("./components/admin/AdminTransaction.jsx"));
const AdminDashboardLayout = lazy(() => import("./layouts/admin/AdminDashboardLayout.jsx"));
const MilestoneManagement = lazy(() => import("./components/garment/MilestoneManagement.jsx"));
const GarmentPendingOrders = lazy(() => import("./components/garment/GarmentPendingOrders.jsx"));
const AdminReport = lazy(() => import("./components/admin/AdminReport.jsx"));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: '"Open Sans", sans-serif'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #e3e3e3',
      borderTop: '4px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }}></div>
    <div style={{
      fontSize: '18px',
      color: '#666',
      fontWeight: '500'
    }}>
      Loading...
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <WebAppLayout />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/home'} />
            },
            {
                path: 'home',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Homepage />
                    </Suspense>
                )
            },
            {
                path: 'register/designer',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PartnerRegister />
                    </Suspense>
                )
            },
            {
                path: 'email/confirmation',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <EmailConfirmation />
                    </Suspense>
                )
            },
            {
                path: 'about',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <About />
                    </Suspense>
                )
            },
            {
                path: 'contact',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Contact />
                    </Suspense>
                )
            },
            {
                path: 'guide',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <HowItWork />
                    </Suspense>
                )
            },
            {
                path: 'policy/privacy',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PrivacyPolicy />
                    </Suspense>
                )
            },
            {
                path: 'tos',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <TermOfServices/>
                    </Suspense>
                )
            },
            {
                path: 'faq',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <UniSewFAQ />
                    </Suspense>
                )
            },
            {
                path: 'login',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Login />
                    </Suspense>
                )
            }
        ]
    },
    {
        path: '/school',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute allowRoles={['school']}>
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolDashboardLayout />
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/school/design'} />
            },
            {
                path: 'design',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolDesign />
                    </Suspense>
                )
            },
            {
                path: 'chat',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolChat />
                    </Suspense>
                )
            },
            {
                path: 'request/create',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolCreateDesign />
                    </Suspense>
                )
            },
            {
                path: 'payment/result',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PaymentResult />
                    </Suspense>
                )
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolProfile/>
                    </Suspense>
                )
            },
            {
                path: 'order',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolOrderManagement/>
                    </Suspense>
                )
            },
            {
                path: 'order/create',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SchoolCreateOrder/>
                    </Suspense>
                )
            },
            {
                path: 'order/status',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <OrderTrackingStatus/>
                    </Suspense>
                )
            }
        ]
    },
    {
        path: 'admin',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute allowRoles={['admin']}>
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboardLayout />
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/admin/dashboard'} />
            },
            {
                path: 'dashboard',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboard/>
                    </Suspense>
                )
            },
            {
                path: 'accounts',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminAccount/>
                    </Suspense>
                )
            },
            {
                path: 'transactions',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminTransaction/>
                    </Suspense>
                )
            },
            {
                path: 'reports',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AdminReport/>
                    </Suspense>
                )
            }
        ]
    },
    {
        path: 'designer',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute allowRoles={['designer']}>
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerDashboardLayout />
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/designer/requests'} />
            },
            {
                path: 'requests',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerPendingDesign />
                    </Suspense>
                )
            },
            {
                path: 'chat',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerChat/>
                    </Suspense>
                )
            },
            {
                path: 'applied/requests',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AppliedRequestList/>
                    </Suspense>
                )
            },
            {
                path: 'applied/detail',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AppliedRequestDetail/>
                    </Suspense>
                )
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerProfile/>
                    </Suspense>
                )
            },
            {
                path: 'feedbacks',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerFeedback/>
                    </Suspense>
                )
            }
        ]
    },
    {
        path: 'garment',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute allowRoles={['garment']}>
                    <Suspense fallback={<LoadingFallback />}>
                        <GarmentDashboardLayout />
                    </Suspense>
                </ProtectedRoute>
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to={'/garment/pending/order'} />
            },
            {
                path: 'order/detail',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <GarmentOrderDetail />
                    </Suspense>
                )
            },
            {
                path: 'pending/order',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <GarmentPendingOrders />
                    </Suspense>
                )
            },
            {
                path: 'milestone',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <MilestoneManagement />
                    </Suspense>
                )
            },
            {
                path: 'feedbacks',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <GarmentFeedback />
                    </Suspense>
                )
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
