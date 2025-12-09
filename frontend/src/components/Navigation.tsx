import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">Memory Palace</span>
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/review"
              className={`nav-link ${location.pathname === '/review' ? 'active' : ''}`}
            >
              Review
            </Link>
            <Link
              to="/items"
              className={`nav-link ${location.pathname === '/items' ? 'active' : ''}`}
            >
              All Items
            </Link>
            <Link
              to="/add"
              className={`nav-link nav-link-primary ${location.pathname === '/add' ? 'active' : ''}`}
            >
              + Add New
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
