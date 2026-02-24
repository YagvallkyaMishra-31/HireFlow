import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Hire<span>Flow</span>
        </Link>

        <div className="nav-links">
          <NavLink
            to="/jobs"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Browse Jobs
          </NavLink>

          {user && (
            <NavLink
              to="/resume-analyzer"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Resume Analyzer
            </NavLink>
          )}

          {user ? (
            <>
              {user.role === 'recruiter' ? (
                <NavLink
                  to="/recruiter-dashboard"
                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                  Dashboard
                </NavLink>
              ) : (
                <NavLink
                  to="/candidate-dashboard"
                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                  Dashboard
                </NavLink>
              )}
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                Login
              </NavLink>
              <Link to="/register" className="btn-register">Get Started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          background-color: #ffffff;
          border-bottom: 1px solid #edf2f7;
          padding: 0.85rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
        }
        .nav-container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 3rem;
          box-sizing: border-box;
        }
        .nav-logo {
          font-size: 1.75rem;
          font-weight: 900;
          color: #0f172a;
          text-decoration: none;
          letter-spacing: -0.03em;
        }
        .nav-logo span {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-item {
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 1rem;
          padding: 0.5rem 0.25rem;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-item:hover {
          color: #2563eb;
        }
        .nav-item.active {
          color: #2563eb;
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2.5px;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          border-radius: 2px;
        }
        .btn-logout {
          background: #f8fafc;
          color: #475569;
          padding: 0.55rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 0.5rem;
        }
        .btn-logout:hover {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .btn-register {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white !important;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .btn-register:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
