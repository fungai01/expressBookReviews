const books = require('./booksdb.js');
const jwt = require('jsonwebtoken');
const express = require('express');

const regd_users = express.Router();

const users = [];
const SECRET_KEY = 'fingerprint_customer';

const isValid = (username) => {
  return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  return user && user.password === password;
};

// LOGIN
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  return res.status(200).json({
    message: 'Login successful',
    token
  });
});

// ✅ ADD / UPDATE REVIEW
regd_users.put('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: 'Review added/updated successfully',
      reviews: books[isbn].reviews
    });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// ✅ DELETE REVIEW
regd_users.delete('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: 'Review not found' });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.isValid = isValid;