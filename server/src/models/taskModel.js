const mongoose = require('mongoose')
const Counter = require('./counterModel')

const taskSchema = new mongoose.Schema({
	numericId: {
		type: Number,
		unique: true
	},

	title: {
		type: String,
		required: [true, 'Task title is required'],
		trim: true
	},

	description: {
		type: String
	},

	priority: {
		type: String,
		enum: ['low', 'medium', 'high'],
		default: 'low'
	},

	dueDate: {
		type: Date
	},

	primaryAssignee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	secondaryAssignee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	devStatus: {
		type: String,
		enum: ['Not Started', 'In Progress', 'Checked In', 'Done'],
		default: 'Not Started'
	},
	unitTestStatus: {
		type: String,
		enum: ['Not Started', 'In Progress', 'Pass', 'Fail'],
		default: 'Not Started'
	},
	sitStatus: {
		type: String,
		enum: ['Not Started', 'In Progress', 'Pass', 'Fail'],
		default: 'Not Started'
	},
	uatStatus: {
		type: String,
		enum: ['Not Started', 'In Progress', 'Pass', 'Fail'],
		default: 'Not Started'
	},

	workspace: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Workspace',
		required: true
	},

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}

}, { timestamps: true })

taskSchema.index({ workspace: 1 })

taskSchema.pre('save', async function (next) {
	if (!this.isNew) return next()

	try {
		const counter = await Counter.findOneAndUpdate(
			{ id: 'taskId' },
			{ $inc: { seq: 1 } },
			{
				returnDocument: 'after',  // new = true
				upsert: true,
				setDefaultsOnInsert: true
			}
		)

		if (counter) {
			this.numericId = counter.seq
		}
		
	} catch (error) {
		throw error
	}
})

module.exports = mongoose.model('Task', taskSchema)