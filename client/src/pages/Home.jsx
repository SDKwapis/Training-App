import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { getRoutines, startSession } from '../lib/api.js';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(null);

  const { data: routines = [], isLoading, error } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  });

  async function handleStart(routine) {
    setStarting(routine.id);
    try {
      const session = await startSession(routine.id);
      navigate(`/workout/${session.id}`, { state: { routine } });
    } catch (err) {
      alert(`Failed to start session: ${err.message}`);
    } finally {
      setStarting(null);
    }
  }

  if (isLoading) return <PageShell><LoadingState /></PageShell>;
  if (error) return <PageShell><ErrorState message={error.message} /></PageShell>;

  return (
    <PageShell>
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-bold tracking-tight">HIT Training</h1>
        </div>
        <p className="text-zinc-500 text-sm">Arthur Jones protocol — one set to failure</p>
      </div>

      <div className="px-4 space-y-3">
        {routines.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-zinc-400 mb-4">No routines yet.</p>
            <button onClick={() => navigate('/setup')} className="btn-primary">
              Create Routine
            </button>
          </div>
        ) : (
          routines.map((routine) => (
            <div key={routine.id} className="card">
              <div className="mb-3">
                <h2 className="font-bold text-white text-lg leading-tight">{routine.name}</h2>
                {routine.description && (
                  <p className="text-zinc-500 text-xs mt-1 leading-snug">{routine.description}</p>
                )}
              </div>
              <button
                className="btn-primary"
                disabled={starting === routine.id}
                onClick={() => handleStart(routine)}
              >
                {starting === routine.id ? 'Starting…' : 'Start Workout'}
              </button>
            </div>
          ))
        )}

        <button
          onClick={() => navigate('/setup')}
          className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-sm"
        >
          <Plus size={16} />
          New Routine
        </button>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return <div className="max-w-lg mx-auto">{children}</div>;
}
function LoadingState() {
  return (
    <div className="px-4 pt-8 space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="card animate-pulse h-28 bg-zinc-800" />
      ))}
    </div>
  );
}
function ErrorState({ message }) {
  return (
    <div className="px-4 pt-8">
      <div className="card border-red-800 bg-red-950/20 text-red-400 text-sm">
        {message}
      </div>
    </div>
  );
}
