import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ridesApi, paymentApi } from '../api/axios';
import Navbar from '../components/Navbar';
import RideCard, { Ride } from '../components/RideCard';
import Pagination from '../components/Pagination';

interface PaginatedResponse {
    content: Ride[];
    totalPages: number;
    totalElements: number;
    number: number;
}

interface Payment {
    id: string;
    rideId: string;
    amount: number;
    paymentMethod: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    createdAt: string;
}

interface PaginatedPaymentResponse {
    content: Payment[];
    totalPages: number;
    totalElements: number;
    number: number;
}

const PassengerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'request' | 'active' | 'history' | 'payments'>('request');

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

    // Payments
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentsPage, setPaymentsPage] = useState(0);
    const [paymentsTotalPages, setPaymentsTotalPages] = useState(0);
    const [loadingPayments, setLoadingPayments] = useState(false);

    // Payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' });

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

    const fetchPayments = useCallback(async (page: number) => {
        setLoadingPayments(true);
        try {
            const response = await paymentApi.getPaymentHistory(page);
            const data: PaginatedPaymentResponse = response.data;
            setPayments(data.content || []);
            setPaymentsTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'active') {
            fetchActiveRides();
        } else if (activeTab === 'history') {
            fetchHistory(historyPage);
        } else if (activeTab === 'payments') {
            fetchPayments(paymentsPage);
        }
    }, [activeTab, historyPage, paymentsPage, fetchActiveRides, fetchHistory, fetchPayments]);

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

    const openPaymentModal = (ride: Ride) => {
        setSelectedRide(ride);
        setPaymentAmount(ride.fare?.toString() || '');
        setPaymentMethod('CARD');
        setPaymentMessage({ type: '', text: '' });
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedRide(null);
        setPaymentAmount('');
        setPaymentMethod('CARD');
        setPaymentMessage({ type: '', text: '' });
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRide) return;

        setProcessingPayment(true);
        setPaymentMessage({ type: '', text: '' });

        try {
            await paymentApi.processPayment({
                rideId: selectedRide.id,
                amount: parseFloat(paymentAmount),
                paymentMethod: paymentMethod,
            });
            setPaymentMessage({ type: 'success', text: 'Payment successful!' });
            setTimeout(() => {
                closePaymentModal();
                fetchHistory(historyPage);
            }, 1500);
        } catch (error) {
            console.error('Payment failed:', error);
            setPaymentMessage({ type: 'error', text: 'Payment failed. Please try again.' });
        } finally {
            setProcessingPayment(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'status-completed';
            case 'PENDING':
                return 'status-pending';
            case 'FAILED':
                return 'status-cancelled';
            case 'REFUNDED':
                return 'status-accepted';
            default:
                return '';
        }
    };

    return (
        <div className="dashboard">
            <Navbar />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.name}!</h1>
                    <p>Book a ride or check your ride history</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
                        onClick={() => setActiveTab('request')}
                    >
                        <span className="tab-icon">+</span>
                        Request Ride
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <span className="tab-icon">•</span>
                        Active Rides
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
                    <button
                        className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        <span className="tab-icon">$</span>
                        Payments
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
                                            'Request Ride'
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
                                    ↻ Refresh
                                </button>
                            </div>

                            {loadingActive ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading active rides...</p>
                                </div>
                            ) : activeRides.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">◯</span>
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
                                    <span className="empty-icon">≡</span>
                                    <h3>No Ride History</h3>
                                    <p>Your completed rides will appear here.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="rides-grid">
                                        {historyRides.map((ride) => (
                                            <div key={ride.id} className="ride-card-wrapper">
                                                <RideCard ride={ride} />
                                                {ride.status === 'COMPLETED' && !ride.fare && (
                                                    <button
                                                        className="btn btn-pay"
                                                        onClick={() => openPaymentModal(ride)}
                                                    >
                                                        Pay for Ride
                                                    </button>
                                                )}
                                            </div>
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

                    {activeTab === 'payments' && (
                        <div className="rides-section">
                            <div className="section-header">
                                <h2>Payment History</h2>
                                <button className="btn btn-refresh" onClick={() => fetchPayments(paymentsPage)} disabled={loadingPayments}>
                                    ↻ Refresh
                                </button>
                            </div>

                            {loadingPayments ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>Loading payment history...</p>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">$</span>
                                    <h3>No Payment History</h3>
                                    <p>Your payment transactions will appear here.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="payments-list">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="payment-card">
                                                <div className="payment-card-header">
                                                    <span className={`payment-status ${getPaymentStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                    <span className="payment-date">{formatDate(payment.createdAt)}</span>
                                                </div>
                                                <div className="payment-details">
                                                    <div className="payment-amount">
                                                        <span className="amount-label">Amount</span>
                                                        <span className="amount-value">${payment.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="payment-method">
                                                        <span className="method-text">{payment.paymentMethod}</span>
                                                    </div>
                                                </div>
                                                <div className="payment-ride-id">
                                                    Ride ID: {payment.rideId.substring(0, 8)}...
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={paymentsPage}
                                        totalPages={paymentsTotalPages}
                                        onPageChange={setPaymentsPage}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Payment Modal */}
            {showPaymentModal && selectedRide && (
                <div className="modal-overlay" onClick={closePaymentModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closePaymentModal}>✕</button>
                        <h2>Process Payment</h2>
                        <p className="modal-subtitle">Complete payment for your ride</p>

                        <div className="payment-ride-info">
                            <div className="ride-route">
                                <span>From: {selectedRide.pickupLocation}</span>
                                <span className="route-arrow">→</span>
                                <span>To: {selectedRide.dropoffLocation}</span>
                            </div>
                        </div>

                        <form onSubmit={handlePayment} className="payment-form">
                            {paymentMessage.text && (
                                <div className={`message ${paymentMessage.type}`}>
                                    {paymentMessage.text}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="amount">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Payment Method</label>
                                <div className="payment-methods">
                                    <label className={`payment-method-option ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CARD"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">CARD</span>
                                    </label>
                                    <label className={`payment-method-option ${paymentMethod === 'CASH' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH"
                                            checked={paymentMethod === 'CASH'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">CASH</span>
                                    </label>
                                    <label className={`payment-method-option ${paymentMethod === 'WALLET' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="WALLET"
                                            checked={paymentMethod === 'WALLET'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">WALLET</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-large" disabled={processingPayment}>
                                {processingPayment ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    `Pay $${paymentAmount || '0.00'}`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassengerDashboard;
