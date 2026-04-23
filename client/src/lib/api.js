const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Muscle groups
export const getMuscleGroups = () => req('/muscle-groups');

// Machines
export const getMachines = (muscleGroupId) =>
  req(`/machines${muscleGroupId ? `?muscle_group_id=${muscleGroupId}` : ''}`);
export const getMachine = (id) => req(`/machines/${id}`);
export const getMachineLastSet = (id) => req(`/machines/${id}/last-set`);
export const getMachineHistory = (id, limit = 10) => req(`/machines/${id}/history?limit=${limit}`);
export const createMachine = (data) => req('/machines', { method: 'POST', body: JSON.stringify(data) });
export const updateMachine = (id, data) => req(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Routines
export const getRoutines = () => req('/routines');
export const getRoutine = (id) => req(`/routines/${id}`);
export const createRoutine = (data) => req('/routines', { method: 'POST', body: JSON.stringify(data) });
export const updateRoutine = (id, data) => req(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRoutine = (id) => req(`/routines/${id}`, { method: 'DELETE' });

// Sessions
export const getSessions = (limit = 20) => req(`/sessions?limit=${limit}`);
export const getSession = (id) => req(`/sessions/${id}`);
export const startSession = (routine_id) => req('/sessions', { method: 'POST', body: JSON.stringify({ routine_id }) });
export const logSet = (sessionId, data) => req(`/sessions/${sessionId}/sets`, { method: 'POST', body: JSON.stringify(data) });
export const completeSession = (sessionId, notes) =>
  req(`/sessions/${sessionId}/complete`, { method: 'PATCH', body: JSON.stringify({ notes }) });
