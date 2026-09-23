import re
import time
import datetime
from datetime import timezone
import dateutil.parser
import feedparser
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import trafilatura

from config import MONGO_URI, DB_NAME, NEWS_SOURCES

# Request headers to mimic modern browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
}

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def clean_html_tags(text):
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', ' ', text)
    # Strip excess whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def parse_date(date_str, struct_time=None):
    """
    Normalizes varied date formats into a standard timezone-aware UTC datetime.
    Handles RFC 822, ISO 8601, and struct_time.
    """
    if struct_time:
        try:
            return datetime.datetime(*struct_time[:6], tzinfo=timezone.utc)
        except Exception:
            pass

    if not date_str:
        return datetime.datetime.now(timezone.utc)

    try:
        dt = dateutil.parser.parse(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt
    except Exception:
        return datetime.datetime.now(timezone.utc)

def fetch_full_article_content(url):
    """
    Fetches the actual web page and extracts full readable article body using trafilatura
    with BeautifulSoup fallback. Handles paywalls, 403, timeouts gracefully.
    """
    if not url or not url.startswith("http"):
        return ""
    
    try:
        # First attempt: trafilatura (fast, clean boilerplate removal)
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
            if extracted and len(extracted.strip()) > 100:
                return extracted.strip()
    except Exception:
        pass

    try:
        # Fallback: requests + BeautifulSoup
        resp = requests.get(url, headers=HEADERS, timeout=8)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.content, "html.parser")
            # Remove scripts, styles, nav, footer
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()
            
            # Common article containers
            paragraphs = soup.find_all("p")
            text_blocks = [p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 30]
            if text_blocks:
                return "\n\n".join(text_blocks)
    except Exception:
        pass

    return ""

def scrape_dainik_jagran_web():
    """
    Scrapes live national news articles from Dainik Jagran's web portal.
    Normalizes them to the same article structure.
    """
    articles = []
    urls_to_try = [
        ("https://www.jagran.com/news/national-news-hindi.html", "hi"),
        ("https://english.jagran.com/top-news", "en")
    ]

    for target_url, lang in urls_to_try:
        try:
            resp = requests.get(target_url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                continue
            
            soup = BeautifulSoup(resp.content, "html.parser")
            cards = soup.find_all(["article", "li", "div"], class_=re.compile(r'(news|article|story|card)', re.I))
            
            for card in cards:
                link_tag = card.find("a", href=True)
                if not link_tag:
                    continue
                
                href = link_tag["href"]
                if not href.startswith("http"):
                    href = "https://www.jagran.com" + href
                
                title = link_tag.get_text().strip()
                if not title or len(title) < 15:
                    h_tag = card.find(["h2", "h3", "h4", "h1"])
                    if h_tag:
                        title = h_tag.get_text().strip()
                
                if not title or len(title) < 15:
                    continue

                # Avoid duplicate links in this batch
                if any(a["url"] == href for a in articles):
                    continue

                summary_tag = card.find(["p", "div"], class_=re.compile(r'(desc|summary|text)', re.I))
                summary = summary_tag.get_text().strip() if summary_tag else title

                img_tag = card.find("img")
                img_url = ""
                if img_tag:
                    img_url = img_tag.get("src") or img_tag.get("data-src") or ""

                articles.append({
                    "url": href,
                    "title": title,
                    "summary": clean_html_tags(summary),
                    "source": "Dainik Jagran",
                    "sourceSlug": "dainik-jagran",
                    "sourceLogo": "/logos/dainik-jagran.svg",
                    "publishedAt": datetime.datetime.now(timezone.utc),
                    "imageUrl": img_url,
                    "author": "Jagran Bureau"
                })

                if len(articles) >= 20:
                    break
        except Exception as e:
            print(f"[Scraper] Warning fetching Jagran web {target_url}: {e}")

    return articles

def fetch_rss_feed(source_config):
    """
    Fetches and normalizes articles from a standard RSS feed source.
    """
    articles = []
    source_name = source_config["name"]
    source_slug = source_config["slug"]
    source_logo = source_config["logo"]

    for feed_url in source_config.get("feeds", []):
        try:
            print(f"[Ingest] Fetching {source_name} feed: {feed_url}")
            feed = feedparser.parse(feed_url, request_headers=HEADERS)

            for entry in feed.entries:
                url = entry.get("link") or entry.get("id") or ""
                if not url:
                    continue

                title = entry.get("title", "").strip()
                if not title:
                    continue

                # Feed format inconsistencies: description vs content:encoded vs summary
                summary = ""
                if "summary" in entry:
                    summary = entry.summary
                elif "description" in entry:
                    summary = entry.description
                elif "content" in entry and len(entry.content) > 0:
                    summary = entry.content[0].get("value", "")

                summary = clean_html_tags(summary)

                # Author
                author = entry.get("author") or entry.get("dc_creator") or source_name

                # Published date parsing
                pub_date_str = entry.get("published") or entry.get("updated") or entry.get("pubDate")
                pub_parsed = entry.get("published_parsed") or entry.get("updated_parsed")
                published_at = parse_date(pub_date_str, pub_parsed)

                # Media/Image extraction
                image_url = ""
                if "media_content" in entry and len(entry.media_content) > 0:
                    image_url = entry.media_content[0].get("url", "")
                elif "media_thumbnail" in entry and len(entry.media_thumbnail) > 0:
                    image_url = entry.media_thumbnail[0].get("url", "")
                elif "enclosures" in entry and len(entry.enclosures) > 0:
                    image_url = entry.enclosures[0].get("href", "")

                articles.append({
                    "url": url,
                    "title": title,
                    "summary": summary,
                    "source": source_name,
                    "sourceSlug": source_slug,
                    "sourceLogo": source_logo,
                    "publishedAt": published_at,
                    "author": author,
                    "imageUrl": image_url
                })

        except Exception as e:
            print(f"[Ingest] Error parsing feed {feed_url} for {source_name}: {e}")

    return articles

def run_ingestion(log_callback=None):
    """
    Main ingestion execution:
    1. Collects articles from all configured outlets (The Hindu, Times of India, Dainik Jagran).
    2. Deduplicates against MongoDB.
    3. Fetches full content for new articles.
    4. Saves to MongoDB.
    """
    db = get_db()
    articles_col = db["articles"]

    total_found = 0
    total_new = 0

    if log_callback:
        log_callback(f"Starting ingestion across {len(NEWS_SOURCES)} outlets...")

    for source in NEWS_SOURCES:
        source_name = source["name"]
        if log_callback:
            log_callback(f"Connecting to feed for: {source_name}")

        raw_articles = []
        if source["type"] == "rss":
            raw_articles = fetch_rss_feed(source)
        elif source["type"] == "jagran":
            raw_articles = scrape_dainik_jagran_web()
            # If web scrape returned fewer than 5 items, supplement from fallback RSS
            if len(raw_articles) < 5 and "fallback_rss" in source:
                print(f"[Ingest] Supplementing {source_name} via fallback wire...")
                fallback_items = fetch_rss_feed({
                    "name": source_name,
                    "slug": source["slug"],
                    "logo": source["logo"],
                    "feeds": [source["fallback_rss"]]
                })
                raw_articles.extend(fallback_items)

        total_found += len(raw_articles)
        new_source_articles = 0

        for art in raw_articles:
            # Deduplication check: unique URL
            existing = articles_col.find_one({"url": art["url"]})
            if existing:
                continue

            # Fetch full article text
            full_text = fetch_full_article_content(art["url"])
            art["content"] = full_text if full_text else art["summary"]
            art["createdAt"] = datetime.datetime.now(timezone.utc)
            art["clusterId"] = None

            try:
                articles_col.insert_one(art)
                new_source_articles += 1
                total_new += 1
            except Exception as e:
                # Handle race conditions / unique index collisions
                pass

        if log_callback:
            log_callback(f"{source_name}: Found {len(raw_articles)} items ({new_source_articles} new).")

    summary_msg = f"Ingestion complete: {total_found} scanned, {total_new} newly indexed articles."
    if log_callback:
        log_callback(summary_msg)

    return {
        "articlesFound": total_found,
        "articlesNew": total_new
    }

if __name__ == "__main__":
    result = run_ingestion(print)
    print("Result:", result)
