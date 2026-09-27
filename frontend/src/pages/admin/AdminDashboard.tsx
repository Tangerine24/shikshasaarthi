import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api';
import {
  Shield,
  Users,
  Building2,
  GraduationCap,
  FileCheck2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any | null>(null);
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [sRes, pRes, aRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingProviders(),
        adminApi.getAuditLog(1, 15),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (pRes.success) setPendingProviders(pRes.data);
      if (aRes.success) setAuditLogs(aRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveProvider = async (id: string) => {
    try {
      await adminApi.approveProvider(id);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectProvider = async (id: string) => {
    try {
      await adminApi.rejectProvider(id);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading administrative console...</div>;
  }

  return (
    <div className="space-y-8 font-body pb-12">
      {/* Header */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="font-heading font-bold text-2xl text-primary-dark">
              {t('admin.title', 'Platform Governance & Administration')}
            </h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            System administration for provider authorization, audit log surveillance, and platform telemetry.
          </p>
        </div>

        <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded font-semibold border border-border">
          Scope: Trust Gate & Audit Log
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('admin.total_users')}</span>
          <div className="font-heading font-bold text-2xl text-primary-dark">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Students: {stats?.totalStudents || 0}</span>
        </div>

        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('nav.applicant_review', 'Providers')}</span>
          <div className="font-heading font-bold text-2xl text-primary-dark">
            {stats?.totalProviders || 0}
          </div>
          <span className="text-xs text-amber-700 mt-1 block">{t('provider.pending_review')}: {stats?.pendingProviders || 0}</span>
        </div>

        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('admin.total_scholarships')}</span>
          <div className="font-heading font-bold text-2xl text-primary-dark">
            {stats?.totalScholarships || 0}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Active on platform</span>
        </div>

        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">{t('admin.total_applications')}</span>
          <div className="font-heading font-bold text-2xl text-primary-dark">
            {stats?.totalApplications || 0}
          </div>
          <span className="text-xs text-emerald-700 mt-1 block">
            {t('status.APPROVED')}: {stats?.statusCounts?.APPROVED || 0}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-card shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">{t('admin.pending_providers')}</span>
          <div className="font-heading font-bold text-2xl text-amber-900">
            {pendingProviders.length}
          </div>
          <span className="text-xs text-amber-800 mt-1 block">{t('provider.pending_review')}</span>
        </div>
      </div>

      {/* Trust Gate: Provider Verification Queue */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              {t('admin.pending_providers')}
            </h2>
            <p className="text-xs text-text-muted">
              {t('common.sih_tagline')}
            </p>
          </div>
        </div>

        {pendingProviders.length === 0 ? (
          <p className="text-xs text-text-muted py-4">{t('applications.no_applications')}</p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {pendingProviders.map((prov) => (
              <div
                key={prov.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-text-primary">
                      {prov.organizationName}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.2 rounded">
                      {t('status.UNDER_VERIFICATION')}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {prov.organizationType} • Contact: {prov.contactPerson} ({prov.phone}) • Email: {prov.user?.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRejectProvider(prov.id)}
                    className="text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition"
                  >
                    {t('provider.reject')}
                  </button>
                  <button
                    onClick={() => handleApproveProvider(prov.id)}
                    className="text-xs font-semibold text-surface bg-primary hover:bg-primary-dark px-4 py-1.5 rounded transition"
                  >
                    {t('admin.approve_provider')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Audit Trail */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <span>{t('admin.audit_log')}</span>
            </h2>
            <p className="text-xs text-text-muted">
              Immutable event log recording read accesses to sensitive fields and state machine transitions.
            </p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-text-muted py-4">{t('notifications.no_notifications')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden">
              <thead className="bg-stone-50 text-text-secondary uppercase border-b border-border">
                <tr>
                  <th className="p-3">{t('applications.submitted_on')}</th>
                  <th className="p-3">{t('roadmap.action_label')}</th>
                  <th className="p-3">{t('profile.institution')}</th>
                  <th className="p-3">{t('documents.title')}</th>
                  <th className="p-3">{t('login_extra.admin_label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="p-3 text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-text-primary">
                      <span className="bg-stone-100 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">
                      {log.entityType} ({log.entityId.slice(0, 8)}...)
                    </td>
                    <td className="p-3 text-text-secondary">
                      {log.sensitiveFieldAccessed ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono text-[10px]">
                          {log.sensitiveFieldAccessed}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-3 text-text-muted font-mono">
                      {log.actor?.email || log.actorId?.slice(0, 8) || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
