const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// session
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// AUTH middleware
app.use("/customer/auth/*", function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, "fingerprint_customer");
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});