import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Workout from './pages/Workout.jsx';
import History from './pages/History.jsx';
import Setup from './pages/Setup.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected: active workout (full-screen, no nav) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/workout/:sessionId" element={<Workout />} />
      </Route>

      {/* Protected: everything else has the bottom nav */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/setup" element={<Setup />} />
        </Route>
      </Route>
    </Routes>
  );
}
