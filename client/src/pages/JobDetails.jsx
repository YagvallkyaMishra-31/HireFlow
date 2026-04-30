import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ApplicationModal from '../components/ApplicationModal';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                if (response.data.success) {
                    setJob(response.data.data);
                }
            } catch (err) {
                setError('Job not found or failed to fetch.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    // Check if user already applied
    useEffect(() => {
        if (!user || user.role !== 'candidate') return;
        const checkApplied = async () => {
            try {
                const res = await api.get(`/applications/check/${id}`);
                if (res.data.applied) {
                    setApplied(true);
                }
            } catch {
                // silently ignore
            }
        };
        checkApplied();
    }, [id, user]);

    if (loading) return <div className="page">Loading job details...</div>;
    if (error) return <div className="page"><div className="error-message">{error}</div><button onClick={() => navigate('/jobs')}>Back to Jobs</button></div>;
    if (!job) return <div className="page">Job not found.</div>;

    const isCandidate = user?.role === 'candidate';

    return (
        <div className="page" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left' }}>
            <button onClick={() => navigate('/jobs')} style={{ marginBottom: '1.5rem', backgroundColor: '#f1f5f9', color: '#475569' }}>
                ← Back to Listings
            </button>

            <div className="job-details-header">
                <h1>{job.title}</h1>
                <span className="job-company">{job.company}</span>
            </div>

            <div className="job-meta-details">
                <span><strong>Posted by:</strong> {job.postedBy?.name}</span>
                <span><strong>Date:</strong> {new Date(job.createdAt).toLocaleDateString()}</span>
                {job.location && <span><strong>Location:</strong> {job.location}</span>}
                {job.experienceRequired > 0 && <span><strong>Experience:</strong> {job.experienceRequired}+ years</span>}
            </div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="job-skills-section">
                    <h3>Required Skills</h3>
                    <div className="skills-tags">
                        {job.requiredSkills.map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="job-content">
                <h3>Description</h3>
                <p>{job.description}</p>
            </div>

            {isCandidate && (
                <div className="application-section">
                    <div className="action-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={applied}
                            style={{ width: 'auto', padding: '0.75rem 2rem', fontSize: '1rem' }}
                            className={applied ? 'btn-success' : 'btn-primary'}
                        >
                            {applied ? '✓ Already Applied' : 'Apply for this Position'}
                        </button>

                        <button
                            onClick={() => navigate('/resume-analyzer', {
                                state: {
                                    jobDescription: job.description,
                                    jobTitle: job.title,
                                    jobId: job._id
                                }
                            })}
                            style={{
                                width: 'auto',
                                padding: '0.75rem 2rem',
                                fontSize: '1rem',
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            ✨ Analyze My Resume For This Job
                        </button>
                    </div>
                </div>
            )}

            {!user && (
                <p className="login-prompt">
                    Please <Link to="/login">login as a candidate</Link> to apply for this job.
                </p>
            )}

            {showModal && (
                <ApplicationModal
                    job={job}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        setApplied(true);
                    }}
                />
            )}

            <style>{`
        /* Override parent app-container for full-width */
        .app-container {
            max-width: none !important;
            padding: 0 !important;
        }
        .page {
            width: 100%;
            padding: 32px 48px;
            box-sizing: border-box;
        }
        .job-details-header h1 {
          margin-bottom: 0.5rem;
          color: #0f172a;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .job-company {
          font-size: 1.25rem;
          color: #2563eb;
          font-weight: 700;
          display: block;
          margin-bottom: 1.5rem;
        }
        .job-meta-details {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 14px;
          font-size: 0.95rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          flex-wrap: wrap;
        }
        .job-meta-details strong {
          color: #334155;
        }
        .job-skills-section {
          margin-bottom: 2rem;
        }
        .job-skills-section h3 {
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }
        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .skill-tag {
          background: #eff6ff;
          color: #2563eb;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          border: 1px solid #bfdbfe;
        }
        .job-content {
          margin-bottom: 2rem;
          line-height: 1.8;
          color: #334155;
          font-size: 1rem;
        }
        .job-content h3 {
          margin-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        .application-section {
          margin-top: 2rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 2rem;
          width: 100%;
        }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
          color: white !important;
          border: none !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
          transition: all 0.2s !important;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
        }
        .btn-success {
          background: linear-gradient(135deg, #059669, #10b981) !important;
          color: white !important;
          border: none !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(5,150,105,0.25);
        }
        .login-prompt {
          margin-top: 2rem;
          font-style: italic;
          color: #64748b;
          font-size: 0.95rem;
        }
        .login-prompt a {
          color: #2563eb;
          font-weight: 700;
        }
      `}</style>
        </div>
    );
};

export default JobDetails;
