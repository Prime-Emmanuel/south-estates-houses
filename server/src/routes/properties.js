import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/propertiesController.js';
import { upload } from '../middleware/upload.js';
import { handleValidation } from '../middleware/validate.js';
import { authenticateAdmin } from './auth.js';

const router = Router();

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('offerType').isIn(['Immeuble', 'Terrain', 'Villa', 'Maison', 'Appartement', 'Bureau']).withMessage('Invalid offer type'),
  body('pricePerM2').isFloat({ min: 0 }).withMessage('Price per m² must be a positive number'),
  body('surface').isFloat({ min: 0 }).withMessage('Surface must be a positive number'),
  body('commission').isFloat({ min: 0 }).withMessage('Commission must be a number'),
  body('region').notEmpty().withMessage('Region is required'),
  body('city').notEmpty().withMessage('City is required'),
  handleValidation,
];

router.post('/', upload.array('images', 7), createValidation, controller.create);
router.get('/', controller.getApproved);
router.get('/admin', authenticateAdmin, controller.getAll);
router.put('/:id', upload.array('images', 7), controller.update);
router.put('/:id/approve', controller.approve);
router.put('/:id/reject', controller.reject);
router.put('/:id/sold', authenticateAdmin, controller.markAsSold);

export default router;
