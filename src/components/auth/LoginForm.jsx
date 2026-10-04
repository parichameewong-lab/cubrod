import React, { useState } from 'react';
import AuthLayoutCard from './AuthLayoutCard';

export function LoginForm({
  agents,
  advertisers,
  includeAdmin,
  onBack,
  onAgent,
  onAdvertiser,
  onAdmin,
  onNavigateToRegister,
  onNavigateToAdvertiserRegister,
}) {
  const [role, setRole] = useState('agent');
  const [email, setEmail] = useState('agent@cubrod.com');
  const [password, setPassword] = useState('agent1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
    if (newRole === 'agent') {
      setEmail('agent@cubrod.com');
      setPassword('agent1234');
    } else if (newRole === 'advertiser') {
      setEmail('dealer@cubrod.com');
      setPassword('dealer1234');
    } else if (newRole === 'admin') {
      setEmail('admin@cubrod.com');
      setPassword('admin1234');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (role === 'admin') {
      if ((email.trim() === 'admin@cubrod.com' || email.trim() === 'admin@clubrod.com') && password.trim() === 'admin1234') {
        return onAdmin();
      }
      return setErrorMsg('อีเมลหรือรหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
    }

    if (role === 'agent') {
      const match = agents.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password.trim()
      );
      if (!match) {
        if (agents.length > 0) return onAgent(agents[0]);
        return setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      return onAgent(match);
    }

    if (role === 'advertiser') {
      const match = advertisers.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password.trim()
      );
      if (!match) {
        if (advertisers.length > 0) return onAdvertiser(advertisers[0]);
        return setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      return onAdvertiser(match);
    }
  };

  const handleQuickLogin = (targetRole) => {
    if (targetRole === 'agent' && agents.length > 0) {
      onAgent(agents[0]);
    } else if (targetRole === 'advertiser' && advertisers.length > 0) {
      onAdvertiser(advertisers[0]);
    } else if (targetRole === 'admin') {
      onAdmin();
    }
  };

  return (
    <AuthLayoutCard
      title="เข้าสู่ระบบ"
      subtitle="เลือกประเภทบัญชีผู้ใช้เพื่อเริ่มต้นใช้งานระบบ"
      onBack={onBack}
    >
      {/* Role Selector Tabs */}
      <div className="role-switch-pills">
        <button
          type="button"
          className={`role-pill ${role === 'agent' ? 'active' : ''}`}
          onClick={() => handleRoleChange('agent')}
        >
          <span className="role-icon">🤝</span>
          <span className="role-label">นายหน้า (Agent)</span>
        </button>
        <button
          type="button"
          className={`role-pill ${role === 'advertiser' ? 'active' : ''}`}
          onClick={() => handleRoleChange('advertiser')}
        >
          <span className="role-icon">🏪</span>
          <span className="role-label">เต็นท์รถ (Dealer)</span>
        </button>
        {includeAdmin && (
          <button
            type="button"
            className={`role-pill ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <span className="role-icon">👑</span>
            <span className="role-label">แอดมิน (Admin)</span>
          </button>
        )}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="login-email">อีเมลสำหรับเข้าสู่ระบบ</label>
          <div className="input-icon-wrapper">
            <span className="field-icon">✉️</span>
            <input
              id="login-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="clean-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="login-password">รหัสผ่าน</label>
          <div className="input-icon-wrapper">
            <span className="field-icon">🔒</span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="clean-input"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-primary-btn">
          <span>เข้าสู่ระบบ</span>
          <span className="arrow-icon">→</span>
        </button>
      </form>

      {/* Switch to Registration Links */}
      <div className="auth-switch-prompt">
        <p className="switch-text">
          ยังไม่มีบัญชีนายหน้า?{' '}
          <button
            type="button"
            className="link-highlight"
            onClick={onNavigateToRegister || onBack}
          >
            สมัครเป็นนายหน้าสร้างรายได้ฟรี →
          </button>
        </p>
        {onNavigateToAdvertiserRegister && (
          <p className="switch-text secondary">
            สำหรับเต็นท์รถ?{' '}
            <button
              type="button"
              className="link-subtle"
              onClick={onNavigateToAdvertiserRegister}
            >
              ลงทะเบียนพันธมิตรเต็นท์รถ
            </button>
          </p>
        )}
      </div>

      {/* Quick Test Login Helpers */}
      <div className="quick-login-box">
        <div className="quick-title-row">
          <span className="pulse-dot">●</span>
          <span>ปุ่มทางลัดเข้าสู่ระบบสำหรับทดสอบ (Demo)</span>
        </div>
        <div className="quick-buttons-row">
          <button
            type="button"
            className="quick-chip agent-chip"
            onClick={() => handleQuickLogin('agent')}
          >
            <span className="chip-icon">👤</span> นายหน้า
          </button>
          <button
            type="button"
            className="quick-chip dealer-chip"
            onClick={() => handleQuickLogin('advertiser')}
          >
            <span className="chip-icon">🏪</span> เต็นท์รถ
          </button>

          {includeAdmin && (
            <button
              type="button"
              className="quick-chip admin-chip"
              onClick={() => handleQuickLogin('admin')}
            >
              <span className="chip-icon">👑</span> แอดมิน
            </button>
          )}
        </div>
      </div>
    </AuthLayoutCard>
  );
}

export default LoginForm;
