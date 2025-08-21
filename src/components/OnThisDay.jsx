import { useState, useEffect } from 'react';
import onThisDayData from '../data/onThisDayData.json';

const OnThisDay = () => {
  const [selectedTeam, setSelectedTeam] = useState('KKR');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // IPL team data with lighter colors for better readability with black font
  const teams = [
    { code: 'KKR', name: 'Kolkata Knight Riders', color: '#8B7FB8' },
    { code: 'RR', name: 'Rajasthan Royals', color: '#F48FB1' },
    { code: 'RCB', name: 'Royal Challengers Bangalore', color: '#EF9A9A' },
    { code: 'MI', name: 'Mumbai Indians', color: '#81B4E5' },
    { code: 'CSK', name: 'Chennai Super Kings', color: '#FFF176' },
    { code: 'DC', name: 'Delhi Capitals', color: '#81B4E5' },
    { code: 'PBKS', name: 'Punjab Kings', color: '#EF9A9A' },
    { code: 'SRH', name: 'Sunrisers Hyderabad', color: '#FFB74D' },
    { code: 'GT', name: 'Gujarat Titans', color: '#90A4AE' },
    { code: 'LSG', name: 'Lucknow Super Giants', color: '#80DEEA' }
  ];

  useEffect(() => {
    // Load data from JSON file
    const loadContent = () => {
      setTimeout(() => {
        setContent(onThisDayData.content);
        setLoading(false);
      }, 1000);
    };
    loadContent();
  }, []);

  const filteredContent = content.filter(item => item.team === selectedTeam);

  const getTeamColor = (teamCode) => {
    const team = teams.find(t => t.code === teamCode);
    return team ? team.color : '#a181e7';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(161, 129, 231, 0.2)',
            borderTop: '4px solid #a181e7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 30px auto'
          }}></div>
          <div style={{
            color: '#a181e7',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            Loading Cricket Memories...
          </div>
          <div style={{
            color: '#baa2e6',
            fontSize: '14px',
            fontWeight: '400'
          }}>
            Fetching the latest cricket memories and highlights
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f1ecfa 0%, #ede6fa 50%, #dacdf6 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
          border: '1px solid rgba(161, 129, 231, 0.2)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            🏏 MEMORY DOWN THE LANE
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: 0,
            fontWeight: '500'
          }}>
            Relive cricket&apos;s greatest moments and memorable updates
          </p>
        </div>
      </div>

      {/* Team Filter Chips */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 30px auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(161, 129, 231, 0.1)',
          border: '1px solid rgba(161, 129, 231, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginRight: '10px'
            }}>
              Filter by Team:
            </span>
            {teams.map((team) => (
              <button
                key={team.code}
                onClick={() => setSelectedTeam(team.code)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: selectedTeam === team.code
                    ? team.color
                    : 'rgba(255, 255, 255, 0.8)',
                  color: selectedTeam === team.code ? '#1f2937' : '#1f2937',
                  boxShadow: selectedTeam === team.code 
                    ? `0 4px 16px ${team.color}60`
                    : '0 2px 8px rgba(161, 129, 231, 0.1)',
                  border: selectedTeam !== team.code ? '1px solid rgba(161, 129, 231, 0.2)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedTeam !== team.code) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(161, 129, 231, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTeam !== team.code) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(161, 129, 231, 0.1)';
                  }
                }}
              >
                {team.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filteredContent.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(161, 129, 231, 0.1)',
            border: '1px solid rgba(161, 129, 231, 0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏏</div>
            <h3 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '20px' }}>
              No updates found for {teams.find(t => t.code === selectedTeam)?.name}
            </h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              Check back later for more cricket updates and highlights
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}>
            {filteredContent.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(161, 129, 231, 0.15)',
                  border: '1px solid rgba(161, 129, 231, 0.2)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: item.type === 'video' ? 'row' : 'column',
                  minHeight: item.type === 'video' ? '300px' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(161, 129, 231, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(161, 129, 231, 0.15)';
                }}
              >
                {/* Video Section */}
                {item.type === 'video' && (
                  <>
                    {/* Video Container - Left Side */}
                    <div style={{
                      flex: '0 0 500px',
                      position: 'relative'
                    }}>
                      <video 
                        controls
                        style={{
                          width: '100%',
                          height: '281px', // 16:9 ratio for 500px width
                          objectFit: 'cover',
                          borderRadius: '20px 0 0 20px'
                        }}
                        preload="metadata"
                      >
                        <source src={item.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Duration Badge */}
                      {/* <div style={{
                        position: 'absolute',
                        bottom: '15px',
                        right: '15px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {item.duration}
                      </div> */}
                    </div>

                    {/* Content Container - Right Side */}
                    <div style={{
                      flex: '1',
                      padding: '30px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Team Badge */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        background: getTeamColor(item.team),
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '700',
                        marginBottom: '20px',
                        alignSelf: 'flex-start'
                      }}>
                        {item.team}
                      </div>

                      {/* Content */}
                      <div style={{ flex: '1' }}>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 15px 0',
                          lineHeight: '1.3'
                        }}>
                          {item.title}
                        </h3>
                        
                        <p style={{
                          fontSize: '16px',
                          color: '#6b7280',
                          lineHeight: '1.6',
                          margin: '0 0 20px 0'
                        }}>
                          {item.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(161, 129, 231, 0.1)'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          color: '#9ca3af',
                          fontWeight: '500'
                        }}>
                          {formatDate(item.date)}
                        </span>
                        
                        <div style={{
                          fontSize: '14px',
                          color: '#a181e7',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>👁️</span>
                          {item.views}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Text Content Layout */}
                {item.type === 'text' && (
                  <>
                    {/* Team Badge */}
                    <div style={{
                      position: 'relative',
                      padding: '20px 20px 0 20px'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        background: getTeamColor(item.team),
                        color: '#1f2937',
                        fontSize: '12px',
                        fontWeight: '700',
                        marginBottom: '15px'
                      }}>
                        {item.team}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '0 20px 25px 20px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 12px 0',
                        lineHeight: '1.4'
                      }}>
                        {item.title}
                      </h3>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: '0 0 15px 0'
                      }}>
                        {item.description}
                      </p>

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '15px',
                        borderTop: '1px solid rgba(161, 129, 231, 0.1)'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          fontWeight: '500'
                        }}>
                          {formatDate(item.date)}
                        </span>
                        
                        <div style={{
                          fontSize: '12px',
                          color: '#a181e7',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span>📖</span>
                          {item.readTime}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnThisDay;
