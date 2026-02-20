import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { SearchX, Briefcase, Building2, Workflow, Search, TrendingUp, Shield, Zap } from 'lucide-react';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Query State
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/jobs', {
        params: { page, limit, search, company }
      });
      if (response.data.success) {
        setJobs(response.data.data.jobs);
        setTotalPages(response.data.data.pages);
      }
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      setError(`Failed to load jobs: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, company]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchJobs(); }, 500);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCompanyChange = (e) => { setCompany(e.target.value); setPage(1); };

  const activeJobsCount = jobs.length;
  const uniqueCompaniesCount = new Set(jobs.map(j => j.company)).size;

  return (
    <div className="job-list-page">
      {/* ─── HERO SECTION ─── */}
      <div className="hero-banner">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Live Openings</span>
            </div>
            <h1>Find Your Next <span className="gradient-text">Career Move</span></h1>
            <p className="hero-subtitle">Browse verified roles from top companies. Apply directly, track progress, land your dream job.</p>
          </div>
          <div className="hero-metrics">
            <div className="metric-card">
              <Briefcase size={20} />
              <div className="metric-info">
                <span className="metric-val">{activeJobsCount}</span>
                <span className="metric-label">Active Roles</span>
              </div>
            </div>
            <div className="metric-card">
              <Building2 size={20} />
              <div className="metric-info">
                <span className="metric-val">{uniqueCompaniesCount}</span>
                <span className="metric-label">Companies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div className="search-bar">
        <div className="search-field">
          <Search size={18} className="search-ico" />
          <input
            type="text"
            placeholder="Job title, keywords, skills..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="search-divider"></div>
        <div className="search-field">
          <Building2 size={18} className="search-ico" />
          <input
            type="text"
            placeholder="Company name..."
            value={company}
            onChange={handleCompanyChange}
          />
        </div>
      </div>

      {/* ─── DASHBOARD ─── */}
      <div className="dashboard-grid">
        <main className="jobs-main-col">
          <div className="section-label">
            <span>{loading ? 'Loading...' : `${activeJobsCount} role${activeJobsCount !== 1 ? 's' : ''} found`}</span>
          </div>

          {loading ? (
            <div className="jobs-grid">
              {[1, 2, 3, 4].map(i => <JobCard key={i} loading={true} />)}
            </div>
          ) : error ? (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className={`jobs-grid ${jobs.length === 1 ? 'centered-single' : ''}`}>
              {jobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon-bg">
                <SearchX size={40} strokeWidth={1.5} />
              </div>
              <h3>No matching roles</h3>
              <p>Try adjusting your search or clearing filters to explore all openings.</p>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination-wrapper">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="pg-btn">← Prev</button>
              <span className="pg-info">{page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pg-btn">Next →</button>
            </div>
          )}
        </main>

        {/* ─── SIDEBAR ─── */}
        <aside className="insight-sidebar">
          <div className="sidebar-card why-card">
            <div className="sidebar-gradient-bar"></div>
            <h3>Why HireFlow?</h3>
            <ul className="benefits-list">
              <li>
                <div className="benefit-badge blue"><Shield size={14} /></div>
                <div className="benefit-text">
                  <strong>Verified Roles</strong>
                  <span>All jobs directly from companies</span>
                </div>
              </li>
              <li>
                <div className="benefit-badge green"><TrendingUp size={14} /></div>
                <div className="benefit-text">
                  <strong>Track Progress</strong>
                  <span>Real-time application status</span>
                </div>
              </li>
              <li>
                <div className="benefit-badge purple"><Zap size={14} /></div>
                <div className="benefit-text">
                  <strong>Instant Apply</strong>
                  <span>One-click applications</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="sidebar-card stats-card">
            <h4>Platform Stats</h4>
            <div className="stats-mini-grid">
              <div className="stats-mini-item">
                <span className="smi-val">{activeJobsCount}</span>
                <span className="smi-label">Open Roles</span>
              </div>
              <div className="stats-mini-item">
                <span className="smi-val">{uniqueCompaniesCount}</span>
                <span className="smi-label">Companies</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card cta-card">
            <p>Ready to make your move?</p>
            <button className="cta-btn" onClick={() => navigate('/register')}>Create Your Profile →</button>
          </div>
        </aside>
      </div>

      <style>{`
        .job-list-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* ━━━ HERO ━━━ */
        .hero-banner {
          position: relative;
          background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);
          border-radius: 20px;
          padding: 2.5rem 2.5rem 2rem;
          overflow: hidden;
          color: white;
        }
        .hero-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-content {
          position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 2rem; flex-wrap: wrap;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 0.3rem 0.75rem; border-radius: 20px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        .hero-text h1 {
          font-size: 2.25rem; font-weight: 900;
          letter-spacing: -0.03em; line-height: 1.15;
          margin: 0 0 0.5rem;
        }
        .gradient-text {
          background: linear-gradient(90deg, #93c5fd, #c4b5fd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 0.95rem; opacity: 0.85;
          max-width: 420px; line-height: 1.5;
        }
        .hero-metrics {
          display: flex; gap: 1rem;
        }
        .metric-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex; align-items: center; gap: 0.75rem;
          min-width: 130px;
        }
        .metric-info { display: flex; flex-direction: column; }
        .metric-val { font-size: 1.5rem; font-weight: 900; line-height: 1; }
        .metric-label { font-size: 0.7rem; opacity: 0.7; font-weight: 600; text-transform: uppercase; }

        /* ━━━ SEARCH ━━━ */
        .search-bar {
          background: white;
          border-radius: 16px;
          padding: 0.5rem 0.75rem;
          display: flex; align-items: center; gap: 0;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 24px -4px rgba(0,0,0,0.06);
        }
        .search-field {
          flex: 1; display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem;
        }
        .search-ico { color: var(--secondary-color); opacity: 0.5; flex-shrink: 0; }
        .search-field input {
          border: none; background: transparent; outline: none;
          font-size: 0.9rem; width: 100%; padding: 0.25rem 0;
          box-shadow: none;
        }
        .search-field input:focus { box-shadow: none; border: none; }
        .search-divider {
          width: 1px; height: 28px; background: var(--border-color); flex-shrink: 0;
        }

        /* ━━━ SECTION LABEL ━━━ */
        .section-label {
          font-size: 0.75rem; font-weight: 700;
          color: var(--secondary-color);
          text-transform: uppercase; letter-spacing: 0.06em;
          margin-bottom: 0.25rem;
        }

        /* ━━━ DASHBOARD GRID ━━━ */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .insight-sidebar { order: -1; }
          .hero-content { flex-direction: column; align-items: flex-start; }
          .hero-metrics { width: 100%; }
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .jobs-grid.centered-single {
          grid-template-columns: 1fr;
          max-width: 520px;
        }
        @media (max-width: 768px) {
          .jobs-grid { grid-template-columns: 1fr; }
        }

        /* ━━━ SIDEBAR ━━━ */
        .insight-sidebar {
          position: sticky; top: 1.5rem;
          display: flex; flex-direction: column; gap: 1.25rem;
        }

        .sidebar-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 16px -4px rgba(0,0,0,0.06);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .sidebar-gradient-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b);
        }

        .sidebar-card h3 {
          font-size: 1rem; font-weight: 800;
          color: var(--text-main);
          margin-bottom: 1.25rem;
        }
        .sidebar-card h4 {
          font-size: 0.8rem; font-weight: 800;
          color: var(--text-main);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .benefits-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 1.1rem;
        }
        .benefits-list li {
          display: flex; align-items: flex-start; gap: 0.75rem;
        }
        .benefit-badge {
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .benefit-badge.blue { background: #eff6ff; color: #2563eb; }
        .benefit-badge.green { background: #f0fdf4; color: #16a34a; }
        .benefit-badge.purple { background: #f5f3ff; color: #7c3aed; }

        .benefit-text {
          display: flex; flex-direction: column;
        }
        .benefit-text strong {
          font-size: 0.82rem; font-weight: 700;
          color: var(--text-main);
        }
        .benefit-text span {
          font-size: 0.72rem; color: var(--secondary-color);
          line-height: 1.3;
        }

        /* ━━━ STATS CARD ━━━ */
        .stats-mini-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
        }
        .stats-mini-item {
          background: #f8fafc;
          border-radius: 10px;
          padding: 0.75rem;
          text-align: center;
        }
        .smi-val {
          display: block; font-size: 1.15rem;
          font-weight: 900; color: var(--text-main);
        }
        .smi-label {
          font-size: 0.65rem; font-weight: 600;
          color: var(--secondary-color);
          text-transform: uppercase; letter-spacing: 0.03em;
        }

        /* ━━━ CTA CARD ━━━ */
        .cta-card {
          background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%) !important;
          border: none !important; color: white;
        }
        .cta-card p {
          font-size: 0.85rem; font-weight: 600;
          margin-bottom: 0.75rem; opacity: 0.9;
        }
        .cta-btn {
          width: 100%;
          background: rgba(255,255,255,0.2) !important;
          border: 1px solid rgba(255,255,255,0.3) !important;
          color: white !important;
          padding: 0.55rem 1rem;
          font-size: 0.8rem; font-weight: 700;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        .cta-btn:hover {
          background: rgba(255,255,255,0.3) !important;
          transform: translateY(-1px);
        }

        /* ━━━ EMPTY STATE ━━━ */
        .empty-state-card {
          background: white;
          border-radius: 16px;
          padding: 3.5rem 2rem;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          gap: 0.75rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 16px -4px rgba(0,0,0,0.06);
        }
        .empty-icon-bg {
          width: 72px; height: 72px; border-radius: 50%;
          background: #f1f5f9;
          display: flex; align-items: center; justify-content: center;
          color: var(--secondary-color); margin-bottom: 0.5rem;
        }
        .empty-state-card h3 { font-size: 1.15rem; color: var(--text-main); margin: 0; }
        .empty-state-card p { font-size: 0.85rem; color: var(--secondary-color); max-width: 320px; }

        .error-banner {
          background: #fef2f2; border: 1px solid #fee2e2;
          color: #dc2626; padding: 1rem; border-radius: 12px;
          text-align: center; font-size: 0.9rem;
        }

        /* ━━━ PAGINATION ━━━ */
        .pagination-wrapper {
          display: flex; justify-content: center; align-items: center;
          gap: 1.5rem; padding: 1.5rem 0;
        }
        .pg-btn {
          background: white !important; color: var(--text-main) !important;
          border: 1px solid var(--border-color) !important;
          padding: 0.4rem 1rem; font-size: 0.8rem; box-shadow: none !important;
        }
        .pg-btn:hover:not(:disabled) {
          background: #f8fafc !important; border-color: var(--secondary-color) !important;
        }
        .pg-info { font-size: 0.85rem; color: var(--secondary-color); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default JobList;
