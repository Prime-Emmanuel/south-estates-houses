import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import propertiesRouter from './routes/properties.js';
import authRouter from './routes/auth.js';
import testRouter from './routes/test.js';   // keep if you have it, otherwise delete

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
if (typeof testRouter !== 'undefined') {
  app.use('/api/test', testRouter);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'South Estates & Houses API is running' });
});

app.use((err, req, res, next) => {
  if (err.message && (err.message.includes('Only') || err.message.includes('File too large'))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;

// Start the server only when run directly (local development)
if (process.env.NODE_ENV !== 'production' || process.env.IS_LOCAL === 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
