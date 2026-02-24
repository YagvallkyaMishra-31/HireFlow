import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

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
            setError(err.response?.data?.message || 'Invalid email or password');
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
                        <h1>Welcome back</h1>
                        <p>Log in to track your applications, manage your pipeline, and stay ahead in your career journey.</p>
                        <div className="auth-features">
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>Real-time application tracking</span>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>Structured hiring workflow</span>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-dot"></div>
                                <span>One-click job applications</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-card">
                        <h2>Log in to your account</h2>
                        <p className="auth-form-subtitle">Enter your credentials to continue</p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={onSubmit}>
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
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account? <Link to="/register">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page {
                    min-height: calc(100vh - 80px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1.5rem;
                    background: #f8fafc;
                }
                .auth-container {
                    display: grid; grid-template-columns: 1fr 1fr;
                    max-width: 1000px; width: 100%;
                    background: white; border-radius: 24px;
                    box-shadow: 0 12px 48px -8px rgba(0,0,0,0.1);
                    border: 1px solid #e2e8f0;
                    overflow: hidden; min-height: 540px;
                }
                .auth-left {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%);
                    color: white; padding: 3rem 2.5rem;
                    display: flex; align-items: center;
                }
                .auth-left-content { max-width: 340px; }
                .auth-brand { margin-bottom: 2rem; }
                .auth-logo {
                    font-size: 1.6rem; font-weight: 900; color: white;
                    letter-spacing: -0.03em;
                }
                .auth-logo span { color: #93c5fd; }
                .auth-left h1 {
                    font-size: 2rem; font-weight: 900;
                    letter-spacing: -0.03em; margin: 0 0 0.75rem;
                    line-height: 1.15;
                }
                .auth-left p {
                    font-size: 0.95rem; opacity: 0.8; line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .auth-features { display: flex; flex-direction: column; gap: 0.85rem; }
                .auth-feature {
                    display: flex; align-items: center; gap: 0.75rem;
                    font-size: 0.9rem; font-weight: 500; opacity: 0.9;
                }
                .auth-feature-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: #60a5fa; flex-shrink: 0;
                }

                .auth-right {
                    padding: 3rem 2.5rem;
                    display: flex; align-items: center; justify-content: center;
                }
                .auth-form-card { width: 100%; max-width: 380px; }
                .auth-form-card h2 {
                    font-size: 1.5rem; font-weight: 800; color: #0f172a;
                    margin: 0 0 0.3rem; letter-spacing: -0.02em;
                }
                .auth-form-subtitle {
                    font-size: 0.9rem; color: #94a3b8; margin-bottom: 1.75rem;
                }

                .auth-error {
                    background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
                    padding: 0.75rem 1rem; border-radius: 12px;
                    font-size: 0.85rem; font-weight: 500; margin-bottom: 1.25rem;
                }

                .auth-field { margin-bottom: 1.15rem; }
                .auth-field label {
                    display: block; font-size: 0.85rem; font-weight: 700;
                    color: #334155; margin-bottom: 0.4rem;
                }
                .auth-field input {
                    width: 100%; padding: 0.7rem 0.9rem;
                    border: 1.5px solid #e2e8f0; border-radius: 12px;
                    font-size: 0.95rem; background: #f8fafc;
                    transition: all 0.2s; outline: none;
                    box-shadow: none;
                }
                .auth-field input:focus {
                    border-color: #3b82f6; background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }

                .auth-submit {
                    width: 100%; padding: 0.75rem;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    border: none; border-radius: 12px;
                    font-size: 0.95rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s;
                    margin-top: 0.5rem;
                    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
                }
                .auth-submit:hover {
                    background: linear-gradient(135deg, #1d4ed8, #2563eb);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
                }
                .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                .auth-switch {
                    text-align: center; margin-top: 1.5rem;
                    font-size: 0.88rem; color: #94a3b8;
                }
                .auth-switch a {
                    color: #2563eb; font-weight: 700; text-decoration: none;
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

export default Login;
