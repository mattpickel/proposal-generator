/**
 * Header Component
 *
 * Application header with logo, nav, and branding
 */

import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/assets/GoodCircle-Icon.png" alt="Good Circle Marketing" className="logo-image" />
          <span>Good Circle Marketing</span>
        </Link>
        <nav className="header-nav">
          <Link
            to="/"
            className={`header-nav-link ${location.pathname === '/' || location.pathname.startsWith('/proposal') ? 'header-nav-link--active' : ''}`}
          >
            Proposals
          </Link>
          <Link
            to="/admin/services"
            className={`header-nav-link ${location.pathname === '/admin/services' ? 'header-nav-link--active' : ''}`}
          >
            Service Templates
          </Link>
        </nav>
      </div>
    </header>
  );
}
