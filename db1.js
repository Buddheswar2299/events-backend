const { error } = require('console')
const mongoose = require('mongoose')
require('dotenv').config()



mongoose.connect(process.env.MONGO_URI_ONE)

const db = mongoose.connection

db.once('open',()=>{
    console.log('successfully connected to db')
})

db.on('error',(error)=>{
    console.log(error)
})