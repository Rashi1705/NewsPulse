import sys
import json
import argparse
import datetime

from ingest import run_ingestion
from cluster import run_clustering

def emit_progress(msg, **kwargs):
    payload = {
        "type": "progress",
        "timestamp": datetime.datetime.now().isoformat(),
        "message": msg,
        **kwargs
    }
    print(json.dumps(payload), flush=True)

def main():
    parser = argparse.ArgumentParser(description="News Pulse Ingestion & Clustering Pipeline")
    parser.add_argument("--job-id", type=str, default="cli_run", help="Unique identifier for the job")
    args = parser.parse_args()

    emit_progress(f"Starting pipeline execution for job: {args.job_id}")

    try:
        # Step 1: Ingestion
        emit_progress("Phase 1: Ingesting live RSS feeds and extracting content...")
        ingest_result = run_ingestion(log_callback=lambda m: emit_progress(m))
        articles_found = ingest_result.get("articlesFound", 0)
        articles_new = ingest_result.get("articlesNew", 0)

        # Step 2: Clustering
        emit_progress("Phase 2: Semantic topic grouping and timeline computation...")
        cluster_result = run_clustering(log_callback=lambda m: emit_progress(m))
        clusters_count = cluster_result.get("clustersCount", 0)

        # Step 3: Summary
        summary = {
            "type": "summary",
            "jobId": args.job_id,
            "status": "completed",
            "articlesFound": articles_found,
            "articlesNew": articles_new,
            "clustersCount": clusters_count,
            "message": f"Successfully indexed {articles_new} new articles across {clusters_count} topic clusters."
        }
        print(json.dumps(summary), flush=True)
        sys.exit(0)

    except Exception as e:
        error_payload = {
            "type": "error",
            "jobId": args.job_id,
            "status": "failed",
            "error": str(e),
            "message": f"Pipeline failed: {str(e)}"
        }
        print(json.dumps(error_payload), flush=True)
        sys.stderr.write(f"Pipeline Exception: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
