import { useState } from 'react';
import api from '../services/api';

const STATUS_COLUMNS = [
  'Applied',
  'Screening',
  'Interview',
  'Technical',
  'HR',
  'Offer',
  'Hired',
  'Rejected'
];

// Mirror of backend STATUS_TRANSITIONS — only valid next states shown
const STATUS_TRANSITIONS = {
  'Applied': ['Screening', 'Rejected'],
  'Screening': ['Interview', 'Rejected'],
  'Interview': ['Technical', 'Rejected'],
  'Technical': ['HR', 'Rejected'],
  'HR': ['Offer', 'Rejected'],
  'Offer': ['Hired', 'Rejected'],
  'Hired': [],
  'Rejected': []
};

const StatusBoard = ({ applications, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const response = await api.patch(`/applications/${appId}`, { status: newStatus });
      if (response.data.success) {
        onUpdate(); // Trigger refresh in parent
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="status-board-container">
      <div className="status-columns">
        {STATUS_COLUMNS.map(column => {
          const columnApps = applications.filter(app => app.status === column);
          const isTerminal = column === 'Hired' || column === 'Rejected';

          return (
            <div key={column} className={`status-column ${isTerminal ? 'terminal' : ''}`}>
              <div className={`column-header ${column === 'Hired' ? 'hired-header' : column === 'Rejected' ? 'rejected-header' : ''}`}>
                <h4>{column}</h4>
                <span className="count-badge">{columnApps.length}</span>
              </div>

              <div className="column-content">
                {columnApps.length > 0 ? (
                  columnApps.map(app => {
                    const validNextStatuses = STATUS_TRANSITIONS[app.status] || [];
                    const isFinal = validNextStatuses.length === 0;

                    return (
                      <div key={app._id} className={`app-mini-card ${updatingId === app._id ? 'updating' : ''}`}>
                        <p className="candidate-name"><strong>{app.candidate?.name}</strong></p>
                        <p className="candidate-email">{app.candidate?.email}</p>

                        {!isFinal ? (
                          <div className="status-selector">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(app._id, e.target.value);
                                }
                              }}
                              disabled={updatingId === app._id}
                            >
                              <option value="" disabled>Move to...</option>
                              {validNextStatuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className={`final-badge ${column === 'Hired' ? 'badge-hired' : 'badge-rejected'}`}>
                            {column === 'Hired' ? '✓ Hired' : '✗ Rejected'}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-col">No candidates</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .status-board-container {
          overflow-x: auto;
          padding-bottom: 2rem;
          margin-top: 1.5rem;
        }
        .status-columns {
          display: flex;
          gap: 1rem;
          min-width: 1200px;
        }
        .status-column {
          flex: 1;
          background-color: #f8fafc;
          border-radius: 12px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }
        .column-header {
          padding: 0.85rem 1rem;
          background: #f1f5f9;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .column-header h4 {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .hired-header { background: #ecfdf5; border-bottom-color: #bbf7d0; }
        .hired-header h4 { color: #059669; }
        .rejected-header { background: #fef2f2; border-bottom-color: #fecaca; }
        .rejected-header h4 { color: #dc2626; }
        .count-badge {
          background: white;
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .column-content {
          padding: 0.75rem;
          flex: 1;
        }
        .app-mini-card {
          background: white;
          padding: 0.85rem;
          border-radius: 10px;
          margin-bottom: 0.65rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          font-size: 0.85rem;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .app-mini-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #bfdbfe;
        }
        .app-mini-card.updating {
          opacity: 0.5;
          pointer-events: none;
        }
        .candidate-name {
          margin-bottom: 0.2rem;
          font-size: 0.85rem;
        }
        .candidate-email {
          color: #64748b;
          font-size: 0.72rem;
          margin-bottom: 0.65rem;
        }
        .status-selector select {
          width: 100%;
          padding: 0.35rem 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          background-color: #f8fafc;
          color: #2563eb;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .status-selector select:hover {
          border-color: #93c5fd;
        }
        .final-badge {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .badge-hired { background: #ecfdf5; color: #059669; }
        .badge-rejected { background: #fef2f2; color: #dc2626; }
        .empty-col {
          text-align: center;
          color: #94a3b8;
          font-size: 0.78rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default StatusBoard;
