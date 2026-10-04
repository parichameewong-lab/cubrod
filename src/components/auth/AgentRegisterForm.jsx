import React, { useState } from 'react';
import AuthLayoutCard from './AuthLayoutCard';
import { generateId } from '../../utils/formatters';

export function AgentRegisterForm({ onBack, onComplete, onNavigateToLogin }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreed) {
      return setErrorMsg('กรุณายินยอมรับเงื่อนไขการใช้งานก่อนส่งใบสมัคร');
    }

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const line = String(formData.get('line') || '').trim();
    const province = String(formData.get('province') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!name || !email || !phone || !password) {
      return setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
    }

    const newAgent = {
      id: `agent-${generateId()}`,
      name,
      email,
      phone,
      line,
      province,
      password,
      status: 'approved',
      code: `CC-${name.substring(0, 4).toUpperCase()}`,
    };

    onComplete(newAgent);
  };

  const agentBenefits = [
    { icon: '💸', title: 'รับคอมมิชชั่นเมื่อเกิดการขาย', desc: 'แนะนำลูกค้าสนใจซื้อรถ รับค่าตอบแทนทันทีที่ปิดการขายสำเร็จ' },
    { icon: '🚀', title: 'มีหน้าร้านส่วนตัวฟรีทันที', desc: 'สร้างลิงก์และเว็บไซต์แคตตาล็อกส่วนตัวเพื่อนำไปโพสต์แชร์ได้ง่ายๆ' },
    { icon: '📈', title: 'ระบบ Cookie Tracking 30 วัน', desc: 'ลูกค้านึกถึงภายหลังแล้วกลับมาซื้อ ระบบยังบันทึกยอดให้คุณ' },
  ];

  return (
    <AuthLayoutCard
      title="สมัครเป็นนายหน้า"
      subtitle="เริ่มต้นฟรี รอทีมงานอนุมัติสร้างลิงก์เพื่อเริ่มแนะนำรถ"
      badgeText="CUBROD AFFILIATE PARTNER"
      promoTitle="สร้างโอกาสใหม่ จากทุกการแนะนำ"
      promoSubtitle="เลือกรถ แชร์ลิงก์ และติดตามรายได้ของคุณได้ในที่เดียว"
      benefits={agentBenefits}
      onBack={onBack}
    >
      <div className="auth-form-badge">
        <span className="badge-icon">⚡</span>
        <span>สมัครฟรี ไม่มีค่าใช้จ่ายแอบแฝง</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reg-name">ชื่อ-นามสกุล <span className="req">*</span></label>
          <div className="input-icon-wrapper">
            <span className="field-icon">👤</span>
            <input
              id="reg-name"
              type="text"
              name="name"
              required
              placeholder="เช่น ธนา โชคดี"
              className="clean-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">อีเมลสำหรับเข้าสู่ระบบ <span className="req">*</span></label>
          <div className="input-icon-wrapper">
            <span className="field-icon">✉️</span>
            <input
              id="reg-email"
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="clean-input"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="reg-phone">เบอร์โทรศัพท์ <span className="req">*</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">📱</span>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                required
                placeholder="08X-XXX-XXXX"
                className="clean-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-line">LINE ID <span className="opt">(ถ้ามี)</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">💬</span>
              <input
                id="reg-line"
                type="text"
                name="line"
                placeholder="line_id"
                className="clean-input"
              />
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="reg-province">จังหวัด</label>
            <div className="input-icon-wrapper">
              <span className="field-icon">📍</span>
              <input
                id="reg-province"
                type="text"
                name="province"
                placeholder="เช่น กรุงเทพมหานคร"
                className="clean-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">รหัสผ่าน <span className="req">*</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">🔑</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
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
        </div>

        <div className="form-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="clean-checkbox"
            />
            <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
          </label>
        </div>

        <button type="submit" className="auth-primary-btn">
          <span>ส่งใบสมัครนายหน้า</span>
          <span className="arrow-icon">→</span>
        </button>
      </form>

      <div className="auth-switch-prompt">
        <p className="switch-text">
          มีบัญชีอยู่แล้ว?{' '}
          <button
            type="button"
            className="link-highlight"
            onClick={onNavigateToLogin || onBack}
          >
            กลับหน้าเข้าสู่ระบบ →
          </button>
        </p>
      </div>
    </AuthLayoutCard>
  );
}

export default AgentRegisterForm;
