import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, getBooksTree } from '../controllers/booksController';

const router = Router();

router.get('/', getBooks);
router.get('/tree', getBooksTree);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;
