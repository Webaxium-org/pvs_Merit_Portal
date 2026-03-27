import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ALLOWED_ORIGINS } from './utils/constants.js';
import { logger } from './middlewares/logger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Body parser middleware - increased limit for Excel uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Logger middleware
app.use(logger);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// API Routes (MongoDB - COMMENTED OUT)
// import routes from './routes/index.js';
// app.use(routes);

// V2 API Routes (SQL Server - PRIMARY)
import v2Routes from './routes/v2/index.js';
app.use(v2Routes);

// Debug: Log all registered routes (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('\n========================================');
  console.log('Registered Routes:');
  console.log('========================================');

  const printRoutes = (stack, prefix = '') => {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Route middleware
        const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
        console.log(`${methods} ${prefix}${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        // Router middleware
        const routerPath = middleware.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace('^', '')
          .replace('$', '');

        if (middleware.handle.stack) {
          printRoutes(middleware.handle.stack, prefix + routerPath);
        }
      }
    });
  };

  printRoutes(app._router.stack);
  console.log('========================================\n');
}

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
