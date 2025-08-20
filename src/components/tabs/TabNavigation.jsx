import '../../styles/responsive.css';

const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  const defaultTabs = [
    { id: 'commentary', label: 'Commentary' },
    { id: 'prediction', label: 'Predictions' },
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'matchInfo', label: 'Match Info' },
    { id: 'wagonWheel', label: 'Wagon Wheel' },
    { id: 'pointsTable', label: 'Points Table' }
  ];

  const tabsToRender = tabs || defaultTabs;

  return (
    <div className="tab-navigation">
      {tabsToRender.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
