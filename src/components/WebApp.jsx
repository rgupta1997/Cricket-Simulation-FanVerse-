import React, { useState, useEffect, Component, useCallback } from 'react';

// Import API service instead of hardcoded data
import webappApiService from '../services/webappApiService.js';
import authService from '../services/authService.js';

// Import new components
import TabNavigation from './tabs/TabNavigation.jsx';
import CommentaryTab from './tabs/CommentaryTab.jsx';
import ScorecardTab from './tabs/ScorecardTab.jsx';
import MatchInfoTab from './tabs/MatchInfoTab.jsx';
import WagonWheelTab from './tabs/WagonWheelTab.jsx';
import PointsTableTab from './tabs/PointsTableTab.jsx';
import MatchChat from './MatchChat.jsx';
import LoginModal from './LoginModal.jsx';
import EmbeddedSimulator from './EmbeddedSimulator';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Stadium from './Stadium';
import PredictionSection from './PredictionSection.jsx';
import SeasonalLeaderboard from './SeasonalLeaderboard.jsx';

// Import responsive styles
import '../styles/responsive.css';

// Simple Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, _errorInfo) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message || 'An error occurred'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}



// Team Logo Component
const TeamLogo = ({ team, size = 40 }) => {
  if (!team) return null;
  
  // Default SVG logo for teams
  const DefaultTeamLogo = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#3b82f6" stroke="#1e40af" strokeWidth="2"/>
      <path d="M30 35 L70 35 L70 65 L30 65 Z" fill="white" stroke="#1e40af" strokeWidth="1"/>
      <circle cx="40" cy="45" r="3" fill="#1e40af"/>
      <circle cx="60" cy="45" r="3" fill="#1e40af"/>
      <path d="M35 55 Q50 60 65 55" stroke="#1e40af" strokeWidth="2" fill="none"/>
      <text x="50" y="80" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
        {team.shortName || 'T'}
      </text>
    </svg>
  );
  
  return (
    <div style={{ position: 'relative' }}>
      {team.logoUrl ? (
    <img 
      src={team.logoUrl} 
      alt={`${team.name} logo`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #e5e7eb'
      }}
      onError={(e) => {
            // Hide the failed image and show default logo
        e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) fallback.style.display = 'block';
          }}
        />
      ) : null}
      
      {/* Default logo - shown when no logoUrl or when image fails */}
      <div style={{ 
        display: team.logoUrl ? 'none' : 'block',
        width: size,
        height: size
      }}>
        <DefaultTeamLogo size={size} />
      </div>
    </div>
  );
};

// Modern Match Card Component
const ModernMatchCard = ({ match, onClick }) => {
  const getStatusConfig = () => {
    switch (match.status) {
      case 'live':
        return {
          badge: { text: 'LIVE', color: '#ffffff', backgroundColor: '#dc2626', icon: '🔴' },
          borderColor: '#dc2626',
          backgroundColor: '#ffffff'
        };
      case 'completed':
        return {
          badge: { text: 'COMPLETED', color: '#ffffff', backgroundColor: '#059669', icon: '✅' },
          borderColor: '#059669',
          backgroundColor: '#ffffff'
        };
      default:
        return {
          badge: { text: 'UPCOMING', color: '#ffffff', backgroundColor: '#dc2626', icon: '⏰' },
          borderColor: '#dc2626',
          backgroundColor: '#ffffff'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      onClick={() => onClick(match.matchId, match)}
      style={{
        backgroundColor: statusConfig.backgroundColor,
        border: `2px solid ${statusConfig.borderColor}`,
        borderRadius: '12px',
        padding: '12px',
        margin: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        width: '420px',
        height: '180px',
        float: 'left',
        display: 'inline-block'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 25px rgba(220, 38, 38, 0.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: statusConfig.badge.backgroundColor,
        color: statusConfig.badge.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>{statusConfig.badge.icon}</span>
        {statusConfig.badge.text}
      </div>

      {/* Centered Content */}
      <div style={{ textAlign: 'center' }}>
        {/* Match Name - Primary Focus */}
        <div>
          <br />
          <h3 style={{
            margin: '0 0 6px 0',
            color: '#1f2937',
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: '1.3'
          }}>
            {match.matchName || 'Match'}
          </h3>
          {match.matchFullName && match.matchFullName !== match.matchName && (
            <p style={{
              margin: '0',
              color: '#6b7280',
              fontSize: '12px',
              lineHeight: '1.4'
            }}>
              {match.matchFullName}
            </p>
          )}
        </div>

        {/* Match Status */}
        <div>
          <div style={{
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fef2f2',
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid #fecaca'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#dc2626',
              borderRadius: '50%'
            }}></span>
            {match.matchStatus || 'Match Status'}
          </div>
        </div>
        
        {/* Match Start Time */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          borderRadius: '6px',
          border: '1px solid #fecaca',
          display: 'inline-block'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              color: '#dc2626',
              fontSize: '14px'
            }}>🕐</span>
            <span style={{
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {match.time || 'Time not specified'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Series Name - Left Aligned */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        left: '12px'
      }}>
        <span style={{
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '500',
          border: '1px solid #fecaca'
        }}>
          {match.seriesName || 'Cricket Series'}
        </span>
      </div>
    </div>
  );
};

// Fixtures Page Component
const FixturesPage = ({ onMatchClick }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Separate state for API calls (actual date range used for API)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Previous day
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]   // Next day
  });
  
  // Separate state for UI inputs (temporary date selection before Apply is clicked)
  const [tempDateRange, setTempDateRange] = useState({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Previous day
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]   // Next day
  });
  
  const [selectedSeries, setSelectedSeries] = useState(['all']); // Changed to array for multi-select
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  
  const fetchFixtures = useCallback(async () => {
    try {
      setLoading(true);
      
      const fixtures = await webappApiService.getFixtures(
        dateRange.startDate,
        dateRange.endDate
      );
      
      // Fetch team and venue details for each match
      const enrichedMatches = await Promise.all(
        fixtures.map(async (match) => {
          const [team1, team2, venue] = await Promise.all([
            webappApiService.getTeamDetails(match.team1Id),
            webappApiService.getTeamDetails(match.team2Id),
            webappApiService.getVenueDetails(match.venueId)
          ]);
          
          return {
            ...match,
            team1,
            team2,
            venue
          };
        })
      );
      
      setMatches(enrichedMatches);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fixtures:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  // Get unique series names for filter
  const uniqueSeries = ['all', ...Array.from(new Set(matches.map(m => m.seriesName).filter(Boolean)))];
  
  // Filter matches based on active tab and selected series
  const getFilteredMatches = () => {
    let filtered = matches;
    
    // Filter by series
    if (selectedSeries.length > 1 && selectedSeries[0] !== 'all') { // If multiple series are selected, filter by all of them
      filtered = filtered.filter(m => selectedSeries.includes(m.seriesName));
    } else if (selectedSeries.length === 1 && selectedSeries[0] !== 'all') { // If only one series is selected, filter by it
      filtered = filtered.filter(m => m.seriesName === selectedSeries[0]);
    }
    
    // Filter by status
    switch (activeTab) {
      case 'completed':
        return filtered.filter(m => m.status === 'completed');
      case 'upcoming':
        return filtered.filter(m => m.status === 'upcoming');
      case 'live':
        return filtered.filter(m => m.status === 'live');
      default:
        return filtered;
    }
  };

  const filteredMatches = getFilteredMatches();

  const handleMatchClick = (matchId, matchDetails) => {
    console.log('🎯 Match clicked with ID:', matchId, 'Type:', typeof matchId);
    onMatchClick(matchId, matchDetails);
  };

  const handleDateChange = (field, value) => {
    setTempDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyDateFilter = () => {
    setDateRange({
      startDate: tempDateRange.startDate,
      endDate: tempDateRange.endDate
    });
    // Note: The useEffect will automatically trigger fetchFixtures when dateRange changes
  };

  const handleSeriesChange = (series) => {
    setSelectedSeries(prev => {
      if (prev.includes(series)) {
        return prev.filter(s => s !== series);
      } else {
        return [...prev, series];
      }
    });
  };

  if (loading) {
  return (
      <div className="cricket-app" style={{ backgroundColor: '#fef2f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #fecaca',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <div style={{ color: '#dc2626', fontSize: '18px', fontWeight: '500' }}>
            Loading fixtures...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cricket-app" style={{ backgroundColor: '#fef2f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#dc2626' }}>⚠️</div>
          <div style={{ color: '#dc2626', marginBottom: '20px', fontSize: '18px' }}>Error: {error}</div>
          <button 
            onClick={fetchFixtures}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cricket-app" style={{ backgroundColor: '#fef2f2', minHeight: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>


      {/* Date Range Filter */}
      <div style={{
        margin: '12px 24px 0',
        padding: '12px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>Start Date:</label>
            <input
              type="date"
              value={tempDateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                borderColor: '#fecaca'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>End Date:</label>
            <input
              type="date"
              value={tempDateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                borderColor: '#fecaca'
              }}
            />
          </div>
          <button
            onClick={handleApplyDateFilter}
            style={{
              padding: '4px 12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', margin: '12px 24px 0', backgroundColor: '#ffffff', borderRadius: '12px', padding: '3px', border: '1px solid #fecaca', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: activeTab === 'all' ? '#dc2626' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          All ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: activeTab === 'live' ? '#dc2626' : 'transparent',
            color: activeTab === 'live' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Live ({matches.filter(m => m.status === 'live').length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: activeTab === 'upcoming' ? '#dc2626' : 'transparent',
            color: activeTab === 'upcoming' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Upcoming ({matches.filter(m => m.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: activeTab === 'completed' ? '#dc2626' : 'transparent',
            color: activeTab === 'completed' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Completed ({matches.filter(m => m.status === 'completed').length})
        </button>
      </div>

      {/* Series Filter - Multi-Select Dropdown */}
        <div style={{ 
        margin: '12px 24px 0',
        paddingBottom: '3px',
          display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        {selectedSeries.length > 0 && selectedSeries[0] !== 'all' && (
          <button
            onClick={() => setSelectedSeries(['all'])}
            style={{
              padding: '2px 6px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: '500',
              marginRight: '8px'
            }}
          >
            Clear All
          </button>
        )}
        
        {/* Multi-Select Dropdown */}
        <div style={{ position: 'relative', width: '200px' }}>
          <div
            onClick={() => setShowSeriesDropdown(!showSeriesDropdown)}
            style={{
              padding: '6px 10px',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
          alignItems: 'center',
              minHeight: '16px',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
              {selectedSeries.length === 0 || (selectedSeries.length === 1 && selectedSeries[0] === 'all') ? (
                <span style={{ color: '#6b7280', fontSize: '12px' }}>All Series</span>
              ) : (
                selectedSeries.map(series => 
                  series !== 'all' ? (
                    <span
                      key={series}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      {series}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeries(prev => prev.filter(s => s !== series));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: '0',
                          margin: '0'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ) : null
                )
              )}
            </div>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              {showSeriesDropdown ? '▲' : '▼'}
            </span>
          </div>
          
          {/* Dropdown Options */}
          {showSeriesDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {uniqueSeries.map((series) => (
                <div
                  key={series}
                  onClick={() => handleSeriesChange(series)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: selectedSeries.includes(series) ? '#fef2f2' : 'transparent',
                    fontSize: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedSeries.includes(series)) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedSeries.includes(series)) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSeries.includes(series)}
                    readOnly
                    style={{
                      margin: 0,
                      accentColor: '#dc2626',
                      width: '12px',
                      height: '12px'
                    }}
                  />
          <span style={{ 
                    color: selectedSeries.includes(series) ? '#dc2626' : '#1f2937',
                    fontWeight: selectedSeries.includes(series) ? '500' : '400'
                  }}>
                    {series === 'all' ? 'All Series' : series}
          </span>
                </div>
              ))}
        </div>
      )}
        </div>

        {selectedSeries.length > 1 && selectedSeries[0] !== 'all' && (
      <div style={{
            marginLeft: '8px',
            padding: '4px 8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '10px',
            color: '#dc2626'
          }}>
            📊 {selectedSeries.length} series selected
          </div>
        )}
      </div>

            {/* Matches List */}
      <div style={{ 
        padding: '0 24px 24px', 
        overflowY: 'auto',
        clear: 'both'
      }}>
        {filteredMatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#9ca3af' }}>📅</div>
            <div style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              No matches found
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              Try adjusting your filters or date range
            </div>
          </div>
        ) : (
          <div style={{ clear: 'both' }}>
            {filteredMatches.map((match) => (
              <ModernMatchCard
                key={match.matchId} 
                match={match} 
                onClick={handleMatchClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Match Detail Page Component  
const MatchDetailPage = ({ matchId, onBackClick, onChatClick, selectedMatchDetails, setCurrentView,currentUser,onLoginClick,latestBallEvent }) => {
  console.log('selectedMatchDetails', selectedMatchDetails)
  const [activeTab, setActiveTab] = useState('commentary');
  const [match, setMatch] = useState(selectedMatchDetails);
  const [matchDetail, setMatchDetail] = useState(null);
  const [error, setError] = useState(null);
  const [commentary, setCommentary] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

  
  const extractTeamDataFromMatchFile = useCallback((matchFileData) => {
    try {
      // Handle the structure from UpdatedMatchFile.json
      if (matchFileData.Teams) {
        // Get team IDs from the Teams object
        const teamIds = Object.keys(matchFileData.Teams);
        if (teamIds.length >= 2) {
          const team1Id = teamIds[0];
          const team2Id = teamIds[1];
          
          const team1Data = matchFileData.Teams[team1Id];
          const team2Data = matchFileData.Teams[team2Id];
          
          return {
            team1: {
              id: team1Id,
              name: team1Data.Name_Full,
              shortName: team1Data.Name_Short,
              logoUrl: selectedMatchDetails?.team1?.logoUrl || null
            },
            team2: {
              id: team2Id, 
              name: team2Data.Name_Full,
              shortName: team2Data.Name_Short,
              logoUrl: selectedMatchDetails?.team2?.logoUrl || null
            }
          };
        }
      }
      
      // Fallback to existing selectedMatchDetails if Teams data not available
      return {
        team1: selectedMatchDetails?.team1 || { 
          name: `Team ${selectedMatchDetails?.team1Id || '1'}`, 
          shortName: `T${selectedMatchDetails?.team1Id || '1'}` 
        },
        team2: selectedMatchDetails?.team2 || { 
          name: `Team ${selectedMatchDetails?.team2Id || '2'}`, 
          shortName: `T${selectedMatchDetails?.team2Id || '2'}` 
        }
      };
    } catch (err) {
      console.warn('Error extracting team data from match file:', err);
      return {
        team1: selectedMatchDetails?.team1 || { 
          name: `Team ${selectedMatchDetails?.team1Id || '1'}`, 
          shortName: `T${selectedMatchDetails?.team1Id || '1'}` 
        },
        team2: selectedMatchDetails?.team2 || { 
          name: `Team ${selectedMatchDetails?.team2Id || '2'}`, 
          shortName: `T${selectedMatchDetails?.team2Id || '2'}` 
        }
      };
    }
  }, [selectedMatchDetails]); // useCallback dependencies for extractTeamDataFromMatchFile

  const fetchMatchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setError(null); // Clear any previous errors
      console.log('🔍 Fetching match data for ID:', matchId);
      console.log('🔍 selectedMatchDetails teams:', {
        team1: selectedMatchDetails?.team1,
        team2: selectedMatchDetails?.team2,
        status: selectedMatchDetails?.status
      });
      
      // Use selectedMatchDetails as the base match data (no fixture API call needed)
      let enrichedMatch = { ...selectedMatchDetails };

      // Try to extract team data from match file if available (for all match statuses)
      if (enrichedMatch.matchFile) {
        try {
          const detailData = await webappApiService.getLiveInningsData(enrichedMatch.matchFile);
          console.log('📄 Match file data loaded for team extraction:', detailData);
          
          // Extract team data from the match file
          const teamData = extractTeamDataFromMatchFile(detailData);
          
          // Update match with team data from match file
          enrichedMatch = {
            ...enrichedMatch,
            ...teamData
          };
          
          console.log('✅ Updated match with team data from match file:', {
            team1: enrichedMatch.team1.name,
            team2: enrichedMatch.team2.name,
            status: enrichedMatch.status
          });

          // For live/completed matches, also set match detail and fetch commentary
          if (enrichedMatch.status !== 'upcoming') {
            setMatchDetail(detailData);
            
            // Determine number of innings from match details
            let inningsCount = 2; // Default to 2 innings
            if (detailData.Innings && Array.isArray(detailData.Innings)) {
              inningsCount = detailData.Innings.length;
            } else if (detailData.matchDetails && detailData.matchDetails.innings) {
              inningsCount = detailData.matchDetails.innings.length;
            } else if (detailData.innings) {
              inningsCount = detailData.innings.length;
            }
            
            console.log(`🏏 Determined ${inningsCount} innings for match ${enrichedMatch.matchFile}`);
            
            // Fetch commentary for all innings based on actual innings count
            const commentaryData = await webappApiService.fetchAllInningsCommentary(enrichedMatch.matchFile, inningsCount);
            setCommentary(commentaryData);
          }
          
        } catch (err) {
          console.warn('Could not fetch match file data:', err);
          // Still use selectedMatchDetails even if match file fails
        }
      }
      
      setMatch(enrichedMatch);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching match data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [matchId, selectedMatchDetails, extractTeamDataFromMatchFile]); // useCallback dependencies

  useEffect(() => {
    if (selectedMatchDetails) {
      fetchMatchData();
    }
  }, [matchId, selectedMatchDetails, fetchMatchData]);


  const fetchLiveData = async () => {
    if (!match?.matchFile) return;
    
    try {
      const data = await webappApiService.getLiveInningsData(match.matchFile);
      setLiveData(data);
    } catch (err) {
      console.warn('Could not fetch live data:', err);
    }
  };



  // Show loading state while fetching data
  if (isLoadingData) {
    return (
      <div className="cricket-app match-detail-page" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '500' }}>
          Loading match details...
        </div>
      </div>
    );
  }

  // Show error only after loading is complete and there's an actual error
  if (error && !isLoadingData) {
    return (
      <div className="cricket-app match-detail-page" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <button onClick={onBackClick} className="back-button">Go Back</button>
      </div>
    );
  }

  // Show loading if no match data yet
  if (!match && !isLoadingData) {
    return (
      <div className="cricket-app match-detail-page" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '500' }}>
          Initializing match...
        </div>
      </div>
    );
  }

  // For upcoming matches, show limited info
  if (match.status === 'upcoming') {
    return (
      <div className="cricket-app match-detail-page">
        <div className="back-navigation">
          <button onClick={onBackClick} className="back-button">
            ← Back
          </button>
        </div>
        
        <div className="match-summary">
          <div className="match-summary-header">
            <div className="match-date">
              {formatDate(match.date).shortDate}
            </div>
            <div className="match-type">
              {match.matchName} • {match.matchType} Match
            </div>
          </div>
          
          <div className="match-teams-summary">
            <div className="team-summary">
              <TeamLogo team={match.team1} size={60} />
              <div>
                <div className="team-name-large">{match.team1.name}</div>
                <div className="team-shortname">{match.team1.shortName}</div>
              </div>
            </div>
            
            <div className="match-vs">vs</div>
            
            <div className="team-summary right">
              <div style={{ textAlign: 'right' }}>
                <div className="team-name-large">{match.team2.name}</div>
                <div className="team-shortname">{match.team2.shortName}</div>
              </div>
              <TeamLogo team={match.team2} size={60} />
            </div>
          </div>
          
          <div className="match-info-upcoming">
            <div className="info-item">
              <span className="info-label">Venue:</span>
              <span className="info-value">{match.venue.name}, {match.venue.city}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date & Time:</span>
              <span className="info-value">{formatDate(match.date).dayTime} {match.time} {match.timezone}</span>
            </div>
                <div className="info-item">
              <span className="info-label">Match File:</span>
              <span className="info-value">{match.matchFile}</span>
                </div>
                <div className="info-item">
              <span className="info-label">Coverage ID:</span>
              <span className="info-value">{match.coverageId}</span>
                </div>
          </div>
        </div>
      </div>
    );
  }

  // For completed/live matches, show full details
  return (
    <div className="cricket-app match-detail-page">
      <div className="back-navigation">
        <button onClick={onBackClick} className="back-button">
          ← Back
        </button>
      </div>

      {/* Match Summary */}
      <div className="match-summary">
        {isLoadingData && (
          <div style={{ 
            padding: '10px 20px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #0ea5e9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #0ea5e9',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#0c4a6e', fontSize: '14px' }}>
              Fetching match details...
            </span>
          </div>
        )}
        {!matchDetail && !isLoadingData && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fef3c7', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ color: '#92400e', fontWeight: 'bold', marginBottom: '10px' }}>
              ⚠️ Limited Data Available
            </div>
            <div style={{ color: '#92400e', fontSize: '14px' }}>
              Detailed match information is not available for this match. Only basic match details are shown.
            </div>
          </div>
        )}
        <div className="match-summary-header">
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <div className="match-date">
              {formatDate(match.date).shortDate}
            </div>
            <div className="match-type">
              {match.matchName} • {match.matchType} Match
            </div>
          </div>
          {match.result && (
            <div className="match-winner">
              {match.result.resultText}
            </div>
          )}
          {match.status === 'live' && (
            <div className="match-winner" style={{ color: '#ef4444' }}>
              🔴 LIVE NOW
            </div>
          )}
        </div>
        
        <div className="match-teams-summary">
          <div className="team-summary">
            <TeamLogo team={match.team1} size={50} />
            <div>
              {matchDetail?.scores?.team1 ? (
                <>
                  <div className="team-score-large">
                    {matchDetail.scores.team1.runs}/{matchDetail.scores.team1.wickets}
                  </div>
                  <div className="team-overs-info">{matchDetail.scores.team1.overs} overs</div>
                </>
              ) : (
                <>
                  <div className="team-name-large">{match.team1.name}</div>
                  <div className="team-shortname">{match.team1.shortName}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="match-vs">vs</div>
          
          <div className="team-summary right">
            <div style={{ textAlign: 'right' }}>
              {matchDetail?.scores?.team2 ? (
                <>
                  <div className="team-score-large">
                    {matchDetail.scores.team2.runs}/{matchDetail.scores.team2.wickets}
                  </div>
                  <div className="team-overs-info">{matchDetail.scores.team2.overs} overs</div>
                </>
              ) : (
                <>
                  <div className="team-name-large">{match.team2.name}</div>
                  <div className="team-shortname">{match.team2.shortName}</div>
                </>
              )}
            </div>
            <TeamLogo team={match.team2} size={50} />
          </div>
        </div>
      </div>

      {/* Embedded Simulator Section */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <EmbeddedSimulator 
          matchId={matchId} 
          onExpand={() => setCurrentView('simulator')}
        />
      </div>

      {/* Prediction Section Toggle */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <button
          onClick={() => setIsPredictionOpen(!isPredictionOpen)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🎯</span>
          {isPredictionOpen ? 'Hide Predictions' : 'Show Predictions'}
        </button>
      </div>

      {/* Prediction Section */}
      <div style={{ padding: '0 20px' }}>
        <PredictionSection
          currentUser={currentUser}
          onLoginClick={onLoginClick}
          latestBallEvent={latestBallEvent}
          isOpen={isPredictionOpen}
          onToggle={() => setIsPredictionOpen(!isPredictionOpen)}
          matchId={matchId}
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

             {/* Tab Content - Scrollable */}
       <div className="tab-content">
         {activeTab === 'commentary' && <CommentaryTab matchDetail={matchDetail} matchId={matchId} commentary={commentary} />}
         {activeTab === 'scorecard' && <ScorecardTab matchDetail={matchDetail} matchId={matchId} />}
         {activeTab === 'matchInfo' && <MatchInfoTab matchDetail={matchDetail} match={match} matchName={match?.matchName } />}
         {activeTab === 'wagonWheel' && <WagonWheelTab matchDetail={matchDetail} match={match} />}
         {activeTab === 'pointsTable' && <PointsTableTab matchDetail={matchDetail} seriesId={match.tournamentId || '9924'} />}
       </div>

       {/* Chat Button - Fixed Bottom Right */}
       <div style={{
         position: 'fixed',
         bottom: '20px',
         right: '20px',
         zIndex: 1000
       }}>
         <button
           onClick={() => onChatClick(matchId, match?.matchName || 'Cricket Match')}
           style={{
             backgroundColor: '#3b82f6',
             color: 'white',
             border: 'none',
             borderRadius: '12px',
             padding: '12px 20px',
             fontSize: '14px',
             fontWeight: '600',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             transition: 'all 0.3s ease',
             boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
             minWidth: '100px',
             justifyContent: 'center'
           }}
           onMouseEnter={(e) => {
             e.target.style.backgroundColor = '#2563eb';
             e.target.style.transform = 'translateY(-2px)';
             e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
           }}
           onMouseLeave={(e) => {
             e.target.style.backgroundColor = '#3b82f6';
             e.target.style.transform = 'translateY(0)';
             e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
           }}
         >
           <span>💬</span>
           <span>Chat</span>
         </button>
       </div>
     </div>
   );
};

const WebApp = () => {
  const [currentView, setCurrentView] = useState('fixtures');
  const [activeNav, setActiveNav] = useState('fixtures');

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMatchId, setChatMatchId] = useState(null);
  const [chatMatchName, setChatMatchName] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [latestBallEvent, setLatestBallEvent] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize authentication from localStorage on component mount
  useEffect(() => {
    const savedUser = authService.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      console.log('✅ User session restored from localStorage');
    }
  }, []);

  // Update session display every minute to show current remaining time
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        // Check if session has expired
        if (authService.isSessionExpired()) {
          console.log('⏰ Session expired, logging out user');
          handleSessionExpired();
          return;
        }
        
        // Force re-render to update session time display
        setCurrentUser(prev => ({ ...prev }));
      }, 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);



  const handleMatchClick = (matchId, matchDetails) => {
    try {
      console.log('🚀 WebApp handleMatchClick - Received ID:', matchId, 'Type:', typeof matchId);
      setSelectedMatchId(matchId);
      setSelectedMatchDetails(matchDetails);
      setCurrentView('matchDetail');
      setActiveNav('fixtures'); // Keep fixtures nav active when viewing match details
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackClick = () => {
    setCurrentView('fixtures');
    setActiveNav('fixtures');
    setSelectedMatchId(null);
    setError(null);
    // Close chat when going back to fixtures
    setIsChatOpen(false);
    setChatMatchId(null);
    setChatMatchName('');
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === 'fixtures') {
      setCurrentView('fixtures');
      setSelectedMatchId(null);
      setError(null);
      setIsChatOpen(false);
      setChatMatchId(null);
      setChatMatchName('');
    } else if (navItem === 'leaderboard') {
      setCurrentView('leaderboard');
      setSelectedMatchId(null);
      setError(null);
      setIsChatOpen(false);
      setChatMatchId(null);
      setChatMatchName('');
    }
  };

  const openMatchChat = (matchId, matchName) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setChatMatchId(matchId);
    setChatMatchName(matchName);
    setIsChatOpen(true);
  };

  const closeMatchChat = () => {
    setIsChatOpen(false);
    setChatMatchId(null);
    setChatMatchName('');
  };

  const handleLoginSuccess = (userId, firstName, lastName, email) => {
    const userData = { userId, firstName, lastName, email };
    setCurrentUser(userData);
    
    // Save user session to localStorage
    authService.saveUser(userData);
    
    setIsLoginOpen(false);
    // Open chat after successful login if we're on a match page
    if (currentView === 'matchDetail' && selectedMatchId) {
      setChatMatchId(selectedMatchId);
      setChatMatchName('Cricket Match'); // Will be updated when chat opens
      setIsChatOpen(true);
    }
  };

  const handleLogout = () => {
    // Clear user session from localStorage
    authService.logout();
    
    setCurrentUser(null);
    setIsChatOpen(false);
    setChatMatchId(null);
    setChatMatchName('');
  };

  const handleSessionExpired = () => {
    console.log('⏰ Session expired, logging out user');
    handleLogout();
  };

  const handleSessionRefresh = () => {
    if (currentUser) {
      authService.refreshSession();
      console.log('✅ Session refreshed manually');
    }
  };

  // Socket.IO connection for live ball events
  useEffect(() => {
    if (selectedMatchId) {
      // Connect to Socket.IO for live commentary
      const connectToSocketIO = async () => {
        try {
          // Import Socket.IO client dynamically
          const { io } = await import('socket.io-client');
          
          // Using the same Socket.IO connection as test-user-types.html
          const socket = io('http://localhost:3001');
          
          socket.on('connect', () => {
            console.log('🔌 Socket.IO connected for predictions - listening for ball events');
            console.log('🎯 Listening for events: commentary_data_update, ball_event, match_update');
            
            // Connect as commentary user with hardcoded match ID (same as test-user-types.html)
           
          });

          socket.emit('join_match', {
            userType: 'commentaryuser',
            matchId: 'stbovl08182025256492', // Hardcoded match ID
            username: 'CommentaryUser' // Hardcoded username
          });
          
          // Listen for commentary updates (main event for ball data)
          socket.on('commentary_data_update', (data) => {
            console.log('📊 Received commentary update:', data);
            if (data.latestBallEvent) {
              console.log('🎯 Setting latest ball event:', data.latestBallEvent);
              setLatestBallEvent(data.latestBallEvent);
            }
          });
          
          // Listen for other potential ball event types
          /* socket.on('ball_event', (data) => {
            console.log('🏏 Received ball event:', data);
            if (data) {
              setLatestBallEvent(data);
            }
          });
          
          socket.on('match_update', (data) => {
            console.log('📈 Received match update:', data);
            if (data.latestBallEvent) {
              setLatestBallEvent(data.latestBallEvent);
            }
          });
          
          // Additional event listeners from test-user-types.html
          socket.on('ball_event_update', (data) => {
            console.log('🏏 Received ball_event_update:', data);
            if (data) {
              setLatestBallEvent(data);
            }
          });
          
          socket.on('match_ball_update', (data) => {
            console.log('🎯 Received match_ball_update:', data);
            if (data) {
              setLatestBallEvent(data);
            }
          });
          
          socket.on('match_data_update', (data) => {
            console.log('📊 Received match_data_update:', data);
            if (data.latestBallEvent) {
              setLatestBallEvent(data.latestBallEvent);
            }
          }); */
          
          socket.on('disconnect', () => {
            console.log('Socket.IO connection disconnected');
          });
          
          socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
          });
          
          // Listen for successful match join confirmation
          socket.on('joined_match', (data) => {
            console.log('✅ Successfully joined match:', data);
          });
          
          // Debug: Log connection success
          console.log('🔌 Socket.IO connection established successfully');
          
          setSocket(socket);
        } catch (error) {
          console.error('Failed to connect to Socket.IO:', error);
        }
      };
      
      connectToSocketIO();
      
      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [selectedMatchId]);

  // Error boundary - only show for critical errors, not MatchDetailPage errors
  if (error && currentView === 'fixtures') {
    return (
      <div className="cricket-app" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
          <h2>Something went wrong!</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={handleBackClick}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go Back to Fixtures
        </button>
      </div>
    );
  }

        return (
      <div className="cricket-app">
        {/* Navigation Header - Shared across all views */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '16px 32px',
          borderBottom: '1px solid #b91c1c',
          boxShadow: '0 2px 10px rgba(220, 38, 38, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>

              <button
                onClick={() => handleNavClick('fixtures')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeNav === 'fixtures' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (activeNav !== 'fixtures') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== 'fixtures') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                📅 Fixtures
              </button>
              <button
                onClick={() => handleNavClick('leaderboard')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeNav === 'leaderboard' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (activeNav !== 'leaderboard') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== 'leaderboard') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                🏆 Seasonal Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Floating Session Popup - Top Right Corner */}
        {currentUser && (
        <div style={{
          position: 'fixed',
          top: '8px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '6px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          fontSize: '11px',
          border: '1px solid #e5e7eb',
          minWidth: '280px',
          backdropFilter: 'blur(8px)',
          animation: 'slideInFromRight 0.3s ease-out'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '12px', flex: '1' }}>
              👤 {currentUser.firstName} {currentUser.lastName}
            </div>
            <div style={{ 
              fontSize: '9px', 
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              ⏰ {authService.getRemainingSessionTime()}m
            </div>
            <button
              onClick={handleSessionRefresh}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '9px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
              title="Extend session by 60 minutes"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              🔄 Extend
            </button>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '9px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
              title="Logout"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}


      {currentView === 'fixtures' && (
        <FixturesPage 
          onMatchClick={handleMatchClick}
        />
      )}
      {currentView === 'leaderboard' && (
        <SeasonalLeaderboard 
          currentUser={currentUser}
          onLoginClick={() => setIsLoginOpen(true)}
        />
      )}
      {currentView === 'matchDetail' && selectedMatchId && (
        <React.Suspense fallback={
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '500' }}>
              Loading match details...
            </div>
          </div>
        }>
          <ErrorBoundary onError={(error) => {
            // Only set critical errors, let MatchDetailPage handle its own errors
            if (error.message.includes('Match not found') || error.message.includes('Error fetching match data')) {
              console.warn('MatchDetailPage error handled internally:', error.message);
              return;
            }
            setError(error.message);
          }}>
            <MatchDetailPage 
              matchId={selectedMatchId} 
              onBackClick={handleBackClick} 
              onChatClick={openMatchChat}
              selectedMatchDetails={selectedMatchDetails}
              setCurrentView={setCurrentView}
              currentUser={currentUser}
              onLoginClick={() => setIsLoginOpen(true)}
              latestBallEvent={latestBallEvent}
            />
          </ErrorBoundary>
        </React.Suspense>
      )}
      {/* eslint-disable react/no-unknown-property */}
      {currentView === 'simulator' && selectedMatchId && (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
          <button
            onClick={() => {
              setCurrentView('matchDetail');
            }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(4px)',
              zIndex: 1000
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Match
          </button>
          <Canvas
            camera={{ 
              position: [30, 30, 30], 
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            shadows
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight args={[0xffffff, 0.5]} />
            <directionalLight 
              args={[0xffffff, 1]}
              position={[10, 10, 5]} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
            />
            <Stadium 
              matchId={selectedMatchId} 
              isEmbedded={false}
            />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={100}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Match Chat Component */}
      {isChatOpen && (
        <MatchChat
          matchId={chatMatchId}
          matchName={chatMatchName}
          isOpen={isChatOpen}
          onClose={closeMatchChat}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}


      
             <style>{`
         @keyframes pulse {
           0% {
             opacity: 1;
           }
           50% {
             opacity: 0.5;
           }
           100% {
             opacity: 1;
           }
         }
         
         @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }
         
         .cricket-app .match-detail-page .loading-spinner {
           animation: spin 1s linear infinite;
         }
        
        .match-info-upcoming {
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 600;
          color: #6b7280;
        }
        
        .info-value {
          color: #111827;
        }
        
        .team-name-large {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        
        .team-shortname {
          font-size: 14px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

// Helper function for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    shortDate: `${months[date.getMonth()]} ${date.getDate()} - ${date.getFullYear()}`,
    dayTime: `${days[date.getDay()]} ${dateString.split('T')[0]}`
  };
};

export default WebApp;