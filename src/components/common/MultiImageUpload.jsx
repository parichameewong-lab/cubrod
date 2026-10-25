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
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.75,
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

  const setAsCover = (index) => {
    if (index === 0) return;
    const picked = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([picked, ...rest]);
    showToast('ตั้งเป็นภาพหลักเรียบร้อยแล้ว');
  };

  return (
    <div className="full-field multi-image-uploader">
      <div className="uploader-header">
        <div className="uploader-title-block">
          <div className="uploader-title-row">
            <strong>รูปภาพรถยนต์ ({images.length}/15 รูป)</strong>
            <span
              className="badge"
              style={{
                fontSize: '10.5px',
                padding: '2px 8px',
                background: cloudCfg.isConfigured ? '#dcfce7' : '#eff6ff',
                color: cloudCfg.isConfigured ? '#166534' : '#1d4ed8',
                borderRadius: '999px',
              }}
            >
              {cloudCfg.isConfigured ? '☁️ Cloudinary CDN' : '⚡ ย่อ WebP ประหยัดพื้นที่'}
            </span>
          </div>
          <small>
            ระบบย่อขนาดภาพเป็น WebP อัตโนมัติ รูปแรกคือภาพหลัก (คลิกที่รูปเพื่อสลับเป็นภาพหลักได้)
          </small>
        </div>
        <div className="uploader-actions-row">
          <button
            type="button"
            className="button small secondary compact-btn"
            onClick={() => setShowUrlBox((prev) => !prev)}
          >
            🔗 ลิงก์ URL
          </button>
          <label className="upload-button compact-upload-btn" style={{ opacity: uploading ? 0.6 : 1 }}>
            {uploading ? '⏳ กำลังย่อและอัปโหลด...' : '+ เลือกรูปภาพ'}
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
        <div className="uploader-url-box">
          <input
            type="url"
            placeholder="วางลิงก์รูปภาพ เช่น https://.../car.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="button" className="button small compact-btn" onClick={handleAddExternalUrl}>
            เพิ่มรูป
          </button>
        </div>
      )}

      {images.length > 0 ? (
        <div className="image-grid-preview">
          {images.map((url, i) => (
            <div
              key={i}
              className={`preview-item ${i === 0 ? 'is-cover' : ''}`}
              onClick={() => setAsCover(i)}
              title={i === 0 ? 'ภาพหลักของประกาศ' : 'คลิกเพื่อตั้งเป็นภาพหลัก'}
            >
              <img src={url} alt={`รูปที่ ${i + 1}`} loading="lazy" />
              {i === 0 ? (
                <span className="cover-badge">★ ภาพหลัก</span>
              ) : (
                <span className="index-badge">#{i + 1}</span>
              )}
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                aria-label={`ลบรูปที่ ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          {images.length < 15 && (
            <label className="preview-add-more-tile" style={{ opacity: uploading ? 0.6 : 1 }}>
              <span>+</span>
              <small>{uploading ? 'กำลังโหลด...' : 'เพิ่มรูป'}</small>
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
          )}
        </div>
      ) : (
        <label className="empty-uploader-placeholder" style={{ opacity: uploading ? 0.6 : 1 }}>
          <span className="empty-cam-icon">📷</span>
          <div className="empty-cam-text">
            <strong>
              {uploading
                ? 'กำลังย่อขนาดรูปเป็น WebP และอัปโหลด...'
                : 'คลิกเพื่อเลือกรูปภาพรถยนต์ (สูงสุด 15 รูป)'}
            </strong>
            <small>แนบรูปมุมหน้ารถ ห้องโดยสาร และเรือนไมล์ · ย่อขนาดอัตโนมัติประหยัดพื้นที่</small>
          </div>
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
      )}
    </div>
  );
}

export default MultiImageUpload;
