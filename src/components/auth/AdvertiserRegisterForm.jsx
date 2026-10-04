import React, { useState } from 'react';
import AuthLayoutCard from './AuthLayoutCard';
import { generateId } from '../../utils/formatters';

export function AdvertiserRegisterForm({ onBack, onComplete, onNavigateToLogin }) {
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
    const storeName = String(formData.get('storeName') || '').trim();
    const ownerName = String(formData.get('ownerName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const province = String(formData.get('province') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const line = String(formData.get('line') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!storeName || !email || !phone || !password) {
      return setErrorMsg('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
    }

    const newAdvertiser = {
      id: `advertiser-${generateId()}`,
      storeName,
      ownerName,
      email,
      phone,
      province,
      address,
      line,
      password,
      status: 'pending',
    };

    onComplete(newAdvertiser);
  };

  const dealerBenefits = [
    { icon: '🚗', title: 'ขยายช่องทางกระจายรถ', desc: 'ลงประกาศรถครั้งเดียว ให้เครือข่ายนายหน้าช่วยกระจายข่าวสร้างยอดขาย' },
    { icon: '👥', title: 'เข้าถึงผู้ซื้อจริงทั่วประเทศ', desc: 'ระบบกรอง Lead คุณภาพสูง พร้อมทีมงานประสานงานการซื้อขาย' },
    { icon: '📊', title: 'ระบบสต็อกรถออนไลน์', desc: 'จัดการรายการรถ อัปเดตราคา และติดตามสถานะความสนใจได้สะดวก' },
  ];

  return (
    <AuthLayoutCard
      title="ลงทะเบียนเต็นท์รถ"
      subtitle="สำหรับเต็นท์รถและผู้ประกอบการที่ต้องการลงขายรถกับแพลตฟอร์ม"
      badgeText="CUBROD DEALER NETWORK"
      promoTitle="ขยายช่องทางขายรถ ผ่านเครือข่ายนายหน้า"
      promoSubtitle="ลงขายกับเรา ให้ทีมนายหน้ามืออาชีพช่วยโปรโมตและส่งลูกค้าให้คุณ"
      benefits={dealerBenefits}
      onBack={onBack}
    >
      <div className="auth-form-badge dealer-badge">
        <span className="badge-icon">🏪</span>
        <span>สำหรับเต็นท์รถและผู้ประกอบการรถยนต์มือสอง</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="adv-store">ชื่อเต็นท์รถ / ร้านค้า <span className="req">*</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">🏪</span>
              <input
                id="adv-store"
                type="text"
                name="storeName"
                required
                placeholder="เช่น สมชาย ออโต้คาร์"
                className="clean-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adv-owner">ชื่อผู้ติดต่อ</label>
            <div className="input-icon-wrapper">
              <span className="field-icon">👤</span>
              <input
                id="adv-owner"
                type="text"
                name="ownerName"
                placeholder="คุณสมชาย"
                className="clean-input"
              />
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="adv-email">อีเมลสำหรับเข้าสู่ระบบ <span className="req">*</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">✉️</span>
              <input
                id="adv-email"
                type="email"
                name="email"
                required
                placeholder="dealer@email.com"
                className="clean-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adv-phone">เบอร์โทรศัพท์ติดต่อ <span className="req">*</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">📱</span>
              <input
                id="adv-phone"
                type="tel"
                name="phone"
                required
                placeholder="08X-XXX-XXXX"
                className="clean-input"
              />
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="adv-province">จังหวัด</label>
            <div className="input-icon-wrapper">
              <span className="field-icon">📍</span>
              <input
                id="adv-province"
                type="text"
                name="province"
                placeholder="เช่น เชียงใหม่"
                className="clean-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adv-line">LINE ID <span className="opt">(ถ้ามี)</span></label>
            <div className="input-icon-wrapper">
              <span className="field-icon">💬</span>
              <input
                id="adv-line"
                type="text"
                name="line"
                placeholder="dealer_line"
                className="clean-input"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="adv-address">ที่อยู่เต็นท์รถ / สถานที่ตั้ง</label>
          <div className="input-icon-wrapper">
            <span className="field-icon">🏢</span>
            <input
              id="adv-address"
              type="text"
              name="address"
              placeholder="ถนนซุปเปอร์ไฮเวย์ อำเภอเมือง"
              className="clean-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="adv-password">รหัสผ่าน <span className="req">*</span></label>
          <div className="input-icon-wrapper">
            <span className="field-icon">🔑</span>
            <input
              id="adv-password"
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

        <div className="form-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="clean-checkbox"
            />
            <span>ฉันยอมรับเงื่อนไขการเป็นพันธมิตรและนโยบายความเป็นส่วนตัว</span>
          </label>
        </div>

        <button type="submit" className="auth-primary-btn dealer-btn">
          <span>ลงทะเบียนเต็นท์รถ</span>
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

export default AdvertiserRegisterForm;
