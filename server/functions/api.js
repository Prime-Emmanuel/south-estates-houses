import serverless from 'serverless-http';
import app from '../src/index.js';

// Force Express by passing a custom binary handler
export const handler = async (event, context) => {
  const handler = serverless(app);
  return handler(event, context);
};
