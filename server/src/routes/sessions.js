import { Router } from 'express';
import { pool } from '../db/index.js';

export const sessionsRouter = Router();

sessionsRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { rows } = await pool.query(
      `SELECT s.*, r.name AS routine_name,
              COUNT(ss.id)::int AS total_sets,
              EXTRACT(EPOCH FROM (s.completed_at - s.started_at))::int AS duration_seconds
       FROM sessions s
       JOIN routines r ON r.id = s.routine_id
       LEFT JOIN session_sets ss ON ss.session_id = s.id
       GROUP BY s.id, r.name
       ORDER BY s.started_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

sessionsRouter.get('/:id', async (req, res, next) => {
  try {
    const sessionRes = await pool.query(
      `SELECT s.*, r.name AS routine_name
       FROM sessions s JOIN routines r ON r.id = s.routine_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!sessionRes.rows.length) return res.status(404).json({ error: 'Session not found' });

    const setsRes = await pool.query(
      `SELECT ss.*, m.name AS machine_name, mg.name AS muscle_group_name,
              rs.rep_range_min, rs.rep_range_max, rs.tut_target_seconds, rs.slot_order
       FROM session_sets ss
       JOIN machines m ON m.id = ss.machine_id
       JOIN routine_slots rs ON rs.id = ss.routine_slot_id
       JOIN muscle_groups mg ON mg.id = rs.muscle_group_id
       WHERE ss.session_id = $1
       ORDER BY ss.completed_at`,
      [req.params.id]
    );

    res.json({ ...sessionRes.rows[0], sets: setsRes.rows });
  } catch (err) {
    next(err);
  }
});

sessionsRouter.post('/', async (req, res, next) => {
  try {
    const { routine_id } = req.body;
    if (!routine_id) return res.status(400).json({ error: 'routine_id is required' });
    const { rows } = await pool.query(
      'INSERT INTO sessions (routine_id) VALUES ($1) RETURNING *',
      [routine_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

sessionsRouter.post('/:id/sets', async (req, res, next) => {
  try {
    const {
      routine_slot_id, machine_id, weight, reps, tut_seconds,
      seat_settings = {}, rpe, reached_failure = false, set_order = 1,
    } = req.body;

    if (!routine_slot_id || !machine_id) {
      return res.status(400).json({ error: 'routine_slot_id and machine_id are required' });
    }

    // Verify session exists
    const sessionCheck = await pool.query('SELECT id FROM sessions WHERE id = $1', [req.params.id]);
    if (!sessionCheck.rows.length) return res.status(404).json({ error: 'Session not found' });

    const { rows } = await pool.query(
      `INSERT INTO session_sets
         (session_id, routine_slot_id, machine_id, set_order, weight, reps, tut_seconds, seat_settings, rpe, reached_failure)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.params.id, routine_slot_id, machine_id, set_order, weight, reps, tut_seconds, JSON.stringify(seat_settings), rpe || null, reached_failure]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

sessionsRouter.patch('/:id/complete', async (req, res, next) => {
  try {
    const { notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE sessions SET completed_at = NOW(), notes = COALESCE($1, notes)
       WHERE id = $2 AND completed_at IS NULL
       RETURNING *`,
      [notes || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Session not found or already completed' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
