const books = require('./booksdb.js')
const jwt = require('jsonwebtoken')
const express = require('express')

const regd_users = express.Router()

const users = []
const SECRET_KEY = 'fingerprint_customer'

const isValid = (username) => {
  return users.some((users) => users.username === username)
}

const authenticatedUser = (username, password) => {
  const user = users.find((users) => users.username === username)
  return user && user.password === password
}

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' })
  users.find((u) => u.username === username).token = token
  console.log(users)
  return res.status(200).json({ token })
})

regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const token = req.header('Authorization').replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    const user = users.find((user) => user.username === decoded.username)

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' })
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = []
    }

    const reviewsBooks = books[isbn].reviews
    const reviewUser = Object.keys(reviewsBooks).find(
      (r) => r.username === user
    )

    if (reviewUser) {
      return res.status(400).json({ message: 'Review already exists' })
    } else {
      books[isbn].reviews[user] = review
      return res.status(200).json({ message: 'Review added successfully' })
    }
  } catch (error) {
    res.status(400).send('Invalid token')
  }
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const token = req.headers.authorization.split(' ')[1]

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    const username = decoded.username

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' })
    }
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: 'No reviews found for this book' })
    }

    books[isbn].reviews = Object.keys(books[isbn].reviews).find(
      (r) => r.username !== username
    )
    return res.status(200).json({ message: 'Review deleted successfully' })
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
})

module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users