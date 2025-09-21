import { Router } from 'express';
import zalopayRoutes from './zalopay.routes';

const router = Router();

router.use('/api/zalopay', zalopayRoutes);

export default router;
