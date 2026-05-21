const Task = require('../models/taskModel')

const createTask = async (req, res) => {
    try {
        // Updated to use primaryAssignee and secondaryAssignee from req.body
        const { title, description, priority, dueDate, primaryAssignee, secondaryAssignee } = req.body
        const { workspaceId } = req.params

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            primaryAssignee, 
            secondaryAssignee, 
            workspace: workspaceId,
            createdBy: req.user._id
        })

        res.status(201).json(task)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
            // Fix: Populate the actual field names from your Schema
            .populate('primaryAssignee', 'name email')
            .populate('secondaryAssignee', 'name email')
            .populate('createdBy', 'name')

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.status(200).json(task)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        
        const { 
            devStatus, 
            unitTestStatus, 
            sitStatus, 
            uatStatus, 
            priority, 
            primaryAssignee 
        } = req.query;

        let query = { workspace: workspaceId };

        if (devStatus) query.devStatus = devStatus;
        if (unitTestStatus) query.unitTestStatus = unitTestStatus;
        if (sitStatus) query.sitStatus = sitStatus;
        if (uatStatus) query.uatStatus = uatStatus;
        if (priority) query.priority = priority;
        if (primaryAssignee) query.primaryAssignee = primaryAssignee;

        const tasks = await Task.find(query)
            .populate('primaryAssignee', 'name email')
            .populate('secondaryAssignee', 'name email')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 }); 

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params
        const delTask = await Task.findByIdAndDelete(taskId)

        if (!delTask) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json({
            message: 'Task deleted',
            id: taskId
        })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params

        const task = await Task.findByIdAndUpdate(taskId, req.body, {
            new: true,
            runValidators: true
        })

        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        res.status(200).json(task)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { createTask, getWorkspaceTasks, deleteTask, updateTask, getTaskById }