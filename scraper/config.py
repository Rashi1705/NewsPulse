import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/newspulse")
DB_NAME = "newspulse"

NEWS_SOURCES = [
    {
        "name": "The Hindu",
        "slug": "the-hindu",
        "logo": "/logos/the-hindu.png",
        "color": "#1E3A8A",
        "feeds": [
            "https://www.thehindu.com/news/national/feeder/default.rss",
            "https://www.thehindu.com/feeder/default.rss"
        ],
        "type": "rss"
    },
    {
        "name": "Times of India",
        "slug": "times-of-india",
        "logo": "/logos/times-of-india.png",
        "color": "#DC2626",
        "feeds": [
            "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
            "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms"
        ],
        "type": "rss"
    },
    {
        "name": "Dainik Jagran",
        "slug": "dainik-jagran",
        "logo": "/logos/dainik-jagran.png",
        "color": "#D97706",
        "feeds": [
            "https://www.jagran.com/news/national-news-hindi.html",
            "https://english.jagran.com/top-news"
        ],
        "fallback_rss": "https://indianexpress.com/feed/",
        "type": "jagran"
    }
]

STOP_WORDS = set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", 
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", 
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", 
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", 
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", 
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", 
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", 
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", 
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", 
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", 
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", 
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", 
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", 
    "yours", "yourself", "yourselves", "news", "today", "live", "updates", "said", "says", "new",
    "will", "also", "one", "two", "first", "last", "per", "cent", "crore", "lakh", "year", "years",
    "hai", "hain", "ke", "ki", "ko", "ka", "se", "par", "me", "mein", "aur", "bhi", "tha", "thi", "the"
])
