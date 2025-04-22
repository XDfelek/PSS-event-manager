const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");

// Create the application
const app = express();

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database: "event_system",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);
app.use(flash());

// Make user data available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Import DAOs
const eventDao = require("./dao/eventDao")(db);
const userDao = require("./dao/userDao")(db);

// Import Services
const eventService = require("./services/eventService")(eventDao);
const authService = require("./services/authService")(userDao);

// Import Routes
const eventRoutes = require("./routes/eventRoutes")(eventService);
const authRoutes = require("./routes/authRoutes")(authService);

// Use Routes
app.use("/events", eventRoutes);
app.use("/auth", authRoutes);

// Redirect root to events page
app.get("/", (req, res) => {
  res.redirect("/events");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
