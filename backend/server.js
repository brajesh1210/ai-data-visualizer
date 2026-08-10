// backend/server.js  —  MEMORY-SAFE VERSION (handles large CSV files)
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { Readable } = require("stream");

// 1. Initialize Firebase Admin SDK (v12+ syntax)
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-service-account.json');

initializeApp({
    credential: cert(serviceAccount)
});

// INITIALIZE STRIPE SECURELY USING ENV VARIABLE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// 2. Auth Middleware: Verifies the Firebase ID token sent from the frontend
async function verifyUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided or invalid format" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token securely via Firebase Admin
        const decodedToken = await getAuth().verifyIdToken(token);

        // Attach verified user info to the request for use in route handlers
        req.user = {
            ...decodedToken,
            id: decodedToken.uid
        };
        next();
    } catch (err) {
        console.error("FIREBASE AUTH ERROR:", err.message);
        return res.status(401).json({ error: "Invalid or expired session" });
    }
}

// 3. CORS Configuration
app.use(cors({
    origin: [
        "https://ai-data-visualizer-drab.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    credentials: true
}));

// 4. File Upload Storage Setup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// IMPORTANT: cap upload size so a huge file can't OOM the server (50MB)
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// 5. Lightweight CSV line parser (handles quoted fields, NO external deps)
function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') { cur += '"'; i++; }
                else inQuotes = false;
            } else {
                cur += ch;
            }
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ',') { result.push(cur); cur = ''; }
            else cur += ch;
        }
    }
    result.push(cur);
    return result;
}

// Stream a readable source line-by-line and return only what we need.
// This NEVER holds the whole file in memory -> no more OOM on big files.
async function streamCsv(source) {
    const rl = readline.createInterface({ input: source, crlfDelay: Infinity });
    const MAX_RETURN_ROWS = 5000; // cap rows sent back to the browser
    let headers = null;
    let rowCount = 0;
    const sample = [];
    const numericCols = new Set();

    for await (const rawLine of rl) {
        let line = rawLine;
        if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1); // strip BOM
        if (!line.trim()) continue;

        const fields = parseCsvLine(line);
        if (!headers) { headers = fields; continue; }

        const row = {};
        headers.forEach((h, i) => { row[h] = (fields[i] ?? '').trim(); });

        // lightweight numeric-column detection (for chart suggestions)
        for (const [k, v] of Object.entries(row)) {
            const n = Number(v);
            if (v !== '' && !isNaN(n) && isFinite(n)) numericCols.add(k);
        }

        rowCount++;
        if (rowCount <= MAX_RETURN_ROWS) sample.push(row);
    }

    return { columns: headers || [], rowCount, sample, numericCols: [...numericCols] };
}

// 6. Mock AI analysis — uses columns + counts, not the full dataset
function getMockAnalysis(columns, rowCount, numericCols) {
    const cols = columns.length ? columns : [];
    return {
        insights: [
            `Analyzed ${rowCount} rows of data with ${cols.length} attributes.`,
            `Detected key fields: ${cols.slice(0, 3).join(', ')}.`,
            `Numeric columns for charts: ${numericCols.slice(0, 5).join(', ') || 'none'}.`,
            "Data distribution looks healthy for visualization."
        ],
        summary: `Dataset contains ${rowCount} entries (preview shows up to 5000 rows).`,
        chartRecommendations: {
            bar: "Ideal for categorical comparison.",
            pie: "Best for proportional analysis.",
            line: "Great for trend tracking."
        },
        totalRows: rowCount
    };
}

// 7. Persistent User Store (Local memory)
const userStore = new Map();
const PERMANENT_PREMIUM_EMAIL = "brajeshupadhyay1210@gmail.com";

function getUserData(userId, email) {
    const isPermanentPremium = email === PERMANENT_PREMIUM_EMAIL;

    if (!userStore.has(userId)) {
        userStore.set(userId, { uploadCount: 0, isPremium: isPermanentPremium });
    }

    const user = userStore.get(userId);
    if (isPermanentPremium) user.isPremium = true;

    return user;
}

// --- PROTECTED ROUTES (Using verifyUser middleware) ---

// A. CSV UPLOAD  (STREAMED -> safe for big files)
app.post("/api/upload-csv", verifyUser, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const filePath = req.file.path;
        const { columns, rowCount, sample, numericCols } = await streamCsv(fs.createReadStream(filePath));
        const analysis = getMockAnalysis(columns, rowCount, numericCols);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // cleanup temp file

        res.json({ data: sample, analysis, user: req.user.email, totalRows: rowCount });
    } catch (error) {
        console.error("💥 CSV UPLOAD CRASH:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Upload failed" });
    }
});

// B. GOOGLE SHEETS IMPORT  (STREAMED)
app.post("/api/google-sheets", verifyUser, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "No URL provided" });

        const response = await fetch(url);
        if (!response.ok) return res.status(400).json({ error: "Could not fetch the sheet URL" });

        const csvText = await response.text();
        const { columns, rowCount, sample, numericCols } = await streamCsv(Readable.from(csvText));
        const analysis = getMockAnalysis(columns, rowCount, numericCols);

        res.json({ data: sample, analysis, totalRows: rowCount });
    } catch (error) {
        console.error("💥 GOOGLE SHEETS CRASH:", error);
        res.status(500).json({ error: "Failed to import sheet" });
    }
});

// C. GET UPLOAD STATUS
app.get("/api/upload-status", verifyUser, (req, res) => {
    const user = getUserData(req.user.id, req.user.email);
    res.json({
        uploadCount: user.uploadCount,
        isPremium: user.isPremium,
        uploadsRemaining: user.isPremium ? Infinity : Math.max(0, 10 - user.uploadCount),
    });
});

// D. TRACK SUCCESSFUL UPLOAD
app.post("/api/track-upload", verifyUser, (req, res) => {
    const user = getUserData(req.user.id, req.user.email);
    user.uploadCount += 1;
    res.json(user);
});

// E. STRIPE CHECKOUT SESSION
app.post("/api/create-checkout-session", verifyUser, async (req, res) => {
    try {
        const frontendUrl = req.headers.origin || 'https://ai-data-visualizer-drab.vercel.app';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'AuraBI Pro Plan',
                            description: 'Unlimited charts, Full PDF Reports, and Priority Analysis.',
                        },
                        unit_amount: 9900,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${frontendUrl}?upgrade=success`,
            cancel_url: `${frontendUrl}?upgrade=canceled`,
            customer_email: req.user.email,
            client_reference_id: req.user.id,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: "Failed to create payment session" });
    }
});

// F. UPGRADE TO PREMIUM
app.post("/api/upgrade-premium", verifyUser, (req, res) => {
    const user = getUserData(req.user.id, req.user.email);
    user.isPremium = true;
    res.json({ success: true });
});

// 8. Public Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "LIVE MODE - Firebase Auth Enabled" });
});

// 9. Global error handler — returns clean, CORS-friendly errors
//    (also catches multer's file-size limit)
app.use((err, req, res, next) => {
    console.error("UNHANDLED ERROR:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: "File too large. Max 50MB allowed." });
    }
    res.status(500).json({ error: "Internal server error" });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server secure and running on port ${PORT}`);
});
