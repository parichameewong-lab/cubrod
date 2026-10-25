/**
 * Media Upload & Image Compression Service for CLUBROD
 *
 * Features:
 * 1. Automatic Client-Side WebP Compression (resizes up to 1600px, WebP quality 0.82)
 *    Reduces 3-5 MB phone photos down to ~100-180 KB before upload.
 * 2. Priority 1: Cloudinary Unsigned Upload (Free 25GB Tier, separate from kaitong)
 * 3. Priority 2: Supabase Storage Bucket ('clubrod-media')
 * 4. Priority 3: Compressed WebP DataURL fallback (works offline/immediately)
 */
import { supabase, isSupabaseConfigured } from './supabase';

const CLOUDINARY_STORAGE_KEY = 'cc-cloudinary-config';

export const getCloudinaryConfig = () => {
  let saved = null;
  if (typeof window !== 'undefined') {
    try {
      saved = JSON.parse(localStorage.getItem(CLOUDINARY_STORAGE_KEY) || 'null');
    } catch {
      saved = null;
    }
  }

  const cloudName =
    saved?.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'qnvfqjje';
  const uploadPreset =
    saved?.uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'clubrod_unsigned';

  return {
    cloudName: cloudName.trim(),
    uploadPreset: uploadPreset.trim(),
    isConfigured: Boolean(cloudName.trim() && uploadPreset.trim()),
  };
};

export const saveCloudinaryConfig = (cloudName, uploadPreset) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    CLOUDINARY_STORAGE_KEY,
    JSON.stringify({
      cloudName: (cloudName || '').trim(),
      uploadPreset: (uploadPreset || '').trim(),
    })
  );
};

/**
 * Compress & convert an image File to WebP format on the client side
 * @param {File} file Original image file
 * @param {Object} options { maxWidth, maxHeight, quality }
 * @returns {Promise<{ blob: Blob, file: File, dataUrl: string, width: number, height: number }>}
 */
export const compressImageToWebP = (
  file,
  { maxWidth = 1280, maxHeight = 1280, quality = 0.76 } = {}
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไฟล์รูปภาพไม่ถูกต้อง'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('เบราว์เซอร์ไม่รองรับการบีบอัดรูปภาพ'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('บีบอัดรูปภาพไม่สำเร็จ'));
            }
            const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
            });
            resolve({ blob, file: webpFile, dataUrl, width, height });
          },
          'image/webp',
          quality
        );
      };
      img.src = String(event.target?.result || '');
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a file (Image or PDF) to Cloudinary using Unsigned Upload Preset
 */
const uploadToCloudinary = async (file, folder = 'clubrod/cars') => {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryConfig();
  if (!isConfigured) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'อัปโหลดไปยัง Cloudinary ไม่สำเร็จ');
  }

  return {
    url: data.secure_url,
    provider: 'cloudinary',
    bytes: data.bytes || file.size,
  };
};

/**
 * Upload a file to Supabase Storage bucket 'clubrod-media'
 */
const uploadToSupabaseStorage = async (file, folder = 'cars') => {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const ext = file.name.split('.').pop() || 'webp';
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('clubrod-media')
    .upload(uniqueName, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('clubrod-media').getPublicUrl(uniqueName);
  if (!data?.publicUrl) {
    throw new Error('ไม่สามารถดึง Public URL จาก Supabase Storage ได้');
  }

  return {
    url: data.publicUrl,
    provider: 'supabase',
    bytes: file.size,
  };
};

/**
 * Main helper to compress & upload an image (Car photo or Storefront photo)
 * Automatically picks Cloudinary -> Supabase Storage -> Compressed WebP DataURL
 */
export const uploadCompressedImage = async (
  rawFile,
  { folder = 'clubrod/cars', maxWidth = 1280, maxHeight = 1280, quality = 0.76 } = {}
) => {
  // Step 1: Compress & convert to WebP on client
  const compressed = await compressImageToWebP(rawFile, {
    maxWidth,
    maxHeight,
    quality,
  });

  // Step 2: Try Cloudinary if configured
  const { isConfigured: hasCloudinary } = getCloudinaryConfig();
  if (hasCloudinary) {
    try {
      const res = await uploadToCloudinary(compressed.file, folder);
      return {
        ...res,
        originalSize: rawFile.size,
        compressedSize: compressed.file.size,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, trying fallback:', err);
    }
  }

  // Step 3: Try Supabase Storage bucket 'clubrod-media'
  try {
    const subFolder = folder.replace(/^clubrod\//, '') || 'cars';
    const res = await uploadToSupabaseStorage(compressed.file, subFolder);
    return {
      ...res,
      originalSize: rawFile.size,
      compressedSize: compressed.file.size,
    };
  } catch {
    // Bucket might not exist yet; fall back to compressed WebP DataURL
  }

  // Step 4: Fallback to compressed WebP DataURL (15-20x smaller than raw Base64)
  return {
    url: compressed.dataUrl,
    provider: 'webp-local',
    originalSize: rawFile.size,
    compressedSize: compressed.file.size,
  };
};

/**
 * Upload an Inspection Report PDF (Cloudinary -> Supabase Storage -> Local Object/Data URL)
 */
export const uploadInspectionPdf = async (file, carId = 'car') => {
  const { isConfigured: hasCloudinary } = getCloudinaryConfig();
  if (hasCloudinary) {
    try {
      const res = await uploadToCloudinary(file, `clubrod/reports/${carId}`);
      return {
        name: file.name,
        url: res.url,
        provider: 'cloudinary',
      };
    } catch (err) {
      console.warn('Cloudinary PDF upload failed, trying fallback:', err);
    }
  }

  try {
    const res = await uploadToSupabaseStorage(file, `reports/${carId}`);
    return {
      name: file.name,
      url: res.url,
      provider: 'supabase',
    };
  } catch {
    // Fallback to Data URL if cloud storage isn't configured yet
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        url: String(reader.result || ''),
        provider: 'local',
      });
    reader.onerror = () => reject(new Error('อ่านไฟล์ PDF ไม่สำเร็จ'));
    reader.readAsDataURL(file);
  });
};
