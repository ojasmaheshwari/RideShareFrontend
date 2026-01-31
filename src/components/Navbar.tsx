import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout, isPassenger, isDriver } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">RideShare</span>
                </Link>

                {user && (
                    <div className="navbar-right">
                        <div className="navbar-links">
                            {isPassenger && (
                                <Link to="/passenger" className="nav-link">
                                    Dashboard
                                </Link>
                            )}
                            {isDriver && (
                                <Link to="/driver" className="nav-link">
                                    Dashboard
                                </Link>
                            )}
                        </div>

                        <div className="user-info">
                            <span className="user-role-badge">
                                {isPassenger ? '🧑‍💼 Passenger' : '🚘 Driver'}
                            </span>
                            <span className="user-name">{user.name}</span>
                        </div>

                        <button onClick={handleLogout} className="btn btn-logout">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
