import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './Lanyard.jsx';

const hasWebGL = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
};

// The canvas is larger than the visible column (so the swinging card is never clipped),
// therefore size / strapLength are derived from the canvas height to keep the card a fixed pixel size.
function measure(host) {
  const H = Math.max(1, host.clientHeight), w = innerWidth;
  const card = w <= 760 ? 290 : w <= 900 ? 330 : 350;   // card height in px
  const top = w <= 760 ? 100 : 150;                      // canvas top -> card top in px
  // two-column layouts: hang the card near the right edge of its column (the canvas extends EXT px past the column)
  const W = host.clientWidth, EXT = 120, cardW = card * 0.711;
  const anchor = w <= 760 ? 0.5 : Math.min(0.8, Math.max(0.5, (W - EXT - cardW / 2 - 8) / W));
  return { size: card / H, strapLength: Math.min(1, Math.max(0, (top / H - 0.12) / 0.3)), anchor };
}

function Fit({ host }) {
  const [fit, setFit] = useState(() => measure(host));
  useEffect(() => {
    const update = () => setFit(measure(host));
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, [host]);
  return <Lanyard {...(window.LANYARD_CONFIG || {})} {...fit} />;
}

const lan = document.getElementById('lan');
if (lan && location.protocol !== 'file:' && hasWebGL() && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const mount = document.createElement('div');
  mount.className = 'lan3';
  lan.appendChild(mount);
  lan.classList.add('three');
  window.__lanyard3d = true;           // tells main.js to skip the 2D fallback card
  createRoot(mount).render(<Fit host={mount} />);
}
