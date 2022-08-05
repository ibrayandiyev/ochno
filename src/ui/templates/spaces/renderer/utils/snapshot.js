const mime = 'image/png';

export default async function snapshot(canvas, name) {
  if (canvas) {
    const base64 = canvas.toDataURL(mime);
    const res = await fetch(base64);
    const blob = await res.blob();
    return new File([blob], `${name}.png`, { type: mime });
  }

  throw new Error('No canvas to snapshot');
}
