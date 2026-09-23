const mongoose = require('mongoose');

const IngestJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    triggerType: {
      type: String,
      default: 'manual',
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    articlesFound: {
      type: Number,
      default: 0,
    },
    articlesNew: {
      type: Number,
      default: 0,
    },
    clustersCount: {
      type: Number,
      default: 0,
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IngestJob', IngestJobSchema);
