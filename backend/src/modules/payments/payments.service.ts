import { prisma } from '../../lib/prisma';

export const PaymentService = {
  async getPaymentTimeline(applicationId: string) {
    const events = await prisma.paymentEvent.findMany({
      where: { applicationId },
      orderBy: { eventDate: 'asc' }
    });

    const statusLabels: Record<string, string> = {
      APPROVED: 'Scholarship Sanction Approved',
      SANCTIONED: 'Ministry Sanction Order Issued',
      PAYMENT_INITIATED: 'PFMS Payment Batch Initiated',
      BANK_VALIDATION: 'NPCI Aadhaar-Bank Account Validation',
      DBT_PROCESSING: 'Direct Benefit Transfer in Progress',
      PAID: 'Funds Credited to Bank Account',
      FAILED: 'DBT Processing Error'
    };

    return events.map((event) => ({
      ...event,
      statusLabel: statusLabels[event.dbtStatus] || event.dbtStatus
    }));
  },

  async getPaymentSummary(userId: string) {
    return prisma.paymentEvent.findMany({
      where: {
        application: {
          student: {
            userId
          }
        }
      },
      include: {
        application: {
          include: {
            scholarship: {
              select: {
                title: true,
                benefit: true
              }
            }
          }
        }
      },
      orderBy: { eventDate: 'desc' }
    });
  }
};
