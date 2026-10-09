import React from 'react';
import { formatNumber, getCarPhotoStyle } from '../../utils/formatters';

export function CarCard({ car, onSelect }) {
  const photoStyle = getCarPhotoStyle(car);

  return (
    <article
      className="market-car-card clickable"
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียด ${car.title}`}
      onClick={() => onSelect(car)}
    >
      <button
        className="favorite"
        aria-label={`บันทึก ${car.title}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        ♡
      </button>

      <div className="market-car-photo" style={photoStyle}>
        <span>{car.brand?.toUpperCase() || 'CUBROD'}</span>
        <b>CUBROD</b>
        <small>รถคัดสภาพ</small>
      </div>

      <div className="market-car-body">
        <div className="market-car-tags">
          <span className="year-tag">ปี {car.year}</span>
          <span>เกียร์{car.transmission || 'อัตโนมัติ'}</span>
          <span>เลขไมล์ {car.mileage ? `${formatNumber(car.mileage)} กม.` : 'ไม่ระบุ'}</span>
        </div>

        <h3>{car.title}</h3>
        <p>{car.description}</p>

        <div className="market-card-bottom-row">
          <div className="market-price">
            <strong>฿{formatNumber(car.price)}</strong>
            <small>ราคาเสนอขาย</small>
          </div>

          {car.monthlyPayment && (
            <div className="installment-chip">
              <span>ผ่อนเริ่มต้น</span>
              <b>฿{formatNumber(car.monthlyPayment)}/เดือน</b>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default CarCard;
