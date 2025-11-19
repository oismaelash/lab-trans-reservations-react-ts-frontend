import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaBuilding, FaDoorOpen, FaSignOutAlt, FaCrown, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { logout, user, isAdmin } = useAuth();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt />
              Reservas
            </Link>
            {isAdmin() && (
              <Link
                to="/locais"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/locais') 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaBuilding />
                Locais
              </Link>
            )}
            {isAdmin() && (
              <Link
                to="/salas"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/salas') 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaDoorOpen />
                Salas
              </Link>
            )}
            {isAdmin() && (
              <Link
                to="/usuarios"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/usuarios') 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaUsers />
                Usuários
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email || user.name}</span>
              </div>
            )}
            {isAdmin() && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-sm">
                <FaCrown className="text-yellow-800" />
                Admin
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

