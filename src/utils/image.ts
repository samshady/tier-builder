/**
 * Client-side image processor.
 * Preserves animated GIFs intact; downscales other images to max 384x384 WebP.
 */
export async function compressImageFile(file: File, maxDimension = 384): Promise<string> {
  return new Promise((resolve, reject) => {
    // If the file is an animated GIF, do not draw to canvas (canvas destroys animation frames)
    if (file.type === 'image/gif') {
      const gifReader = new FileReader();
      gifReader.onerror = () => reject(new Error('Failed to read GIF file'));
      gifReader.onload = () => resolve(gifReader.result as string);
      gifReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL('image/webp', 0.88);
          resolve(webpData);
        } catch {
          const jpegData = canvas.toDataURL('image/jpeg', 0.88);
          resolve(jpegData);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

