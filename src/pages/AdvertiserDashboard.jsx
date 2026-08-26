import React, { useState } from 'react';
import AppShell from '../layouts/AppShell';
import StatCard from '../components/common/StatCard';
import AdvertiserInventory from '../components/car/AdvertiserInventory';
import StorefrontImageUpload from '../components/common/StorefrontImageUpload';

export function AdvertiserDashboard({
  advertiser,
  onUpdate,
  cars,
  setCars,
  carFeatures,
  tab,
  setTab,
  onLogout,
  showToast,
}) {
  const [storeImage, setStoreImage] = useState(advertiser.storefrontImageUrl || '');

  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: '⌂' },
    { id: 'inventory', label: 'รถของฉัน', icon: '▣' },
    { id: 'store', label: 'หน้าร้าน', icon: '◇' },
    { id: 'profile', label: 'บัญชีร้าน', icon: '○' },
  ];

  const myCars = cars.filter((c) => c.advertiserId === advertiser.id);
  const activeCarsCount = myCars.filter((c) => c.status === 'active').length;
  const pausedCarsCount = myCars.filter((c) => c.status === 'paused').length;

  // 1. PENDING STATE (เมื่อบัญชีร้านรอแอดมินอนุมัติ)
  if (advertiser.status === 'pending') {
    return (
      <AppShell
        role="Advertiser · รออนุมัติ"
        name={advertiser.storeName}
        tabs={tabs}
        activeTab={tab}
        onTab={setTab}
        onLogout={onLogout}
      >
        <div className="pending-page">
          <div className="pending-icon">⌛</div>
          <span className="eyebrow">ตรวจสอบร้านค้า</span>
          <h1>กำลังตรวจสอบใบสมัครของคุณ</h1>
          <p>เมื่อแอดมินอนุมัติแล้ว คุณจะสร้างหน้าร้านและลงประกาศรถได้</p>
          <div className="application-card">
            <div>
              <span>ชื่อร้าน</span>
              <strong>{advertiser.storeName}</strong>
            </div>
            <div>
              <span>จังหวัด</span>
              <strong>{advertiser.province}</strong>
            </div>
            <div>
              <span>สถานะ</span>
              <b className="badge warning">รออนุมัติ</b>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // 2. APPROVED STATE (เมื่ออนุมัติแล้ว)
  return (
    <AppShell
      role="Advertiser"
      name={advertiser.storeName}
      tabs={tabs}
      activeTab={tab}
      onTab={setTab}
      onLogout={onLogout}
    >
      <div className="dashboard-content">
        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="welcome-row">
              <div>
                <span>ศูนย์จัดการหน้าร้าน</span>
                <h1>สวัสดีครับ {advertiser.storeName}</h1>
                <p>ดูแลรถและข้อมูลหน้าร้านของคุณได้จากที่นี่</p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setTab('inventory')}
              >
                + เพิ่มรถใหม่
              </button>
            </div>

            <div className="stats-grid three">
              <StatCard
                label="รถทั้งหมด"
                value={String(myCars.length)}
                note="เฉพาะรถของร้านคุณ"
                icon="▣"
              />
              <StatCard
                label="กำลังขาย"
                value={String(activeCarsCount)}
                note="แสดงบนแพลตฟอร์ม"
                icon="✓"
              />
              <StatCard
                label="ปิดประกาศ"
                value={String(pausedCarsCount)}
                note="แก้ไขและเปิดใหม่ได้"
                icon="◼"
                orange
              />
            </div>

            <section className="panel standalone advertiser-welcome">
              <div>
                <span className="eyebrow orange">สิทธิ์ Advertiser</span>
                <h2>คุณควบคุมข้อมูลรถและหน้าร้านของตัวเอง</h2>
                <p>
                  ระบุค่าคอมรวมที่เสนอให้แพลตฟอร์มได้
                  ส่วนการแบ่งค่าคอมระหว่างแพลตฟอร์มกับนายหน้าจะถูกกำหนดและเก็บเป็นความลับโดยแพลตฟอร์ม
                </p>
              </div>
            </section>
          </>
        )}

        {/* TAB 2: INVENTORY (รถของฉัน) */}
        {tab === 'inventory' && (
          <AdvertiserInventory
            advertiser={advertiser}
            cars={cars}
            setCars={setCars}
            carFeatures={carFeatures}
            showToast={showToast}
          />
        )}

        {/* TAB 3: STORE (จัดการหน้าร้าน) */}
        {tab === 'store' && (
          <>
            <div className="page-title">
              <div>
                <h1>จัดการหน้าร้าน</h1>
                <p>ข้อมูลนี้จะแสดงกับลูกค้าที่ดูรถของร้านคุณ</p>
              </div>
            </div>
            <section className="panel">
              <div className="profile-fields">
                <StorefrontImageUpload
                  image={storeImage}
                  onChange={setStoreImage}
                  showToast={showToast}
                />
                <label>
                  <span>ชื่อหน้าร้าน</span>
                  <input defaultValue={advertiser.storeName} />
                </label>
                <label>
                  <span>จังหวัด</span>
                  <input defaultValue={advertiser.province} />
                </label>
                <label className="full-field">
                  <span>ที่อยู่หน้าร้าน</span>
                  <textarea rows={3} defaultValue={advertiser.address || 'ถนนซุปเปอร์ไฮเวย์ อำเภอเมือง'} />
                </label>
                <label>
                  <span>เบอร์โทร</span>
                  <input defaultValue={advertiser.phone} />
                </label>
                <label>
                  <span>LINE ID</span>
                  <input defaultValue={advertiser.line || ''} />
                </label>
                <label className="full-field">
                  <span>คำแนะนำร้าน</span>
                  <textarea
                    rows={4}
                    defaultValue="รถมือสองคัดสภาพ พร้อมให้คำแนะนำและนัดหมายดูรถ"
                  />
                </label>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => {
                  onUpdate({ ...advertiser, storefrontImageUrl: storeImage });
                  showToast('บันทึกข้อมูลหน้าร้านและรูปหน้าร้านแล้ว');
                }}
              >
                บันทึกหน้าร้าน
              </button>
            </section>
          </>
        )}

        {/* TAB 4: PROFILE (บัญชีร้านค้า) */}
        {tab === 'profile' && (
          <>
            <div className="page-title">
              <div>
                <h1>บัญชีร้านค้า</h1>
                <p>ข้อมูลเจ้าของบัญชีและสถานะการอนุมัติ</p>
              </div>
            </div>
            <section className="panel">
              <div className="application-card">
                <div>
                  <span>ผู้ติดต่อ</span>
                  <strong>{advertiser.ownerName}</strong>
                </div>
                <div>
                  <span>เบอร์โทร</span>
                  <strong>{advertiser.phone}</strong>
                </div>
                <div>
                  <span>สถานะ</span>
                  <b className="badge success">อนุมัติแล้ว</b>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default AdvertiserDashboard;
