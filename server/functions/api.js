import serverlessExpress from '@vendia/serverless-express';
import app from '../src/index.js';

let serverlessExpressInstance;

function handler(event, context) {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverlessExpress({ app });
  }
  return serverlessExpressInstance(event, context);
}

export { handler };
