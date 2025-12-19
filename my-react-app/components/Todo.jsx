import { useState, useEffect } from "react";
import "../styles/Todo.css";
import { useAuth } from "../context/useAuth";
import Navbar from "./Navbar";

export default function TodoApp() {
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // ================= LOAD TODOS =================
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

  // ================= ADD TODO =================
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
          priority: "medium",
          completed: false
        }),
      });

      setInputValue("");
      loadTodos();
    } catch (err) {
      console.error("Add todo error:", err);
    }
  };

  // ================= DELETE TODO =================
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

  // ================= TOGGLE TODO COMPLETE =================
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

  // ================= MARK ALL COMPLETE =================
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

  // ================= EDIT TODO =================
  const editTodo = async (id, newText) => {
    if (!newText.trim()) return;

    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newText }),
      });
      loadTodos();
    } catch (err) {
      console.error("Edit todo error:", err);
    }
  };

  // ================= UPDATE PRIORITY =================
  const updatePriority = async (id, priority) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: priority }),
      });
      loadTodos();
    } catch (err) {
      console.error("Update priority error:", err);
    }
  };

  // ================= FILTER & SORT =================
  let filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Search filter
  if (searchTerm) {
    filteredTodos = filteredTodos.filter(todo =>
      todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort todos
  filteredTodos.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
    } else if (sortBy === "completed") {
      return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    }
    return 0;
  });

  // ================= STATS =================
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const inProgressTasks = totalTasks - completedTasks;
  const progressRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  // Today's stats
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = todos.filter(todo => 
    todo.createdAt && todo.createdAt.split('T')[0] === today
  ).length;
  
  const completedToday = todos.filter(todo => 
    todo.completedAt && todo.completedAt.split('T')[0] === today
  ).length;

  return (
    <>
      <Navbar useAuth={useAuth} />
      
      <div className="admin-todo-app">
        {/* MAIN CONTAINER */}
        <div className="admin-container">
          
          {/* HEADER SECTION */}
          <div className="admin-header">
            <div className="header-content">
              <h1 className="admin-title">Task Management Dashboard</h1>
              <p className="admin-subtitle">Manage your daily tasks efficiently</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              {inProgressTasks > 0 && (
                <button 
                  className="mark-all-btn"
                  onClick={markAllComplete}
                  title="Mark all tasks as complete"
                >
                  ✅ Mark All Complete
                </button>
              )}
            </div>
          </div>

          {/* STATS CARDS GRID */}
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3 className="stat-number">{totalTasks}</h3>
                <p className="stat-label">Total Tasks</p>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3 className="stat-number">{completedTasks}</h3>
                <p className="stat-label">Completed</p>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3 className="stat-number">{inProgressTasks}</h3>
                <p className="stat-label">In Progress</p>
              </div>
              <div className="stat-progress"></div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3 className="stat-number">{progressRate}%</h3>
                <p className="stat-label">Progress Rate</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="content-area">
            
            {/* LEFT SIDEBAR - INPUT & FILTERS */}
            <div className="sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-title">Add New Task</h3>
                <div className="task-input-group">
                  <input
                    type="text"
                    className="task-input"
                    placeholder="Enter task description..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  />
                  <button className="add-task-btn" onClick={addTodo}>
                    <span>+ Add Task</span>
                  </button>
                </div>
              </div>

              <div className="sidebar-card">
                <h3 className="sidebar-title">Quick Stats</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="quick-stat-icon">📅</span>
                    <div>
                      <p className="quick-stat-value">{todaysTasks}</p>
                      <p className="quick-stat-label">Today's Tasks</p>
                    </div>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-icon">⚡</span>
                    <div>
                      <p className="quick-stat-value">{completedToday}</p>
                      <p className="quick-stat-label">Completed Today</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-card">
                <h3 className="sidebar-title">Sort By</h3>
                <div className="sort-options">
                  <button 
                    className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                    onClick={() => setSortBy('newest')}
                  >
                    Newest First
                  </button>
                  <button 
                    className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                    onClick={() => setSortBy('oldest')}
                  >
                    Oldest First
                  </button>
                  <button 
                    className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
                    onClick={() => setSortBy('priority')}
                  >
                    Priority
                  </button>
                  <button 
                    className={`sort-btn ${sortBy === 'completed' ? 'active' : ''}`}
                    onClick={() => setSortBy('completed')}
                  >
                    Completion Status
                  </button>
                </div>
              </div>

              <div className="sidebar-card">
                <h3 className="sidebar-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setFilter('completed')}
                  >
                    <span className="action-icon">✅</span>
                    View Completed
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setFilter('active')}
                  >
                    <span className="action-icon">⏳</span>
                    View Pending
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => {
                      setFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    <span className="action-icon">🔄</span>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT - TASKS LIST */}
            <div className="main-content">
              <div className="content-header">
                <div className="content-title">
                  <h2>All Tasks</h2>
                  <span className="badge">{filteredTodos.length} tasks</span>
                  {loading && <span className="loading-badge">Loading...</span>}
                </div>
                
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All ({totalTasks})
                  </button>
                  <button 
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                  >
                    Active ({inProgressTasks})
                  </button>
                  <button 
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed ({completedTasks})
                  </button>
                </div>
              </div>

              <div className="tasks-container">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading tasks...</p>
                  </div>
                ) : filteredTodos.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No tasks found</h3>
                    <p>{searchTerm ? "Try a different search term" : "Add your first task using the input on the left"}</p>
                    {searchTerm && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredTodos.map((todo, index) => (
                    <AdminTodoItem
                      key={todo._id}
                      todo={todo}
                      index={index}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                      onUpdatePriority={updatePriority}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ================= ADMIN TODO ITEM COMPONENT =================
function AdminTodoItem({ todo, index, onToggle, onDelete, onEdit, onUpdatePriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);

  const handleSave = () => {
    onEdit(todo._id, editText);
    setIsEditing(false);
  };

  const handleToggle = () => {
    onToggle(todo._id, todo.completed);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handlePriorityChange = (newPriority) => {
    onUpdatePriority(todo._id, newPriority);
  };

  return (
    <div 
      className={`admin-todo-item ${todo.completed ? 'completed' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="todo-item-left">
        {/* COMPLETE CHECKBOX */}
        <div className="todo-checkbox-wrapper">
          <input
            type="checkbox"
            className="admin-todo-checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            id={`todo-${todo._id}`}
          />
          <label 
            htmlFor={`todo-${todo._id}`} 
            className="checkbox-label"
            title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {todo.completed && <span className="checkmark">✓</span>}
          </label>
        </div>

        <div className="todo-content">
          {isEditing ? (
            <input
              type="text"
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          ) : (
            <>
              <span 
                className="todo-text"
                onDoubleClick={() => setIsEditing(true)}
                title="Double click to edit"
              >
                {todo.title}
                {todo.completed && (
                  <span className="completed-time">
                    Completed at {formatTime(todo.completedAt)}
                  </span>
                )}
              </span>
              <div className="todo-meta">
                <span className="todo-date">
                  📅 Created: {formatDate(todo.createdAt)}
                </span>
                
                {/* PRIORITY SELECTOR */}
                <div className="priority-selector">
                  <span className="priority-label">Priority:</span>
                  <select 
                    value={todo.priority || 'medium'}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="priority-dropdown"
                    style={{ 
                      backgroundColor: `${getPriorityColor(todo.priority)}20`,
                      color: getPriorityColor(todo.priority),
                      borderColor: getPriorityColor(todo.priority)
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="todo-item-right">
        {/* COMPLETE/INCOMPLETE TOGGLE BUTTON */}
        <button 
          className="action-btn complete-btn"
          onClick={handleToggle}
          title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <span className="action-icon">
            {todo.completed ? '↩️' : '✅'}
          </span>
        </button>
        
        {!todo.completed && !isEditing && (
          <button 
            className="action-btn edit-btn"
            onClick={() => setIsEditing(true)}
            title="Edit task"
          >
            <span className="action-icon">✏️</span>
          </button>
        )}
        
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(todo._id)}
          title="Delete task"
        >
          <span className="action-icon">🗑️</span>
        </button>
        
        {/* STATUS BADGE WITH COMPLETION TIME */}
        {todo.completed ? (
          <div className="status-container">
            <span className="status-badge completed-badge">
              ✅ Completed
            </span>
            {todo.completedAt && (
              <span className="completion-time">
                {formatTime(todo.completedAt)}
              </span>
            )}
          </div>
        ) : (
          <div className="status-container">
            <span className="status-badge pending-badge">
              ⏳ Pending
            </span>
            <button 
              className="quick-complete-btn"
              onClick={handleToggle}
              title="Click to mark as complete"
            >
              Mark Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}