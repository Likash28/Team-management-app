const mongoose = require('mongoose')

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide workspace name'],
        unique: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    wasRestored: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("Workspace", workspaceSchema)