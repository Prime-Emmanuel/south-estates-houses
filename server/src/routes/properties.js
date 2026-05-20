import { Router } from 'express';

const router = Router();

// Minimal test route
router.get('/', (req, res) => {
  res.json({ success: true, message: 'properties route works' });
});

export default router;
