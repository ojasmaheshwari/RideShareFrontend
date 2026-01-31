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

const DriverDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');

    // Available rides
    const [availableRides, setAvailableRides] = useState<Ride[]>([]);
    const [availablePage, setAvailablePage] = useState(0);
    const [availableTotalPages, setAvailableTotalPages] = useState(0);
    const [loadingAvailable, setLoadingAvailable] = useState(false);

    // Active rides
    const [activeRides, setActiveRides] = useState<Ride[]>([]);
    const [loadingActive, setLoadingActive] = useState(false);

    // History
    const [historyRides, setHistoryRides] = useState<Ride[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Action loading
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchAvailableRides = useCallback(async (page: number) => {
        setLoadingAvailable(true);
        try {
            const response = await ridesApi.getAvailableRides(page);
            const data: PaginatedResponse = response.data;
            setAvailableRides(data.content || []);
            setAvailableTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch available rides:', error);
        } finally {
            setLoadingAvailable(false);
        }
    }, []);

    const fetchActiveRides = useCallback(async () => {
        setLoadingActive(true);
        try {
            const response = await ridesApi.getDriverActiveRides();
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
            const response = await ridesApi.getDriverHistory(page);
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
        if (activeTab === 'available') {
            fetchAvailableRides(availablePage);
        } else if (activeTab === 'active') {
            fetchActiveRides();
        } else if (activeTab === 'history') {
            fetchHistory(historyPage);
        }
    }, [activeTab, availablePage, historyPage, fetchAvailableRides, fetchActiveRides, fetchHistory]);

    const handleAcceptRide = async (rideId: string) => {
        setActionLoadingId(rideId);
        try {
            await ridesApi.acceptRide(rideId);
            // Remove from available and refresh active
            setAvailableRides((prev) => prev.filter((r) => r.id !== rideId));
            setActiveTab('active');
        } catch (error) {
            console.error('Failed to accept ride:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCompleteRide = async (rideId: string) => {
        setActionLoadingId(rideId);
        try {
            await ridesApi.completeRide(rideId);
            // Remove from active
            setActiveRides((prev) => prev.filter((r) => r.id !== rideId));
        } catch (error) {
            console.error('Failed to complete ride:', error);
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="dashboard driver-dashboard">
            <Navbar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.name}!</h1>
                    <p>Find available rides and start earning</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                    >
                        <span className="tab-icon">◯</span>
                        Available Rides
                        {availableRides.length > 0 && (
                            <span className="tab-badge">{availableRides.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <span className="tab-icon">•</span>
                        My Active Rides
                        {activeRides.length > 0 && (
                            <span className="tab-badge">{activeRides.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="tab-icon">≡</span>
                        History
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'available' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>Available Rides</h2>
                                <button
                                    className="btn btn-refresh"
                                    onClick={() => fetchAvailableRides(availablePage)}
                                    disabled={loadingAvailable}
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            {loadingAvailable ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Looking for available rides...</p>
                                </div>
                            ) : availableRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">◯</span>
                                    <h3>No Available Rides</h3>
                                    <p>There are no rides waiting to be picked up right now. Check back soon!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="rides-grid">
                                        {availableRides.map((ride) => (
                                            <RideCard
                                                key={ride.id}
                                                ride={ride}
                                                showActions
                                                onAccept={handleAcceptRide}
                                                isLoading={actionLoadingId === ride.id}
                                            />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={availablePage}
                                        totalPages={availableTotalPages}
                                        onPageChange={setAvailablePage}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>My Active Rides</h2>
                                <button
                                    className="btn btn-refresh"
                                    onClick={fetchActiveRides}
                                    disabled={loadingActive}
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            {loadingActive ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading your active rides...</p>
                                </div>
                            ) : activeRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">◯</span>
                                    <h3>No Active Rides</h3>
                                    <p>You don't have any ongoing rides. Accept a ride to get started!</p>
                                    <button className="btn btn-primary" onClick={() => setActiveTab('available')}>
                                        Find Rides
                                    </button>
                                </div>
                            ) : (
                                <div className="rides-grid">
                                    {activeRides.map((ride) => (
                                        <RideCard
                                            key={ride.id}
                                            ride={ride}
                                            showActions
                                            onComplete={handleCompleteRide}
                                            isLoading={actionLoadingId === ride.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>Completed Rides</h2>
                            </div>

                            {loadingHistory ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading history...</p>
                                </div>
                            ) : historyRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">≡</span>
                                    <h3>No Completed Rides</h3>
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

export default DriverDashboard;
