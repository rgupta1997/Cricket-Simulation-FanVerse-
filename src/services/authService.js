// Authentication Service with persistent login state and 60-minute timeout
const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds
const USER_KEY = 'cricket_user';
const LOGIN_TIME_KEY = 'cricket_login_time';

class AuthService {
  constructor() {
    this.checkSessionTimeout();
  }

  // Check if session has expired on service initialization
  checkSessionTimeout() {
    const loginTime = this.getLoginTime();
    if (loginTime && this.isSessionExpired(loginTime)) {
      this.logout();
    }
  }

  // Check if current session has expired
  isSessionExpired(loginTime) {
    const now = Date.now();
    const sessionEnd = loginTime + SESSION_DURATION;
    return now > sessionEnd;
  }

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const loginTime = this.getLoginTime();
    if (!loginTime) return 0;
    
    const now = Date.now();
    const sessionEnd = loginTime + SESSION_DURATION;
    const remaining = Math.max(0, sessionEnd - now);
    return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
  }

  // Save user data to localStorage with timestamp
  saveUser(userData) {
    try {
      const userWithTimestamp = {
        ...userData,
        loginTime: Date.now()
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userWithTimestamp));
      localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
      console.log('✅ User session saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save user session:', error);
    }
  }

  // Get user data from localStorage
  getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) return null;

      const user = JSON.parse(userData);
      const loginTime = user.loginTime || this.getLoginTime();

      // Check if session has expired
      if (this.isSessionExpired(loginTime)) {
        console.log('⏰ Session expired, auto-logout');
        this.logout();
        return null;
      }

      console.log('✅ User session restored from localStorage');
      return user;
    } catch (error) {
      console.error('❌ Failed to restore user session:', error);
      this.logout();
      return null;
    }
  }

  // Get login timestamp
  getLoginTime() {
    try {
      const timestamp = localStorage.getItem(LOGIN_TIME_KEY);
      return timestamp ? parseInt(timestamp) : null;
    } catch (error) {
      console.error('❌ Failed to get login time:', error);
      return null;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    const user = this.getUser();
    return user !== null;
  }

  // Logout user and clear localStorage
  logout() {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LOGIN_TIME_KEY);
      console.log('✅ User session cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear user session:', error);
    }
  }

  // Refresh session (extend login time)
  refreshSession() {
    const user = this.getUser();
    if (user) {
      this.saveUser(user);
      console.log('✅ Session refreshed');
    }
  }

  // Get session info for display
  getSessionInfo() {
    const user = this.getUser();
    const remainingTime = this.getRemainingSessionTime();
    
    return {
      user,
      remainingTime,
      isExpired: remainingTime <= 0,
      sessionDuration: SESSION_DURATION / (60 * 1000) // Convert to minutes
    };
  }

  // Set up automatic session monitoring
  startSessionMonitoring(callback) {
    // Check session every minute
    const interval = setInterval(() => {
      const sessionInfo = this.getSessionInfo();
      
      if (sessionInfo.isExpired) {
        this.logout();
        if (callback) callback('expired');
        clearInterval(interval);
      } else if (sessionInfo.remainingTime <= 5) {
        // Warn user when session is about to expire (5 minutes remaining)
        if (callback) callback('warning', sessionInfo.remainingTime);
      }
    }, 60 * 1000); // Check every minute

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
