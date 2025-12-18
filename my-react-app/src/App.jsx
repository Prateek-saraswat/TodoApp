import LoginPage from "../components/LoginPage";
import SignupPage from "../components/SignupPage";
import Todo from "../components/Todo";
import AdminDashboard from "../components/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/register" element={<SignupPage />} />

      <Route
        path="/todo"
        element={
          <ProtectedRoute>
            <Todo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;