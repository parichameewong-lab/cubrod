import React from 'react';
import Logo from '../common/Logo';

export function AuthLayoutCard({
  title,
  subtitle,
  onBack,
  children,
  badgeText = 'CUBROD COMMUNITY MARKETPLACE',
  promoTitle = 'สร้างโอกาสใหม่ จากทุกการแนะนำ',
  promoSubtitle = 'เลือกรถ แชร์ลิงก์ และติดตามรายได้ของคุณได้ในที่เดียว',
  benefits = [
    { icon: '💰', title: 'สร้างรายได้จากค่าคอมมิชชั่น', desc: 'ทุกการแนะนำรถสำเร็จ รับค่าตอบแทนทันที' },
    { icon: '🔗', title: 'ลิงก์ส่วนตัว ระบบ Tracking 30 วัน', desc: 'ระบบจดจำลูกค้าของคุณอัตโนมัติ ไม่พลาดทุกยอด' },
    { icon: '📊', title: 'Dashboard ติดตาม Real-time', desc: 'เช็กจำนวนคนคลิก รายได้ และสถานะอนุมัติ 24 ชม.' },
  ],
}) {
  return (
    <div className="auth-page">
      <div className="auth-card-split">
        {/* Left Side: Form Container */}
        <div className="auth-form-side">
          <div className="auth-top-bar">
            <button type="button" className="auth-back-btn" onClick={onBack} title="กลับหน้าหลัก">
              <span className="arrow">←</span> กลับหน้าหลัก
            </button>
          </div>

          <div className="auth-brand-header">
            <Logo />
          </div>

          <div className="auth-heading">
            <h2>{title}</h2>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-body">{children}</div>
        </div>

        {/* Right Side: Visual & Value Proposition Banner */}
        <div className="auth-promo-side">
          <div className="promo-bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>

          <div className="promo-content">
            <div className="promo-badge">
              <span className="dot">●</span> {badgeText}
            </div>

            <h3 className="promo-title">{promoTitle}</h3>
            <p className="promo-sub">{promoSubtitle}</p>

            <div className="promo-benefits-list">
              {benefits.map((b, idx) => (
                <div className="promo-benefit-item" key={idx}>
                  <div className="benefit-icon-box">{b.icon}</div>
                  <div className="benefit-text">
                    <strong>{b.title}</strong>
                    <span>{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="promo-footer-tag">
              <span>🚗 แพลตฟอร์มซื้อขายรถมือสองและนายหน้าอันดับ 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayoutCard;
