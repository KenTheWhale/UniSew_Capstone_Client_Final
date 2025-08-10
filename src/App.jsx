import './styles/App.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import WebAppLayout from "./layouts/school/WebAppLayout.jsx";
import Homepage from "./components/auth/Homepage.jsx";
import About from "./components/auth/About.jsx";
import Login from "./components/auth/Login.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google"; // Import GoogleOAuthProvider
import SchoolDesign from "./components/school/design/SchoolDesign.jsx";
import WebAppDashboard from "./layouts/school/WebAppDashboard.jsx";
import Contact from "./components/auth/Contact.jsx";
import {SnackbarProvider} from 'notistack';
import DesignChat from "./components/school/design/DesignChat.jsx";
import {Slide} from '@mui/material';
import CreateRequest from './components/school/design/CreateRequest.jsx';
import PendingRequest from "./components/school/design/PendingRequest.jsx";
import PaymentResult from "./components/school/PaymentResult.jsx";
import DesignerRequestList from "./components/designer/DesignerRequestList.jsx";
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
import SchoolOrderList from "./components/school/order/SchoolOrderList.jsx";

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
                path: 'login',
                element: <Login />
            },
            {
                path: 'school',
                element: (
                    <ProtectedRoute allowRoles={['school']}>
                        <WebAppDashboard />
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
                        element: <DesignChat />
                    },
                    {
                        path: 'request/create',
                        element: <CreateRequest />
                    },
                    {
                        path: 'pending/request',
                        element: <PendingRequest />
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
                        element: <SchoolOrderList/>
                    }
                ]
            }
        ]
    },
    {
        path: 'admin',
        element: <DesignerDashboardLayout />,
        children: [
            {
                index: true,
                element: <Navigate to={'/admin/dashboard'} />
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
                element: <DesignerRequestList />
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
            <GoogleOAuthProvider clientId={clientID}>
                <RouterProvider router={router} />
            </GoogleOAuthProvider>
        </SnackbarProvider>
    )
}

export default App
