import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './lib/logger';
import path from 'path';
import fs from 'fs';

import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/students/students.routes';
import scholarshipRoutes from './modules/scholarships/scholarships.routes';
import eligibilityRoutes from './modules/eligibility/eligibility.routes';
import documentRoutes from './modules/documents/documents.routes';
import applicationRoutes from './modules/applications/applications.routes';
import providerRoutes from './modules/providers/providers.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import jagoRoutes from './modules/jago/jago.routes';
import adminRoutes from './modules/admin/admin.routes';
import passportRoutes from './modules/passport/passport.routes';
import consentRoutes from './modules/consent/consent.routes';
import paymentRoutes from './modules/payments/payments.routes';
import verificationRoutes from './modules/verification/verification.routes';
import roadmapRoutes from './modules/roadmap/roadmap.routes';
import { SchedulerService } from './modules/scheduler/scheduler.service';

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// v1 API routes (primary)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/scholarships', scholarshipRoutes);
app.use('/api/v1/eligibility', eligibilityRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/jago', jagoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/passport', passportRoutes);
app.use('/api/v1/consent', consentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/student/eligibility-roadmap', roadmapRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);

// Backward-compatible aliases (existing /api/* routes)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jago', jagoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/student/eligibility-roadmap', roadmapRoutes);
app.use('/api/roadmap', roadmapRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), version: '2.1.0' });
});
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), version: '2.1.0' });
});

// Serve frontend build if present (Unified single-service deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

if (config.nodeEnv !== 'test') {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    SchedulerService.init();
  });
}

export default app;
