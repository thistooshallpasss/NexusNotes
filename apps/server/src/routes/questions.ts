import { Router } from 'express';
import { getQuestionsByBookId, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionsController';

const router = Router();

router.get('/book/:bookId', getQuestionsByBookId);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
