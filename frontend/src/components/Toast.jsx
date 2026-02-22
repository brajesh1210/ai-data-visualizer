import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const CONFIG = {
    success: {
        Icon: CheckCircle,
        border: 'border-golden-500/40',
        iconColor: 'text-golden-400',
        glow: 'shadow-golden-500/15',
        accent: 'bg-golden-500/10',
        label: 'Success',
    },
    error: {
        Icon: AlertTriangle,
        border: 'border-red-500/40',
        iconColor: 'text-red-400',
        glow: 'shadow-red-500/15',
        accent: 'bg-red-500/10',
        label: 'Error',
    },
};

export default function Toast({ id, message, type = 'success', onDismiss }) {
    const [exiting, setExiting] = useState(false);
    const cfg = CONFIG[type] || CONFIG.success;
    const { Icon } = cfg;

    // Start exit animation 300ms before removal
    useEffect(() => {
        const timer = setTimeout(() => setExiting(true), 3600);
        return () => clearTimeout(timer);
    }, []);

    function handleDismiss() {
        setExiting(true);
        setTimeout(() => onDismiss(id), 300);
    }

    return (
        <div
            role="alert"
            className={`
        pointer-events-auto flex items-start gap-3
        px-4 py-3.5 rounded-xl
        bg-zinc-900/95 backdrop-blur-md
        border ${cfg.border}
        shadow-lg ${cfg.glow}
        ${exiting ? 'toast-fade-out' : 'toast-slide-in'}
      `}
        >
            {/* Icon */}
            <div className={`p-1.5 rounded-lg ${cfg.accent} shrink-0 mt-0.5`}>
                <Icon size={18} className={cfg.iconColor} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${cfg.iconColor} mb-0.5`}>{cfg.label}</p>
                <p className="text-sm text-gray-300 leading-snug">{message}</p>
            </div>

            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5
                   transition-colors duration-150 shrink-0"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </div>
    );
}