# RideShare Frontend

A modern React + TypeScript frontend for the RideShare API, featuring JWT authentication, role-based dashboards, and complete ride management functionality.

## Features

- 🔐 **JWT Authentication** - Secure login and registration
- 👤 **Role-based Access** - Separate dashboards for Passengers and Drivers
- 🚗 **Ride Management** - Request, accept, and complete rides
- 📜 **Ride History** - Paginated ride history with sorting
- 🎨 **Modern UI** - Dark theme with glassmorphism and smooth animations

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- Axios (HTTP client)
- Vanilla CSS (styling)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:8080`
- MongoDB running on `localhost:27017`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   └── axios.ts          # Axios config + API endpoints
├── context/
│   └── AuthContext.tsx   # Authentication state management
├── components/
│   ├── Navbar.tsx        # Navigation bar
│   ├── ProtectedRoute.tsx # Route guards
│   ├── RideCard.tsx      # Ride display component
│   └── Pagination.tsx    # Pagination controls
├── pages/
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── PassengerDashboard.tsx # Passenger features
│   └── DriverDashboard.tsx    # Driver features
├── App.tsx               # Main app with routing
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/rides` | POST | Create ride (passenger) |
| `/api/rides/passenger/active` | GET | Active rides (passenger) |
| `/api/rides/passenger/history` | GET | Ride history (passenger) |
| `/api/rides/driver/available` | GET | Available rides (driver) |
| `/api/rides/{id}/accept` | PUT | Accept ride (driver) |
| `/api/rides/{id}/complete` | PUT | Complete ride (driver) |
| `/api/rides/driver/history` | GET | Ride history (driver) |

## License

MIT
