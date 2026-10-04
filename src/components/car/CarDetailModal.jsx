import React, { useState, useEffect } from 'react';
import { formatNumber, getCarImages, generateId } from '../../utils/formatters';
import { createConversation } from '../../services/api';
import { getFeatureIcon } from '../../data/carFeatures';
import CarLoanCalculator from './CarLoanCalculator';

export function CarDetailModal({ car, agents, attribution, onBack, onLead }) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'lead'

  // Image gallery slider & zoom state
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Chat tab state
  const [chatName, setChatName] = useState('');
  const [chatPhone, setChatPhone] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatPrivacyAccepted, setChatPrivacyAccepted] = useState(true);
  const [chatSent, setChatSent] = useState(false);

  // Lead tab state
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadLine, setLeadLine] = useState('');
  const [leadContactTime, setLeadContactTime] = useState('13:00–16:00 น.');
  const [leadPrivacyAccepted, setLeadPrivacyAccepted] = useState(true);

  // Coupon form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponName, setCouponName] = useState('');
  const [couponPhone, setCouponPhone] = useState('');
  const [couponLine, setCouponLine] = useState('');
  const [couponAccepted, setCouponAccepted] = useState(true);
  const [couponSubmitted, setCouponSubmitted] = useState(false);

  const images = getCarImages(car);

  // Keyboard navigation for zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isZoomOpen) return;
      if (e.key === 'Escape') setIsZoomOpen(false);
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, images.length]);

  if (!car) return null;

  const agentObj = agents?.find((a) => a.code === attribution);

  const quickQuestions = [
    'รถยังอยู่ไหมครับ?',
    'ราคาต่อรองได้อีกไหมครับ?',
    'ขอรายละเอียดการจัดไฟแนนซ์ครับ',
    'นัดดูรถได้วันไหนครับ?',
  ];

  const handleQuickQuestionClick = (qText) => {
    setChatMsg(qText);
  };

  const handleApplyLoanPlan = (plan) => {
    setActiveTab('chat');
    setChatMsg(
      `สนใจจัดไฟแนนซ์รถ ${car.title}: เงินดาวน์ ฿${formatNumber(plan.downPayment)} (${plan.downPercent}%), ผ่อน ${plan.tenureMonths} งวด (ตกเดือนละ ฿${formatNumber(plan.monthlyPayment)} / ดอกเบี้ย ${plan.interestRate}%)`
    );
    const contactCol = document.querySelector('.customer-contact-column');
    if (contactCol) {
      contactCol.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev + 1) % images.length);
    setZoomScale(1);
  };

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomScale(1);
  };

  const handleOpenZoom = () => {
    setZoomScale(1);
    setIsZoomOpen(true);
  };

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadPrivacyAccepted) {
      alert('กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนส่งข้อมูล');
      return;
    }

    setSubmitting(true);

    const newLead = {
      id: `lead-${generateId()}`,
      carId: car.id,
      agentCode: attribution || 'PLATFORM',
      name: leadName.trim(),
      phone: leadPhone.trim(),
      line: leadLine.trim(),
      contactTime: leadContactTime,
      createdAt: new Date().toISOString(),
      leadStatus: 'รอนัดหมาย',
      saleStatus: 'สนใจรถ',
      payoutStatus: 'ยังไม่เกิดสิทธิ์',
    };

    onLead(newLead);
    setSubmitting(false);
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponAccepted) {
      alert('กรุณายินยอมให้ทีมงานติดต่อกลับเพื่อยืนยันสิทธิ์ก่อนลงทะเบียน');
      return;
    }
    if (!couponName.trim() || !couponPhone.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์');
      return;
    }

    setSubmitting(true);

    const newLead = {
      id: `lead-${generateId()}`,
      carId: car.id,
      agentCode: attribution || 'PLATFORM',
      name: couponName.trim(),
      phone: couponPhone.trim(),
      line: couponLine.trim(),
      contactTime: 'ลงทะเบียนรับคูปองตรวจสภาพรถฟรี (มูลค่า 1,500 บาท)',
      createdAt: new Date().toISOString(),
      leadStatus: 'รอนัดหมาย',
      saleStatus: 'สนใจรถ',
      payoutStatus: 'ยังไม่เกิดสิทธิ์',
      type: 'COUPON_CLAIM',
    };

    onLead(newLead);
    setSubmitting(false);
    setCouponSubmitted(true);
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatPrivacyAccepted) {
      alert('กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนส่งข้อมูล');
      return;
    }
    if (!chatMsg.trim()) return;

    setSubmitting(true);
    try {
      const fullMessage = `[ผู้สนทนา: ${chatName || 'ไม่ระบุชื่อ'} | เบอร์: ${chatPhone || 'ไม่ระบุเบอร์'}] ${chatMsg}`;
      await createConversation(car.id, attribution, fullMessage);
      setChatSent(true);
    } catch {
      setChatSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const currentImg = images[activeImgIndex] || images[0];

  return (
    <div className="customer-page">
      <div className="container">
        <button className="back-link" onClick={onBack}>
          ← กลับหน้าค้นหารถ
        </button>

        <div className="detail-grid">
          {/* Left Column - Car Presentation & Info */}
          <div className="detail-left-column">
            {/* CAROUSEL SLIDER GALLERY */}
            <div className="detail-gallery-slider">
              <div className="slider-main-photo" style={{ background: car.tone }}>
                <div className="hero-selected-badge">CUBROD SELECTED CAR</div>
                
                {/* Image Counter & Zoom Indicator */}
                <div className="slider-top-controls">
                  <span className="slider-counter-chip">
                    📷 {activeImgIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    className="slider-zoom-trigger"
                    onClick={handleOpenZoom}
                    title="คลิกเพื่อขยายดูรูปขนาดใหญ่"
                  >
                    🔍 กดขยายรูปภาพ
                  </button>
                </div>

                {/* Subtle CUBROD Watermark Overlay */}
                <div className="cubrod-watermark-overlay clubrod-watermark-overlay">
                  <span className="watermark-text">CUBROD</span>
                </div>

                {/* Main Slide Image */}
                {currentImg ? (
                  <img
                    src={currentImg}
                    alt={`${car.title} รูปที่ ${activeImgIndex + 1}`}
                    onClick={handleOpenZoom}
                    className="slide-image-cursor"
                  />
                ) : (
                  <div className="photo-placeholder">{car.brand?.toUpperCase()}</div>
                )}

                {/* Prev / Next Slider Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="slider-arrow slider-arrow-left"
                      onClick={handlePrevImage}
                      aria-label="รูปก่อนหน้า"
                    >
                      ❮
                    </button>
                    <button
                      type="button"
                      className="slider-arrow slider-arrow-right"
                      onClick={handleNextImage}
                      aria-label="รูปถัดไป"
                    >
                      ❯
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="slider-thumbnails-row">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`thumbnail-item ${idx === activeImgIndex ? 'active' : ''}`}
                      onClick={() => setActiveImgIndex(idx)}
                    >
                      <img src={imgUrl} alt={`รูปเล็ก ${idx + 1}`} />
                      <div className="thumbnail-watermark">CUBROD</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Header Card */}
            <div className="car-header-card">
              <div className="car-header-left">
                <span className="brand-sublabel">รถคัดสภาพจาก CUBROD</span>
                <h1 className="car-main-title">{car.title}</h1>
                <p className="car-specs-subtitle">
                  {car.year} · เกียร์{car.transmission || 'อัตโนมัติ'} · รถพร้อมใช้งาน
                </p>
              </div>
              <div className="car-header-right">
                <div className="car-main-price">฿{formatNumber(car.price)}</div>
                {car.monthlyPayment && (
                  <div className="car-monthly-price">
                    ผ่อนเริ่มต้น ฿{formatNumber(car.monthlyPayment)}/เดือน
                  </div>
                )}
              </div>
            </div>

            <div className="car-desc-card">
              <span className="desc-sublabel">รายละเอียดรถเบื้องต้น</span>
              <p className="desc-text">
                {car.description || 'อีโคคาร์ประหยัดน้ำมัน ห้องโดยสารกว้าง คล่องตัว เหมาะกับการใช้งานในเมือง'}
              </p>
            </div>

            {/* Car Features & Options Card (Clean & Mobile-Friendly) */}
            <div className="car-features-card">
              <div className="car-features-header">
                <div className="features-title-group">
                  <span className="desc-sublabel">คุณสมบัติและออฟชั่นเด่น</span>
                  <h3 className="features-card-title">คุณสมบัติ / ออฟชั่นของคันนี้</h3>
                </div>
                {Array.isArray(car.features) && car.features.length > 0 && (
                  <span className="features-total-chip">
                    {car.features.length} รายการ
                  </span>
                )}
              </div>

              {Array.isArray(car.features) && car.features.length > 0 ? (
                <div className="car-features-grid">
                  {car.features.map((feat, idx) => (
                    <div key={idx} className="car-feature-pill">
                      <span className="feature-pill-icon">{getFeatureIcon(feat)}</span>
                      <span className="feature-pill-name">{feat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="car-features-empty">
                  <span className="empty-icon">🚗</span>
                  <div>
                    <strong>อุปกรณ์มาตรฐานครบครันตามรุ่น</strong>
                    <small>พร้อมการตรวจสภาพอย่างละเอียดโดยผู้เชี่ยวชาญ</small>
                  </div>
                </div>
              )}
            </div>

            <div className="trust-chips-row">
              <span className="trust-chip">✓ ตรวจสอบข้อมูลรถ</span>
              <span className="trust-chip">✓ ทีมงานช่วยประสาน</span>
              <span className="trust-chip">✓ ดูรถก่อนตัดสินใจ</span>
            </div>

            <div className="bottom-cards-row">
              <div className="doc-card">
                <span className="doc-card-sublabel">เอกสารประกอบรถคันนี้</span>
                <div className="doc-status-box">
                  <span className="pdf-tag">PDF</span>
                  {car.inspectionReportUrl ? (
                    <a href={car.inspectionReportUrl} target="_blank" rel="noreferrer" className="doc-link">
                      ดูรายงานการตรวจสภาพ (PDF) →
                    </a>
                  ) : (
                    <span className="doc-none-text">ยังไม่มีรายงานตรวจสภาพ</span>
                  )}
                </div>
              </div>

              <div className={`coupon-card ${showCouponForm ? 'expanded' : ''}`}>
                <div className="coupon-top-content">
                  <div className="coupon-icon-box">✓</div>
                  <div className="coupon-text-group">
                    <span className="coupon-sublabel">สิทธิพิเศษสำหรับผู้ซื้อรถคันนี้</span>
                    <h3 className="coupon-title">คูปองตรวจสภาพรถฟรี</h3>
                    <p className="coupon-desc">
                      มูลค่า <strong className="orange-text">1,500 บาท</strong> · เมื่อซื้อรถสำเร็จ รับเงินสดตามมูลค่าคูปอง
                    </p>
                  </div>
                  {showCouponForm ? (
                    <button
                      type="button"
                      className="coupon-toggle-btn close-btn"
                      onClick={() => setShowCouponForm(false)}
                    >
                      ปิดแบบฟอร์ม
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="coupon-cta-btn"
                      onClick={() => setShowCouponForm(true)}
                    >
                      ขอรับสิทธิ์
                    </button>
                  )}
                </div>

                {showCouponForm && (
                  <>
                    <div className="coupon-dashed-divider" />

                    {couponSubmitted ? (
                      <div className="coupon-success-box">
                        <div className="success-icon">✓</div>
                        <h4>ลงทะเบียนรับคูปองเรียบร้อยแล้ว</h4>
                        <p>ทีมงาน CUBROD จะติดต่อกลับที่เบอร์ {couponPhone} เพื่อยืนยันสิทธิ์และรายละเอียด</p>
                        <button
                          type="button"
                          className="coupon-reset-btn"
                          onClick={() => {
                            setCouponSubmitted(false);
                            setShowCouponForm(false);
                          }}
                        >
                          ตกลง
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCouponSubmit} className="coupon-form-body">
                        <div className="coupon-fields-grid">
                          <label className="coupon-field">
                            <span className="field-label-bold">ชื่อ–นามสกุล</span>
                            <input
                              type="text"
                              required
                              placeholder="ชื่อผู้ขอรับสิทธิ์"
                              value={couponName}
                              onChange={(e) => setCouponName(e.target.value)}
                            />
                          </label>
                          <label className="coupon-field">
                            <span className="field-label-bold">เบอร์โทรศัพท์</span>
                            <input
                              type="tel"
                              required
                              placeholder="08X-XXX-XXXX"
                              value={couponPhone}
                              onChange={(e) => setCouponPhone(e.target.value)}
                            />
                          </label>
                          <label className="coupon-field">
                            <span className="field-label-bold">LINE ID</span>
                            <input
                              type="text"
                              placeholder="เช่น line_id (ถ้ามี)"
                              value={couponLine}
                              onChange={(e) => setCouponLine(e.target.value)}
                            />
                          </label>
                        </div>
                        <div className="coupon-check-row">
                          <label className="checkbox-custom-label">
                            <input
                              type="checkbox"
                              checked={couponAccepted}
                              onChange={(e) => setCouponAccepted(e.target.checked)}
                            />
                            <span>ยินยอมให้ทีมงานติดต่อกลับเพื่อยืนยันสิทธิ์ก่อนซื้อขาย</span>
                          </label>
                          <button
                            type="submit"
                            className="coupon-submit-btn"
                            disabled={submitting}
                          >
                            {submitting ? 'กำลังส่ง...' : 'ยืนยันลงทะเบียน →'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Minimal Car Loan Installment Calculator (ล่างสุด) */}
            <CarLoanCalculator car={car} />
          </div>

          {/* Right Column - Contact Form Box */}
          <div className="customer-contact-column">
            <div className="lead-card">
              <div className="lead-tabs-row">
                <button
                  type="button"
                  className={`tab-toggle ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <span className="tab-icon">💬</span> แชทกับทีมงาน
                </button>
                <button
                  type="button"
                  className={`tab-toggle ${activeTab === 'lead' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lead')}
                >
                  <span className="tab-icon">📞</span> ให้ติดต่อกลับ
                </button>
              </div>

              {activeTab === 'chat' && (
                <div className="chat-tab-content">
                  <span className="lead-eyebrow">⚡ สอบถามรถคันนี้</span>
                  <h2 className="lead-title">
                    แชทกับทีม <strong>CUBROD</strong>
                  </h2>
                  <p className="lead-sub">
                    ส่งคำถามถึงแอดมิน พร้อมแนบข้อมูลรถคันนี้ให้อัตโนมัติ
                  </p>

                  {chatSent ? (
                    <div className="chat-sent-success">
                      <div className="success-icon">✓</div>
                      <h3>ส่งข้อความเรียบร้อยแล้ว</h3>
                      <p>ทีมงานจะตอบกลับท่านผ่านระบบแชทโดยเร็วที่สุด</p>
                      <button
                        type="button"
                        className="btn-submit-lead"
                        onClick={() => setChatSent(false)}
                      >
                        ส่งข้อความเพิ่ม
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChatSend} className="customer-form">
                      <label className="form-label-group">
                        <span className="field-label">ชื่อ</span>
                        <input
                          type="text"
                          placeholder="ชื่อสำหรับสนทนา"
                          value={chatName}
                          onChange={(e) => setChatName(e.target.value)}
                        />
                      </label>
                      <label className="form-label-group">
                        <span className="field-label">เบอร์โทรศัพท์</span>
                        <input
                          type="tel"
                          placeholder="08X-XXX-XXXX"
                          value={chatPhone}
                          onChange={(e) => setChatPhone(e.target.value)}
                        />
                      </label>

                      <div className="quick-questions-label">เลือกคำถามด่วน</div>
                      <div className="quick-questions-chips">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`chip-btn ${chatMsg === q ? 'selected' : ''}`}
                            onClick={() => handleQuickQuestionClick(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>

                      <label className="form-label-group">
                        <span className="field-label">คำถามของคุณ</span>
                        <textarea
                          rows={3}
                          required
                          placeholder={`เช่น ${car.title} ยังอยู่ไหมครับ?`}
                          value={chatMsg}
                          onChange={(e) => setChatMsg(e.target.value)}
                        />
                      </label>

                      <label className="check-privacy">
                        <input
                          type="checkbox"
                          checked={chatPrivacyAccepted}
                          onChange={(e) => setChatPrivacyAccepted(e.target.checked)}
                        />
                        <span>ยอมรับนโยบายความเป็นส่วนตัว</span>
                      </label>

                      <button
                        type="submit"
                        className="btn-submit-lead"
                        disabled={submitting}
                      >
                        {submitting ? 'กำลังส่ง...' : 'เริ่มแชทกับทีมงาน →'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'lead' && (
                <div className="lead-tab-content">
                  <span className="lead-eyebrow">⚡ สนใจรถคันนี้?</span>
                  <h2 className="lead-title">ให้ทีมงานติดต่อกลับ</h2>
                  <p className="lead-sub">
                    กรอกข้อมูลสั้น ๆ ทีม CUBROD จะช่วยประสานและตอบคำถามให้คุณ
                  </p>

                  <form onSubmit={handleLeadSubmit} className="customer-form">
                    <label className="form-label-group">
                      <span className="field-label">
                        ชื่อ <span className="req-star">*</span>
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="ชื่อสำหรับติดต่อ"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                      />
                    </label>
                    <label className="form-label-group">
                      <span className="field-label">
                        เบอร์โทรศัพท์ <span className="req-star">*</span>
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                      />
                    </label>
                    <label className="form-label-group">
                      <span className="field-label">
                        LINE ID <span className="optional-text">(ไม่บังคับ)</span>
                      </span>
                      <input
                        type="text"
                        placeholder="LINE ID"
                        value={leadLine}
                        onChange={(e) => setLeadLine(e.target.value)}
                      />
                    </label>
                    <label className="form-label-group">
                      <span className="field-label">เวลาที่สะดวกให้ติดต่อ</span>
                      <div className="select-wrapper">
                        <select
                          value={leadContactTime}
                          onChange={(e) => setLeadContactTime(e.target.value)}
                        >
                          <option>09:00–12:00 น.</option>
                          <option>13:00–16:00 น.</option>
                          <option>16:00–19:00 น.</option>
                          <option>สะดวกตลอดวัน</option>
                        </select>
                        <span className="select-arrow">▼</span>
                      </div>
                    </label>

                    <label className="check-privacy">
                      <input
                        type="checkbox"
                        checked={leadPrivacyAccepted}
                        onChange={(e) => setLeadPrivacyAccepted(e.target.checked)}
                      />
                      <span>ยอมรับนโยบายความเป็นส่วนตัว</span>
                    </label>

                    <button
                      type="submit"
                      className="btn-submit-lead"
                      disabled={submitting}
                    >
                      {submitting ? 'กำลังส่ง...' : 'ขอให้ติดต่อกลับ →'}
                    </button>
                  </form>
                </div>
              )}

              {agentObj ? (
                <div className="lead-footer-attribution">
                  <span className="shield-icon">🛡️</span> ลิงก์แนะนำโดย <strong>{agentObj.name}</strong> · คุ้มครองสิทธิ์ 30 วัน
                </div>
              ) : (
                <div className="lead-footer-attribution">
                  <span className="shield-icon">🛡️</span> คุ้มครองสิทธิ์และบริการโดย <strong>CUBROD Official</strong>
                </div>
              )}
            </div>

            {/* Direct Contact Options */}
            <div className="direct-contact-card">
              <div className="direct-contact-header">
                <strong>สอบถามโดยตรงกับผู้ดูแล</strong>
                <small>ประสานงานและตอบคำถามอย่างรวดเร็ว</small>
              </div>
              <div className="direct-contact-actions">
                <a href="tel:0823456789" className="phone-contact">
                  <span className="icon-circle">📞</span>
                  <div>
                    <small>โทรสอบถาม</small>
                    <strong>082-345-6789</strong>
                  </div>
                </a>
                <a href="https://line.me" target="_blank" rel="noreferrer" className="line-contact">
                  <span className="icon-circle line">💬</span>
                  <div>
                    <small>สอบถามทาง LINE</small>
                    <strong>@cubrod</strong>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isZoomOpen && (
        <div className="lightbox-zoom-modal" onClick={() => setIsZoomOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar */}
            <div className="lightbox-toolbar">
              <div className="lightbox-title-info">
                <strong>{car.title}</strong>
                <span>รูปที่ {activeImgIndex + 1} จาก {images.length}</span>
              </div>
              <div className="lightbox-actions">
                <button type="button" onClick={handleZoomIn} title="ขยายรูป">
                  🔍+
                </button>
                <button type="button" onClick={handleZoomOut} title="ย่อรูป">
                  🔍-
                </button>
                <button type="button" onClick={() => setZoomScale(1)} title="ขนาดปกติ">
                  ⛶
                </button>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setIsZoomOpen(false)}
                  title="ปิดหน้าต่าง (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Zoom Stage */}
            <div className="lightbox-image-stage">
              <div className="lightbox-watermark-overlay">
                <span>CUBROD</span>
              </div>
              <img
                src={currentImg}
                alt={`${car.title} ขยายรูปขนาดใหญ่`}
                style={{ transform: `scale(${zoomScale})` }}
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-arrow lightbox-arrow-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  title="รูปก่อนหน้า (<-)"
                >
                  ❮
                </button>
                <button
                  type="button"
                  className="lightbox-arrow lightbox-arrow-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  title="รูปถัดไป (->)"
                >
                  ❯
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarDetailModal;
