import { Link } from 'react-router-dom';

const HomePage = () => {
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
        borderBottom: '2px solid #4CAF50'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '32px',
          color: '#4CAF50',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          🏏 Cricket Simulation
        </h1>
        <p style={{ 
          margin: '10px 0 0 0', 
          fontSize: '16px',
          color: '#ccc'
        }}>
          Experience the ultimate cricket game simulation
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
                color: '#4CAF50',
                textDecoration: 'none',
                backgroundColor: '#1a1a1a',
                borderBottom: '3px solid #4CAF50',
                transition: 'all 0.3s ease'
              }}
            >
              Home
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
                e.target.style.color = '#4CAF50';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Cricket Simulator
            </Link>
          </li>
          <li>
            <Link 
              to="/player"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.color = '#4CAF50';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Player Test
            </Link>
          </li>
          <li>
            <Link 
              to="/webapp"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.color = '#4CAF50';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Web App
            </Link>
          </li>
          <li>
            <Link 
              to="/bones"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.color = '#4CAF50';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Bone Viewer
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
            color: '#4CAF50',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
          }}>
            Welcome to Cricket Simulator
          </h2>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            color: '#ccc',
            marginBottom: '30px'
          }}>
            Experience realistic cricket gameplay with advanced physics, 
            dynamic player movements, and immersive 3D stadium environments.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          width: '100%'
        }}>
          {/* Simulator Card */}
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
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '24px' }}>
              🎮 Cricket Simulator
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Play a full cricket match with realistic physics, batting controls, 
              bowling mechanics, and field positioning.
            </p>
            <Link 
              to="/simulator"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Play Now →
            </Link>
          </div>

          {/* Player Editor Card */}
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
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '24px' }}>
              🏃 Player Test
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Test player models, animations, and movements. Perfect for debugging 
              and exploring player capabilities.
            </p>
            <Link 
              to="/player"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Test Players →
            </Link>
          </div>

          {/* Web App Card */}
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
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '24px' }}>
              🌐 Web Application
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Web-based cricket management platform with analytics, 
              team coordination, and match planning tools.
            </p>
            <Link 
              to="/webapp"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Open Web App →
            </Link>
          </div>

          {/* Bone Viewer Card */}
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
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '24px' }}>
              🦴 Bone Viewer
            </h3>
            <p style={{ color: '#ccc', marginBottom: '20px', lineHeight: '1.5' }}>
              Explore the skeletal structure and animation bones of player models 
              for advanced debugging.
            </p>
            <Link 
              to="/bones"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              View Bones →
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '60px',
          marginBottom: '40px',
          padding: '30px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '20px', textAlign: 'center' }}>
            🎮 Game Controls
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            fontSize: '14px',
            color: '#ccc'
          }}>
            <div>
              <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>Batting</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Arrow Keys - Shot Direction</li>
                <li>D - Defensive Shot</li>
                <li>F - Drive Shot</li>
                <li>G - Pull Shot</li>
                <li>H - Cut Shot</li>
                <li>V - Loft Shot</li>
                <li>Space - Execute Shot</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>Field Positioning</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Shift+E - Open Position Editor</li>
                <li>Select Player - Choose from dropdown</li>
                <li>Arrow Keys - Move selected player</li>
                <li>Save All - Persist positions</li>
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
          Cricket Simulator © 2024 | Built with React Three Fiber
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
