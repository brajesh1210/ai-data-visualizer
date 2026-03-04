# AuraBI - AI Data Visualizer

AuraBI is a sophisticated web application that transforms raw CSV data and Google Sheets into actionable visual insights. It leverages a modern tech stack to provide seamless data parsing, AI-driven analysis recommendations, and a premium "freemium" experience with Stripe integration.

## 🚀 Features

* **Smart Data Import**: Support for local CSV file uploads (via `multer`) and direct Google Sheets import.
* **AI Analysis Engine**: Automatically analyzes datasets to provide key insights, data health checks, and intelligent chart recommendations (Bar, Pie, and Line charts).
* **Interactive Dashboard**: Visualizes data using `recharts` with a high-end, responsive UI.
* **Secure Authentication**: User management and session handling powered by Supabase Auth (Google Sign-In).
* **Freemium Model**:
* **Free Tier**: Limited to 10 uploads.
* **Pro Tier**: Unlimited uploads and priority analysis, managed via Stripe Subscriptions.


* **Export Capabilities**: Generate visual reports using `html2canvas`.

## 🛠️ Tech Stack

### Frontend

* **Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS & Lucide Icons
* **Charts**: Recharts
* **State Management**: React Hooks & Context API (for Toasts and Auth)
* **API Client**: Axios

### Backend

* **Runtime**: Node.js with Express
* **Database/Auth**: Supabase
* **Payments**: Stripe API
* **File Handling**: Multer (Disk Storage)

## 📦 Installation & Setup

### Prerequisites

* Node.js (v18+)
* Supabase Account
* Stripe Account

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-data-visualizer

```

### 2. Backend Setup

```bash
cd backend
npm install

```

Create a `.env` file in the `backend` folder:

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key

```

Run the server: `node server.js`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

```

Create a `.env` file in the `frontend` folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001/api

```

Run the app: `npm run dev`

## 🛤️ API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/upload-csv` | POST | Upload and parse CSV files (Protected) |
| `/api/google-sheets` | POST | Import data from a public Google Sheet URL (Protected) |
| `/api/upload-status` | GET | Retrieve user's remaining upload count and premium status |
| `/api/create-checkout-session` | POST | Initiates Stripe Pro subscription |
| `/api/health` | GET | Public health check |

## 📄 License

This project is licensed under the **ISC License**.
