import React, { useState } from 'react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import CarCard from '../components/car/CarCard';
import IconBox from '../components/common/IconBox';
import { formatNumber, getActivePublicCars, getBestPriceCars } from '../utils/formatters';

export function Home({ cars, onRegister, onAdvertiserRegister, onLogin, onMobileLogin, onSelect }) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState('');
  const [selectedMaxInstallment, setSelectedMaxInstallment] = useState('');
  const [expandSearch, setExpandSearch] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [featuredIdx, setFeaturedIdx] = useState(0);

  const activeFilterCount = [
    selectedBrand,
    selectedModel,
    selectedType,
    selectedYear,
    selectedProvince,
    selectedMaxPrice,
    selectedMaxInstallment,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedType('');
    setSelectedYear('');
    setSelectedProvince('');
    setSelectedMaxPrice('');
    setSelectedMaxInstallment('');
  };

  const getUniqueSorted = (arr) =>
    Array.from(new Set(arr.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'th'));

  const brands = getUniqueSorted(cars.map((c) => c.brand || c.title.split(' ')[0]));
  const models = getUniqueSorted(
    cars
      .filter((c) => !selectedBrand || (c.brand || c.title.split(' ')[0]) === selectedBrand)
      .map((c) => c.model || c.title.split(' ')[1])
  );
  const types = getUniqueSorted(cars.map((c) => c.vehicleType || 'ไม่ระบุประเภท'));
  const years = getUniqueSorted(cars.map((c) => c.year)).reverse();
  const provinces = getUniqueSorted(cars.map((c) => c.province || 'ไม่ระบุจังหวัด'));

  const activeCars = getActivePublicCars(cars);
  const bestPriceCars = getBestPriceCars(cars);
  const manualFeatured = activeCars.filter((c) => c.featuredManual);
  const featuredList = bestPriceCars.length ? bestPriceCars : manualFeatured;

  const currentFeatured = featuredList[featuredIdx % Math.max(featuredList.length, 1)] || activeCars[0];

  const filteredCars = activeCars.filter((c) => {
    const brandMatch = !selectedBrand || (c.brand || c.title.split(' ')[0]) === selectedBrand;
    const modelMatch = !selectedModel || (c.model || c.title.split(' ')[1]) === selectedModel;
    const typeMatch =
      !selectedType ||
      (activeFilter !== 'all' ? c.vehicleType?.includes(activeFilter) : true) &&
        (c.vehicleType || 'ไม่ระบุประเภท') === (selectedType || c.vehicleType);
    const yearMatch = !selectedYear || c.year === selectedYear;
    const provinceMatch = !selectedProvince || (c.province || 'ไม่ระบุจังหวัด') === selectedProvince;
    const priceMatch = !selectedMaxPrice || c.price <= Number(selectedMaxPrice);
    const installmentMatch =
      !selectedMaxInstallment ||
      (!!c.monthlyPayment && Number(c.monthlyPayment) <= Number(selectedMaxInstallment));

    const categoryFilterMatch =
      activeFilter === 'all' ||
      (activeFilter === 'เก๋ง' && c.vehicleType?.includes('เก๋ง')) ||
      (activeFilter === 'แฮทช์แบ็ก' && c.vehicleType?.includes('แฮทช์แบ็ก')) ||
      (activeFilter === 'SUV' && c.vehicleType?.includes('SUV'));

    return (
      brandMatch &&
      modelMatch &&
      typeMatch &&
      yearMatch &&
      provinceMatch &&
      priceMatch &&
      installmentMatch &&
      categoryFilterMatch
    );
  });

  return (
    <div className="public-page market-page">
      <Header
        onRegister={onRegister}
        onAdvertiserRegister={onAdvertiserRegister}
        onLogin={onLogin}
        onMobileLogin={onMobileLogin}
      />

      {/* Market Hero Section */}
      <section className="market-hero">
        <div className="container market-hero-inner">
          <div className="market-copy">
            <div className="eyebrow light">
              <span>●</span> CUBROD SELECTED CARS
            </div>
            <h1>
              รถมือสองคัดคุณภาพ
              <br />
              <span>เลือกง่าย มั่นใจกว่า</span>
            </h1>
            <p>
              ค้นหารถที่เหมาะกับคุณ พร้อมทีม CUBROD ช่วยตรวจสอบข้อมูล ประสานนัดดูรถ
              และดูแลทุกขั้นตอนก่อนตัดสินใจ
            </p>

            {/* Search Panel */}
            <div className={`market-search-panel ${expandSearch ? 'expanded' : 'collapsed'}`} aria-label="ค้นหารถ">
              <div className="market-search-heading">
                <div className="search-heading-left">
                  <div className="search-icon-circle">🔍</div>
                  <div className="search-title-group">
                    <strong>ค้นหารถที่ใช่สำหรับคุณ</strong>
                    <small>
                      {expandSearch
                        ? 'เลือกเงื่อนไขเพิ่มเติมได้จากแถวที่สอง'
                        : activeFilterCount > 0
                        ? `เลือกตัวกรองอยู่ (${activeFilterCount} รายการ)`
                        : 'คลิกเพื่อเปิดตัวเลือกค้นหาแบบละเอียด'}
                    </small>
                  </div>
                </div>

                <div className="search-heading-actions">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      className="reset-filters-btn"
                      onClick={handleResetFilters}
                      title="ล้างตัวกรองทั้งหมด"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                  <button
                    type="button"
                    className="search-expand-button"
                    aria-expanded={expandSearch}
                    aria-label="ซ่อนหรือแสดงตัวเลือกค้นหา"
                    onClick={() => setExpandSearch(!expandSearch)}
                  >
                    {expandSearch ? 'ซ่อน ▲' : 'แสดงตัวกรอง ▼'}
                  </button>
                </div>
              </div>

              {/* Active Filter Chips Preview when Collapsed */}
              {!expandSearch && activeFilterCount > 0 && (
                <div className="active-filters-chips-row">
                  {selectedBrand && <span className="active-filter-chip">ยี่ห้อ: {selectedBrand}</span>}
                  {selectedModel && <span className="active-filter-chip">รุ่น: {selectedModel}</span>}
                  {selectedYear && <span className="active-filter-chip">ปี: {selectedYear}</span>}
                  {selectedType && <span className="active-filter-chip">ประเภท: {selectedType}</span>}
                  {selectedProvince && <span className="active-filter-chip">จังหวัด: {selectedProvince}</span>}
                  {selectedMaxPrice && <span className="active-filter-chip">ไม่เกิน ฿{formatNumber(selectedMaxPrice)}</span>}
                  {selectedMaxInstallment && <span className="active-filter-chip">ผ่อน ≤ ฿{formatNumber(selectedMaxInstallment)}</span>}
                </div>
              )}

              {expandSearch && (
                <div className="search-fields-container">
                  {/* Row 1: Brand, Model, Year */}
                  <div className="search-row-grid primary-row">
                    <div className="filter-field-group">
                      <label className="field-label">ยี่ห้อรถ</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedBrand}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value);
                            setSelectedModel('');
                          }}
                        >
                          <option value="">ทุกยี่ห้อ</option>
                          {brands.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-field-group">
                      <label className="field-label">รุ่นรถ</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          <option value="">ทุกรุ่น</option>
                          {models.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-field-group">
                      <label className="field-label">ปีรถ</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          <option value="">ทุกปี</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              ปี {y}
                            </option>
                          ))}
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Type, Province, Max Price, Installment, Submit */}
                  <div className="search-row-grid secondary-row">
                    <div className="filter-field-group">
                      <label className="field-label">ประเภทรถ</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          <option value="">ทุกประเภท</option>
                          {types.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-field-group">
                      <label className="field-label">จังหวัด</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                        >
                          <option value="">ทุกจังหวัด</option>
                          {provinces.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-field-group">
                      <label className="field-label">ราคาไม่เกิน</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedMaxPrice}
                          onChange={(e) => setSelectedMaxPrice(e.target.value)}
                        >
                          <option value="">ทุกราคา</option>
                          <option value="300000">300,000 บาท</option>
                          <option value="400000">400,000 บาท</option>
                          <option value="500000">500,000 บาท</option>
                          <option value="700000">700,000 บาท</option>
                          <option value="1000000">1,000,000 บาท</option>
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-field-group">
                      <label className="field-label">ผ่อนต่อเดือนไม่เกิน</label>
                      <div className="select-input-wrapper">
                        <select
                          value={selectedMaxInstallment}
                          onChange={(e) => setSelectedMaxInstallment(e.target.value)}
                        >
                          <option value="">ทุกเรทผ่อน</option>
                          <option value="6000">6,000 บาท</option>
                          <option value="8000">8,000 บาท</option>
                          <option value="10000">10,000 บาท</option>
                          <option value="15000">15,000 บาท</option>
                          <option value="20000">20,000 บาท</option>
                        </select>
                        <span className="custom-select-arrow">▼</span>
                      </div>
                    </div>

                    <div className="filter-submit-group">
                      <a className="market-search-submit" href="#cars">
                        ดูรถที่ค้นหา <b>→</b>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Featured Car Card */}
          {currentFeatured && (
            <div
              className="market-feature-card clickable"
              aria-live="polite"
              onClick={() => onSelect(currentFeatured)}
            >
              <span className="selection-chip">CUBROD CHOICE</span>
              <div className="market-car-art" style={{ background: currentFeatured.tone }}>
                <strong>{currentFeatured.brand?.toUpperCase()}</strong>
                <i />
              </div>
              <div className="market-feature-footer">
                <div>
                  <small>รถเด่นประจำสัปดาห์</small>
                  <strong>{currentFeatured.title}</strong>
                  <span>รถที่แอดมินแพลตฟอร์มคัดเลือกสำหรับสไลด์นี้</span>
                </div>
                <b>฿{formatNumber(currentFeatured.price)}</b>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Buyer Trust Badges */}
      <section className="buyer-trust">
        <div className="container">
          <div>
            <IconBox>✓</IconBox>
            <span>
              <strong>รถคัดสภาพ</strong>
              <small>ตรวจสอบข้อมูลก่อนลงขาย</small>
            </span>
          </div>
          <div>
            <IconBox>⌂</IconBox>
            <span>
              <strong>นัดดูรถได้</strong>
              <small>ทีมงานช่วยประสานเจ้าของรถ</small>
            </span>
          </div>
          <div>
            <IconBox>☎</IconBox>
            <span>
              <strong>มีผู้ช่วยดูแล</strong>
              <small>สอบถามข้อมูลก่อนตัดสินใจ</small>
            </span>
          </div>
          <div>
            <IconBox>◇</IconBox>
            <span>
              <strong>บริการทั่วประเทศ</strong>
              <small>เลือกรถได้จากหลายพื้นที่</small>
            </span>
          </div>
        </div>
      </section>

      {/* Car Listing Section */}
      <section id="cars" className="market-listing container">
        <div className="market-title">
          <div>
            <span>รถพร้อมขาย</span>
            <h2>รถมือสองแนะนำ</h2>
            <p>เลือกรถที่สนใจ แล้วส่งข้อมูลให้ทีมงานติดต่อกลับ</p>
          </div>
          <div className="market-filter">
            {['all', 'เก๋ง', 'แฮทช์แบ็ก', 'SUV'].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? 'active' : ''}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'รถทั้งหมด' : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="market-car-grid">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} onSelect={onSelect} />
          ))}
        </div>
      </section>

      {/* Buying Steps Section */}
      <section id="buying" className="buying-steps">
        <div className="container">
          <div className="section-heading">
            <span>ซื้อรถกับ CUBROD</span>
            <h2>ง่ายและมีทีมงานช่วยดูแล</h2>
          </div>
          <div className="steps">
            <article>
              <IconBox>01</IconBox>
              <h3>เลือกรถที่สนใจ</h3>
              <p>ดูราคาและรายละเอียดรถจากหน้ารวมรถได้ทันที</p>
            </article>
            <article>
              <IconBox>02</IconBox>
              <h3>ส่งข้อมูลติดต่อ</h3>
              <p>กรอกชื่อและเบอร์โทร ทีมงานจะติดต่อกลับตามเวลาที่เลือก</p>
            </article>
            <article>
              <IconBox>03</IconBox>
              <h3>นัดดูและตัดสินใจ</h3>
              <p>ทีม CUBROD ช่วยประสานนัดหมายและให้ข้อมูลก่อนซื้อ</p>
            </article>
          </div>
        </div>
      </section>

      <Footer
        onRegister={onRegister}
        onAdvertiserRegister={onAdvertiserRegister}
        onLogin={onLogin}
      />
    </div>
  );
}

export default Home;
