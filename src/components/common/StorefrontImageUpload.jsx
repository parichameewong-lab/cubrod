import React, { useState } from 'react';
import { uploadCompressedImage } from '../../services/mediaUpload';

export function StorefrontImageUpload({ image, onChange, showToast }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('รูปหน้าร้านต้องมีขนาดไม่เกิน 15 MB');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadCompressedImage(file, {
        folder: 'clubrod/storefronts',
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
      });
      onChange(res.url);
      const savedKB = Math.round(Math.max(0, (res.originalSize || 0) - (res.compressedSize || 0)) / 1024);
      showToast(
        `อัปโหลดรูปหน้าร้านสำเร็จ${savedKB > 0 ? ` (บีบอัด WebP ประหยัด ${savedKB.toLocaleString()} KB)` : ''}`
      );
    } catch (err) {
      showToast(err.message || 'อัปโหลดรูปหน้าร้านไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="full-field storefront-uploader">
      <div className="storefront-preview">
        {image ? (
          <img src={image} alt="ตัวอย่างรูปหน้าร้าน" />
        ) : (
          <div>
            <span aria-hidden="true">▧</span>
            <strong>{uploading ? 'กำลังบีบอัดและอัปโหลด...' : 'ยังไม่มีรูปหน้าร้าน'}</strong>
            <small>เพิ่มภาพจริงของเต็นท์รถเพื่อให้ลูกค้าจดจำร้านได้ง่ายขึ้น</small>
          </div>
        )}
      </div>

      <div className="storefront-controls">
        <div>
          <strong>รูปหน้าร้าน</strong>
          <small>แนะนำภาพแนวนอน เห็นป้ายชื่อร้านชัดเจน (ระบบบีบอัดเป็น WebP อัตโนมัติ)</small>
        </div>
        <label className="upload-button" style={{ opacity: uploading ? 0.6 : 1 }}>
          {uploading ? '⏳ กำลังอัปโหลด...' : image ? 'เปลี่ยนรูปหน้าร้าน' : '+ อัปโหลดรูปหน้าร้าน'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {image && (
          <button
            type="button"
            className="remove-image"
            onClick={() => onChange('')}
          >
            ลบรูปหน้าร้าน
          </button>
        )}
        <small className="upload-only-note">
          รองรับ JPG, PNG และ WebP (ย่อเป็น WebP ความละเอียดคมชัดให้อัตโนมัติ)
        </small>
      </div>
    </div>
  );
}

export default StorefrontImageUpload;
