import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

                try {
              // Call the actual login API
              const response = await fetch('https://playground-dev.sportz.io/api/loginFanverse', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.user_id, data.first_name, data.last_name, email);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(161, 129, 231, 0.3)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(161, 129, 231, 0.25)',
        overflow: 'hidden',
        animation: 'slideIn 0.2s ease-out',
        border: '1px solid rgba(161, 129, 231, 0.2)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Decorative top border */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #a181e7 0%, #baa2e6 50%, #ecaf1a 100%)'
          }}></div>
          
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '0.5px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '24px' }}>🏏</span>
            Cricket FanVerse Login
          </h2>
          <button 
            onClick={handleClose} 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleLogin} style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '15px',
                letterSpacing: '0.3px'
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid rgba(161, 129, 231, 0.3)',
                borderRadius: '16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#a181e7';
                e.target.style.boxShadow = '0 0 0 3px rgba(161, 129, 231, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(161, 129, 231, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '15px',
                letterSpacing: '0.3px'
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid rgba(161, 129, 231, 0.3)',
                borderRadius: '16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#a181e7';
                e.target.style.boxShadow = '0 0 0 3px rgba(161, 129, 231, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(161, 129, 231, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          
          {error && (
            <div style={{
              background: 'rgba(236, 175, 26, 0.1)',
              color: '#b45309',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              border: '1px solid rgba(236, 175, 26, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '18px',
              background: isLoading 
                ? 'linear-gradient(135deg, #baa2e6 0%, #dacdf6 100%)' 
                : 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '17px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 6px 20px rgba(161, 129, 231, 0.3)',
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 30px rgba(161, 129, 231, 0.4)';
                e.target.style.background = 'linear-gradient(135deg, #9575e3 0%, #a891e0 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(161, 129, 231, 0.3)';
                e.target.style.background = 'linear-gradient(135deg, #a181e7 0%, #baa2e6 100%)';
              }
            }}
          >
            {isLoading && (
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            <span style={{ 
              marginLeft: isLoading ? '30px' : '0',
              transition: 'margin-left 0.2s ease'
            }}>
              {isLoading ? 'Signing you in...' : 'Sign In to Cricket FanVerse'}
            </span>
          </button>
        </form>
        
        {/* Add animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from {
              transform: translateY(-30px) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginModal;
