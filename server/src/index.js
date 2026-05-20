import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import propertiesRouter from './routes/properties.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);

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

// Export the Express app for serverless
export default app;

// Run the server directly only in local development
if (process.env.NODE_ENV !== 'production' || process.env.IS_LOCAL === 'true') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
