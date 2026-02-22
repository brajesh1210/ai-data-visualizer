export default function UploadTracker({ uploadCount, isPremium }) {
    if (isPremium) {
        return (
            <div className="flex items-center px-2.5 py-1 rounded border border-[#c9a84c]/30 text-[#c9a84c] text-[0.65rem] font-bold tracking-widest uppercase bg-[#c9a84c]/10 shadow-[0_0_10px_rgba(201,168,76,0.15)]">
                <span>✦ PRO ACTIVE</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-[0.55rem] text-[#8a9ab5] uppercase tracking-wider mb-0.5">Free Usage</span>
                <div className="w-16 h-1 bg-[#131720] rounded-full overflow-hidden border border-[#8a9ab5]/10">
                    <div 
                        className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((uploadCount / 10) * 100, 100)}%` }}
                    />
                </div>
            </div>
            <span className="text-[0.65rem] font-bold text-[#e8ecf4] font-mono">{uploadCount}<span className="text-[#4a5568]">/10</span></span>
        </div>
    );
}