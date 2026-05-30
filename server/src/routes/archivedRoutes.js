const express = require('express')
const router = express.Router()
const { getArchiveBin, getGlobalArchiveBin } = require('../controllers/archiveController')
const { protect } = require('../middleware/authMiddleware')

router.get('/:workspaceId', protect, getArchiveBin)
router.get('/', protect, getGlobalArchiveBin)

module.exports = router