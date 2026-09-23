const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    sourceSlug: {
      type: String,
      required: true,
      index: true,
    },
    sourceLogo: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    author: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    clusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster',
      index: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.index({ publishedAt: -1, sourceSlug: 1 });

module.exports = mongoose.model('Article', ArticleSchema);
