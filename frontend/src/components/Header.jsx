/**
 * Header Component
 *
 * Application header with logo and API key input
 */

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/assets/GoodCircle-Icon.png" alt="Good Circle Marketing" className="logo-image" />
          <span>Good Circle Marketing</span>
        </div>
        <div className="header-subtitle">
          <span>AI Proposal Builder</span>
        </div>
      </div>
    </header>
  );
}
