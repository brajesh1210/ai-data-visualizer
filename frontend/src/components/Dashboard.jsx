import { useEffect, useRef, useState } from 'react';
import { useToast } from './ToastContext';

const COLORS = ['#c9a84c', '#2dd4aa', '#8a9ab5', '#e8c97a', '#f87171', '#60a5fa', '#a78bfa', '#34d399'];
const FREE_LIMIT = 10;

export default function Dashboard({ data, analysis, isPremium, onUpgradeRequest }) {
    const chartsRef = useRef(null);
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [isDownloadingCharts, setIsDownloadingCharts] = useState(false);
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    
    const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

    useEffect(() => {
        if (!data || !data.length || !chartsRef.current) return;
        const Chart = window.Chart;
        if (!Chart) return;

        chartsRef.current.innerHTML = ''; 
        let chartCount = 0;
        
        const nums = headers.filter(h => data.slice(0, 50).filter(r => r[h] !== null).every(r => typeof r[h] === 'number'));
        const cats = headers.filter(h => !nums.includes(h));

        function makeChart(type, title, sub, labels, values, colors) {
            chartCount++;
            const locked = !isPremium && chartCount > FREE_LIMIT;
            const id = 'c_' + Math.random().toString(36).slice(2, 8);

            const card = document.createElement('div');
            card.className = `chart-card ${locked ? 'locked' : ''}`;
            
            card.innerHTML = `
                <div class="chart-card-title">${title}</div>
                <div class="chart-card-sub">${sub}</div>
                <div class="chart-container"><canvas id="${id}"></canvas></div>
                ${locked ? `
                <div class="absolute inset-0 bg-[#080a0f]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 rounded-[var(--r2)]">
                    <div class="text-[#c9a84c] text-sm tracking-widest uppercase mb-2">✦ ${FREE_LIMIT} free charts used</div>
                    <div class="text-3xl mb-2">🔒</div>
                    <div class="text-white font-bold mb-1">Pro Feature</div>
                    <div class="text-[#8a9ab5] text-xs">Upgrade to Pro to view unlimited charts.</div>
                </div>` : ''}
            `;
            chartsRef.current.appendChild(card);

            if (locked) return;

            setTimeout(() => {
                const ctx = document.getElementById(id)?.getContext('2d');
                if (!ctx) return;
                Chart.defaults.font.family = 'Inter';
                Chart.defaults.color = '#4a5568';
                
                const datasets = type === 'doughnut'
                    ? [{ data: values, backgroundColor: colors, borderColor: '#0d1018', borderWidth: 3 }]
                    : type === 'line'
                        ? [{ data: values, borderColor: colors[0], backgroundColor: colors[0] + '18', borderWidth: 2, tension: .4, fill: true, pointRadius: 3, pointBackgroundColor: colors[0] }]
                        : [{ data: values, backgroundColor: labels.map((_, i) => colors[i % colors.length] + 'cc'), borderRadius: 5, borderSkipped: false }];
                
                new Chart(ctx, {
                    type, data: { labels, datasets },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: type === 'doughnut', position: 'right', labels: { color: '#8a9ab5', padding: 12, font: { size: 11 } } } },
                        scales: type === 'doughnut' ? undefined : {
                            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5568', maxRotation: 38, font: { size: 10 } } },
                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5568', font: { size: 10 } } }
                        }
                    }
                });
            }, 100);
        }

        cats.slice(0, nums.length > 0 ? 2 : 4).forEach((col, i) => {
            const dist = {};
            data.forEach(r => { const v = r[col]; if (v != null && v !== '') dist[v] = (dist[v] || 0) + 1; });
            const top = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 8);
            if (top.length < 2) return;
            makeChart(top.length <= 5 ? 'doughnut' : 'bar', `${col} Distribution`, `Breakdown by ${col.toLowerCase()}`, top.map(e => e[0]), top.map(e => e[1]), COLORS.slice(i * 2));
        });

        if (nums.length > 0 && cats.length > 0) {
            const m = {};
            data.forEach(r => { const k = r[cats[0]]; const v = r[nums[0]]; if (k && typeof v === 'number') { m[k] = m[k] || { s: 0, c: 0 }; m[k].s += v; m[k].c++; } });
            const s = Object.entries(m).map(([l, d]) => ({ l, v: d.s / d.c })).sort((a, b) => b.v - a.v).slice(0, 10);
            if (s.length) makeChart('bar', `${nums[0]} by ${cats[0]}`, 'Average per category', s.map(x => x.l), s.map(x => x.v), COLORS);
        }

        if (nums.length > 1) {
            const vals = data.slice(0, 60).map(r => r[nums[1]]).filter(v => v !== null);
            if (vals.length > 1) makeChart('line', `${nums[1]} Trend`, 'Sequential view', vals.map((_, i) => i + 1), vals, [COLORS[1]]);
        }
    }, [data, isPremium]);

    // CHARTS ONLY (Free Users)
    async function dlCharts() {
        setIsDownloadingCharts(true); showToast('Capturing charts…', 'info');
        try {
            const cards = document.querySelectorAll('#chartsGrid .chart-card:not(.locked)');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
            
            pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F');
            pdf.setFillColor(201, 168, 76); pdf.rect(0, 0, pw, 16, 'F');
            pdf.setTextColor(8, 10, 15); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
            pdf.text('AuraBI — Charts Export', 10, 11);
            
            let y = 22, col = 0; const cw = (pw - 30) / 2, ch = 88;
            for (let i = 0; i < cards.length; i++) {
                const cnv = await window.html2canvas(cards[i], { scale: 2, backgroundColor: '#0d1018' });
                const x = 10 + col * (cw + 10);
                if (y + ch > ph - 10) { pdf.addPage(); pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F'); y = 15; col = 0; }
                pdf.addImage(cnv.toDataURL('image/png'), 'PNG', x, y, cw, ch);
                col++; if (col >= 2) { col = 0; y += ch + 6; }
            }
            pdf.save('AuraBI_Charts.pdf');
            showToast('Charts downloaded!', 'success');
        } catch (e) { showToast('Export failed.', 'error'); }
        setIsDownloadingCharts(false);
    }

    // FULL IN-DEPTH REPORT (Premium Users Only)
    async function dlReport() {
        if (!isPremium) {
            onUpgradeRequest();
            return;
        }

        setIsDownloadingReport(true); showToast('Building in-depth report…', 'info');
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();

            // PAGE 1: Cover Page
            pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F');
            pdf.setFillColor(201, 168, 76); pdf.rect(0, 0, 4, ph, 'F');
            pdf.setTextColor(201, 168, 76); pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
            pdf.text('AURA BI · FULL INTELLIGENCE REPORT', 14, 15);
            pdf.setTextColor(232, 236, 244); pdf.setFontSize(32);
            pdf.text(pdf.splitTextToSize("Comprehensive Analysis", pw - 30), 14, 55);
            pdf.setTextColor(138, 154, 181); pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
            pdf.text(pdf.splitTextToSize(analysis?.summary || "AI Analysis", pw - 30), 14, 75);

            // Capture AI Insights for Page 1
            const insightsEl = document.querySelector('.insights');
            if (insightsEl) {
                const cnv = await window.html2canvas(insightsEl, { scale: 2, backgroundColor: '#0d1018' });
                const imgW = pw - 28;
                const imgH = (cnv.height * imgW) / cnv.width;
                pdf.addImage(cnv.toDataURL('image/png'), 'PNG', 14, 100, imgW, imgH);
            }

            // PAGE 2+: Charts Pages
            const cards = document.querySelectorAll('#chartsGrid .chart-card:not(.locked)');
            if (cards.length > 0) {
                pdf.addPage(); pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F');
                pdf.setFillColor(201, 168, 76); pdf.rect(0, 0, pw, 14, 'F');
                pdf.setTextColor(8, 10, 15); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
                pdf.text('VISUALIZATIONS', 10, 9.5);
                let y = 20; const ch = (ph - 36) / 2 - 4;
                for (let i = 0; i < cards.length; i++) {
                    if (i > 0 && i % 2 === 0) { pdf.addPage(); pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F'); y = 20; }
                    const cnv = await window.html2canvas(cards[i], { scale: 2, backgroundColor: '#0d1018' });
                    pdf.addImage(cnv.toDataURL('image/png'), 'PNG', 10, y + (i % 2) * (ch + 6), pw - 20, ch);
                }
            }

            // FINAL PAGE: Data Extract Table
            const tableEl = document.querySelector('.table-box');
            if (tableEl) {
                const tableWrap = tableEl.querySelector('.table-overflow-wrap');
                const ogMaxH = tableWrap.style.maxHeight;
                const ogOver = tableWrap.style.overflowX;
                tableWrap.style.maxHeight = 'none'; // Expand to capture
                tableWrap.style.overflowX = 'visible';

                pdf.addPage(); pdf.setFillColor(8, 10, 15); pdf.rect(0, 0, pw, ph, 'F');
                pdf.setFillColor(201, 168, 76); pdf.rect(0, 0, pw, 14, 'F');
                pdf.setTextColor(8, 10, 15); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
                pdf.text('DATA EXTRACT', 10, 9.5);

                const cnv = await window.html2canvas(tableEl, { scale: 2, backgroundColor: '#0d1018' });
                const imgW = pw - 20;
                const imgH = (cnv.height * imgW) / cnv.width;
                pdf.addImage(cnv.toDataURL('image/png'), 'PNG', 10, 20, imgW, Math.min(imgH, ph - 30));

                tableWrap.style.maxHeight = ogMaxH;
                tableWrap.style.overflowX = ogOver;
            }

            pdf.save('AuraBI_Full_Report.pdf');
            showToast('Full report downloaded!', 'success');
        } catch (e) { showToast('Export failed.', 'error'); }
        setIsDownloadingReport(false);
    }

    if (!data) return null;

    return (
        <div>
            <div className="dash-hd">
                <div>
                    <div className="dash-title">AuraBI Dashboard</div>
                    <div className="dash-sub">{analysis?.summary || "AI-generated analysis"}</div>
                    <div className="dash-badge">✦ Live Analysis</div>
                </div>
                <div className="dash-actions">
                    <button className="btn btn-sm btn-outline-gold" onClick={dlCharts} disabled={isDownloadingCharts}>
                        {isDownloadingCharts ? <><span className="btn-spin" style={{display:'inline-block', marginRight:'8px'}}/> Capturing…</> : '📊 Download Charts'}
                    </button>
                    <button className={`btn btn-sm ${isPremium ? 'btn-gold' : 'btn-ghost border-[#c9a84c] text-[#c9a84c]'}`} onClick={dlReport} disabled={isDownloadingReport}>
                        {isDownloadingReport ? <><span className="btn-spin" style={{display:'inline-block', marginRight:'8px'}}/> Building…</> : (isPremium ? '📄 Full PDF Report' : '🔒 Pro Full Report')}
                    </button>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi">
                    <div className="kpi-lbl">Total Records</div>
                    <div className="kpi-val">{data.length.toLocaleString()}</div>
                    <div className="kpi-sub">rows in dataset</div>
                </div>
                <div className="kpi">
                    <div className="kpi-lbl">Data Fields</div>
                    <div className="kpi-val">{headers.length}</div>
                    <div className="kpi-sub">columns tracked</div>
                </div>
            </div>

            <div className="insights">
                <div className="insights-hd">
                    <h3>AI Intelligence Report</h3>
                    <span className="ai-badge">AURA BI</span>
                </div>
                {(analysis?.insights || []).map((ins, i) => (
                    <div key={i} className="insight-row">
                        <span className="ic">{'🔍📌💡📊'.split('')[i % 4]}</span> {ins}
                    </div>
                ))}
            </div>

            <div className="charts-grid" id="chartsGrid" ref={chartsRef}></div>

            <div className="table-box">
                <div className="table-top">
                    <div className="table-top-title">Data Preview</div>
                    <input className="t-search" placeholder="Search rows…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="table-overflow-wrap" style={{ overflowX: 'auto', maxHeight: '400px' }}>
                    <table className="data-table">
                        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {data.slice(0, 100).filter(r => JSON.stringify(Object.values(r)).toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                                <tr key={i}>{headers.map(h => <td key={h}>{row[h] ?? '—'}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}