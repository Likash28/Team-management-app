const http = require('http')
const express = require('express')
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')
const authRoutes = require('./src/routes/authRoutes')
const workspaceRoutes = require('./src/routes/workspaceRoutes')
const taskRoutes = require('./src/routes/taskRoutes')
const commentRoutes = require('./src/routes/commentRoutes')
require('./src/config/passport')
const connectDB = require('./src/config/db')


const app = express()

app.set('json spaces', 2)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const cors = require('cors');

const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)

app.use('/api/workspaces', workspaceRoutes)

app.use('/api/tasks', taskRoutes)

app.use('/api/comments', commentRoutes)

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try{
        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        }) 
    }
    catch (err){
        console.error("Failed to connect to DB. Server not started", err)
        process.exit(1)
    }
}

startServer()