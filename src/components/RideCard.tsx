import React from 'react';

export interface Ride {
    id: string;
    passengerId?: string;
    passengerName?: string;
    driverId?: string;
    driverName?: string;
    pickupLocation: string;
    dropoffLocation: string;
    status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    fare?: number;
    createdAt: string;
    updatedAt?: string;
}

interface RideCardProps {
    ride: Ride;
    showActions?: boolean;
    onAccept?: (rideId: string) => void;
    onComplete?: (rideId: string) => void;
    isLoading?: boolean;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'status-pending';
        case 'ACCEPTED':
            return 'status-accepted';
        case 'IN_PROGRESS':
            return 'status-progress';
        case 'COMPLETED':
            return 'status-completed';
        case 'CANCELLED':
            return 'status-cancelled';
        default:
            return '';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const RideCard: React.FC<RideCardProps> = ({
    ride,
    showActions = false,
    onAccept,
    onComplete,
    isLoading = false,
}) => {
    return (
        <div className="ride-card">
            <div className="ride-card-header">
                <span className={`ride-status ${getStatusColor(ride.status)}`}>
                    {ride.status}
                </span>
                <span className="ride-date">{formatDate(ride.createdAt)}</span>
            </div>

            <div className="ride-locations">
                <div className="location-item">
                    <span className="location-icon pickup">📍</span>
                    <div className="location-details">
                        <span className="location-label">Pickup</span>
                        <span className="location-text">{ride.pickupLocation}</span>
                    </div>
                </div>
                <div className="location-divider">
                    <div className="divider-line"></div>
                    <span className="divider-arrow">↓</span>
                    <div className="divider-line"></div>
                </div>
                <div className="location-item">
                    <span className="location-icon dropoff">🏁</span>
                    <div className="location-details">
                        <span className="location-label">Dropoff</span>
                        <span className="location-text">{ride.dropoffLocation}</span>
                    </div>
                </div>
            </div>

            {(ride.passengerName || ride.driverName) && (
                <div className="ride-info">
                    {ride.passengerName && (
                        <div className="info-item">
                            <span className="info-icon">🧑</span>
                            <span>{ride.passengerName}</span>
                        </div>
                    )}
                    {ride.driverName && (
                        <div className="info-item">
                            <span className="info-icon">🚘</span>
                            <span>{ride.driverName}</span>
                        </div>
                    )}
                    {ride.fare && (
                        <div className="info-item fare">
                            <span className="info-icon">💰</span>
                            <span>${ride.fare.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}

            {showActions && (
                <div className="ride-actions">
                    {ride.status === 'PENDING' && onAccept && (
                        <button
                            className="btn btn-accept"
                            onClick={() => onAccept(ride.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Accepting...' : 'Accept Ride'}
                        </button>
                    )}
                    {(ride.status === 'ACCEPTED' || ride.status === 'IN_PROGRESS') && onComplete && (
                        <button
                            className="btn btn-complete"
                            onClick={() => onComplete(ride.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Completing...' : 'Complete Ride'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RideCard;
