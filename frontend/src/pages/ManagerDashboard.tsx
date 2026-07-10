import React, { useState, useEffect, useContext, useMemo } from 'react';
import api from '../services/api';
import type { Report, Project, User } from '../types';
import { AuthContext } from '../context/AuthContext';
import AIChatWidget from '../components/AIChatWidget';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// Custom color palette for the pie chart
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ManagerDashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all team reports on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err: any) {
      setError('Failed to load team reports from the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Calculate Summary Metrics ---
  const totalReports = reports.length;

  const submittedReports = reports.filter(r => r.status === 'Submitted').length;
  const complianceRate = totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0;

  // Count reports that have actual blockers (not "None", "n/a", etc.)
  const openBlockers = reports.filter(r => {
    const b = (r.blockers || '').toLowerCase().trim();
    return b && b !== 'none' && b !== 'n/a' && b !== 'no blockers';
  }).length;

  // --- 2. Prepare Data for BarChart (Reports by Project) ---
  const reportsByProject = useMemo(() => {
    const projectCounts: Record<string, number> = {};
    reports.forEach((r) => {
      const projectName = (r.project as Project)?.name || 'Unknown';
      projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
    });
    // Convert object to array for Recharts
    return Object.entries(projectCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [reports]);

  // --- 3. Prepare Data for PieChart (Submission Status) ---
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    reports.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [reports]);

  if (loading) {
    return <div style={styles.loading}>Loading Team Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Manager Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {authContext?.user?.name}</p>
        </div>
        <button style={styles.logoutBtn} onClick={authContext?.logout}>
          Sign Out
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* Summary Metrics Section */}
      <div style={styles.metricsContainer}>
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Total Team Reports</h3>
          <p style={styles.metricValue}>{totalReports}</p>
        </div>
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Submission Compliance</h3>
          <p style={styles.metricValue}>{complianceRate}%</p>
          <p style={styles.metricSub}>{submittedReports} of {totalReports} finalized</p>
        </div>
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Reports with Blockers</h3>
          <p style={styles.metricValue}>{openBlockers}</p>
        </div>
      </div>

      {/* Recharts Visualization Section */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Reports by Project</h3>
          {reportsByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsByProject} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.emptyText}>No data available to chart.</p>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Overall Submission Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.emptyText}>No data available to chart.</p>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableCardTitle}>Team Reports Detail</h2>
        {reports.length === 0 ? (
          <p style={styles.emptyText}>No reports have been submitted across the team yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Team Member</th>
                  <th style={styles.th}>Week Start</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Blockers</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} style={styles.trBody}>
                    <td style={styles.td}>
                      <div style={styles.userName}>{(report.user as User)?.name || 'Unknown'}</div>
                      <div style={styles.userEmail}>{(report.user as User)?.email || ''}</div>
                    </td>
                    <td style={styles.td}>
                      {new Date(report.weekStartDate).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {(report.project as Project)?.name || 'Unknown'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: report.status === 'Submitted' ? '#dcfce7' : '#fef3c7',
                        color: report.status === 'Submitted' ? '#166534' : '#92400e'
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.truncateText} title={report.blockers}>
                        {report.blockers}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Assistant Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

const styles = {
  container: { padding: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', position: 'relative' as const, paddingBottom: '6rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' },
  pageTitle: { margin: 0, fontSize: '1.875rem', color: '#111827', fontWeight: 700 },
  subtitle: { margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '1rem' },
  logoutBtn: { position: 'absolute' as const, bottom: '2rem', left: '50%', transform: 'translateX(-50%)', padding: '0.625rem 1.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#374151' },
  loading: { padding: '4rem', textAlign: 'center' as const, color: '#6b7280', fontSize: '1.125rem' },
  error: { padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem' },

  metricsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  metricCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  metricTitle: { fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 0.5rem 0', fontWeight: 600 },
  metricValue: { fontSize: '2.25rem', fontWeight: 700, color: '#111827', margin: 0 },
  metricSub: { fontSize: '0.875rem', color: '#10b981', margin: '0.25rem 0 0 0', fontWeight: 500 },

  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  chartCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  chartTitle: { fontSize: '1.125rem', color: '#374151', margin: '0 0 1.5rem 0', fontWeight: 600, width: '100%', textAlign: 'left' as const },

  tableCard: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' },
  tableCardTitle: { padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid #e5e7eb', fontSize: '1.125rem', fontWeight: 600, color: '#111827' },
  table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
  trHead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '0.875rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' },
  trBody: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#334155', verticalAlign: 'middle' },
  userName: { fontWeight: 600, color: '#111827' },
  userEmail: { fontSize: '0.75rem', color: '#6b7280' },
  emptyText: { padding: '3rem', textAlign: 'center' as const, color: '#64748b', fontSize: '0.875rem', width: '100%' },
  badge: { padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 },
  truncateText: { maxWidth: '250px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }
};

export default ManagerDashboard;
