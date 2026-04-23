import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Workout from './pages/Workout.jsx';
import History from './pages/History.jsx';
import Setup from './pages/Setup.jsx';

export default function App() {
  return (
    <Routes>
      {/* Active workout is full-screen, no nav */}
      <Route path="/workout/:sessionId" element={<Workout />} />

      {/* Everything else has the bottom nav */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/setup" element={<Setup />} />
      </Route>
    </Routes>
  );
}
