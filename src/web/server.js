import express from 'express';

export const createServer = ({ webhookPath, webhookHandler }) => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
  app.post(webhookPath, webhookHandler);

  return app;
};
