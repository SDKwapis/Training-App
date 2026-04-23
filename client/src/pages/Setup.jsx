import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getRoutines, getMuscleGroups, getMachines, getRoutine,
  createRoutine, updateRoutine, deleteRoutine,
  createMachine, updateMachine,
} from '../lib/api.js';

export default function Setup() {
  const [tab, setTab] = useState('routines');
  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold">Setup</h1>
        <p className="text-zinc-500 text-sm">Manage routines and machines</p>
      </div>
      <div className="flex mx-4 mb-4 bg-zinc-900 rounded-xl p-1">
        {['routines', 'machines'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'bg-amber-400 text-zinc-950' : 'text-zinc-500'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'routines' ? <RoutinesTab /> : <MachinesTab />}
    </div>
  );
}

// ─── Routines tab ─────────────────────────────────────────────────────────────

function RoutinesTab() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data: routines = [] } = useQuery({ queryKey: ['routines'], queryFn: getRoutines });
  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  });

  if (creating) {
    return <RoutineEditor onDone={() => setCreating(false)} />;
  }
  if (editingId) {
    return <RoutineEditor routineId={editingId} onDone={() => setEditingId(null)} />;
  }

  return (
    <div className="px-4 pb-8 space-y-3">
      {routines.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{r.name}</p>
              {r.description && (
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug line-clamp-2">{r.description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setEditingId(r.id)}
                className="text-xs text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-lg hover:border-zinc-500"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${r.name}"?`)) deleteMutation.mutate(r.id);
                }}
                className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => setCreating(true)}
        className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-sm"
      >
        <Plus size={16} /> New Routine
      </button>
    </div>
  );
}

function RoutineEditor({ routineId, onDone }) {
  const qc = useQueryClient();
  const isNew = !routineId;

  const { data: existing, isLoading } = useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => getRoutine(routineId),
    enabled: !!routineId,
  });

  const { data: muscleGroups = [] } = useQuery({ queryKey: ['muscle-groups'], queryFn: getMuscleGroups });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (existing && !initialized) {
    setName(existing.name);
    setDescription(existing.description ?? '');
    setSlots(existing.slots.map((s) => ({
      muscle_group_id: s.muscle_group_id,
      sets_target: s.sets_target,
      rep_range_min: s.rep_range_min,
      rep_range_max: s.rep_range_max,
      tut_target_seconds: s.tut_target_seconds,
    })));
    setInitialized(true);
  }

  function addSlot() {
    setSlots((prev) => [...prev, {
      muscle_group_id: muscleGroups[0]?.id ?? '',
      sets_target: 1, rep_range_min: 8, rep_range_max: 12, tut_target_seconds: 60,
    }]);
  }

  function removeSlot(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index, key, val) {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, [key]: val } : s));
  }

  async function save() {
    if (!name.trim()) { alert('Routine name is required'); return; }
    setSaving(true);
    try {
      const payload = { name, description, slots };
      if (isNew) {
        await createRoutine(payload);
      } else {
        await updateRoutine(routineId, payload);
      }
      qc.invalidateQueries({ queryKey: ['routines'] });
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && isLoading) return <div className="p-8 text-center text-zinc-400">Loading…</div>;

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{isNew ? 'New Routine' : 'Edit Routine'}</h2>
        <button onClick={onDone} className="text-zinc-500 text-sm">Cancel</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label mb-2 block">Routine Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Full Body A"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="label mb-2 block">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label">Exercise Slots</p>
            <button onClick={addSlot} className="text-amber-400 text-xs flex items-center gap-1">
              <Plus size={12} /> Add Slot
            </button>
          </div>

          <div className="space-y-2">
            {slots.map((slot, i) => (
              <div key={i} className="card bg-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical size={14} className="text-zinc-600" />
                  <span className="text-xs text-zinc-500 font-bold w-4">{i + 1}</span>
                  <select
                    value={slot.muscle_group_id}
                    onChange={(e) => updateSlot(i, 'muscle_group_id', parseInt(e.target.value))}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none"
                  >
                    {muscleGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <button onClick={() => removeSlot(i)} className="text-zinc-600 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { k: 'sets_target', label: 'Sets' },
                    { k: 'rep_range_min', label: 'Rep Min' },
                    { k: 'rep_range_max', label: 'Rep Max' },
                    { k: 'tut_target_seconds', label: 'TUT (s)' },
                  ].map(({ k, label }) => (
                    <div key={k}>
                      <p className="text-zinc-600 mb-1">{label}</p>
                      <input
                        type="number"
                        value={slot[k]}
                        onChange={(e) => updateSlot(i, k, parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-white text-center text-sm focus:outline-none"
                        inputMode="numeric"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {slots.length === 0 && (
              <p className="text-center text-zinc-600 text-xs py-4">No slots yet — add exercises above.</p>
            )}
          </div>
        </div>

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Routine'}
        </button>
      </div>
    </div>
  );
}

// ─── Machines tab ─────────────────────────────────────────────────────────────

function MachinesTab() {
  const qc = useQueryClient();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);
  const [addingForGroup, setAddingForGroup] = useState(null);

  const { data: muscleGroups = [] } = useQuery({ queryKey: ['muscle-groups'], queryFn: getMuscleGroups });
  const { data: machines = [] } = useQuery({ queryKey: ['machines'], queryFn: () => getMachines() });

  const machinesByGroup = muscleGroups.reduce((acc, g) => {
    acc[g.id] = machines.filter((m) => m.muscle_group_id === g.id);
    return acc;
  }, {});

  if (editingMachine) {
    return <MachineEditor machine={editingMachine} onDone={() => setEditingMachine(null)} />;
  }

  if (addingForGroup) {
    return (
      <MachineEditor
        defaultGroupId={addingForGroup}
        onDone={() => setAddingForGroup(null)}
      />
    );
  }

  return (
    <div className="px-4 pb-8 space-y-2">
      {muscleGroups.map((g) => {
        const groupMachines = machinesByGroup[g.id] ?? [];
        const isOpen = expandedGroup === g.id;
        return (
          <div key={g.id} className="card overflow-hidden p-0">
            <button
              onClick={() => setExpandedGroup(isOpen ? null : g.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="font-semibold text-sm text-white">{g.name}</p>
                <p className="text-xs text-zinc-500">{groupMachines.length} machines</p>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
            </button>

            {isOpen && (
              <div className="border-t border-zinc-800 px-4 py-3 space-y-2">
                {groupMachines.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2">
                    <p className="text-sm text-zinc-300 flex-1 min-w-0 truncate">{m.name}</p>
                    <button
                      onClick={() => setEditingMachine(m)}
                      className="text-xs text-zinc-500 border border-zinc-700 px-2 py-1 rounded shrink-0 hover:border-zinc-500"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAddingForGroup(g.id)}
                  className="flex items-center gap-1 text-xs text-amber-400 pt-1"
                >
                  <Plus size={12} /> Add machine
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MachineEditor({ machine, defaultGroupId, onDone }) {
  const qc = useQueryClient();
  const isNew = !machine;

  const { data: muscleGroups = [] } = useQuery({ queryKey: ['muscle-groups'], queryFn: getMuscleGroups });

  const [name, setName] = useState(machine?.name ?? '');
  const [groupId, setGroupId] = useState(machine?.muscle_group_id ?? defaultGroupId ?? '');
  const [notes, setNotes] = useState(machine?.notes ?? '');
  const [active, setActive] = useState(machine?.active ?? true);
  // seat_config fields as array of {key, label, hint}
  const [configFields, setConfigFields] = useState(() => {
    if (machine?.seat_config) {
      return Object.entries(machine.seat_config).map(([key, cfg]) => ({
        key, label: cfg.label, hint: cfg.hint ?? '',
      }));
    }
    return [];
  });
  const [saving, setSaving] = useState(false);

  function addConfigField() {
    setConfigFields((prev) => [...prev, { key: '', label: '', hint: '' }]);
  }

  function updateField(i, k, v) {
    setConfigFields((prev) => prev.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  }

  function removeField(i) {
    setConfigFields((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!name.trim() || !groupId) { alert('Name and muscle group are required'); return; }
    const seat_config = configFields.reduce((acc, f) => {
      const key = f.key.trim().replace(/\s+/g, '_').toLowerCase();
      if (key) acc[key] = { label: f.label || f.key, hint: f.hint };
      return acc;
    }, {});

    setSaving(true);
    try {
      if (isNew) {
        await createMachine({ name, muscle_group_id: parseInt(groupId), seat_config, notes: notes || null });
      } else {
        await updateMachine(machine.id, { name, muscle_group_id: parseInt(groupId), seat_config, notes: notes || null, active });
      }
      qc.invalidateQueries({ queryKey: ['machines'] });
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{isNew ? 'Add Machine' : 'Edit Machine'}</h2>
        <button onClick={onDone} className="text-zinc-500 text-sm">Cancel</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label mb-2 block">Machine Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="label mb-2 block">Muscle Group</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none"
          >
            <option value="">Select…</option>
            {muscleGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label">Seat / Pin Settings</p>
            <button onClick={addConfigField} className="text-amber-400 text-xs flex items-center gap-1">
              <Plus size={12} /> Add Setting
            </button>
          </div>
          <div className="space-y-2">
            {configFields.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  placeholder="Key (e.g. seat_height)"
                  value={f.key}
                  onChange={(e) => updateField(i, 'key', e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none"
                />
                <input
                  placeholder="Label"
                  value={f.label}
                  onChange={(e) => updateField(i, 'label', e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none"
                />
                <input
                  placeholder="Hint"
                  value={f.hint}
                  onChange={(e) => updateField(i, 'hint', e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none"
                />
                <button onClick={() => removeField(i)} className="text-zinc-600 hover:text-red-400 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label mb-2 block">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Cues, form notes…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {!isNew && (
          <button
            type="button"
            onClick={() => setActive((v) => !v)}
            className={`w-full py-3 rounded-xl border text-sm font-semibold transition-colors
              ${active
                ? 'border-zinc-700 text-zinc-400'
                : 'border-red-800 bg-red-950/30 text-red-400'}`}
          >
            {active ? 'Machine is Active (tap to deactivate)' : 'Machine is Inactive (tap to reactivate)'}
          </button>
        )}

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Machine'}
        </button>
      </div>
    </div>
  );
}
