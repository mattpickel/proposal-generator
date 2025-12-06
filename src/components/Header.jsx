/**
 * Header Component
 *
 * Application header with logo and Google Drive sign-in
 */

export function Header({ isSignedIn, onSignIn, onSignOut }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/assets/GoodCircle-Icon.png" alt="Good Circle Marketing" className="logo-image" />
          <span>Good Circle Marketing</span>
        </div>
        <div className="header-status">
          {!isSignedIn ? (
            <button className="btn btn-secondary" onClick={onSignIn}>
              Sign in with Google Drive
            </button>
          ) : (
            <>
              <div className="signed-in-status">
                ✓ Signed in to Drive
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
