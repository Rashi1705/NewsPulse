# 📰 NewsPulse — Real-Time News Aggregation & Timeline Platform
> **Tagline:** `INDEPENDENT. ACCURATE. FAST.`

NewsPulse is a full-stack real-time news intelligence and aggregation platform that continuously ingests live RSS news feeds from India's premier publications (**The Hindu**, **The Times of India**, and **Dainik Jagran**), groups related articles into unified story topics using text similarity algorithms, and delivers a sleek, human-centric timeline web interface.

---

## 🌟 Key Features

- **Multi-Source RSS Ingestion:** Ingests live news feeds from **The Hindu**, **Times of India**, and **Dainik Jagran** with their official logos.
- **Automated Topic Clustering:** Uses TF-IDF vectorization and cosine similarity to detect multi-outlet coverage and group related articles under a single representative topic.
- **Dual-View Platform:**
  - **Public Landing Page:** Editorial showcase with live preview mockups, value propositions, and publisher coverage network.
  - **Live Newsroom Portal:** High-contrast dark dashboard with interactive timeline, topic drawer, and source filtering.
- **Live Breaking News Ticker:** Cycles through active top headlines in real time with publisher badges.
- **Top Sections:** Categorized story sections (*National*, *Politics*, *Business & Economy*, *World Affairs*, *Featured*) with live story counts.
- **Interactive Cluster Drawer:** Slides out on story click to view every publisher's angle, summary, publish timestamp, and direct verified external article links.
- **1-Click Guest Access & Auth:** Quick sign-in modal with instant guest journalist access.
- **Seamless Refresh:** On-demand background sync with live feedback on the refresh button.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, date-fns |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, CORS, Morgan, dotenv |
| **Scraper & Engine** | Python 3.10+, `feedparser`, `pymongo`, `scikit-learn`, `requests`, `beautifulsoup4` |
| **Database** | MongoDB (local instance on `mongodb://127.0.0.1:27017/newspulse`) |

---

## 📂 Project Directory Structure

```
assignment/
├── README.md                           # Main setup and project documentation
├── DESC.md                             # Architectural overview and system specifications
│
├── backend/                            # Express.js REST API server
│   ├── src/
│   │   ├── config/db.js                # MongoDB connection handler
│   │   ├── controllers/                # Cluster and article controllers
│   │   ├── models/                     # Article & Cluster Mongoose models
│   │   ├── routes/                     # API routes (/clusters, /timeline, /ingest)
│   │   └── server.js                   # Application entry point (Port 5000)
│   ├── package.json
│   └── .env                            # Environment variables (PORT, MONGO_URI)
│
├── scraper/                            # Python RSS extraction & clustering
│   ├── config.py                       # RSS feed sources, categories & stop words
│   ├── ingest.py                       # RSS parser, cleaner & database synchronizer
│   ├── cluster.py                      # TF-IDF similarity clustering algorithm
│   └── pipeline.py                     # Unified scraper execution pipeline
│
└── frontend/                           # React + Vite application
    ├── public/
    │   └── logos/                      # Official PNG logos (Hindu, TOI, Jagran)
    ├── site_logo/                      # Original brand assets
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage.jsx         # Public landing page with showcase mockups
    │   │   ├── Header.jsx              # Navbar with Live Breaking Ticker & auth profile
    │   │   ├── TopSections.jsx         # Top categories grid with live story counters
    │   │   ├── SourceFilter.jsx        # Publisher filter pills with logos & search
    │   │   ├── TimelineView.jsx        # Chronological timeline view with hour markers
    │   │   ├── ClusterDrawer.jsx       # Deep-dive drawer for grouped articles & links
    │   │   └── AuthModal.jsx           # Sign in, registration & guest access dialog
    │   ├── App.jsx                     # Root application state & portal routing
    │   ├── index.css                   # Global dark theme styles & typography
    │   └── main.jsx                    # React DOM root
    ├── index.html
    └── package.json
```

---

## 🚀 Step-by-Step Setup & Running Guide

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **Python** (v3.10 or higher) — [Download Python](https://www.python.org/)
- **MongoDB Community Server** (running locally) — [Download MongoDB](https://www.mongodb.com/try/download/community)

---

### Step 1: Start MongoDB
Ensure your local MongoDB daemon is active.
```bash
# Windows (if running as a service, it starts automatically)
net start MongoDB

# Or start manually via terminal:
mongod --dbpath "C:\data\db"
```

---

### Step 2: Install Scraper Dependencies & Run Ingestion
Open a terminal and navigate to the `scraper` folder:
```bash
cd assignment/scraper

# Install required Python packages:
pip install feedparser pymongo scikit-learn requests beautifulsoup4

# Run the ingestion pipeline:
python pipeline.py
```
> *This will fetch the latest RSS feeds from The Hindu, Times of India, and Dainik Jagran, cluster related stories, and populate MongoDB.*

---

### Step 3: Start the Backend REST API Server
Open a second terminal and navigate to the `backend` folder:
```bash
cd assignment/backend

# Install dependencies:
npm install

# Start the server in development mode:
npm run dev
```
> *Backend server will run at **`http://localhost:5000`**.*

---

### Step 4: Start the Frontend React Application
Open a third terminal and navigate to the `frontend` folder:
```bash
cd assignment/frontend

# Install dependencies:
npm install

# Start the Vite development server:
npm run dev
```
> *Frontend dashboard will run at **`http://localhost:3000`**.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API info and available routes |
| `GET` | `/health` | Server health check and uptime |
| `GET` | `/clusters` | Fetch grouped story clusters (supports `source`, `limit`, `page`) |
| `GET` | `/clusters/:id` | Fetch full cluster details with all grouped articles |
| `GET` | `/timeline` | Fetch formatted timeline items for the dashboard |
| `POST` | `/ingest/trigger` | Trigger Python scraper run in the background |
| `GET` | `/ingest/status/:jobId` | Check the progress of an ingestion job |

---

## 📝 License
This project is built for assignment and demonstration purposes.
