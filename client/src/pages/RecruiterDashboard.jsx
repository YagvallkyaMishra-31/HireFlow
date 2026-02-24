import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBoard from '../components/StatusBoard';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [jobForm, setJobForm] = useState({ title: '', description: '', company: '' });
    const [creating, setCreating] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, jobsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/jobs', { params: { postedBy: user._id } })
            ]);

            setStats(statsRes.data.data);
            setMyJobs(jobsRes.data.data.jobs);
        } catch (err) {
            setError('Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [user._id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchApplications = async (jobId) => {
        setSelectedJob(myJobs.find(j => j._id === jobId));

        try {
            const appsRes = await api.get(`/applications/job/${jobId}`);
            const applicationsData = appsRes.data.data;
            const enrichedApplications = applicationsData.sort((a, b) => b.matchScore - a.matchScore);
            setApplications(enrichedApplications);
        } catch (err) {
            alert('Failed to fetch applications');
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await api.post('/jobs', jobForm);
            if (res.data.success) {
                setJobForm({ title: '', description: '', company: '' });
                fetchData();
                alert('Job created successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create job');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="center">Loading dashboard...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            {/* GLOBAL CSS OVERRIDES */}
            <style dangerouslySetInnerHTML={{
                __html: `
                html, body { 
                    overflow-x: hidden !important; 
                    margin: 0; 
                    padding: 0;
                    width: 100%;
                }
            ` }} />

            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">Recruiter Dashboard</h1>
                    <p className="subtitle">Welcome back, <strong>{user.name}</strong> — manage your AI hiring pipeline</p>
                </div>
                <div className="stats-header">
                    <div className="stat-pill blue">
                        <span className="pill-val">{stats.totalJobs}</span>
                        <span className="pill-label">Active Jobs</span>
                    </div>
                    <div className="stat-pill purple">
                        <span className="pill-val">{stats.totalApplications}</span>
                        <span className="pill-label">Total Applications</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* SIDEBAR (360px) */}
                <div className="left-panel">
                    <div className="card side-card">
                        <div className="card-header">
                            <h3>Post New Job</h3>
                        </div>
                        <form onSubmit={handleCreateJob} className="modern-form">
                            <div className="form-group">
                                <label>Job Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior React Developer"
                                    value={jobForm.title}
                                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Company</label>
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={jobForm.company}
                                    onChange={e => setJobForm({ ...jobForm, company: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Job Description</label>
                                <textarea
                                    placeholder="Describe role, required skills, experience..."
                                    value={jobForm.description}
                                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="primary-btn" disabled={creating}>
                                {creating ? 'Posting...' : 'Post Job →'}
                            </button>
                        </form>
                    </div>

                    <div className="card side-card">
                        <div className="card-header">
                            <h3>Your Jobs ({myJobs.length})</h3>
                        </div>
                        <div className="job-list-compact">
                            {myJobs.map(job => (
                                <div
                                    key={job._id}
                                    className={`job-item-mini ${selectedJob?._id === job._id ? 'active' : ''}`}
                                    onClick={() => fetchApplications(job._id)}
                                >
                                    <div className="job-info">
                                        <span className="jt">{job.title}</span>
                                        <span className="jc">{job.company}</span>
                                    </div>
                                    {selectedJob?._id === job._id && <div className="active-dot" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT (Flexible) */}
                <div className="right-panel">
                    {selectedJob && applications.length > 0 && (() => {
                        const totalCandidates = applications.length;
                        const avgMatch = Math.round(applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / totalCandidates);
                        const strongMatches = applications.filter(a => (a.matchScore || 0) > 70).length;
                        const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
                        const topCandidate = applications.reduce((best, a) => (a.matchScore || 0) > (best.matchScore || 0) ? a : best, applications[0]);

                        return (
                            <div className="insights-premium-card">
                                <div className="insights-header">
                                    <span className="sparkle">✨</span>
                                    <h3>AI Hiring Insights</h3>
                                    <div className="job-badge">{selectedJob.title}</div>
                                </div>
                                <div className="insights-row">
                                    <div className="insight-box">
                                        <div className="box-icon blue">📊</div>
                                        <div className="box-content">
                                            <span className="box-val">{avgMatch}%</span>
                                            <span className="box-label">Avg Match</span>
                                        </div>
                                    </div>
                                    <div className="insight-box">
                                        <div className="box-icon purple">🏆</div>
                                        <div className="box-content">
                                            <span className="box-val truncate">{topCandidate.candidate?.name?.split(' ')[0] || '—'}</span>
                                            <span className="box-label">Top Pick ({topCandidate.matchScore}%)</span>
                                        </div>
                                    </div>
                                    <div className="insight-box">
                                        <div className="box-icon green">✅</div>
                                        <div className="box-content">
                                            <span className="box-val">{strongMatches}</span>
                                            <span className="box-label">Strong Hits</span>
                                        </div>
                                    </div>
                                    <div className="insight-box">
                                        <div className="box-icon slate">👥</div>
                                        <div className="box-content">
                                            <span className="box-val">{totalCandidates}</span>
                                            <span className="box-label">Applicants</span>
                                        </div>
                                    </div>
                                    <div className="insight-box">
                                        <div className="box-icon red">🚫</div>
                                        <div className="box-content">
                                            <span className="box-val">{rejectedCount}</span>
                                            <span className="box-label">Rejected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* PIPELINE CARD — visible box with scroll inside */}
                    <div className="pipeline-card">
                        <div className="pipeline-header">
                            <h3 className="section-title">Application Pipeline</h3>
                            {selectedJob && <span className="pipeline-desc">Real-time candidate workflow for {selectedJob.title}</span>}
                        </div>

                        {selectedJob ? (
                            <div className="pipeline-scroll">
                                <StatusBoard
                                    applications={applications}
                                    onUpdate={() => {
                                        fetchApplications(selectedJob._id);
                                        fetchData();
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="dashboard-empty">
                                <div className="empty-illust">📁</div>
                                <p>Select a job from the left to view AI-ranked candidates</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Override parent app-container to allow full-width dashboard */
                .app-container {
                    max-width: none !important;
                    padding: 0 !important;
                }

                .dashboard-container {
                    width: 100%;
                    padding: 24px 48px;
                    background: #f8fafc;
                    min-height: 100vh;
                    box-sizing: border-box;
                }

                .dashboard-header {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 28px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 20px;
                }

                .dashboard-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .subtitle {
                    color: #64748b;
                    font-size: 1rem;
                    margin: 0;
                }

                .stats-header {
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                }

                .stat-pill {
                    background: white;
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #475569;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .pill-val { font-weight: 800; font-size: 1.15rem; }
                .pill-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
                .stat-pill.blue .pill-val { color: #2563eb; }
                .stat-pill.purple .pill-val { color: #7c3aed; }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 360px 1fr;
                    gap: 32px;
                    align-items: start;
                }

                /* CRITICAL FIX: min-width: 0 prevents grid blowout from max-content children */
                .right-panel {
                    min-width: 0;
                    overflow: hidden;
                }

                .left-panel {
                    min-width: 0;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.06);
                    margin-bottom: 20px;
                }

                .card-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafafa;
                    border-radius: 16px 16px 0 0;
                }

                .card-header h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #334155;
                }

                .modern-form {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }

                input, textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    background: #f8fafc;
                    transition: 0.2s;
                    box-sizing: border-box;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }

                textarea { min-height: 120px; resize: vertical; }

                .primary-btn {
                    background: #2563eb;
                    color: white;
                    padding: 12px;
                    border-radius: 10px;
                    border: none;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-top: 4px;
                    transition: 0.2s;
                }

                .primary-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

                .job-list-compact {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .job-item-mini {
                    padding: 12px 16px;
                    border-radius: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .job-item-mini:hover { background: #f1f5f9; }
                .job-item-mini.active { background: #eff6ff; border: 1px solid #bfdbfe; }
                .jt { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
                .jc { font-size: 0.8rem; color: #64748b; }
                .active-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563eb; }
                .job-info { display: flex; flex-direction: column; gap: 2px; }

                /* ── AI Insights ── */
                .insights-premium-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    padding: 20px;
                    margin-bottom: 24px;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.06);
                }

                .insights-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .insights-header h3 { font-size: 1.4rem; font-weight: 700; margin: 0; }
                .job-badge { background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: #475569; }

                .insights-row {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 14px;
                }

                .insight-box {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 10px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .box-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); font-size: 1rem; }
                .box-val { font-size: 1.1rem; font-weight: 800; }
                .box-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
                .box-content { display: flex; flex-direction: column; }

                /* ── Pipeline Card (visible box) ── */
                .pipeline-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.06);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .pipeline-header { margin-bottom: 20px; }

                .section-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .pipeline-desc {
                    font-size: 0.9rem;
                    color: #64748b;
                    display: block;
                }

                /* Scrollable pipeline container INSIDE the card */
                .pipeline-scroll {
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding-bottom: 12px;
                    scroll-behavior: smooth;
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }

                .pipeline-scroll::-webkit-scrollbar { height: 6px; }
                .pipeline-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .pipeline-scroll::-webkit-scrollbar-track { background: transparent; }

                .dashboard-empty { padding: 3rem 1rem; text-align: center; color: #94a3b8; }
                .empty-illust { font-size: 2.5rem; margin-bottom: 12px; }

                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; gap: 20px; }
                    .dashboard-container { padding: 20px; }
                    .insights-row { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
                }
            `}</style>
        </div>
    );
};

export default RecruiterDashboard;