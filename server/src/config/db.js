const dotenv = require('dotenv')
const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected successfully: ${conn.connection.host}`)
    }
    catch(err){
        console.error(`Couldn't connect to MongoDB: ${err.message}`)
        process.exit(1)
    }
}

module.exports = connectDB