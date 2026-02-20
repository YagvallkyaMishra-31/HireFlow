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
            const matchRes = await api.get(`/match/job/${jobId}`);

            const applicationsData = appsRes.data.data;
            const matchData = matchRes.data.data;

            const enrichedApplications = applicationsData.map(app => {
                const match = matchData.find(
                    m => m.candidateId === app.candidate._id
                );

                return {
                    ...app,
                    matchScore: match?.score || 0,
                    skillScore: match?.skillScore || 0,
                    experienceScore: match?.experienceScore || 0,
                    locationScore: match?.locationScore || 0
                };
            });

            enrichedApplications.sort((a, b) => b.matchScore - a.matchScore);

            setApplications(enrichedApplications);

        } catch (err) {
            alert('Failed to fetch applications or match data');
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
                    <div className="card">
                        <h3>
                            Application Pipeline
                            {selectedJob && (
                                <span className="job-tag">Viewing: {selectedJob.title}</span>
                            )}
                        </h3>

                        {selectedJob ? (
                            <StatusBoard
                                applications={applications}
                                onUpdate={() => fetchApplications(selectedJob._id)}
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
                    padding: 2rem;
                    max-width: 1400px;
                    margin: auto;
                }

                .dashboard-hero h1 {
                    margin-bottom: 0.5rem;
                }

                .dashboard-hero p {
                    color: #64748b;
                }

                .stats-grid {
                    display: flex;
                    gap: 1rem;
                    margin: 2rem 0;
                    flex-wrap: wrap;
                }

                .stat-card {
                    background: white;
                    padding: 1.2rem 1.5rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
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
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                }

                .card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    margin-bottom: 1.5rem;
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

                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

        </div>
    );
};

export default RecruiterDashboard;