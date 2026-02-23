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

            // Applications already have scores from the backend
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

            {/* HERO */}
            <div className="dashboard-hero">
                <h1>Recruiter Dashboard</h1>
                <p>Welcome back, <strong>{user.name}</strong> — manage your AI hiring pipeline</p>
            </div>

            {/* STATS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h2>{stats.totalJobs}</h2>
                    <span>Active Jobs</span>
                </div>
                <div className="stat-card">
                    <h2>{stats.totalApplications}</h2>
                    <span>Total Applications</span>
                </div>
                {stats.applicationsByStatus.map(s => (
                    <div key={s.status} className="stat-card mini">
                        <h3>{s.count}</h3>
                        <span>{s.status}</span>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">

                {/* LEFT */}
                <div className="left-panel">

                    <div className="card">
                        <h3>Post New Job</h3>

                        <form onSubmit={handleCreateJob} className="modern-form">
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    value={jobForm.title}
                                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Company"
                                    value={jobForm.company}
                                    onChange={e => setJobForm({ ...jobForm, company: e.target.value })}
                                    required
                                />
                            </div>

                            <textarea
                                placeholder="Describe role, required skills, experience..."
                                value={jobForm.description}
                                onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                required
                            />

                            <button type="submit" disabled={creating}>
                                {creating ? 'Posting...' : 'Post Job →'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h3>Your Jobs ({myJobs.length})</h3>

                        {myJobs.map(job => (
                            <div
                                key={job._id}
                                className={`job-item ${selectedJob?._id === job._id ? 'active' : ''}`}
                                onClick={() => fetchApplications(job._id)}
                            >
                                <div>
                                    <strong>{job.title}</strong>
                                    <span>{job.company}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* RIGHT */}
                <div className="right-panel">

                    {/* AI Hiring Insights — computed from existing applications state */}
                    {selectedJob && applications.length > 0 && (() => {
                        const totalCandidates = applications.length;
                        const avgMatch = Math.round(applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / totalCandidates);
                        const strongMatches = applications.filter(a => (a.matchScore || 0) > 70).length;
                        const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
                        const topCandidate = applications.reduce((best, a) => (a.matchScore || 0) > (best.matchScore || 0) ? a : best, applications[0]);

                        return (
                            <div className="card insights-card">
                                <h3 className="insights-title">🤖 AI Hiring Insights</h3>
                                <div className="insights-grid">
                                    <div className="insight-item">
                                        <span className="insight-icon">📊</span>
                                        <div className="insight-data">
                                            <span className="insight-value accent-blue">{avgMatch}%</span>
                                            <span className="insight-label">Avg Match Score</span>
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <span className="insight-icon">🏆</span>
                                        <div className="insight-data">
                                            <span className="insight-value accent-purple">{topCandidate.candidate?.name || '—'}</span>
                                            <span className="insight-label">Top Candidate ({topCandidate.matchScore || 0}%)</span>
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <span className="insight-icon">✅</span>
                                        <div className="insight-data">
                                            <span className="insight-value accent-green">{strongMatches}</span>
                                            <span className="insight-label">Strong Matches (&gt;70%)</span>
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <span className="insight-icon">👥</span>
                                        <div className="insight-data">
                                            <span className="insight-value accent-slate">{totalCandidates}</span>
                                            <span className="insight-label">Total Candidates</span>
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <span className="insight-icon">🚫</span>
                                        <div className="insight-data">
                                            <span className="insight-value accent-red">{rejectedCount}</span>
                                            <span className="insight-label">Rejected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="card pipeline-card">
                        <h3>
                            Application Pipeline
                            {selectedJob && (
                                <span className="job-tag">Viewing: {selectedJob.title}</span>
                            )}
                        </h3>

                        {selectedJob ? (
                            <StatusBoard
                                applications={applications}
                                onUpdate={() => {
                                    fetchApplications(selectedJob._id);
                                    fetchData();
                                }}
                            />
                        ) : (
                            <div className="empty-state">
                                Select a job to view AI-ranked candidates
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* STYLES */}
            <style>{`
                .dashboard-container {
                    max-width: 1440px;
                    margin: 0 auto;
                    padding-top: 0;
                }

                .dashboard-hero {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                }

                .dashboard-hero h1 {
                    margin: 0 0 0.35rem 0;
                    font-size: 1.65rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }

                .dashboard-hero p {
                    color: #64748b;
                    margin: 0;
                }

                .stats-grid {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .stat-card {
                    background: white;
                    padding: 1.2rem 1.5rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
                }

                .stat-card h2 {
                    color: #2563eb;
                    margin: 0;
                }

                .stat-card span {
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 340px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }

                .left-panel > .card:last-child {
                    margin-bottom: 0;
                }

                .right-panel > .card:last-child,
                .right-panel > .insights-card:last-of-type {
                    margin-bottom: 0;
                }

                .card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    margin-bottom: 1.25rem;
                }

                .card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 1rem 0;
                }

                .card.pipeline-card {
                    overflow-x: auto;
                }

                .modern-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                input, textarea {
                    padding: 0.8rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 0.9rem;
                }

                textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }

                button {
                    background: #2563eb;
                    color: white;
                    padding: 0.7rem 1.5rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }

                button:hover {
                    background: #1d4ed8;
                }

                .job-item {
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .job-item:hover {
                    background: #f8fafc;
                }

                .job-item.active {
                    background: #eff6ff;
                    border-color: #2563eb;
                }

                .job-item span {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .job-tag {
                    margin-left: 1rem;
                    font-size: 0.8rem;
                    color: #2563eb;
                }

                .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                }

                /* ── AI Hiring Insights ── */
                .insights-card {
                    background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #f0fdf4 100%);
                    border: 1px solid #e2e8f0;
                    padding: 1.5rem;
                    margin-bottom: 1.25rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.03);
                }
                .insights-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 1.25rem 0;
                }
                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.75rem;
                }
                .insight-item {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(4px);
                    padding: 0.7rem 0.85rem;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .insight-item:hover {
                    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
                    transform: translateY(-1px);
                }
                .insight-icon {
                    font-size: 1.3rem;
                    flex-shrink: 0;
                }
                .insight-data {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .insight-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .insight-label {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .accent-blue   { color: #2563eb; }
                .accent-purple { color: #7c3aed; }
                .accent-green  { color: #059669; }
                .accent-slate  { color: #334155; }
                .accent-red    { color: #dc2626; }

                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 300px 1fr;
                    }
                }

                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .insights-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

        </div>
    );
};

export default RecruiterDashboard;