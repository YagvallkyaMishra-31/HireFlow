import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const JobCard = ({ job, loading: isLoading }) => {
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    setBtnLoading(true);
    setMessage('');
    try {
      const response = await api.post('/applications', { job: job._id });
      if (response.data.success) {
        setApplied(true);
        setMessage('Application sent successfully!');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  const isCandidate = user?.role === 'candidate';

  // ─── Skeleton Loading ───
  if (isLoading) {
    return (
      <div className="jc-wrap jc-skeleton">
        <div className="jc-inner">
          <div className="sk-line w50" style={{ height: 14, marginBottom: 10 }}></div>
          <div className="sk-line w90" style={{ height: 20, marginBottom: 14 }}></div>
          <div className="sk-line w100" style={{ height: 11, marginBottom: 5 }}></div>
          <div className="sk-line w70" style={{ height: 11, marginBottom: 20 }}></div>
          <div className="sk-divider"></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sk-line w30" style={{ height: 14 }}></div>
            <div className="sk-line w20" style={{ height: 30, borderRadius: 8 }}></div>
          </div>
        </div>
        <style>{`
          .jc-skeleton { pointer-events:none; }
          .sk-line { background:#eef2f7; border-radius:5px; position:relative; overflow:hidden; }
          .sk-line::after { content:""; position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent); animation:sk-shimmer 1.8s infinite; }
          @keyframes sk-shimmer { 100%{transform:translateX(100%)} }
          .w100{width:100%} .w90{width:90%} .w70{width:70%} .w50{width:50%} .w30{width:30%} .w20{width:20%}
          .sk-divider{height:1px; background:#eef2f7; margin:8px 0;}
        `}</style>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="jc-wrap">
      <div className="jc-accent"></div>
      <div className="jc-inner">
        <div className="jc-badges">
          <span className="badge-company">{job.company}</span>
          <span className="badge-date">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <h3 className="jc-title">{job.title}</h3>
        <p className="jc-desc">
          {job.description && job.description.length > 110
            ? `${job.description.substring(0, 110)}...`
            : job.description}
        </p>
        <div className="jc-spacer"></div>
        <div className="jc-footer">
          <Link to={`/jobs/${job._id}`} className="jc-link">View Details →</Link>
          {isCandidate && (
            <button
              onClick={handleApply}
              disabled={applied || btnLoading}
              className={applied ? 'jc-btn-done' : 'jc-btn-apply'}
            >
              {btnLoading ? '...' : applied ? '✓ Applied' : 'Apply'}
            </button>
          )}
        </div>
        {message && <div className={`jc-msg ${applied ? 'ok' : 'err'}`}>{message}</div>}
      </div>

      <style>{`
        .jc-wrap {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 12px -4px rgba(0,0,0,0.05);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .jc-wrap:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px -8px rgba(37, 99, 235, 0.15);
          border-color: #93c5fd;
        }
        .jc-accent {
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          flex-shrink: 0;
        }
        .jc-inner {
          padding: 1.25rem 1.35rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .jc-badges {
          display: flex; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap;
        }
        .badge-company {
          background: #eff6ff; color: #2563eb;
          padding: 0.2rem 0.55rem; border-radius: 6px;
          font-size: 0.62rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .badge-date {
          background: #f8fafc; color: #64748b;
          padding: 0.2rem 0.5rem; border-radius: 6px;
          font-size: 0.62rem; font-weight: 600;
        }
        .jc-title {
          font-size: 1.05rem; font-weight: 800;
          color: #1e293b; letter-spacing: -0.02em;
          line-height: 1.3; margin: 0 0 0.5rem;
        }
        .jc-desc {
          font-size: 0.8rem; color: #64748b;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .jc-spacer {
          flex: 1; min-height: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 0.75rem;
        }
        .jc-footer {
          display: flex; justify-content: space-between; align-items: center;
        }
        .jc-link {
          color: #2563eb; font-weight: 700; font-size: 0.78rem;
          text-decoration: none; transition: all 0.2s;
        }
        .jc-link:hover { text-decoration: underline; }
        .jc-btn-apply {
          background: #2563eb !important; color: white !important;
          padding: 0.35rem 0.9rem; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700;
          border: none; box-shadow: none !important;
        }
        .jc-btn-apply:hover {
          background: #1d4ed8 !important;
          transform: translateY(-1px);
        }
        .jc-btn-done {
          background: #f0fdf4 !important; color: #16a34a !important;
          border: 1px solid #bbf7d0 !important;
          padding: 0.35rem 0.9rem; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700;
          box-shadow: none !important; cursor: default;
        }
        .jc-msg {
          font-size: 0.7rem; padding: 0.4rem;
          border-radius: 6px; text-align: center; margin-top: 0.5rem;
        }
        .jc-msg.ok { background:#f0fdf4; color:#16a34a; }
        .jc-msg.err { background:#fef2f2; color:#dc2626; }
      `}</style>
    </div>
  );
};

export default JobCard;
