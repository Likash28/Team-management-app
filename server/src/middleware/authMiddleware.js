const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // attach user to the request
            req.user = await User.findById(decoded.id).select('-password')
            return next()
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' })
    }
}

const Member = require('../models/memberModel')

const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const workspaceId = req.params.workspaceId || req.headers['workspace-id']

            if (!workspaceId) {
                return res.status(400).json({ message: 'Workspace ID is required' })
            }

            const membership = await Member.findOne({
                user: req.user._id,
                workspace: workspaceId
            })

            if (!membership || !roles.includes(membership.role)) {
                return res.status(403).json({ 
                    message: `Access denied. Requires one of these roles: ${roles.join(', ')}` 
                })
            }

            next()
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

module.exports = { protect, checkRole }