const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.find(u => u.username === username);
};

const authenticatedUser = (username, password) => {
  return users.find(u => u.username === username && u.password === password);
};

// LOGIN
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login" });
  }

  const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

  return res.status(200).json({ token });
});

// ADD REVIEW
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "fingerprint_customer");
  const username = decoded.username;

  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

// DELETE REVIEW
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "fingerprint_customer");
  const username = decoded.username;

  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
module.exports.isValid = isValid;