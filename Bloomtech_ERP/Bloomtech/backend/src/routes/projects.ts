import { Router } from 'express'
import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '../controllers/projectsController'
import { getItemsByProject, createItem, updateItem, deleteItem } from '../controllers/projectItemsController'

const router = Router()

router.get('/', getAllProjects)
router.post('/', createProject)
router.get('/:id', getProjectById)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// Project items
router.get('/:id/items', getItemsByProject)
router.post('/:id/items', createItem)
router.put('/:projectId/items/:requirements', updateItem)
router.delete('/:projectId/items/:requirements', deleteItem)

export default router


