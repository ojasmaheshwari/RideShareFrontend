import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import './index.css';

// Component to handle root redirect based on auth state
const RootRedirect = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === 'ROLE_USER') {
        return <Navigate to="/passenger" replace />;
    } else if (user?.role === 'ROLE_DRIVER') {
        return <Navigate to="/driver" replace />;
    }

    return <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/passenger"
                        element={
                            <ProtectedRoute allowedRoles={['ROLE_USER']}>
                                <PassengerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/driver"
                        element={
                            <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                                <DriverDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Root redirect */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
