const mongoose = require('mongoose')

const archiveSchema = new mongoose.Schema({
    itemType: {
        type: String,
        required: true,
        enum: ['workspace', 'task']
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',      
        required: false
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: false
    },
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    archivedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Archives', archiveSchema)