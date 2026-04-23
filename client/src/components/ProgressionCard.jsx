import { TrendingUp, Minus, TrendingDown, Sparkles } from 'lucide-react';
import { formatDate, formatTUT } from '../lib/progression.js';

const icons = {
  increase: TrendingUp,
  same: Minus,
  decrease: TrendingDown,
  new: Sparkles,
};

const styles = {
  increase: 'border-green-700 bg-green-950/40 text-green-400',
  same:     'border-amber-700 bg-amber-950/40 text-amber-400',
  decrease: 'border-red-800 bg-red-950/40 text-red-400',
  new:      'border-zinc-700 bg-zinc-800/40 text-zinc-400',
};

export default function ProgressionCard({ suggestion, lastSet, slot }) {
  const Icon = icons[suggestion.action];
  const style = styles[suggestion.action];

  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{suggestion.message}</p>
          {lastSet && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70">
              <span>TUT {formatTUT(lastSet.tut_seconds)}</span>
              {lastSet.reached_failure && <span>✓ reached failure</span>}
              {lastSet.rpe && <span>RPE {lastSet.rpe}</span>}
              <span>{formatDate(lastSet.session_date)}</span>
            </div>
          )}
          {slot && (
            <p className="mt-1 text-xs opacity-60">
              Target: {slot.rep_range_min}–{slot.rep_range_max} reps · {slot.tut_target_seconds}s TUT
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
