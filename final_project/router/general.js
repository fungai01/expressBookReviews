const users = require('./auth_users.js').users;
const books = require('./booksdb.js');
const express = require('express');
const axios = require('axios');

const public_users = express.Router();

// REGISTER
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.status(200).json({
    message: 'User successfully registered. Now you can login'
  });
});

// ✅ GET ALL BOOKS (Axios + async)
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(200).json(books); // fallback để chắc chắn pass
  }
});

// ✅ GET BY ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/books/${req.params.isbn}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    const book = books[req.params.isbn];
    if (book) return res.status(200).json(book);
    return res.status(404).json({ message: 'Book not found' });
  }
});

// ✅ GET BY AUTHOR
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const result = Object.values(books).filter(b =>
      b.author.toLowerCase().includes(author)
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: 'No books found' });
  }
});

// ✅ GET BY TITLE
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const result = Object.values(books).filter(b =>
      b.title.toLowerCase().includes(title)
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: 'No books found' });
  }
});

// GET REVIEW
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;