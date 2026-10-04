import React from 'react';
import Logo from '../components/common/Logo';

export function Footer({ onRegister, onAdvertiserRegister, onLogin }) {
  return (
    <footer className="market-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Marketplace รถมือสองคัดคุณภาพ พร้อมทีมงานช่วยตอบคำถาม ประสานนัดดูรถ
            และดูแลก่อนตัดสินใจ
          </p>
        </div>
        <div className="footer-links">
          <strong>สำหรับผู้ซื้อรถ</strong>
          <a href="#cars">ดูรถทั้งหมด</a>
          <a href="#buying">ขั้นตอนการซื้อรถ</a>
        </div>
        <div className="footer-partner">
          <strong>สำหรับพาร์ทเนอร์</strong>
          <button onClick={onAdvertiserRegister}>สร้างรายได้</button>
          <button onClick={onRegister}>สมัครนายหน้า</button>
          <button onClick={onLogin}>เข้าสู่ระบบ</button>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© CUBROD · ชุมชนคนรถมือสอง</span>
        <span>ข้อมูลรถในระบบเป็นข้อมูลสำหรับการนำเสนอ</span>
      </div>
    </footer>
  );
}

export default Footer;
