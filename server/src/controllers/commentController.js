const Comment = require('../models/commentModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { sendMentionEmail } = require('../utils/emailService');

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions } = req.body; 

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      content,
      mentions
    });

    if (mentions && mentions.length > 0) {
      const usersToNotify = await User.find({ _id: { $in: mentions } });
      
      usersToNotify.forEach(user => {
        if (user._id.toString() !== req.user._id.toString()) {
          sendMentionEmail(user.email, req.user.name, taskId, task.title);
        }
      });
    }

    const populatedComment = await comment.populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addComment, getTaskComments };