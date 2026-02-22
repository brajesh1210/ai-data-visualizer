import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { supabase } from '../utils/supabase';
import LoaderOverlay from './LoaderOverlay'; // <-- Implemented!

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function FileUpload({ onDataReceived, user }) {
    const [activeTab, setActiveTab] = useState('csv');
    const [file, setFile] = useState(null);
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [error, setError] = useState('');
    const [loaderState, setLoaderState] = useState({ active: false, step: 0, progress: 0 });

    async function signInWithGoogle() {
        setError('');
        await supabase.auth.signInWithOAuth({ 
            provider: 'google', 
            options: { redirectTo: window.location.origin }
        });
    }

    const onDrop = useCallback((acceptedFiles) => {
        setError('');
        if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1 
    });

    async function executeWithLoader(apiCall) {
        setError('');
        setLoaderState({ active: true, step: 1, progress: 15 });
        try {
            await new Promise(r => setTimeout(r, 600)); // Simulate Step 1
            setLoaderState({ active: true, step: 2, progress: 45 });
            
            const response = await apiCall(); // Network Request
            
            setLoaderState({ active: true, step: 3, progress: 75 });
            await new Promise(r => setTimeout(r, 800)); // Simulate Step 3
            
            setLoaderState({ active: true, step: 4, progress: 100 });
            await new Promise(r => setTimeout(r, 400)); // Simulate Step 4

            onDataReceived(response.data.data, response.data.analysis);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process request.');
        } finally {
            setLoaderState({ active: false, step: 0, progress: 0 });
        }
    }

    async function handleCSVUpload() {
        if (!file) return;
        const { data: { session } } = await supabase.auth.getSession();
        const formData = new FormData(); formData.append('file', file);
        executeWithLoader(() => axios.post(`${API_BASE}/upload-csv`, formData, { 
            headers: { Authorization: `Bearer ${session?.access_token}` } 
        }));
    }

    async function handleSheetsImport() {
        if (!sheetsUrl.trim()) return;
        const { data: { session } } = await supabase.auth.getSession();
        executeWithLoader(() => axios.post(`${API_BASE}/google-sheets`, { url: sheetsUrl }, { 
            headers: { Authorization: `Bearer ${session?.access_token}` } 
        }));
    }

    return (
        <div className="section" id="upload">
            <LoaderOverlay {...loaderState} />
            
            <div className="s-label">Step 01 — Import</div>
            <h2 className="s-title">Where is your data?</h2>
            <p className="s-desc">Upload a CSV or paste a Google Sheets URL — AuraBI handles the rest automatically.</p>

            <div className="tabs-wrap">
                <button className={`tab-btn ${activeTab === 'csv' ? 'on' : ''}`} onClick={() => { setActiveTab('csv'); setError(''); }}>📁 &nbsp;CSV Upload</button>
                <button className={`tab-btn ${activeTab === 'sheets' ? 'on' : ''}`} onClick={() => { setActiveTab('sheets'); setError(''); }}>📋 &nbsp;Google Sheets</button>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.12)', color: '#f87171', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(248, 113, 113, 0.25)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>⚠ {error}</div>}

            {!user ? (
                <div className="aura-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1.5rem', background: 'var(--bg3)', width: '72px', height: '72px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>🔒</div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Sign in to continue</h3>
                    <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '2rem' }}>Access secure cloud analysis and visualize your data by signing in with Google.</p>
                    <button onClick={signInWithGoogle} className="btn btn-gold">Sign in with Google</button>
                </div>
            ) : (
                <>
                    {activeTab === 'csv' && (
                        <div {...getRootProps()} className={`drop-zone ${isDragActive ? 'over' : ''}`}>
                            <input {...getInputProps()} />
                            <div className="drop-icon">📂</div>
                            <div className="drop-title">{file ? file.name : 'Drop your CSV file here'}</div>
                            <div className="drop-sub">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click anywhere to browse files'}</div>
                            <button onClick={(e) => { e.stopPropagation(); handleCSVUpload(); }} disabled={!file} className="btn btn-gold">Analyze Data →</button>
                        </div>
                    )}
                    {activeTab === 'sheets' && (
                        <div className="aura-card">
                            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem', alignItems: 'center' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#1a7340,#0f5c2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📋</div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>Connect Google Sheets</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '0.2rem' }}>Paste a public Sheet URL to fetch live data.</p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}><input className="inp" type="url" placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} /></div>
                            <button onClick={handleSheetsImport} disabled={!sheetsUrl.trim()} className="btn btn-green" style={{ width: '100%' }}>Analyze Sheet →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}