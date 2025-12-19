import { useState, useEffect } from 'react';
import '../styles/Navbar.css';

export default function Navbar({ useAuth }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-card') && !event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getInitials = (user) => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="navbar-brand">
          <div className="brand-logo">
            <span>✓</span>
          </div>
          <div className="brand-text-container">
            <span className="brand-text">TaskFlow</span>
            <span className="brand-subtitle">PRODUCTIVITY</span>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="nav-center">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            My Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
        </div>

        {/* Right Section */}
        <div className="navbar-user">
          {/* Notification Bell */}
          <div className="notification-indicator">
            <div className="notification-bell">
              🔔
              <div className="notification-dot"></div>
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile-wrapper">
            <div 
              className="user-card"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar-container">
                <div className="user-avatar">
                  {getInitials(user)}
                </div>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <span className="user-role">{user?.role || 'USER'}</span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar-large">
                    {getInitials(user)}
                  </div>
                  <h4>{user?.name || 'User'}</h4>
                  <p>{user?.email}</p>
                </div>
                
                <div className="dropdown-items">
                  <a href="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    <span className="dropdown-text">My Profile</span>
                  </a>
                  <a href="/settings" className="dropdown-item">
                    <span className="dropdown-icon">⚙️</span>
                    <span className="dropdown-text">Settings</span>
                  </a>
                  <a href="/help" className="dropdown-item">
                    <span className="dropdown-icon">❓</span>
                    <span className="dropdown-text">Help Center</span>
                  </a>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-icon">🚪</span>
                    <span className="dropdown-text">Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}