import React, { useState } from 'react';
import { formatNumber, generateId } from '../../utils/formatters';
import CarEditorForm from './CarEditorForm';

export function AdvertiserInventory({ advertiser, cars, setCars, carFeatures, showToast }) {
  const [editingCar, setEditingCar] = useState(null);

  const myCars = cars.filter((c) => c.advertiserId === advertiser.id);

  const handleCreateNew = () => {
    setEditingCar({
      id: `car-${generateId()}`,
      title: '',
      vehicleType: 'รถเก๋ง',
      brand: '',
      model: '',
      province: advertiser.province || 'กรุงเทพมหานคร',
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
      advertiserId: advertiser.id,
      imageUrls: [],
    });
  };

  const handleSaveCar = (updatedCar) => {
    setCars((prev) => {
      const exists = prev.some((c) => c.id === updatedCar.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedCar.id ? updatedCar : c));
      }
      return [updatedCar, ...prev];
    });

    showToast('บันทึกประกาศรถยนต์เรียบร้อยแล้ว');
    setEditingCar(null);
  };

  return (
    <>
      <div className="page-title header-action-row">
        <div>
          <h1>จัดการรายการรถมือสอง</h1>
          <p>เพิ่ม แก้ไข หรือปิดประกาศรถของเต็นท์รถคุณ ({myCars.length} คัน)</p>
        </div>
        {!editingCar && (
          <button type="button" className="button" onClick={handleCreateNew}>
            + เพิ่มประกาศรถใหม่
          </button>
        )}
      </div>

      {editingCar ? (
        <CarEditorForm
          car={editingCar}
          storeName={advertiser.storeName}
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
                <th>รถยนต์</th>
                <th>ปี</th>
                <th>ราคาขาย</th>
                <th>ผ่อน/เดือน</th>
                <th>ค่าคอมมิชชัน</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {myCars.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    ยังไม่มีประกาศรถของคุณ กด "+ เพิ่มประกาศรถใหม่" เพื่อเริ่มลงขาย
                  </td>
                </tr>
              ) : (
                myCars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <strong>{car.title}</strong>
                      <small>{car.brand} {car.model}</small>
                    </td>
                    <td>{car.year}</td>
                    <td>฿{formatNumber(car.price)}</td>
                    <td>฿{formatNumber(car.monthlyPayment)}</td>
                    <td>฿{formatNumber(car.totalCommission)}</td>
                    <td>
                      <span className={`status-badge ${car.status === 'active' ? 'active' : 'paused'}`}>
                        {car.status === 'active' ? 'กำลังขาย' : 'ปิดประกาศ'}
                      </span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default AdvertiserInventory;
