import React, { useState } from 'react';
import { login, register } from '../api';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await login({ username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        const { data } = await register({ fullName, username, email: `${username}@temp.com`, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="logo" style={{ fontSize: '32px', marginBottom: '8px' }}>Fin<span>Track</span></div>
        <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Your personal finance dashboard</div>
      </div>
      
      <div className="auth-box">
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Create Account
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px 24px' }}>
          {error && <div style={{ color: 'var(--expense)', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          
          {!isLogin && (
            <div className="auth-form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                placeholder="e.g. Ravi Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="auth-form-group">
            <label>USERNAME</label>
            <input
              type="text"
              placeholder={isLogin ? "Enter your username" : "Choose a username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="auth-form-group" style={{ marginBottom: !isLogin ? '10px' : '24px' }}>
            <label>PASSWORD</label>
            <div className="input-icon-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
            </div>
            {!isLogin && (
              <div className="password-strength">
                <div className={`strength-bar ${strength >= 1 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${strength >= 2 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${strength >= 3 ? 'active' : ''}`}></div>
                <div className={`strength-bar ${strength >= 4 ? 'active' : ''}`}></div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="auth-form-group">
              <label>CONFIRM PASSWORD</label>
              <div className="input-icon-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
          )}
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
