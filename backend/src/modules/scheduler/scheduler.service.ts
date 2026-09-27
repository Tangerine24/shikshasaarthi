import cron from 'node-cron';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export const SchedulerService = {
  init() {
    logger.info('SchedulerService: Registered daily cron jobs (Document health & scholarship deadlines).');
    
    // Run daily at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
      try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // 1. Check Expiring Documents
        const expiringDocs = await prisma.studentDocument.findMany({
          where: {
            expiryDate: {
              lte: thirtyDaysFromNow,
              gt: now
            }
          },
          include: { student: true }
        });

        for (const doc of expiringDocs) {
          const daysLeft = Math.ceil((new Date(doc.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: doc.student.userId,
              type: 'DOCUMENT_EXPIRING',
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          });

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                userId: doc.student.userId,
                type: 'DOCUMENT_EXPIRING',
                title: 'दस्तावेज़ समाप्ति चेतावनी / Document Expiry Warning',
                body: `आपका दस्तावेज़ (${doc.originalName || doc.documentType}) ${daysLeft} दिनों में समाप्त हो रहा है। कृपया नवीनीकरण करें।`,
                metadata: JSON.stringify({ documentId: doc.id, daysLeft })
              }
            });
          }
        }

        // 2. Check Upcoming Scholarship Deadlines (< 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(new Date().getDate() + 7);

        const endingScholarships = await prisma.scholarship.findMany({
          where: {
            status: 'PUBLISHED',
            deadline: {
              lte: sevenDaysFromNow,
              gt: now
            }
          }
        });

        for (const scholarship of endingScholarships) {
          const activeApplications = await prisma.application.findMany({
            where: { scholarshipId: scholarship.id },
            include: { student: true }
          });
          
          for (const app of activeApplications) {
            await prisma.notification.create({
              data: {
                userId: app.student.userId,
                type: 'SCHOLARSHIP_DEADLINE',
                title: 'अंतिम तिथि चेतावनी / Scholarship Deadline Alert',
                body: `${scholarship.title} की अंतिम तिथि निकट आ रही है।`,
                metadata: JSON.stringify({ scholarshipId: scholarship.id })
              }
            });
          }
        }
      } catch (err) {
        logger.error('Scheduler error:', err);
      }
    });
  }
};
