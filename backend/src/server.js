const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

const clustersRouter = require('./routes/clusters');
const timelineRouter = require('./routes/timeline');
const ingestRouter = require('./routes/ingest');

app.use('/clusters', clustersRouter);
app.use('/timeline', timelineRouter);
app.use('/ingest', ingestRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'NewsPulse API',
    version: '1.0.0',
    description: 'REST API serving news clusters, articles, and timeline feeds',
    endpoints: {
      clusters: '/clusters',
      clusterDetail: '/clusters/:id',
      timeline: '/timeline',
      triggerIngest: 'POST /ingest/trigger',
      ingestStatus: 'GET /ingest/status/:jobId',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`[NewsPulse Backend] Server running on http://localhost:${PORT}`);
});
