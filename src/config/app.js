
const express = require('express')

const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const helmet = require('helmet')
const compression = require('compression')

const app = express()

const user = require('../api/routes/user.route')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('combined'))
app.use(cors())
app.use(methodOverride())
app.use(helmet())
app.use(compression())

app.use('/api/users', user)

module.exports = app
