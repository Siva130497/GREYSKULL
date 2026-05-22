/**
 * Resize a user-picked image to fit inside maxDim x maxDim and re-encode as
 * JPEG (quality 0.82) so a typical iPhone photo (~3-5MB) becomes a payload
 * of ~200-400KB that fits in our API body limit.
 *
 * Returns a data URL string.
 */
export async function fileToCompressedDataUrl(file, maxDim = 1280, quality = 0.82) {
  if (!file) throw new Error("No file");
  if (!file.type.startsWith("image/")) throw new Error("Not an image");

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height); // flatten transparent PNGs onto white
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error || new Error("read failed"));
    r.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}
