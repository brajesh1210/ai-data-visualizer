// backend/server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { createClient } = require('@supabase/supabase-js');

// INITIALIZE STRIPE SECURELY USING ENV VARIABLE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// 1. Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Auth Middleware: Verifies the JWT (access_token) sent from the frontend
async function verifyUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(" ")[1];
        // getUser is the secure way to verify a JWT server-side
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log("SUPABASE ERROR:", error); // <--- ADD THIS LINE
            return res.status(401).json({ error: "Invalid or expired session" });
        }

        // Attach verified user info to the request for use in route handlers
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ error: "Authentication server error" });
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
const upload = multer({ storage });

// 5. Utility: Simple CSV parser
function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    return lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || "";
        });
        return obj;
    });
}

// 6. Utility: Mock AI analysis
function getMockAnalysis(data) {
    const columns = Object.keys(data[0] || {});
    const numRows = data.length;
    return {
        insights: [
            `Analyzed ${numRows} rows of data with ${columns.length} attributes.`,
            `Detected key fields: ${columns.slice(0, 3).join(', ')}.`,
            "Data distribution looks healthy for visualization."
        ],
        summary: `Dataset contains ${numRows} entries.`,
        chartRecommendations: {
            bar: "Ideal for categorical comparison.",
            pie: "Best for proportional analysis.",
            line: "Great for trend tracking."
        }
    };
}

// 7. Persistent User Store (Local memory)
// Check for permanent premium based on email
const userStore = new Map();
const PERMANENT_PREMIUM_EMAIL = "brajeshupadhyay1210@gmail.com";

function getUserData(userId, email) {
    const isPermanentPremium = email === PERMANENT_PREMIUM_EMAIL;
    
    if (!userStore.has(userId)) {
        userStore.set(userId, { uploadCount: 0, isPremium: isPermanentPremium });
    }
    
    const user = userStore.get(userId);
    // Force true on every fetch just in case it was missed
    if (isPermanentPremium) user.isPremium = true; 
    
    return user;
}

// --- PROTECTED ROUTES (Using verifyUser middleware) ---

// A. CSV UPLOAD
app.post("/api/upload-csv", verifyUser, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const csvText = fs.readFileSync(req.file.path, "utf-8");
        const data = parseCSV(csvText);

        // Simulate AI processing time
        await new Promise(r => setTimeout(r, 1500));
        const analysis = getMockAnalysis(data);

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({ data, analysis, user: req.user.email });
    } catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
});

// B. GOOGLE SHEETS IMPORT
app.post("/api/google-sheets", verifyUser, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "No URL provided" });

        const response = await fetch(url);
        const csvText = await response.text();
        const data = parseCSV(csvText);

        await new Promise(r => setTimeout(r, 1500));
        const analysis = getMockAnalysis(data);

        res.json({ data, analysis });
    } catch (error) {
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

// E. STRIPE CHECKOUT SESSION (Simulation)
app.post("/api/create-checkout-session", verifyUser, async (req, res) => {
    try {
        // Safely determine where to send the user back to
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
                        unit_amount: 9900, // ₹99.00
                        recurring: {
                            interval: 'month', // THIS MAKES IT A 1-MONTH PLAN
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

// F. UPGRADE TO PREMIUM (Triggered after successful Stripe return)
app.post("/api/upgrade-premium", verifyUser, (req, res) => {
    const user = getUserData(req.user.id, req.user.email);
    user.isPremium = true;
    res.json({ success: true });
});

// 8. Public Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "LIVE MODE - Supabase Auth Enabled" });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server secure and running on port ${PORT}`);
});