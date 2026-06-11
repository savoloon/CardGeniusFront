/** Load an image for canvas use (supports data URLs and cookie-authenticated API URLs). */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  if (!url) {
    return Promise.reject(new Error('Image URL is empty'));
  }

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  }

  return fetch(url, { credentials: 'include' }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Image load failed (${response.status})`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load failed'));
      };
      img.src = objectUrl;
    });
  });
}
