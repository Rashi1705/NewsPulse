const express = require('express');
const Cluster = require('../models/Cluster');
const Article = require('../models/Article');

const router = express.Router();

/**
 * GET /timeline
 * Clusters formatted for plotting: label, start/end time, article count, a size/intensity metric
 */
router.get('/', async (req, res) => {
  try {
    const { source, limit = 40 } = req.query;

    const query = {};
    if (source && source !== 'all') {
      query.sources = { $regex: new RegExp(source, 'i') };
    }

    // Only include clusters that have valid timestamps
    query.earliestTime = { $ne: null };
    query.latestTime = { $ne: null };

    const clusters = await Cluster.find(query)
      .sort({ latestTime: -1 })
      .limit(parseInt(limit, 10))
      .populate({
        path: 'articleIds',
        select: 'title source sourceSlug sourceLogo publishedAt url',
        options: { limit: 5 },
      })
      .lean();

    // Map into rich timeline items optimized for timeline visualizations and charting
    const timelineItems = clusters.map((cluster) => {
      const startTime = new Date(cluster.earliestTime);
      const endTime = new Date(cluster.latestTime);

      // If cluster only has one article or same timestamp, give it a visual min-span of 30 mins
      let adjustedEndTime = endTime;
      if (endTime.getTime() - startTime.getTime() < 30 * 60 * 1000) {
        adjustedEndTime = new Date(startTime.getTime() + 30 * 60 * 1000);
      }

      return {
        id: cluster._id.toString(),
        label: cluster.label,
        leadingHeadline: cluster.leadingHeadline || cluster.label,
        keywords: cluster.keywords || [],
        startTime: startTime.toISOString(),
        endTime: adjustedEndTime.toISOString(),
        startTimestamp: startTime.getTime(),
        endTimestamp: adjustedEndTime.getTime(),
        durationMinutes: Math.round((adjustedEndTime.getTime() - startTime.getTime()) / (60 * 1000)),
        articleCount: cluster.articleCount || (cluster.articleIds ? cluster.articleIds.length : 0),
        intensity: cluster.intensity || Math.min(10, Math.max(1, (cluster.articleCount || 1) * 2)),
        sources: cluster.sources || [],
        sourceLogos: cluster.sourceLogos || [],
        isCrossSource: cluster.isCrossSource || (cluster.sources && cluster.sources.length > 1),
        sampleArticles: (cluster.articleIds || []).map((art) => ({
          title: art.title,
          source: art.source,
          sourceSlug: art.sourceSlug,
          sourceLogo: art.sourceLogo,
          publishedAt: art.publishedAt,
          url: art.url,
        })),
      };
    });

    // Compute global timeline bounds for frontend viewport
    let globalStart = null;
    let globalEnd = null;
    if (timelineItems.length > 0) {
      const allStartTimes = timelineItems.map((item) => item.startTimestamp);
      const allEndTimes = timelineItems.map((item) => item.endTimestamp);
      globalStart = new Date(Math.min(...allStartTimes)).toISOString();
      globalEnd = new Date(Math.max(...allEndTimes)).toISOString();
    }

    return res.json({
      success: true,
      meta: {
        totalClusters: timelineItems.length,
        timeSpan: {
          start: globalStart,
          end: globalEnd,
        },
      },
      data: timelineItems,
    });
  } catch (error) {
    console.error('Error in GET /timeline:', error);
    return res.status(500).json({ success: false, error: 'Server error generating timeline data' });
  }
});

module.exports = router;
