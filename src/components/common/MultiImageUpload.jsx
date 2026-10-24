import React, { useState } from 'react';
import { uploadCompressedImage, getCloudinaryConfig } from '../../services/mediaUpload';

export function MultiImageUpload({ images, onChange, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlBox, setShowUrlBox] = useState(false);

  const cloudCfg = getCloudinaryConfig();

  const handleFiles = async (fileList) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    if (images.length + files.length > 15) {
      return showToast(`เพิ่มได้อีกไม่เกิน ${15 - images.length} รูป (สูงสุด 15 รูป)`);
    }

    const invalid = files.find((f) => !f.type.startsWith('image/'));
    if (invalid) {
      return showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    }

    const oversized = files.find((f) => f.size > 15 * 1024 * 1024);
    if (oversized) {
      return showToast('แต่ละรูปต้องมีขนาดไม่เกิน 15 MB');
    }

    setUploading(true);
    try {
      const results = await Promise.all(
        files.map((file) =>
          uploadCompressedImage(file, {
            folder: 'clubrod/cars',
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.82,
          })
        )
      );

      const newUrls = results.map((r) => r.url);
      const totalSavedKB = Math.round(
        results.reduce((acc, r) => acc + Math.max(0, (r.originalSize || 0) - (r.compressedSize || 0)), 0) / 1024
      );
      const providerLabel =
        results[0]?.provider === 'cloudinary'
          ? 'Cloudinary CDN'
          : results[0]?.provider === 'supabase'
          ? 'Supabase Storage'
          : 'WebP ประหยัดพื้นที่';

      onChange([...images, ...newUrls]);
      showToast(
        `อัปโหลด ${newUrls.length} รูปสำเร็จ (${providerLabel}${totalSavedKB > 0 ? ` · ประหยัดพื้นที่ ${totalSavedKB.toLocaleString()} KB` : ''})`
      );
    } catch (err) {
      showToast(err.message || 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  const handleAddExternalUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      return showToast('กรุณาระบุลิงก์รูปภาพที่ขึ้นต้นด้วย http:// หรือ https://');
    }
    if (images.length >= 15) {
      return showToast('เพิ่มรูปได้สูงสุด 15 รูป');
    }
    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlBox(false);
    showToast('เพิ่มรูปภาพจากลิงก์ URL เรียบร้อย');
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="full-field multi-image-uploader">
      <div className="uploader-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong>รูปภาพรถยนต์ ({images.length}/15 รูป)</strong>
            <span
              className="badge"
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: cloudCfg.isConfigured ? '#dcfce7' : '#eff6ff',
                color: cloudCfg.isConfigured ? '#166534' : '#1d4ed8',
                borderRadius: '999px',
              }}
            >
              {cloudCfg.isConfigured ? '☁️ เชื่อมต่อ Cloudinary CDN แล้ว' : '⚡ บีบอัด WebP อัตโนมัติ'}
            </span>
          </div>
          <small>
            ระบบย่อและแปลงภาพเป็น WebP อัตโนมัติก่อนบันทึก รูปแรกจะเป็นภาพหลักของประกาศ
          </small>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button small secondary"
            onClick={() => setShowUrlBox((prev) => !prev)}
          >
            🔗 เพิ่มจากลิงก์ URL
          </button>
          <label className="upload-button" style={{ opacity: uploading ? 0.6 : 1 }}>
            {uploading ? '⏳ กำลังบีบอัดและอัปโหลด...' : '+ เลือกรูปภาพ'}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {showUrlBox && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '10px',
            marginBottom: '10px',
            padding: '10px 12px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <input
            type="url"
            placeholder="วางลิงก์รูปภาพ เช่น https://.../car.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="button small" onClick={handleAddExternalUrl}>
            เพิ่มรูป
          </button>
        </div>
      )}

      <div className="image-grid-preview">
        {images.map((url, i) => (
          <div key={i} className="preview-item">
            <img src={url} alt={`รูปที่ ${i + 1}`} />
            {i === 0 && <span className="cover-badge">ภาพหลัก</span>}
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeImage(i)}
              aria-label={`ลบรูปที่ ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="empty-uploader-placeholder">
            <span>📷</span>
            <p>
              {uploading
                ? 'กำลังบีบอัดรูปเป็น WebP และอัปโหลดขึ้น Cloud...'
                : 'ยังไม่มีรูปภาพ แนบรูปสภาพรถ ห้องโดยสาร และเรือนไมล์'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiImageUpload;
