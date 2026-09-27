import { prisma } from '../../lib/prisma';
import { LocalAdapter } from './storage/local.adapter';
import { AuditService } from '../audit/audit.service';

export const DocumentService = {
  async getStudentProfileByUserId(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new Error('Student profile not found');
    return student;
  },

  async uploadDocument(userId: string, file: Express.Multer.File, documentType: string, expiryDate?: Date) {
    const student = await this.getStudentProfileByUserId(userId);
    const { storagePath } = await LocalAdapter.save(file, student.id);

    return prisma.studentDocument.create({
      data: {
        studentId: student.id,
        documentType,
        fileName: file.originalname,
        originalName: file.originalname,
        storagePath,
        mimeType: file.mimetype,
        fileSize: file.size,
        verificationState: 'UPLOADED',
        expiryDate,
      },
    });
  },

  async getDocuments(userId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    const docs = await prisma.studentDocument.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map(d => ({
      ...d,
      url: LocalAdapter.getUrl(d.storagePath),
    }));
  },

  async deleteDocument(id: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    const doc = await prisma.studentDocument.findFirst({
      where: { id, studentId: student.id },
    });
    if (!doc) throw new Error('Document not found');

    await LocalAdapter.delete(doc.storagePath);
    return prisma.studentDocument.delete({ where: { id } });
  },

  async getDocumentReadiness(userId: string, scholarshipId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    const [requirements, studentDocs] = await Promise.all([
      prisma.scholarshipDocumentRequirement.findMany({ where: { scholarshipId } }),
      prisma.studentDocument.findMany({ where: { studentId: student.id } }),
    ]);

    const docMap = new Map<string, typeof studentDocs[0]>();
    for (const doc of studentDocs) {
      docMap.set(doc.documentType, doc);
    }

    const details = requirements.map(req => {
      const match = docMap.get(req.documentType);
      return {
        documentType: req.documentType,
        description: req.description,
        isRequired: req.isRequired,
        isUploaded: !!match,
        documentId: match?.id,
        fileName: match?.fileName,
        verificationState: match?.verificationState || 'MISSING',
      };
    });

    const requiredDocs = details.filter(d => d.isRequired);
    const isReady = requiredDocs.every(d => d.isUploaded);

    return {
      isReady,
      totalRequired: requiredDocs.length,
      uploadedCount: requiredDocs.filter(d => d.isUploaded).length,
      missingCount: requiredDocs.filter(d => !d.isUploaded).length,
      details,
    };
  },

  async verifyDocument(id: string, state: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW', notes: string | undefined, actorId: string) {
    const updated = await prisma.studentDocument.update({
      where: { id },
      data: {
        verificationState: state,
        notes,
      },
    });

    await AuditService.log({
      actorId,
      action: `VERIFY_DOCUMENT_${state}`,
      entityType: 'StudentDocument',
      entityId: id,
    });

    return updated;
  },
};
