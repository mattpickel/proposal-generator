/**
 * Header Component
 *
 * Application header with logo and API key input
 */

export function Header({ apiKey, onApiKeyChange }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/assets/GoodCircle-Icon.png" alt="Good Circle Marketing" className="logo-image" />
          <span>Good Circle Marketing</span>
        </div>
        {onApiKeyChange && (
          <div className="api-key-input">
            <label htmlFor="apiKey">OpenAI API Key:</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-..."
              style={{ width: '300px' }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
