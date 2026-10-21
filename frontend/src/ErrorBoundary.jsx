import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="loading-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#b6f36b' }}>MatchMind AI</h1>
          <p style={{ color: '#a1aea3', maxWidth: '500px', margin: '16px 0' }}>
            A display issue occurred while rendering the dashboard.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 0, background: '#b6f36b', color: '#10190e', fontWeight: 700, cursor: 'pointer' }}
          >
            Reload Dashboard
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

