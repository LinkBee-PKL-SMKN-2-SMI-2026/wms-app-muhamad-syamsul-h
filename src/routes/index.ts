import { Router } from 'express';
import auth from './auth.route';
import category from './category.route';
import location from './location.route';
import product from './product.route';
import activityLog from './activity-log.route';
import movement from './stock-movement.route';

const router = Router();

router.use('/auth', auth);
router.use('/categories', category);
router.use('/locations', location);
router.use('/products', product);
router.use('/activity-logs', activityLog);
router.use('/movements', movement);

export default router;
