import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/briefs', label: 'AI Brief Builder', icon: '✨' },
    { path: '/campaigns', label: 'Campaigns', icon: '📈' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {(isOpen || isMobileOpen) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => {
            if (onClose) onClose();
            setIsMobileOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 
          dark:from-gray-900 dark:to-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          z-50 shadow-soft-lg
          ${isOpen ? 'w-72' : 'w-0 lg:w-20'}
          ${isMobileOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 
                className={`text-2xl font-bold gradient-text transition-all duration-300 ${
                  !isOpen && 'lg:hidden'
                }`}
              >
                CampaignHub
              </h1>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
                    transition-all duration-300 group
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${!isOpen && 'lg:justify-center lg:px-2'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <span 
                    className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                      !isOpen && 'lg:hidden'
                    }`}
                  >
                    {item.label}
                  </span>
                  {!isOpen && (
                    <div className="hidden lg:block absolute left-16 bg-gray-900 dark:bg-gray-700 text-white 
                                    px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 
                                    transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50
                                    shadow-lg">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div 
              className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 
                          transition-all duration-300 ${!isOpen && 'lg:justify-center lg:p-2'}`}
            >
              <div className="avatar flex-shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${!isOpen && 'lg:hidden'}`}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className={`p-4 transition-all duration-300 ${!isOpen && 'lg:p-2'}`}>
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center justify-center gap-3 px-4 py-3
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                text-white rounded-xl font-semibold
                transition-all duration-300 transform hover:-translate-y-0.5
                shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40
                ${!isOpen && 'lg:px-2'}
              `}
            >
              <span className="text-xl">🚪</span>
              <span className={`${!isOpen && 'lg:hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileToggle}
        className="fixed bottom-6 right-6 lg:hidden z-50 p-4 bg-gradient-to-r from-blue-600 to-blue-700 
                   text-white rounded-full shadow-soft-lg hover:shadow-xl transition-all duration-300 
                   transform hover:-translate-y-1 active:translate-y-0"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>
    </>
  );
};

export default Sidebar;
