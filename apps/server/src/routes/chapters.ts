import { Router } from 'express';
import { getChaptersByBookId, getChapterById, createChapter, updateChapter, deleteChapter } from '../controllers/chaptersController';

const router = Router();

router.get('/book/:bookId', getChaptersByBookId);
router.get('/:id', getChapterById);
router.post('/', createChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

export default router;
