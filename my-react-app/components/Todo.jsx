import { useState, useEffect } from "react";
import "../styles/Todo.css";
import { useAuth } from "../context/useAuth";

export default function TodoApp() {
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");

  // ✅ SINGLE loadTodos
  const loadTodos = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/todos/${user.id}`);
      const data = await res.json();
      setTodos(data);
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    
    loadTodos();
  }, [user]);

  // ================= ADD TODO =================
  const addTodo = async () => {
    if (inputValue.trim() === "") return;

    await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: inputValue,
        userId: user.id,
      }),
    });

    setInputValue("");
    loadTodos(); // ✅ only DB source
  };

  // ================= DELETE =================
  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    });
    loadTodos();
  };

  // ================= TOGGLE =================
  const toggleTodo = async (id, completed) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    loadTodos();
  };

  // ================= EDIT =================
  const editTodo = async (id, newText) => {
    if (!newText.trim()) return;

    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newText }),
    });
    loadTodos();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") addTodo();
  };

  // ================= FILTER =================
  const getFilteredTodos = () => {
    if (filter === "active") {
      return todos.filter((t) => !t.completed);
    }
    if (filter === "completed") {
      return todos.filter((t) => t.completed);
    }
    return todos;
  };

  const filteredTodos = getFilteredTodos();
  const activeTodosCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="todo-app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>My Todo List</h1>
          <p>Keep track of your daily tasks</p>
        </div>

        <div className="todo-input-section">
          <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="add-button" onClick={addTodo}>
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <div className="filter-tabs">
            <button onClick={() => setFilter("all")}>
              All ({todos.length})
            </button>
            <button onClick={() => setFilter("active")}>
              Active ({activeTodosCount})
            </button>
            <button onClick={() => setFilter("completed")}>
              Completed ({todos.length - activeTodosCount})
            </button>
          </div>
        )}

        <div className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= ITEM =================
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);

  const handleEdit = () => {
    onEdit(todo._id, editText);
    setIsEditing(false);
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo._id, todo.completed)}
      />

      {isEditing ? (
        <input
          type="text"
          className="edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          autoFocus
        />
      ) : (
        <div className="todo-content">
          <span className="todo-text">{todo.title}</span>
        </div>
      )}

      <button className="delete-button" onClick={() => onDelete(todo._id)}>
        ❌
      </button>
    </div>
  );
}
