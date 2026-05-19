import { Router } from 'express';
import multer from 'multer';
import { scanImage } from '../controllers/scanController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Accept up to 10 images at once
router.post('/', upload.array('images', 10), scanImage);

export default router;
