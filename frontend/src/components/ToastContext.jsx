import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idCounter = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        const id = ++idCounter.current;
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 4s
        setTimeout(() => removeToast(id), 4000);
        return id;
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* ===== Fixed toast container ===== */}
            <div
                aria-live="polite"
                className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"
                style={{ maxWidth: 400 }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDismiss={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}