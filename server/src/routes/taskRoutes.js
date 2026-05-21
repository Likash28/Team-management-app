const express = require('express')
const router = express.Router()
const { createTask, getWorkspaceTasks, deleteTask, updateTask, getTaskById } = require('../controllers/taskController')
const { protect, checkRole } = require('../middleware/authMiddleware')

router.get('/:workspaceId', protect, getWorkspaceTasks)
router.get('/:workspaceId/:taskId', protect ,getTaskById)

router.post('/:workspaceId', protect, checkRole(['admin', 'owner', 'member']), createTask)

router.delete('/:workspaceId/:taskId', deleteTask)

router.patch('/:workspaceId/:taskId', updateTask)

module.exports = router