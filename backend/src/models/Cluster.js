const mongoose = require('mongoose');

const ClusterSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    leadingHeadline: {
      type: String,
      default: '',
    },
    keywords: [
      {
        type: String,
      },
    ],
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
    articleCount: {
      type: Number,
      default: 0,
      index: true,
    },
    earliestTime: {
      type: Date,
      required: true,
      index: true,
    },
    latestTime: {
      type: Date,
      required: true,
      index: true,
    },
    durationHours: {
      type: Number,
      default: 0,
    },
    intensity: {
      type: Number,
      default: 1, // Normalized metric (1 to 10) based on article count and source diversity
    },
    sources: [
      {
        type: String,
      },
    ],
    sourceLogos: [
      {
        type: String,
      },
    ],
    isCrossSource: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ClusterSchema.index({ latestTime: -1, articleCount: -1 });

module.exports = mongoose.model('Cluster', ClusterSchema);
