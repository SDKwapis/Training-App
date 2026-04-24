import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Dumbbell, History, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Slim top bar with user info */}
      <header className="flex items-center justify-between px-4 pt-4 pb-1">
        <span className="text-xs text-zinc-600">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors
             ${isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }
        >
          <Dumbbell size={22} />
          <span>Train</span>
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors
             ${isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }
        >
          <History size={22} />
          <span>History</span>
        </NavLink>
        <NavLink
          to="/setup"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors
             ${isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }
        >
          <Settings size={22} />
          <span>Setup</span>
        </NavLink>
      </nav>
    </div>
  );
}
