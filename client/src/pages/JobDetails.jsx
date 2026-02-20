import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState(false);
    const [success, setSuccess] = useState('');

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

    const handleApply = async () => {
        try {
            const response = await api.post('/applications', { job: id });
            if (response.data.success) {
                setApplied(true);
                setSuccess('Application submitted successfully!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application.');
        }
    };

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
            </div>

            <div className="job-content">
                <h3>Description</h3>
                <p>{job.description}</p>
            </div>

            {isCandidate && (
                <div className="application-section">
                    <button
                        onClick={handleApply}
                        disabled={applied}
                        style={{ width: 'auto', padding: '0.75rem 2rem', fontSize: '1rem' }}
                        className={applied ? 'btn-success' : 'btn-primary'}
                    >
                        {applied ? '✓ Application Sent' : 'Apply for this Position'}
                    </button>
                    {success && <p className="success-txt">{success}</p>}
                </div>
            )}

            {!user && (
                <p className="login-prompt">
                    Please <Link to="/login">login as a candidate</Link> to apply for this job.
                </p>
            )}

            <style>{`
        .job-details-header h1 {
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }
        .job-company {
          font-size: 1.25rem;
          color: var(--primary-color);
          font-weight: 600;
          display: block;
          margin-bottom: 1.5rem;
        }
        .job-meta-details {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .job-content {
          margin-bottom: 2rem;
          line-height: 1.8;
          color: #334155;
        }
        .job-content h3 {
          margin-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        .application-section {
          margin-top: 2rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 2rem;
          width: 100%;
        }
        .success-txt {
          color: #16a34a;
          margin-top: 1rem;
          font-weight: 500;
        }
        .login-prompt {
          margin-top: 2rem;
          font-style: italic;
          color: var(--secondary-color);
        }
      `}</style>
        </div>
    );
};

export default JobDetails;
