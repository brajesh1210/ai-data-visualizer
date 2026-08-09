// Updated Imports: Added signOut from firebase/auth and removed all implicit dependencies on a global supabase object.  

// Replaced Token Retrieval (supabase.auth.getSession()): In every API call (fetchStatus, finalizeUpgrade, handleDataReceived, and handleUpgrade), the Supabase session check was removed. It is replaced with Firebase's const token = await user.getIdToken();, which automatically handles token refreshing and extraction from the current user object.  

// Added Safety Checks: In handleDataReceived and handleUpgrade, logical checks if (user) and if (!user) throw new Error(...) were added to prevent attempting to get an ID token from a null user, avoiding runtime crashes.

// Rewired the Sign-Out Button: Created a new handleSignOut function that utilizes Firebase's signOut(auth) method and attached it to the button in the navigation bar, fully removing the supabase.auth.signOut() inline call.

//CHANGES DONE FOR SETUPPING FIREBASE AND REMOVING SUPABASE



import { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload.jsx';
import Dashboard from './components/Dashboard.jsx';
import Hero from './components/Landing/Hero.jsx';
import Features from './components/Landing/Features.jsx';
import Pricing from './components/Landing/pricing.jsx';
import UploadTracker from "./components/freemium/UploadTracker.jsx";
import UpgradeModal from './components/freemium/UpgradeModal.jsx';
import { useToast } from './components/ToastContext.jsx';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./utils/firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function App() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [user, setUser] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { showToast } = useToast();

  // Mouse Glow Effect
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser is null if signed out
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch Usage Status
  useEffect(() => {
    async function fetchStatus() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const { data: res } = await axios.get(`${API_BASE}/upload-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUploadCount(res.uploadCount ?? 0);
        setIsPremium(res.isPremium ?? false);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    }
    fetchStatus();
  }, [user]);

  // Handle Stripe Redirect Return
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("upgrade") === "success" && user) {
      async function finalizeUpgrade() {
        try {
          const token = await user.getIdToken();
          await axios.post(`${API_BASE}/upgrade-premium`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsPremium(true);
          showToast('Payment successful! Welcome to Pro.', 'success');
          window.history.replaceState(null, '', window.location.pathname);
        } catch (err) {
          showToast('Error finalizing upgrade. Please contact support.', 'error');
        }
      }
      finalizeUpgrade();
    }
    if (query.get("upgrade") === "canceled") {
      showToast('Payment canceled.', 'info');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [user, showToast]);

  // Handle Data Upload
  async function handleDataReceived(newData, newAnalysis) {
    if (!isPremium && uploadCount >= 10) {
      setShowUpgradeModal(true);
      return;
    }
    setUploadCount(prev => prev + 1);
    try {
      if (user) {
        const token = await user.getIdToken();
        await axios.post(`${API_BASE}/track-upload`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Failed to track upload:", error);
    }

    setData(newData);
    setAnalysis(newAnalysis);
    showToast('Data analyzed successfully!', 'success');
  }

  // Handle Stripe Payment Initiation
  async function handleUpgrade() {
    setIsUpgrading(true);
    try {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const response = await axios.post(`${API_BASE}/create-checkout-session`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = response.data.url;
    } catch (err) {
      showToast('Payment gateway unavailable. Please try again.', 'error');
      setIsUpgrading(false);
    }
  }

  // Securely gate the Upgrade UI elements
  const triggerUpgrade = () => {
    if (!user) {
      showToast('Please sign in with Google first to upgrade.', 'info');
      document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully', 'success');
    } catch (error) {
      showToast('Error signing out', 'error');
    }
  };

  return (
    <>
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }}></div>
      <div className="bg-grid"></div>
      <div className="bg-noise"></div>

      <header className="fixed top-0 w-full z-[900] bg-[#080a0f]/90 backdrop-blur-xl border-b border-[#c9a84c]/15">
        <nav className="max-w-[1320px] mx-auto px-6 py-2 flex justify-between items-center">
          
          {/* UPDATED LOGO SECTION */}
          <a className="logo flex items-center gap-3 no-underline" href="/">
            <div className="logo-mark w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.25)] overflow-hidden">
              <img src="/aurabi-logo.png" alt="AuraBI Logo" className="w-full h-full object-contain" />
            </div>
            <div className="logo-text font-['Cormorant_Garamond'] text-xl font-bold text-white">Aura<span className="text-[#c9a84c]">BI</span></div>
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="nav-links hidden md:flex gap-6 list-none">
              <li><a href="#features" className="text-[#8a9ab5] hover:text-[#c9a84c] text-[0.8rem] no-underline transition-colors">FEATURES</a></li>
              <li><a href="#pricing" className="text-[#8a9ab5] hover:text-[#c9a84c] text-[0.8rem] no-underline transition-colors">PRICING</a></li>
            </div>
            {user && (
              <button onClick={handleSignOut} className="text-[#8a9ab5] hover:text-[#c9a84c] bg-transparent border-none text-[0.8rem] cursor-pointer">SIGN OUT</button>
            )}
            <UploadTracker uploadCount={uploadCount} isPremium={isPremium} />
          </div>
        </nav>
      </header>

      <main className="relative z-10 pt-[100px]">
        {!data ? (
          <>
            <Hero onGetStarted={() => document.getElementById('upload').scrollIntoView({ behavior: 'smooth' })} />
            <FileUpload onDataReceived={handleDataReceived} user={user} />
            <Features />
            <Pricing onUpgradeClick={triggerUpgrade} />
          </>
        ) : (
          <div className="section animate-in fade-in" style={{ paddingTop: '2rem' }}>
            <button onClick={() => { setData(null); setAnalysis(null); }} className="btn btn-ghost mb-6" style={{ border: '1px solid var(--border2)' }}>
              ← NEW ANALYSIS
            </button>
            <Dashboard 
                data={data} 
                analysis={analysis} 
                isPremium={isPremium} 
                onUpgradeRequest={triggerUpgrade} 
            />
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-[#4a5568] border-t border-[var(--border2)]">
        © 2025 <span className="text-[#c9a84c]">AuraBI</span> · Intelligence powered by Aura BI analysis · Built for humans, not analysts
      </footer>
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        onUpgrade={handleUpgrade}
        isUpgrading={isUpgrading}
      />
    </>
  );
}

export default App;