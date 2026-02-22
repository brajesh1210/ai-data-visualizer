import { useEffect, useState } from 'react';

const LOADER_MSGS = [
  'Reading your data', 'Detecting patterns',
  'Running AI analysis', 'Building visualizations',
  'Finalizing insights'
];

// FIXED: Changed 'isActive' to 'active' to match FileUpload state
export default function LoaderOverlay({ active, progress, step }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADER_MSGS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [active]);

  const ringBurst = (e) => {
    const c = e.currentTarget.querySelector('.ring-center');
    if (!c) return;
    c.style.transform = 'scale(1.4)';
    c.style.background = 'radial-gradient(circle,rgba(201,168,76,.5),transparent)';
    setTimeout(() => {
      c.style.transform = '';
      c.style.background = '';
    }, 400);
  };

  if (!active) return null;

  return (
    <div className="loader-overlay" style={{ display: 'flex' }}>
      <div className="loader-rings" title="Click to interact" onClick={ringBurst}>
        <div className="ring ring-1"><div className="ring-dot"></div></div>
        <div className="ring ring-2"><div className="ring-dot"></div></div>
        <div className="ring ring-3"><div className="ring-dot"></div></div>
        <div className="ring-center">⚡</div>
      </div>
      <div className="loader-msg">{LOADER_MSGS[msgIdx]}</div>
      <div className="loader-sub">AuraBI is analyzing your dataset…</div>
      
      <div className="loader-steps">
        <div className={`ls ${step >= 1 ? (step > 1 ? 'done' : 'on') : ''}`}>
          <div className="ls-ico">📤</div><div className="ls-name">Load</div>
        </div>
        <div className={`ls ${step >= 2 ? (step > 2 ? 'done' : 'on') : ''}`}>
          <div className="ls-ico">🤖</div><div className="ls-name">Analyze</div>
        </div>
        <div className={`ls ${step >= 3 ? (step > 3 ? 'done' : 'on') : ''}`}>
          <div className="ls-ico">📊</div><div className="ls-name">Chart</div>
        </div>
        <div className={`ls ${step >= 4 ? (step > 4 ? 'done' : 'on') : ''}`}>
          <div className="ls-ico">✦</div><div className="ls-name">Done</div>
        </div>
      </div>

      <div className="loader-bar">
        <div className="loader-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}