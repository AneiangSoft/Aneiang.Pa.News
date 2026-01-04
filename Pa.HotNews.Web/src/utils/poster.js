import * as htmlToImage from 'html-to-image';

/**
 * 把某个 DOM 节点导出为 PNG Blob
 */
export async function nodeToPngBlob(node, { pixelRatio = 2, backgroundColor = null } = {}) {
  if (!node) throw new Error('node is required');

  // html-to-image 默认会把背景设为透明；这里允许传入背景色
  const dataUrl = await htmlToImage.toPng(node, {
    pixelRatio,
    backgroundColor: backgroundColor || undefined,
    cacheBust: true,
  });

  const res = await fetch(dataUrl);
  return res.blob();
}

export async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

