const mongoose = require('mongoose')

const memberModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['owner', 'admin', 'member'],
        default: 'member'
    },
    status: {
        type: String,
        enum: ['active', 'pending'],
        default: 'active'
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model('Members', memberModel)