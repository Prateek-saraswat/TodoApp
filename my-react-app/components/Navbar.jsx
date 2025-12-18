import '../styles/Navbar.css';

export default function Navbar({useAuth}) {
  const { user, logout } = useAuth();
  console.log(user)

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Get initials from username
  const getInitials = (user) => {
    if (!user.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return user.name.substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">✓</div>
          <span className="brand-text">TodoApp</span>
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name || user?.email)}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

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
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}