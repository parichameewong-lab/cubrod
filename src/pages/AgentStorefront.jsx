import React, { useState } from 'react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import CarCard from '../components/car/CarCard';
import CarDetailModal from '../components/car/CarDetailModal';
import { formatNumber, getActivePublicCars } from '../utils/formatters';

export function AgentStorefront({
  agent,
  cars,
  onSelectCar,
  onBackHome,
  onLeadSubmitted,
  showToast,
}) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeCarModal, setActiveCarModal] = useState(null);

  const activeCars = getActivePublicCars(cars);
  const brands = Array.from(
    new Set(activeCars.map((c) => c.brand || c.title.split(' ')[0]))
  ).sort();

  const filteredCars = activeCars.filter((c) => {
    const brandMatch =
      !selectedBrand || (c.brand || c.title.split(' ')[0]) === selectedBrand;
    const priceMatch = !maxPrice || c.price <= Number(maxPrice);
    return brandMatch && priceMatch;
  });

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast('คัดลอกลิงก์หน้าร้านเรียบร้อย!');
  };

  return (
    <div className="public-page agent-storefront-page">
      {/* Top Bar / Navigation */}
      <header className="storefront-nav">
        <div className="container storefront-nav-inner">
          <button type="button" className="back-link" onClick={onBackHome}>
            ← กลับหน้าหลัก CUBROD
          </button>
          <div className="storefront-badge">
            <span className="dot">●</span> หน้าร้านนายหน้าพันธมิตร CUBROD
          </div>
        </div>
      </header>

      {/* Agent Hero Banner */}
      <section className="agent-hero-banner">
        <div className="container agent-hero-inner">
          <div className="agent-profile-header">
            <div className="agent-avatar-large">
              {agent?.name ? agent.name.charAt(0) : 'N'}
            </div>
            <div className="agent-meta">
              <div className="agent-tag-row">
                <span className="role-tag">นายหน้าทางการ (Official Agent)</span>
                <span className="verified-badge">✓ ยืนยันตัวตนแล้ว</span>
              </div>
              <h1>{agent?.name || 'นายหน้า CUBROD'}</h1>
              <p className="agent-code-text">
                รหัสนายหน้า: <strong>{agent?.code || 'CC-AGENT'}</strong> | จังหวัด:{' '}
                {agent?.province || 'เชียงใหม่'}
              </p>
              <p className="agent-bio">
                "ยินดีให้คำปรึกษาและช่วยดูแลเรื่องรถมือสองคัดเกรดคุณภาพ ประสานงานจัดไฟแนนซ์ นัดดูรถจริงได้ทุกวันครับ"
              </p>

              {/* Contact Actions */}
              <div className="agent-contact-actions">
                {agent?.phone && (
                  <a href={`tel:${agent.phone}`} className="contact-btn phone">
                    📞 โทร {agent.phone}
                  </a>
                )}
                {agent?.line && (
                  <a
                    href={`https://line.me/ti/p/~${agent.line}`}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-btn line"
                  >
                    💬 LINE: {agent.line}
                  </a>
                )}
                <button
                  type="button"
                  className="contact-btn share"
                  onClick={handleCopyLink}
                >
                  🔗 แชร์หน้าร้านนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storefront Car Catalog */}
      <section className="storefront-catalog container">
        <div className="catalog-header">
          <div>
            <h2>รถยนต์คัดพิเศษโดย {agent?.name || 'นายหน้า'}</h2>
            <p>รวมรถมือสองคุณภาพดี พร้อมบริการประสานงานนัดดูรถครบวงจร</p>
          </div>
          <div className="catalog-filters">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">ทุกยี่ห้อ</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              <option value="">ทุกช่วงราคา</option>
              <option value="300000">ไม่เกิน 300,000 บาท</option>
              <option value="500000">ไม่เกิน 500,000 บาท</option>
              <option value="700000">ไม่เกิน 700,000 บาท</option>
              <option value="1000000">ไม่เกิน 1,000,000 บาท</option>
            </select>
          </div>
        </div>

        {filteredCars.length > 0 ? (
          <div className="market-car-grid">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onSelect={(selected) => {
                  if (onSelectCar) {
                    onSelectCar(selected, agent?.code);
                  } else {
                    setActiveCarModal(selected);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-catalog">
            <p>ไม่พบรถยนต์ตามเงื่อนไขที่เลือก กรุณาลองเปลี่ยนการค้นหา</p>
          </div>
        )}
      </section>

      {/* Car Modal inside Storefront if needed */}
      {activeCarModal && (
        <CarDetailModal
          car={activeCarModal}
          agents={[agent]}
          attribution={agent?.code || 'PLATFORM'}
          onBack={() => setActiveCarModal(null)}
          onLead={(newLead) => {
            if (onLeadSubmitted) onLeadSubmitted(newLead);
            showToast('ส่งข้อมูลแล้ว นายหน้าและทีมงานจะติดต่อกลับโดยเร็ว');
            setActiveCarModal(null);
          }}
        />
      )}

      {/* Trust Footer */}
      <Footer />
    </div>
  );
}

export default AgentStorefront;
