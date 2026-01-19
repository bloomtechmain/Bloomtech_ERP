import { Router } from 'express'
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  shareTodo,
  unshareTodo
} from '../controllers/todosController'

const router = Router()

router.get('/', getTodos)
router.post('/', createTodo)
router.put('/:id', updateTodo)
router.delete('/:id', deleteTodo)
router.post('/:id/share', shareTodo)
router.delete('/:id/share/:shareId', unshareTodo)

export default router
