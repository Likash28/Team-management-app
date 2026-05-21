const express = require('express');
const router = express.Router();
const { addComment, getTaskComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware'); 

router.get('/:taskId', protect, getTaskComments);

router.post('/:taskId', protect, addComment);

module.exports = router;