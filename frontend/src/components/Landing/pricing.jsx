export default function Pricing({ onUpgradeClick }) {
    return (
      <section id="pricing" className="section" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border2)' }}>
        <div className="s-label" style={{ justifyContent: 'center' }}>Pricing</div>
        <h2 className="s-title" style={{ textAlign: 'center' }}>Simple, honest pricing</h2>
        <p className="s-desc" style={{ textAlign: 'center' }}>Start for free. Upgrade when you need more.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1000px', margin: '3rem auto 0' }}>
          <div className="aura-card">
            <div style={{ color: 'var(--gold)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '.1em' }}>Free</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, margin: '1rem 0', fontFamily: 'Cormorant Garamond' }}>₹0<span style={{ fontSize: '1rem', color: 'var(--text2)', fontFamily: 'Inter', fontWeight: 400 }}>/mo</span></div>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>Perfect for exploring your data and getting started with AI analysis.</p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text2)', fontSize: '0.85rem' }}>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> 10 visualizations per session</li>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> CSV & Google Sheets support</li>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> AI-powered insights</li>
              <li style={{ padding: '.5rem 0', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> Basic PDF chart export</li>
            </ul>
            <a href="#upload" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Get Started Free</a>
          </div>
  
          <div className="aura-card" style={{ borderColor: 'var(--gold)', boxShadow: '0 0 40px var(--gold-glow)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--bg)', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', padding: '.3rem 1rem', borderRadius: '50px' }}>MOST POPULAR</div>
            <div style={{ color: 'var(--gold)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '.1em' }}>Pro</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, margin: '1rem 0', fontFamily: 'Cormorant Garamond' }}>₹99<span style={{ fontSize: '1rem', color: 'var(--text2)', fontFamily: 'Inter', fontWeight: 400 }}>/mo</span></div>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>For teams and analysts who need unlimited power and professional exports.</p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text2)', fontSize: '0.85rem' }}>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> Unlimited visualizations</li>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> Full PDF report (cover + insights + charts + data)</li>
              <li style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> Priority Aura BI analysis</li>
              <li style={{ padding: '.5rem 0', display: 'flex', gap: '.6rem' }}><span style={{ color: 'var(--gold)' }}>✦</span> Custom branding on exports</li>
            </ul>
            <button className="btn btn-gold" onClick={onUpgradeClick} style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Upgrade to Pro →</button>
          </div>
        </div>
      </section>
    );
}