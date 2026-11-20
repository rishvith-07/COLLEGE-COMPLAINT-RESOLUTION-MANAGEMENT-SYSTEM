import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import departmentRoutes from './routes/department.routes';
import categoryRoutes from './routes/category.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check and Routes
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'CampusResolve Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/settings', settingsRoutes);

// Support both /api prefix and direct paths on Vercel serverless runtime
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

export default app;
