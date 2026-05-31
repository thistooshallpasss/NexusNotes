import { Router } from 'express';
import { getNotes, getNoteById, createNote, updateNote, togglePinNote, deleteNote, reorderNotes } from '../controllers/notesController';

const router = Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/reorder', reorderNotes);
router.put('/:id', updateNote);
router.patch('/:id/pin', togglePinNote);
router.delete('/:id', deleteNote);

export default router;
