const express = require('express')
const router = express.Router()
const { protect, checkRole } = require('../middleware/authMiddleware')
const { createTask,
    getWorkspaceTasks,
    deleteTask,
    updateTask,
    getTaskById,
    taskArchived } = require('../controllers/taskController')


router.get('/:workspaceId', protect, getWorkspaceTasks)
router.get('/:workspaceId/:taskId', protect, getTaskById)

router.post('/:workspaceId', protect, checkRole(['admin', 'owner', 'member']), createTask)

router.delete('/:workspaceId/:taskId', deleteTask)

router.patch('/:workspaceId/:taskId', updateTask)
router.patch('/:workspaceId/:taskId/archive', protect, taskArchived)

module.exports = router