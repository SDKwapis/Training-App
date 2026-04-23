import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { muscleGroupsRouter } from './routes/muscleGroups.js';
import { machinesRouter } from './routes/machines.js';
import { routinesRouter } from './routes/routines.js';
import { sessionsRouter } from './routes/sessions.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/muscle-groups', muscleGroupsRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/sessions', sessionsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server on :${PORT}`));
