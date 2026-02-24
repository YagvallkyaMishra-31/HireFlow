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
                /* Override parent app-container for full-width */
                .app-container {
                    max-width: none !important;
                    padding: 0 !important;
                }

                .cd-wrapper {
                    width: 100%;
                    padding: 24px 48px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .cd-hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6);
                    color: white;
                    padding: 2.5rem;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(37,99,235,0.25);
                }

                .cd-hero h1 {
                    margin: 0 0 0.25rem;
                    font-size: 2.2rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }

                .cd-hero p {
                    margin: 0;
                    opacity: 0.85;
                    font-size: 1rem;
                }

                .cd-metrics {
                    display: flex;
                    gap: 1rem;
                }

                .metric {
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.15);
                    padding: 1rem 1.25rem;
                    border-radius: 14px;
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    min-width: 120px;
                }

                .metric strong {
                    font-size: 1.4rem;
                    font-weight: 900;
                    display: block;
                    line-height: 1;
                }

                .metric span {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .cd-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 2rem;
                    align-items: start;
                }

                .cd-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.06);
                    margin-bottom: 1.25rem;
                    transition: box-shadow 0.2s;
                }

                .cd-card:hover {
                    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                }

                .cd-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .cd-card-header h3 {
                    margin: 0 0 4px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .company {
                    display: block;
                    font-size: 0.85rem;
                    color: #2563eb;
                    font-weight: 600;
                }

                .date {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: block;
                    margin-top: 4px;
                }

                .status {
                    background: #eff6ff;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #2563eb;
                    white-space: nowrap;
                }

                .cd-pipeline {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.25rem;
                    flex-wrap: wrap;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #64748b;
                }

                .dot {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    transition: all 0.2s;
                }

                .dot.done {
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
                }

                .history-btn {
                    margin-top: 1rem;
                    background: none;
                    border: none;
                    color: #2563eb;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.85rem;
                    padding: 0;
                }

                .history-btn:hover {
                    text-decoration: underline;
                }

                .history {
                    margin-top: 1rem;
                    padding-left: 1rem;
                    border-left: 2px solid #e2e8f0;
                }

                .history-item {
                    margin-bottom: 0.75rem;
                    font-size: 0.85rem;
                }

                .history-item strong {
                    color: #1e293b;
                }

                .details-link {
                    display: inline-block;
                    margin-top: 1rem;
                    color: #2563eb;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                }

                .details-link:hover {
                    text-decoration: underline;
                }

                .cd-empty {
                    background: white;
                    padding: 3rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 1rem;
                }

                .cd-sidebar .sidebar-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 6px 24px rgba(0,0,0,0.06);
                    position: relative;
                    overflow: hidden;
                }

                .cd-sidebar .sidebar-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b);
                }

                .cd-sidebar .sidebar-card h3 {
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .cd-sidebar .sidebar-card p {
                    margin: 0.5rem 0;
                    font-size: 0.9rem;
                    color: #475569;
                }

                @media (max-width: 900px) {
                    .cd-grid { grid-template-columns: 1fr; }
                    .cd-wrapper { padding: 20px; }
                    .cd-hero { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .cd-metrics { width: 100%; }
                }
            `}</style>

        </div>
    );
};

export default CandidateDashboard;