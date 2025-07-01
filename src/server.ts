import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
import login from './routes/auth/login';
import register from './routes/auth/register';
import projects from './routes/projects';
import invite from './routes/projects/invite';
import taskRoutes from './routes/tasks';
import projectExport from './routes/projects/export';


app.use('/api/projects', projectExport);
app.use('/api/auth/login', login);
app.use('/api/auth/register', register);
app.use('/api/projects', projects);
app.use('/api/projects', invite);
app.use('/api/projects', taskRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
