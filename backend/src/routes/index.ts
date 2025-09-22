import { Router } from 'express';
import zalopayRoutes from './zalopay.routes';
import vnpayRoutes from './vnpay.routes';

const router = Router();

router.use('/api/zalopay', zalopayRoutes);
router.use('/api/vnpay', vnpayRoutes);

export default router;
