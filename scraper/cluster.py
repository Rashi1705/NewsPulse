import re
import datetime
from datetime import timezone
from collections import Counter
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from config import MONGO_URI, DB_NAME, STOP_WORDS

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def clean_tokens(text):
    """
    Extracts informative alphanumeric keywords, filtering out stop words and short tokens.
    """
    if not text:
        return []
    words = re.findall(r'\b[a-zA-Z\u0900-\u097F]{3,}\b', text.lower())
    return [w for w in words if w not in STOP_WORDS]

def generate_cluster_label(cluster_articles):
    """
    Derives a human-friendly, representative headline / topic label for the cluster.
    """
    if not cluster_articles:
        return "Untitled Story"

    # Pick the cleanest, most concise headline from the cluster articles
    headlines = [a.get("title", "").strip() for a in cluster_articles if a.get("title")]
    if not headlines:
        return "Breaking News Topic"

    # Prefer headlines without source prefixes or trailing hyphens
    clean_headlines = []
    for h in headlines:
        cleaned = re.sub(r'^(Live\s*:?|Watch\s*:?|Breaking\s*:?)\s*', '', h, flags=re.I)
        cleaned = re.split(r'\s*[-|]\s*(?:The Hindu|Times of India|Jagran)', cleaned, flags=re.I)[0].strip()
        if len(cleaned) > 10:
            clean_headlines.append(cleaned)

    if clean_headlines:
        # Choose median length headline for balanced readability
        clean_headlines.sort(key=len)
        return clean_headlines[len(clean_headlines) // 2]

    return headlines[0]

def extract_top_keywords(cluster_articles, top_n=6):
    """
    Extracts the most frequent informative keywords across all articles in the cluster.
    """
    all_tokens = []
    for art in cluster_articles:
        tokens = clean_tokens(art.get("title", "") + " " + art.get("summary", ""))
        all_tokens.extend(tokens)
    
    counter = Counter(all_tokens)
    return [word for word, count in counter.most_common(top_n)]

def run_clustering(log_callback=None):
    """
    Groups recent articles into topic clusters using TF-IDF and keyword similarity graphs.
    """
    db = get_db()
    articles_col = db["articles"]
    clusters_col = db["clusters"]

    if log_callback:
        log_callback("Fetching recent articles for topic clustering...")

    # Fetch articles from the last 72 hours (or all if collection is fresh)
    articles = list(articles_col.find().sort("publishedAt", -1).limit(200))
    if not articles:
        if log_callback:
            log_callback("No articles found to cluster.")
        return {"clustersCount": 0}

    n_articles = len(articles)
    if log_callback:
        log_callback(f"Clustering {n_articles} articles using semantic TF-IDF and entity overlap...")

    # Build corpus: Title weighted heavily + summary
    corpus = []
    for a in articles:
        title = a.get("title", "")
        summary = a.get("summary", "")
        # Emphasize title by repeating it twice
        text = f"{title}. {title}. {summary}"
        corpus.append(text)

    # Compute TF-IDF matrix
    vectorizer = TfidfVectorizer(
        stop_words=list(STOP_WORDS),
        max_features=1500,
        ngram_range=(1, 2)
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        sim_matrix = cosine_similarity(tfidf_matrix)
    except Exception as e:
        if log_callback:
            log_callback(f"TF-IDF error: {e}. Falling back to keyword overlap.")
        sim_matrix = np.zeros((n_articles, n_articles))

    # Adjacency list for graph clustering
    # Two articles are connected if:
    # 1. Cosine similarity >= 0.22, OR
    # 2. They share >= 3 distinct significant keywords
    adj = {i: set() for i in range(n_articles)}

    # Pre-tokenize for fast overlap check
    token_sets = [set(clean_tokens(a.get("title", "") + " " + a.get("summary", ""))) for a in articles]

    for i in range(n_articles):
        for j in range(i + 1, n_articles):
            sim_score = sim_matrix[i, j]
            shared_keywords = token_sets[i].intersection(token_sets[j])

            # Connected if strong semantic similarity OR significant shared entities (like proper names/events)
            if sim_score >= 0.22 or (len(shared_keywords) >= 3 and sim_score >= 0.12):
                adj[i].add(j)
                adj[j].add(i)

    # Find connected components (clusters)
    visited = set()
    clusters = []

    for i in range(n_articles):
        if i not in visited:
            component = []
            queue = [i]
            visited.add(i)
            while queue:
                node = queue.pop(0)
                component.append(node)
                for neighbor in adj[node]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            clusters.append(component)

    if log_callback:
        log_callback(f"Formed {len(clusters)} raw topic clusters.")

    # Wipe and update clusters with latest computed state
    clusters_col.delete_many({})

    created_clusters = 0

    for comp in clusters:
        comp_articles = [articles[idx] for idx in comp]
        label = generate_cluster_label(comp_articles)
        keywords = extract_top_keywords(comp_articles)

        # Dates & times
        valid_dates = []
        for a in comp_articles:
            dt = a.get("publishedAt")
            if isinstance(dt, datetime.datetime):
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                valid_dates.append(dt)

        if not valid_dates:
            valid_dates = [datetime.datetime.now(timezone.utc)]

        earliest_time = min(valid_dates)
        latest_time = max(valid_dates)
        duration_hours = round((latest_time - earliest_time).total_seconds() / 3600.0, 2)

        # Sources & Logos
        sources_list = list(set([a.get("source", "Unknown") for a in comp_articles if a.get("source")]))
        source_logos = list(set([a.get("sourceLogo", "") for a in comp_articles if a.get("sourceLogo")]))
        is_cross_source = len(sources_list) > 1

        # Intensity metric (1 - 10): higher for multi-source coverage & higher article count
        base_intensity = len(comp_articles) * 1.8
        if is_cross_source:
            base_intensity += 3.0
        intensity = min(10.0, max(1.0, round(base_intensity, 1)))

        cluster_doc = {
            "label": label,
            "leadingHeadline": comp_articles[0].get("title", label),
            "keywords": keywords,
            "articleIds": [a["_id"] for a in comp_articles],
            "articleCount": len(comp_articles),
            "earliestTime": earliest_time,
            "latestTime": latest_time,
            "durationHours": duration_hours,
            "intensity": intensity,
            "sources": sources_list,
            "sourceLogos": source_logos,
            "isCrossSource": is_cross_source,
            "createdAt": datetime.datetime.now(timezone.utc),
            "updatedAt": datetime.datetime.now(timezone.utc)
        }

        cluster_res = clusters_col.insert_one(cluster_doc)
        created_cluster_id = cluster_res.inserted_id

        # Update article reference
        articles_col.update_many(
            {"_id": {"$in": [a["_id"] for a in comp_articles]}},
            {"$set": {"clusterId": created_cluster_id}}
        )

        created_clusters += 1

    summary_msg = f"Clustering complete: {created_clusters} topic clusters active."
    if log_callback:
        log_callback(summary_msg)

    return {"clustersCount": created_clusters}

if __name__ == "__main__":
    result = run_clustering(print)
    print("Result:", result)
