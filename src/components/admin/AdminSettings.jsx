import React, { useState } from 'react';
import { CAR_FEATURE_CATEGORIES, DEFAULT_CAR_FEATURES } from '../../data/carFeatures';
import { getCloudinaryConfig, saveCloudinaryConfig } from '../../services/mediaUpload';
import { dbUpsertCarFeature, dbDeleteCarFeature } from '../../services/db';

export function AdminSettings({ carFeatures, setCarFeatures, showToast }) {
  const [firstTouchDays, setFirstTouchDays] = useState(30);
  const [defaultAgentShare, setDefaultAgentShare] = useState(70);
  const [enableOtp, setEnableOtp] = useState(false);
  const [enableLeaderboard, setEnableLeaderboard] = useState(false);

  // Cloudinary Configuration State
  const initialCloud = getCloudinaryConfig();
  const [cloudName, setCloudName] = useState(initialCloud.cloudName);
  const [uploadPreset, setUploadPreset] = useState(initialCloud.uploadPreset);
  const [cloudSaved, setCloudSaved] = useState(initialCloud.isConfigured);

  // Admin Car Features Management State
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [featureSearch, setFeatureSearch] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState('comfort');
  const [newFeatureIcon, setNewFeatureIcon] = useState('✨');

  const currentFeatures = Array.isArray(carFeatures) && carFeatures.length > 0
    ? carFeatures
    : DEFAULT_CAR_FEATURES;

  const quickIcons = ['✨', '🛡️', '💺', '🪟', '❄️', '📺', '📻', '📱', '📷', '🔘', '🔑', '🏎️', '🚘', '🛞', '🔧', '⚡', '💡', '🛑', '☀️'];

  const handleSaveCloudinary = (e) => {
    e.preventDefault();
    saveCloudinaryConfig(cloudName, uploadPreset);
    setCloudSaved(Boolean(cloudName.trim() && uploadPreset.trim()));
    if (cloudName.trim() && uploadPreset.trim()) {
      showToast('บันทึกการเชื่อมต่อ Cloudinary CDN เรียบร้อยแล้ว');
    } else {
      showToast('ล้างค่า Cloudinary แล้ว (ใช้โหมดบีบอัด WebP อัตโนมัติ)');
    }
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();
    const trimmed = newFeatureName.trim();
    if (!trimmed) {
      return showToast('กรุณาระบุชื่อออฟชั่น');
    }
    const exists = currentFeatures.some(
      (f) => f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      return showToast(`ออฟชั่น "${trimmed}" มีอยู่ในระบบแล้ว`);
    }

    const newOption = {
      name: trimmed,
      category: newFeatureCategory,
      icon: newFeatureIcon || '✓',
    };

    const updated = [...currentFeatures, newOption];
    setCarFeatures(updated);
    setNewFeatureName('');
    await dbUpsertCarFeature(newOption);
    showToast(`เพิ่มออฟชั่น "${trimmed}" เข้าสู่ระบบกลางเรียบร้อยแล้ว`);
  };

  const handleDeleteFeature = async (featureName) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบออฟชั่น "${featureName}" ออกจากระบบ?`)) {
      return;
    }
    const updated = currentFeatures.filter((f) => f.name !== featureName);
    setCarFeatures(updated);
    await dbDeleteCarFeature(featureName);
    showToast(`ลบออฟชั่น "${featureName}" เรียบร้อยแล้ว`);
  };

  const handleResetFeatures = () => {
    if (!window.confirm('คุณต้องการรีเซ็ตรายการออฟชั่นทั้งหมดกลับเป็นค่าเริ่มต้นของระบบใช่หรือไม่?')) {
      return;
    }
    setCarFeatures(DEFAULT_CAR_FEATURES);
    showToast('รีเซ็ตรายการออฟชั่นเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
  };

  const filteredFeatures = currentFeatures.filter((f) => {
    const matchCat = selectedCatFilter === 'all' || f.category === selectedCatFilter;
    const matchSearch = !featureSearch || f.name.toLowerCase().includes(featureSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div className="page-title">
        <div>
          <h1>ตั้งค่าระบบ</h1>
          <p>กำหนดส่วนแบ่งค่าคอมมิชชัน พื้นที่เก็บรูปภาพ Cloudinary และจัดการออฟชั่นมาตรฐานของรถ</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* SECTION 1: COMMISSIONS & RULES */}
        <section className="panel">
          <h2>กฎรายได้และส่วนแบ่ง</h2>
          
          <label>
            <span>ระยะเวลา First-touch คุ้มครองนายหน้า</span>
            <input
              type="number"
              value={firstTouchDays}
              onChange={(e) => setFirstTouchDays(Number(e.target.value))}
            />
            <span>วัน</span>
          </label>

          <label>
            <span>ส่วนแบ่งค่าคอมมิชชันนายหน้า (ค่ากลาง)</span>
            <input
              type="number"
              value={defaultAgentShare}
              onChange={(e) => setDefaultAgentShare(Number(e.target.value))}
            />
            <span>%</span>
          </label>

          <p className="hint" style={{ marginTop: '14px' }}>
            * เมื่อ Advertiser ลงประกาศและเสนอค่าคอมมิชชันรวม แพลตฟอร์มจะคำนวณส่วนแบ่งให้นายหน้าอัตโนมัติตาม % ค่ากลางนี้
          </p>

          <button
            type="button"
            className="button"
            style={{ marginTop: '18px' }}
            onClick={() => showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว')}
          >
            บันทึกการตั้งค่า
          </button>
        </section>

        {/* SECTION 2: CLOUDINARY IMAGE STORAGE SETUP */}
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <h2>☁️ พื้นที่เก็บรูปภาพ (Cloudinary Free 25GB)</h2>
            <span className={`badge ${cloudSaved ? 'success' : 'warning'}`}>
              {cloudSaved ? 'เชื่อมต่อแล้ว' : 'โหมด WebP อัตโนมัติ'}
            </span>
          </div>

          <form onSubmit={handleSaveCloudinary} style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
            <label style={{ display: 'grid', gap: '4px' }}>
              <span>Cloudinary Cloud Name</span>
              <input
                type="text"
                placeholder="เช่น dxyz12345"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
              />
            </label>

            <label style={{ display: 'grid', gap: '4px' }}>
              <span>Upload Preset (โหมด Unsigned)</span>
              <input
                type="text"
                placeholder="เช่น clubrod_unsigned"
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
              />
            </label>

            <p className="hint" style={{ margin: 0 }}>
              * ระบบบีบอัดรูปเป็น WebP อัตโนมัติทุกครั้งก่อนอัปโหลด ช่วยให้โควตาฟรี 25 GB เก็บรูปรถได้หลายหมื่นรูปโดยไม่กระทบฐานข้อมูล kaitong
            </p>

            <button type="submit" className="button">
              บันทึกตั้งค่า Cloudinary
            </button>
          </form>
        </section>
      </div>

      {/* SECTION 3: MASTER CAR FEATURES & OPTIONS MANAGER (Admin Only) */}
      <section className="panel standalone" style={{ marginTop: '24px' }}>
        <div className="panel-title" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>🛠️ จัดการออฟชั่นและคุณสมบัติรถยนต์ส่วนกลาง</h2>
              <span className="badge platform">เฉพาะแอดมิน</span>
            </div>
            <p>
              จัดการรายการออฟชั่นมาตรฐานที่ผู้ลงประกาศ (Advertiser) สามารถเลือกได้ในขั้นตอนการลงขายรถ
            </p>
          </div>
          <button
            type="button"
            className="button small secondary"
            onClick={handleResetFeatures}
            title="รีเซ็ตกลับเป็นรายการเริ่มต้นของระบบ"
          >
            ↺ รีเซ็ตเป็นค่าเริ่มต้น
          </button>
        </div>

        {/* ADD NEW OPTION FORM */}
        <form onSubmit={handleAddFeature} className="admin-add-feature-box">
          <div className="add-feature-header">
            <strong>+ เพิ่มออฟชั่นใหม่เข้าสู่ระบบ</strong>
            <small>ออฟชั่นที่เพิ่มจะถูกบันทึกลงฐานข้อมูลและปรากฏให้ผู้ลงขายรถทุกคนเลือกได้ทันที</small>
          </div>

          <div className="add-feature-form-row">
            <div className="form-field-group" style={{ flex: 2 }}>
              <label>ชื่อออฟชั่น / คุณสมบัติ *</label>
              <input
                type="text"
                required
                placeholder="เช่น เบาะนวดไฟฟ้า, กล้องบันทึกหน้า-หลัง, จอเพดาน..."
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
              />
            </div>

            <div className="form-field-group" style={{ flex: 1.5 }}>
              <label>หมวดหมู่ *</label>
              <select
                value={newFeatureCategory}
                onChange={(e) => setNewFeatureCategory(e.target.value)}
              >
                {CAR_FEATURE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group" style={{ flex: 1 }}>
              <label>ไอคอนสัญลักษณ์</label>
              <div className="icon-selector-input-wrap">
                <input
                  type="text"
                  maxLength={4}
                  style={{ width: '60px', textAlign: 'center', fontSize: '18px' }}
                  value={newFeatureIcon}
                  onChange={(e) => setNewFeatureIcon(e.target.value)}
                />
                <div className="quick-icons-list">
                  {quickIcons.slice(0, 7).map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      className={`quick-ic-btn ${newFeatureIcon === ic ? 'active' : ''}`}
                      onClick={() => setNewFeatureIcon(ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-field-group" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="button primary-orange" style={{ height: '42px' }}>
                + เพิ่มออฟชั่น
              </button>
            </div>
          </div>
        </form>

        {/* LIST & FILTER OF CURRENT OPTIONS */}
        <div className="admin-feature-list-wrapper">
          <div className="admin-feature-toolbar">
            <div className="feature-categories-pills">
              {CAR_FEATURE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-pill-btn ${selectedCatFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCatFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="admin-feature-search-right">
              <input
                type="text"
                className="admin-search-input"
                placeholder="ค้นหาออฟชั่นในระบบ..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
              />
              <span className="feature-count-text">
                ทั้งหมด <strong>{filteredFeatures.length}</strong> รายการ
              </span>
            </div>
          </div>

          <div className="admin-features-table-grid">
            {filteredFeatures.map((feat) => {
              const catObj = CAR_FEATURE_CATEGORIES.find((c) => c.id === feat.category);
              return (
                <div key={feat.name} className="admin-feature-item-card">
                  <div className="feature-item-info">
                    <span className="feature-item-icon">{feat.icon || '✓'}</span>
                    <div>
                      <strong className="feature-item-name">{feat.name}</strong>
                      <small className="feature-item-cat">{catObj?.label || feat.category}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="feature-delete-btn"
                    title={`ลบ "${feat.name}"`}
                    onClick={() => handleDeleteFeature(feat.name)}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}

            {filteredFeatures.length === 0 && (
              <div className="empty-cell" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                ไม่พบออฟชั่นตามคำค้นหา
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default AdminSettings;
