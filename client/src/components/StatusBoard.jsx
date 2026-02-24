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

const getScoreColor = (score) => {
  if (score > 70) return '#059669';
  if (score >= 40) return '#d97706';
  return '#dc2626';
};

const getScoreBg = (score) => {
  if (score > 70) return '#ecfdf5';
  if (score >= 40) return '#fffbeb';
  return '#fef2f2';
};

const getScoreTrackColor = (score) => {
  if (score > 70) return '#34d399';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
};

const StatusBoard = ({ applications, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const response = await api.patch(`/applications/${appId}`, { status: newStatus });
      if (response.data.success) {
        onUpdate();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const topMatchByColumn = {};
  STATUS_COLUMNS.forEach(column => {
    const columnApps = applications.filter(app => app.status === column);
    if (columnApps.length > 1) {
      const top = columnApps.reduce((best, app) =>
        (app.matchScore || 0) > (best.matchScore || 0) ? app : best
        , columnApps[0]);
      if ((top.matchScore || 0) > 0) topMatchByColumn[column] = top._id;
    }
  });

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
                <div className="ai-rank-label">🤖 AI Ranked</div>
                {columnApps.length > 0 ? (
                  columnApps.map(app => {
                    const validNextStatuses = STATUS_TRANSITIONS[app.status] || [];
                    const isFinal = validNextStatuses.length === 0;
                    const isTopMatch = topMatchByColumn[column] === app._id;
                    const matchScore = app.matchScore || 0;
                    const skillScore = app.skillScore || 0;
                    const experienceScore = app.experienceScore || 0;
                    const locationScore = app.locationScore || 0;
                    const isAiRecommended = matchScore > 70;

                    return (
                      <div
                        key={app._id}
                        className={`app-mini-card ${updatingId === app._id ? 'updating' : ''} ${isTopMatch ? 'top-match-card' : ''} ${isAiRecommended ? 'ai-recommended' : ''}`}
                      >
                        {isAiRecommended && <div className="ai-status">✨ Recommended</div>}
                        {isTopMatch && <div className="top-match-status">⭐ Top Choice</div>}

                        <p className="candidate-name">{app.candidate?.name}</p>
                        <p className="candidate-email">{app.candidate?.email}</p>

                        <div className="score-row">
                          <span className="score-pill" style={{ color: getScoreColor(matchScore), background: getScoreBg(matchScore) }}>
                            {matchScore}% Match
                          </span>
                        </div>

                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${matchScore}%`, background: getScoreTrackColor(matchScore) }}></div>
                        </div>

                        <div className="breakdown-metrics">
                          <div className="metric"><span>Skills</span>{skillScore}%</div>
                          <div className="metric"><span>Exp</span>{experienceScore}%</div>
                          <div className="metric"><span>Loc</span>{locationScore}%</div>
                        </div>

                        {!isFinal ? (
                          <div className="move-action">
                            <select
                              value=""
                              onChange={(e) => e.target.value && handleStatusChange(app._id, e.target.value)}
                              disabled={updatingId === app._id}
                            >
                              <option value="" disabled>Change Status</option>
                              {validNextStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        ) : (
                          <span className={`final-status ${column === 'Hired' ? 'hired' : 'rejected'}`}>
                            {column === 'Hired' ? '✓ Hired' : '✗ Rejected'}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-msg">No candidates</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .status-board-container {
          width: max-content;
        }

        .status-columns {
          display: flex;
          gap: 16px;
        }
        .status-column {
          min-width: 300px;
          flex-shrink: 0;
          background: #f8fafc;
          border-radius: 12px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }

        .column-header {
          padding: 12px;
          background: white;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .column-header h4 { margin: 0; font-size: 0.85rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .hired-header { background: #f0fdf4; border-bottom-color: #dcfce7; }
        .rejected-header { background: #fef2f2; border-bottom-color: #fee2e2; }

        .count-badge { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #475569; }

        .column-content { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .ai-rank-label { text-align: center; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }

        .app-mini-card {
          background: white;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          position: relative;
          transition: 0.2s;
        }
        .app-mini-card:hover { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .ai-status, .top-match-status { font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-bottom: 8px; display: inline-block; text-transform: uppercase; }
        .ai-status { background: #ecfdf5; color: #059669; border: 1px solid #34d399; }
        .top-match-status { background: #f5f3ff; color: #7c3aed; border: 1px solid #a78bfa; margin-left: 4px; }

        .candidate-name { margin: 0; font-size: 0.95rem; font-weight: 800; color: #1e293b; }
        .candidate-email { font-size: 0.8rem; color: #64748b; margin: 4px 0 16px 0; word-break: break-all; opacity: 0.8; }

        .score-pill { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }
        .score-bar-track { height: 6px; background: #f1f5f9; border-radius: 10px; margin: 12px 0; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 10px; transition: 0.3s; }

        .breakdown-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .metric { background: #f8fafc; padding: 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-align: center; border: 1px solid #f1f5f9; }
        .metric span { display: block; font-size: 0.55rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }

        .move-action select { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; font-weight: 800; background: #f8fafc; color: #2563eb; cursor: pointer; }

        .final-status { display: block; text-align: center; padding: 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; }
        .final-status.hired { background: #dcfce7; color: #166534; }
        .final-status.rejected { background: #fee2e2; color: #991b1b; }

        .empty-msg { text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 2rem 0; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default StatusBoard;
