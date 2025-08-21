const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  const defaultTabs = [
    { id: 'liveMatchDetails', label: 'Live Match Details', icon: '🏏' },
    { id: 'commentary', label: 'Commentary', icon: '📝' },
    { id: 'prediction', label: 'Predictions', icon: '🎯' },
    { id: 'scorecard', label: 'Scorecard', icon: '📊' },
    { id: 'matchInfo', label: 'Match Info', icon: 'ℹ️' },
    { id: 'wagonWheel', label: 'Wagon Wheel', icon: '🎡' },
    { id: 'pointsTable', label: 'Points Table', icon: '📋' }
  ];

  const tabsToRender = tabs || defaultTabs;

  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '8px',
      margin: '16px 20px',
      border: '1px solid rgba(161, 129, 231, 0.2)',
      boxShadow: '0 4px 16px rgba(161, 129, 231, 0.08)',
      overflowX: 'auto',
      gap: '6px',
      minHeight: '56px', // Fixed minimum height
      position: 'sticky',
      top: '0',
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      {tabsToRender.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '12px 18px',
            backgroundColor: activeTab === tab.id 
              ? '#a181e7' 
              : 'transparent',
            color: activeTab === tab.id ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.15s ease, color 0.15s ease', // Reduced from 0.2s to 0.15s
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === tab.id 
              ? '0 2px 8px rgba(161, 129, 231, 0.3)' 
              : 'none',
            minHeight: '40px', // Consistent button height
            flex: '0 0 auto' // Prevent shrinking
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.backgroundColor = 'rgba(161, 129, 231, 0.1)';
              e.target.style.color = '#a181e7';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
