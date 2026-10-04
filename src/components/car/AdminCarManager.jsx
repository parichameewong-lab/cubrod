import React, { useState } from 'react';
import { formatNumber, generateId } from '../../utils/formatters';
import CarEditorForm from './CarEditorForm';
import { dbUpsertCar, dbDeleteCar } from '../../services/db';

export function AdminCarManager({ cars, setCars, advertisers, carFeatures, showToast }) {
  const [editingCar, setEditingCar] = useState(null);

  const toggleVisibility = async (carId) => {
    const target = cars.find((c) => c.id === carId);
    if (!target) return;
    const updated = {
      ...target,
      publicVisible: target.publicVisible === false ? true : false,
      moderationStatus: target.publicVisible === false ? 'approved' : 'hidden',
    };
    setCars((prev) => prev.map((c) => (c.id === carId ? updated : c)));
    await dbUpsertCar(updated);
    showToast('อัปเดตสถานะการมองเห็นเรียบร้อยแล้ว');
  };

  const toggleFeatured = async (carId) => {
    const target = cars.find((c) => c.id === carId);
    if (!target) return;
    const updated = {
      ...target,
      featuredManual: !target.featuredManual,
      isCubrodChoice: !target.featuredManual,
      isClubrodChoice: !target.featuredManual,
    };
    setCars((prev) => prev.map((c) => (c.id === carId ? updated : c)));
    await dbUpsertCar(updated);
    showToast('อัปเดตสถานะ CUBROD CHOICE แล้ว');
  };

  const handleCreateNew = () => {
    setEditingCar({
      id: `car-${generateId()}`,
      title: '',
      vehicleType: 'รถเก๋ง',
      brand: '',
      model: '',
      province: 'กรุงเทพมหานคร',
      year: String(new Date().getFullYear()),
      price: 0,
      totalCommission: 10000,
      agentPercent: 70,
      sourceUrl: '',
      status: 'active',
      publicVisible: true,
      affiliateEnabled: true,
      description: '',
      monthlyPayment: 0,
      advertiserId: 'admin',
      imageUrls: [],
    });
  };

  const handleSaveCar = async (updatedCar) => {
    setCars((prev) => {
      const exists = prev.some((c) => c.id === updatedCar.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedCar.id ? updatedCar : c));
      }
      return [updatedCar, ...prev];
    });

    await dbUpsertCar(updatedCar);
    showToast('บันทึกข้อมูลรถยนต์เรียบร้อยแล้ว');
    setEditingCar(null);
  };

  return (
    <>
      <div className="page-title header-action-row">
        <div>
          <h1>จัดการประกาศรถยนต์ทั้งหมด</h1>
          <p>อนุมัติ ซ่อน หรือเลือกตั้งค่าเป็นรถเด่นประจำสัปดาห์ (CUBROD CHOICE)</p>
        </div>
        {!editingCar && (
          <button type="button" className="button" onClick={handleCreateNew}>
            + สร้างประกาศรถใหม่
          </button>
        )}
      </div>

      {editingCar ? (
        <CarEditorForm
          car={editingCar}
          storeName="CUBROD Admin Central"
          carFeatures={carFeatures}
          onSave={handleSaveCar}
          onCancel={() => setEditingCar(null)}
          showToast={showToast}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>รายการรถ</th>
                <th>เต็นท์รถ/ผู้ขาย</th>
                <th>ราคา</th>
                <th>ค่าคอมฯ รวม</th>
                <th>CUBROD CHOICE</th>
                <th>สถานะมองเห็น</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const dealer = advertisers.find((a) => a.id === car.advertiserId);
                const isVisible = car.publicVisible !== false && car.moderationStatus !== 'hidden';
                return (
                  <tr key={car.id}>
                    <td>
                      <strong>{car.title}</strong>
                      <small>ปี {car.year} · {car.province}</small>
                    </td>
                    <td>{dealer?.storeName || 'ส่วนกลาง'}</td>
                    <td>฿{formatNumber(car.price)}</td>
                    <td>฿{formatNumber(car.totalCommission)}</td>
                    <td>
                      <button
                        type="button"
                        className={`button small ${car.featuredManual ? 'warning' : 'secondary'}`}
                        onClick={() => toggleFeatured(car.id)}
                      >
                        {car.featuredManual ? '★ รถเด่น' : '☆ ทั่วไป'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`button small ${isVisible ? 'secondary' : 'danger'}`}
                        onClick={() => toggleVisibility(car.id)}
                      >
                        {isVisible ? 'แสดงผล' : 'ซ่อนอยู่'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button small secondary"
                        onClick={() => setEditingCar(car)}
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdminCarManager;
