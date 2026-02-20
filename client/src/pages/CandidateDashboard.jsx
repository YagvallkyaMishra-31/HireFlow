import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    CheckCircle2,
    Send,
    Users,
    Code,
    UserCheck,
    Gift,
    PartyPopper,
    Clock,
    Briefcase,
    TrendingUp
} from 'lucide-react';

const PIPELINE_STAGES = [
    { key: 'Applied', label: 'Applied', icon: <Send size={14} /> },
    { key: 'Screening', label: 'Screening', icon: <Users size={14} /> },
    { key: 'Interview', label: 'Interview', icon: <Users size={14} /> },
    { key: 'Technical', label: 'Technical', icon: <Code size={14} /> },
    { key: 'HR', label: 'HR', icon: <UserCheck size={14} /> },
    { key: 'Offer', label: 'Offer', icon: <Gift size={14} /> },
    { key: 'Hired', label: 'Hired', icon: <PartyPopper size={14} /> },
];

const CandidateDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/applications/my');
                if (res.data.success) {
                    setApplications(res.data.data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const total = applications.length;
    const active = applications.filter(a => !['Hired', 'Rejected'].includes(a.status)).length;
    const offers = applications.filter(a => ['Offer', 'Hired'].includes(a.status)).length;

    const getStageIndex = (status) => {
        if (status === 'Rejected') return -1;
        return PIPELINE_STAGES.findIndex(s => s.key === status);
    };

    if (loading) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>;
    }

    return (
        <div className="cd-wrapper">

            {/* ───────── HERO METRICS ───────── */}
            <div className="cd-hero">
                <div>
                    <h1>Welcome back, {user?.name}</h1>
                    <p>Track your job journey and monitor progress in real-time.</p>
                </div>

                <div className="cd-metrics">
                    <div className="metric">
                        <Briefcase size={18} />
                        <div>
                            <strong>{total}</strong>
                            <span>Total Applications</span>
                        </div>
                    </div>
                    <div className="metric">
                        <Clock size={18} />
                        <div>
                            <strong>{active}</strong>
                            <span>Active</span>
                        </div>
                    </div>
                    <div className="metric">
                        <TrendingUp size={18} />
                        <div>
                            <strong>{offers}</strong>
                            <span>Offers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── MAIN GRID ───────── */}
            <div className="cd-grid">

                {/* LEFT COLUMN */}
                <div className="cd-main">

                    {applications.length === 0 && (
                        <div className="cd-empty">
                            No applications yet. Start applying today.
                        </div>
                    )}

                    {applications.map(app => {
                        const currentIdx = getStageIndex(app.status);

                        return (
                            <div key={app._id} className="cd-card">

                                <div className="cd-card-header">
                                    <div>
                                        <h3>{app.job?.title}</h3>
                                        <span className="company">{app.job?.company}</span>
                                        <span className="date">
                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <span className="status">{app.status}</span>
                                </div>

                                {/* PIPELINE */}
                                <div className="cd-pipeline">
                                    {PIPELINE_STAGES.map((stage, i) => {
                                        const isDone = currentIdx >= i;
                                        return (
                                            <div key={stage.key} className="step">
                                                <div className={`dot ${isDone ? 'done' : ''}`}>
                                                    {isDone ? <CheckCircle2 size={14} /> : stage.icon}
                                                </div>
                                                <span>{stage.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* HISTORY */}
                                {app.history?.length > 0 && (
                                    <>
                                        <button
                                            className="history-btn"
                                            onClick={() =>
                                                setExpandedId(expandedId === app._id ? null : app._id)
                                            }
                                        >
                                            {expandedId === app._id ? "Hide History" : "View History"}
                                        </button>

                                        {expandedId === app._id && (
                                            <div className="history">
                                                {app.history.map((entry, idx) => (
                                                    <div key={idx} className="history-item">
                                                        <strong>{entry.status}</strong>
                                                        <span>
                                                            {new Date(entry.changedAt).toLocaleDateString()}
                                                        </span>
                                                        {entry.note && <p>{entry.note}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                <Link to={`/jobs/${app.job?._id}`} className="details-link">
                                    View Job Details →
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="cd-sidebar">
                    <div className="sidebar-card">
                        <h3>Career Insights</h3>
                        <p>Applications: {total}</p>
                        <p>Active Processes: {active}</p>
                        <p>Offer Rate: {total ? Math.round((offers / total) * 100) : 0}%</p>
                    </div>
                </div>

            </div>

            {/* ───────── STYLES ───────── */}
            <style>{`
                .cd-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .cd-hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    color: white;
                    padding: 2rem;
                    border-radius: 16px;
                }

                .cd-hero h1 {
                    margin: 0;
                    font-size: 1.8rem;
                }

                .cd-metrics {
                    display: flex;
                    gap: 1rem;
                }

                .metric {
                    background: rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .metric strong {
                    font-size: 1.2rem;
                    display: block;
                }

                .cd-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2rem;
                }

                .cd-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                }

                .cd-card-header {
                    display: flex;
                    justify-content: space-between;
                }

                .company {
                    display: block;
                    font-size: 0.8rem;
                    color: #2563eb;
                }

                .date {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }

                .status {
                    background: #eff6ff;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                }

                .cd-pipeline {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    flex-wrap: wrap;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .dot {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .dot.done {
                    background: #2563eb;
                    color: white;
                }

                .history-btn {
                    margin-top: 1rem;
                    background: none;
                    border: none;
                    color: #2563eb;
                    cursor: pointer;
                    font-weight: 600;
                }

                .history {
                    margin-top: 1rem;
                    padding-left: 1rem;
                    border-left: 2px solid #e2e8f0;
                }

                .history-item {
                    margin-bottom: 0.75rem;
                }

                .details-link {
                    display: inline-block;
                    margin-top: 1rem;
                    color: #2563eb;
                    font-weight: 600;
                }

                .cd-sidebar .sidebar-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }

                @media (max-width: 900px) {
                    .cd-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

        </div>
    );
};

export default CandidateDashboard;