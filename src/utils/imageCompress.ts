/**
 * Client-side image compression helper so uploaded profile photos fit
 * comfortably well below Firestore's 1 MB per-document limit while staying
 * razor-sharp on A4 PDFs and Web Portfolio displays.
 */
export function compressImageFileToDataUrl(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 480, maxHeight = 560, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result;
      if (typeof rawUrl !== 'string') {
        reject(new Error('Invalid image file payload'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawUrl);
      img.onload = () => {
        try {
          let targetW = img.naturalWidth || maxWidth;
          let targetH = img.naturalHeight || maxHeight;

          const widthRatio = maxWidth / targetW;
          const heightRatio = maxHeight / targetH;
          const ratio = Math.min(1, widthRatio, heightRatio);

          targetW = Math.max(1, Math.round(targetW * ratio));
          targetH = Math.max(1, Math.round(targetH * ratio));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawUrl);
            return;
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed.length < rawUrl.length ? compressed : rawUrl);
        } catch {
          resolve(rawUrl);
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}
