import { Link } from 'react-router-dom';

const WebApp = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2a2a2a',
        padding: '20px 40px',
        borderBottom: '2px solid #2196F3'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '32px',
          color: '#2196F3',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          🌐 Web Application
        </h1>
        <p style={{ 
          margin: '10px 0 0 0', 
          fontSize: '16px',
          color: '#ccc'
        }}>
          Web-based cricket management and analytics platform
        </p>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: '#333',
        padding: '0 40px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
      }}>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          gap: '0'
        }}>
          <li>
            <Link 
              to="/"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.color = '#2196F3';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/webapp"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: '#2196F3',
                textDecoration: 'none',
                backgroundColor: '#1a1a1a',
                borderBottom: '3px solid #2196F3',
                transition: 'all 0.3s ease'
              }}
            >
              Web App
            </Link>
          </li>
          <li>
            <Link 
              to="/simulator"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.color = '#2196F3';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Cricket Simulator
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          maxWidth: '800px',
          marginBottom: '40px',
          marginTop: '20px'
        }}>
          <h2 style={{
            fontSize: '48px',
            marginBottom: '20px',
            color: '#2196F3',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
          }}>
            Web Application Platform
          </h2>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            color: '#ccc',
            marginBottom: '30px'
          }}>
            A comprehensive web-based platform for cricket management, 
            analytics, and team coordination.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          width: '100%',
          marginBottom: '40px'
        }}>
          {/* Dashboard Card */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            border: '1px solid #333',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#2196F3', marginBottom: '15px', fontSize: '24px' }}>
              📊 Analytics Dashboard
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Real-time cricket statistics, player performance metrics, 
              and match analytics with interactive charts and graphs.
            </p>
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: '#ccc',
              borderRadius: '6px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Coming Soon
            </div>
          </div>

          {/* Team Management Card */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            border: '1px solid #333',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#2196F3', marginBottom: '15px', fontSize: '24px' }}>
              👥 Team Management
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Manage team rosters, player profiles, training schedules, 
              and team communication in one centralized platform.
            </p>
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: '#ccc',
              borderRadius: '6px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Coming Soon
            </div>
          </div>

          {/* Match Planning Card */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            border: '1px solid #333',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#2196F3', marginBottom: '15px', fontSize: '24px' }}>
              🏏 Match Planning
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Strategic match planning tools, field positioning, 
              batting order management, and tactical analysis.
            </p>
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: '#ccc',
              borderRadius: '6px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Coming Soon
            </div>
          </div>
        </div>

        {/* Development Status */}
        <div style={{
          marginTop: '40px',
          padding: '30px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          border: '1px solid #333',
          marginBottom: '40px'
        }}>
          <h3 style={{ color: '#2196F3', marginBottom: '20px', textAlign: 'center' }}>
            🚧 Development Status
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            fontSize: '14px',
            color: '#ccc'
          }}>
            <div>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>Phase 1</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>User Authentication</li>
                <li>Basic Dashboard</li>
                <li>Player Profiles</li>
                <li>Team Setup</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>Phase 2</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Analytics Engine</li>
                <li>Match Statistics</li>
                <li>Performance Tracking</li>
                <li>Reporting System</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>Phase 3</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Advanced Analytics</li>
                <li>AI Predictions</li>
                <li>Mobile App</li>
                <li>API Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#2a2a2a',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #333',
        color: '#666'
      }}>
        <p style={{ margin: 0 }}>
          Web Application Platform © 2024 | Built with React
        </p>
      </footer>
    </div>
  );
};

export default WebApp;
