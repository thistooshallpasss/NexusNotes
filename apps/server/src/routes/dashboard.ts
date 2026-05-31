import { Router } from 'express';
import { getStats } from '../controllers/searchController';

const router = Router();

router.get('/stats', getStats);

export default router;
