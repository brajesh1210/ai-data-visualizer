const features = [
  { ico: '📁', title: 'CSV & Google Sheets', desc: 'Upload any CSV or paste a Google Sheets link. AuraBI handles both.' },
  { ico: '🤖', title: 'Aura BI Insights', desc: 'Aura BI analysis reads your data like a senior analyst and writes plain-English observations.' },
  { ico: '📊', title: 'Auto Visualization', desc: 'The right chart for the right data selected intelligently based on column types.' },
  { ico: '📄', title: 'PDF Report Export', desc: 'Download a boardroom-ready PDF report with insights and charts in one click.' },
  { ico: '🔒', title: 'Private by Design', desc: 'Data is processed in your browser session. Nothing is stored on our servers.' },
  { ico: '✦', title: 'Freemium Model', desc: 'First 10 visualizations free. Upgrade for unlimited charts and exports.' }
];

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="s-label">Capabilities</div>
      <h2 className="s-title">Everything you need to understand your data</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        {features.map((f, i) => (
          <div key={i} className="aura-card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{f.ico}</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{f.title}</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}