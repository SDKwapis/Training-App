import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getRoutine, getMachines, getMachineLastSet, logSet, completeSession } from '../lib/api.js';
import { getProgressionSuggestion } from '../lib/progression.js';
import MachineCard from '../components/MachineCard.jsx';
import ProgressionCard from '../components/ProgressionCard.jsx';
import TutTimer from '../components/TutTimer.jsx';

// ─── view states ───────────────────────────────────────────────────────────
// 'slots'     → overview of all slots
// 'machines'  → pick a machine for a slot
// 'log'       → log a set on a chosen machine
// 'done'      → session complete

export default function Workout() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [view, setView] = useState('slots');
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [completedSlots, setCompletedSlots] = useState(new Set());
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machineLastSet, setMachineLastSet] = useState(null);
  const [lastUsedMachineId, setLastUsedMachineId] = useState(null);

  // Fetch the routine via the session record
  const { data: routineData, isLoading, isError, error } = useQuery({
    queryKey: ['session-routine', sessionId],
    queryFn: async () => {
      const sessionRes = await fetch(`/api/sessions/${sessionId}`);
      if (!sessionRes.ok) throw new Error(`Session fetch failed: ${sessionRes.status}`);
      const session = await sessionRes.json();
      if (!session.routine_id) throw new Error('Session has no routine_id');
      return getRoutine(session.routine_id);
    },
  });

  const slots = routineData?.slots ?? [];
  const activeSlot = activeSlotIndex !== null ? slots[activeSlotIndex] : null;

  const { data: machines = [] } = useQuery({
    queryKey: ['machines', activeSlot?.muscle_group_id],
    queryFn: () => getMachines(activeSlot.muscle_group_id),
    enabled: !!activeSlot,
  });

  async function openSlot(index) {
    setActiveSlotIndex(index);
    setSelectedMachine(null);
    setMachineLastSet(null);
    setView('machines');
  }

  async function selectMachine(machine) {
    setSelectedMachine(machine);
    const lastSet = await getMachineLastSet(machine.id);
    setMachineLastSet(lastSet);
    setView('log');
  }

  async function submitSet(formData) {
    await logSet(sessionId, {
      routine_slot_id: activeSlot.id,
      machine_id: selectedMachine.id,
      ...formData,
    });
    setLastUsedMachineId(selectedMachine.id);
    // Invalidate machine history cache
    qc.invalidateQueries({ queryKey: ['machines'] });

    const newCompleted = new Set(completedSlots);
    newCompleted.add(activeSlot.id);
    setCompletedSlots(newCompleted);

    // Go to next incomplete slot or back to slots view
    const nextIndex = slots.findIndex((s, i) => i > activeSlotIndex && !newCompleted.has(s.id));
    if (nextIndex !== -1) {
      setActiveSlotIndex(nextIndex);
      setSelectedMachine(null);
      setMachineLastSet(null);
      setView('machines');
    } else {
      setView('slots');
    }
  }

  async function finishSession() {
    await completeSession(sessionId);
    setView('done');
  }

  if (isLoading) return <WorkoutShell><p className="text-zinc-400 p-8 text-center">Loading…</p></WorkoutShell>;
  if (isError) return (
    <WorkoutShell>
      <div className="px-4 pt-16 text-center">
        <p className="text-red-400 font-bold mb-2">Failed to load workout</p>
        <p className="text-zinc-500 text-sm mb-6">{error?.message}</p>
        <button className="btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </WorkoutShell>
  );

  if (view === 'done') return <SessionComplete slots={slots} completedSlots={completedSlots} onExit={() => navigate('/')} />;

  if (view === 'log') {
    const suggestion = getProgressionSuggestion(machineLastSet, activeSlot);
    return (
      <WorkoutShell>
        <SetLogView
          slot={activeSlot}
          machine={selectedMachine}
          lastSet={machineLastSet}
          suggestion={suggestion}
          onBack={() => setView('machines')}
          onSubmit={submitSet}
        />
      </WorkoutShell>
    );
  }

  if (view === 'machines') {
    return (
      <WorkoutShell>
        <MachineSelectView
          slot={activeSlot}
          machines={machines}
          lastUsedMachineId={lastUsedMachineId}
          onSelect={selectMachine}
          onBack={() => setView('slots')}
        />
      </WorkoutShell>
    );
  }

  // Default: slots overview
  const allDone = slots.every((s) => completedSlots.has(s.id));
  return (
    <WorkoutShell>
      <SlotsView
        slots={slots}
        completedSlots={completedSlots}
        onSelectSlot={openSlot}
        onFinish={finishSession}
        allDone={allDone}
        onExit={() => navigate('/')}
      />
    </WorkoutShell>
  );
}

// ─── Slots overview ─────────────────────────────────────────────────────────

function SlotsView({ slots, completedSlots, onSelectSlot, onFinish, allDone, onExit }) {
  const doneCount = completedSlots.size;
  const total = slots.length;

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Active Session</h1>
          <p className="text-xs text-zinc-500">{doneCount}/{total} exercises complete</p>
        </div>
        <button onClick={onExit} className="p-2 text-zinc-500 hover:text-zinc-300">
          <X size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
        />
      </div>

      <div className="px-4 space-y-2">
        {slots.map((slot, i) => {
          const done = completedSlots.has(slot.id);
          return (
            <button
              key={slot.id}
              onClick={() => !done && onSelectSlot(i)}
              className={`w-full text-left card flex items-center gap-4 transition-all
                ${done ? 'opacity-50 cursor-default' : 'active:scale-[0.98] hover:border-zinc-600'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold
                ${done ? 'bg-green-900 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {done ? <CheckCircle2 size={18} /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${done ? 'text-zinc-500' : 'text-white'}`}>
                  {slot.muscle_group_name}
                </p>
                <p className="text-xs text-zinc-600">
                  {slot.rep_range_min}–{slot.rep_range_max} reps · {slot.tut_target_seconds}s TUT
                </p>
              </div>
              {!done && <ChevronRight size={16} className="text-zinc-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-6 pb-4">
        {allDone ? (
          <button className="btn-primary" onClick={onFinish}>
            Complete Session
          </button>
        ) : (
          <button className="btn-ghost text-sm" onClick={onFinish}>
            End Session Early
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Machine selector ────────────────────────────────────────────────────────

function MachineSelectView({ slot, machines, lastUsedMachineId, onSelect, onBack }) {
  const [lastSets, setLastSets] = useState({});

  useEffect(() => {
    machines.forEach(async (m) => {
      const ls = await getMachineLastSet(m.id);
      setLastSets((prev) => ({ ...prev, [m.id]: ls }));
    });
  }, [machines]);

  // Sort: last-used first, then by name
  const sorted = [...machines].sort((a, b) => {
    if (a.id === lastUsedMachineId) return -1;
    if (b.id === lastUsedMachineId) return 1;
    if (lastSets[a.id] && !lastSets[b.id]) return -1;
    if (!lastSets[a.id] && lastSets[b.id]) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-6 pb-3">
        <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 text-sm mb-3 -ml-1">
          <ChevronLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold">{slot?.muscle_group_name}</h2>
        <p className="text-zinc-500 text-xs mt-0.5">
          {slot?.rep_range_min}–{slot?.rep_range_max} reps · {slot?.tut_target_seconds}s TUT — pick a machine
        </p>
      </div>

      <div className="px-4 space-y-3 pb-8">
        {sorted.length === 0 ? (
          <div className="card text-center py-6 text-zinc-400 text-sm">
            No machines configured for this muscle group.
          </div>
        ) : (
          sorted.map((m) => (
            <MachineCard
              key={m.id}
              machine={m}
              lastSet={lastSets[m.id]}
              onSelect={onSelect}
              isLastUsed={m.id === lastUsedMachineId}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Set logger ──────────────────────────────────────────────────────────────

function SetLogView({ slot, machine, lastSet, suggestion, onBack, onSubmit }) {
  const [weight, setWeight] = useState(suggestion.suggestedWeight ?? lastSet?.weight ?? '');
  const [reps, setReps] = useState('');
  const [tut, setTut] = useState('');
  const [rpe, setRpe] = useState('');
  const [reachedFailure, setReachedFailure] = useState(false);
  const [seatSettings, setSeatSettings] = useState(() => {
    const defaults = {};
    if (machine?.seat_config) {
      Object.keys(machine.seat_config).forEach((k) => {
        defaults[k] = lastSet?.seat_settings?.[k] ?? '';
      });
    }
    return defaults;
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        weight: parseFloat(weight) || null,
        reps: parseInt(reps) || null,
        tut_seconds: parseInt(tut) || null,
        rpe: parseInt(rpe) || null,
        reached_failure: reachedFailure,
        seat_settings: seatSettings,
      });
    } finally {
      setSaving(false);
    }
  }

  const hasSeatConfig = machine?.seat_config && Object.keys(machine.seat_config).length > 0;

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-6 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 text-sm mb-3 -ml-1">
          <ChevronLeft size={16} /> Back
        </button>
        <h2 className="text-xl font-bold leading-tight">{machine?.name}</h2>
        <p className="text-zinc-500 text-xs mt-0.5">{slot?.muscle_group_name}</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-4">
        {/* Progression card */}
        <ProgressionCard suggestion={suggestion} lastSet={lastSet} slot={slot} />

        {/* Seat settings */}
        {hasSeatConfig && (
          <div className="card">
            <p className="label mb-3">Machine Setup</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(machine.seat_config).map(([key, cfg]) => (
                <div key={key}>
                  <label className="text-xs text-zinc-500 block mb-1">{cfg.label}</label>
                  <input
                    type="text"
                    placeholder={cfg.hint}
                    value={seatSettings[key] ?? ''}
                    onChange={(e) => setSeatSettings((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weight + Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label mb-2">Weight (lbs)</p>
            <input
              type="number"
              step="2.5"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-field"
              placeholder="0"
              inputMode="decimal"
            />
          </div>
          <div>
            <p className="label mb-2">Reps</p>
            <input
              type="number"
              min="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="input-field"
              placeholder="0"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* TUT */}
        <div>
          <p className="label mb-2">
            Time Under Tension{slot?.tut_target_seconds ? ` (target: ${slot.tut_target_seconds}s)` : ''}
          </p>
          <TutTimer onComplete={(s) => setTut(String(s))} />
          {tut && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-500">Recorded TUT:</span>
              <input
                type="number"
                value={tut}
                onChange={(e) => setTut(e.target.value)}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-amber-400"
                inputMode="numeric"
              />
              <span className="text-xs text-zinc-500">sec</span>
            </div>
          )}
        </div>

        {/* Reached failure toggle */}
        <button
          type="button"
          onClick={() => setReachedFailure((v) => !v)}
          className={`w-full py-3 rounded-xl border text-sm font-semibold transition-colors
            ${reachedFailure
              ? 'border-green-600 bg-green-900/30 text-green-400'
              : 'border-zinc-700 text-zinc-500'}`}
        >
          {reachedFailure ? '✓ Reached Momentary Muscular Failure' : 'Mark as Reached Failure'}
        </button>

        {/* RPE */}
        <div>
          <p className="label mb-2">RPE (1–10, optional)</p>
          <div className="flex gap-1.5">
            {[6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRpe(rpe === String(r) ? '' : String(r))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-colors
                  ${rpe === String(r)
                    ? 'border-amber-400 bg-amber-400 text-zinc-950'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Log Set'}
        </button>
      </form>
    </div>
  );
}

// ─── Session complete ─────────────────────────────────────────────────────────

function SessionComplete({ slots, completedSlots, onExit }) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-16 pb-8 text-center">
      <div className="w-20 h-20 bg-green-900/40 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-green-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Session Complete</h1>
      <p className="text-zinc-500 text-sm mb-2">
        {completedSlots.size} of {slots.length} exercises logged
      </p>
      <p className="text-zinc-600 text-xs mb-8">
        Rest 48–72 hours before training the same muscles again.
      </p>
      <button className="btn-primary" onClick={onExit}>
        Back to Home
      </button>
    </div>
  );
}

function WorkoutShell({ children }) {
  return <div className="min-h-screen bg-zinc-950">{children}</div>;
}
