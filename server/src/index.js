import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authRouter } from './routes/auth.js';
import { muscleGroupsRouter } from './routes/muscleGroups.js';
import { machinesRouter } from './routes/machines.js';
import { routinesRouter } from './routes/routines.js';
import { sessionsRouter } from './routes/sessions.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
const __dirname = dirname(fileURLToPath(import.meta.url));

// In production the frontend is served from the same origin — no CORS needed.
// In development allow the Vite dev server.
if (!isProd) {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
}

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/muscle-groups', muscleGroupsRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/sessions', sessionsRouter);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Serve the built React app in production
if (isProd) {
  const clientDist = join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  // Let React Router handle all non-API routes
  app.get('*', (req, res) => res.sendFile(join(clientDist, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server on :${PORT}`));
