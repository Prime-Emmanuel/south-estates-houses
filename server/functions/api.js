import serverless from 'serverless-http';
import app from '../src/index.js';

// Force Express framework detection
export const handler = serverless(app, {
  framework: 'express',
  binary: true,
  provider: 'aws'
});
