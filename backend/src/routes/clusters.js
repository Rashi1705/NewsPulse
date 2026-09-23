const express = require('express');
const mongoose = require('mongoose');
const Cluster = require('../models/Cluster');
const Article = require('../models/Article');

const router = express.Router();

/**
 * GET /clusters
 * List of topic clusters — label, article count, time range (earliest -> latest article)
 */
router.get('/', async (req, res) => {
  try {
    const { source, limit = 50, sort = 'latest' } = req.query;

    const query = {};
    if (source && source !== 'all') {
      // Find clusters containing articles from this source
      query.sources = { $regex: new RegExp(source, 'i') };
    }

    let sortOption = { latestTime: -1 };
    if (sort === 'articles') sortOption = { articleCount: -1 };
    if (sort === 'intensity') sortOption = { intensity: -1 };

    const clusters = await Cluster.find(query)
      .sort(sortOption)
      .limit(parseInt(limit, 10))
      .lean();

    const formatted = clusters.map((c) => ({
      id: c._id,
      label: c.label,
      leadingHeadline: c.leadingHeadline,
      keywords: c.keywords || [],
      articleCount: c.articleCount || (c.articleIds ? c.articleIds.length : 0),
      earliestTime: c.earliestTime,
      latestTime: c.latestTime,
      durationHours: c.durationHours,
      intensity: c.intensity || 1,
      sources: c.sources || [],
      sourceLogos: c.sourceLogos || [],
      isCrossSource: c.isCrossSource || false,
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error in GET /clusters:', error);
    return res.status(500).json({ success: false, error: 'Server error retrieving clusters' });
  }
});

/**
 * GET /clusters/:id
 * Full cluster detail with all articles, sorted chronologically
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid cluster ID format' });
    }

    const cluster = await Cluster.findById(id).lean();
    if (!cluster) {
      return res.status(404).json({ success: false, error: 'Cluster not found' });
    }

    // Fetch full articles belonging to this cluster, sorted chronologically
    const articles = await Article.find({
      $or: [
        { clusterId: cluster._id },
        { _id: { $in: cluster.articleIds || [] } },
      ],
    })
      .sort({ publishedAt: 1 })
      .lean();

    return res.json({
      success: true,
      data: {
        id: cluster._id,
        label: cluster.label,
        leadingHeadline: cluster.leadingHeadline,
        keywords: cluster.keywords || [],
        articleCount: articles.length,
        earliestTime: cluster.earliestTime,
        latestTime: cluster.latestTime,
        durationHours: cluster.durationHours,
        intensity: cluster.intensity || 1,
        sources: cluster.sources || [],
        sourceLogos: cluster.sourceLogos || [],
        isCrossSource: cluster.isCrossSource || false,
        articles: articles.map((a) => ({
          id: a._id,
          title: a.title,
          summary: a.summary,
          content: a.content || a.summary,
          source: a.source,
          sourceSlug: a.sourceSlug,
          sourceLogo: a.sourceLogo,
          publishedAt: a.publishedAt,
          author: a.author,
          url: a.url,
          imageUrl: a.imageUrl,
        })),
      },
    });
  } catch (error) {
    console.error('Error in GET /clusters/:id:', error);
    return res.status(500).json({ success: false, error: 'Server error retrieving cluster details' });
  }
});

module.exports = router;
