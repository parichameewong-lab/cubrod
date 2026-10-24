import React, { useState } from 'react';
import { uploadInspectionPdf } from '../../services/mediaUpload';

export function InspectionPdfUpload({ carId, name, url, onChange, showToast }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return showToast('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
    if (file.size > 10 * 1024 * 1024) {
      return showToast('ไฟล์รายงานต้องมีขนาดไม่เกิน 10 MB');
    }

    setLoading(true);
    try {
      const res = await uploadInspectionPdf(file, carId);
      onChange(res.name || file.name, res.url);
      showToast(
        `อัปโหลดรายงานตรวจสภาพแล้ว (${res.provider === 'cloudinary' ? 'Cloudinary CDN' : res.provider === 'supabase' ? 'Supabase Storage' : 'พร้อมใช้งาน'})`
      );
    } catch (err) {
      showToast(err.message || 'อัปโหลดรายงานไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inspection-report-uploader">
      <div className="report-icon">PDF</div>
      <div className="report-copy">
        <strong>รายงานตรวจสภาพรถ (PDF)</strong>
        {name && url ? (
          <>
            <a href={url} target="_blank" rel="noreferrer">
              {name}
            </a>
            <small>อัปโหลดแล้ว · เปิดดูรายงานเพื่อตรวจสอบได้</small>
          </>
        ) : (
          <small>แนบรายงานจากผู้ตรวจสภาพ เพื่อเพิ่มความน่าเชื่อถือให้ประกาศ (ไม่บังคับ)</small>
        )}
      </div>
      <div className="report-actions">
        <label className="upload-button">
          {loading ? 'กำลังอัปโหลด...' : name ? 'เปลี่ยนไฟล์' : '+ เลือกไฟล์ PDF'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={loading}
            onChange={(e) => {
              handleUpload(e.target.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {name && (
          <button
            type="button"
            className="remove-report"
            onClick={() => onChange('', '')}
          >
            ลบรายงาน
          </button>
        )}
      </div>
    </div>
  );
}

export default InspectionPdfUpload;
