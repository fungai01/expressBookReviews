const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general
const session = require('express-session')
const jwt = require('jsonwebtoken')
const express = require('express')

const app = express()
app.use(express.json())

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
)

app.use('/customer/auth/*', function auth(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '')
  if (!token) return res.status(401).send('Access Denied: No Token Provided!')

  try {
    const verified = jwt.verify(token, 'fingerprint_customer')
    req.user = verified
    next()
  } catch (err) {
    res.status(400).send('Invalid Token')
  }
})

app.use('/customer', customer_routes)
app.use('/', genl_routes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}/`)
)