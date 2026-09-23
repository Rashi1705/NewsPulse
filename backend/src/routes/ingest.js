const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const IngestJob = require('../models/IngestJob');

const router = express.Router();

/**
 * POST /ingest/trigger
 * Triggers Python pipeline (scrape + group) as a subprocess; returns a job ID
 */
router.post('/trigger', async (req, res) => {
  try {
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const pythonCmd = process.env.PYTHON_CMD || 'py';
    const scraperScript = path.resolve(__dirname, '../../../scraper/pipeline.py');
    const scraperCwd = path.resolve(__dirname, '../../../scraper');

    const job = new IngestJob({
      jobId,
      status: 'running',
      triggerType: req.body?.triggerType || 'manual',
      startedAt: new Date(),
      logs: [
        {
          timestamp: new Date(),
          message: `Pipeline triggered. Spawning Python subprocess: ${pythonCmd} ${scraperScript}`,
        },
      ],
    });

    await job.save();

    // Spawn Python subprocess asynchronously
    const pythonProcess = spawn(pythonCmd, [scraperScript, '--job-id', jobId], {
      cwd: scraperCwd,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
      windowsHide: true,
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';

    pythonProcess.stdout.on('data', async (chunk) => {
      const text = chunk.toString();
      stdoutBuffer += text;
      console.log(`[Python Scraper stdout]: ${text.trim()}`);

      // Parse JSON progress logs if emitted
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const data = JSON.parse(trimmed);
            if (data.type === 'progress' || data.type === 'summary') {
              await IngestJob.findOneAndUpdate(
                { jobId },
                {
                  $set: {
                    ...(data.articlesFound !== undefined && { articlesFound: data.articlesFound }),
                    ...(data.articlesNew !== undefined && { articlesNew: data.articlesNew }),
                    ...(data.clustersCount !== undefined && { clustersCount: data.clustersCount }),
                  },
                  $push: {
                    logs: {
                      timestamp: new Date(),
                      message: data.message || `Processed: ${data.articlesNew || 0} new articles`,
                    },
                  },
                }
              );
            }
          } catch (e) {
            // Not a JSON log
          }
        } else if (trimmed.length > 0) {
          await IngestJob.findOneAndUpdate(
            { jobId },
            {
              $push: {
                logs: {
                  timestamp: new Date(),
                  message: trimmed.substring(0, 300),
                },
              },
            }
          );
        }
      }
    });

    pythonProcess.stderr.on('data', async (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;
      console.error(`[Python Scraper stderr]: ${text.trim()}`);
    });

    pythonProcess.on('close', async (exitCode) => {
      const completedAt = new Date();
      const currentJob = await IngestJob.findOne({ jobId });
      const durationSeconds = currentJob?.startedAt
        ? Math.round((completedAt.getTime() - currentJob.startedAt.getTime()) / 1000)
        : 0;

      if (exitCode === 0) {
        await IngestJob.findOneAndUpdate(
          { jobId },
          {
            $set: {
              status: 'completed',
              completedAt,
              durationSeconds,
            },
            $push: {
              logs: {
                timestamp: new Date(),
                message: `Pipeline completed successfully in ${durationSeconds}s (Exit code: 0)`,
              },
            },
          }
        );
      } else {
        await IngestJob.findOneAndUpdate(
          { jobId },
          {
            $set: {
              status: 'failed',
              completedAt,
              durationSeconds,
              error: stderrBuffer.slice(-1000) || `Process exited with code ${exitCode}`,
            },
            $push: {
              logs: {
                timestamp: new Date(),
                message: `Pipeline failed with exit code ${exitCode}`,
              },
            },
          }
        );
      }
    });

    // Return 202 Accepted immediately
    return res.status(202).json({
      success: true,
      jobId,
      status: 'running',
      message: 'Ingestion pipeline started',
    });
  } catch (error) {
    console.error('Error in POST /ingest/trigger:', error);
    return res.status(500).json({ success: false, error: 'Failed to trigger ingestion pipeline' });
  }
});

/**
 * GET /ingest/status/:jobId
 * Lets the frontend poll job status
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await IngestJob.findOne({ jobId }).lean();

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.json({
      success: true,
      data: {
        jobId: job.jobId,
        status: job.status,
        triggerType: job.triggerType,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        durationSeconds: job.durationSeconds,
        articlesFound: job.articlesFound || 0,
        articlesNew: job.articlesNew || 0,
        clustersCount: job.clustersCount || 0,
        logs: (job.logs || []).slice(-20), // return last 20 log entries
        error: job.error,
      },
    });
  } catch (error) {
    console.error('Error in GET /ingest/status/:jobId:', error);
    return res.status(500).json({ success: false, error: 'Server error retrieving job status' });
  }
});

/**
 * GET /ingest/jobs
 * List recent ingestion runs
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await IngestJob.find()
      .sort({ startedAt: -1 })
      .limit(10)
      .lean();

    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve jobs' });
  }
});

module.exports = router;
