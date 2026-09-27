import client from './client';
import {
  Scholarship,
  StudentProfile,
  Application,
  StudentDocument,
  NotificationItem,
  ComprehensiveEligibilityResult,
  JagoConversation,
  Role,
} from '../types';

export const authApi = {
  async register(data: { email: string; password: string; role: Role }) {
    const res = await client.post('/auth/register', data);
    return res.data;
  },
  async login(data: { email: string; password: string }) {
    const res = await client.post('/auth/login', data);
    return res.data;
  },
  async getMe() {
    const res = await client.get('/auth/me');
    return res.data;
  },
  async refresh(refreshToken: string) {
    const res = await client.post('/auth/refresh', { refreshToken });
    return res.data;
  },
};

export const studentApi = {
  async getProfile(): Promise<{ success: boolean; data: StudentProfile }> {
    const res = await client.get('/students/profile');
    return res.data;
  },
  async updateProfile(data: Partial<StudentProfile> & { preferredLanguage?: string }): Promise<{ success: boolean; data: StudentProfile }> {
    const res = await client.patch('/students/profile', data);
    return res.data;
  },
};

export const scholarshipApi = {
  async list(filters?: { search?: string; state?: string; education?: string; sort?: string }): Promise<{ success: boolean; data: Scholarship[] }> {
    const res = await client.get('/scholarships', { params: filters });
    return res.data;
  },
  async getOne(id: string): Promise<{ success: boolean; data: Scholarship }> {
    const res = await client.get(`/scholarships/${id}`);
    return res.data;
  },
  async listProviderScholarships(): Promise<{ success: boolean; data: Scholarship[] }> {
    const res = await client.get('/scholarships/provider');
    return res.data;
  },
  async create(data: any): Promise<{ success: boolean; data: Scholarship }> {
    const res = await client.post('/scholarships', data);
    return res.data;
  },
  async update(id: string, data: any): Promise<{ success: boolean; data: Scholarship }> {
    const res = await client.patch(`/scholarships/${id}`, data);
    return res.data;
  },
};

export const eligibilityApi = {
  async check(scholarshipId: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post('/eligibility/check', { scholarshipId });
    return res.data;
  },
};

export const documentApi = {
  async list(): Promise<{ success: boolean; data: StudentDocument[] }> {
    const res = await client.get('/documents');
    return res.data;
  },
  async upload(formData: FormData): Promise<{ success: boolean; data: StudentDocument }> {
    const res = await client.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async delete(id: string): Promise<{ success: boolean }> {
    const res = await client.delete(`/documents/${id}`);
    return res.data;
  },
  async getReadiness(scholarshipId: string): Promise<{ success: boolean; data: any }> {
    const res = await client.get(`/documents/readiness/${scholarshipId}`);
    return res.data;
  },
  async verify(id: string, state: string, notes?: string): Promise<{ success: boolean; data: StudentDocument }> {
    const res = await client.patch(`/documents/${id}/verify`, { state, notes });
    return res.data;
  },
};

export const applicationApi = {
  async createDraft(scholarshipId: string): Promise<{ success: boolean; data: Application }> {
    const res = await client.post('/applications/draft', { scholarshipId });
    return res.data;
  },
  async attachDocument(applicationId: string, documentId: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post(`/applications/${applicationId}/documents`, { documentId });
    return res.data;
  },
  async submit(applicationId: string): Promise<{ success: boolean; data: Application }> {
    const res = await client.post(`/applications/${applicationId}/submit`);
    return res.data;
  },
  async listMine(): Promise<{ success: boolean; data: Application[] }> {
    const res = await client.get('/applications/mine');
    return res.data;
  },
  async listProvider(status?: string): Promise<{ success: boolean; data: Application[] }> {
    const res = await client.get('/applications/provider', { params: { status } });
    return res.data;
  },
  async getOne(id: string): Promise<{ success: boolean; data: Application }> {
    const res = await client.get(`/applications/${id}`);
    return res.data;
  },
  async transition(id: string, toStatus: string, note?: string): Promise<{ success: boolean; data: Application }> {
    const res = await client.post(`/applications/${id}/transition`, { toStatus, note });
    return res.data;
  },
};

export const notificationApi = {
  async list(): Promise<{ success: boolean; data: { notifications: NotificationItem[]; unreadCount: number } }> {
    const res = await client.get('/notifications');
    return res.data;
  },
  async markRead(id: string): Promise<{ success: boolean }> {
    const res = await client.post(`/notifications/${id}/read`);
    return res.data;
  },
  async markAllRead(): Promise<{ success: boolean }> {
    const res = await client.post('/notifications/read-all');
    return res.data;
  },
};

export const jagoApi = {
  async chat(message: string, conversationId?: string, language?: string): Promise<{ success: boolean; data: { conversationId: string; reply: string; language: string } }> {
    const res = await client.post('/jago/chat', { message, conversationId, language });
    return res.data;
  },
  async listConversations(): Promise<{ success: boolean; data: JagoConversation[] }> {
    const res = await client.get('/jago/conversations');
    return res.data;
  },
  async getConversation(id: string): Promise<{ success: boolean; data: JagoConversation }> {
    const res = await client.get(`/jago/conversations/${id}`);
    return res.data;
  },
};

export const providerApi = {
  async getDashboard(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/providers/dashboard');
    return res.data;
  },
};

export const adminApi = {
  async getStats(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/admin/stats');
    return res.data;
  },
  async getPendingProviders(): Promise<{ success: boolean; data: any[] }> {
    const res = await client.get('/admin/providers/pending');
    return res.data;
  },
  async approveProvider(id: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post(`/admin/providers/${id}/approve`);
    return res.data;
  },
  async rejectProvider(id: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post(`/admin/providers/${id}/reject`);
    return res.data;
  },
  async getAuditLog(page = 1, pageSize = 20): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/admin/audit-log', { params: { page, pageSize } });
    return res.data;
  },
  async getReachAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/admin/reach-analytics');
    return res.data;
  },
  async getPaymentMetrics(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/admin/payment-metrics');
    return res.data;
  },
};

export const passportApi = {
  async getPassport(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/passport');
    return res.data;
  },
};

export const consentApi = {
  async list(): Promise<{ success: boolean; data: any[] }> {
    const res = await client.get('/consent');
    return res.data;
  },
  async grant(purpose: string, scope: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post('/consent', { purpose, scope });
    return res.data;
  },
  async revoke(id: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post(`/consent/${id}/revoke`);
    return res.data;
  },
};

export const paymentApi = {
  async getTimeline(applicationId: string): Promise<{ success: boolean; data: any }> {
    const res = await client.get(`/payments/application/${applicationId}`);
    return res.data;
  },
  async getSummary(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/payments/summary');
    return res.data;
  },
};

export const verificationApi = {
  async listExceptions(status?: string): Promise<{ success: boolean; data: any[] }> {
    const res = await client.get('/verification/exceptions', { params: { status } });
    return res.data;
  },
  async getException(id: string): Promise<{ success: boolean; data: any }> {
    const res = await client.get(`/verification/exceptions/${id}`);
    return res.data;
  },
  async resolveException(id: string, status: string, note: string): Promise<{ success: boolean; data: any }> {
    const res = await client.post(`/verification/exceptions/${id}/resolve`, { status, note });
    return res.data;
  },
  async listForApplication(applicationId: string): Promise<{ success: boolean; data: any[] }> {
    const res = await client.get(`/verification/application/${applicationId}`);
    return res.data;
  },
};

export const roadmapApi = {
  async getRoadmap(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/student/eligibility-roadmap');
    return res.data;
  },
  async getEligibilityRoadmap(): Promise<{ success: boolean; data: any }> {
    const res = await client.get('/student/eligibility-roadmap');
    return res.data;
  },
  async getScholarshipDetail(scholarshipId: string): Promise<{ success: boolean; data: any }> {
    const res = await client.get(`/student/eligibility-roadmap/${scholarshipId}`);
    return res.data;
  },
};



