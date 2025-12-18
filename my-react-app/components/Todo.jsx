import { useState, useEffect } from "react";
import "../styles/Todo.css";
import { useAuth } from "../context/useAuth";
import Navbar from "./Navbar";

export default function TodoApp() {
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");

  // ================= FETCH TODOS =================
  const loadTodos = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/todos/${user.id}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch todos error:", err);
    }
  };

  useEffect(() => {
    const loadTodos = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/todos/${user.id}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Fetch todos error:", err);
    }
  };
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
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
      });
      loadTodos();
    } catch (err) {
      console.error("Delete todo error:", err);
    }
  };

  // ================= TOGGLE TODO =================
  const toggleTodo = async (id, completed) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      loadTodos();
    } catch (err) {
      console.error("Toggle todo error:", err);
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

  // ================= FILTER =================
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <>
    <Navbar useAuth={useAuth}/>
    <div className="todo-app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>My Todo List</h1>
          <p>Keep track of your daily tasks</p>
        </div>

        {/* INPUT */}
        <div className="todo-input-section">
          <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="add-button" onClick={addTodo}>
            Add
          </button>
        </div>

        {/* FILTER */}
        {todos.length > 0 && (
          <div className="filter-tabs">
            <button onClick={() => setFilter("all")}>
              All ({todos.length})
            </button>
            <button onClick={() => setFilter("active")}>
              Active ({activeCount})
            </button>
            <button onClick={() => setFilter("completed")}>
              Completed ({todos.length - activeCount})
            </button>
          </div>
        )}

        {/* LIST */}
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
    </>
  );
  
}

// ================= SINGLE TODO ITEM =================
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);

  const handleSave = () => {
    onEdit(todo._id, editText);
    setIsEditing(false);
  };

  return (
    <>
    
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
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      ) : (
        <div className="todo-content">
          <span
            className="todo-text"
            onDoubleClick={() => setIsEditing(true)}
            title="Double click to edit"
          >
            {todo.title}
          </span>
        </div>
      )}

      {!todo.completed && !isEditing && (
        <button className="edit-button" onClick={() => setIsEditing(true)}>
          ✏️
        </button>
      )}

      <button className="delete-button" onClick={() => onDelete(todo._id)}>
        ❌
      </button>
    </div>
    </>
  );
}