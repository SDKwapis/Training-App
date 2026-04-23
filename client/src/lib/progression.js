export function getProgressionSuggestion(lastSet, slot) {
  if (!lastSet) {
    return {
      action: 'new',
      suggestedWeight: null,
      message: 'No previous data — start with a manageable weight.',
    };
  }

  const { weight, reps } = lastSet;
  const { rep_range_min, rep_range_max } = slot;

  if (reps >= rep_range_max) {
    const newWeight = Math.ceil((weight * 1.025) / 2.5) * 2.5;
    return {
      action: 'increase',
      suggestedWeight: newWeight,
      message: `${reps} reps @ ${weight} lbs — hit max. Add weight → ${newWeight} lbs`,
    };
  }

  if (reps >= rep_range_min) {
    return {
      action: 'same',
      suggestedWeight: weight,
      message: `${reps} reps @ ${weight} lbs — in range. Same weight, aim for more reps.`,
    };
  }

  const newWeight = Math.floor((weight * 0.9) / 2.5) * 2.5;
  return {
    action: 'decrease',
    suggestedWeight: newWeight,
    message: `${reps} reps @ ${weight} lbs — below target. Reduce to ${newWeight} lbs`,
  };
}

export function formatTUT(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}
