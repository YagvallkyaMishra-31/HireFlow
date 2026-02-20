import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic frontend validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
            });

            if (response.data.success) {
                const { data } = response.data;
                login(data, data.token);

                // Redirect based on role
                if (data.role === 'recruiter') {
                    navigate('/recruiter-dashboard');
                } else {
                    navigate('/candidate-dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-left-content">
                        <div className="auth-brand">
                            <span className="auth-logo">Hire<span>Flow</span></span>
                        </div>
                        <h1>Start your journey</h1>
                        <p>Join HireFlow to discover opportunities, apply instantly, and track your progress through every hiring stage.</p>
                        <div className="auth-features">
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>7-stage hiring pipeline tracking</span>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>Role-based dashboard experience</span>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>Recruiter & candidate workflows</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-card">
                        <h2>Create your account</h2>
                        <p className="auth-form-subtitle">Get started in under 30 seconds</p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={onSubmit}>
                            <div className="auth-field">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="Min. 6 characters"
                                />
                            </div>

                            <div className="auth-field">
                                <label htmlFor="role">I am a</label>
                                <div className="role-selector">
                                    <button
                                        type="button"
                                        className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'candidate' })}
                                    >
                                        🎯 Candidate
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                                    >
                                        💼 Recruiter
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page {
                    min-height: calc(100vh - 80px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                }
                .auth-container {
                    display: grid; grid-template-columns: 1fr 1fr;
                    max-width: 960px; width: 100%;
                    background: white; border-radius: 20px;
                    box-shadow: 0 8px 40px -8px rgba(0,0,0,0.08);
                    border: 1px solid #e2e8f0;
                    overflow: hidden; min-height: 560px;
                }
                .auth-left {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%);
                    color: white; padding: 3rem 2.5rem;
                    display: flex; align-items: center;
                }
                .auth-left-content { max-width: 340px; }
                .auth-brand { margin-bottom: 2rem; }
                .auth-logo {
                    font-size: 1.3rem; font-weight: 800; color: white;
                    letter-spacing: -0.02em;
                }
                .auth-logo span { color: #93c5fd; }
                .auth-left h1 {
                    font-size: 1.85rem; font-weight: 900;
                    letter-spacing: -0.03em; margin: 0 0 0.75rem;
                    line-height: 1.15;
                }
                .auth-left p {
                    font-size: 0.88rem; opacity: 0.75; line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .auth-features { display: flex; flex-direction: column; gap: 0.75rem; }
                .auth-feature {
                    display: flex; align-items: center; gap: 0.65rem;
                    font-size: 0.82rem; font-weight: 500; opacity: 0.85;
                }
                .auth-feature-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: #60a5fa; flex-shrink: 0;
                }

                .auth-right {
                    padding: 2.5rem 2.5rem;
                    display: flex; align-items: center; justify-content: center;
                }
                .auth-form-card { width: 100%; max-width: 360px; }
                .auth-form-card h2 {
                    font-size: 1.35rem; font-weight: 800; color: #1e293b;
                    margin: 0 0 0.3rem; letter-spacing: -0.02em;
                }
                .auth-form-subtitle {
                    font-size: 0.82rem; color: #94a3b8; margin-bottom: 1.5rem;
                }

                .auth-error {
                    background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
                    padding: 0.7rem 1rem; border-radius: 10px;
                    font-size: 0.82rem; font-weight: 500; margin-bottom: 1.25rem;
                }

                .auth-field { margin-bottom: 1rem; }
                .auth-field label {
                    display: block; font-size: 0.78rem; font-weight: 600;
                    color: #475569; margin-bottom: 0.35rem;
                }
                .auth-field input {
                    width: 100%; padding: 0.6rem 0.85rem;
                    border: 1px solid #e2e8f0; border-radius: 10px;
                    font-size: 0.88rem; background: #f8fafc;
                    transition: all 0.2s; outline: none;
                    box-shadow: none;
                }
                .auth-field input:focus {
                    border-color: #93c5fd; background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
                }

                .role-selector {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;
                }
                .role-btn {
                    padding: 0.55rem 0.75rem; border-radius: 10px;
                    border: 1.5px solid #e2e8f0; background: #f8fafc;
                    font-size: 0.82rem; font-weight: 600; color: #64748b;
                    cursor: pointer; transition: all 0.2s; text-align: center;
                }
                .role-btn:hover { border-color: #93c5fd; color: #2563eb; }
                .role-btn.active {
                    border-color: #2563eb; background: #eff6ff;
                    color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
                }

                .auth-submit {
                    width: 100%; padding: 0.7rem;
                    background: #2563eb; color: white;
                    border: none; border-radius: 10px;
                    font-size: 0.88rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s;
                    margin-top: 0.5rem;
                }
                .auth-submit:hover { background: #1d4ed8; }
                .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                .auth-switch {
                    text-align: center; margin-top: 1.5rem;
                    font-size: 0.82rem; color: #94a3b8;
                }
                .auth-switch a {
                    color: #2563eb; font-weight: 600; text-decoration: none;
                }
                .auth-switch a:hover { text-decoration: underline; }

                @media (max-width: 768px) {
                    .auth-container { grid-template-columns: 1fr; }
                    .auth-left { display: none; }
                    .auth-right { padding: 2rem 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Register;
