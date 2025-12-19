import { useState, useEffect } from "react";
import "../styles/Admin.css";
import Navbar from "./Navbar";
import { useAuth } from "../context/useAuth";
import AddUserModal from "./Modal";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserTasksModal, setShowUserTasksModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    title: "", 
    priority: "medium", 
    dueDate: "" 
  });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admin: 0,
    inactive: 0
  });

  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://todoapp1-lg2w.onrender.com/admin/users");
      const data = await res.json();

      const formattedUsers = data.map((u) => ({
        ...u,
        id: u._id,
        joinedDate: new Date(u.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));

      setUsers(formattedUsers);
      
      const total = formattedUsers.length;
      const active = formattedUsers.filter(u => u.status === "Active").length;
      const admin = formattedUsers.filter(u => u.role === "admin").length;
      const inactive = formattedUsers.filter(u => u.status === "Inactive").length;
      
      setStats({ total, active, admin, inactive });
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUserTasks = async (userId) => {
    try {
      const res = await fetch(`https://todoapp1-lg2w.onrender.com/todos/${userId}`);
      const data = await res.json();
      setUserTasks(data);
    } catch (err) {
      console.error("Error loading user tasks", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "active") return user.status === "Active";
    if (filter === "inactive") return user.status === "Inactive";
    if (filter === "admin") return user.role === "admin";
    if (filter === "user") return user.role === "user";
    return true;
  }).filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "User",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newUser.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!newUser.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!newUser.password) {
      newErrors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch("https://todoapp1-lg2w.onrender.com/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");
      
      loadUsers();
      setShowAddUserModal(false);
      setNewUser({ fullName: "", email: "", password: "", role: "User" });
      setErrors({});
      
      showNotification("User added successfully!", "success");
    } catch (err) {
      console.error("Add user error", err);
      showNotification("Failed to add user", "error");
    }
  };

  const handleViewUserTasks = async (user) => {
    setSelectedUser(user);
    await loadUserTasks(user.id);
    setShowUserTasksModal(true);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await fetch("https://todoapp1-lg2w.onrender.com/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          userId: selectedUser.id,
          priority: newTask.priority,
          assignedBy: user.name,
          assignedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          dueDate: newTask.dueDate || null,
          completed: false
        }),
      });

      await loadUserTasks(selectedUser.id);
      setNewTask({ title: "", priority: "medium", dueDate: "" });
      showNotification("Task assigned successfully!", "success");
    } catch (err) {
      console.error("Assign task error", err);
      showNotification("Failed to assign task", "error");
    }
  };

  const handleDeleteUserTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`https://todoapp1-lg2w.onrender.com/todos/${taskId}`, {
        method: "DELETE",
      });
      await loadUserTasks(selectedUser.id);
      showNotification("Task deleted successfully!", "success");
    } catch (err) {
      console.error("Delete task error", err);
      showNotification("Failed to delete task", "error");
    }
  };

  const handleToggleTaskComplete = async (taskId, currentStatus) => {
    try {
      await fetch(`https://todoapp1-lg2w.onrender.com/todos/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: !currentStatus,
          completedAt: !currentStatus ? new Date().toISOString() : null
        }),
      });
      await loadUserTasks(selectedUser.id);
      showNotification(`Task marked as ${!currentStatus ? 'complete' : 'incomplete'}!`, "success");
    } catch (err) {
      console.error("Toggle task error", err);
      showNotification("Failed to update task", "error");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === "Active" ? "deactivate" : "activate"} this user?`)) return;

    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await fetch(`https://todoapp1-lg2w.onrender.com/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      loadUsers();
      showNotification(`User ${newStatus.toLowerCase()} successfully!`, "success");
    } catch (err) {
      console.error("Toggle status error", err);
      showNotification("Failed to update user status", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await fetch(`https://todoapp1-lg2w.onrender.com/admin/users/${id}`, {
        method: "DELETE",
      });
      loadUsers();
      showNotification("User deleted successfully!", "success");
    } catch (err) {
      console.error("Delete error", err);
      showNotification("Failed to delete user", "error");
    }
  };

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const exportUsers = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Joined Date"],
      ...users.map(u => [
        u.fullName,
        u.email,
        u.role,
        u.status,
        u.joinedDate
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification("Users exported successfully!", "success");
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffDays = Math.floor((dueDay - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', class: 'overdue', icon: '⚠️' };
    if (diffDays === 0) return { status: 'today', text: 'Due Today', class: 'today', icon: '🔴' };
    if (diffDays === 1) return { status: 'tomorrow', text: 'Due Tomorrow', class: 'tomorrow', icon: '🟡' };
    if (diffDays <= 7) return { status: 'thisweek', text: `Due in ${diffDays} days`, class: 'this-week', icon: '🟢' };
    
    return { 
      status: 'future', 
      text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      class: 'future',
      icon: '📅'
    };
  };

  return (
    <>
      <Navbar useAuth={useAuth} />
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      <div className="admin-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-main">
                <h1>👑 Admin Dashboard</h1>
                <p>Manage users and monitor system activity</p>
              </div>
              <div className="header-stats">
                <div className="stat-mini">
                  <span className="stat-mini-label">Online</span>
                  <span className="stat-mini-value">{stats.active}</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-mini-label">Total</span>
                  <span className="stat-mini-value">{stats.total}</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="export-button"
                onClick={exportUsers}
                title="Export users to CSV"
              >
                📊 Export Users
              </button>
              <button
                className="add-user-button"
                onClick={() => setShowAddUserModal(true)}
              >
                <span className="btn-icon">+</span>
                Add New User
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">👥</div>
                <div className="stat-trend">↑ 12%</div>
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Users</p>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-active">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">✅</div>
                <div className="stat-trend positive">↑ 8%</div>
              </div>
              <div className="stat-content">
                <h3>{stats.active}</h3>
                <p>Active Users</p>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${stats.total ? (stats.active / stats.total * 100) : 0}%` 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-admin">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">👑</div>
                <div className="stat-trend">↑ 5%</div>
              </div>
              <div className="stat-content">
                <h3>{stats.admin}</h3>
                <p>Administrators</p>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${stats.total ? (stats.admin / stats.total * 100) : 0}%` 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-inactive">
              <div className="stat-icon-wrapper">
                <div className="stat-icon">⏸️</div>
                <div className="stat-trend negative">↓ 3%</div>
              </div>
              <div className="stat-content">
                <h3>{stats.inactive}</h3>
                <p>Inactive Users</p>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${stats.total ? (stats.inactive / stats.total * 100) : 0}%` 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="control-panel">
            <div className="search-section">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({users.length})
                </button>
                <button 
                  className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active ({stats.active})
                </button>
                <button 
                  className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setFilter('inactive')}
                >
                  Inactive ({stats.inactive})
                </button>
                <button 
                  className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
                  onClick={() => setFilter('admin')}
                >
                  Admins ({stats.admin})
                </button>
              </div>
            </div>

            <div className="view-options">
              <div className="view-stats">
                <span className="showing-text">
                  Showing {filteredUsers.length} of {users.length} users
                </span>
                {loading && <span className="loading-indicator">🔄 Loading...</span>}
              </div>
              <div className="sort-options">
                <select className="sort-select">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Oldest</option>
                  <option>Sort by: Name A-Z</option>
                  <option>Sort by: Status</option>
                </select>
              </div>
            </div>
          </div>

          <div className="users-table-container">
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th className="user-column">User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="loading-row">
                        <div className="loading-spinner"></div>
                        <span>Loading users...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-results">
                        <div className="empty-state">
                          <div className="empty-icon">👤</div>
                          <h3>No users found</h3>
                          <p>{searchQuery ? "Try a different search term" : "Add your first user to get started"}</p>
                          {searchQuery && (
                            <button 
                              className="clear-filters-btn"
                              onClick={() => {
                                setSearchQuery('');
                                setFilter('all');
                              }}
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="user-row">
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {user.fullName.charAt(0).toUpperCase()}
                              {user.status === "Active" && <span className="online-dot"></span>}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{user.fullName}</span>
                              <button 
                                className="view-tasks-btn"
                                onClick={() => handleViewUserTasks(user)}
                                title="View user tasks"
                              >
                                📋 View Tasks ({user.taskCount || 0})
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="email-cell">
                            <span className="email-text">{user.email}</span>
                            <button 
                              className="email-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(user.email);
                                showNotification("Email copied to clipboard", "success");
                              }}
                              title="Copy email"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role.toLowerCase()}`}>
                            {user.role === "admin" ? "👑 Admin" : "👤 User"}
                          </span>
                        </td>
                        <td>
                          <div className="status-cell">
                            <span className={`status-badge ${user.status.toLowerCase()}`}>
                              <span className="status-dot"></span>
                              {user.status}
                            </span>
                            <button 
                              className="status-toggle"
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              title={`${user.status === "Active" ? "Deactivate" : "Activate"} user`}
                            >
                              {user.status === "Active" ? "⏸️" : "▶️"}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="date-cell">{user.joinedDate}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-tasks"
                              onClick={() => handleViewUserTasks(user)}
                              title="View and manage tasks"
                            >
                              📋
                            </button>
                            <button 
                              className="action-btn edit-user"
                              title="Edit user (coming soon)"
                              onClick={() => showNotification("Edit feature coming soon!", "info")}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn delete-user"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin'}
                              title={user.role === 'admin' ? "Admin user cannot be deleted" : "Delete user"}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showAddUserModal && (
            <AddUserModal
              showAddUserModal={showAddUserModal}
              setShowAddUserModal={setShowAddUserModal}
              handleAddUser={handleAddUser}
              newUser={newUser}
              handleInputChange={handleInputChange}
              errors={errors}
            />
          )}

          {showUserTasksModal && selectedUser && (
            <div className="tasks-modal-overlay" onClick={() => setShowUserTasksModal(false)}>
              <div className="tasks-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="tasks-modal-header">
                  <h2>
                    <span className="user-avatar-small">
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </span>
                    {selectedUser.fullName}'s Tasks
                  </h2>
                  <button
                    className="tasks-close-modal"
                    onClick={() => setShowUserTasksModal(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="user-info-summary">
                  <div className="user-summary-item">
                    <span className="summary-label">Email:</span>
                    <span className="summary-value">{selectedUser.email}</span>
                  </div>
                  <div className="user-summary-item">
                    <span className="summary-label">Role:</span>
                    <span className="summary-value">{selectedUser.role}</span>
                  </div>
                  <div className="user-summary-item">
                    <span className="summary-label">Status:</span>
                    <span className={`summary-value status-${selectedUser.status.toLowerCase()}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>

                <div className="assign-task-form">
                  <h3>📋 Assign New Task</h3>
                  <form onSubmit={handleAssignTask}>
                    <div className="form-row">
                      <div className="form-field full-width">
                        <label htmlFor="task-title">Task Description</label>
                        <input
                          id="task-title"
                          type="text"
                          placeholder="Enter task description..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="task-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="task-priority">Priority Level</label>
                        <select
                          id="task-priority"
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="priority-select"
                        >
                          <option value="low">🌱 Low Priority</option>
                          <option value="medium">⚡ Medium Priority</option>
                          <option value="high">🔥 High Priority</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label htmlFor="task-due-date">📅 Due Date</label>
                        <input
                          id="task-due-date"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          className="date-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    {newTask.dueDate && (
                      <div className="due-date-preview">
                        <span className="preview-icon">📅</span>
                        <span className="preview-text">
                          Task will be due on {new Date(newTask.dueDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    <button type="submit" className="assign-btn">
                      <span className="btn-icon">➕</span>
                      Assign Task
                    </button>
                  </form>
                </div>

                <div className="user-tasks-list">
                  <h3>
                    Current Tasks 
                    <span className="task-count"> ({userTasks.length})</span>
                  </h3>
                  
                  {userTasks.length === 0 ? (
                    <div className="no-tasks">
                      <div className="no-tasks-icon">📝</div>
                      <p>No tasks assigned yet</p>
                      <p className="no-tasks-hint">Assign a task using the form above</p>
                    </div>
                  ) : (
                    <div className="tasks-container">
                      {userTasks.map((task) => {
                        const dueDateStatus = getDueDateStatus(task.dueDate);
                        return (
                          <div 
                            key={task._id} 
                            className={`task-item ${task.completed ? 'completed' : ''} ${dueDateStatus?.class || ''}`}
                          >
                            <div className="task-checkbox-container">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTaskComplete(task._id, task.completed)}
                                className="task-checkbox"
                                id={`task-check-${task._id}`}
                              />
                              <label htmlFor={`task-check-${task._id}`} className="task-checkbox-label"></label>
                            </div>
                            
                            <div className="task-content">
                              <div className="task-header">
                                <span className={`task-title ${task.completed ? 'completed-text' : ''}`}>
                                  {task.title}
                                </span>
                                <div className="task-actions">
                                  <button 
                                    className={`task-action-btn ${task.completed ? 'undo' : 'complete'}`}
                                    title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                    onClick={() => handleToggleTaskComplete(task._id, task.completed)}
                                  >
                                    {task.completed ? '↩️ Undo' : '✅ Complete'}
                                  </button>
                                  <button 
                                    className="task-action-btn delete"
                                    title="Delete task"
                                    onClick={() => handleDeleteUserTask(task._id)}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                              
                              <div className="task-meta">
                                <span className={`task-priority priority-${task.priority}`}>
                                  {task.priority === 'high' && '🔥'}
                                  {task.priority === 'medium' && '⚡'}
                                  {task.priority === 'low' && '🌱'}
                                  {task.priority}
                                </span>
                                
                                <span className="task-date">
                                  📅 Created: {new Date(task.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                
                                {dueDateStatus && !task.completed && (
                                  <span className={`task-due-status ${dueDateStatus.class}`}>
                                    <span className="due-icon">{dueDateStatus.icon}</span>
                                    <span className="due-text">{dueDateStatus.text}</span>
                                  </span>
                                )}
                                
                                {task.completed && task.completedAt && (
                                  <span className="task-completed-at">
                                    ✅ Completed: {new Date(task.completedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                                
                                {task.assignedBy && (
                                  <span className="task-assigned-by">
                                    👤 Assigned by: {task.assignedBy}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    className="modal-btn secondary"
                    onClick={() => setShowUserTasksModal(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="modal-btn primary"
                    onClick={() => {
                      setNewTask({ title: "", priority: "medium", dueDate: "" });
                      document.querySelector('#task-title')?.focus();
                    }}
                  >
                    ➕ Assign Another Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}