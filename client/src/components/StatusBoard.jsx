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

const getAiSummary = (matchScore, skillScore, experienceScore, locationScore) => {
  let base;
  let icon;
  if (matchScore > 70) {
    base = 'Strong alignment with job requirements. Skills and experience closely match.';
    icon = '⭐';
  } else if (matchScore >= 40) {
    base = 'Moderate alignment. Some skill or experience gaps detected.';
    icon = '⚖️';
  } else {
    base = 'Limited alignment. Candidate may not fully meet job requirements.';
    icon = '⚠️';
  }

  const details = [];
  const scores = { skill: skillScore, experience: experienceScore, location: locationScore };
  const highest = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a);
  if (highest[1] > 0) {
    if (highest[0] === 'skill') details.push('Strong skill match.');
    else if (highest[0] === 'experience') details.push('Solid experience fit.');
    else details.push('Good location match.');
  }
  if (locationScore < 40 && locationScore < skillScore && locationScore < experienceScore) {
    details.push('Location gap noted.');
  }

  return { icon, text: base + (details.length ? ' ' + details.join(' ') : '') };
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

  // Pre-compute top match candidate per column
  const topMatchByColumn = {};
  STATUS_COLUMNS.forEach(column => {
    const columnApps = applications.filter(app => app.status === column);
    if (columnApps.length > 1) {
      const top = columnApps.reduce((best, app) =>
        (app.matchScore || 0) > (best.matchScore || 0) ? app : best
        , columnApps[0]);
      if ((top.matchScore || 0) > 0) {
        topMatchByColumn[column] = top._id;
      }
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
                <div className="ai-sort-label">🤖 Sorted by AI Match Score</div>
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
                        {/* AI Recommended Ribbon */}
                        {isAiRecommended && (
                          <div className="ai-ribbon">
                            <span>✅ AI Recommended</span>
                          </div>
                        )}

                        {/* Top Match Badge */}
                        {isTopMatch && (
                          <div className="top-match-badge">
                            <span>⭐ Top Match</span>
                          </div>
                        )}

                        <p className="candidate-name"><strong>{app.candidate?.name}</strong></p>
                        <p className="candidate-email">{app.candidate?.email}</p>

                        {/* Match Score Badge + Progress Bar */}
                        <div className="score-section">
                          <div className="match-score-row">
                            <span className="match-label">Match</span>
                            <span
                              className="match-badge"
                              style={{
                                color: getScoreColor(matchScore),
                                background: getScoreBg(matchScore)
                              }}
                            >
                              {matchScore}%
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(matchScore, 100)}%`,
                                background: getScoreTrackColor(matchScore)
                              }}
                            />
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="score-breakdown">
                          <div className="breakdown-item">
                            <span className="breakdown-label">Skill</span>
                            <span className="breakdown-value">{skillScore}%</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Exp</span>
                            <span className="breakdown-value">{experienceScore}%</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Loc</span>
                            <span className="breakdown-value">{locationScore}%</span>
                          </div>
                        </div>

                        {/* AI Recommendation Summary */}
                        {(() => {
                          const summary = getAiSummary(matchScore, skillScore, experienceScore, locationScore);
                          return (
                            <div className={`ai-summary ${matchScore > 70 ? 'ai-summary-green' :
                                matchScore >= 40 ? 'ai-summary-amber' : 'ai-summary-red'
                              }`}>
                              <span className="ai-summary-icon">{summary.icon}</span>
                              <span className="ai-summary-text">{summary.text}</span>
                            </div>
                          );
                        })()}

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
          border-radius: 14px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }
        .column-header {
          padding: 0.85rem 1rem;
          background: #f1f5f9;
          border-radius: 14px 14px 0 0;
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

        /* ── Card Styling ── */
        .app-mini-card {
          background: white;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02);
          font-size: 0.85rem;
          border: 1px solid #e2e8f0;
          transition: all 0.25s ease;
          position: relative;
        }
        .app-mini-card:hover {
          box-shadow: 0 4px 16px rgba(37,99,235,0.10), 0 1px 4px rgba(0,0,0,0.06);
          border-color: #93c5fd;
          transform: translateY(-2px);
        }
        .app-mini-card.updating {
          opacity: 0.5;
          pointer-events: none;
        }

        /* ── Top Match Highlight ── */
        .top-match-card {
          border-color: #a78bfa;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 2px 10px rgba(139,92,246,0.08);
          background: linear-gradient(135deg, #faf5ff 0%, #ffffff 40%);
        }
        .top-match-card:hover {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.25), 0 4px 16px rgba(139,92,246,0.12);
        }
        .top-match-badge {
          position: absolute;
          top: -8px;
          right: 8px;
          z-index: 1;
        }
        .top-match-badge span {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          color: white;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.18rem 0.55rem;
          border-radius: 6px;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 6px rgba(139,92,246,0.25);
          text-transform: uppercase;
        }

        /* ── Candidate Info ── */
        .candidate-name {
          margin: 0 0 0.15rem 0;
          font-size: 0.85rem;
          color: #1e293b;
          line-height: 1.3;
        }
        .candidate-email {
          color: #94a3b8;
          font-size: 0.7rem;
          margin: 0 0 0.7rem 0;
          line-height: 1.2;
        }

        /* ── Match Score Section ── */
        .score-section {
          margin-bottom: 0.55rem;
        }
        .match-score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .match-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .match-badge {
          display: inline-block;
          padding: 0.2rem 0.65rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .progress-track {
          width: 100%;
          height: 4px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        /* ── Score Breakdown ── */
        .score-breakdown {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 0.65rem;
        }
        .breakdown-item {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 6px;
          padding: 0.3rem 0.25rem;
          text-align: center;
        }
        .breakdown-label {
          display: block;
          font-size: 0.58rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.1rem;
        }
        .breakdown-value {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #334155;
        }

        /* ── Status Selector ── */
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

        /* ── Final Badge ── */
        .final-badge {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .badge-hired { background: #ecfdf5; color: #059669; }
        .badge-rejected { background: #fef2f2; color: #dc2626; }

        /* ── AI Sort Label ── */
        .ai-sort-label {
          text-align: center;
          font-size: 0.62rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.35rem 0 0.5rem;
          border-bottom: 1px dashed #e2e8f0;
          margin-bottom: 0.65rem;
        }

        /* ── AI Recommended Card ── */
        .ai-recommended {
          border-top: 3px solid #34d399;
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 20%);
        }
        .ai-recommended:hover {
          border-color: #34d399;
          border-top-color: #10b981;
        }
        .ai-ribbon {
          margin-bottom: 0.45rem;
        }
        .ai-ribbon span {
          display: inline-block;
          background: linear-gradient(135deg, #059669, #34d399);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: 5px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(5,150,105,0.2);
        }

        /* ── AI Summary ── */
        .ai-summary {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          padding: 0.5rem 0.6rem;
          border-radius: 8px;
          margin-bottom: 0.65rem;
          line-height: 1.35;
        }
        .ai-summary-green {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
        }
        .ai-summary-amber {
          background: #fffbeb;
          border: 1px solid #fef3c7;
        }
        .ai-summary-red {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }
        .ai-summary-icon {
          flex-shrink: 0;
          font-size: 0.72rem;
          line-height: 1.35;
        }
        .ai-summary-text {
          font-size: 0.62rem;
          color: #475569;
          font-weight: 500;
        }

        /* ── Empty State ── */
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
