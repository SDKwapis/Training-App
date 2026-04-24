import { Router } from 'express';
import { pool } from '../db/index.js';
import { authenticate } from '../middleware/authenticate.js';

export const machinesRouter = Router();

machinesRouter.get('/', async (req, res, next) => {
  try {
    const { muscle_group_id } = req.query;
    const params = [];
    let where = 'WHERE m.active = true';
    if (muscle_group_id) {
      params.push(muscle_group_id);
      where += ` AND m.muscle_group_id = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT m.*, mg.name AS muscle_group_name
       FROM machines m
       JOIN muscle_groups mg ON mg.id = m.muscle_group_id
       ${where}
       ORDER BY mg.display_order, m.name`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

machinesRouter.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*, mg.name AS muscle_group_name
       FROM machines m
       JOIN muscle_groups mg ON mg.id = m.muscle_group_id
       WHERE m.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Machine not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Last N sets for this machine scoped to the authenticated user
machinesRouter.get('/:id/history', authenticate, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { rows } = await pool.query(
      `SELECT ss.*, s.started_at AS session_date
       FROM session_sets ss
       JOIN sessions s ON s.id = ss.session_id
       WHERE ss.machine_id = $1 AND s.user_id = $2
       ORDER BY ss.completed_at DESC
       LIMIT $3`,
      [req.params.id, req.user.id, limit]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Last set for a given machine scoped to the authenticated user (progression)
machinesRouter.get('/:id/last-set', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ss.*, s.started_at AS session_date
       FROM session_sets ss
       JOIN sessions s ON s.id = ss.session_id
       WHERE ss.machine_id = $1 AND s.user_id = $2
       ORDER BY ss.completed_at DESC
       LIMIT 1`,
      [req.params.id, req.user.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

machinesRouter.post('/', async (req, res, next) => {
  try {
    const { name, muscle_group_id, seat_config = {}, notes } = req.body;
    if (!name || !muscle_group_id) {
      return res.status(400).json({ error: 'name and muscle_group_id are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO machines (name, muscle_group_id, seat_config, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, muscle_group_id, JSON.stringify(seat_config), notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

machinesRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, muscle_group_id, seat_config, notes, active } = req.body;
    const { rows } = await pool.query(
      `UPDATE machines
       SET name = COALESCE($1, name),
           muscle_group_id = COALESCE($2, muscle_group_id),
           seat_config = COALESCE($3, seat_config),
           notes = COALESCE($4, notes),
           active = COALESCE($5, active)
       WHERE id = $6
       RETURNING *`,
      [name, muscle_group_id, seat_config ? JSON.stringify(seat_config) : null, notes, active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Machine not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
