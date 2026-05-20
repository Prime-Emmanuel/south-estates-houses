import serverless from 'serverless-http';
import app from '../src/index.js';

export const handler = serverless(app, {
  framework: 'express',   // force Express
  provider: 'aws'         // Netlify uses AWS‑style events
});
