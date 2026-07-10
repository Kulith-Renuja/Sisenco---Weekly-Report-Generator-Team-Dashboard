import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import type { Project, Report } from '../types';
import ReportForm from '../components/ReportForm';
import { AuthContext } from '../context/AuthContext';

const TeamMemberDashboard: React.FC = () => {
  const authContext = useContext(AuthContext);

  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Execute both API calls in parallel to save time
      const [reportsRes, projectsRes] = await Promise.all([
        api.get('/reports/my-reports'),
        api.get('/projects')
      ]);
      setReports(reportsRes.data);
      setProjects(projectsRes.data);
    } catch (err: any) {
      setError('Failed to load dashboard data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (data: Partial<Report>) => {
    try {
      const res = await api.post('/reports', data);

      // The newly created report comes back from the API.
      // We manually attach the populated Project object to match the table structure.
      const selectedProject = projects.find(p => p._id === res.data.project);
      const newReport = {
        ...res.data,
        project: selectedProject || res.data.project
      };

      // Update the local state so the table immediately re-renders
      setReports([newReport, ...reports]);
      setShowForm(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error saving report';
      alert(msg);
      throw err; // Propagate error so ReportForm stops loading state
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>My Weekly Reports</h1>
          <p style={styles.subtitle}>Welcome back, {authContext?.user?.name}</p>
        </div>
        <button style={styles.logoutBtn} onClick={authContext?.logout}>
          Sign out
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* Actions Area */}
      <div style={styles.actions}>
        {!showForm && (
          <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
            + Create New Report
          </button>
        )}
      </div>

      {/* Conditional Form Render */}
      {showForm && (
        <ReportForm
          projects={projects}
          onSubmit={handleCreateReport}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reports Table Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Past Reports</h2>

        {reports.length === 0 ? (
          <p style={styles.emptyText}>You haven't submitted any reports yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Week</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} style={styles.trBody}>
                    <td style={styles.td}>
                      {new Date(report.weekStartDate).toLocaleDateString()} — {new Date(report.weekEndDate).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {(report.project as Project).name || 'Unknown Project'}
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
                      {report.submittedAt
                        ? new Date(report.submittedAt).toLocaleDateString()
                        : '—'}
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

const styles = {
  container: { padding: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100vh', position: 'relative' as const, paddingBottom: '6rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' },
  pageTitle: { margin: 0, fontSize: '1.875rem', color: '#111827', fontWeight: 700 },
  subtitle: { margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '1rem' },
  logoutBtn: { position: 'absolute' as const, bottom: '2rem', left: '50%', transform: 'translateX(-50%)', padding: '0.625rem 1.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#374151' },
  actions: { marginBottom: '1.5rem' },
  primaryBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  error: { padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem' },
  card: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' },
  cardTitle: { padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid #e5e7eb', fontSize: '1.125rem', fontWeight: 600, color: '#111827' },
  table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
  trHead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '0.875rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' },
  trBody: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#334155', verticalAlign: 'middle' },
  emptyText: { padding: '3rem', textAlign: 'center' as const, color: '#64748b', fontSize: '0.875rem' },
  badge: { padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 },
  loading: { padding: '4rem', textAlign: 'center' as const, color: '#6b7280', fontSize: '1.125rem' }
};

export default TeamMemberDashboard;
