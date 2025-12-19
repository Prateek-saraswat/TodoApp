import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import Navbar from "./Navbar";
import "../styles/Todo.css"

export default function TodoApp() {
  const { user } = useAuth();
  console.log(user)

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const loadTodos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/todos/${user.id}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch todos error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [user]);

  const addTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: inputValue,
          userId: user.id,
          createdAt: new Date().toISOString(),
          dueDate: dueDate || null,
          completed: false
        }),
      });

      setInputValue("");
      setDueDate("");
      loadTodos();
    } catch (err) {
      console.error("Add todo error:", err);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
      });
      loadTodos();
    } catch (err) {
      console.error("Delete todo error:", err);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: !currentStatus,
          completedAt: !currentStatus ? new Date().toISOString() : null
        }),
      });
      loadTodos();
    } catch (err) {
      console.error("Toggle todo error:", err);
    }
  };

  const markAllComplete = async () => {
    if (!window.confirm("Mark all tasks as complete?")) return;
    
    try {
      const incompleteTodos = todos.filter(todo => !todo.completed);
      
      for (const todo of incompleteTodos) {
        await fetch(`http://localhost:5000/todos/${todo._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            completed: true,
            completedAt: new Date().toISOString()
          }),
        });
      }
      
      loadTodos();
    } catch (err) {
      console.error("Mark all complete error:", err);
    }
  };

  const editTodo = async (id, newText, newDueDate) => {
    if (!newText.trim()) return;

    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newText,
          dueDate: newDueDate || null
        }),
      });
      loadTodos();
    } catch (err) {
      console.error("Edit todo error:", err);
    }
  };

  let filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    if (filter === "overdue") {
      return !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
    }
    if (filter === "today") {
      const today = new Date().toISOString().split('T')[0];
      return todo.dueDate && todo.dueDate.split('T')[0] === today && !todo.completed;
    }
    return true;
  });

  if (searchTerm) {
    filteredTodos = filteredTodos.filter(todo =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filteredTodos.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === "duedate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === "completed") {
      return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    }
    return 0;
  });

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const inProgressTasks = totalTasks - completedTasks;
  const progressRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = todos.filter(todo => 
    todo.createdAt && todo.createdAt.split('T')[0] === today
  ).length;
  
  const completedToday = todos.filter(todo => 
    todo.completedAt && todo.completedAt.split('T')[0] === today
  ).length;

  const overdueTasks = todos.filter(todo => 
    !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
  ).length;

  const dueTodayTasks = todos.filter(todo => 
    todo.dueDate && todo.dueDate.split('T')[0] === today && !todo.completed
  ).length;

  return (
    <>
      <Navbar useAuth={useAuth} />
      
      <div className="todo-app">
        <div className="container">
          {/* Header Section */}
          <div className="app-header">
            <div className="header-content">
              <div className="header-left">
                <h1 className="app-title">Task Manager</h1>
                <p className="app-subtitle">Organize your tasks efficiently</p>
              </div>
              <div className="header-right">
                <div className="user-welcome">
                  <div className="user-avatar">
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="user-info">
                    <p className="user-name">Hello, {user?.fullName || 'User'}</p>
                    <p className="user-stats">{totalTasks} tasks • {completedTasks} completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <div className="search-container">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon total">📋</div>
                <div className="stat-details">
                  <h3 className="stat-number">{totalTasks}</h3>
                  <p className="stat-label">Total Tasks</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon completed">✅</div>
                <div className="stat-details">
                  <h3 className="stat-number">{completedTasks}</h3>
                  <p className="stat-label">Completed</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-details">
                  <h3 className="stat-number">{inProgressTasks}</h3>
                  <p className="stat-label">In Progress</p>
                </div>
              </div>
            </div>

            {overdueTasks > 0 && (
              <div className="stat-card overdue">
                <div className="stat-content">
                  <div className="stat-icon overdue-icon">⚠️</div>
                  <div className="stat-details">
                    <h3 className="stat-number">{overdueTasks}</h3>
                    <p className="stat-label">Overdue</p>
                  </div>
                </div>
              </div>
            )}

            {dueTodayTasks > 0 && (
              <div className="stat-card today">
                <div className="stat-content">
                  <div className="stat-icon today-icon">🎯</div>
                  <div className="stat-details">
                    <h3 className="stat-number">{dueTodayTasks}</h3>
                    <p className="stat-label">Due Today</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            <div className="progress-header">
              <h3 className="progress-title">Progress Overview</h3>
              <div className="progress-percentage">{progressRate}%</div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressRate}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span className="progress-stat">{completedTasks} completed</span>
              <span className="progress-stat">{inProgressTasks} remaining</span>
            </div>
          </div>

          <div className="main-content">
            {/* Left Sidebar - Add Task & Filters */}
            <div className="sidebar">
              <div className="sidebar-card add-task-card">
                <h3 className="card-title">Add New Task</h3>
                <div className="add-task-form">
                  <input
                    type="text"
                    className="task-input"
                    placeholder="What needs to be done?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  />
                  <div className="due-date-section">
                    <div className="due-date-label">
                      <span className="date-icon">📅</span>
                      <span>Set due date</span>
                    </div>
                    <input
                      type="date"
                      className="date-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <button 
                    className="add-task-button"
                    onClick={addTodo}
                    disabled={!inputValue.trim()}
                  >
                    <span className="add-icon">+</span>
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              <div className="sidebar-card filter-card">
                <h3 className="card-title">Filter Tasks</h3>
                <div className="filter-options">
                  {[
                    { id: 'all', label: 'All Tasks', count: totalTasks },
                    { id: 'active', label: 'Active', count: inProgressTasks },
                    { id: 'completed', label: 'Completed', count: completedTasks },
                    { id: 'overdue', label: 'Overdue', count: overdueTasks },
                    { id: 'today', label: 'Due Today', count: dueTodayTasks }
                  ].map((option) => (
                    <button
                      key={option.id}
                      className={`filter-option ${filter === option.id ? 'active' : ''}`}
                      onClick={() => setFilter(option.id)}
                    >
                      <span className="filter-text">{option.label}</span>
                      <span className="filter-count">{option.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-card sort-card">
                <h3 className="card-title">Sort Tasks</h3>
                <div className="sort-options">
                  {[
                    { id: 'newest', label: 'Newest First', icon: '🆕' },
                    { id: 'oldest', label: 'Oldest First', icon: '📅' },
                    { id: 'duedate', label: 'Due Date', icon: '⏰' },
                    { id: 'completed', label: 'Completion', icon: '✅' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      className={`sort-option ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => setSortBy(option.id)}
                    >
                      <span className="sort-icon">{option.icon}</span>
                      <span className="sort-text">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-card quick-actions">
                <h3 className="card-title">Quick Actions</h3>
                <div className="action-buttons">
                  {inProgressTasks > 0 && (
                    <button 
                      className="action-button mark-all"
                      onClick={markAllComplete}
                    >
                      <span className="action-icon">✅</span>
                      <span>Mark All Complete</span>
                    </button>
                  )}
                  <button 
                    className="action-button refresh"
                    onClick={loadTodos}
                    disabled={loading}
                  >
                    <span className="action-icon">🔄</span>
                    <span>Refresh List</span>
                  </button>
                  <button 
                    className="action-button clear"
                    onClick={() => {
                      setFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    <span className="action-icon">🗑️</span>
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Tasks List */}
            <div className="tasks-container">
              <div className="tasks-header">
                <div className="tasks-header-left">
                  <h2 className="tasks-title">My Tasks</h2>
                  <div className="tasks-count">
                    <span className="count-badge">{filteredTodos.length} tasks</span>
                    {loading && <span className="loading-indicator">Loading...</span>}
                  </div>
                </div>
                <div className="tasks-header-right">
                  <div className="view-toggle">
                    <span className="view-label">View:</span>
                    <div className="view-options">
                      {['all', 'active', 'completed'].map((option) => (
                        <button
                          key={option}
                          className={`view-option ${filter === option ? 'active' : ''}`}
                          onClick={() => setFilter(option)}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading your tasks...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-illustration">
                    <span className="empty-icon">📝</span>
                  </div>
                  <h3 className="empty-title">No tasks found</h3>
                  <p className="empty-message">
                    {searchTerm 
                      ? `No tasks matching "${searchTerm}"`
                      : filter === 'completed'
                      ? "No completed tasks yet"
                      : filter === 'active'
                      ? "No pending tasks - Great job!"
                      : filter === 'overdue'
                      ? "No overdue tasks - You're on track!"
                      : filter === 'today'
                      ? "No tasks due today"
                      : "Add your first task to get started"
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      className="clear-search-button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="tasks-list">
                  {filteredTodos.map((todo, index) => (
                    <TodoItem
                      key={todo._id}
                      todo={todo}
                      index={index}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TodoItem({ todo, index, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ? todo.dueDate.split('T')[0] : '');

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo._id, editText, editDueDate);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(todo.title);
      setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return { status: 'none', text: 'No due date', class: 'none' };
    
    const due = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffDays = Math.floor((dueDay - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', class: 'overdue' };
    if (diffDays === 0) return { status: 'today', text: 'Today', class: 'today' };
    if (diffDays === 1) return { status: 'tomorrow', text: 'Tomorrow', class: 'tomorrow' };
    if (diffDays <= 7) return { status: 'week', text: 'This week', class: 'week' };
    
    return { 
      status: 'future', 
      text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      class: 'future'
    };
  };

  const dueDateStatus = getDueDateStatus(todo.dueDate);
  const isOverdue = dueDateStatus.status === 'overdue';

  return (
    <div 
      className={`task-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo._id, todo.completed)}
          id={`task-${todo._id}`}
        />
        <label 
          htmlFor={`task-${todo._id}`}
          className="checkbox-label"
        >
          <span className="checkbox-custom"></span>
        </label>
      </div>

      <div className="task-content">
        {isEditing ? (
          <div className="edit-mode">
            <input
              type="text"
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="edit-date-row">
              <input
                type="date"
                className="edit-date-input"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>Save</button>
                <button className="cancel-button" onClick={() => {
                  setIsEditing(false);
                  setEditText(todo.title);
                  setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
                }}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="task-main">
              <div 
                className="task-title"
                onDoubleClick={() => setIsEditing(true)}
              >
                <span className={`title-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.title}
                </span>
                {todo.completedAt && (
                  <span className="completion-time">
                    Completed {formatDate(todo.completedAt)}
                  </span>
                )}
              </div>
              
              <div className="task-meta">
                <span className="creation-date">
                  Added {formatDate(todo.createdAt)}
                </span>
                
                {dueDateStatus.status !== 'none' && (
                  <span className={`due-date ${dueDateStatus.class}`}>
                    <span className="due-icon">
                      {dueDateStatus.status === 'overdue' && '⚠️'}
                      {dueDateStatus.status === 'today' && '🎯'}
                      {dueDateStatus.status === 'tomorrow' && '📅'}
                      {dueDateStatus.status === 'week' && '⏰'}
                      {dueDateStatus.status === 'future' && '📅'}
                    </span>
                    <span className="due-text">{dueDateStatus.text}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="task-actions">
              {!todo.completed && (
                <button 
                  className="action-button complete-button"
                  onClick={() => onToggle(todo._id, todo.completed)}
                  title="Mark as complete"
                >
                  <span className="button-icon">✓</span>
                  <span className="button-text">Complete</span>
                </button>
              )}
              
              <div className="action-icons">
                {!todo.completed && (
                  <button 
                    className="icon-button edit-button"
                    onClick={() => setIsEditing(true)}
                    title="Edit task"
                  >
                    <span className="icon">✏️</span>
                  </button>
                )}
                
                <button 
                  className="icon-button delete-button"
                  onClick={() => onDelete(todo._id)}
                  title="Delete task"
                >
                  <span className="icon">🗑️</span>
                </button>
              </div>
              
              <div className="task-status">
                {todo.completed ? (
                  <span className="status-badge completed">
                    Completed
                  </span>
                ) : isOverdue ? (
                  <span className="status-badge overdue">
                    Overdue
                  </span>
                ) : (
                  <span className="status-badge pending">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}