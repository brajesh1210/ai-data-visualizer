// frontend/src/components/landing/Hero.jsx
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
export default function Hero({ onGetStarted }) {
  return (
    <>
      <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '5rem', 
          alignItems: 'center',
          width: '100%' 
        }}>
          {/* Left Content Column */}
          <div>
            <div className="s-label">
              <span></span>Intelligence Meets Insight
            </div>
            <h1 className="s-title" style={{ fontSize: '4.2rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
              Turn raw data <br />
              into <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>gold-standard</em> <br />
              intelligence
            </h1>
            <p className="s-desc" style={{ fontSize: '1.1rem', maxWidth: '480px', lineHeight: '1.8' }}>
              AuraBI reads your spreadsheets, understands patterns, and delivers boardroom-ready 
              visualizations and AI-written insights in seconds. No analyst needed.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={onGetStarted} className="btn btn-gold">
                Begin Analysis →
              </button>
              <a href="#features" className="btn btn-ghost">
                How it works
              </a>
            </div>
          </div>

          {/* Right Visual Column (Animated Dashboard Mockup) */}
          <div className="hero-visual" style={{ 
            background: 'var(--bg2)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--r2)', 
            padding: '2rem', 
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px var(--gold-glow)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Window Controls */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
            </div>

            {/* Animated Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '140px', marginBottom: '2rem' }}>
              {[55, 80, 40, 90, 65, 50, 75].map((h, i) => (
                <div 
                  key={i} 
                  style={{ 
                    flex: 1, 
                    height: `${h}%`, 
                    background: i % 2 === 0 ? 'var(--gold)' : 'var(--gold2)', 
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.8,
                    transition: 'height 1s ease-out'
                  }} 
                />
              ))}
            </div>

            {/* Bottom Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Revenue</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond' }}>$82.4K</div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Records</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--silver)', fontFamily: 'Cormorant Garamond' }}>1,240</div>
              </div>
              <div style={{ background: 'var(--bg3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border2)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>AI Score</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'Cormorant Garamond' }}>98.6</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="trust" style={{ 
        borderTop: '1px solid var(--border2)', 
        borderBottom: '1px solid var(--border2)', 
        padding: '1.5rem 0',
        marginTop: '2rem' 
      }}>
        <div style={{ 
          maxWidth: '1320px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '3rem', 
          flexWrap: 'wrap',
          padding: '0 2.5rem' 
        }}>
          <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span style={{ color: 'var(--gold)' }}>📁</span> CSV upload
          </div>
          <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span style={{ color: 'var(--gold)' }}>📋</span> Google Sheets
          </div>
          <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span style={{ color: 'var(--gold)' }}>🔒</span> Data never stored
          </div>
          <div className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span style={{ color: 'var(--gold)' }}>✦</span> 10 charts free
          </div>
        </div>
      </div>
    </>
  );
}