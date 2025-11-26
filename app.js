const express = require('express')
const dotenv = require('dotenv')
const app = express()

dotenv.config()
app.use(express.json())

const routes = require('./src/routes')

app.use('/api', routes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})

