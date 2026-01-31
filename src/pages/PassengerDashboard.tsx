import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ridesApi } from '../api/axios';
import Navbar from '../components/Navbar';
import RideCard, { Ride } from '../components/RideCard';
import Pagination from '../components/Pagination';

interface PaginatedResponse {
    content: Ride[];
    totalPages: number;
    totalElements: number;
    number: number;
}

const PassengerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'request' | 'active' | 'history'>('request');

    // Request ride form
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    // Active rides
    const [activeRides, setActiveRides] = useState<Ride[]>([]);
    const [loadingActive, setLoadingActive] = useState(false);

    // History
    const [historyRides, setHistoryRides] = useState<Ride[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchActiveRides = useCallback(async () => {
        setLoadingActive(true);
        try {
            const response = await ridesApi.getPassengerActiveRides();
            setActiveRides(response.data.content || response.data || []);
        } catch (error) {
            console.error('Failed to fetch active rides:', error);
        } finally {
            setLoadingActive(false);
        }
    }, []);

    const fetchHistory = useCallback(async (page: number) => {
        setLoadingHistory(true);
        try {
            const response = await ridesApi.getPassengerHistory(page);
            const data: PaginatedResponse = response.data;
            setHistoryRides(data.content || []);
            setHistoryTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'active') {
            fetchActiveRides();
        } else if (activeTab === 'history') {
            fetchHistory(historyPage);
        }
    }, [activeTab, historyPage, fetchActiveRides, fetchHistory]);

    const handleRequestRide = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            await ridesApi.createRide(pickupLocation, dropoffLocation);
            setSubmitMessage({ type: 'success', text: 'Ride requested successfully! A driver will accept soon.' });
            setPickupLocation('');
            setDropoffLocation('');
            // Auto-switch to active rides
            setTimeout(() => {
                setActiveTab('active');
                setSubmitMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            console.error('Failed to request ride:', error);
            setSubmitMessage({ type: 'error', text: 'Failed to request ride. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard">
            <Navbar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.name}! 👋</h1>
                    <p>Book a ride or check your ride history</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
                        onClick={() => setActiveTab('request')}
                    >
                        <span className="tab-icon">🚗</span>
                        Request Ride
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <span className="tab-icon">⏳</span>
                        Active Rides
                        {activeRides.length > 0 && (
                            <span className="tab-badge">{activeRides.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="tab-icon">📜</span>
                        History
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'request' && (
                        <div className="request-ride-section">
                            <div className="request-card">
                                <h2>Where are you going?</h2>
                                <form onSubmit={handleRequestRide} className="request-form">
                                    {submitMessage.text && (
                                        <div className={`message ${submitMessage.type}`}>
                                            {submitMessage.text}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="pickup">
                                            <span className="label-icon">📍</span>
                                            Pickup Location
                                        </label>
                                        <input
                                            type="text"
                                            id="pickup"
                                            value={pickupLocation}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            placeholder="Enter pickup address"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="dropoff">
                                            <span className="label-icon">🏁</span>
                                            Dropoff Location
                                        </label>
                                        <input
                                            type="text"
                                            id="dropoff"
                                            value={dropoffLocation}
                                            onChange={(e) => setDropoffLocation(e.target.value)}
                                            placeholder="Enter destination address"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                Requesting...
                                            </>
                                        ) : (
                                            <>
                                                <span>🚕</span>
                                                Request Ride
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>Active Rides</h2>
                                <button className="btn btn-refresh" onClick={fetchActiveRides} disabled={loadingActive}>
                                    🔄 Refresh
                                </button>
                            </div>

                            {loadingActive ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading active rides...</p>
                                </div>
                            ) : activeRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">🚗</span>
                                    <h3>No Active Rides</h3>
                                    <p>You don't have any ongoing rides. Request a new ride to get started!</p>
                                    <button className="btn btn-primary" onClick={() => setActiveTab('request')}>
                                        Request a Ride
                                    </button>
                                </div>
                            ) : (
                                <div className="rides-grid">
                                    {activeRides.map((ride) => (
                                        <RideCard key={ride.id} ride={ride} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>Ride History</h2>
                            </div>

                            {loadingHistory ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading history...</p>
                                </div>
                            ) : historyRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📜</span>
                                    <h3>No Ride History</h3>
                                    <p>Your completed rides will appear here.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="rides-grid">
                                        {historyRides.map((ride) => (
                                            <RideCard key={ride.id} ride={ride} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={historyPage}
                                        totalPages={historyTotalPages}
                                        onPageChange={setHistoryPage}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PassengerDashboard;
