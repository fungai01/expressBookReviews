const axios = require('axios');
const express = require('express');
const books = require("./booksdb.js");

const public_users = express.Router();

// REGISTER
public_users.post("/register", (req, res) => {
  const users = require("./auth_users.js").users;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing data" });
  }

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: "User exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// GET ALL BOOKS
public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});

// AXIOS VERSION
public_users.get("/async/books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.json(book);
  return res.status(404).json({ message: "Book not found" });
});

// AUTHOR
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  const result = Object.keys(books)
    .filter(i => books[i].author.toLowerCase().includes(author))
    .map(i => books[i]);

  if (result.length > 0) return res.json(result);
  return res.status(404).json({ message: "No books found" });
});

// TITLE
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();

  const result = Object.keys(books)
    .filter(i => books[i].title.toLowerCase().includes(title))
    .map(i => books[i]);

  if (result.length > 0) return res.json(result);
  return res.status(404).json({ message: "No books found" });
});

// REVIEW
public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.json(book.reviews);
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;