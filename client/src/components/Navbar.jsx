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
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .nav-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2.5rem;
        }
        .nav-logo {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1a202c;
          text-decoration: none;
          letter-spacing: -0.025em;
        }
        .nav-logo span {
          color: #3182ce;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-item {
          text-decoration: none;
          color: #4a5568;
          font-weight: 500;
          font-size: 0.925rem;
          padding: 0.5rem 0.25rem;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-item:hover {
          color: #3182ce;
        }
        .nav-item.active {
          color: #3182ce;
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #3182ce;
          border-radius: 2px;
        }
        .btn-logout {
          background: #f7fafc;
          color: #4a5568;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 0.5rem;
        }
        .btn-logout:hover {
          background: #edf2f7;
          color: #2d3748;
          border-color: #cbd5e0;
        }
        .btn-register {
          background-color: #3182ce;
          color: white !important;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        .btn-register:hover {
          background-color: #2b6cb0;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
