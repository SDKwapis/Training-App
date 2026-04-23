import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Calendar } from 'lucide-react';
import { getSessions, getSession } from '../lib/api.js';
import { formatDuration, formatTUT } from '../lib/progression.js';

export default function History() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions(30),
  });

  if (selectedId) {
    return <SessionDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-zinc-500 text-sm">Past sessions</p>
      </div>

      {isLoading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-20 bg-zinc-800" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="px-4">
          <div className="card text-center py-8 text-zinc-500 text-sm">
            No sessions yet — go train!
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-3 pb-8">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="w-full text-left card hover:border-zinc-600 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{s.routine_name}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                    <Calendar size={11} />
                    <span>{new Date(s.started_at).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}</span>
                    {s.duration_seconds && <span>· {formatDuration(s.duration_seconds)}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-amber-400">{s.total_sets}</span>
                  <p className="text-xs text-zinc-600">sets</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionDetail({ id, onBack }) {
  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id),
  });

  if (isLoading) return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-24 bg-zinc-800" />)}
      </div>
    </div>
  );

  const sets = data?.sets ?? [];

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-6 pb-3">
        <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 text-sm mb-3 -ml-1">
          <ChevronLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold">{data?.routine_name}</h2>
        <p className="text-zinc-500 text-xs mt-0.5">
          {new Date(data?.started_at).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
          {data?.duration_seconds && ` · ${formatDuration(data.duration_seconds)}`}
        </p>
      </div>

      <div className="px-4 space-y-3 pb-8">
        {sets.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.muscle_group_name}</p>
                <p className="font-semibold text-white text-sm mt-0.5">{s.machine_name}</p>
              </div>
              {s.reached_failure && (
                <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-0.5 rounded">
                  Failure
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatCell label="Weight" value={s.weight ? `${s.weight} lbs` : '—'} />
              <StatCell label="Reps" value={s.reps ?? '—'} />
              <StatCell label="TUT" value={formatTUT(s.tut_seconds)} />
            </div>
            {s.rpe && (
              <p className="mt-2 text-xs text-zinc-500">RPE {s.rpe}/10</p>
            )}
            {s.seat_settings && Object.keys(s.seat_settings).length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-wrap gap-2">
                {Object.entries(s.seat_settings).map(([k, v]) => v ? (
                  <span key={k} className="text-xs bg-zinc-800 rounded px-2 py-0.5 text-zinc-400">
                    {k.replace(/_/g, ' ')}: {v}
                  </span>
                ) : null)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="bg-zinc-800 rounded-lg py-2">
      <div className="text-xs text-zinc-500 mb-0.5">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  );
}
