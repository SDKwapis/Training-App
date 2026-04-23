import { NavLink, Outlet } from 'react-router-dom';
import { Dumbbell, History, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex safe-bottom">
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
