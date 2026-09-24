# 📰 NewsPulse

> **INDEPENDENT. ACCURATE. FAST.**

NewsPulse is a full-stack news aggregation platform that collects live news from **The Hindu, The Times of India, and Dainik Jagran**, groups related coverage into common story topics, and presents the results through a clean, chronological timeline.

The main goal is simple: **reduce repetitive news and make it easier to see how different publishers are covering the same event.**

---

## ✨ Key Features

* **Multi-source RSS ingestion** from The Hindu, Times of India, and Dainik Jagran.
* **Automatic article cleaning and deduplication** before processing.
* **Topic clustering** using TF-IDF, Cosine Similarity, and Graph Connected Components.
* **Cross-source story grouping** so related articles appear as one topic.
* **Chronological news timeline** with category and source filtering.
* **Live search** across headlines, sources, and topics.
* **Cluster drawer** showing all publishers covering a particular story.
* **Breaking news ticker** with recent headlines.
* **On-demand ingestion** with live scraper status.
* Responsive React-based newsroom interface.

---

# 💡 Additional Improvements

Along with the core news aggregation and clustering functionality, I implemented additional frontend features to make NewsPulse more complete, interactive, and user-friendly.

### 1. Interactive Landing Page

I designed and implemented a dedicated **interactive landing page** that introduces NewsPulse before users enter the newsroom.

The landing page explains:

* What NewsPulse is
* How the platform works
* How RSS feeds and article clustering are used
* The publishers covered by the platform
* Key features and benefits of the platform

It also includes interactive UI elements, animations, live-style news previews, and clear navigation to create a modern newsroom experience.

### 2. User Authentication

I added a complete authentication interface with:

* **Sign Up**
* **Login / Sign In**
* **Guest Access**

This provides users with a clear entry point into the NewsPulse platform instead of directly opening the news dashboard.

### 3. Improved User Experience

I integrated the landing page, authentication flow, and newsroom dashboard into a unified experience so that the application feels like a complete product rather than only a backend news-processing system.

---

# 🏗️ System Architecture

```text
RSS Feeds
   │
   ▼
Python Scraper
   │
   ├── Parse & Clean
   ├── Normalize
   └── Deduplicate
   │
   ▼
Hybrid Clustering Engine
   │
   ├── TF-IDF
   ├── Cosine Similarity
   ├── Entity/Token Overlap
   └── Graph Connected Components
   │
   ▼
MongoDB
   │
   ▼
Node.js + Express API
   │
   ▼
React + Vite Frontend
   │
   ├── Landing Page
   ├── Authentication
   └── Newsroom Dashboard
```

---

# 🛠️ Technology Stack

| Layer             | Technologies                                          |
| ----------------- | ----------------------------------------------------- |
| **Frontend**      | React 18, Vite, Tailwind CSS, Lucide React, date-fns  |
| **Backend**       | Node.js, Express.js, Mongoose, CORS, Morgan, dotenv   |
| **Scraper**       | Python, feedparser, request         |
| **Clustering**    | TF-IDF, Cosine Similarity, Graph Connected Components |
| **Database**      | MongoDB                                               |
| **Communication** | REST APIs, JSON                                       |

---

# 📰 RSS News Ingestion

NewsPulse uses **RSS feeds** provided by news publishers.

An RSS feed is a structured stream containing information about recently published articles, such as:

* Article title
* URL
* Publication time
* Description/excerpt
* Images and other metadata when available

The Python ingestion pipeline reads these feeds, cleans the data, standardizes timestamps, extracts useful metadata, and stores the articles in MongoDB.

### Sources

* The Hindu
* The Times of India
* Dainik Jagran

---

# 🧠 Which Approach Was Used & Why?

NewsPulse uses a **Hybrid TF-IDF + Cosine Similarity approach with Graph-based Connected Components**, supported by a filtered entity/token-overlap check.

The objective is to identify when different publishers are reporting about the **same underlying event**, even when their headlines use different wording.

## Why TF-IDF instead of simple keyword overlap?

### 1. IDF weighting

Simple keyword matching treats every word equally.

News articles frequently contain generic words such as:

> government, court, police, minister, today

These words occur across many unrelated stories and can result in false matches.

**TF-IDF reduces the importance of common words and gives more weight to distinctive terms**, such as names, locations, organizations, unique events, and figures.

### 2. Headline weighting

The headline usually contains the most important information about the event.

Therefore, NewsPulse gives the **headline 2× the weight of the description** during text processing.

### 3. Bigram support

The vectorizer uses:

```text
ngram_range = (1, 2)
```

This allows the system to consider both individual words and two-word combinations such as:

```text
Supreme Court
Reserve Bank
electoral bonds
New Delhi
```

### 4. Deterministic and lightweight

The approach does not require an external AI API or paid language model.

It is:

* Fast
* Deterministic
* Reproducible
* Cost-effective
* Suitable for continuous RSS processing

---

# 🔗 How Article Clustering Works

Consider these three articles:

```text
The Hindu:
"Supreme Court strikes down..."

Times of India:
"Apex court quashes..."

Dainik Jagran:
"Supreme Court rejects..."
```

Although the wording differs, they may contain several important terms referring to the same event.

NewsPulse calculates their similarity and creates connections between sufficiently similar articles.

```text
                 Story Cluster
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    The Hindu        TOI        Dainik Jagran
     Article        Article        Article
```

The frontend can then display them as **one topic with multiple publisher perspectives**.

---

# 🎯 How Were the Thresholds Chosen?

## Cosine Similarity Threshold — `0.22`

RSS content is usually short—often just a headline and a one- or two-sentence description.

Because different publishers use different wording, articles covering the same event may not produce extremely high similarity scores.

| Threshold  | Observed behavior                                              |
| ---------- | -------------------------------------------------------------- |
| **> 0.30** | Too strict; can miss related articles with different wording   |
| **< 0.18** | Too loose; increases unrelated clusters                        |
| **0.22**   | Practical balance for the short RSS articles used by NewsPulse |

Therefore, the primary clustering edge is created when:

```text
Cosine Similarity ≥ 0.22
```

---

## 🔑 Keyword/Entity Overlap Fallback

Some breaking-news headlines are extremely short.

For these cases, similarity alone may not be sufficient.

NewsPulse uses a fallback condition:

```text
At least 3 significant shared tokens
+
Cosine Similarity ≥ 0.12
```

Common stopwords and generic news vocabulary are filtered out first.

This helps catch stories where publishers use different wording but still share several important event-specific terms.

---

# 🕸️ Why Graph Connected Components?

The number of news stories changes continuously, so the system does **not require a predefined number of clusters**.

For example, K-Means would require choosing a value such as:

```text
K = 20
```

But there may be 15 stories at one point and 50 stories later.

NewsPulse instead builds a graph:

```text
Article = Node
Similarity above threshold = Edge
```

For example:

```text
Article A ─── Article B
    │
    └──────── Article C

Article D ─── Article E

Article F
```

The connected components become the final clusters:

```text
Cluster 1 → A, B, C
Cluster 2 → D, E
Cluster 3 → F
```

This allows the number of clusters to be determined **dynamically from the incoming news**.

---

# 📊 Clustering Parameters

| Parameter             | Value                              | Purpose                                         |
| --------------------- | ---------------------------------- | ----------------------------------------------- |
| **Vectorizer**        | TF-IDF                             | Reduces the influence of common news vocabulary |
| **N-grams**           | Unigrams + Bigrams                 | Captures important multi-word phrases           |
| **Headline Weight**   | `2×`                               | Gives greater importance to the core event      |
| **Similarity Metric** | Cosine Similarity                  | Measures similarity between article vectors     |
| **Main Threshold**    | `≥ 0.22`                           | Connects sufficiently similar articles          |
| **Fallback Overlap**  | `≥ 3` tokens + `≥ 0.12` similarity | Handles short/breaking headlines                |
| **Cluster Formation** | Graph Connected Components         | Dynamically determines the number of topics     |

---

# 📂 Project Structure

```text
assignment/
│
├── README.md
│
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── server.js
│
├── scraper/
│   ├── config.py
│   ├── ingest.py
│   ├── cluster.py
│   └── pipeline.py
│
└── frontend/
    ├── public/
    │   └── logos/
    └── src/
        ├── components/
        │   ├── LandingPage.jsx
        │   ├── Header.jsx
        │   ├── TopSections.jsx
        │   ├── SourceFilter.jsx
        │   ├── TimelineView.jsx
        │   ├── ClusterDrawer.jsx
        │   └── AuthModal.jsx
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

# 📡 REST API

| Method | Endpoint                | Purpose                  |
| ------ | ----------------------- | ------------------------ |
| `GET`  | `/`                     | API information          |
| `GET`  | `/health`               | Server health check      |
| `GET`  | `/clusters`             | Fetch story clusters     |
| `GET`  | `/clusters/:id`         | Fetch cluster details    |
| `GET`  | `/timeline`             | Fetch timeline data      |
| `POST` | `/ingest/trigger`       | Start an ingestion job   |
| `GET`  | `/ingest/status/:jobId` | Check ingestion progress |

---

# 🚀 Running Locally

## Prerequisites

* Node.js 18+
* Python 3.10+
* MongoDB
* Python packages: `feedparser`, `pymongo`, `scikit-learn`, `requests`, `beautifulsoup4`

## 1. Start MongoDB

Make sure MongoDB is running locally:

```text
mongodb://127.0.0.1:27017/newspulse
```

## 2. Run the scraper

```bash
cd assignment/scraper

pip install feedparser pymongo scikit-learn requests beautifulsoup4

python pipeline.py
```

## 3. Start the backend

```bash
cd assignment/backend

npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

## 4. Start the frontend

```bash
cd assignment/frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔄 End-to-End Flow

```text
Publisher RSS Feeds
        ↓
Python RSS Parser
        ↓
Clean & Normalize Articles
        ↓
Remove Duplicates
        ↓
TF-IDF + Bigrams
        ↓
Cosine Similarity
        ↓
Token/Entity Fallback
        ↓
Similarity Graph
        ↓
Connected Components
        ↓
MongoDB
        ↓
Express REST API
        ↓
React NewsPulse
        ↓
Landing Page / Login / Signup / Newsroom
```

---

## 🎯 Project Goal

NewsPulse is designed to make news consumption **less repetitive and easier to understand** by bringing multiple publishers together and organizing their coverage around actual story topics.

Instead of simply showing a list of articles, the platform focuses on:

**What stories are being reported, and how are different publishers covering them?**
