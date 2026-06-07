import { Router } from 'express';
import { getPagesByChapterId, getPageById, createPage, createPagesBulk, updatePage, deletePage, updatePageBlocks, getPages } from '../controllers/pagesController';

const router = Router();

router.get('/', getPages);
router.get('/chapter/:chapterId', getPagesByChapterId);
router.get('/:id', getPageById);
router.post('/bulk', createPagesBulk);
router.post('/', createPage);
router.put('/:id', updatePage);
router.put('/:id/blocks', updatePageBlocks);
router.delete('/:id', deletePage);

export default router;
