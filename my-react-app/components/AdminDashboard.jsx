import React, { useState } from 'react';
import '../styles/Admin.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      joinedDate: '2024-01-15',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'Active',
      joinedDate: '2024-02-20',
    },
    {
      id: 3,
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'User',
      status: 'Inactive',
      joinedDate: '2024-03-10',
    },
    {
      id: 4,
      fullName: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      role: 'Moderator',
      status: 'Active',
      joinedDate: '2024-04-05',
    },
    {
      id: 5,
      fullName: 'David Brown',
      email: 'david.brown@example.com',
      role: 'User',
      status: 'Active',
      joinedDate: '2024-05-12',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'User',
  });
  const [errors, setErrors] = useState({});

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === 'Active').length;
  const adminUsers = users.filter((user) => user.role === 'Admin').length;
  const inactiveUsers = users.filter((user) => user.status === 'Inactive').length;

  // Handle input change for new user
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newUser.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Email is invalid';
    } else if (users.some((user) => user.email === newUser.email)) {
      newErrors.email = 'Email already exists';
    }

    if (!newUser.password) {
      newErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new user
  const handleAddUser = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const user = {
        id: users.length + 1,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setUsers([...users, user]);
      setShowAddUserModal(false);
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        role: 'User',
      });
      setErrors({});
    }
  };

  // Delete user
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  // Toggle user status
  const toggleUserStatus = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === 'Active' ? 'Inactive' : 'Active',
            }
          : user
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage users and monitor activity</p>
          </div>
          <button
            className="add-user-button"
            onClick={() => setShowAddUserModal(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Add User
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admin">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{adminUsers}</h3>
              <p>Admins</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inactive">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{inactiveUsers}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    <div className="empty-state">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                      </svg>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="user-name">
                        <div className="user-avatar">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        {user.fullName}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.status.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joinedDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn toggle"
                          onClick={() => toggleUserStatus(user.id)}
                          title={
                            user.status === 'Active'
                              ? 'Deactivate'
                              : 'Activate'
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New User</h2>
                <button
                  className="close-modal"
                  onClick={() => setShowAddUserModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    value={newUser.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="User">User</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}