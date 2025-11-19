# Frontend - Room Reservation System

Frontend of the room reservation system developed with React 19, Vite, Tailwind CSS 4 and React Icons.

## Overview

This is the frontend application for a comprehensive room reservation system that enables organizations to manage locations, rooms, and reservations efficiently. The system provides a modern, responsive web interface built with React 19 and Vite, featuring Google OAuth authentication, real-time reservation management, and intuitive administrative controls.

### Key Features

- **Authentication & Authorization**: Secure login via Google OAuth with role-based access control (admin/user)
- **Reservation Management**: Create, view, edit, and delete room reservations with advanced filtering capabilities
- **Location Management**: Manage multiple locations with activation/deactivation controls
- **Room Management**: Organize rooms by location with capacity and resource tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS for optimal experience across devices
- **Real-time Validation**: Client-side and server-side validation for data integrity

### Business Rules

1. **Reservations**:
   - Reservations must have a valid location and room
   - Start date must be before end date
   - Responsible person name is required (max 150 characters)
   - Description is optional (max 1000 characters)
   - Coffee service can be requested with quantity (required if coffee is selected)
   - Reservations are linked to authenticated users
   - Conflict detection prevents overlapping reservations for the same room

2. **Locations**:
   - Locations can be activated or deactivated
   - Active locations are required for room assignment
   - Location names must be unique

3. **Rooms**:
   - Rooms must be linked to a location
   - Rooms can be filtered by location
   - Capacity and resources are optional fields
   - Rooms can be activated or deactivated

4. **Access Control**:
   - All authenticated users can create and manage their own reservations
   - Admin users (configured via `VITE_ADMIN_EMAILS`) have additional privileges
   - Protected routes require authentication
   - Session management via JWT tokens

## Technology Stack

- **React 19**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server with HMR (Hot Module Replacement)
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **React Icons**: Comprehensive icon library
- **React Router DOM v7**: Declarative routing for React applications
- **TypeScript**: Type-safe JavaScript for better developer experience
- **ESLint**: Code linting and quality assurance
- **Nginx**: Production web server (Docker deployment)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── form/           # Form components
│   ├── DeleteModal.jsx # Deletion confirmation modal
│   ├── Header.jsx      # Application header
│   ├── Navigation.jsx  # Main navigation
│   ├── PrivateRoute.jsx# Protected route component
│   ├── ReservationButton.jsx
│   ├── ReservationCard.jsx
│   └── ReservationForm.jsx
├── context/            # Context API
│   └── AuthContext.jsx # Authentication context
├── hooks/              # Custom hooks
│   ├── useLocais.js
│   ├── useReservations.js
│   └── useSalas.js
├── pages/              # Application pages
│   ├── LoginPage.jsx   # Login page
│   ├── LocaisPage.jsx  # Location management
│   ├── ReservationsPage.jsx # Reservation listing
│   └── SalasPage.jsx   # Room management
├── services/           # API services
│   └── api.js          # HTTP client for API
├── App.jsx             # Main component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- Google Cloud Console account (for OAuth setup)
- Backend API running (see `VITE_API_BASE_URL` configuration)

### Local Development

#### Installation

```bash
npm install
```

#### Configuration

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables in the `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_ADMIN_EMAILS=contato@ismaelnascimento.com
```

**Environment Variables:**
- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8000/api/v1`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID for authentication
- `VITE_ADMIN_EMAILS`: Administrator emails separated by comma (e.g., `email1@exemplo.com,email2@exemplo.com`)

### Google OAuth Configuration

1. **Access Google Cloud Console:**
   - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or select a project:**
   - Click "Select project" at the top
   - Click "New project" or select an existing one

3. **Configure OAuth consent screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (for development) or "Internal" (for G Suite)
   - Fill in the required information
   - Add your email as a test user

4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized URLs:
     - **Authorized JavaScript origins:** 
       - `http://localhost:5173` (para desenvolvimento local)
       - `http://localhost:3000` (para Docker Compose)
       - `http://127.0.0.1:5173` (alternativa local)
       - `http://127.0.0.1:3000` (alternativa Docker)
     - **Authorized redirect URIs:** (opcional, se necessário)
       - `http://localhost:5173`
       - `http://localhost:3000`
   - Click "Create"
   
   **⚠️ IMPORTANTE:** Se você estiver usando Docker Compose, certifique-se de adicionar `http://localhost:3000` nas origens autorizadas, caso contrário receberá o erro "origin_mismatch".

5. **Configure the .env file:**
   - Copy the generated "Client ID"
   - Open the `.env` file in the `frontend` folder
   - Replace `your-google-client-id.apps.googleusercontent.com` with your real Client ID
   - Save the file

6. **Restart the development server:**
   ```bash
   npm run dev
   ```

**Note:** The Client ID has the format: `xxxxxx-xxxxx.apps.googleusercontent.com`

#### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot module replacement enabled.

#### Production Build

```bash
npm run build
```

Optimized production files will be generated in the `dist/` folder.

#### Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deployment.

#### Linting

```bash
npm run lint
```

Run ESLint to check code quality and catch potential issues.

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Configure Environment Variables**

   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_ADMIN_EMAILS=admin@example.com
   ```

   **Important Notes**:
   - Environment variables are bundled at build time by Vite, so they must be set before building the Docker image
   - For Docker deployments, ensure `VITE_API_BASE_URL` points to a URL accessible from the browser (not from inside the container)
   - If backend is in the same Docker network, use your host machine's IP or a public domain (e.g., `http://192.168.1.100:8000/api/v1` or `https://api.yourdomain.com/api/v1`)
   - The docker-compose.yml will automatically pass these variables as build arguments

2. **Build and Run with Docker Compose**

   ```bash
   docker-compose up -d --build
   ```

   The application will be available at `http://localhost:3000`

3. **View Logs**

   ```bash
   docker-compose logs -f frontend
   ```

4. **Stop the Container**

   ```bash
   docker-compose down
   ```

#### Using Docker Directly

1. **Build the Docker Image**

   ```bash
   docker build -t frontend-reservation-system .
   ```

2. **Run the Container**

   ```bash
   docker run -d \
     -p 3000:80 \
     --name frontend-app \
     frontend-reservation-system
   ```

   **Note**: Environment variables must be passed during build time using `--build-arg`:
   ```bash
   docker build \
     --build-arg VITE_API_BASE_URL=http://your-backend-url/api/v1 \
     --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
     --build-arg VITE_ADMIN_EMAILS=admin@example.com \
     -t frontend-reservation-system .
   ```

   The application will be available at `http://localhost:3000`

3. **Stop and Remove Container**

   ```bash
   docker stop frontend-app
   docker rm frontend-app
   ```

#### Important Notes for Docker Deployment

- **Environment Variables**: Since Vite bundles environment variables at build time, you need to rebuild the Docker image if you change environment variables. For runtime configuration, consider using a reverse proxy or build-time configuration.
- **API URL**: When running in Docker, ensure the `VITE_API_BASE_URL` is accessible from the browser (not from inside the container). Use your host machine's IP or a public domain.
- **Network Configuration**: If running backend and frontend in separate containers, use Docker networks or ensure proper service discovery.
- **Production Optimization**: The Dockerfile uses a multi-stage build for optimal image size and performance.

## Implemented Features

### Authentication (FE-13, FE-14)
- Login with Google OAuth
- Route protection
- Session management

### Reservations (FE-03, FE-04, FE-05, FE-06, FE-07)
- Reservation listing with responsive cards
- Advanced filters (location, room, responsible person, date range)
- Create and edit reservations
- Deletion with confirmation
- Complete validations in the form
- HTTP error handling (400, 404, 409, 500)

### Location Management (FE-15)
- Location listing
- Create, edit and delete locations
- Activate/deactivate locations

### Room Management (FE-16)
- Room listing with filter by location
- Create, edit and delete rooms
- Link rooms to locations
- Capacity and resources fields

### Backend Integration (FE-10, FE-17)
- Use of `local_id` and `sala_id` in reservations
- Room filters based on selected location
- Standardized error handling

## Architectural Decisions

1. **Custom Hooks**: Created hooks (`useReservations`, `useLocais`, `useSalas`) to encapsulate data fetching logic and facilitate reuse.

2. **Context API**: Use of Context API for authentication management, avoiding prop drilling.

3. **Componentization**: Reusable components separated from business logic, facilitating maintenance and testing.

4. **Error Handling**: Centralized in the API service (`api.js`) with specific handling by HTTP code.

5. **Routing**: Use of React Router DOM for navigation between pages, with protected routes via `PrivateRoute`.

6. **Responsiveness**: Responsive design using Tailwind CSS, with breakpoints for mobile, tablet and desktop.

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8000/api/v1`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID for authentication

## Notes

- The frontend expects the backend to be running at the URL configured in `VITE_API_BASE_URL`
- Google authentication requires prior configuration in Google Cloud Console
- All dates are handled in UTC in the backend and converted to local timezone only for display
