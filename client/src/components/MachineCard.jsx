import { ChevronRight, Clock } from 'lucide-react';
import { formatDate } from '../lib/progression.js';

export default function MachineCard({ machine, lastSet, onSelect, isLastUsed }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(machine)}
      className={`w-full text-left card transition-all active:scale-[0.98]
        ${isLastUsed ? 'border-amber-500/60 bg-amber-950/20' : 'hover:border-zinc-600'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLastUsed && (
              <span className="text-xs bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded shrink-0">
                LAST USED
              </span>
            )}
            <h3 className="font-semibold text-white truncate">{machine.name}</h3>
          </div>

          {lastSet ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <StatPill label="Weight" value={`${lastSet.weight} lbs`} />
              <StatPill label="Reps" value={lastSet.reps} />
              <StatPill label="TUT" value={lastSet.tut_seconds ? `${lastSet.tut_seconds}s` : '—'} />
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-500">No history — first time on this machine</p>
          )}

          {lastSet && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
              <Clock size={11} />
              {formatDate(lastSet.session_date)}
            </p>
          )}
        </div>
        <ChevronRight size={18} className="text-zinc-600 mt-1 shrink-0" />
      </div>
    </button>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-zinc-800 rounded-lg px-2 py-1.5 text-center">
      <div className="text-xs text-zinc-500 leading-none mb-0.5">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
