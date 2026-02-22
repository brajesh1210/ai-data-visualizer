import { createClient } from "@supabase/supabase-js";

// ── Supabase client ──────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Backend base URL ─────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Get or create a persistent anonymous user ID.
 * Stored in localStorage so it survives page reloads.
 */
export function getUserId() {
    const STORAGE_KEY = "ai_viz_user_id";
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
}

/**
 * Track an upload for a given user.
 * Returns { uploadCount, isPremium, uploadsRemaining }
 */
export async function trackUpload(userId) {
    const res = await fetch(`${API_BASE}/api/track-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
        throw new Error("Failed to track upload");
    }

    return res.json();
}

/**
 * Upgrade a user to premium.
 * Returns { success: true }
 */
export async function upgradeToPremium(userId) {
    const res = await fetch(`${API_BASE}/api/upgrade-premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
        throw new Error("Failed to upgrade to premium");
    }

    return res.json();
}