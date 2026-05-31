import { Router } from 'express';
import { getTags, createTag, assignTagToPage, removeTagFromPage, updateTag, deleteTag } from '../controllers/tagsController';

const router = Router();

router.get('/', getTags);
router.post('/', createTag);
router.post('/assign', assignTagToPage);
router.delete('/remove', removeTagFromPage);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;
