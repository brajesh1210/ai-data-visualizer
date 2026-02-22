export default function UpgradeModal({ isOpen, onClose, onUpgrade, isUpgrading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#080a0f]/90 backdrop-blur-md z-[9999]">
      {/* FIXED: Replaced w-full mx-4 with w-[calc(100%-2rem)] to prevent mobile clipping */}
      <div 
        className="bg-[#0d1018] border border-[#c9a84c] rounded-2xl p-8 md:p-10 max-w-md w-[calc(100%-2rem)] shadow-[0_0_60px_rgba(201,168,76,0.3)] relative"
        style={{ transform: 'none' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 text-[#8a9ab5] hover:text-white bg-transparent border-none text-xl cursor-pointer"
        >
          ✕
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            ✦
          </div>
          <h2 className="text-2xl font-bold font-['Cormorant_Garamond'] text-white mb-2">Upgrade to Pro</h2>
          <p className="text-[#8a9ab5] text-sm">
            You've hit your free limit. Upgrade to unlock the full power of Aura BI analysis.
          </p>
        </div>

        <ul className="space-y-4 mb-8 text-[#e8ecf4] text-sm">
          <li className="flex items-center gap-3 border-b border-[#8a9ab5]/10 pb-3">
            <span className="text-[#c9a84c]">✔</span> Unlimited visualizations
          </li>
          <li className="flex items-center gap-3 border-b border-[#8a9ab5]/10 pb-3">
            <span className="text-[#c9a84c]">✔</span> Full PDF report (cover + insights + charts + data)
          </li>
          <li className="flex items-center gap-3 pb-3">
            <span className="text-[#c9a84c]">✔</span> Priority Aura BI analysis
          </li>
        </ul>

        <button 
          onClick={onUpgrade} 
          disabled={isUpgrading}
          className="w-full bg-[#c9a84c] text-[#080a0f] font-bold py-3.5 rounded-lg shadow-[0_4px_24px_rgba(201,168,76,0.3)] transition-colors hover:bg-[#e8c97a] disabled:opacity-50 flex justify-center items-center gap-2"
          style={{ transform: 'none' }}
        >
          {isUpgrading ? <span className="btn-spin"></span> : 'Upgrade to Pro - ₹99/mo'}
        </button>
      </div>
    </div>
  );
}