import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import ReservationsPage from './pages/ReservationsPage';
import LocaisPage from './pages/LocaisPage';
import SalasPage from './pages/SalasPage';
import UsuariosPage from './pages/UsuariosPage';

const App = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <Routes>
                    <Route path="/" element={<ReservationsPage />} />
                    <Route
                      path="/locais"
                      element={
                        <AdminRoute>
                          <LocaisPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/salas"
                      element={
                        <AdminRoute>
                          <SalasPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/usuarios"
                      element={
                        <AdminRoute>
                          <UsuariosPage />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;

