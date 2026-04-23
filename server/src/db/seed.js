import { pool } from './index.js';

const muscleGroups = [
  { name: 'Calves',          description: 'Gastrocnemius and soleus',             display_order: 1 },
  { name: 'Hamstrings',      description: 'Biceps femoris, semitendinosus',       display_order: 2 },
  { name: 'Quadriceps',      description: 'Rectus femoris, vastus group',         display_order: 3 },
  { name: 'Hip Abductors',   description: 'Gluteus medius, tensor fasciae latae', display_order: 4 },
  { name: 'Hip Adductors',   description: 'Adductor group',                       display_order: 5 },
  { name: 'Lower Back',      description: 'Erector spinae',                       display_order: 6 },
  { name: 'Lats',            description: 'Latissimus dorsi',                     display_order: 7 },
  { name: 'Upper Back',      description: 'Rhomboids, mid/lower traps',           display_order: 8 },
  { name: 'Rear Delts',      description: 'Posterior deltoid',                    display_order: 9 },
  { name: 'Chest',           description: 'Pectoralis major and minor',           display_order: 10 },
  { name: 'Shoulders',       description: 'Anterior and lateral deltoid',         display_order: 11 },
  { name: 'Biceps',          description: 'Biceps brachii, brachialis',           display_order: 12 },
  { name: 'Triceps',         description: 'Triceps brachii',                      display_order: 13 },
  { name: 'Abdominals',      description: 'Rectus abdominis, obliques',           display_order: 14 },
  { name: 'Neck',            description: 'Sternocleidomastoid, upper traps',     display_order: 15 },
];

const machines = [
  // Calves
  {
    group: 'Calves', name: 'Standing Calf Raise Machine',
    seat_config: { shoulder_pad_height: { label: 'Shoulder Pad Height', hint: '1–10' } },
    notes: 'Full range; slow stretch at bottom',
  },
  {
    group: 'Calves', name: 'Seated Calf Raise Machine',
    seat_config: { knee_pad_position: { label: 'Knee Pad Position', hint: '1–8' } },
    notes: 'Isolates soleus effectively',
  },
  {
    group: 'Calves', name: 'Leg Press Calf Raise',
    seat_config: {
      seat_back: { label: 'Seat Back Angle', hint: 'Notch 1–5' },
      foot_platform: { label: 'Foot Platform Height', hint: 'Pin 1–4' },
    },
    notes: 'Use toes on lower edge of platform',
  },

  // Hamstrings
  {
    group: 'Hamstrings', name: 'Lying Leg Curl',
    seat_config: {
      ankle_pad: { label: 'Ankle Pad Position', hint: '1–8' },
      hip_pad: { label: 'Hip Pad Position', hint: '1–5' },
    },
    notes: 'Hips stay flat; full stretch important',
  },
  {
    group: 'Hamstrings', name: 'Seated Leg Curl',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      knee_pad: { label: 'Knee Pad Position', hint: '1–6' },
      ankle_pad: { label: 'Ankle Pad', hint: '1–8' },
    },
    notes: 'Back straight; full ROM',
  },
  {
    group: 'Hamstrings', name: 'Nordic Hamstring Curl',
    seat_config: { ankle_strap_height: { label: 'Ankle Strap Height', hint: 'Notch 1–4' } },
    notes: 'Bodyweight eccentric focus',
  },

  // Quadriceps
  {
    group: 'Quadriceps', name: 'Leg Extension Machine',
    seat_config: {
      seat_back: { label: 'Seat Back Position', hint: '1–10' },
      shin_pad: { label: 'Shin Pad Height', hint: '1–8' },
      knee_align: { label: 'Knee Alignment Knob', hint: '1–5' },
    },
    notes: 'Knees must align with cam axis',
  },
  {
    group: 'Quadriceps', name: 'Leg Press',
    seat_config: {
      seat_position: { label: 'Seat Position', hint: 'Notch 1–8' },
      foot_plate: { label: 'Foot Plate Height', hint: 'Pin A–E' },
    },
    notes: 'Feet shoulder width; knees track toes',
  },
  {
    group: 'Quadriceps', name: 'Hack Squat Machine',
    seat_config: {
      shoulder_pad: { label: 'Shoulder Pad Height', hint: '1–6' },
      foot_plate: { label: 'Foot Plate', hint: 'Top/Middle/Bottom' },
    },
    notes: 'Slow descent; do not lock out at top',
  },

  // Hip Abductors
  {
    group: 'Hip Abductors', name: 'Hip Abduction Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–6' },
      starting_position: { label: 'Start Angle', hint: 'Degrees (e.g. 10)' },
    },
    notes: 'Controlled throughout; avoid swinging',
  },

  // Hip Adductors
  {
    group: 'Hip Adductors', name: 'Hip Adduction Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–6' },
      starting_position: { label: 'Start Angle', hint: 'Degrees (e.g. 40)' },
    },
    notes: 'Full ROM; controlled on return',
  },

  // Lower Back
  {
    group: 'Lower Back', name: 'Lumbar Extension Machine (MedX/Nautilus)',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–10' },
      thigh_pad: { label: 'Thigh Pad Position', hint: '1–6' },
      pelvis_strap: { label: 'Pelvis Strap Tightness', hint: 'Snug / Tight' },
    },
    notes: 'Isolates erectors; pelvis must be strapped',
  },
  {
    group: 'Lower Back', name: '45° Back Extension',
    seat_config: { pad_height: { label: 'Hip Pad Height', hint: 'Notch 1–5' } },
    notes: 'Add weight plate for progression',
  },

  // Lats
  {
    group: 'Lats', name: 'Lat Pulldown',
    seat_config: {
      thigh_pad: { label: 'Thigh Pad Height', hint: '1–6' },
      grip: { label: 'Grip Attachment', hint: 'Wide / Neutral / Underhand' },
    },
    notes: 'Pull to upper chest; full stretch at top',
  },
  {
    group: 'Lats', name: 'Nautilus / Hammer Strength Pullover',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      elbow_pad: { label: 'Elbow Pad Position', hint: '1–5' },
    },
    notes: 'Elbows on pads; pure lat isolation',
  },
  {
    group: 'Lats', name: 'Assisted Pull-Up Machine',
    seat_config: { knee_pad: { label: 'Knee Pad Height', hint: '1–6' } },
    notes: 'Lower assist = harder; full hang at top',
  },

  // Upper Back
  {
    group: 'Upper Back', name: 'Seated Cable Row',
    seat_config: {
      cable_height: { label: 'Cable Height', hint: 'Pin 1 (floor) – 8' },
      grip: { label: 'Grip Attachment', hint: 'Close / Wide / Pronated' },
    },
    notes: 'Chest to pad; row to lower sternum',
  },
  {
    group: 'Upper Back', name: 'Hammer Strength ISO-Lateral Row',
    seat_config: {
      chest_pad: { label: 'Chest Pad Position', hint: '1–6' },
      seat_height: { label: 'Seat Height', hint: '1–5' },
    },
    notes: 'Can be done unilaterally',
  },
  {
    group: 'Upper Back', name: 'Bent-Over Row Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–7' },
      chest_pad: { label: 'Chest Pad', hint: '1–5' },
    },
    notes: 'Elbows flare slightly for upper back emphasis',
  },

  // Rear Delts
  {
    group: 'Rear Delts', name: 'Reverse Pec Deck (Rear Delt Fly)',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      arm_pad: { label: 'Arm Pad Position', hint: '1–5' },
    },
    notes: 'Face pad; arms parallel to floor',
  },
  {
    group: 'Rear Delts', name: 'Cable Rear Delt Fly',
    seat_config: { cable_height: { label: 'Cable Height', hint: 'Pin 1–10 (top)' } },
    notes: 'Cross cables; pull from opposite side',
  },

  // Chest
  {
    group: 'Chest', name: 'Chest Press Machine (Nautilus / Hammer Strength)',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      back_pad: { label: 'Back Pad Position', hint: '1–5' },
    },
    notes: 'Handles at lower pec level; full ROM',
  },
  {
    group: 'Chest', name: 'Pec Deck / Fly Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      arm_pad: { label: 'Arm Pad Width', hint: 'Notch 1–6' },
    },
    notes: 'Arms slightly bent; squeeze at close',
  },
  {
    group: 'Chest', name: 'Incline Chest Press Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      back_angle: { label: 'Back Angle', hint: '30° / 45°' },
    },
    notes: 'Emphasizes upper chest',
  },
  {
    group: 'Chest', name: 'Cable Crossover',
    seat_config: {
      cable_height: { label: 'Cable Height (each side)', hint: 'Pin 1–10' },
    },
    notes: 'High cable = lower chest; low cable = upper chest',
  },

  // Shoulders
  {
    group: 'Shoulders', name: 'Overhead Press Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      back_pad: { label: 'Back Pad', hint: '1–5' },
    },
    notes: 'Do not lock out at top; controlled negative',
  },
  {
    group: 'Shoulders', name: 'Lateral Raise Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      arm_pad: { label: 'Arm Pad Position', hint: '1–5' },
    },
    notes: 'Elbows level with shoulder at top',
  },
  {
    group: 'Shoulders', name: 'Cable Lateral Raise',
    seat_config: {
      cable_height: { label: 'Cable Height', hint: 'Bottom pin' },
    },
    notes: 'Single arm; slight lean away from cable',
  },

  // Biceps
  {
    group: 'Biceps', name: 'Nautilus / Preacher Curl Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      upper_arm_pad: { label: 'Upper Arm Pad Height', hint: '1–5' },
    },
    notes: 'Full stretch at bottom; supinate at top',
  },
  {
    group: 'Biceps', name: 'Seated Bicep Curl Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      back_pad: { label: 'Back Pad', hint: '1–5' },
    },
    notes: 'Elbows fixed; no body swing',
  },
  {
    group: 'Biceps', name: 'Cable Curl',
    seat_config: {
      cable_height: { label: 'Cable Height', hint: 'Bottom pin' },
      bar_attachment: { label: 'Attachment', hint: 'EZ-bar / Straight / Rope' },
    },
    notes: 'Elbows pinned to sides throughout',
  },

  // Triceps
  {
    group: 'Triceps', name: 'Tricep Extension Machine (Nautilus)',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      upper_arm_pad: { label: 'Upper Arm Pad', hint: '1–5' },
    },
    notes: 'Full extension without locking; slow negative',
  },
  {
    group: 'Triceps', name: 'Cable Pressdown',
    seat_config: {
      cable_height: { label: 'Cable Height', hint: 'Top pin' },
      attachment: { label: 'Attachment', hint: 'Rope / V-bar / Straight' },
    },
    notes: 'Elbows pinned; complete extension each rep',
  },
  {
    group: 'Triceps', name: 'Overhead Tricep Extension (Cable)',
    seat_config: {
      cable_height: { label: 'Cable Height', hint: 'Bottom pin' },
      attachment: { label: 'Attachment', hint: 'Rope / EZ-bar' },
    },
    notes: 'Emphasizes long head; full stretch overhead',
  },

  // Abdominals
  {
    group: 'Abdominals', name: 'Ab Crunch Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–8' },
      chest_pad: { label: 'Chest Pad', hint: '1–5' },
    },
    notes: 'Exhale on crunch; do not use momentum',
  },
  {
    group: 'Abdominals', name: 'Cable Crunch',
    seat_config: { cable_height: { label: 'Cable Height', hint: 'Top pin' } },
    notes: 'Kneel; crunch toward knees, not hips',
  },

  // Neck
  {
    group: 'Neck', name: '4-Way Neck Machine',
    seat_config: {
      seat_height: { label: 'Seat Height', hint: '1–6' },
      head_pad: { label: 'Head Pad Angle', hint: 'Flex / Extend / L / R' },
    },
    notes: 'Very light weight; 3-5 sec cadence',
  },
];

const defaultRoutine = {
  name: 'Full Body — Jones Protocol',
  description: 'Complete full-body HIT session. One set to failure per exercise. 2–3× per week with 48–72 hr recovery.',
  slots: [
    { group: 'Calves',        sets: 1, min: 10, max: 15, tut: 60 },
    { group: 'Hamstrings',    sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Quadriceps',    sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Hip Abductors', sets: 1, min: 10, max: 15, tut: 60 },
    { group: 'Hip Adductors', sets: 1, min: 10, max: 15, tut: 60 },
    { group: 'Lower Back',    sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Lats',          sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Upper Back',    sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Rear Delts',    sets: 1, min: 10, max: 15, tut: 50 },
    { group: 'Chest',         sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Shoulders',     sets: 1, min: 8,  max: 12, tut: 60 },
    { group: 'Biceps',        sets: 1, min: 8,  max: 12, tut: 50 },
    { group: 'Triceps',       sets: 1, min: 8,  max: 12, tut: 50 },
    { group: 'Abdominals',    sets: 1, min: 10, max: 15, tut: 50 },
    { group: 'Neck',          sets: 1, min: 12, max: 15, tut: 45 },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert muscle groups
    const groupIdMap = {};
    for (const g of muscleGroups) {
      const res = await client.query(
        `INSERT INTO muscle_groups (name, description, display_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, display_order = EXCLUDED.display_order
         RETURNING id`,
        [g.name, g.description, g.display_order]
      );
      groupIdMap[g.name] = res.rows[0].id;
    }
    console.log(`Seeded ${muscleGroups.length} muscle groups.`);

    // Insert machines (skip if already present by name)
    let machineCount = 0;
    const machineIdMap = {};
    for (const m of machines) {
      const groupId = groupIdMap[m.group];
      if (!groupId) { console.warn(`Unknown group: ${m.group}`); continue; }
      const res = await client.query(
        `INSERT INTO machines (name, muscle_group_id, seat_config, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id, name`,
        [m.name, groupId, JSON.stringify(m.seat_config), m.notes || null]
      );
      if (res.rows.length) {
        machineIdMap[m.name] = res.rows[0].id;
        machineCount++;
      }
    }
    console.log(`Seeded ${machineCount} machines.`);

    // Insert default routine
    const existingRoutine = await client.query(
      `SELECT id FROM routines WHERE name = $1`, [defaultRoutine.name]
    );
    if (!existingRoutine.rows.length) {
      const routineRes = await client.query(
        `INSERT INTO routines (name, description) VALUES ($1, $2) RETURNING id`,
        [defaultRoutine.name, defaultRoutine.description]
      );
      const routineId = routineRes.rows[0].id;

      for (let i = 0; i < defaultRoutine.slots.length; i++) {
        const s = defaultRoutine.slots[i];
        const groupId = groupIdMap[s.group];
        if (!groupId) continue;
        await client.query(
          `INSERT INTO routine_slots (routine_id, muscle_group_id, slot_order, sets_target, rep_range_min, rep_range_max, tut_target_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [routineId, groupId, i + 1, s.sets, s.min, s.max, s.tut]
        );
      }
      console.log(`Seeded default routine: "${defaultRoutine.name}" with ${defaultRoutine.slots.length} slots.`);
    } else {
      console.log('Default routine already exists, skipping.');
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
