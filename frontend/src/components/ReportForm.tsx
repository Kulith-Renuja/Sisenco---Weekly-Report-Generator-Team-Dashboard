import React, { useState } from 'react';
import type { Project, Report } from '../types';

interface ReportFormProps {
  projects: Project[];
  onSubmit: (data: Partial<Report>) => Promise<void>;
  onCancel: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Report>>({
    weekStartDate: '',
    weekEndDate: '',
    project: '',
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    hoursWorked: 0,
    notes: '',
    status: 'Draft'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Submit Weekly Report</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Week Start Date</label>
            <input
              type="date"
              name="weekStartDate"
              required
              value={formData.weekStartDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Week End Date</label>
            <input
              type="date"
              name="weekEndDate"
              required
              value={formData.weekEndDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Project</label>
          <select
            name="project"
            required
            value={formData.project as string}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tasks Completed (This Week)</label>
          <textarea
            name="tasksCompleted"
            required
            rows={3}
            value={formData.tasksCompleted}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="What did you finish?"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tasks Planned (Next Week)</label>
          <textarea
            name="tasksPlanned"
            required
            rows={3}
            value={formData.tasksPlanned}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="What are you working on next?"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Blockers / Challenges</label>
          <textarea
            name="blockers"
            required
            rows={2}
            value={formData.blockers}
            onChange={handleChange}
            style={styles.textarea}
            placeholder='Type "None" if there are no blockers'
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Hours Worked (Optional)</label>
            <input
              type="number"
              name="hoursWorked"
              min="0"
              value={formData.hoursWorked}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Draft">Draft (Save for later)</option>
              <option value="Submitted">Submit (Finalize)</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Notes / Links (Optional)</label>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    border: '1px solid #e5e7eb'
  },
  title: { marginTop: 0, marginBottom: '1.5rem', color: '#111827', fontSize: '1.25rem' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' },
  row: { display: 'flex', gap: '1.25rem' },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', flex: 1 },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.625rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' },
  select: { padding: '0.625rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', backgroundColor: 'white' },
  textarea: { padding: '0.625rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' as const },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' },
  cancelBtn: { padding: '0.625rem 1.25rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#374151' },
  submitBtn: { padding: '0.625rem 1.25rem', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }
};

export default ReportForm;
