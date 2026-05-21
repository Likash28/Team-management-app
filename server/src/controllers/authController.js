const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const passport = require('passport')

// generating jwt
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '5d',
    })
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const user = await User.create({ name, email, password })

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const loginUser = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user: user
            })
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    })(req, res, next)
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUsers }