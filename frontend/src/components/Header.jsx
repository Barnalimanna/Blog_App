import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEdit, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          📝 Post Nest
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/create">
                <FiEdit /> Write
              </Link>
              <Link to="/dashboard">
                <FiGrid /> Dashboard
              </Link>
              <Link to="/profile">
                <FiUser /> Profile
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;