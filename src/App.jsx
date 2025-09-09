import './styles/App.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import {lazy, Suspense} from "react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {SnackbarProvider} from 'notistack';
import {createTheme, CssBaseline, Slide, ThemeProvider} from '@mui/material';
import {GlobalLoadingOverlay, LoadingProvider} from './contexts/LoadingContext.jsx';
import MyOrders from "./components/garment/MyOrders.jsx";
import MyOrderDetail from "./components/garment/MyOrderDetail.jsx";
import DesignRequestList from "./components/admin/DesignRequestList.jsx";
import OrderList from "./components/admin/OrderList.jsx";

const DesignerFeedback = lazy(() => import("./components/designer/DesignerFeedback.jsx"));
const GarmentFeedback = lazy(() => import("./components/garment/GarmentFeedback.jsx"));
const DesignerQuotationManagement = lazy(() => import("./components/designer/DesignerQuotationManagement.jsx"));

const WebAppLayout = lazy(() => import("./layouts/ui/WebAppLayout.jsx"));
const Homepage = lazy(() => import("./components/auth/Homepage.jsx"));
const Login = lazy(() => import("./components/auth/Login.jsx"));
const ProtectedRoute = lazy(() => import("./configs/ProtectedRoute.jsx"));

const About = lazy(() => import("./components/auth/About.jsx"));
const SchoolDesign = lazy(() => import("./components/school/design/SchoolDesign.jsx"));
const SchoolDashboardLayout = lazy(() => import("./layouts/school/SchoolDashboardLayout.jsx"));
const SchoolChat = lazy(() => import("./components/school/design/SchoolChat.jsx"));
const SchoolCreateDesign = lazy(() => import('./components/school/design/SchoolCreateDesign.jsx'));
const PaymentResult = lazy(() => import("./components/school/PaymentResult.jsx"));
const DesignerDashboardLayout = lazy(() => import("./layouts/designer/DesignerDashboardLayout.jsx"));
const PrivacyPolicy = lazy(() => import("./components/auth/PrivacyPolicy.jsx"));
const HowItWork = lazy(() => import("./components/auth/HowItWork.jsx"));
const PartnerRegister = lazy(() => import("./components/auth/PartnerRegister.jsx"));
const EmailConfirmation = lazy(() => import("./components/auth/EmailConfirmation.jsx"));
const DesignerChat = lazy(() => import("./components/designer/DesignerChat.jsx"));
const AppliedRequestDetail = lazy(() => import("./components/designer/dialog/AppliedRequestDetail.jsx"));
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
const AdminReport = lazy(() => import("./components/admin/AdminReport.jsx"));
const PlatformSetting = lazy(() => import("./components/admin/PlatformSetting.jsx"));
const AdminDashboardLayout = lazy(() => import("./layouts/admin/AdminDashboardLayout.jsx"));
const MilestoneManagement = lazy(() => import("./components/garment/MilestoneManagement.jsx"));

const GarmentProfile = lazy(() => import("./components/garment/profile/GarmentProfile.jsx"));

const LoadingFallback = () => {
    return null;
};

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
                path: 'register/partner',
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
            },
            {
                path: 'platform/setting',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PlatformSetting/>
                    </Suspense>
                )
            },
            {
                path: 'designs',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignRequestList/>
                    </Suspense>
                )
            },
            {
                path: 'orders',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <OrderList/>
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
                element: <Navigate to={'/designer/quotations'} />
            },
            {
                path: 'quotations',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DesignerQuotationManagement/>
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
                element: <Navigate to={'/garment/orders'} />
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
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <GarmentProfile />
                    </Suspense>
                )
            },
            {
                path: 'orders',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <MyOrders />
                    </Suspense>
                )
            },
            {
                path: 'my/order/detail',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <MyOrderDetail />
                    </Suspense>
                )
            }
        ]
    }
])

function App() {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LoadingProvider>
                <SnackbarProvider
                    maxSnack={3}
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    TransitionComponent={Slide}
                    preventDuplicate={true}
                >
                    <GoogleOAuthProvider clientId={clientID}>
                        <RouterProvider router={router} />
                        <GlobalLoadingOverlay />
                    </GoogleOAuthProvider>
                </SnackbarProvider>
            </LoadingProvider>
        </ThemeProvider>
    )
}

export default App
