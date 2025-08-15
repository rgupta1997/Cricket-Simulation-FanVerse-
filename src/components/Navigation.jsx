import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', description: 'Welcome page and navigation' },
    { path: '/simulator', label: 'Cricket Simulator', description: 'Main cricket simulation game' },
    { path: '/webapp', label: 'Web App', description: 'Web-based cricket management platform' },
    { path: '/player', label: 'Player Test', description: 'Basic player model test' },
    { path: '/bones', label: 'Bone Viewer', description: 'Player skeleton visualization' }
  ];

  const navStyle = {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000,
    minWidth: '200px'
  };

  const headerStyle = {
    padding: '15px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: isExpanded ? '1px solid #555' : 'none'
  };

  const contentStyle = {
    padding: '15px',
    paddingTop: '5px'
  };

  const linkStyle = {
    display: 'block',
    color: '#4CAF50',
    textDecoration: 'none',
    padding: '8px 12px',
    margin: '2px 0',
    borderRadius: '5px',
    transition: 'all 0.2s ease'
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: '#4CAF50',
    color: 'white'
  };

  const hoverStyle = {
    background: 'rgba(76, 175, 80, 0.2)'
  };

  return (
    <nav style={navStyle}>
      <div 
        style={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 style={{ color: 'white', margin: 0, fontSize: '14px' }}>
          Navigation
        </h4>
        <span style={{ 
          fontSize: '16px', 
          transition: 'transform 0.3s ease', 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
        }}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div style={contentStyle}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={location.pathname === item.path ? activeLinkStyle : linkStyle}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  Object.assign(e.target.style, hoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  Object.assign(e.target.style, linkStyle);
                }
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
